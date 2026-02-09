/**
 * Folder Handlers
 * Endpoints: create-folder
 */

import { TOOL_DEFINITIONS } from "../types.js";
import { createToolHandler } from "../utils.js";

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
