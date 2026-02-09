/**
 * Evaluation Handlers
 * Endpoints: list-evaluations, create-report, run-report, get-report,
 *            get-report-score, add-report-column, update-report-score-card,
 *            delete-reports-by-name
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
export function registerEvaluationHandlers(server: any) {
  // ── List Evaluations ───────────────────────────────────────────────
  const listEvals = TOOL_DEFINITIONS["list-evaluations"];
  server.tool(
    listEvals.name,
    listEvals.description,
    listEvals.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...params } = args;
        return client.listEvaluations(params);
      },
      (result) => {
        const r = result as { items?: unknown[]; total?: number };
        return `Found ${r.items?.length ?? 0} evaluation(s) (total: ${r.total ?? "unknown"})`;
      }
    )
  );

  // ── Create Evaluation Pipeline (Report) ────────────────────────────
  const createReport = TOOL_DEFINITIONS["create-report"];
  server.tool(
    createReport.name,
    createReport.description,
    createReport.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.createReport(body);
      },
      (result) => {
        const r = result as { report_id?: number };
        return r.report_id
          ? `Evaluation pipeline created (report ID: ${r.report_id})`
          : "Evaluation pipeline created successfully";
      }
    )
  );

  // ── Run Evaluation ─────────────────────────────────────────────────
  const runReport = TOOL_DEFINITIONS["run-report"];
  server.tool(
    runReport.name,
    runReport.description,
    runReport.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, report_id, ...body } = args as {
          report_id: number;
          api_key?: string;
        } & Record<string, unknown>;
        return client.runReport(report_id, body);
      },
      (result) => {
        const r = result as { report_id?: number };
        return r.report_id
          ? `Evaluation run started (report ID: ${r.report_id})`
          : "Evaluation run started";
      }
    )
  );

  // ── Get Evaluation ─────────────────────────────────────────────────
  const getReport = TOOL_DEFINITIONS["get-report"];
  server.tool(
    getReport.name,
    getReport.description,
    getReport.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { report_id } = args as { report_id: number };
        return client.getReport(report_id);
      },
      (result) => {
        const r = result as { name?: string; id?: number };
        return `Retrieved evaluation${r.name ? ` "${r.name}"` : ""}${r.id ? ` (ID: ${r.id})` : ""}`;
      }
    )
  );

  // ── Get Evaluation Score ───────────────────────────────────────────
  const getScore = TOOL_DEFINITIONS["get-report-score"];
  server.tool(
    getScore.name,
    getScore.description,
    getScore.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { report_id } = args as { report_id: number };
        return client.getReportScore(report_id);
      },
      (result) => {
        const r = result as { score?: number };
        return r.score !== undefined
          ? `Evaluation score: ${r.score}`
          : "Evaluation score retrieved";
      }
    )
  );

  // ── Add Column to Evaluation Pipeline ──────────────────────────────
  const addColumn = TOOL_DEFINITIONS["add-report-column"];
  server.tool(
    addColumn.name,
    addColumn.description,
    addColumn.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.addReportColumn(body);
      },
      (result) => {
        const r = result as { name?: string };
        return r.name
          ? `Column "${r.name}" added to evaluation pipeline`
          : "Column added to evaluation pipeline";
      }
    )
  );

  // ── Configure Custom Scoring ───────────────────────────────────────
  const updateScoreCard = TOOL_DEFINITIONS["update-report-score-card"];
  server.tool(
    updateScoreCard.name,
    updateScoreCard.description,
    updateScoreCard.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, report_id, ...body } = args as {
          report_id: number;
          api_key?: string;
        } & Record<string, unknown>;
        return client.updateReportScoreCard(report_id, body);
      },
      () => "Report score card updated successfully"
    )
  );

  // ── Delete Reports by Name ─────────────────────────────────────────
  const deleteReports = TOOL_DEFINITIONS["delete-reports-by-name"];
  server.tool(
    deleteReports.name,
    deleteReports.description,
    deleteReports.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { report_name } = args as { report_name: string };
        return client.deleteReportsByName(report_name);
      },
      () => "Reports deleted successfully"
    )
  );
}
