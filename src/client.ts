import type { GetPromptTemplateParams, ListPromptTemplatesParams } from "./types.js";
import { buildQueryParams, handleApiError } from "./utils.js";

type Body = Record<string, unknown>;

export class PromptLayerClient {
  constructor(
    private apiKey: string,
    private baseUrl: string = "https://api.promptlayer.com"
  ) {}

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": this.apiKey,
        ...(options.headers as Record<string, string> | undefined),
      },
    });
    if (!response.ok) throw await handleApiError(response);
    return (await response.json()) as T;
  }

  private get<T = unknown>(path: string, params?: Body): Promise<T> {
    return this.request<T>(`${path}${buildQueryParams(params)}`, { method: "GET" });
  }

  private post<T = unknown>(path: string, body?: Body): Promise<T> {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
  }

  private patch<T = unknown>(path: string, body?: Body): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
  }

  private del<T = unknown>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  private enc(s: string): string {
    return encodeURIComponent(s);
  }

  // Prompt Templates
  getPromptTemplate(name: string, params?: GetPromptTemplateParams) {
    return this.post(`/prompt-templates/${this.enc(name)}`, { api_key: this.apiKey, ...params });
  }
  getPromptTemplateRaw(id: string, params?: Body) { return this.get(`/prompt-templates/${this.enc(id)}`, params); }
  listPromptTemplates(params?: ListPromptTemplatesParams) { return this.get("/prompt-templates", params); }
  publishPromptTemplate(body: Body) { return this.post("/rest/prompt-templates", body); }
  listPromptTemplateLabels(id: string) { return this.get(`/prompt-templates/${this.enc(id)}/labels`); }
  createPromptLabel(promptId: number, body: Body) { return this.post(`/prompts/${promptId}/label`, body); }
  movePromptLabel(labelId: number, body: Body) { return this.patch(`/prompt-labels/${labelId}`, body); }
  deletePromptLabel(labelId: number) { return this.del(`/prompt-labels/${labelId}`); }
  getSnippetUsage(id: string, params?: Body) { return this.get(`/prompt-templates/${this.enc(id)}/snippet-usage`, params); }

  // Request Logs
  searchRequestLogs(body: Body) { return this.post("/api/public/v2/requests/search", body); }
  getRequest(requestId: number) { return this.get(`/api/public/v2/requests/${requestId}`); }
  getTrace(traceId: string) { return this.get(`/api/public/v2/traces/${traceId}`); }

  // Tracking
  logRequest(body: Body) { return this.post("/log-request", body); }
  createSpansBulk(body: Body) { return this.post("/spans-bulk", body); }

  // Datasets
  listDatasets(params?: Body) { return this.get("/api/public/v2/datasets", params); }
  getDatasetRows(id: number, params?: Body) { return this.get(`/api/public/v2/datasets/${id}/rows`, params); }
  createDatasetGroup(body: Body) { return this.post("/api/public/v2/dataset-groups", body); }
  createDatasetVersionFromFile(body: Body) { return this.post("/api/public/v2/dataset-versions/from-file", body); }
  createDatasetVersionFromFilterParams(body: Body) { return this.post("/api/public/v2/dataset-versions/from-filter-params", body); }

  // Evaluations
  listEvaluations(params?: Body) { return this.get("/api/public/v2/evaluations", params); }
  getEvaluationRows(id: number, params?: Body) { return this.get(`/api/public/v2/evaluations/${id}/rows`, params); }
  createReport(body: Body) { return this.post("/reports", body); }
  runReport(id: number, body: Body) { return this.post(`/reports/${id}/run`, body); }
  getReport(id: number) { return this.get(`/reports/${id}`); }
  getReportScore(id: number) { return this.get(`/reports/${id}/score`); }
  updateReportScoreCard(id: number, body: Body) { return this.patch(`/reports/${id}/score-card`, body); }
  deleteReportsByName(name: string) { return this.del(`/reports/name/${this.enc(name)}`); }

  // Agents
  listWorkflows(params?: Body) { return this.get("/workflows", params); }
  getWorkflow(idOrName: string, params?: Body) { return this.get(`/workflows/${this.enc(idOrName)}`, params); }
  getWorkflowLabels(idOrName: string) { return this.get(`/workflows/${this.enc(idOrName)}/labels`); }
  createWorkflow(body: Body) { return this.post("/rest/workflows", body); }
  patchWorkflow(idOrName: string, body: Body) { return this.patch(`/rest/workflows/${this.enc(idOrName)}`, body); }
  runWorkflow(name: string, body: Body) { return this.post(`/workflows/${this.enc(name)}/run`, body); }
  getWorkflowVersionExecutionResults(params: Body) { return this.get("/workflow-version-execution-results", params); }

  // Folders
  createFolder(body: Body) { return this.post("/api/public/v2/folders", body); }
  editFolder(folderId: number, body: Body) { return this.patch(`/api/public/v2/folders/${folderId}`, body); }
  getFolderEntities(params: Body) { return this.get("/api/public/v2/folders/entities", params); }
  moveFolderEntities(body: Body) { return this.post("/api/public/v2/folders/entities", body); }
  deleteFolderEntities(body: Body) { return this.request("/api/public/v2/folders/entities", { method: "DELETE", body: JSON.stringify(body) }); }
  resolveFolderId(params: Body) { return this.get("/api/public/v2/folders/resolve-id", params); }
}
