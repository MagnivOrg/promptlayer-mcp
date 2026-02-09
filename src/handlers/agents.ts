/**
 * Agent / Workflow Handlers
 * Endpoints: list-workflows, create-workflow, patch-workflow, run-workflow,
 *            get-workflow-version-execution-results
 */

import { TOOL_DEFINITIONS } from "../types.js";
import { createToolHandler } from "../utils.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerAgentHandlers(server: any) {
  // ── List Agents ────────────────────────────────────────────────────
  const listWf = TOOL_DEFINITIONS["list-workflows"];
  server.tool(
    listWf.name,
    listWf.description,
    listWf.inputSchema.shape,
    createToolHandler(
      (client) => client.listWorkflows(),
      (result) => {
        const r = result as unknown[];
        return `Found ${Array.isArray(r) ? r.length : 0} agent(s)`;
      }
    )
  );

  // ── Create Agent ───────────────────────────────────────────────────
  const createWf = TOOL_DEFINITIONS["create-workflow"];
  server.tool(
    createWf.name,
    createWf.description,
    createWf.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.createWorkflow(body);
      },
      (result) => {
        const r = result as { id?: number; name?: string };
        return `Agent created${r.name ? ` "${r.name}"` : ""}${r.id ? ` (ID: ${r.id})` : ""}`;
      }
    )
  );

  // ── Update Agent (PATCH) ───────────────────────────────────────────
  const patchWf = TOOL_DEFINITIONS["patch-workflow"];
  server.tool(
    patchWf.name,
    patchWf.description,
    patchWf.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, workflow_id_or_name, ...body } = args as {
          workflow_id_or_name: string;
          api_key?: string;
        } & Record<string, unknown>;
        return client.patchWorkflow(workflow_id_or_name, body);
      },
      () => "Agent updated successfully"
    )
  );

  // ── Run Agent ──────────────────────────────────────────────────────
  const runWf = TOOL_DEFINITIONS["run-workflow"];
  server.tool(
    runWf.name,
    runWf.description,
    runWf.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, workflow_name, ...body } = args as {
          workflow_name: string;
          api_key?: string;
        } & Record<string, unknown>;
        return client.runWorkflow(workflow_name, body);
      },
      (result) => {
        const r = result as { workflow_version_execution_id?: number };
        return r.workflow_version_execution_id
          ? `Agent run started (execution ID: ${r.workflow_version_execution_id})`
          : "Agent run started";
      }
    )
  );

  // ── Get Agent Version Execution Results ────────────────────────────
  const execResults = TOOL_DEFINITIONS["get-workflow-version-execution-results"];
  server.tool(
    execResults.name,
    execResults.description,
    execResults.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...params } = args;
        return client.getWorkflowVersionExecutionResults(params);
      },
      (result) => {
        const r = result as { status?: string };
        return r.status
          ? `Agent execution results (status: ${r.status})`
          : "Agent execution results retrieved";
      }
    )
  );
}
