import type { GetPromptTemplateParams, ListPromptTemplatesParams } from "./types.js";
import { TOOL_DEFINITIONS } from "./types.js";
import { createToolHandler } from "./utils.js";

type Args = Record<string, unknown> & { api_key?: string };
function body(args: Args) { const { api_key: _, ...rest } = args; return rest; }

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

  // Tracking
  reg(t["log-request"], (c, a) => c.logRequest(body(a)),
    (r) => { const id = (r as { request_id?: unknown }).request_id; return id ? `Logged (ID: ${id})` : "Logged"; });
  reg(t["create-spans-bulk"], (c, a) => c.createSpansBulk(body(a)),
    (r) => `Created ${(r as { spans?: unknown[] }).spans?.length ?? 0} span(s)`);

  // Datasets
  reg(t["list-datasets"], (c, a) => c.listDatasets(body(a)),
    (r) => { const { datasets, total } = r as { datasets?: unknown[]; total?: number }; return `${datasets?.length ?? 0} dataset(s) (total: ${total ?? "?"})`; });
  reg(t["create-dataset-group"], (c, a) => c.createDatasetGroup(body(a)), () => "Dataset group created");
  reg(t["create-dataset-version-from-file"], (c, a) => c.createDatasetVersionFromFile(body(a)), () => "Dataset version from file initiated");
  reg(t["create-dataset-version-from-filter-params"], (c, a) => c.createDatasetVersionFromFilterParams(body(a)), () => "Dataset version from history initiated");
  reg(t["get-dataset-rows"],
    (c, a) => { const { api_key: _, dataset_id, ...p } = a as { dataset_id: number; api_key?: string } & Args; return c.getDatasetRows(dataset_id, p); },
    (r) => { const { rows, total, page, pages } = r as { rows?: unknown[]; total?: number; page?: number; pages?: number }; return `${rows?.length ?? 0} row(s) (page ${page ?? 1}/${pages ?? 1}, total ${total ?? "?"})`; });

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
}
