#!/usr/bin/env node
/**
 * Stdio-to-Streamable-HTTP bridge for the Mode VC Radar MCP server.
 * Forwards line-delimited JSON-RPC 2.0 messages to https://modevc.com/api/mcp.
 */

import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

export const DEFAULT_MCP_URL = 'https://modevc.com/api/mcp';

const PKG_VERSION = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
).version;

/**
 * Parse CLI arguments into an action and resolved endpoint URL.
 * @param {string[]} argv
 * @param {NodeJS.ProcessEnv} [env]
 */
export function parseCliArgs(argv, env = process.env) {
  let url = env.MODEVC_MCP_URL || DEFAULT_MCP_URL;
  let profile = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') return { action: 'help', url };
    if (arg === '-v' || arg === '--version') return { action: 'version', url };
    if (arg === '--url' && argv[i + 1]) {
      url = argv[++i];
    } else if (arg.startsWith('--url=')) {
      url = arg.slice(6);
    } else if (arg === '--profile' && argv[i + 1]) {
      profile = argv[++i];
    } else if (arg.startsWith('--profile=')) {
      profile = arg.slice(10);
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (profile !== null) {
    if (!/^[a-z0-9-]+$/.test(profile) || profile.startsWith('firm-')) {
      throw new Error(`Invalid or retired profile: ${profile}`);
    }
    url = profile === 'radar' ? DEFAULT_MCP_URL : `${DEFAULT_MCP_URL}/${profile}`;
  }

  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
  }
  return { action: 'run', url: parsed.toString() };
}

/**
 * Extract JSON-RPC payload(s) from either application/json or text/event-stream bodies.
 * @param {string} contentType
 * @param {string} rawBody
 */
export function parseResponsePayload(contentType, rawBody) {
  const trimmed = rawBody.trim();
  if (!trimmed) return [];
  if (contentType.includes('text/event-stream')) {
    const messages = [];
    for (const block of trimmed.split(/\r?\n\r?\n/)) {
      const dataLines = block
        .split(/\r?\n/)
        .filter(line => line.startsWith('data:'))
        .map(line => line.slice(5).trimStart());
      if (!dataLines.length) continue;
      const joined = dataLines.join('\n').trim();
      if (joined && joined !== '[DONE]') messages.push(JSON.parse(joined));
    }
    return messages;
  }
  const parsed = JSON.parse(trimmed);
  return Array.isArray(parsed) ? parsed : [parsed];
}

/**
 * Forward one JSON-RPC message over Streamable HTTP and return response payloads.
 * Notifications (messages without an `id`) omit stdout responses per MCP stdio transport rules.
 */
export async function forwardJsonRpcMessage(message, { url, sessionId, fetchImpl = fetch } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream'
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;

  const isNotification = message === null || typeof message !== 'object' || !Object.hasOwn(message, 'id');
  const res = await fetchImpl(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(message)
  });

  const nextSessionId = res.headers.get('mcp-session-id') || sessionId || null;
  const rawBody = await res.text();
  if (!res.ok) {
    return {
      sessionId: nextSessionId,
      responses: isNotification
        ? []
        : [{ jsonrpc: '2.0', id: message.id, error: { code: -32603, message: `HTTP ${res.status} from ${url}` } }]
    };
  }

  if (isNotification) return { sessionId: nextSessionId, responses: [] };
  const contentType = res.headers.get('content-type') || 'application/json';
  return {
    sessionId: nextSessionId,
    responses: parseResponsePayload(contentType, rawBody)
  };
}

/**
 * Start the line-delimited JSON-RPC stdio bridge.
 */
export function startStdioBridge({
  url = DEFAULT_MCP_URL,
  input = process.stdin,
  output = process.stdout,
  errorOutput = process.stderr,
  fetchImpl = fetch
} = {}) {
  let sessionId = null;
  let queue = Promise.resolve();
  const rl = createInterface({ input, crlfDelay: Infinity });

  const processLine = async line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let payload;
    try {
      payload = JSON.parse(trimmed);
    } catch (err) {
      output.write(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: `Parse error: ${err.message}` } })}\n`);
      return;
    }

    try {
      const result = await forwardJsonRpcMessage(payload, { url, sessionId, fetchImpl });
      sessionId = result.sessionId;
      for (const msg of result.responses) {
        output.write(`${JSON.stringify(msg)}\n`);
      }
    } catch (err) {
      errorOutput.write(`modevc-radar-mcp transport error: ${err.message}\n`);
      if (payload && typeof payload === 'object' && Object.hasOwn(payload, 'id')) {
        output.write(`${JSON.stringify({ jsonrpc: '2.0', id: payload.id, error: { code: -32603, message: err.message } })}\n`);
      }
    }
  };

  rl.on('line', line => {
    queue = queue.then(() => processLine(line));
  });

  return { rl, done: () => queue };
}

function printHelp() {
  process.stdout.write(
    `modevc-radar-mcp v${PKG_VERSION} - Stdio bridge to Mode VC MCP (${DEFAULT_MCP_URL})\n\n` +
      'Usage:\n' +
      '  modevc-radar-mcp [--url <endpoint>] [--profile <name>]\n\n' +
      'Options:\n' +
      `  --url <endpoint>   Override remote Streamable HTTP MCP URL (default: ${DEFAULT_MCP_URL})\n` +
      '  --profile <name>   Use a sub-profile: radar, investors, charts, calculators, sec-filings, benchmarks, llm-economics\n' +
      '  -v, --version      Print package version\n' +
      '  -h, --help         Show this help message\n'
  );
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  let parsed;
  try {
    parsed = parseCliArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(1);
  }
  if (parsed.action === 'help') {
    printHelp();
  } else if (parsed.action === 'version') {
    process.stdout.write(`${PKG_VERSION}\n`);
  } else {
    startStdioBridge({ url: parsed.url });
  }
}
