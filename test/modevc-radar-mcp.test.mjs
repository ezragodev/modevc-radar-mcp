import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { PassThrough } from 'node:stream';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_MCP_URL,
  forwardJsonRpcMessage,
  parseCliArgs,
  parseResponsePayload,
  startStdioBridge
} from '../bin/cli.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXPECTED_TOOLS = [
  'get_distribution_moat_score',
  'get_venture_chart_of_the_day',
  'search_charts',
  'get_chart_data',
  'search_investors',
  'get_investor_details',
  'get_mode_vc_thesis_and_criteria',
  'calc_safe_dilution',
  'calc_83b_qsbs_delaware',
  'calc_term_sheet_waterfall',
  'calc_burn_multiple_runway',
  'calc_saas_metrics',
  'calc_llm_inference_cost',
  'calc_fundraising_readiness',
  'calc_cofounder_equity',
  'calc_shopify_fundraising',
  'calc_yc_safe_pro_rata',
  'calc_accelerator_deal_comparison',
  'calc_delaware_incorporation_cost',
  'calc_founder_vesting_acceleration',
  'calc_startup_legal_diligence',
  'calc_ai_agent_pricing_margin',
  'calc_claude_vs_chatgpt_cost',
  'calc_cagr_irr_xirr',
  'calc_paypal_stripe_fees',
  'calc_capital_gains_qsbs',
  'get_new_raises',
  'get_firm_filings',
  'get_daily_ai_raises',
  'get_newly_closed_vc_funds',
  'match_vc_intake_forms',
  'apply_to_mode_vc',
  'submit_and_match_common_app',
  'search_vc_pass_reasons',
  'simulate_vc_response',
  'handle_vc_rejection',
  'contribute_vc_rejection'
];

const EXPECTED_RESOURCES = [
  'modevc://skills/modevc/SKILL.md',
  'modevc://charts/index.json',
  'modevc://investors/atlas.json',
  'modevc://investors/intake-forms.json',
  'modevc://thesis.md'
];

const EXPECTED_PROMPTS = [
  'venture_common_app',
  'fundraising_diligence_check',
  'vc_firm_and_sec_brief'
];

function collectRepoFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectRepoFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

test('LICENSE is canonical MIT with Mode VC Contributors copyright', () => {
  const license = readFileSync(join(ROOT, 'LICENSE'), 'utf8');
  assert.match(license, /^MIT License/m);
  assert.match(license, /Copyright \(c\) 2026 Mode VC Contributors/);
  assert.match(license, /Permission is hereby granted, free of charge/);
});

test('package.json is npm-ready and matches LICENSE and bin entrypoint', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'modevc-radar-mcp');
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.bin['modevc-radar-mcp'], './bin/cli.mjs');
  assert.equal(pkg.scripts.test, 'node --test');
  assert.equal(pkg.repository.url, 'https://github.com/ezragodev/modevc-radar-mcp.git');
  assert.ok(Array.isArray(pkg.keywords) && pkg.keywords.includes('mcp'));
  for (const entry of pkg.files) {
    assert.ok(existsSync(join(ROOT, entry)), `Missing packaged file entry: ${entry}`);
  }
});

