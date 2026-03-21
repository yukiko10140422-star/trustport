'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');
const net = require('net');
const os = require('os');
const fs = require('fs');
const path = require('path');

const execFileAsync = promisify(execFile);

// ============================================================
// Constants
// ============================================================

const SUPPORTED_TOOLS = new Set(['rdp', 'ssh', 'rustdesk', 'vnc', 'anydesk']);

const DEFAULT_PORTS = Object.freeze({
  rdp: 3389,
  ssh: 22,
  vnc: 5900,
  rustdesk: 21116,
  anydesk: 7070,
});

const DIAGNOSTIC_PORTS = Object.freeze([
  { port: 3389, service: 'RDP' },
  { port: 22, service: 'SSH' },
  { port: 5900, service: 'VNC' },
  { port: 21116, service: 'RustDesk' },
  { port: 7070, service: 'AnyDesk' },
]);

const DEFAULT_CONFIG = Object.freeze({ profiles: {} });

// ============================================================
// Helpers
// ============================================================

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const HOSTNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;

function validateHost(input) {
  if (typeof input !== 'string' || input.length === 0 || input.length > 255) {
    return false;
  }
  // If it looks like an IP (digits and dots only), enforce strict IPv4
  if (/^\d[\d.]*$/.test(input)) {
    const ipMatch = input.match(IPV4_RE);
    if (!ipMatch) return false;
    return ipMatch.slice(1).every((octet) => {
      const n = Number(octet);
      return n >= 0 && n <= 255;
    });
  }
  return HOSTNAME_RE.test(input);
}

function validatePort(input) {
  const n = Number(input);
  return Number.isInteger(n) && n >= 1 && n <= 65535;
}

function parseArpLine(line) {
  if (typeof line !== 'string') return null;
  const trimmed = line.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 3) return null;

  const [ip, mac, type] = parts;
  if (!IPV4_RE.test(ip)) return null;
  if (!/^[0-9a-fA-F]{2}([:-][0-9a-fA-F]{2}){5}$/.test(mac)) return null;

  return { ip, mac: mac.toLowerCase(), type: type.toLowerCase() };
}

// ============================================================
// Scanner
// ============================================================

async function scanArpTable() {
  try {
    const { stdout } = await execFileAsync('cmd.exe', ['/c', 'chcp 65001 >nul && arp -a'], {
      windowsHide: true,
      timeout: 10000,
    });
    return stdout
      .split('\n')
      .map(parseArpLine)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getLocalSubnets() {
  const interfaces = os.networkInterfaces();
  const results = [];
  for (const [iface, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        const parts = addr.address.split('.');
        const maskParts = addr.netmask.split('.');
        const prefix = parts
          .map((p, i) => String(Number(p) & Number(maskParts[i])))
          .join('.');
        results.push({
          address: addr.address,
          netmask: addr.netmask,
          prefix,
          iface,
        });
      }
    }
  }
  return results;
}

async function pingSweep(subnet, start = 1, end = 254, concurrency = 30) {
  if (!validateHost(subnet)) {
    throw new Error(`Invalid subnet: ${subnet}`);
  }

  const baseParts = subnet.split('.');
  if (baseParts.length !== 4) {
    throw new Error(`Invalid subnet format: ${subnet}`);
  }
  const base = baseParts.slice(0, 3).join('.');
  const results = [];
  const queue = [];

  for (let i = start; i <= end; i++) {
    queue.push(i);
  }

  const processChunk = async (batch) => {
    const promises = batch.map(async (i) => {
      const host = `${base}.${i}`;
      try {
        await execFileAsync('cmd.exe', ['/c', `ping -n 1 -w 500 ${host}`], {
          windowsHide: true,
          timeout: 3000,
        });
        return { ip: host, reachable: true };
      } catch {
        return { ip: host, reachable: false };
      }
    });
    return Promise.all(promises);
  };

  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);
    const batchResults = await processChunk(batch);
    for (const r of batchResults) {
      if (r.reachable) {
        results.push(r);
      }
    }
  }

  return results;
}

// ============================================================
// Detector
// ============================================================

const TOOL_DETECTION = Object.freeze({
  rdp: {
    commands: ['mstsc'],
    paths: [path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'mstsc.exe')],
  },
  ssh: {
    commands: ['ssh'],
    paths: [path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'OpenSSH', 'ssh.exe')],
  },
  rustdesk: {
    commands: ['rustdesk'],
    paths: [
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'RustDesk', 'rustdesk.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'RustDesk', 'rustdesk.exe'),
    ],
  },
  vnc: {
    commands: ['vncviewer'],
    paths: [
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'RealVNC', 'VNC Viewer', 'vncviewer.exe'),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'TigerVNC', 'vncviewer.exe'),
    ],
  },
  anydesk: {
    commands: ['anydesk'],
    paths: [
      path.join(process.env.ProgramFiles || 'C:\\Program Files (x86)', 'AnyDesk', 'AnyDesk.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'AnyDesk', 'AnyDesk.exe'),
    ],
  },
});

