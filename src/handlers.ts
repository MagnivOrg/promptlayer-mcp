import type { GetPromptTemplateParams, ListPromptTemplatesParams } from "./types.js";
import { TOOL_DEFINITIONS } from "./types.js";
import { createToolHandler } from "./utils.js";

type Args = Record<string, unknown> & { api_key?: string };
function body(args: Args) { const { api_key: _, ...rest } = args; return rest; }
function omit(args: Args, ...keys: string[]) {
  const rest = body(args);
  for (const key of keys) delete rest[key];
  return rest;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerAllTools(server: any) {
  const t = TOOL_DEFINITIONS;

  function reg(def: (typeof t)[keyof typeof t], call: Parameters<typeof createToolHandler>[0], msg: Parameters<typeof createToolHandler>[1]) {
    server.tool(def.name, def.description, def.inputSchema.shape, createToolHandler(call, msg));
  }

  // Prompt Templates
  reg(t["get-prompt-template"],
    (c, a) => { const { api_key: _, prompt_name, ...p } = a as { prompt_name: string; api_key?: string } & GetPromptTemplateParams; return c.getPromptTemplate(prompt_name, p); },
    (r) => { const { prompt_name, version } = r as { prompt_name: string; version: number }; return `Retrieved "${prompt_name}" v${version}`; });

  reg(t["get-prompt-template-raw"],
    (c, a) => { const { api_key: _, identifier, ...p } = a as { identifier: string; api_key?: string } & Args; return c.getPromptTemplateRaw(identifier, p); },
    (r) => `Retrieved raw template "${(r as { prompt_name?: string }).prompt_name ?? ""}"`);

  reg(t["list-prompt-templates"],
    (c, a) => c.listPromptTemplates(body(a) as ListPromptTemplatesParams),
    (r) => { const { items, page, pages, total } = r as { items: unknown[]; page: number; pages: number; total: number }; return `${items.length} template(s) (page ${page}/${pages}, total ${total})`; });

  reg(t["publish-prompt-template"],
    (c, a) => c.publishPromptTemplate(body(a)),
    () => "Published");

  reg(t["list-prompt-template-labels"],
    (c, a) => c.listPromptTemplateLabels((a as { identifier: string }).identifier),
    (r) => `${Array.isArray(r) ? r.length : 0} label(s)`);

  reg(t["create-prompt-label"],
    (c, a) => { const { api_key: _, prompt_id, prompt_version_number, name } = a as { prompt_id: number; prompt_version_number: number; name: string; api_key?: string }; return c.createPromptLabel(prompt_id, { prompt_version_number, name }); },
    () => "Label created");

  reg(t["move-prompt-label"],
    (c, a) => { const { api_key: _, prompt_label_id, prompt_version_number } = a as { prompt_label_id: number; prompt_version_number: number; api_key?: string }; return c.movePromptLabel(prompt_label_id, { prompt_version_number }); },
    () => "Label moved");

  reg(t["delete-prompt-label"],
    (c, a) => c.deletePromptLabel((a as { prompt_label_id: number }).prompt_label_id),
    () => "Label deleted");

  reg(t["get-snippet-usage"],
    (c, a) => { const { api_key: _, identifier, ...p } = a as { identifier: string; api_key?: string } & Args; return c.getSnippetUsage(identifier, p); },
    (r) => `${Array.isArray(r) ? r.length : 0} prompt(s) using snippet`);

  // Request Logs
  reg(t["search-request-logs"], (c, a) => c.searchRequestLogs(body(a)),
    (r) => { const { items, total, page, pages } = r as { items?: unknown[]; total?: number; page?: number; pages?: number }; return `${items?.length ?? 0} request(s) (page ${page ?? 1}/${pages ?? 1}, total ${total ?? "?"})`; });
  reg(t["get-request"],
    (c, a) => c.getRequest((a as { request_id: number }).request_id),
    (r) => { const { request_id, model } = r as { request_id?: number; model?: string }; return `Request ${request_id ?? ""}${model ? ` (${model})` : ""} retrieved`; });
  reg(t["get-trace"],
    (c, a) => c.getTrace(a.trace_id as string),
    () => "Trace retrieved");
  reg(t["get-request-search-suggestions"],
    (c, a) => c.getRequestSearchSuggestions(body(a)),
    (r) => { const v = (r as { values?: unknown[] }).values; return `${v?.length ?? 0} suggestion(s)`; });

  // Tracking
  reg(t["log-request"], (c, a) => c.logRequest(body(a)),
    (r) => { const id = (r as { request_id?: unknown }).request_id; return id ? `Logged (ID: ${id})` : "Logged"; });
  reg(t["create-spans-bulk"], (c, a) => c.createSpansBulk(body(a)),
    (r) => `Created ${(r as { spans?: unknown[] }).spans?.length ?? 0} span(s)`);

  // Smart Tables
  reg(t["list-smart-tables"], (c, a) => c.listSmartTables(body(a)),
    (r) => `${(r as { data?: unknown[] }).data?.length ?? 0} table(s)`);
  reg(t["create-smart-table"], (c, a) => c.createSmartTable(body(a)),
    (r) => {
      const table = (r as { table?: { id?: string; title?: string } }).table;
      return table?.id ? `Table "${table.title ?? ""}" created (${table.id})` : "Table created";
    });
  reg(t["get-smart-table"],
    (c, a) => c.getSmartTable(a.table_id as string),
    (r) => `Table "${(r as { table?: { title?: string } }).table?.title ?? ""}" retrieved`);
  reg(t["update-smart-table"],
    (c, a) => c.updateSmartTable(a.table_id as string, omit(a, "table_id")),
    () => "Table updated");
  reg(t["list-smart-table-sheets"],
    (c, a) => c.listSmartTableSheets(a.table_id as string, omit(a, "table_id")),
    (r) => `${(r as { data?: unknown[] }).data?.length ?? 0} sheet(s)`);
  reg(t["create-smart-table-sheet"],
    (c, a) => c.createSmartTableSheet(a.table_id as string, omit(a, "table_id")),
    (r) => {
      const op = (r as { operation_id?: string }).operation_id;
      return op ? `Sheet import started (${op})` : "Sheet created";
    });
  reg(t["get-smart-table-sheet"],
    (c, a) => c.getSmartTableSheet(a.table_id as string, a.sheet_id as string),
    () => "Sheet retrieved");
  reg(t["update-smart-table-sheet"],
    (c, a) => c.updateSmartTableSheet(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    () => "Sheet updated");
  reg(t["get-smart-table-sheet-import-operation"],
    (c, a) => c.getSmartTableSheetImportOperation(a.table_id as string, a.operation_id as string),
    (r) => `Import operation ${(r as { operation?: { status?: string } }).operation?.status ?? "retrieved"}`);
  reg(t["import-smart-table-sheet-file"],
    (c, a) => c.importSmartTableSheetFile(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => `File import started (${(r as { operation_id?: string }).operation_id ?? "operation queued"})`);
  reg(t["import-smart-table-sheet-request-logs"],
    (c, a) => c.importSmartTableSheetRequestLogs(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => `Request-log import started (${(r as { operation_id?: string }).operation_id ?? "operation queued"})`);
  reg(t["list-smart-table-columns"],
    (c, a) => c.listSmartTableColumns(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => `${(r as { data?: unknown[] }).data?.length ?? 0} column(s)`);
  reg(t["create-smart-table-column"],
    (c, a) => c.createSmartTableColumn(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => `Column created${(r as { column?: { id?: string } }).column?.id ? ` (${(r as { column?: { id?: string } }).column?.id})` : ""}`);
  reg(t["update-smart-table-column"],
    (c, a) => c.updateSmartTableColumn(a.table_id as string, a.sheet_id as string, a.column_id as string, omit(a, "table_id", "sheet_id", "column_id")),
    (r) => (r as { requires_recalculation?: boolean }).requires_recalculation ? "Column updated; recalculation required" : "Column updated");
  reg(t["list-smart-table-rows"],
    (c, a) => c.listSmartTableRows(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => `${(r as { data?: unknown[] }).data?.length ?? 0} row(s)`);
  reg(t["add-smart-table-rows"],
    (c, a) => c.addSmartTableRows(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => `${(r as { rows?: unknown[]; data?: unknown[] }).rows?.length ?? (r as { data?: unknown[] }).data?.length ?? 0} row(s) added`);
  reg(t["get-smart-table-cell"],
    (c, a) => c.getSmartTableCell(a.table_id as string, a.sheet_id as string, a.cell_id as string),
    () => "Cell retrieved");
  reg(t["update-smart-table-cell"],
    (c, a) => c.updateSmartTableCell(a.table_id as string, a.sheet_id as string, a.cell_id as string, omit(a, "table_id", "sheet_id", "cell_id")),
    () => "Cell updated");
  reg(t["recalculate-smart-table-cell"],
    (c, a) => c.recalculateSmartTableCell(a.table_id as string, a.sheet_id as string, a.cell_id as string),
    (r) => `${(r as { cell_count?: number }).cell_count ?? 0} cell(s) queued`);
  reg(t["recalculate-smart-table-cells"],
    (c, a) => c.recalculateSmartTableCells(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => `${(r as { cell_count?: number }).cell_count ?? 0} cell(s) queued`);
  reg(t["list-smart-table-operations"],
    (c, a) => c.listSmartTableOperations(a.table_id as string, a.sheet_id as string),
    (r) => `${(r as { active_operations?: unknown[] }).active_operations?.length ?? 0} active operation(s)`);
  reg(t["create-smart-table-operation"],
    (c, a) => c.createSmartTableOperation(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => {
      const op = (r as { operation_id?: string; cell_count?: number }).operation_id;
      return op ? `Operation started (${op})` : `${(r as { cell_count?: number }).cell_count ?? 0} cell(s) affected`;
    });
  reg(t["get-smart-table-operation"],
    (c, a) => c.getSmartTableOperation(a.table_id as string, a.sheet_id as string, a.operation_id as string),
    (r) => `Operation ${(r as { operation?: { status?: string } }).operation?.status ?? "retrieved"}`);
  reg(t["cancel-smart-table-operation"],
    (c, a) => c.cancelSmartTableOperation(a.table_id as string, a.sheet_id as string, a.operation_id as string),
    (r) => `${(r as { cancelled_cell_count?: number }).cancelled_cell_count ?? 0} cell(s) cancelled`);
  reg(t["get-smart-table-score"],
    (c, a) => c.getSmartTableScore(a.table_id as string, a.sheet_id as string),
    (r) => `Score ${(r as { status?: string | null }).status ?? "retrieved"}`);
  reg(t["configure-smart-table-score"],
    (c, a) => c.configureSmartTableScore(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    () => "Score configured; recalculation required");
  reg(t["recalculate-smart-table-score"],
    (c, a) => c.recalculateSmartTableScore(a.table_id as string, a.sheet_id as string),
    (r) => `Score recalculation ${(r as { status?: string }).status ?? "queued"}`);
  reg(t["list-smart-table-versions"],
    (c, a) => c.listSmartTableVersions(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => `${(r as { data?: unknown[] }).data?.length ?? 0} version(s)`);
  reg(t["get-smart-table-version"],
    (c, a) => c.getSmartTableVersion(a.table_id as string, a.sheet_id as string, a.version_id as string),
    () => "Version retrieved");
  reg(t["create-smart-table-version"],
    (c, a) => c.createSmartTableVersion(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => `Version ${(r as { version?: { version_number?: number } }).version?.version_number ?? "created"}`);
  reg(t["get-smart-table-score-history"],
    (c, a) => c.getSmartTableScoreHistory(a.table_id as string, a.sheet_id as string, omit(a, "table_id", "sheet_id")),
    (r) => `${(r as { score_history?: { returned_points?: number } }).score_history?.returned_points ?? 0} score point(s)`);
  reg(t["list-legacy-smart-table-migrations"],
    (c, a) => c.listLegacySmartTableMigrations(body(a)),
    (r) => `${(r as { legacy_migrations?: unknown[] }).legacy_migrations?.length ?? 0} migration mapping(s)`);
  reg(t["preview-legacy-smart-table-migration"],
    (c, a) => c.previewLegacySmartTableMigration(body(a)),
    (r) => {
      const counts = (r as { estimated_counts?: { sheets?: number; columns?: number; cells?: number } }).estimated_counts;
      return counts ? `Preview: ${counts.sheets ?? 0} sheet(s), ${counts.columns ?? 0} column(s), ${counts.cells ?? 0} cell(s)` : "Migration preview retrieved";
    });
  reg(t["migrate-legacy-to-smart-table"],
    (c, a) => c.migrateLegacyToSmartTable(body(a)),
    (r) => {
      const job = (r as { job_id?: string; dry_run?: boolean }).job_id;
      return (r as { dry_run?: boolean }).dry_run ? "Migration dry run complete" : `Migration queued${job ? ` (${job})` : ""}`;
    });
  reg(t["get-legacy-smart-table-migration-job"],
    (c, a) => c.getLegacySmartTableMigrationJob(a.job_id as string),
    (r) => `Migration job ${(r as { status?: string }).status ?? "retrieved"}`);

  // Datasets
  reg(t["list-datasets"], (c, a) => c.listDatasets(body(a)),
    (r) => { const { datasets, total } = r as { datasets?: unknown[]; total?: number }; return `${datasets?.length ?? 0} dataset(s) (total: ${total ?? "?"})`; });
  reg(t["create-dataset-group"], (c, a) => c.createDatasetGroup(body(a)), () => "Dataset group created");
  reg(t["create-dataset-version-from-file"], (c, a) => c.createDatasetVersionFromFile(body(a)), () => "Dataset version from file initiated");
  reg(t["create-dataset-version-from-filter-params"], (c, a) => c.createDatasetVersionFromFilterParams(body(a)), () => "Dataset version from history initiated");
  reg(t["get-dataset-rows"],
    (c, a) => { const { api_key: _, dataset_id, ...p } = a as { dataset_id: number; api_key?: string } & Args; return c.getDatasetRows(dataset_id, p); },
    (r) => { const { rows, total, page, pages } = r as { rows?: unknown[]; total?: number; page?: number; pages?: number }; return `${rows?.length ?? 0} row(s) (page ${page ?? 1}/${pages ?? 1}, total ${total ?? "?"})`; });
  reg(t["create-draft-dataset-version"], (c, a) => c.createDraftDatasetVersion(body(a)), () => "Draft dataset version created");
  reg(t["add-request-log-to-dataset"], (c, a) => c.addRequestLogToDatasetVersion(body(a)), () => "Request log added to draft dataset");
  reg(t["add-trace-to-dataset"], (c, a) => c.addTraceToDatasetVersion(body(a)),
    (r) => { const m = (r as { mode?: string }).mode; return m ? `Trace added to draft dataset (mode: ${m})` : "Trace added to draft dataset"; });
  reg(t["save-draft-dataset-version"], (c, a) => c.saveDraftDatasetVersion(body(a)), () => "Draft dataset save initiated");

  // Evaluations
  reg(t["list-evaluations"], (c, a) => c.listEvaluations(body(a)),
    (r) => { const { items, total } = r as { items?: unknown[]; total?: number }; return `${items?.length ?? 0} evaluation(s) (total: ${total ?? "?"})`; });
  reg(t["get-evaluation-rows"],
    (c, a) => { const { api_key: _, evaluation_id, ...p } = a as { evaluation_id: number; api_key?: string } & Args; return c.getEvaluationRows(evaluation_id, p); },
    (r) => { const { rows, total, page, pages } = r as { rows?: unknown[]; total?: number; page?: number; pages?: number }; return `${rows?.length ?? 0} row(s) (page ${page ?? 1}/${pages ?? 1}, total ${total ?? "?"})`; });
  reg(t["create-report"], (c, a) => c.createReport(body(a)),
    (r) => { const id = (r as { report_id?: number }).report_id; return id ? `Pipeline created (ID: ${id})` : "Pipeline created"; });
  reg(t["run-report"],
    (c, a) => { const { api_key: _, report_id, ...b } = a as { report_id: number; api_key?: string } & Args; return c.runReport(report_id, b); },
    () => "Evaluation run started");
  reg(t["get-report"],
    (c, a) => c.getReport((a as { report_id: number }).report_id),
    () => "Evaluation retrieved");
  reg(t["get-report-score"],
    (c, a) => c.getReportScore((a as { report_id: number }).report_id),
    (r) => { const s = (r as { score?: number }).score; return s !== undefined ? `Score: ${s}` : "Score retrieved"; });
  reg(t["update-report-score-card"],
    (c, a) => { const { api_key: _, report_id, ...b } = a as { report_id: number; api_key?: string } & Args; return c.updateReportScoreCard(report_id, b); },
    () => "Score card updated");
  reg(t["delete-reports-by-name"],
    (c, a) => c.deleteReportsByName((a as { report_name: string }).report_name),
    () => "Reports archived");
  reg(t["delete-report"],
    (c, a) => c.deleteReport((a as { report_id: number }).report_id),
    () => "Evaluation pipeline archived");
  reg(t["rename-report"],
    (c, a) => { const { api_key: _, report_id, ...b } = a as { report_id: number; api_key?: string } & Args; return c.renameReport(report_id, b); },
    () => "Evaluation pipeline updated");
  reg(t["add-report-column"], (c, a) => c.addReportColumn(body(a)),
    (r) => { const id = (r as { report_column?: { id?: number } }).report_column?.id; return id ? `Column added (ID: ${id})` : "Column added"; });
  reg(t["edit-report-column"],
    (c, a) => { const { api_key: _, report_column_id, ...b } = a as { report_column_id: number; api_key?: string } & Args; return c.editReportColumn(report_column_id, b); },
    () => "Column updated");
  reg(t["delete-report-column"],
    (c, a) => c.deleteReportColumn((a as { report_column_id: number }).report_column_id),
    () => "Column deleted");

  // Agents
  reg(t["list-workflows"], (c, a) => c.listWorkflows(body(a)), () => "Agents listed");
  reg(t["create-workflow"], (c, a) => c.createWorkflow(body(a)), () => "Agent created");
  reg(t["patch-workflow"],
    (c, a) => { const { api_key: _, workflow_id_or_name, ...b } = a as { workflow_id_or_name: string; api_key?: string } & Args; return c.patchWorkflow(workflow_id_or_name, b); },
    () => "Agent updated");
  reg(t["run-workflow"],
    (c, a) => { const { api_key: _, workflow_name, ...b } = a as { workflow_name: string; api_key?: string } & Args; return c.runWorkflow(workflow_name, b); },
    (r) => { const id = (r as { workflow_version_execution_id?: number }).workflow_version_execution_id; return id ? `Agent run started (ID: ${id})` : "Agent run started"; });
  reg(t["get-workflow-version-execution-results"],
    (c, a) => c.getWorkflowVersionExecutionResults(body(a)),
    () => "Execution results retrieved");
  reg(t["get-workflow"],
    (c, a) => { const { api_key: _, workflow_id_or_name, ...params } = a as { workflow_id_or_name: string; api_key?: string } & Args; return c.getWorkflow(workflow_id_or_name, params); },
    (r) => { const w = r as { workflow_name?: string }; return `Agent "${w.workflow_name ?? ""}" retrieved`; });
  reg(t["get-workflow-labels"],
    (c, a) => c.getWorkflowLabels((a as { workflow_id_or_name: string }).workflow_id_or_name),
    (r) => { const labels = (r as { release_labels?: unknown[] }).release_labels; return `${labels?.length ?? 0} label(s) found`; });

  // Tool Registry
  reg(t["list-tool-registries"], (c) => c.listToolRegistries(),
    (r) => { const tools = (r as { tool_registries?: unknown[] }).tool_registries; return `${tools?.length ?? 0} tool(s)`; });
  reg(t["get-tool-registry"],
    (c, a) => { const { api_key: _, identifier, ...p } = a as { identifier: string; api_key?: string } & Args; return c.getToolRegistry(identifier, p); },
    (r) => { const t_ = (r as { tool_registry?: { name?: string } }).tool_registry; return `Tool "${t_?.name ?? ""}" retrieved`; });
  reg(t["create-tool-registry"], (c, a) => c.createToolRegistry(body(a)),
    (r) => { const t_ = (r as { tool_registry?: { name?: string; id?: number } }).tool_registry; return t_ ? `Tool "${t_.name}" created (ID: ${t_.id})` : "Tool created"; });
  reg(t["create-tool-version"],
    (c, a) => { const { api_key: _, identifier, ...b } = a as { identifier: string; api_key?: string } & Args; return c.createToolVersion(identifier, b); },
    (r) => { const v = (r as { version?: { number?: number } }).version; return v ? `Version ${v.number} created` : "Version created"; });
  reg(t["test-execute-tool-registry"],
    (c, a) => {
      const { api_key: _, identifier, label, version, ...rest } = a as { identifier: string; api_key?: string; label?: string; version?: number } & Args;
      const query: Record<string, unknown> = {};
      if (label !== undefined) query.label = label;
      if (version !== undefined) query.version = version;
      return c.testExecuteToolRegistry(identifier, rest, query);
    },
    (r) => {
      const res = (r as { result?: { status?: string; duration_ms?: number; error?: { message?: string } } }).result;
      if (!res) return "Tool executed";
      if (res.status === "error") return `Tool failed: ${res.error?.message ?? "unknown error"}`;
      return `Tool executed (${res.duration_ms ?? 0} ms)`;
    });

  // Folders
  reg(t["create-folder"], (c, a) => c.createFolder(body(a)), () => "Folder created");
  reg(t["edit-folder"],
    (c, a) => { const { api_key: _, folder_id, ...b } = a as { folder_id: number; api_key?: string } & Args; return c.editFolder(folder_id, b); },
    () => "Folder renamed");
  reg(t["get-folder-entities"], (c, a) => c.getFolderEntities(body(a)),
    (r) => { const e = (r as { entities?: unknown[] }).entities; return `${e?.length ?? 0} entity/entities`; });
  reg(t["move-folder-entities"], (c, a) => c.moveFolderEntities(body(a)),
    (r) => { const c_ = (r as { moved_count?: number }).moved_count; return `Moved ${c_ ?? 0} entity/entities`; });
  reg(t["delete-folder-entities"], (c, a) => c.deleteFolderEntities(body(a)),
    (r) => { const c_ = (r as { moved_count?: number }).moved_count; return `Deleted ${c_ ?? 0} entity/entities`; });
  reg(t["resolve-folder-id"], (c, a) => c.resolveFolderId(body(a)),
    (r) => { const id = (r as { id?: number }).id; return id ? `Folder ID: ${id}` : "Folder not found"; });

  // Skill Collections
  reg(t["list-skill-collections"], (c) => c.listSkillCollections(),
    (r) => { const cs = (r as { skill_collections?: unknown[] }).skill_collections; return `${cs?.length ?? 0} skill collection(s)`; });
  reg(t["create-skill-collection"], (c, a) => c.createSkillCollection(body(a)),
    (r) => { const s = (r as { skill_collection?: { name?: string; id?: string } }).skill_collection; return s ? `Skill collection "${s.name}" created (ID: ${s.id})` : "Skill collection created"; });
  reg(t["get-skill-collection"],
    (c, a) => { const { api_key: _, identifier, ...p } = a as { identifier: string; api_key?: string } & Args; return c.getSkillCollection(identifier, p); },
    (r) => { const s = (r as { skill_collection?: { name?: string }; version?: { version_number?: number } }); const name = s.skill_collection?.name ?? ""; const v = s.version?.version_number; return v !== undefined ? `Skill collection "${name}" v${v} retrieved` : `Skill collection "${name}" retrieved`; });
  reg(t["update-skill-collection"],
    (c, a) => { const { api_key: _, identifier, ...b } = a as { identifier: string; api_key?: string } & Args; return c.updateSkillCollection(identifier, b); },
    () => "Skill collection updated");
  reg(t["save-skill-collection-version"],
    (c, a) => { const { api_key: _, identifier, ...b } = a as { identifier: string; api_key?: string } & Args; return c.saveSkillCollectionVersion(identifier, b); },
    (r) => { const v = (r as { version?: { version_number?: number } }).version?.version_number; return v !== undefined ? `Version ${v} saved` : "Version saved"; });

  // Analytics
  reg(t["get-request-analytics"], (c, a) => c.getRequestAnalytics(body(a)),
    (r) => { const x = r as { totalRequests?: number; totalCost?: number }; const reqs = x.totalRequests ?? 0; const cost = x.totalCost; return cost !== undefined ? `${reqs} request(s), $${cost} total cost` : `${reqs} request(s) analyzed`; });

  // Prompt template patch
  reg(t["patch-prompt-template-version"],
    (c, a) => { const { api_key: _, identifier, ...b } = a as { identifier: string; api_key?: string } & Args; return c.patchPromptTemplateVersion(identifier, b); },
    (r) => { const v = (r as { version_number?: number }).version_number; return v !== undefined ? `Patched — new version ${v} created` : "Patched — new version created"; });
}
