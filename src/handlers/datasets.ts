/**
 * Dataset Handlers
 * Endpoints: list-datasets, create-dataset-group, create-dataset-version-from-file,
 *            create-dataset-version-from-filter-params
 */

import { TOOL_DEFINITIONS } from "../types.js";
import { createToolHandler } from "../utils.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerDatasetHandlers(server: any) {
  // ── List Datasets ──────────────────────────────────────────────────
  const listDs = TOOL_DEFINITIONS["list-datasets"];
  server.tool(
    listDs.name,
    listDs.description,
    listDs.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...params } = args;
        return client.listDatasets(params);
      },
      (result) => {
        const r = result as { items?: unknown[]; total?: number };
        return `Found ${r.items?.length ?? 0} dataset(s) (total: ${r.total ?? "unknown"})`;
      }
    )
  );

  // ── Create Dataset Group ───────────────────────────────────────────
  const createGroup = TOOL_DEFINITIONS["create-dataset-group"];
  server.tool(
    createGroup.name,
    createGroup.description,
    createGroup.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.createDatasetGroup(body);
      },
      (result) => {
        const r = result as { id?: number; name?: string };
        return `Dataset group created${r.name ? ` "${r.name}"` : ""}${r.id ? ` (ID: ${r.id})` : ""}`;
      }
    )
  );

  // ── Create Dataset Version from File ───────────────────────────────
  const fromFile = TOOL_DEFINITIONS["create-dataset-version-from-file"];
  server.tool(
    fromFile.name,
    fromFile.description,
    fromFile.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.createDatasetVersionFromFile(body);
      },
      () => "Dataset version creation from file initiated (async)"
    )
  );

  // ── Create Dataset Version from Filter Params ──────────────────────
  const fromFilter = TOOL_DEFINITIONS["create-dataset-version-from-filter-params"];
  server.tool(
    fromFilter.name,
    fromFilter.description,
    fromFilter.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.createDatasetVersionFromFilterParams(body);
      },
      () => "Dataset version creation from request history initiated (async)"
    )
  );
}
