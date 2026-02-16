/**
 * Extracts the MCP tool definitions from our types.ts and outputs a canonical
 * JSON file matching the shape of openapi-endpoints.json for comparison.
 *
 * Usage: npx tsx scripts/extract-mcp-tools.ts
 */

import { TOOL_DEFINITIONS } from "../src/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

const OUTPUT_PATH = new URL("./mcp-tools.json", import.meta.url).pathname;

// Map from MCP tool name to the REST endpoint it wraps.
// This is the manual mapping — it's the one thing we maintain by hand.
// The diff script checks everything else automatically.
// Fields renamed in MCP vs OpenAPI (MCP name → OpenAPI name)
const FIELD_ALIASES: Record<string, Record<string, string>> = {
  "get-prompt-template": { "prompt_name": "identifier" },
};

const TOOL_TO_ENDPOINT: Record<string, { method: string; path: string }> = {
  "get-prompt-template":        { method: "POST",   path: "/prompt-templates/{identifier}" },
  "get-prompt-template-raw":    { method: "GET",    path: "/prompt-templates/{identifier}" },
  "list-prompt-templates":      { method: "GET",    path: "/prompt-templates" },
  "publish-prompt-template":    { method: "POST",   path: "/rest/prompt-templates" },
  "list-prompt-template-labels":{ method: "GET",    path: "/prompt-templates/{identifier}/labels" },
  "create-prompt-label":        { method: "POST",   path: "/prompts/{prompt_id}/label" },
  "move-prompt-label":          { method: "PATCH",  path: "/prompt-labels/{prompt_label_id}" },
  "delete-prompt-label":        { method: "DELETE", path: "/prompt-labels/{prompt_label_id}" },
  "get-snippet-usage":          { method: "GET",    path: "/prompt-templates/{identifier}/snippet-usage" },
  "log-request":                { method: "POST",   path: "/log-request" },
  "create-spans-bulk":          { method: "POST",   path: "/spans-bulk" },
  "list-datasets":              { method: "GET",    path: "/api/public/v2/datasets" },
  "create-dataset-group":       { method: "POST",   path: "/api/public/v2/dataset-groups" },
  "create-dataset-version-from-file": { method: "POST", path: "/api/public/v2/dataset-versions/from-file" },
  "create-dataset-version-from-filter-params": { method: "POST", path: "/api/public/v2/dataset-versions/from-filter-params" },
  "list-evaluations":           { method: "GET",    path: "/api/public/v2/evaluations" },
  "create-report":              { method: "POST",   path: "/reports" },
  "run-report":                 { method: "POST",   path: "/reports/{report_id}/run" },
  "get-report":                 { method: "GET",    path: "/reports/{report_id}" },
  "get-report-score":           { method: "GET",    path: "/reports/{report_id}/score" },
  "update-report-score-card":   { method: "PATCH",  path: "/reports/{report_id}/score-card" },
  "delete-reports-by-name":     { method: "DELETE", path: "/reports/name/{report_name}" },
  "list-workflows":             { method: "GET",    path: "/workflows" },
  "create-workflow":            { method: "POST",   path: "/rest/workflows" },
  "patch-workflow":             { method: "PATCH",  path: "/rest/workflows/{workflow_id_or_name}" },
  "run-workflow":               { method: "POST",   path: "/workflows/{workflow_name}/run" },
  "get-workflow-version-execution-results": { method: "GET", path: "/workflow-version-execution-results" },
  "get-workflow":               { method: "GET",    path: "/workflows/{workflow_id_or_name}" },
  "create-folder":              { method: "POST",   path: "/api/public/v2/folders" },
  "edit-folder":                { method: "PATCH",  path: "/api/public/v2/folders/{folder_id}" },
  "get-folder-entities":        { method: "GET",    path: "/api/public/v2/folders/entities" },
  "move-folder-entities":       { method: "POST",   path: "/api/public/v2/folders/entities" },
  "delete-folder-entities":     { method: "DELETE", path: "/api/public/v2/folders/entities" },
  "resolve-folder-id":          { method: "GET",    path: "/api/public/v2/folders/resolve-id" },
};

type ToolEntry = {
  toolName: string;
  method: string;
  path: string;
  description: string;
  fields: { name: string; type: string; required: boolean; enum?: string[] }[];
};

function normalizeType(schema: Record<string, unknown>): string {
  const t = schema.type;
  if (typeof t === "string") return t;
  if (Array.isArray(t)) {
    const nonNull = t.filter((x: unknown) => x !== "null");
    return nonNull.length === 1 ? String(nonNull[0]) : `union(${nonNull.join(",")})`;
  }
  if (schema.anyOf) return "union";
  if (schema.oneOf) return "oneOf";
  return "unknown";
}

async function main() {
  const tools: ToolEntry[] = [];

  for (const [name, def] of Object.entries(TOOL_DEFINITIONS)) {
    const mapping = TOOL_TO_ENDPOINT[name];
    if (!mapping) {
      console.error(`WARNING: No endpoint mapping for tool "${name}"`);
      continue;
    }

    const jsonSchema = zodToJsonSchema(def.inputSchema, { target: "openApi3" }) as Record<string, unknown>;
    const properties = (jsonSchema.properties || {}) as Record<string, Record<string, unknown>>;
    const required = new Set((jsonSchema.required || []) as string[]);

    const aliases = FIELD_ALIASES[name] || {};
    const fields: ToolEntry["fields"] = [];
    for (const [fieldName, fieldSchema] of Object.entries(properties)) {
      if (fieldName === "api_key") continue; // skip MCP-only field
      fields.push({
        name: aliases[fieldName] || fieldName,
        type: normalizeType(fieldSchema),
        required: required.has(fieldName),
        ...(fieldSchema.enum ? { enum: fieldSchema.enum as string[] } : {}),
      });
    }

    tools.push({
      toolName: name,
      method: mapping.method,
      path: mapping.path,
      description: def.description,
      fields,
    });
  }

  const fs = await import("fs");
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(tools, null, 2) + "\n");
  console.error(`Wrote ${tools.length} tools to ${OUTPUT_PATH}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
