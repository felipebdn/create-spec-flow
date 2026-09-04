import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
import { SpecFlowOrchestrator } from './orchestrator.js';

const TOOLS = [
  { name: 'spec_flow_prepare_change', description: 'Dispatch a cold planner and return questions or a complete proposal without writing project files.', inputSchema: { type: 'object', required: ['request'], properties: { request: { type: 'string' }, answers: { type: 'array', items: { type: 'string' } } } } },
  { name: 'spec_flow_approve_spec', description: 'Persist and commit an approved proposal. This is a human approval gate.', inputSchema: { type: 'object', required: ['proposalId', 'confirmed'], properties: { proposalId: { type: 'string' }, confirmed: { const: true } } } },
  { name: 'spec_flow_run_change', description: 'Start an asynchronous isolated execution/review loop for one change.', inputSchema: { type: 'object', properties: { change: { type: 'string' } } } },
  { name: 'spec_flow_run_queue', description: 'Start the first executable change in queue order.', inputSchema: { type: 'object', properties: {} } },
  { name: 'spec_flow_get_status', description: 'Read queue state or one persisted run.', inputSchema: { type: 'object', properties: { runId: { type: 'string' } } } },
  { name: 'spec_flow_approve_archive', description: 'Approve archive, dispatch the archiver, and fast-forward the unchanged base checkout.', inputSchema: { type: 'object', required: ['runId', 'confirmed'], properties: { runId: { type: 'string' }, confirmed: { const: true } } } },
  { name: 'spec_flow_cancel_run', description: 'Cancel the active subprocess and preserve the run as cancelled.', inputSchema: { type: 'object', required: ['runId'], properties: { runId: { type: 'string' } } } },
];

function response(id, result) { return { jsonrpc: '2.0', id, result }; }
function failure(id, error) { return { jsonrpc: '2.0', id, error: { code: -32000, message: error.message } }; }

export async function handleRequest(orchestrator, message) {
  if (message.method === 'initialize') return response(message.id, { protocolVersion: message.params?.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'create-spec-flow-mcp', version: '0.1.0' } });
  if (message.method === 'notifications/initialized') return null;
  if (message.method === 'tools/list') return response(message.id, { tools: TOOLS });
  if (message.method !== 'tools/call') return failure(message.id, new Error(`Unknown method: ${message.method}`));
  const { name, arguments: args = {} } = message.params ?? {};
  try {
    let value;
    if (name === 'spec_flow_prepare_change') value = await orchestrator.prepareChange(args);
    else if (name === 'spec_flow_approve_spec') value = await orchestrator.approveSpec(args);
    else if (name === 'spec_flow_run_change') value = await orchestrator.start(args);
    else if (name === 'spec_flow_run_queue') value = await orchestrator.start({ queue: true });
    else if (name === 'spec_flow_get_status') value = await orchestrator.status(args.runId);
    else if (name === 'spec_flow_approve_archive') value = await orchestrator.approveArchive(args);
    else if (name === 'spec_flow_cancel_run') value = await orchestrator.cancel(args.runId);
    else throw new Error(`Unknown tool: ${name}`);
    return response(message.id, { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }], structuredContent: value });
  } catch (error) {
    return response(message.id, { isError: true, content: [{ type: 'text', text: error.message }] });
  }
}

export async function startServer({ project }) {
  const orchestrator = new SpecFlowOrchestrator({ project });
  const lines = createInterface({ input: stdin, crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line.trim()) continue;
    let output;
    try { output = await handleRequest(orchestrator, JSON.parse(line)); }
    catch (error) { output = failure(null, error); }
    if (output) stdout.write(`${JSON.stringify(output)}\n`);
  }
}

export { TOOLS };
