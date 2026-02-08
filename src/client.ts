/**
 * PromptLayer API Client
 * Makes direct REST API calls to PromptLayer
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  GetPromptTemplateParams,
  GetPromptTemplateResponse,
  ListPromptTemplatesParams,
  ListPromptTemplatesResponse,
} from "./types.js";
import { buildQueryParams, handleApiError } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PromptLayerClient {
  private debugMode: boolean = true;
  private debugPath: string = join(__dirname, "logs");

  constructor(
    private apiKey: string,
    private baseUrl: string = "https://api.promptlayer.com"
  ) {}

  /**
   * Write API response to a JSON file for testing/debugging
   */
  private writeDebugFile(endpoint: string, data: unknown): void {
    if (!this.debugMode) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `api-response-${endpoint.replace(
        /\//g,
        "-"
      )}-${timestamp}.json`;
      const filepath = join(this.debugPath, filename);
      writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
      console.error(`[DEBUG] API response written to: ${filepath}`);
    } catch (error) {
      console.error(`[DEBUG] Failed to write debug file:`, error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "X-API-KEY": this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    const data = (await response.json()) as T;

    // Write response to file if debug mode is enabled
    this.writeDebugFile(endpoint, data);

    return data;
  }

  async getPromptTemplate(
    promptName: string,
    params?: GetPromptTemplateParams
  ): Promise<GetPromptTemplateResponse> {
    return this.request<GetPromptTemplateResponse>(
      `/prompt-templates/${encodeURIComponent(promptName)}`,
      {
        method: "POST",
        body: JSON.stringify({ api_key: this.apiKey, ...params }),
      }
    );
  }

  async listPromptTemplates(
    params?: ListPromptTemplatesParams
  ): Promise<ListPromptTemplatesResponse> {
    return this.request<ListPromptTemplatesResponse>(
      `/prompt-templates${buildQueryParams(params)}`,
      { method: "GET" }
    );
  }
}
