/**
 * Folder Handlers
 * Endpoints: create-folder
 */

import { PromptLayerClient } from "../client.js";
import { TOOL_DEFINITIONS } from "../types.js";
import {
  getApiKey,
  formatErrorResponse,
  formatSuccessResponse,
} from "../utils.js";

type ToolHandlerArgs = Record<string, unknown> & { api_key?: string };

function createToolHandler<TArgs extends ToolHandlerArgs>(
  clientCall: (client: PromptLayerClient, args: TArgs) => Promise<unknown>,
  formatMessage: (result: unknown) => string
) {
  return async (args: TArgs) => {
    try {
      const apiKey = getApiKey(args.api_key);
      const client = new PromptLayerClient(apiKey);
      const result = await clientCall(client, args);
      return formatSuccessResponse(result, formatMessage(result));
    } catch (error) {
      return formatErrorResponse(error);
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerFolderHandlers(server: any) {
  // ── Create Folder ──────────────────────────────────────────────────
  const createFolder = TOOL_DEFINITIONS["create-folder"];
  server.tool(
    createFolder.name,
    createFolder.description,
    createFolder.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.createFolder(body);
      },
      (result) => {
        const r = result as { id?: number; name?: string };
        return `Folder created${r.name ? ` "${r.name}"` : ""}${r.id ? ` (ID: ${r.id})` : ""}`;
      }
    )
  );
}