test('server.json matches official MCP Registry schema and repository', () => {
  const srv = JSON.parse(readFileSync(join(ROOT, 'server.json'), 'utf8'));
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.equal(srv.$schema, 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json');
  assert.equal(srv.name, 'com.modevc/radar');
  assert.equal(srv.version, pkg.version);
  assert.equal(srv.websiteUrl, 'https://modevc.com');
  assert.deepEqual(srv.repository, {
    url: 'https://github.com/ezragodev/modevc-radar-mcp',
    source: 'github'
  });
  assert.deepEqual(srv.remotes, [
    { type: 'streamable-http', url: 'https://modevc.com/api/mcp' }
  ]);
});

test('openapi.json is OpenAPI 3.1.0 and aligned with package version', () => {
  const oa = JSON.parse(readFileSync(join(ROOT, 'openapi.json'), 'utf8'));
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.equal(oa.openapi, '3.1.0');
  assert.equal(oa.info.version, pkg.version);
  assert.ok(oa.paths['/api/v1/investors/recommend']);
  assert.ok(oa.paths['/api/v1/charts/latest']);
  assert.ok(oa.paths['/api/v1/calc']);
  assert.equal(oa.info.contact?.email, undefined);
});

test('README documents all 37 live tools, 5 resources, and 3 prompts', () => {
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  assert.match(readme, /https:\/\/modevc\.com\/api\/mcp/);
  for (const tool of EXPECTED_TOOLS) {
    assert.ok(readme.includes(`\`${tool}\``), `README missing tool: ${tool}`);
  }
  for (const uri of EXPECTED_RESOURCES) {
    assert.ok(readme.includes(`\`${uri}\``), `README missing resource: ${uri}`);
  }
  for (const prompt of EXPECTED_PROMPTS) {
    assert.ok(readme.includes(`\`${prompt}\``), `README missing prompt: ${prompt}`);
  }
});

test('repository contains zero forbidden terms, personal emails, or primary handles', () => {
  const blockedWords = [
    ['affil', 'iate'].join(''),
    ['alex', 'building'].join(''),
    ['harry', 'build'].join(''),
    ['hf', 'orj'].join(''),
    ['haiwei', 'liu'].join(''),
    ['ming', 'comco'].join('')
  ];
  const forbidden = new RegExp(`\\b(${blockedWords.join('|')})\\b`, 'i');
  const emailLike = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  for (const file of collectRepoFiles(ROOT)) {
    const content = readFileSync(file, 'utf8');
    assert.doesNotMatch(content, forbidden, `Forbidden term found in ${file}`);
    assert.doesNotMatch(content, emailLike, `Email address found in ${file}`);
  }
});

test('parseCliArgs handles flags, profiles, and invalid inputs', () => {
  assert.deepEqual(parseCliArgs([], {}), { action: 'run', url: DEFAULT_MCP_URL });
  assert.deepEqual(parseCliArgs(['--help'], {}), { action: 'help', url: DEFAULT_MCP_URL });
  assert.deepEqual(parseCliArgs(['-v'], {}), { action: 'version', url: DEFAULT_MCP_URL });
  assert.deepEqual(parseCliArgs(['--profile', 'investors'], {}), {
    action: 'run',
    url: 'https://modevc.com/api/mcp/investors'
  });
  assert.deepEqual(parseCliArgs(['--url=http://127.0.0.1:4000/mcp'], {}), {
    action: 'run',
    url: 'http://127.0.0.1:4000/mcp'
  });
  assert.throws(() => parseCliArgs(['--profile', 'firm-sequoia'], {}), /Invalid or retired profile/);
  assert.throws(() => parseCliArgs(['--unknown'], {}), /Unknown or incomplete argument/);
});

test('parseResponsePayload parses JSON and SSE responses', () => {
  assert.deepEqual(
    parseResponsePayload('application/json', '{"jsonrpc":"2.0","id":1,"result":{}}'),
    [{ jsonrpc: '2.0', id: 1, result: {} }]
  );
  const sse = 'event: message\ndata: {"jsonrpc":"2.0","id":2,"result":{"ok":true}}\n\n';
  assert.deepEqual(parseResponsePayload('text/event-stream', sse), [
    { jsonrpc: '2.0', id: 2, result: { ok: true } }
  ]);
});

test('CLI binary runs --version and --help cleanly', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const ver = execFileSync(process.execPath, [join(ROOT, 'bin/cli.mjs'), '--version'], {
    encoding: 'utf8'
  }).trim();
  assert.equal(ver, pkg.version);

  const help = execFileSync(process.execPath, [join(ROOT, 'bin/cli.mjs'), '--help'], {
    encoding: 'utf8'
  });
  assert.match(help, /modevc-radar-mcp/);
  assert.match(help, /https:\/\/modevc\.com\/api\/mcp/);
});

test('stdio bridge forwards JSON-RPC requests, propagates session ID, and drops notification responses', async () => {
  const seenHeaders = [];
  const server = createServer((req, res) => {
    seenHeaders.push({
      sessionId: req.headers['mcp-session-id'] || null,
      contentType: req.headers['content-type']
    });
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const msg = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (msg.method === 'initialize') {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Mcp-Session-Id': 'sess-abc-123'
        });
        res.end(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2025-11-25' } }));
        return;
      }
      if (msg.method === 'notifications/initialized') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jsonrpc: '2.0', id: null, result: {} }));
        return;
      }
      if (msg.method === 'tools/list') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        res.end(`data: ${JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { tools: [{ name: 'search_investors' }] } })}\n\n`);
        return;
      }
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('boom');
    });
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/api/mcp`;

  try {
    const input = new PassThrough();
    const output = new PassThrough();
    const errorOutput = new PassThrough();
    const lines = [];
    output.on('data', chunk => {
      for (const line of chunk.toString('utf8').split('\n')) {
        if (line.trim()) lines.push(JSON.parse(line));
      }
    });

    const bridge = startStdioBridge({ url, input, output, errorOutput });
    input.write(`${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })}\n`);
    input.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`);
    input.write(`${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })}\n`);
    input.end();

    await new Promise(resolve => bridge.rl.on('close', resolve));
    await bridge.done();

    assert.equal(lines.length, 2);
    assert.equal(lines[0].id, 1);
    assert.equal(lines[0].result.protocolVersion, '2025-11-25');
    assert.equal(lines[1].id, 2);
    assert.equal(lines[1].result.tools[0].name, 'search_investors');
    assert.equal(seenHeaders[1].sessionId, 'sess-abc-123');
    assert.equal(seenHeaders[2].sessionId, 'sess-abc-123');

    const httpErr = await forwardJsonRpcMessage(
      { jsonrpc: '2.0', id: 9, method: 'bad/method' },
      { url }
    );
    assert.equal(httpErr.responses[0].id, 9);
    assert.equal(httpErr.responses[0].error.code, -32603);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
