const { describe, it, before, after, mock, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');

const libPath = path.join(__dirname, '..', 'lib', 'remote-control.js');

// ============================================================
// Phase 1: Validation + Helpers
// ============================================================

describe('validateHost', () => {
  const { validateHost } = require(libPath);

  it('accepts valid IPv4 addresses', () => {
    assert.equal(validateHost('192.168.0.1'), true);
    assert.equal(validateHost('10.0.0.1'), true);
    assert.equal(validateHost('255.255.255.255'), true);
    assert.equal(validateHost('0.0.0.0'), true);
  });

  it('accepts valid hostnames', () => {
    assert.equal(validateHost('my-pc'), true);
    assert.equal(validateHost('server01'), true);
    assert.equal(validateHost('host.local'), true);
    assert.equal(validateHost('my-pc.lan.home'), true);
  });

  it('rejects invalid inputs', () => {
    assert.equal(validateHost(''), false);
    assert.equal(validateHost('256.1.1.1'), false);
    assert.equal(validateHost('192.168.0'), false);
    assert.equal(validateHost('192.168.0.1.1'), false);
    assert.equal(validateHost('-bad'), false);
    assert.equal(validateHost('bad-'), false);
    assert.equal(validateHost('a'.repeat(256)), false);
    assert.equal(validateHost('host;rm -rf'), false);
    assert.equal(validateHost('host name'), false);
    assert.equal(validateHost(null), false);
    assert.equal(validateHost(undefined), false);
    assert.equal(validateHost(123), false);
  });
});

describe('validatePort', () => {
  const { validatePort } = require(libPath);

  it('accepts valid ports', () => {
    assert.equal(validatePort(1), true);
    assert.equal(validatePort(22), true);
    assert.equal(validatePort(3389), true);
    assert.equal(validatePort(65535), true);
  });

  it('accepts numeric strings', () => {
    assert.equal(validatePort('22'), true);
    assert.equal(validatePort('3389'), true);
  });

  it('rejects invalid ports', () => {
    assert.equal(validatePort(0), false);
    assert.equal(validatePort(-1), false);
    assert.equal(validatePort(65536), false);
    assert.equal(validatePort(3.14), false);
    assert.equal(validatePort('abc'), false);
    assert.equal(validatePort(''), false);
    assert.equal(validatePort(null), false);
  });
});

describe('parseArpLine', () => {
  const { parseArpLine } = require(libPath);

  it('parses standard Windows ARP output lines', () => {
    const result = parseArpLine('  192.168.0.1          00-11-22-33-44-55     dynamic');
    assert.deepEqual(result, {
      ip: '192.168.0.1',
      mac: '00-11-22-33-44-55',
      type: 'dynamic',
    });
  });

  it('parses lines with extra whitespace', () => {
    const result = parseArpLine('  10.0.0.1            aa-bb-cc-dd-ee-ff     static  ');
    assert.deepEqual(result, {
      ip: '10.0.0.1',
      mac: 'aa-bb-cc-dd-ee-ff',
      type: 'static',
    });
  });

  it('returns null for header/empty lines', () => {
    assert.equal(parseArpLine(''), null);
    assert.equal(parseArpLine('  Internet Address      Physical Address      Type'), null);
    assert.equal(parseArpLine('Interface: 192.168.0.100 --- 0x8'), null);
  });

  it('returns null for incomplete lines', () => {
    assert.equal(parseArpLine('192.168.0.1'), null);
  });
});

describe('SUPPORTED_TOOLS', () => {
  const { SUPPORTED_TOOLS } = require(libPath);

  it('is a Set containing expected tools', () => {
    assert.ok(SUPPORTED_TOOLS instanceof Set);
    assert.ok(SUPPORTED_TOOLS.has('rdp'));
    assert.ok(SUPPORTED_TOOLS.has('ssh'));
    assert.ok(SUPPORTED_TOOLS.has('rustdesk'));
    assert.ok(SUPPORTED_TOOLS.has('vnc'));
    assert.ok(SUPPORTED_TOOLS.has('anydesk'));
  });
});

describe('DEFAULT_PORTS', () => {
  const { DEFAULT_PORTS } = require(libPath);

  it('maps tools to their default ports', () => {
    assert.equal(DEFAULT_PORTS.rdp, 3389);
    assert.equal(DEFAULT_PORTS.ssh, 22);
    assert.equal(DEFAULT_PORTS.vnc, 5900);
  });
});

// ============================================================
// Phase 2: LAN Scanning
// ============================================================

describe('getLocalSubnets', () => {
  const { getLocalSubnets } = require(libPath);

  it('returns an array of subnet objects', () => {
    const subnets = getLocalSubnets();
    assert.ok(Array.isArray(subnets));
    for (const s of subnets) {
      assert.ok(typeof s.address === 'string');
      assert.ok(typeof s.netmask === 'string');
      assert.ok(typeof s.prefix === 'string');
      assert.ok(typeof s.iface === 'string');
    }
  });

  it('excludes loopback and internal addresses', () => {
    const subnets = getLocalSubnets();
    for (const s of subnets) {
      assert.notEqual(s.address, '127.0.0.1');
    }
  });
});

describe('scanArpTable', () => {
  const { scanArpTable } = require(libPath);

  it('returns an array of device objects', async () => {
    const devices = await scanArpTable();
    assert.ok(Array.isArray(devices));
    for (const d of devices) {
      assert.ok(typeof d.ip === 'string');
      assert.ok(typeof d.mac === 'string');
      assert.ok(typeof d.type === 'string');
    }
  });
});

// ============================================================
// Phase 3: Tool Detection
// ============================================================

describe('detectTools', () => {
  const { detectTools } = require(libPath);

  it('returns an array of tool objects', async () => {
    const tools = await detectTools();
    assert.ok(Array.isArray(tools));
    for (const t of tools) {
      assert.ok(typeof t.name === 'string');
      assert.ok(typeof t.available === 'boolean');
    }
  });

  it('includes all supported tools in results', async () => {
    const { SUPPORTED_TOOLS } = require(libPath);
    const tools = await detectTools();
    const names = new Set(tools.map((t) => t.name));
    for (const tool of SUPPORTED_TOOLS) {
      assert.ok(names.has(tool), `Missing tool: ${tool}`);
    }
  });
});

// ============================================================
// Phase 4: Profile Management
// ============================================================

describe('Profile management', () => {
  const { loadProfiles, saveProfiles, addProfile, removeProfile, DEFAULT_CONFIG } = require(libPath);
  let tmpDir;
  let tmpFile;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-test-'));
    tmpFile = path.join(tmpDir, 'test-config.json');
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('loadProfiles', () => {
    it('returns default config when file does not exist', () => {
      const config = loadProfiles(path.join(tmpDir, 'nonexistent.json'));
      assert.deepEqual(config, DEFAULT_CONFIG);
    });

    it('loads existing config file', () => {
      const data = { profiles: { test: { host: '1.2.3.4', tool: 'ssh' } } };
      fs.writeFileSync(tmpFile, JSON.stringify(data));
      const config = loadProfiles(tmpFile);
      assert.deepEqual(config, data);
    });
  });

  describe('saveProfiles', () => {
    it('writes config to file', () => {
      const data = { profiles: { mypc: { host: '10.0.0.5', tool: 'rdp' } } };
      saveProfiles(tmpFile, data);
      const loaded = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
      assert.deepEqual(loaded, data);
    });
  });

  describe('addProfile', () => {
    it('returns a new config with the profile added', () => {
      const original = { profiles: {} };
      const profile = { id: 'office', host: '192.168.1.10', tool: 'rdp', name: 'Office PC' };
      const updated = addProfile(original, profile);

      assert.notEqual(updated, original);
      assert.deepEqual(updated.profiles.office, { host: '192.168.1.10', tool: 'rdp', name: 'Office PC' });
      assert.deepEqual(original.profiles, {});
    });

    it('does not mutate the original config', () => {
      const original = { profiles: { a: { host: '1.1.1.1' } } };
      const frozen = JSON.parse(JSON.stringify(original));
      addProfile(original, { id: 'b', host: '2.2.2.2' });
      assert.deepEqual(original, frozen);
    });
  });

  describe('removeProfile', () => {
    it('returns a new config without the profile', () => {
      const original = {
        profiles: {
          a: { host: '1.1.1.1' },
          b: { host: '2.2.2.2' },
        },
      };
      const updated = removeProfile(original, 'a');

      assert.notEqual(updated, original);
      assert.equal(updated.profiles.a, undefined);
      assert.deepEqual(updated.profiles.b, { host: '2.2.2.2' });
      assert.ok('a' in original.profiles);
    });

    it('returns equivalent config if id does not exist', () => {
      const original = { profiles: { a: { host: '1.1.1.1' } } };
      const updated = removeProfile(original, 'nonexistent');
      assert.deepEqual(updated.profiles, original.profiles);
      assert.notEqual(updated, original);
    });
  });
});

// ============================================================
// Phase 5: Launch + Diagnostics
// ============================================================

describe('buildLaunchCommand', () => {
  const { buildLaunchCommand } = require(libPath);

  it('builds RDP command', () => {
    const cmd = buildLaunchCommand('rdp', { host: '192.168.0.10' });
    assert.equal(cmd.program, 'mstsc');
    assert.ok(cmd.args.some((a) => a.includes('192.168.0.10')));
  });

  it('builds SSH command', () => {
    const cmd = buildLaunchCommand('ssh', { host: '10.0.0.1', user: 'admin' });
    assert.equal(cmd.program, 'ssh');
    assert.ok(cmd.args.includes('admin@10.0.0.1'));
  });

  it('builds SSH command without user', () => {
    const cmd = buildLaunchCommand('ssh', { host: '10.0.0.1' });
    assert.equal(cmd.program, 'ssh');
    assert.ok(cmd.args.includes('10.0.0.1'));
  });

  it('builds RustDesk command', () => {
    const cmd = buildLaunchCommand('rustdesk', { host: '192.168.0.5' });
    assert.equal(cmd.program, 'rustdesk');
    assert.ok(cmd.args.includes('--connect'));
    assert.ok(cmd.args.includes('192.168.0.5'));
  });

  it('builds VNC command', () => {
    const cmd = buildLaunchCommand('vnc', { host: '192.168.0.5' });
    assert.ok(cmd.program.length > 0);
    assert.ok(cmd.args.some((a) => a.includes('192.168.0.5')));
  });

  it('builds AnyDesk command', () => {
    const cmd = buildLaunchCommand('anydesk', { host: '192.168.0.5' });
    assert.equal(cmd.program, 'anydesk');
    assert.ok(cmd.args.includes('192.168.0.5'));
  });

  it('throws for unsupported tool', () => {
    assert.throws(() => buildLaunchCommand('badtool', { host: '1.2.3.4' }), /unsupported/i);
  });

  it('throws for invalid host', () => {
    assert.throws(() => buildLaunchCommand('ssh', { host: '; rm -rf /' }), /invalid host/i);
  });
});

describe('checkPort', () => {
  const { checkPort } = require(libPath);

  it('returns an object with open boolean and latency', async () => {
    // Test against localhost — port 1 is almost certainly closed
    const result = await checkPort('127.0.0.1', 1, 500);
    assert.ok(typeof result.open === 'boolean');
    assert.ok(typeof result.latencyMs === 'number');
  });
});

describe('diagnoseHost', () => {
  const { diagnoseHost } = require(libPath);

  it('returns diagnostics with ping and port results', async () => {
    const result = await diagnoseHost('127.0.0.1');
    assert.ok(typeof result.host === 'string');
    assert.ok(Array.isArray(result.ports));
    for (const p of result.ports) {
      assert.ok(typeof p.port === 'number');
      assert.ok(typeof p.service === 'string');
      assert.ok(typeof p.open === 'boolean');
    }
  });
});
