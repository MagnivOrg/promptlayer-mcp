#!/usr/bin/env node

/**
 * PromptLayer MCP Server
 * Main entry point for the Model Context Protocol server
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTemplateHandlers } from "./handlers/templates.js";
import { registerTrackingHandlers } from "./handlers/tracking.js";
import { registerDatasetHandlers } from "./handlers/datasets.js";
import { registerEvaluationHandlers } from "./handlers/evaluations.js";
import { registerAgentHandlers } from "./handlers/agents.js";
import { registerFolderHandlers } from "./handlers/folders.js";

// Initialize the MCP server
const server = new McpServer({
  name: "promptlayer-server",
  version: "1.0.0",
});

// Register all tool handlers
registerTemplateHandlers(server);
registerTrackingHandlers(server);
registerDatasetHandlers(server);
registerEvaluationHandlers(server);
registerAgentHandlers(server);
registerFolderHandlers(server);

// Main function to start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PromptLayer MCP Server running on stdio");
}

// Start the server
main().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
