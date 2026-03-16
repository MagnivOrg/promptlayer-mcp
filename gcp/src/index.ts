import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { TOOL_DEFINITIONS } from "../../src/types.js";
import { PromptLayerClient } from "../../src/client.js";

// ── Tool handler mapping ────────────────────────────────────────────────────

type Args = Record<string, unknown>;
type ToolHandler = (client: PromptLayerClient, args: Args) => Promise<unknown>;

function body(args: Args): Args {
  const { api_key: _, ...rest } = args;
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

  // Request Logs
  "search-request-logs": (c, a) => c.searchRequestLogs(body(a)),
  "get-request": (c, { request_id }) => c.getRequest(request_id as number),

  // Tracking
  "log-request": (c, a) => c.logRequest(body(a)),
  "create-spans-bulk": (c, a) => c.createSpansBulk(body(a)),

  // Datasets
  "list-datasets": (c, a) => c.listDatasets(body(a)),
  "create-dataset-group": (c, a) => c.createDatasetGroup(body(a)),
  "create-dataset-version-from-file": (c, a) => c.createDatasetVersionFromFile(body(a)),
  "create-dataset-version-from-filter-params": (c, a) => c.createDatasetVersionFromFilterParams(body(a)),

  // Evaluations
  "list-evaluations": (c, a) => c.listEvaluations(body(a)),
  "create-report": (c, a) => c.createReport(body(a)),
  "run-report": (c, { api_key: _, report_id, ...b }) =>
    c.runReport(report_id as number, b),
  "get-report": (c, { report_id }) => c.getReport(report_id as number),
  "get-report-score": (c, { report_id }) => c.getReportScore(report_id as number),
  "update-report-score-card": (c, { api_key: _, report_id, ...b }) =>
    c.updateReportScoreCard(report_id as number, b),
  "delete-reports-by-name": (c, { report_name }) =>
    c.deleteReportsByName(report_name as string),

  // Agents
  "list-workflows": (c, a) => c.listWorkflows(body(a)),
  "create-workflow": (c, a) => c.createWorkflow(body(a)),
  "patch-workflow": (c, { api_key: _, workflow_id_or_name, ...b }) =>
    c.patchWorkflow(workflow_id_or_name as string, b),
  "run-workflow": (c, { api_key: _, workflow_name, ...b }) =>
    c.runWorkflow(workflow_name as string, b),
  "get-workflow-version-execution-results": (c, a) =>
    c.getWorkflowVersionExecutionResults(body(a)),
  "get-workflow": (c, { workflow_id_or_name }) =>
    c.getWorkflow(workflow_id_or_name as string),

  // Folders
  "create-folder": (c, a) => c.createFolder(body(a)),
  "edit-folder": (c, { api_key: _, folder_id, ...b }) =>
    c.editFolder(folder_id as number, b),
  "get-folder-entities": (c, a) => c.getFolderEntities(body(a)),
  "move-folder-entities": (c, a) => c.moveFolderEntities(body(a)),
  "delete-folder-entities": (c, a) => c.deleteFolderEntities(body(a)),
  "resolve-folder-id": (c, a) => c.resolveFolderId(body(a)),
};

// ── Instructions ────────────────────────────────────────────────────────────

const INSTRUCTIONS = `
PromptLayer is a prompt management and observability platform. This MCP server lets you manage PromptLayer resources.

## Key entities and naming

- **Prompt template**: A versioned prompt in the registry. Each version has a prompt_template (the content) and metadata. Versions are immutable — publishing always creates a new version.
- **Snippet**: A reusable prompt fragment referenced inside prompt templates with @@@snippet_name@@@ markers. Snippets are themselves prompt templates (with type "completion"). When a prompt is fetched, snippets are expanded inline by default.
- **Release label**: A pointer (e.g. "prod", "staging") attached to a specific prompt version. Move labels between versions for deployment.
- **Agent** (backend name: workflow): A multi-step pipeline of nodes. Each node has a type, configuration, and dependencies. Agents are versioned like prompts.
- **Evaluation pipeline** (backend name: report): Runs evaluation columns against a dataset and produces scores. Columns can be LLM assertions, code execution, comparisons, etc.
- **Dataset**: A versioned collection of test rows. Belongs to a dataset group. Versions can be created from CSV/JSON files or by filtering request log history.
- **Folder**: Organizes prompts, agents, datasets, evaluations, and other entities into a hierarchy.

## Working with prompts and snippets

When editing a prompt that may contain snippets, always use get-prompt-template-raw with resolve_snippets=false. This preserves the raw @@@snippet_name@@@ references so they are not lost on re-publish. The response also includes a "snippets" array listing every snippet used.

When publishing back, keep @@@snippet_name@@@ markers intact in the prompt_template content. Do not inline snippet text — this breaks the snippet reference and future snippet updates will no longer propagate.

Use get-prompt-template (the POST variant) only when you need a fully rendered prompt ready to send to an LLM, with input_variables filled in and provider-specific formatting applied.

## Working with evaluations

The recommended way to create an evaluation pipeline is with LLM assertion columns — these use a language model to score each dataset row. For details on all available column types (LLM assertion, code execution, comparison, etc.), search the PromptLayer docs or see https://docs.promptlayer.com/features/evaluations/column-types.

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
    { name: "promptlayer-server", version: "1.0.0" },
    { instructions: INSTRUCTIONS },
  );

  for (const [name, def] of Object.entries(TOOL_DEFINITIONS)) {
    const handler = TOOL_HANDLERS[name];
    if (!handler) continue;

    server.tool(name, def.description, def.inputSchema.shape, async (args: Args) => {
      try {
        const apiKey = resolveApiKey(args.api_key as string | undefined, defaultApiKey);
        const client = new PromptLayerClient(apiKey);
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
