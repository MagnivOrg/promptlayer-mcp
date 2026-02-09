/**
 * Compares openapi-endpoints.json (source of truth) against mcp-tools.json
 * (what our MCP implements) and reports discrepancies.
 *
 * Usage: npx tsx scripts/diff-endpoints.ts
 *
 * Exit code 0 = in sync (or all issues are known exceptions), 1 = new issues found.
 */

import { readFileSync } from "fs";

const OPENAPI_PATH = new URL("./openapi-endpoints.json", import.meta.url).pathname;
const MCP_PATH = new URL("./mcp-tools.json", import.meta.url).pathname;

// ─── Known exceptions ────────────────────────────────────────────────────────
// Each string is matched exactly against an issue line. When ALL remaining
// issues are in this list, the script exits 0 (pass). Add a comment for each
// explaining WHY it's expected so a future reader/agent understands.
const KNOWN_EXCEPTIONS: string[] = [
  // update-report-score-card is documented in the PromptLayer reference text
  // (https://docs.promptlayer.com/reference/update-report-score-card) but the
  // endpoint is not present in the OpenAPI spec (openapi.json). We implement
  // it because users need it; it will resolve when PromptLayer adds it to the spec.
  "EXTRA IN MCP (not in OpenAPI): PATCH /reports/{report_id}/score-card (tool: update-report-score-card)",

  // callback_url is documented in the run-workflow reference text
  // (https://docs.promptlayer.com/reference/run-workflow) under Request Body
  // but is not yet in the OpenAPI spec. We include it for async webhook support.
  'EXTRA FIELD: POST /workflows/{workflow_name}/run > "callback_url" not in OpenAPI [tool: run-workflow]',

  // The OpenAPI spec defines input/output as oneOf (ChatPrompt | CompletionPrompt).
  // We type them as plain object (z.record) because the MCP tool passes them through
  // as-is to the API — the server validates the discriminated union, not us.
  'TYPE MISMATCH: POST /log-request > "input": MCP=object, OpenAPI=oneOf [tool: log-request]',
  'TYPE MISMATCH: POST /log-request > "output": MCP=object, OpenAPI=oneOf [tool: log-request]',
];
// ─────────────────────────────────────────────────────────────────────────────

type OpenAPIEndpoint = {
  method: string;
  path: string;
  summary: string;
  operationId: string;
  pathParams: { name: string; type: string; required: boolean }[];
  queryParams: { name: string; type: string; required: boolean; enum?: string[] }[];
  bodyFields: { name: string; type: string; required: boolean; enum?: string[] }[];
};

type MCPTool = {
  toolName: string;
  method: string;
  path: string;
  description: string;
  fields: { name: string; type: string; required: boolean; enum?: string[] }[];
};

function endpointKey(method: string, path: string): string {
  return `${method} ${path}`;
}

