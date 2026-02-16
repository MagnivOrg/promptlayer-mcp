#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./handlers.js";

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

const server = new McpServer(
  { name: "promptlayer-server", version: "1.0.0" },
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
