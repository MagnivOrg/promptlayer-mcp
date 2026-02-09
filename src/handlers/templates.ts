/**
 * Prompt Template Handlers
 */

import type {
  GetPromptTemplateParams,
  ListPromptTemplatesParams,
} from "../types.js";
import { TOOL_DEFINITIONS } from "../types.js";
import { createToolHandler } from "../utils.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerTemplateHandlers(server: any) {
  // ── Get Prompt Template ────────────────────────────────────────────
  const getTemplate = TOOL_DEFINITIONS["get-prompt-template"];
  server.tool(
    getTemplate.name,
    getTemplate.description,
    getTemplate.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const {
          api_key: _,
          prompt_name,
          ...params
        } = args as {
          prompt_name: string;
          api_key?: string;
        } & GetPromptTemplateParams;
        return client.getPromptTemplate(prompt_name, params);
      },
      (result) => {
        const r = result as { prompt_name: string; version: number };
        return `Retrieved prompt template "${r.prompt_name}" (version ${r.version})`;
      }
    )
  );

  // ── Get Prompt Template (Raw) ──────────────────────────────────────
  const getRaw = TOOL_DEFINITIONS["get-prompt-template-raw"];
  server.tool(
    getRaw.name,
    getRaw.description,
    getRaw.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, identifier, ...params } = args as {
          identifier: string;
          api_key?: string;
        } & Record<string, unknown>;
        return client.getPromptTemplateRaw(identifier, params);
      },
      (result) => {
        const r = result as { prompt_name?: string };
        return `Retrieved raw prompt template "${r.prompt_name ?? "unknown"}"`;
      }
    )
  );

  // ── List Prompt Templates ──────────────────────────────────────────
  const listTemplates = TOOL_DEFINITIONS["list-prompt-templates"];
  server.tool(
    listTemplates.name,
    listTemplates.description,
    listTemplates.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...params } = args;
        return client.listPromptTemplates(params as ListPromptTemplatesParams);
      },
      (result) => {
        const r = result as {
          items: unknown[];
          page: number;
          pages: number;
          total: number;
        };
        return `Found ${r.items.length} prompt template(s) (page ${r.page} of ${r.pages}, total: ${r.total})`;
      }
    )
  );

  // ── Publish Prompt Template ────────────────────────────────────────
  const publish = TOOL_DEFINITIONS["publish-prompt-template"];
  server.tool(
    publish.name,
    publish.description,
    publish.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, ...body } = args;
        return client.publishPromptTemplate(body);
      },
      () => "Prompt template published successfully"
    )
  );

  // ── List Prompt Template Labels ────────────────────────────────────
  const listLabels = TOOL_DEFINITIONS["list-prompt-template-labels"];
  server.tool(
    listLabels.name,
    listLabels.description,
    listLabels.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { identifier } = args as { identifier: string };
        return client.listPromptTemplateLabels(identifier);
      },
      (result) => {
        const r = result as unknown[];
        return `Found ${Array.isArray(r) ? r.length : 0} label(s)`;
      }
    )
  );

  // ── Create Prompt Template Label ───────────────────────────────────
  const createLabel = TOOL_DEFINITIONS["create-prompt-label"];
  server.tool(
    createLabel.name,
    createLabel.description,
    createLabel.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, prompt_id, prompt_version_number, name } = args as {
          prompt_id: number;
          prompt_version_number: number;
          name: string;
          api_key?: string;
        };
        return client.createPromptLabel(prompt_id, { prompt_version_number, name });
      },
      () => "Prompt label created successfully"
    )
  );

  // ── Move Prompt Template Label ─────────────────────────────────────
  const moveLabel = TOOL_DEFINITIONS["move-prompt-label"];
  server.tool(
    moveLabel.name,
    moveLabel.description,
    moveLabel.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, prompt_label_id, prompt_version_number } = args as {
          prompt_label_id: number;
          prompt_version_number: number;
          api_key?: string;
        };
        return client.movePromptLabel(prompt_label_id, { prompt_version_number });
      },
      () => "Prompt label moved successfully"
    )
  );

  // ── Delete Prompt Template Label ───────────────────────────────────
  const deleteLabel = TOOL_DEFINITIONS["delete-prompt-label"];
  server.tool(
    deleteLabel.name,
    deleteLabel.description,
    deleteLabel.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { prompt_label_id } = args as { prompt_label_id: number };
        return client.deletePromptLabel(prompt_label_id);
      },
      () => "Prompt label deleted successfully"
    )
  );

  // ── Get Snippet Usage ──────────────────────────────────────────────
  const snippetUsage = TOOL_DEFINITIONS["get-snippet-usage"];
  server.tool(
    snippetUsage.name,
    snippetUsage.description,
    snippetUsage.inputSchema.shape,
    createToolHandler(
      (client, args) => {
        const { api_key: _, identifier, ...params } = args as {
          identifier: string;
          api_key?: string;
        } & Record<string, unknown>;
        return client.getSnippetUsage(identifier, params);
      },
      (result) => {
        const r = result as unknown[];
        return `Found ${Array.isArray(r) ? r.length : 0} prompt(s) using this snippet`;
      }
    )
  );
}
