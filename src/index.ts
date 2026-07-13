#!/usr/bin/env node

import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SMART_TABLE_COLUMN_TYPE_SERVER_INSTRUCTIONS } from "./columnTypes.js";
import { SNIPPET_PUBLISH_ORDERING_SERVER_INSTRUCTIONS } from "./snippetPublishOrdering.js";
import { registerAllTools } from "./handlers.js";

const { version } = createRequire(import.meta.url)("../package.json");

const INSTRUCTIONS = `
PromptLayer is a prompt management and observability platform. This MCP server lets you manage PromptLayer resources.

## Key entities and naming

- **Prompt template**: A versioned prompt in the registry. Each version has a prompt_template (the content) and metadata. Versions are immutable — publishing always creates a new version.
- **Snippet**: A reusable prompt fragment referenced inside prompt templates with @@@snippet_name@@@ markers. Snippets are themselves prompt templates (with type "completion"). When a prompt is fetched, snippets are expanded inline by default.
- **Release label**: A pointer (e.g. "prod", "staging") attached to a specific prompt version. Move labels between versions for deployment.
- **Agent** (backend name: workflow): A multi-step pipeline of nodes. Each node has a type, configuration, and dependencies. Agents are versioned like prompts.
- **Smart Table**: The primary workspace for test data, evaluation columns, request-log imports, execution, scoring, and version history.
- **Smart Table sheet**: A tab inside a Smart Table. Sheets contain rows, columns, cells, operations, score configuration, and saved versions.
- **Legacy dataset/evaluation**: Older dataset and report resources. Tools for these remain available for compatibility, but prefer Smart Tables for new work.
- **Folder**: Organizes prompts, agents, Smart Tables, and other entities into a hierarchy.

## Working with prompts and snippets

When editing a prompt that may contain snippets, always use get-prompt-template-raw with resolve_snippets=false. This preserves the raw @@@snippet_name@@@ references so they are not lost on re-publish. The response also includes a "snippets" array listing every snippet used.

When publishing back, keep @@@snippet_name@@@ markers intact in the prompt_template content. Do not inline snippet text — this breaks the snippet reference and future snippet updates will no longer propagate.

${SNIPPET_PUBLISH_ORDERING_SERVER_INSTRUCTIONS}

Use get-prompt-template (the POST variant) only when you need a fully rendered prompt ready to send to an LLM, with input_variables filled in and provider-specific formatting applied.

## Working with Smart Tables

For new dataset or evaluation-style workflows, use Smart Tables instead of legacy datasets and reports. A typical flow is: create-smart-table, add or import sheets, create columns, add rows or import request logs, run recalculation operations, configure sheet scoring, and save versions.

When creating a table you will immediately populate with create-smart-table-sheet, pass create_default_sheet=false to skip the unused default Sheet 1 (default true for backward compatibility).

When seeding a sheet with create-smart-table-sheet source type "file", only CSV and JSON are supported. Pass title to name the sheet; if omitted, the title falls back to the file name stem. import-smart-table-sheet-file on an existing sheet accepts CSV only.

File imports keep CSVs dense: rows where every cell is empty (including blank lines) are skipped. To create N blank row shells for computed columns, do not pad the CSV with empty lines — call add-smart-table-rows with count (max 100 per call) after creating columns/schema.

${SMART_TABLE_COLUMN_TYPE_SERVER_INSTRUCTIONS}

Use the legacy migration tools to preview or convert existing dataset groups, datasets, and reports into Smart Tables.

## Additional documentation

For deeper questions about PromptLayer features, configuration, or API details, the PromptLayer docs site has an MCP server you can use for search. See https://docs.promptlayer.com/mcp for setup.
`.trim();

const server = new McpServer(
  { name: "promptlayer-server", version },
  { instructions: INSTRUCTIONS },
);
registerAllTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PromptLayer MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
