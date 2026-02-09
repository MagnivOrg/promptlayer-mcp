/**
 * Tracking Handlers
 * Endpoints: log-request, track-prompt, track-score, track-metadata, track-group, spans-bulk
 */

import { TOOL_DEFINITIONS } from "../types.js";
import { createToolHandler } from "../utils.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerTrackingHandlers(server: any) {
  // ── Log Request ────────────────────────────────────────────────────
  const logReq = TOOL_DEFINITIONS["log-request"];
  server.tool(
    logReq.name,
    logReq.description,
    logReq.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.logRequest(body);
      },
      (result) => {
        const r = result as { request_id?: string | number };
        return r.request_id
          ? `Request logged (ID: ${r.request_id})`
          : "Request logged successfully";
      }
    )
  );

  // ── Track Prompt ───────────────────────────────────────────────────
  const trackPrompt = TOOL_DEFINITIONS["track-prompt"];
  server.tool(
    trackPrompt.name,
    trackPrompt.description,
    trackPrompt.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.trackPrompt(body);
      },
      () => "Prompt tracked successfully"
    )
  );

  // ── Track Score ────────────────────────────────────────────────────
  const trackScore = TOOL_DEFINITIONS["track-score"];
  server.tool(
    trackScore.name,
    trackScore.description,
    trackScore.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.trackScore(body);
      },
      () => "Score tracked successfully"
    )
  );

  // ── Track Metadata ─────────────────────────────────────────────────
  const trackMetadata = TOOL_DEFINITIONS["track-metadata"];
  server.tool(
    trackMetadata.name,
    trackMetadata.description,
    trackMetadata.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.trackMetadata(body);
      },
      () => "Metadata tracked successfully"
    )
  );

  // ── Track Group ────────────────────────────────────────────────────
  const trackGroup = TOOL_DEFINITIONS["track-group"];
  server.tool(
    trackGroup.name,
    trackGroup.description,
    trackGroup.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.trackGroup(body);
      },
      () => "Group tracked successfully"
    )
  );

  // ── Create Spans Bulk ──────────────────────────────────────────────
  const spansBulk = TOOL_DEFINITIONS["create-spans-bulk"];
  server.tool(
    spansBulk.name,
    spansBulk.description,
    spansBulk.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.createSpansBulk(body);
      },
      (result) => {
        const r = result as { spans?: unknown[] };
        return `Created ${r.spans?.length ?? 0} span(s) successfully`;
      }
    )
  );
}
