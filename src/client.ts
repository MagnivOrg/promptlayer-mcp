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
  getRequestSearchSuggestions(params: Body) { return this.get("/api/public/v2/requests/suggestions", params); }

  // Tracking
  logRequest(body: Body) { return this.post("/log-request", body); }
  createSpansBulk(body: Body) { return this.post("/spans-bulk", body); }

  // Smart Tables
  listSmartTables(params?: Body) { return this.get("/api/public/v2/tables", params); }
  createSmartTable(body: Body) { return this.post("/api/public/v2/tables", body); }
  getSmartTable(tableId: string) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}`); }
  updateSmartTable(tableId: string, body: Body) { return this.patch(`/api/public/v2/tables/${this.enc(tableId)}`, body); }
  deleteSmartTable(tableId: string) { return this.del(`/api/public/v2/tables/${this.enc(tableId)}`); }
  listSmartTableSheets(tableId: string, params?: Body) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets`, params); }
  createSmartTableSheet(tableId: string, body: Body) { return this.post(`/api/public/v2/tables/${this.enc(tableId)}/sheets`, body); }
  getSmartTableSheet(tableId: string, sheetId: string) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}`); }
  updateSmartTableSheet(tableId: string, sheetId: string, body: Body) { return this.patch(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}`, body); }
  deleteSmartTableSheet(tableId: string, sheetId: string) { return this.del(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}`); }
  getSmartTableSheetImportOperation(tableId: string, operationId: string) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/operations/${this.enc(operationId)}`); }
  importSmartTableSheetFile(tableId: string, sheetId: string, body: Body) { return this.post(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/imports/file`, body); }
  importSmartTableSheetRequestLogs(tableId: string, sheetId: string, body: Body) { return this.post(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/imports/request-logs`, body); }
  listSmartTableColumns(tableId: string, sheetId: string, params?: Body) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/columns`, params); }
  createSmartTableColumn(tableId: string, sheetId: string, body: Body) { return this.post(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/columns`, body); }
  updateSmartTableColumn(tableId: string, sheetId: string, columnId: string, body: Body) { return this.patch(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/columns/${this.enc(columnId)}`, body); }
  deleteSmartTableColumn(tableId: string, sheetId: string, columnId: string) { return this.del(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/columns/${this.enc(columnId)}`); }
  listSmartTableRows(tableId: string, sheetId: string, params?: Body) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/rows`, params); }
  addSmartTableRows(tableId: string, sheetId: string, body: Body) { return this.post(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/rows`, body); }
  getSmartTableCell(tableId: string, sheetId: string, cellId: string) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/cells/${this.enc(cellId)}`); }
  updateSmartTableCell(tableId: string, sheetId: string, cellId: string, body: Body) { return this.patch(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/cells/${this.enc(cellId)}`, body); }
  recalculateSmartTableCell(tableId: string, sheetId: string, cellId: string) { return this.post(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/cells/${this.enc(cellId)}/recalculate`); }
  recalculateSmartTableCells(tableId: string, sheetId: string, body: Body) { return this.post(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/cells/recalculate`, body); }
  listSmartTableOperations(tableId: string, sheetId: string) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/operations`); }
  createSmartTableOperation(tableId: string, sheetId: string, body: Body) { return this.post(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/operations`, body); }
  getSmartTableOperation(tableId: string, sheetId: string, operationId: string) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/operations/${this.enc(operationId)}`); }
  cancelSmartTableOperation(tableId: string, sheetId: string, operationId: string) { return this.del(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/operations/${this.enc(operationId)}`); }
  getSmartTableScore(tableId: string, sheetId: string) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/score`); }
  configureSmartTableScore(tableId: string, sheetId: string, body: Body) { return this.patch(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/score`, body); }
  recalculateSmartTableScore(tableId: string, sheetId: string) { return this.post(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/score`); }
  listSmartTableVersions(tableId: string, sheetId: string, params?: Body) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/versions`, params); }
  getSmartTableVersion(tableId: string, sheetId: string, versionId: string) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/versions/${this.enc(versionId)}`); }
  createSmartTableVersion(tableId: string, sheetId: string, body: Body) { return this.post(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/versions`, body); }
  getSmartTableScoreHistory(tableId: string, sheetId: string, params?: Body) { return this.get(`/api/public/v2/tables/${this.enc(tableId)}/sheets/${this.enc(sheetId)}/versions/score-history`, params); }
  listLegacySmartTableMigrations(params?: Body) {
    const query = params ? { ...params } : undefined;
    if (query && typeof query.source_id === "number") query.source_id = [query.source_id];
    return this.get("/api/public/v2/tables/legacy-migrations", query);
  }
  previewLegacySmartTableMigration(params: Body) { return this.get("/api/public/v2/tables/legacy-migrations/preview", params); }
  migrateLegacyToSmartTable(body: Body) { return this.post("/api/public/v2/tables/legacy-migrations", body); }
  getLegacySmartTableMigrationJob(jobId: string) { return this.get(`/api/public/v2/tables/legacy-migrations/jobs/${this.enc(jobId)}`); }

  // Agents
  listWorkflows(params?: Body) { return this.get("/workflows", params); }
  getWorkflow(idOrName: string, params?: Body) { return this.get(`/workflows/${this.enc(idOrName)}`, params); }
  getWorkflowLabels(idOrName: string) { return this.get(`/workflows/${this.enc(idOrName)}/labels`); }
  createWorkflow(body: Body) { return this.post("/rest/workflows", body); }
  patchWorkflow(idOrName: string, body: Body) { return this.patch(`/rest/workflows/${this.enc(idOrName)}`, body); }
  runWorkflow(name: string, body: Body) { return this.post(`/workflows/${this.enc(name)}/run`, body); }
  getWorkflowVersionExecutionResults(params: Body) { return this.get("/workflow-version-execution-results", params); }

  // Tool Registry
  listToolRegistries() { return this.get("/api/public/v2/tool-registry"); }
  getToolRegistry(identifier: string, params?: Body) { return this.get(`/api/public/v2/tool-registry/${this.enc(identifier)}`, params); }
  createToolRegistry(body: Body) { return this.post("/api/public/v2/tool-registry", body); }
  createToolVersion(identifier: string, body: Body) { return this.post(`/api/public/v2/tool-registry/${this.enc(identifier)}/versions`, body); }
  testExecuteToolRegistry(identifier: string, body: Body, query?: Body) { return this.post(`/api/public/v2/tool-registry/${this.enc(identifier)}/test-execute${buildQueryParams(query)}`, body); }

  // Env Vars (workspace + tool scopes)
  listWorkspaceEnvVars() { return this.get("/api/public/v2/env-vars"); }
  createWorkspaceEnvVar(body: Body) { return this.post("/api/public/v2/env-vars", body); }
  listToolEnvVars(identifier: string) { return this.get(`/api/public/v2/tool-registry/${this.enc(identifier)}/env-vars`); }
  createToolEnvVar(identifier: string, body: Body) { return this.post(`/api/public/v2/tool-registry/${this.enc(identifier)}/env-vars`, body); }

  // Folders
  createFolder(body: Body) { return this.post("/api/public/v2/folders", body); }
  editFolder(folderId: number, body: Body) { return this.patch(`/api/public/v2/folders/${folderId}`, body); }
  getFolderEntities(params: Body) { return this.get("/api/public/v2/folders/entities", params); }
  moveFolderEntities(body: Body) { return this.post("/api/public/v2/folders/entities", body); }
  deleteFolderEntities(body: Body) { return this.request("/api/public/v2/folders/entities", { method: "DELETE", body: JSON.stringify(body) }); }
  resolveFolderId(params: Body) { return this.get("/api/public/v2/folders/resolve-id", params); }

  // Skill Collections
  listSkillCollections() { return this.get("/api/public/v2/skill-collections"); }
  createSkillCollection(body: Body) { return this.post("/api/public/v2/skill-collections", body); }
  getSkillCollection(identifier: string, params?: Body) { return this.get(`/api/public/v2/skill-collections/${this.enc(identifier)}`, params); }
  updateSkillCollection(identifier: string, body: Body) { return this.patch(`/api/public/v2/skill-collections/${this.enc(identifier)}`, body); }
  saveSkillCollectionVersion(identifier: string, body: Body) { return this.post(`/api/public/v2/skill-collections/${this.enc(identifier)}/versions`, body); }

  // Analytics
  getRequestAnalytics(body: Body) { return this.post("/api/public/v2/requests/analytics", body); }
  getRequestAnalyticsCustomAnalytics(body: Body) { return this.post("/api/public/v2/requests/analytics/custom-analytics", body); }
  getTraceAnalyticsCustomAnalytics(body: Body) { return this.post("/api/public/v2/traces/analytics/custom-analytics", body); }

  // Prompt template patch
  patchPromptTemplateVersion(identifier: string, body: Body) { return this.patch(`/rest/prompt-templates/${this.enc(identifier)}`, body); }
}
