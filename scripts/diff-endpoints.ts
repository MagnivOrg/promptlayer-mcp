/**
 * Compares openapi-endpoints.json (source of truth) against mcp-tools.json
 * (what our MCP implements) and reports discrepancies.
 *
 * Usage: npx tsx scripts/diff-endpoints.ts
 *
 * Exit code 0 = in sync, 1 = differences found.
 */

import { readFileSync } from "fs";

const OPENAPI_PATH = new URL("./openapi-endpoints.json", import.meta.url).pathname;
const MCP_PATH = new URL("./mcp-tools.json", import.meta.url).pathname;

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

  const issues: string[] = [];

  // Build lookup of OpenAPI endpoints
  const openapiMap = new Map<string, OpenAPIEndpoint>();
  for (const ep of openapi) openapiMap.set(endpointKey(ep.method, ep.path), ep);

  // Build lookup of MCP tools by endpoint
  const mcpMap = new Map<string, MCPTool>();
  for (const tool of mcp) mcpMap.set(endpointKey(tool.method, tool.path), tool);

  // 1. Endpoints in OpenAPI but missing from MCP
  for (const [key, ep] of openapiMap) {
    if (!mcpMap.has(key)) {
      issues.push(`MISSING IN MCP: ${key} (${ep.summary})`);
    }
  }

  // 2. Endpoints in MCP but not in OpenAPI (possibly docs-only endpoints)
  for (const [key, tool] of mcpMap) {
    if (!openapiMap.has(key)) {
      issues.push(`EXTRA IN MCP (not in OpenAPI): ${key} (tool: ${tool.toolName})`);
    }
  }

  // 3. For matching endpoints, compare fields
  for (const [key, tool] of mcpMap) {
    const ep = openapiMap.get(key);
    if (!ep) continue;

    // Collect all OpenAPI fields (path params excluded since MCP handles them as regular fields)
    const openapiFields = new Map<string, { type: string; required: boolean; enum?: string[] }>();
    for (const p of ep.pathParams) openapiFields.set(p.name, p);
    for (const p of ep.queryParams) openapiFields.set(p.name, { type: p.type, required: p.required, ...(p.enum ? { enum: p.enum } : {}) });
    for (const f of ep.bodyFields) openapiFields.set(f.name, { type: f.type, required: f.required, ...(f.enum ? { enum: f.enum } : {}) });

    const mcpFields = new Map<string, { type: string; required: boolean; enum?: string[] }>();
    for (const f of tool.fields) mcpFields.set(f.name, f);

    // Fields in OpenAPI but missing from MCP
    for (const [name, spec] of openapiFields) {
      if (!mcpFields.has(name)) {
        issues.push(`MISSING FIELD: ${key} > "${name}" (${spec.type}, ${spec.required ? "required" : "optional"}) [tool: ${tool.toolName}]`);
      }
    }

    // Fields in MCP but not in OpenAPI
    for (const [name] of mcpFields) {
      if (!openapiFields.has(name)) {
        issues.push(`EXTRA FIELD: ${key} > "${name}" not in OpenAPI [tool: ${tool.toolName}]`);
      }
    }

    // Type/required mismatches
    for (const [name, mcpField] of mcpFields) {
      const oaField = openapiFields.get(name);
      if (!oaField) continue;

      if (mcpField.required !== oaField.required) {
        issues.push(`REQUIRED MISMATCH: ${key} > "${name}": MCP=${mcpField.required}, OpenAPI=${oaField.required} [tool: ${tool.toolName}]`);
      }

      // Type comparison: normalize for common differences
      const mcpType = mcpField.type.replace("number", "integer");
      const oaType = oaField.type.replace("number", "integer");
      if (mcpType !== oaType && oaType !== "unknown") {
        issues.push(`TYPE MISMATCH: ${key} > "${name}": MCP=${mcpField.type}, OpenAPI=${oaField.type} [tool: ${tool.toolName}]`);
      }
    }
  }

  // Report
  if (issues.length === 0) {
    console.log("All MCP tools are in sync with the OpenAPI spec.");
    process.exit(0);
  }

  console.log(`Found ${issues.length} issue(s):\n`);

  const missing = issues.filter((i) => i.startsWith("MISSING IN MCP"));
  const extra = issues.filter((i) => i.startsWith("EXTRA IN MCP"));
  const missingFields = issues.filter((i) => i.startsWith("MISSING FIELD"));
  const extraFields = issues.filter((i) => i.startsWith("EXTRA FIELD"));
  const typeMismatches = issues.filter((i) => i.startsWith("TYPE MISMATCH") || i.startsWith("REQUIRED MISMATCH"));

  if (missing.length) { console.log("--- Missing Endpoints ---"); missing.forEach((i) => console.log(`  ${i}`)); console.log(); }
  if (extra.length) { console.log("--- Extra Endpoints (not in OpenAPI) ---"); extra.forEach((i) => console.log(`  ${i}`)); console.log(); }
  if (missingFields.length) { console.log("--- Missing Fields ---"); missingFields.forEach((i) => console.log(`  ${i}`)); console.log(); }
  if (extraFields.length) { console.log("--- Extra Fields ---"); extraFields.forEach((i) => console.log(`  ${i}`)); console.log(); }
  if (typeMismatches.length) { console.log("--- Type/Required Mismatches ---"); typeMismatches.forEach((i) => console.log(`  ${i}`)); console.log(); }

  process.exit(1);
}

main();