function main() {
  const openapi: OpenAPIEndpoint[] = JSON.parse(readFileSync(OPENAPI_PATH, "utf-8"));
  const mcp: MCPTool[] = JSON.parse(readFileSync(MCP_PATH, "utf-8"));

  const allIssues: string[] = [];

  const openapiMap = new Map<string, OpenAPIEndpoint>();
  for (const ep of openapi) openapiMap.set(endpointKey(ep.method, ep.path), ep);

  const mcpMap = new Map<string, MCPTool>();
  for (const tool of mcp) mcpMap.set(endpointKey(tool.method, tool.path), tool);

  // 1. Endpoints in OpenAPI but missing from MCP
  for (const [key, ep] of openapiMap) {
    if (!mcpMap.has(key)) {
      allIssues.push(`MISSING IN MCP: ${key} (${ep.summary})`);
    }
  }

  // 2. Endpoints in MCP but not in OpenAPI
  for (const [key, tool] of mcpMap) {
    if (!openapiMap.has(key)) {
      allIssues.push(`EXTRA IN MCP (not in OpenAPI): ${key} (tool: ${tool.toolName})`);
    }
  }

  // 3. Field-level comparison for matching endpoints
  for (const [key, tool] of mcpMap) {
    const ep = openapiMap.get(key);
    if (!ep) continue;

    const openapiFields = new Map<string, { type: string; required: boolean; enum?: string[] }>();
    for (const p of ep.pathParams) openapiFields.set(p.name, p);
    for (const p of ep.queryParams) openapiFields.set(p.name, { type: p.type, required: p.required, ...(p.enum ? { enum: p.enum } : {}) });
    for (const f of ep.bodyFields) openapiFields.set(f.name, { type: f.type, required: f.required, ...(f.enum ? { enum: f.enum } : {}) });

    const mcpFields = new Map<string, { type: string; required: boolean; enum?: string[] }>();
    for (const f of tool.fields) mcpFields.set(f.name, f);

    for (const [name, spec] of openapiFields) {
      if (!mcpFields.has(name)) {
        allIssues.push(`MISSING FIELD: ${key} > "${name}" (${spec.type}, ${spec.required ? "required" : "optional"}) [tool: ${tool.toolName}]`);
      }
    }

    for (const [name] of mcpFields) {
      if (!openapiFields.has(name)) {
        allIssues.push(`EXTRA FIELD: ${key} > "${name}" not in OpenAPI [tool: ${tool.toolName}]`);
      }
    }

    for (const [name, mcpField] of mcpFields) {
      const oaField = openapiFields.get(name);
      if (!oaField) continue;

      if (mcpField.required !== oaField.required) {
        allIssues.push(`REQUIRED MISMATCH: ${key} > "${name}": MCP=${mcpField.required}, OpenAPI=${oaField.required} [tool: ${tool.toolName}]`);
      }

      const mcpType = mcpField.type.replace("number", "integer");
      const oaType = oaField.type.replace("number", "integer");
      if (mcpType !== oaType && oaType !== "unknown") {
        allIssues.push(`TYPE MISMATCH: ${key} > "${name}": MCP=${mcpField.type}, OpenAPI=${oaField.type} [tool: ${tool.toolName}]`);
      }
    }
  }

  // Partition into known vs new
  const knownSet = new Set(KNOWN_EXCEPTIONS);
  const knownIssues = allIssues.filter((i) => knownSet.has(i));
  const newIssues = allIssues.filter((i) => !knownSet.has(i));

  // Report
  if (allIssues.length === 0) {
    console.log("PASS: All MCP tools are in sync with the OpenAPI spec. No issues.");
    process.exit(0);
  }

  if (knownIssues.length > 0) {
    console.log(`Known exceptions (${knownIssues.length}):`);
    knownIssues.forEach((i) => console.log(`  [OK] ${i}`));
    console.log();
  }

  if (newIssues.length === 0) {
    console.log(`PASS: ${knownIssues.length} known exception(s), 0 new issues.`);
    process.exit(0);
  }

  console.log(`FAIL: ${newIssues.length} new issue(s) found:\n`);

  const buckets: Record<string, string[]> = {
    "Missing Endpoints": [],
    "Extra Endpoints": [],
    "Missing Fields": [],
    "Extra Fields": [],
    "Type/Required Mismatches": [],
  };

  for (const i of newIssues) {
    if (i.startsWith("MISSING IN MCP")) buckets["Missing Endpoints"].push(i);
    else if (i.startsWith("EXTRA IN MCP")) buckets["Extra Endpoints"].push(i);
    else if (i.startsWith("MISSING FIELD")) buckets["Missing Fields"].push(i);
    else if (i.startsWith("EXTRA FIELD")) buckets["Extra Fields"].push(i);
    else buckets["Type/Required Mismatches"].push(i);
  }

  for (const [label, items] of Object.entries(buckets)) {
    if (items.length === 0) continue;
    console.log(`--- ${label} ---`);
    items.forEach((i) => console.log(`  ${i}`));
    console.log();
  }

  process.exit(1);
}

main();
