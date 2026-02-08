/**
 * Prompt Template Handlers
 * Uses TOOL_DEFINITIONS from types.ts as single source for schemas.
 */

import { PromptLayerClient } from "../client.js";
import type {
  GetPromptTemplateParams,
  ListPromptTemplatesParams,
} from "../types.js";
import { TOOL_DEFINITIONS } from "../types.js";
import {
  getApiKey,
  formatErrorResponse,
  formatSuccessResponse,
} from "../utils.js";

type ToolHandlerArgs = Record<string, unknown> & { api_key?: string };

/**
 * Generic handler factory: resolves API key, creates client, runs the given
 * client call, and formats success/error responses.
 */
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

export function registerTemplateHandlers(server: any) {
  const getTemplate = TOOL_DEFINITIONS["get-prompt-template"];
  server.registerTool(
    getTemplate.name,
    {
      title: getTemplate.title,
      description: getTemplate.description,
      inputSchema: getTemplate.inputSchema,
      outputSchema: getTemplate.outputSchema,
      annotations: getTemplate.annotations,
    },
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

  const listTemplates = TOOL_DEFINITIONS["list-prompt-templates"];
  server.registerTool(
    listTemplates.name,
    {
      title: listTemplates.title,
      description: listTemplates.description,
      inputSchema: listTemplates.inputSchema,
      outputSchema: listTemplates.outputSchema,
      annotations: listTemplates.annotations,
    },
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
}
