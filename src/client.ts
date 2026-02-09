/**
 * PromptLayer API Client
 * Makes direct REST API calls to PromptLayer
 */

import {
  GetPromptTemplateParams,
  GetPromptTemplateResponse,
  ListPromptTemplatesParams,
  ListPromptTemplatesResponse,
} from "./types.js";
import { buildQueryParams, handleApiError } from "./utils.js";

export class PromptLayerClient {
  constructor(
    private apiKey: string,
    private baseUrl: string = "https://api.promptlayer.com"
  ) {}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-API-KEY": this.apiKey,
      ...(options.headers as Record<string, string> | undefined),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return (await response.json()) as T;
  }

  // ── Prompt Templates ──────────────────────────────────────────────────

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

  async getPromptTemplateRaw(
    identifier: string,
    params?: Record<string, unknown>
  ): Promise<unknown> {
    return this.request<unknown>(
      `/prompt-templates/${encodeURIComponent(identifier)}${buildQueryParams(params)}`,
      { method: "GET" }
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

  async publishPromptTemplate(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/rest/prompt-templates", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async listPromptTemplateLabels(identifier: string): Promise<unknown> {
    return this.request<unknown>(
      `/prompt-templates/${encodeURIComponent(identifier)}/labels`,
      { method: "GET" }
    );
  }

  async createPromptLabel(promptId: number, body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(`/prompts/${promptId}/label`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async movePromptLabel(promptLabelId: number, body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(`/prompt-labels/${promptLabelId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async deletePromptLabel(promptLabelId: number): Promise<unknown> {
    return this.request<unknown>(`/prompt-labels/${promptLabelId}`, {
      method: "DELETE",
    });
  }

  async getSnippetUsage(identifier: string, params?: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(
      `/prompt-templates/${encodeURIComponent(identifier)}/snippet-usage${buildQueryParams(params)}`,
      { method: "GET" }
    );
  }

  // ── Tracking ──────────────────────────────────────────────────────────

  async logRequest(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/log-request", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async trackPrompt(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/rest/track-prompt", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async trackScore(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/rest/track-score", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async trackMetadata(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/rest/track-metadata", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async trackGroup(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/rest/track-group", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async createSpansBulk(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/spans-bulk", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // ── Datasets ──────────────────────────────────────────────────────────

  async listDatasets(params?: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(
      `/api/public/v2/datasets${buildQueryParams(params)}`,
      { method: "GET" }
    );
  }

  async createDatasetGroup(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/api/public/v2/dataset-groups", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async createDatasetVersionFromFile(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/api/public/v2/dataset-versions/from-file", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async createDatasetVersionFromFilterParams(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/api/public/v2/dataset-versions/from-filter-params", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // ── Evaluations ───────────────────────────────────────────────────────

  async listEvaluations(params?: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(
      `/api/public/v2/evaluations${buildQueryParams(params)}`,
      { method: "GET" }
    );
  }

  async createReport(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/reports", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async runReport(reportId: number, body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(`/reports/${reportId}/run`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getReport(reportId: number): Promise<unknown> {
    return this.request<unknown>(`/reports/${reportId}`, { method: "GET" });
  }

  async getReportScore(reportId: number): Promise<unknown> {
    return this.request<unknown>(`/reports/${reportId}/score`, { method: "GET" });
  }

  async addReportColumn(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/report-columns", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateReportScoreCard(reportId: number, body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(`/reports/${reportId}/score-card`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async deleteReportsByName(reportName: string): Promise<unknown> {
    return this.request<unknown>(
      `/reports/name/${encodeURIComponent(reportName)}`,
      { method: "DELETE" }
    );
  }

  // ── Agents / Workflows ────────────────────────────────────────────────

  async listWorkflows(params?: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(`/workflows${buildQueryParams(params)}`, { method: "GET" });
  }

  async createWorkflow(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/rest/workflows", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async patchWorkflow(workflowIdOrName: string, body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(
      `/rest/workflows/${encodeURIComponent(workflowIdOrName)}`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
  }

  async runWorkflow(workflowName: string, body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(
      `/workflows/${encodeURIComponent(workflowName)}/run`,
      { method: "POST", body: JSON.stringify(body) }
    );
  }

  async getWorkflowVersionExecutionResults(params: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>(
      `/workflow-version-execution-results${buildQueryParams(params)}`,
      { method: "GET" }
    );
  }

  // ── Folders ───────────────────────────────────────────────────────────

  async createFolder(body: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("/api/public/v2/folders", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
