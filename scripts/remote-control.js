'use strict';

const path = require('path');
const {
  SUPPORTED_TOOLS,
  DEFAULT_PORTS,
  scanArpTable,
  getLocalSubnets,
  pingSweep,
  detectTools,
  loadProfiles,
  saveProfiles,
  addProfile,
  removeProfile,
  buildLaunchCommand,
  launchSession,
  diagnoseHost,
  validateHost,
  validatePort,
} = require('./lib/remote-control');

const CONFIG_PATH = path.join(__dirname, '..', 'configs', 'remote-control.json');

// ============================================================
// Output helpers
// ============================================================

function table(rows, headers) {
  if (rows.length === 0) {
    console.log('  (empty)');
    return;
  }
  const cols = headers || Object.keys(rows[0]);
  const widths = cols.map((c) =>
    Math.max(c.length, ...rows.map((r) => String(r[c] ?? '').length))
  );

  const sep = widths.map((w) => '-'.repeat(w + 2)).join('+');
  const header = cols.map((c, i) => ` ${c.padEnd(widths[i])} `).join('|');

  console.log(header);
  console.log(sep);
  for (const row of rows) {
    const line = cols.map((c, i) => ` ${String(row[c] ?? '').padEnd(widths[i])} `).join('|');
    console.log(line);
  }
}

function printError(msg) {
  console.error(`[ERROR] ${msg}`);
}

// ============================================================
// Commands
// ============================================================

async function cmdScan(args) {
  const doSweep = args.includes('--sweep');

  console.log('ARP table scan...');
  const arpDevices = await scanArpTable();

  if (arpDevices.length > 0) {
    console.log(`\nARP Table (${arpDevices.length} entries):`);
    table(arpDevices);
  } else {
    console.log('\nNo ARP entries found.');
  }

  if (doSweep) {
    const subnets = getLocalSubnets();
    for (const s of subnets) {
      console.log(`\nPing sweep: ${s.prefix}.1-254 (${s.iface})...`);
      const reachable = await pingSweep(s.prefix, 1, 254, 40);
      console.log(`  ${reachable.length} hosts reachable:`);
      for (const h of reachable) {
        console.log(`    ${h.ip}`);
      }
    }
  }
}

async function cmdTools() {
  console.log('Detecting installed remote tools...\n');
  const tools = await detectTools();
  table(
    tools.map((t) => ({
      tool: t.name,
      status: t.available ? 'available' : '-',
      port: DEFAULT_PORTS[t.name] || '-',
      path: t.path || '-',
    }))
  );
}

function cmdProfiles() {
  const config = loadProfiles(CONFIG_PATH);
  const entries = Object.entries(config.profiles);

  if (entries.length === 0) {
    console.log('No profiles configured.');
    console.log('  Use: node scripts/remote-control.js add <id> <host> [--tool <tool>]');
    return;
  }

  console.log(`Profiles (${entries.length}):\n`);
  table(
    entries.map(([id, p]) => ({
      id,
      host: p.host,
      tool: p.tool || '-',
      name: p.name || '-',
      note: p.note || '-',
    }))
  );
}

