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

  // These endpoints exist in the OpenAPI spec but were intentionally removed from the MCP server.
  // track-prompt, track-score, track-metadata, and track-group are redundant with log-request
  // which accepts all tracking fields inline. add-report-column is removed as well.
  "MISSING IN MCP: POST /rest/track-prompt (Track Prompt)",
  "MISSING IN MCP: POST /rest/track-score (Track Score)",
  "MISSING IN MCP: POST /rest/track-metadata (Track Metadata)",
  "MISSING IN MCP: POST /rest/track-group (Track Group)",
  "MISSING IN MCP: POST /report-columns (Add Column to Evaluation Pipeline)",

  // get-workflow exists in the backend (public_api/workflows/get_workflows_id_or_name.py)
  // but is not in the OpenAPI spec.
  "EXTRA IN MCP (not in OpenAPI): GET /workflows/{workflow_id_or_name} (tool: get-workflow)",

  // Folder management endpoints exist in the backend (public_api/) but are not yet in the OpenAPI spec.
  // edit-folder was added in PR #244.
  "EXTRA IN MCP (not in OpenAPI): PATCH /api/public/v2/folders/{folder_id} (tool: edit-folder)",
  "EXTRA IN MCP (not in OpenAPI): GET /api/public/v2/folders/entities (tool: get-folder-entities)",
  "EXTRA IN MCP (not in OpenAPI): POST /api/public/v2/folders/entities (tool: move-folder-entities)",
  "EXTRA IN MCP (not in OpenAPI): DELETE /api/public/v2/folders/entities (tool: delete-folder-entities)",
  "EXTRA IN MCP (not in OpenAPI): GET /api/public/v2/folders/resolve-id (tool: resolve-folder-id)",

  // callback_url is documented in the run-workflow reference text
  // (https://docs.promptlayer.com/reference/run-workflow) under Request Body
  // but is not yet in the OpenAPI spec. We include it for async webhook support.
  'EXTRA FIELD: POST /workflows/{workflow_name}/run > "callback_url" not in OpenAPI [tool: run-workflow]',

  // The OpenAPI spec defines input/output as oneOf (ChatPrompt | CompletionPrompt).
  // We type them as plain object (z.record) because the MCP tool passes them through
  // as-is to the API — the server validates the discriminated union, not us.
  'TYPE MISMATCH: POST /log-request > "input": MCP=object, OpenAPI=oneOf [tool: log-request]',
  'TYPE MISMATCH: POST /log-request > "output": MCP=object, OpenAPI=oneOf [tool: log-request]',

  // workspace_id is accepted by the backend but not yet in the OpenAPI spec for these endpoints.
  'EXTRA FIELD: GET /prompt-templates > "workspace_id" not in OpenAPI [tool: list-prompt-templates]',
  'EXTRA FIELD: POST /api/public/v2/folders > "workspace_id" not in OpenAPI [tool: create-folder]',

  // snippet_overrides is accepted by the backend publish endpoint but not in OpenAPI spec.
  'EXTRA FIELD: POST /rest/prompt-templates > "snippet_overrides" not in OpenAPI [tool: publish-prompt-template]',

  // Backend accepts prompt_version_id as alternative to prompt_version_number for label ops,
  // and we make prompt_version_number optional to support both. Not yet in OpenAPI spec.
  'EXTRA FIELD: POST /prompts/{prompt_id}/label > "prompt_version_id" not in OpenAPI [tool: create-prompt-label]',
  'EXTRA FIELD: PATCH /prompt-labels/{prompt_label_id} > "prompt_version_id" not in OpenAPI [tool: move-prompt-label]',
  'REQUIRED MISMATCH: POST /prompts/{prompt_id}/label > "prompt_version_number": MCP=false, OpenAPI=true [tool: create-prompt-label]',
  'REQUIRED MISMATCH: PATCH /prompt-labels/{prompt_label_id} > "prompt_version_number": MCP=false, OpenAPI=true [tool: move-prompt-label]',

  // score_name is accepted by the backend log-request endpoint but not in OpenAPI spec.
  'EXTRA FIELD: POST /log-request > "score_name" not in OpenAPI [tool: log-request]',

  // folder_id is accepted by the backend create-dataset-group endpoint but not in OpenAPI spec.
  'EXTRA FIELD: POST /api/public/v2/dataset-groups > "folder_id" not in OpenAPI [tool: create-dataset-group]',

  // Backend auto-generates name if omitted for dataset groups; OpenAPI marks it required.
  'REQUIRED MISMATCH: POST /api/public/v2/dataset-groups > "name": MCP=false, OpenAPI=true [tool: create-dataset-group]',

  // workflow_node_id and workflow_node_name are accepted by the backend execution results
  // endpoint but not in OpenAPI spec.
  'EXTRA FIELD: GET /workflow-version-execution-results > "workflow_node_id" not in OpenAPI [tool: get-workflow-version-execution-results]',
  'EXTRA FIELD: GET /workflow-version-execution-results > "workflow_node_name" not in OpenAPI [tool: get-workflow-version-execution-results]',

  // The create-dataset-version-from-filter-params endpoint passes through to the backend's
  // RequestLogFilterParams model which has many more filter fields than the OpenAPI spec lists.
  // We include the full set from the backend for completeness. The OpenAPI spec only documents
  // a simplified subset (dataset_group_id, variables_to_parse, start_time, end_time, plus the
  // fields we added: prompt_id, prompt_version_id, prompt_label_id, workspace_id, tags, metadata).
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "id" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "limit" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "tags_and" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "tags_or" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "metadata_and" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "metadata_or" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "prompt_templates_include" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "prompt_templates_exclude" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "starred" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "status" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "sort_by" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "sort_order" not in OpenAPI [tool: create-dataset-version-from-filter-params]',
  'EXTRA FIELD: POST /api/public/v2/dataset-versions/from-filter-params > "order_by_random" not in OpenAPI [tool: create-dataset-version-from-filter-params]',

  // The OpenAPI spec defines scores as object but backend uses a list of {name, operator, value}.
  // Our array type matches what the backend actually accepts.
  'TYPE MISMATCH: POST /api/public/v2/dataset-versions/from-filter-params > "scores": MCP=array, OpenAPI=object [tool: create-dataset-version-from-filter-params]',
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