async function detectTools() {
  const results = [];
  for (const tool of SUPPORTED_TOOLS) {
    const detection = TOOL_DETECTION[tool];
    let available = false;
    let foundPath = null;

    // Check known paths first
    for (const p of detection.paths) {
      try {
        fs.accessSync(p, fs.constants.X_OK);
        available = true;
        foundPath = p;
        break;
      } catch {
        // not found at this path
      }
    }

    // Fallback: check via where command
    if (!available) {
      for (const cmd of detection.commands) {
        try {
          const { stdout } = await execFileAsync('cmd.exe', ['/c', `where ${cmd}`], {
            windowsHide: true,
            timeout: 5000,
          });
          const found = stdout.trim().split('\n')[0]?.trim();
          if (found) {
            available = true;
            foundPath = found;
            break;
          }
        } catch {
          // not found
        }
      }
    }

    results.push({ name: tool, available, path: foundPath });
  }
  return results;
}

// ============================================================
// Profiles
// ============================================================

function loadProfiles(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { ...DEFAULT_CONFIG, profiles: { ...DEFAULT_CONFIG.profiles } };
  }
}

function saveProfiles(filePath, config) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
}

function addProfile(config, profile) {
  const { id, ...rest } = profile;
  return {
    ...config,
    profiles: {
      ...config.profiles,
      [id]: rest,
    },
  };
}

function removeProfile(config, id) {
  const { [id]: _removed, ...remaining } = config.profiles;
  return {
    ...config,
    profiles: remaining,
  };
}

// ============================================================
// Launcher
// ============================================================

function buildLaunchCommand(toolName, params) {
  if (!SUPPORTED_TOOLS.has(toolName)) {
    throw new Error(`Unsupported tool: ${toolName}`);
  }
  if (!validateHost(params.host)) {
    throw new Error(`Invalid host: ${params.host}`);
  }

  switch (toolName) {
    case 'rdp': {
      const args = [`/v:${params.host}`];
      if (params.port && params.port !== 3389) {
        args[0] = `/v:${params.host}:${params.port}`;
      }
      return { program: 'mstsc', args };
    }
    case 'ssh': {
      const args = [];
      if (params.port) {
        args.push('-p', String(params.port));
      }
      args.push(params.user ? `${params.user}@${params.host}` : params.host);
      return { program: 'ssh', args };
    }
    case 'rustdesk': {
      return { program: 'rustdesk', args: ['--connect', params.host] };
    }
    case 'vnc': {
      const target = params.port ? `${params.host}:${params.port}` : params.host;
      return { program: 'vncviewer', args: [target] };
    }
    case 'anydesk': {
      return { program: 'anydesk', args: [params.host] };
    }
    default:
      throw new Error(`Unsupported tool: ${toolName}`);
  }
}

function launchSession(toolName, params) {
  const { program, args } = buildLaunchCommand(toolName, params);
  const { spawn } = require('child_process');
  const child = spawn(program, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
    shell: false,
  });
  child.unref();
  return { pid: child.pid, program, args };
}

// ============================================================
// Diagnostics
// ============================================================

function pingHost(host, count = 4) {
  if (!validateHost(host)) {
    return Promise.reject(new Error(`Invalid host: ${host}`));
  }
  return execFileAsync('cmd.exe', ['/c', `ping -n ${count} ${host}`], {
    windowsHide: true,
    timeout: 15000,
  }).then(({ stdout }) => {
    const lossMatch = stdout.match(/(\d+)%\s*(loss|損失)/);
    const avgMatch = stdout.match(/(?:Average|平均)\s*=\s*(\d+)ms/);
    return {
      host,
      reachable: lossMatch ? Number(lossMatch[1]) < 100 : false,
      packetLoss: lossMatch ? `${lossMatch[1]}%` : 'unknown',
      avgLatencyMs: avgMatch ? Number(avgMatch[1]) : null,
      raw: stdout,
    };
  }).catch(() => ({
    host,
    reachable: false,
    packetLoss: '100%',
    avgLatencyMs: null,
    raw: '',
  }));
}

function checkPort(host, port, timeout = 2000) {
  if (!validateHost(host)) {
    return Promise.reject(new Error(`Invalid host: ${host}`));
  }
  if (!validatePort(port)) {
    return Promise.reject(new Error(`Invalid port: ${port}`));
  }

  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      const latencyMs = Date.now() - start;
      socket.destroy();
      resolve({ open: true, latencyMs });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ open: false, latencyMs: timeout });
    });

    socket.on('error', () => {
      socket.destroy();
      resolve({ open: false, latencyMs: Date.now() - start });
    });

    socket.connect(Number(port), host);
  });
}

async function diagnoseHost(host) {
  if (!validateHost(host)) {
    throw new Error(`Invalid host: ${host}`);
  }

  const pingResult = await pingHost(host, 2);

  const portResults = await Promise.all(
    DIAGNOSTIC_PORTS.map(async ({ port, service }) => {
      const result = await checkPort(host, port, 1500);
      return { port, service, open: result.open, latencyMs: result.latencyMs };
    })
  );

  return {
    host,
    reachable: pingResult.reachable,
    avgLatencyMs: pingResult.avgLatencyMs,
    packetLoss: pingResult.packetLoss,
    ports: portResults,
  };
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  // Constants
  SUPPORTED_TOOLS,
  DEFAULT_PORTS,
  DIAGNOSTIC_PORTS,
  DEFAULT_CONFIG,
  // Helpers
  validateHost,
  validatePort,
  parseArpLine,
  // Scanner
  scanArpTable,
  getLocalSubnets,
  pingSweep,
  // Detector
  detectTools,
  // Profiles
  loadProfiles,
  saveProfiles,
  addProfile,
  removeProfile,
  // Launcher
  buildLaunchCommand,
  launchSession,
  // Diagnostics
  pingHost,
  checkPort,
  diagnoseHost,
};