function cmdAdd(args) {
  const id = args[0];
  const host = args[1];

  if (!id || !host) {
    printError('Usage: add <id> <host> [--tool <tool>] [--name <name>] [--note <note>]');
    process.exitCode = 1;
    return;
  }

  if (!validateHost(host)) {
    printError(`Invalid host: ${host}`);
    process.exitCode = 1;
    return;
  }

  const toolIdx = args.indexOf('--tool');
  const tool = toolIdx !== -1 ? args[toolIdx + 1] : undefined;
  if (tool && !SUPPORTED_TOOLS.has(tool)) {
    printError(`Unsupported tool: ${tool}. Supported: ${[...SUPPORTED_TOOLS].join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const nameIdx = args.indexOf('--name');
  const name = nameIdx !== -1 ? args[nameIdx + 1] : undefined;

  const noteIdx = args.indexOf('--note');
  const note = noteIdx !== -1 ? args[noteIdx + 1] : undefined;

  const config = loadProfiles(CONFIG_PATH);
  const profile = { id, host };
  if (tool) profile.tool = tool;
  if (name) profile.name = name;
  if (note) profile.note = note;

  const updated = addProfile(config, profile);
  saveProfiles(CONFIG_PATH, updated);
  console.log(`Profile '${id}' added: ${host}${tool ? ` (${tool})` : ''}`);
}

function cmdRemove(args) {
  const id = args[0];
  if (!id) {
    printError('Usage: remove <id>');
    process.exitCode = 1;
    return;
  }

  const config = loadProfiles(CONFIG_PATH);
  if (!config.profiles[id]) {
    printError(`Profile '${id}' not found.`);
    process.exitCode = 1;
    return;
  }

  const updated = removeProfile(config, id);
  saveProfiles(CONFIG_PATH, updated);
  console.log(`Profile '${id}' removed.`);
}

async function cmdConnect(args) {
  const target = args[0];
  if (!target) {
    printError('Usage: connect <id|host> [--tool <tool>] [--user <user>]');
    process.exitCode = 1;
    return;
  }

  const toolIdx = args.indexOf('--tool');
  const userIdx = args.indexOf('--user');
  const explicitTool = toolIdx !== -1 ? args[toolIdx + 1] : undefined;
  const user = userIdx !== -1 ? args[userIdx + 1] : undefined;

  const config = loadProfiles(CONFIG_PATH);
  const profile = config.profiles[target];

  const host = profile ? profile.host : target;
  const tool = explicitTool || (profile && profile.tool) || 'ssh';

  if (!validateHost(host)) {
    printError(`Invalid host: ${host}`);
    process.exitCode = 1;
    return;
  }
  if (!SUPPORTED_TOOLS.has(tool)) {
    printError(`Unsupported tool: ${tool}. Supported: ${[...SUPPORTED_TOOLS].join(', ')}`);
    process.exitCode = 1;
    return;
  }

  try {
    const params = { host };
    if (user) params.user = user;

    const { program, args: cmdArgs } = buildLaunchCommand(tool, params);
    console.log(`Launching ${tool}: ${program} ${cmdArgs.join(' ')}`);

    launchSession(tool, params);
    console.log('Session launched.');
  } catch (err) {
    printError(err.message);
    process.exitCode = 1;
  }
}

async function cmdStatus(args) {
  const target = args[0];
  if (!target) {
    printError('Usage: status <id|host>');
    process.exitCode = 1;
    return;
  }

  const config = loadProfiles(CONFIG_PATH);
  const profile = config.profiles[target];
  const host = profile ? profile.host : target;

  if (!validateHost(host)) {
    printError(`Invalid host: ${host}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Diagnosing ${host}...\n`);
  const diag = await diagnoseHost(host);

  console.log(`Host:        ${diag.host}`);
  console.log(`Reachable:   ${diag.reachable ? 'Yes' : 'No'}`);
  console.log(`Latency:     ${diag.avgLatencyMs !== null ? `${diag.avgLatencyMs}ms` : 'N/A'}`);
  console.log(`Packet Loss: ${diag.packetLoss}`);
  console.log(`\nPort Scan:`);
  table(
    diag.ports.map((p) => ({
      port: p.port,
      service: p.service,
      status: p.open ? 'OPEN' : 'closed',
      latency: p.open ? `${p.latencyMs}ms` : '-',
    }))
  );
}

function cmdHelp() {
  console.log(`
LAN Remote Control CLI

Usage: node scripts/remote-control.js <command> [options]

Commands:
  scan [--sweep]             Scan LAN devices (ARP table + optional ping sweep)
  tools                      Detect installed remote tools
  profiles                   List saved connection profiles
  add <id> <host> [opts]     Add a connection profile
    --tool <tool>              Remote tool (rdp, ssh, rustdesk, vnc, anydesk)
    --name <name>              Display name
    --note <note>              Note
  remove <id>                Remove a connection profile
  connect <id|host> [opts]   Launch remote session
    --tool <tool>              Override tool
    --user <user>              SSH username
  status <id|host>           Connection diagnostics (ping + port scan)
  help                       Show this help

Supported tools: ${[...SUPPORTED_TOOLS].join(', ')}

Examples:
  node scripts/remote-control.js scan
  node scripts/remote-control.js scan --sweep
  node scripts/remote-control.js tools
  node scripts/remote-control.js add office 192.168.0.10 --tool rdp --name "Office PC"
  node scripts/remote-control.js connect office
  node scripts/remote-control.js connect 192.168.0.5 --tool ssh --user admin
  node scripts/remote-control.js status 192.168.0.1
`.trim());
}

// ============================================================
// Main
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const rest = args.slice(1);

  switch (command) {
    case 'scan':
      return cmdScan(rest);
    case 'tools':
      return cmdTools();
    case 'profiles':
      return cmdProfiles();
    case 'add':
      return cmdAdd(rest);
    case 'remove':
      return cmdRemove(rest);
    case 'connect':
      return cmdConnect(rest);
    case 'status':
      return cmdStatus(rest);
    case 'help':
    case '--help':
    case '-h':
      return cmdHelp();
    default:
      if (command) {
        printError(`Unknown command: ${command}`);
      }
      cmdHelp();
      process.exitCode = 1;
  }
}

main().catch((err) => {
  printError(err.message);
  process.exitCode = 1;
});
