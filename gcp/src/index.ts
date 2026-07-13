import express from "express";
import pkg from "../../package.json";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SMART_TABLE_COLUMN_TYPE_SERVER_INSTRUCTIONS } from "../../src/columnTypes.js";
import { SNIPPET_PUBLISH_ORDERING_SERVER_INSTRUCTIONS } from "../../src/snippetPublishOrdering.js";
import { TOOL_DEFINITIONS } from "../../src/types.js";
import { PromptLayerClient } from "../../src/client.js";
import { getBaseUrl } from "../../src/utils.js";

// ── Tool handler mapping ────────────────────────────────────────────────────

type Args = Record<string, unknown>;
type ToolHandler = (client: PromptLayerClient, args: Args) => Promise<unknown>;

function body(args: Args): Args {
  const { api_key: _, ...rest } = args;
  return rest;
}

function omit(args: Args, ...keys: string[]): Args {
  const rest = body(args);
  for (const key of keys) delete rest[key];
  return rest;
}

const TOOL_HANDLERS: Record<string, ToolHandler> = {
  // Prompt Templates
  "get-prompt-template": (c, { api_key: _, prompt_name, ...p }) =>
    c.getPromptTemplate(prompt_name as string, p),
  "get-prompt-template-raw": (c, { api_key: _, identifier, ...p }) =>
    c.getPromptTemplateRaw(identifier as string, p),
  "list-prompt-templates": (c, a) => c.listPromptTemplates(body(a)),
  "publish-prompt-template": (c, a) => c.publishPromptTemplate(body(a)),
  "list-prompt-template-labels": (c, { identifier }) =>
    c.listPromptTemplateLabels(identifier as string),
  "create-prompt-label": (c, { api_key: _, prompt_id, ...b }) =>
    c.createPromptLabel(prompt_id as number, b),
  "move-prompt-label": (c, { api_key: _, prompt_label_id, ...b }) =>
    c.movePromptLabel(prompt_label_id as number, b),
  "delete-prompt-label": (c, { prompt_label_id }) =>
    c.deletePromptLabel(prompt_label_id as number),
  "get-snippet-usage": (c, { api_key: _, identifier, ...p }) =>
    c.getSnippetUsage(identifier as string, p),
  "patch-prompt-template-version": (c, { api_key: _, identifier, ...b }) =>
    c.patchPromptTemplateVersion(identifier as string, b),

  // Request Logs
  "search-request-logs": (c, a) => c.searchRequestLogs(body(a)),
  "get-request": (c, { request_id }) => c.getRequest(request_id as number),
  "get-trace": (c, { trace_id }) => c.getTrace(trace_id as string),
  "get-request-search-suggestions": (c, a) => c.getRequestSearchSuggestions(body(a)),
  "get-request-analytics": (c, a) => c.getRequestAnalytics(body(a)),
  "get-request-analytics-custom-analytics": (c, a) => c.getRequestAnalyticsCustomAnalytics(body(a)),

  // Tracking
  "log-request": (c, a) => c.logRequest(body(a)),
  "create-spans-bulk": (c, a) => c.createSpansBulk(body(a)),

  // Smart Tables
  "list-smart-tables": (c, a) => c.listSmartTables(body(a)),
  "create-smart-table": (c, a) => c.createSmartTable(body(a)),
  "get-smart-table": (c, { table_id }) =>
    c.getSmartTable(table_id as string),
  "update-smart-table": (c, a) =>
    c.updateSmartTable(a.table_id as string, omit(a, "table_id")),
  "delete-smart-table": (c, { table_id }) =>
    c.deleteSmartTable(table_id as string),
  "list-smart-table-sheets": (c, a) =>
    c.listSmartTableSheets(a.table_id as string, omit(a, "table_id")),
  "create-smart-table-sheet": (c, a) =>
    c.createSmartTableSheet(a.table_id as string, omit(a, "table_id")),
  "get-smart-table-sheet": (c, { table_id, sheet_id }) =>
    c.getSmartTableSheet(table_id as string, sheet_id as string),
  "update-smart-table-sheet": (c, a) =>
    c.updateSmartTableSheet(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "delete-smart-table-sheet": (c, { table_id, sheet_id }) =>
    c.deleteSmartTableSheet(table_id as string, sheet_id as string),
  "get-smart-table-sheet-import-operation": (c, { table_id, operation_id }) =>
    c.getSmartTableSheetImportOperation(table_id as string, operation_id as string),
  "import-smart-table-sheet-file": (c, a) =>
    c.importSmartTableSheetFile(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "import-smart-table-sheet-request-logs": (c, a) =>
    c.importSmartTableSheetRequestLogs(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "list-smart-table-columns": (c, a) =>
    c.listSmartTableColumns(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "create-smart-table-column": (c, a) =>
    c.createSmartTableColumn(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "update-smart-table-column": (c, a) =>
    c.updateSmartTableColumn(a.table_id as string, a.sheet_id as string, a.column_id as string, omit(a, "table_id", "sheet_id", "column_id")),
  "delete-smart-table-column": (c, { table_id, sheet_id, column_id }) =>
    c.deleteSmartTableColumn(table_id as string, sheet_id as string, column_id as string),
  "list-smart-table-rows": (c, a) =>
    c.listSmartTableRows(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "add-smart-table-rows": (c, a) =>
    c.addSmartTableRows(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "get-smart-table-cell": (c, { table_id, sheet_id, cell_id }) =>
    c.getSmartTableCell(table_id as string, sheet_id as string, cell_id as string),
  "update-smart-table-cell": (c, a) =>
    c.updateSmartTableCell(a.table_id as string, a.sheet_id as string, a.cell_id as string, omit(a, "table_id", "sheet_id", "cell_id")),
  "recalculate-smart-table-cell": (c, { table_id, sheet_id, cell_id }) =>
    c.recalculateSmartTableCell(table_id as string, sheet_id as string, cell_id as string),
  "recalculate-smart-table-cells": (c, a) =>
    c.recalculateSmartTableCells(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "list-smart-table-operations": (c, { table_id, sheet_id }) =>
    c.listSmartTableOperations(table_id as string, sheet_id as string),
  "create-smart-table-operation": (c, a) =>
    c.createSmartTableOperation(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "get-smart-table-operation": (c, { table_id, sheet_id, operation_id }) =>
    c.getSmartTableOperation(table_id as string, sheet_id as string, operation_id as string),
  "cancel-smart-table-operation": (c, { table_id, sheet_id, operation_id }) =>
    c.cancelSmartTableOperation(table_id as string, sheet_id as string, operation_id as string),
  "get-smart-table-score": (c, { table_id, sheet_id }) =>
    c.getSmartTableScore(table_id as string, sheet_id as string),
  "configure-smart-table-score": (c, a) =>
    c.configureSmartTableScore(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "recalculate-smart-table-score": (c, { table_id, sheet_id }) =>
    c.recalculateSmartTableScore(table_id as string, sheet_id as string),
  "list-smart-table-versions": (c, a) =>
    c.listSmartTableVersions(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "get-smart-table-version": (c, { table_id, sheet_id, version_id }) =>
    c.getSmartTableVersion(table_id as string, sheet_id as string, version_id as string),
  "create-smart-table-version": (c, a) =>
    c.createSmartTableVersion(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "get-smart-table-score-history": (c, a) =>
    c.getSmartTableScoreHistory(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
  "list-legacy-smart-table-migrations": (c, a) =>
    c.listLegacySmartTableMigrations(body(a)),
  "preview-legacy-smart-table-migration": (c, a) =>
    c.previewLegacySmartTableMigration(body(a)),
  "migrate-legacy-to-smart-table": (c, a) =>
    c.migrateLegacyToSmartTable(body(a)),
  "get-legacy-smart-table-migration-job": (c, { job_id }) =>
    c.getLegacySmartTableMigrationJob(job_id as string),

  // Agents
  "list-workflows": (c, a) => c.listWorkflows(body(a)),
  "create-workflow": (c, a) => c.createWorkflow(body(a)),
  "patch-workflow": (c, { api_key: _, workflow_id_or_name, ...b }) =>
    c.patchWorkflow(workflow_id_or_name as string, b),
  "run-workflow": (c, { api_key: _, workflow_name, ...b }) =>
    c.runWorkflow(workflow_name as string, b),
  "get-workflow-version-execution-results": (c, a) =>
    c.getWorkflowVersionExecutionResults(body(a)),
  "get-workflow": (c, { api_key: _, workflow_id_or_name, ...params }) =>
    c.getWorkflow(workflow_id_or_name as string, params),
  "get-workflow-labels": (c, { workflow_id_or_name }) =>
    c.getWorkflowLabels(workflow_id_or_name as string),

  // Tool Registry
  "list-tool-registries": (c) => c.listToolRegistries(),
  "get-tool-registry": (c, { api_key: _, identifier, ...p }) =>
    c.getToolRegistry(identifier as string, p),
  "create-tool-registry": (c, a) => c.createToolRegistry(body(a)),
  "create-tool-version": (c, { api_key: _, identifier, ...b }) =>
    c.createToolVersion(identifier as string, b),
  "test-execute-tool-registry": (c, { api_key: _, identifier, label, version, ...b }) => {
    const query: Args = {};
    if (label !== undefined) query.label = label;
    if (version !== undefined) query.version = version;
    return c.testExecuteToolRegistry(identifier as string, b, query);
  },

  // Env Vars
  "list-workspace-env-vars": (c) => c.listWorkspaceEnvVars(),
  "create-workspace-env-var": (c, a) => c.createWorkspaceEnvVar({ ...body(a), value: "" }),
  "list-tool-env-vars": (c, { identifier }) =>
    c.listToolEnvVars(identifier as string),
  "create-tool-env-var": (c, { api_key: _, identifier, ...b }) =>
    c.createToolEnvVar(identifier as string, { ...b, value: "" }),

  // Folders
  "create-folder": (c, a) => c.createFolder(body(a)),
  "edit-folder": (c, { api_key: _, folder_id, ...b }) =>
    c.editFolder(folder_id as number, b),
  "get-folder-entities": (c, a) => c.getFolderEntities(body(a)),
  "move-folder-entities": (c, a) => c.moveFolderEntities(body(a)),
  "delete-folder-entities": (c, a) => c.deleteFolderEntities(body(a)),
  "resolve-folder-id": (c, a) => c.resolveFolderId(body(a)),

  // Skill Collections
  "list-skill-collections": (c) => c.listSkillCollections(),
  "create-skill-collection": (c, a) => c.createSkillCollection(body(a)),
  "get-skill-collection": (c, { api_key: _, identifier, ...p }) =>
    c.getSkillCollection(identifier as string, p),
  "update-skill-collection": (c, { api_key: _, identifier, ...b }) =>
    c.updateSkillCollection(identifier as string, b),
  "save-skill-collection-version": (c, { api_key: _, identifier, ...b }) =>
    c.saveSkillCollectionVersion(identifier as string, b),
};

// ── Instructions ────────────────────────────────────────────────────────────

const INSTRUCTIONS = `
PromptLayer is a prompt management and observability platform. This MCP server lets you manage PromptLayer resources.

## Key entities and naming

- **Prompt template**: A versioned prompt in the registry. Each version has a prompt_template (the content) and metadata. Versions are immutable — publishing always creates a new version.
- **Snippet**: A reusable prompt fragment referenced inside prompt templates with @@@snippet_name@@@ markers. Snippets are themselves prompt templates (with type "completion"). When a prompt is fetched, snippets are expanded inline by default.
- **Release label**: A pointer (e.g. "prod", "staging") attached to a specific prompt version. Move labels between versions for deployment.
- **Agent** (backend name: workflow): A multi-step pipeline of nodes. Each node has a type, configuration, and dependencies. Agents are versioned like prompts.
- **Smart Table**: PromptLayer's general-purpose data and computation layer. A table can hold any tabular data and run computed columns over rows. Common uses include evaluations, regression testing, prompt comparisons, and dataset curation.
- **Smart Table sheet**: A tab inside a Smart Table. Sheets contain rows, columns, cells, operations, score configuration, and saved version snapshots.
- **Legacy dataset/evaluation**: Older dataset and report resources. Tools remain available for compatibility; prefer Smart Tables for new work.
- **Folder**: Organizes prompts, agents, Smart Tables, and other entities into a hierarchy.

## Working with prompts and snippets

When editing a prompt that may contain snippets, always use get-prompt-template-raw with resolve_snippets=false. This preserves the raw @@@snippet_name@@@ references so they are not lost on re-publish. The response also includes a "snippets" array listing every snippet used.

When publishing back, keep @@@snippet_name@@@ markers intact in the prompt_template content. Do not inline snippet text — this breaks the snippet reference and future snippet updates will no longer propagate.

${SNIPPET_PUBLISH_ORDERING_SERVER_INSTRUCTIONS}

Use get-prompt-template (the POST variant) only when you need a fully rendered prompt ready to send to an LLM, with input_variables filled in and provider-specific formatting applied.

## Working with Smart Tables

Smart Tables are general-purpose — use them for any tabular data and computation: evaluations, regression testing, prompt comparisons, dataset curation, or anything else. A typical flow is: create-smart-table → add a sheet (blank, from a file, or by importing historical request logs) → create columns → add rows or import more request logs → run a recalculate operation → optionally configure scoring and save a version snapshot.

When creating a table you will immediately populate with create-smart-table-sheet, pass create_default_sheet=false to skip the unused default Sheet 1 (default true for backward compatibility).

To add historical request logs to a table, use import-smart-table-sheet-request-logs (on an existing sheet) or create-smart-table-sheet with source type "request_logs". To add a blank sheet, call create-smart-table-sheet with only table_id (and optional title/index).

${SMART_TABLE_COLUMN_TYPE_SERVER_INSTRUCTIONS}

Use the legacy migration tools to preview or convert existing dataset groups, datasets, and reports into Smart Tables.

## Additional documentation

For deeper questions about PromptLayer features, configuration, or API details, the PromptLayer docs site has an MCP server you can use for search. See https://docs.promptlayer.com/mcp for setup.
`.trim();

function resolveApiKey(argKey?: string, headerKey?: string): string {
  const key = argKey || headerKey;
  if (!key) {
    throw new Error(
      "No API key provided. Set authorization_token in your MCP config " +
      "or pass api_key to each tool call.",
    );
  }
  if (!key.startsWith("pl_")) {
    throw new Error("Invalid API key format. PromptLayer API keys must start with 'pl_'.");
  }
  return key;
}

function createMcpServer(defaultApiKey?: string): McpServer {
  const server = new McpServer(
    { name: "promptlayer-server", version: pkg.version },
    { instructions: INSTRUCTIONS },
  );

  for (const [name, def] of Object.entries(TOOL_DEFINITIONS)) {
    const handler = TOOL_HANDLERS[name];
    if (!handler) continue;

    server.tool(name, def.description, def.inputSchema.shape, async (args: Args) => {
      try {
        const apiKey = resolveApiKey(args.api_key as string | undefined, defaultApiKey);
        const client = new PromptLayerClient(apiKey, getBaseUrl());
        const result = await handler(client, args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    });
  }

  return server;
}

// ── Express app ─────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

async function handleMcp(req: express.Request, res: express.Response) {
  const auth = req.headers.authorization;
  const apiKey = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const server = createMcpServer(apiKey);
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}

app.post("/mcp", handleMcp);
app.get("/mcp", handleMcp);
app.delete("/mcp", handleMcp);

const PORT = parseInt(process.env.PORT || "8080");
app.listen(PORT, () => {
  console.log(`PromptLayer MCP server listening on port ${PORT}`);
});
