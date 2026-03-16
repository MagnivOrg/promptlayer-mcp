/**
 * TypeScript types and Zod schemas for PromptLayer API
 * All schemas verified against OpenAPI spec at:
 *   https://github.com/magnivorg/prompt-layer-docs/blob/master/openapi.json
 */

import { z } from "zod";


// ── Get Prompt Template (POST /prompt-templates/{identifier}) ────────────

export const GetPromptTemplateArgsSchema = z.object({
  prompt_name: z
    .string()
    .describe("Prompt template name or ID"),
  version: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Specific version number (defaults to latest)"),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
  label: z
    .string()
    .optional()
    .describe("Release label (e.g. 'prod'). Takes precedence over version."),
  provider: z
    .enum([
      "openai", "anthropic", "amazon.bedrock", "cohere",
      "google", "huggingface", "mistral", "openai.azure", "vertexai",
    ])
    .optional()
    .describe("LLM provider to format llm_kwargs for. Overrides provider set in registry."),
  input_variables: z
    .record(z.string())
    .optional()
    .describe("Variables to fill template placeholders"),
  metadata_filters: z
    .record(z.string())
    .optional()
    .describe("Key-value filters for A/B release labels"),
  model: z
    .string()
    .optional()
    .describe("Model name for returning default parameters with llm_kwargs"),
  model_parameter_overrides: z
    .record(z.unknown())
    .optional()
    .describe("Model parameter overrides at runtime"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Prompt Template Raw (GET /prompt-templates/{identifier}) ─────────

export const GetPromptTemplateRawArgsSchema = z.object({
  identifier: z.string().describe("Prompt template name or ID"),
  version: z.number().int().optional().describe("Version number. Mutually exclusive with label."),
  label: z.string().optional().describe("Release label (e.g. 'prod'). Mutually exclusive with version."),
  resolve_snippets: z.boolean().optional().describe("Expand snippets (default true). Set false to preserve raw @@@snippet@@@ refs."),
  include_llm_kwargs: z.boolean().optional().describe("Include provider-specific LLM format (default false)."),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── List Prompt Templates (GET /prompt-templates) ────────────────────────

export const ListPromptTemplatesArgsSchema = z.object({
  page: z.number().int().optional().describe("Page number"),
  per_page: z.number().int().optional().describe("Items per page"),
  label: z.string().optional().describe("Filter by release label"),
  name: z.string().optional().describe("Filter by name (case-insensitive partial match)"),
  tags: z.union([z.string(), z.array(z.string())]).optional().describe("Filter by tag(s). Only templates whose tags contain all specified values are returned."),
  status: z.enum(["active", "deleted", "all"]).optional().describe("Filter by status (default: 'active')"),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Publish Prompt Template (POST /rest/prompt-templates) ────────────────
// OpenAPI: body = { prompt_template: BasePromptTemplate, prompt_version: PromptVersion, release_labels? }

export const PublishPromptTemplateArgsSchema = z.object({
  prompt_template: z.object({
    prompt_name: z.string().describe("Name of the prompt template"),
    tags: z.array(z.string()).optional().describe("Tags to associate"),
    folder_id: z.number().int().optional().describe("Folder ID to publish into"),
    workspace_id: z.number().int().optional().describe("Workspace ID"),
  }).describe("Template metadata: prompt_name (required), tags, folder_id, workspace_id"),
  prompt_version: z.object({
    prompt_template: z.record(z.unknown()).describe("The template content in chat ({type:'chat', messages:[...]}) or completion format"),
    commit_message: z.string().optional().describe("Commit message (max 72 chars)"),
    metadata: z.record(z.unknown()).optional().describe("Metadata including model configuration"),
    provider_base_url_name: z.string().optional().describe("Provider base URL name (max 255 chars)"),
    provider_id: z.number().int().optional().describe("Provider ID"),
    inference_client_name: z.string().optional().describe("Inference client name (max 255 chars)"),
  }).describe("Version data: prompt_template content (required), commit_message, metadata"),
  release_labels: z.array(z.string()).optional().describe("Release labels to assign (e.g. ['prod'])"),
  snippet_overrides: z.record(z.string()).optional().describe("Snippet overrides: map snippet names to replacement content"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── List Prompt Template Labels (GET /prompt-templates/{identifier}/labels)

export const ListPromptTemplateLabelsArgsSchema = z.object({
  identifier: z.string().describe("Prompt template name or ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Prompt Label (POST /prompts/{prompt_id}/label) ────────────────
// OpenAPI: body = { prompt_version_number: int, name: str }

export const CreatePromptLabelArgsSchema = z.object({
  prompt_id: z.number().int().describe("The prompt ID (path parameter)"),
  prompt_version_number: z.number().int().optional().describe("The version number to attach the label to (provide this or prompt_version_id)"),
  prompt_version_id: z.number().int().optional().describe("The version ID to attach the label to (provide this or prompt_version_number)"),
  name: z.string().describe("The label name (e.g. 'prod', 'staging')"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Move Prompt Label (PATCH /prompt-labels/{prompt_label_id}) ──────────
// OpenAPI: body = { prompt_version_number: int }

export const MovePromptLabelArgsSchema = z.object({
  prompt_label_id: z.number().int().describe("The prompt label ID to move"),
  prompt_version_number: z.number().int().optional().describe("Target version number to move the label to (provide this or prompt_version_id)"),
  prompt_version_id: z.number().int().optional().describe("Target version ID to move the label to (provide this or prompt_version_number)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Delete Prompt Label (DELETE /prompt-labels/{prompt_label_id}) ────────

export const DeletePromptLabelArgsSchema = z.object({
  prompt_label_id: z.number().int().describe("The prompt label ID to delete"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Snippet Usage (GET /prompt-templates/{identifier}/snippet-usage) ─

export const GetSnippetUsageArgsSchema = z.object({
  identifier: z.string().describe("Prompt template name or ID"),
  prompt_version_number: z.number().int().optional().describe("Filter by specific version number"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


// ── Log Request (POST /log-request) ──────────────────────────────────────
// NOTE: OpenAPI defines input/output as oneOf(ChatPrompt, CompletionPrompt).
// We use z.record(z.unknown()) because the MCP tool passes them through as-is;
// the PromptLayer server validates the discriminated union, not us.
// This is tracked as a known exception in scripts/diff-endpoints.ts.

export const LogRequestArgsSchema = z.object({
  provider: z.string().describe("LLM provider (e.g. 'openai', 'anthropic')"),
  model: z.string().describe("Model name (e.g. 'gpt-4o', 'claude-3-7-sonnet-20250219')"),
  input: z.record(z.unknown()).describe("Input in Prompt Blueprint format: {type:'chat', messages:[{role, content:[{type:'text', text}]}]}"),
  output: z.record(z.unknown()).describe("Output in Prompt Blueprint format: {type:'chat', messages:[{role:'assistant', content:[{type:'text', text}]}]}"),
  request_start_time: z.string().describe("ISO 8601 datetime when request started"),
  request_end_time: z.string().describe("ISO 8601 datetime when response received"),
  parameters: z.record(z.unknown()).optional().describe("Model parameters (temperature, max_tokens, response_format, etc.)"),
  tags: z.array(z.string()).optional().describe("Tags for categorizing the request"),
  score_name: z.string().optional().describe("Score name (for named scores, e.g. 'relevance')"),
  metadata: z.record(z.string()).optional().describe("Custom key-value metadata for search/filtering"),
  prompt_name: z.string().optional().describe("Prompt template name to associate"),
  prompt_id: z.number().int().optional().describe("Prompt template ID to associate"),
  prompt_version_number: z.number().int().optional().describe("Prompt template version number"),
  prompt_input_variables: z.record(z.unknown()).optional().describe("Variables used to format the prompt"),
  input_tokens: z.number().int().optional().describe("Number of input tokens"),
  output_tokens: z.number().int().optional().describe("Number of output tokens"),
  price: z.number().optional().describe("Cost of the request"),
  function_name: z.string().optional().describe("Name of the function called"),
  score: z.number().int().optional().describe("Score between 0-100"),
  api_type: z.string().optional().describe("API type for openai/azure (e.g. 'chat-completions', 'responses')"),
  status: z.enum(["SUCCESS", "WARNING", "ERROR"]).optional().describe("Request status (default: SUCCESS)"),
  error_type: z.enum([
    "PROVIDER_TIMEOUT", "PROVIDER_QUOTA_LIMIT", "PROVIDER_RATE_LIMIT",
    "PROVIDER_AUTH_ERROR", "PROVIDER_ERROR", "TEMPLATE_RENDER_ERROR",
    "VARIABLE_MISSING_OR_EMPTY", "UNKNOWN_ERROR",
  ]).optional().describe("Error type (only when status is ERROR or WARNING)"),
  error_message: z.string().optional().describe("Error message (max 1024 chars)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Spans Bulk (POST /spans-bulk) ─────────────────────────────────

export const CreateSpansBulkArgsSchema = z.object({
  spans: z.array(z.record(z.unknown())).describe("Array of span objects (each with name, context, kind, start_time, end_time, status, attributes, resource; optional: parent_id, log_request)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


// ── List Datasets (GET /api/public/v2/datasets) ──────────────────────────

export const ListDatasetsArgsSchema = z.object({
  page: z.number().int().optional().describe("Page number (default: 1)"),
  per_page: z.number().int().optional().describe("Items per page (default: 10)"),
  name: z.string().optional().describe("Filter by dataset group name (case-insensitive partial match)"),
  status: z.enum(["active", "deleted", "all"]).optional().describe("Filter by status (default: 'active')"),
  dataset_group_id: z.number().int().optional().describe("Filter by dataset group ID"),
  prompt_id: z.number().int().optional().describe("Filter by prompt ID"),
  prompt_version_id: z.number().int().optional().describe("Filter by prompt version ID"),
  prompt_label_id: z.number().int().optional().describe("Filter by prompt label ID"),
  report_id: z.number().int().optional().describe("Filter by report ID"),
  workspace_id: z.number().int().optional().describe("Filter by workspace ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Dataset Group (POST /api/public/v2/dataset-groups) ────────────

export const CreateDatasetGroupArgsSchema = z.object({
  name: z.string().optional().describe("Dataset group name (unique within workspace). Auto-generated if omitted."),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
  folder_id: z.number().int().optional().describe("Folder ID to place the dataset group into"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Dataset Version from File (POST /api/public/v2/dataset-versions/from-file)

export const CreateDatasetVersionFromFileArgsSchema = z.object({
  dataset_group_id: z.number().int().describe("Dataset group ID"),
  file_name: z.string().describe("File name with extension (e.g. 'data.csv' or 'data.json')"),
  file_content_base64: z.string().describe("Base64-encoded file content"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Dataset Version from Filter Params (POST /api/public/v2/dataset-versions/from-filter-params)

export const CreateDatasetVersionFromFilterParamsArgsSchema = z.object({
  dataset_group_id: z.number().int().describe("Dataset group ID"),
  variables_to_parse: z.array(z.string()).optional().describe("Variables to extract from request logs"),
  prompt_id: z.number().int().optional().describe("Filter by prompt template ID"),
  prompt_version_id: z.number().int().optional().describe("Filter by prompt version ID"),
  prompt_label_id: z.number().int().optional().describe("Filter by prompt label ID"),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
  tags: z.array(z.string()).optional().describe("Filter by tags (simple tag filter)"),
  metadata: z.record(z.string()).optional().describe("Simple metadata key-value filter"),
  start_time: z.string().optional().describe("Start time filter (ISO 8601)"),
  end_time: z.string().optional().describe("End time filter (ISO 8601)"),
  id: z.number().int().optional().describe("Filter by specific request log ID"),
  limit: z.number().int().optional().describe("Limit number of request logs to pull"),
  tags_and: z.array(z.string()).optional().describe("Filter by tags (AND logic — all must match)"),
  tags_or: z.array(z.string()).optional().describe("Filter by tags (OR logic — any can match)"),
  metadata_and: z.array(z.object({ key: z.string(), value: z.string() })).optional().describe("Metadata filters with AND logic (all must match). Each item: {key, value}"),
  metadata_or: z.array(z.object({ key: z.string(), value: z.string() })).optional().describe("Metadata filters with OR logic (any can match). Each item: {key, value}"),
  scores: z.array(z.object({
    name: z.string().describe("Score name"),
    operator: z.enum([">", "<", ">=", "<=", "="]).describe("Comparison operator"),
    value: z.number().int().describe("Score value to compare against"),
  })).optional().describe("Filter by score criteria. Each item: {name, operator, value}"),
  prompt_templates_include: z.array(z.object({
    name: z.string().describe("Prompt template name"),
    version_numbers: z.array(z.number().int()).optional().describe("Filter to specific version numbers"),
    labels: z.array(z.string()).optional().describe("Filter to specific labels"),
  })).optional().describe("Include request logs matching these prompt templates"),
  prompt_templates_exclude: z.array(z.object({
    name: z.string().describe("Prompt template name"),
    version_numbers: z.array(z.number().int()).optional().describe("Filter to specific version numbers"),
    labels: z.array(z.string()).optional().describe("Filter to specific labels"),
  })).optional().describe("Exclude request logs matching these prompt templates"),
  starred: z.boolean().optional().describe("Filter by starred status"),
  status: z.array(z.enum(["SUCCESS", "WARNING", "ERROR"])).optional().describe("Filter by request log status"),
  sort_by: z.enum([
    "request_start_time", "input_tokens", "output_tokens", "price",
    "score", "latency", "prompt_name", "status",
  ]).optional().describe("Sort field"),
  sort_order: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
  order_by_random: z.boolean().optional().describe("Random ordering (requires limit)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


// ── List Evaluations (GET /api/public/v2/evaluations) ────────────────────

export const ListEvaluationsArgsSchema = z.object({
  page: z.number().int().optional().describe("Page number (default: 1)"),
  per_page: z.number().int().optional().describe("Items per page (default: 10)"),
  name: z.string().optional().describe("Filter by name (case-insensitive partial match)"),
  status: z.enum(["active", "deleted", "all"]).optional().describe("Filter by status (default: 'active')"),
  workspace_id: z.number().int().optional().describe("Filter by workspace ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Evaluation Pipeline / Report (POST /reports) ──────────────────

export const CreateReportArgsSchema = z.object({
  dataset_group_id: z.number().int().describe("Dataset group ID"),
  name: z.string().optional().describe("Pipeline name (auto-generated if omitted)"),
  folder_id: z.number().int().optional().describe("Folder ID for organization"),
  dataset_version_number: z.number().int().optional().describe("Dataset version (uses latest if omitted)"),
  columns: z.array(z.record(z.unknown())).optional().describe("Evaluation columns (each: column_type, name, configuration)"),
  score_configuration: z.record(z.unknown()).optional().describe("Custom scoring logic configuration"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Run Evaluation (POST /reports/{report_id}/run) ───────────────────────

export const RunReportArgsSchema = z.object({
  report_id: z.number().int().describe("Evaluation pipeline ID"),
  name: z.string().describe("Name for this evaluation run"),
  dataset_id: z.number().int().optional().describe("Override dataset ID"),
  refresh_dataset: z.boolean().optional().describe("Refresh the dataset before running"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Evaluation (GET /reports/{report_id}) ────────────────────────────

export const GetReportArgsSchema = z.object({
  report_id: z.number().int().describe("Evaluation pipeline ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Evaluation Score (GET /reports/{report_id}/score) ────────────────

export const GetReportScoreArgsSchema = z.object({
  report_id: z.number().int().describe("Evaluation pipeline ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Configure Custom Scoring (PATCH /reports/{report_id}/score-card) ─────
// NOTE: This endpoint is in the PromptLayer reference docs but NOT in the
// OpenAPI spec. Tracked as a known exception in scripts/diff-endpoints.ts.
// See: https://docs.promptlayer.com/reference/update-report-score-card

export const UpdateReportScoreCardArgsSchema = z.object({
  report_id: z.number().int().describe("Evaluation pipeline ID"),
  column_names: z.array(z.string()).describe("Column names to include in score"),
  code: z.string().optional().describe("Custom Python/JavaScript code for score calculation"),
  code_language: z.enum(["PYTHON", "JAVASCRIPT"]).optional().describe("Code language (default: PYTHON)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Delete Reports by Name (DELETE /reports/name/{report_name}) ──────────

export const DeleteReportsByNameArgsSchema = z.object({
  report_name: z.string().describe("Name of reports to archive"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


// ── List Agents (GET /workflows) ─────────────────────────────────────────

export const ListWorkflowsArgsSchema = z.object({
  page: z.number().int().optional().describe("Page number (default: 1)"),
  per_page: z.number().int().optional().describe("Items per page (default: 30)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Agent (POST /rest/workflows) ──────────────────────────────────

export const CreateWorkflowArgsSchema = z.object({
  name: z.string().optional().describe("Name for a new agent. Cannot be used with workflow_id or workflow_name."),
  workflow_id: z.number().int().optional().describe("Existing agent ID to create a new version for"),
  workflow_name: z.string().optional().describe("Existing agent name to create a new version for"),
  folder_id: z.number().int().optional().describe("Folder ID"),
  commit_message: z.string().optional().describe("Version commit message"),
  nodes: z.array(z.record(z.unknown())).describe("Node configs (each: name, node_type, configuration, is_output_node required; dependencies optional)"),
  required_input_variables: z.record(z.string()).optional().describe("Input variable names to types, e.g. {user_query: 'string'}"),
  edges: z.array(z.record(z.unknown())).optional().describe("Conditional connections between nodes"),
  release_labels: z.array(z.string()).optional().describe("Release labels (e.g. ['production'])"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Update Agent / PATCH (PATCH /rest/workflows/{workflow_id_or_name}) ───

export const PatchWorkflowArgsSchema = z.object({
  workflow_id_or_name: z.string().describe("Agent ID or name (path parameter)"),
  base_version: z.number().int().optional().describe("Version to base changes on (defaults to latest)"),
  commit_message: z.string().optional().describe("Version commit message"),
  nodes: z.record(z.unknown()).optional().describe("Node updates keyed by name. Set value to null to remove a node."),
  required_input_variables: z.record(z.string()).optional().describe("Replaces input variables entirely if provided"),
  edges: z.array(z.record(z.unknown())).optional().describe("Replaces edges entirely if provided"),
  release_labels: z.array(z.string()).optional().describe("Labels for the new version"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Run Agent (POST /workflows/{workflow_name}/run) ──────────────────────

export const RunWorkflowArgsSchema = z.object({
  workflow_name: z.string().describe("Agent name (path parameter)"),
  input_variables: z.record(z.unknown()).optional().describe("Input variables for the agent"),
  workflow_version_number: z.number().int().optional().describe("Version number to run (defaults to latest)"),
  workflow_label_name: z.string().optional().describe("Release label to run (e.g. 'prod')"),
  metadata: z.record(z.string()).optional().describe("Metadata to attach to the execution"),
  return_all_outputs: z.boolean().optional().describe("Return all node outputs (default: false, returns only final output)"),
  // NOTE: callback_url is in the reference docs but not the OpenAPI spec.
  // Tracked as a known exception in scripts/diff-endpoints.ts.
  callback_url: z.string().optional().describe("Webhook URL for async results. Returns 202 immediately, POSTs results on completion."),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Agent Version Execution Results (GET /workflow-version-execution-results)

export const GetWorkflowVersionExecutionResultsArgsSchema = z.object({
  workflow_version_execution_id: z.number().int().describe("Execution ID to retrieve results for"),
  return_all_outputs: z.boolean().optional().describe("Include all output nodes (default: false)"),
  workflow_node_id: z.number().int().optional().describe("Filter results to a specific node by ID"),
  workflow_node_name: z.string().optional().describe("Filter results to a specific node by name"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


// ── Get Agent (GET /workflows/{workflow_id_or_name}) ─────────────────────

export const GetWorkflowArgsSchema = z.object({
  workflow_id_or_name: z.string().describe("Agent ID or name"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


export const CreateFolderArgsSchema = z.object({
  name: z.string().describe("Folder name (unique within parent)"),
  parent_id: z.number().int().optional().describe("Parent folder ID (root if omitted)"),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Edit Folder (PATCH /api/public/v2/folders/{folder_id}) ───────────────
// NOTE: Not yet in the OpenAPI spec. Added from backend source (PR #244).
// Tracked as a known exception in scripts/diff-endpoints.ts.

export const EditFolderArgsSchema = z.object({
  folder_id: z.number().int().describe("Folder ID to rename"),
  name: z.string().describe("New folder name (1-255 chars, unique within parent)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Folder Entities (GET /api/public/v2/folders/entities) ────────────
// NOTE: Not yet in the OpenAPI spec. Added from backend source.
// Tracked as a known exception in scripts/diff-endpoints.ts.

const EntityTypeEnum = z.enum([
  "FOLDER", "PROMPT", "SNIPPET", "WORKFLOW", "DATASET", "REPORT", "AB_TEST", "INPUT_VARIABLE_SET",
]);

export const GetFolderEntitiesArgsSchema = z.object({
  folder_id: z.number().int().optional().describe("Folder ID to list (root if omitted)"),
  filter_type: z.union([EntityTypeEnum, z.array(EntityTypeEnum)]).optional().describe("Entity type(s) to include (default: all)"),
  search_query: z.string().optional().describe("Search by name (case-insensitive partial match). For prompts, also searches across prompt version content."),
  semantic_search: z.boolean().optional().describe("Enable semantic (vector) search instead of text matching. Requires search_query to be set. Currently supports prompts and folders."),
  semantic_search_top_k: z.number().int().optional().describe("Max results from semantic search (default: 100, range: 1-500)"),
  semantic_search_threshold: z.number().optional().describe("Max distance threshold for semantic search results (range: (0, 2])"),
  tags: z.array(z.string()).optional().describe("Filter entities by tags (AND logic — all must match). Applies to prompts, workflows, datasets, evaluations."),
  flatten: z.boolean().optional().describe("Flatten nested folder hierarchy (default: false)"),
  include_metadata: z.boolean().optional().describe("Include entity metadata like latest_version_number (default: false)"),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Move Folder Entities (POST /api/public/v2/folders/entities) ──────────
// NOTE: Not yet in the OpenAPI spec. Added from backend source.
// Tracked as a known exception in scripts/diff-endpoints.ts.

export const MoveFolderEntitiesArgsSchema = z.object({
  entities: z.array(z.object({
    id: z.number().int().describe("Entity ID"),
    type: EntityTypeEnum.describe("Entity type"),
  })).describe("Entities to move"),
  folder_id: z.number().int().optional().describe("Target folder ID (root if omitted)"),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Delete Folder Entities (DELETE /api/public/v2/folders/entities) ───────
// NOTE: Not yet in the OpenAPI spec. Added from backend source.
// Tracked as a known exception in scripts/diff-endpoints.ts.

export const DeleteFolderEntitiesArgsSchema = z.object({
  entities: z.array(z.object({
    id: z.number().int().describe("Entity ID"),
    type: EntityTypeEnum.describe("Entity type"),
  })).describe("Entities to delete"),
  cascade: z.boolean().optional().describe("Delete folder contents recursively (default: false)"),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Resolve Folder ID (GET /api/public/v2/folders/resolve-id) ────────────
// NOTE: Not yet in the OpenAPI spec. Added from backend source.
// Tracked as a known exception in scripts/diff-endpoints.ts.

export const ResolveFolderIdArgsSchema = z.object({
  path: z.string().describe("Folder path to resolve (e.g. 'foo/bar')"),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


// ── Search Request Logs (POST /api/public/v2/requests/search) ────────────
// NOTE: The StructuredFilter and StructuredFilterGroup schemas use loose types
// (z.unknown()) for value/filters because the backend validates operator-field
// compatibility at runtime. This is tracked as a known exception in scripts/diff-endpoints.ts.

const StructuredFilterSchema = z.object({
  field: z.enum([
    "pl_id", "prompt_id", "engine", "provider_type", "input_text", "output_text",
    "prompt_version_number", "input_tokens", "output_tokens", "cost", "latency_ms",
    "request_start_time", "request_end_time", "status",
    "is_json", "is_tool_call", "is_plain_text",
    "tags", "metadata_keys", "metadata", "tool_names",
    "output", "output_keys", "input_variables", "input_variable_keys",
  ]).describe("Request log field to filter on"),
  operator: z.enum([
    "is", "is_not", "in", "not_in",
    "contains", "not_contains", "starts_with", "ends_with",
    "eq", "neq", "gt", "gte", "lt", "lte", "between",
    "before", "after",
    "is_true", "is_false", "is_empty", "is_not_empty",
    "is_null", "is_not_null",
    "key_equals", "key_not_equals", "key_contains",
  ]).describe("Filter operator (availability depends on field type)"),
  value: z.unknown().optional().describe("Filter value (type depends on operator)"),
  nested_key: z.string().optional().describe("Key name for nested field operators (metadata, output, input_variables)"),
});

const StructuredFilterGroupSchema: z.ZodType = z.object({
  logic: z.enum(["AND", "OR"]).optional().describe("Logical operator (default: AND)"),
  filters: z.array(z.union([StructuredFilterSchema, z.lazy(() => StructuredFilterGroupSchema)])).describe("Filters or nested filter groups"),
});

export const SearchRequestLogsArgsSchema = z.object({
  filters: z.array(StructuredFilterSchema).optional().describe("Structured filters (combined with AND logic)"),
  filter_group: StructuredFilterGroupSchema.optional().describe("Filter group with AND/OR logic, supports nesting"),
  q: z.string().optional().describe("Free-text search across prompt input and LLM output"),
  page: z.number().int().optional().describe("Page number (default: 1)"),
  per_page: z.number().int().optional().describe("Items per page (max: 25)"),
  sort_by: z.enum(["request_start_time", "input_tokens", "output_tokens", "cost", "latency_ms", "status"]).optional().describe("Sort field"),
  sort_order: z.enum(["asc", "desc"]).optional().describe("Sort direction (must be provided with sort_by)"),
  include_prompt_name: z.boolean().optional().describe("Include prompt template name in results"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Request (GET /api/public/v2/requests/{request_id}) ───────────────

export const GetRequestArgsSchema = z.object({
  request_id: z.number().int().describe("Request ID to retrieve"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


export type GetPromptTemplateParams = Omit<
  z.infer<typeof GetPromptTemplateArgsSchema>,
  "prompt_name" | "api_key"
>;
export type ListPromptTemplatesParams = Omit<
  z.infer<typeof ListPromptTemplatesArgsSchema>,
  "api_key"
>;


export const TOOL_DEFINITIONS = {
  // ── Prompt Templates ────────────────────────────────────────────────
  "get-prompt-template": {
    name: "get-prompt-template",
    description:
      "Retrieve a fully rendered prompt ready to send to an LLM. Fills in input_variables, resolves " +
      "snippets, and returns provider-formatted parameters. Use label (e.g. 'prod') or version number " +
      "to pin a specific version; defaults to latest. " +
      "WARNING: Snippets are baked into the output — @@@snippet@@@ references are lost. " +
      "Do NOT use this for editing and re-publishing prompts. Use get-prompt-template-raw instead.",
    inputSchema: GetPromptTemplateArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-prompt-template-raw": {
    name: "get-prompt-template-raw",
    description:
      "Retrieve prompt template data for inspection or editing. Does not apply input variables. " +
      "IMPORTANT: Set resolve_snippets=false to preserve @@@snippet_name@@@ references — " +
      "this is required if you plan to edit and re-publish the prompt, otherwise snippet references " +
      "will be lost. The response includes a 'snippets' array listing all referenced snippets. " +
      "Set include_llm_kwargs=true to also get provider-specific parameters.",
    inputSchema: GetPromptTemplateRawArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "list-prompt-templates": {
    name: "list-prompt-templates",
    description: "List all prompt templates in the workspace with pagination. Filter by name, release label, or status.",
    inputSchema: ListPromptTemplatesArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "publish-prompt-template": {
    name: "publish-prompt-template",
    description:
      "Create a new version of a prompt template. " +
      "Body has two required objects: prompt_template (with prompt_name, tags, folder_id) and " +
      "prompt_version (with prompt_template content in chat/completion format, commit_message, metadata). " +
      "Optionally assign release_labels. " +
      "IMPORTANT: If the prompt uses snippets, preserve @@@snippet_name@@@ markers in the content. " +
      "Do not inline snippet text — this breaks snippet references.",
    inputSchema: PublishPromptTemplateArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "list-prompt-template-labels": {
    name: "list-prompt-template-labels",
    description: "List all release labels assigned to a prompt template.",
    inputSchema: ListPromptTemplateLabelsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-prompt-label": {
    name: "create-prompt-label",
    description: "Attach a release label to a prompt template version. Requires prompt_id (path) and body with prompt_version_number and label name.",
    inputSchema: CreatePromptLabelArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "move-prompt-label": {
    name: "move-prompt-label",
    description: "Move a release label to a different prompt version. Provide prompt_version_number to reassign the label.",
    inputSchema: MovePromptLabelArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-prompt-label": {
    name: "delete-prompt-label",
    description: "Delete a release label from a prompt template version.",
    inputSchema: DeletePromptLabelArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-snippet-usage": {
    name: "get-snippet-usage",
    description: "Find all prompts that reference a given snippet. Returns prompt names, versions, and labels that use it.",
    inputSchema: GetSnippetUsageArgsSchema,
    annotations: { readOnlyHint: true },
  },

  // ── Request Logs ──────────────────────────────────────────────────
  "search-request-logs": {
    name: "search-request-logs",
    description:
      "Search and filter request logs using structured filters, free-text search, and sorting. " +
      "Rate limited to 10 req/min, max 25 results/page.\n\n" +
      "FILTER SYNTAX: Each filter is {field, operator, value, nested_key?}.\n" +
      "Operators by field type:\n" +
      "  - String fields (engine, provider_type): is, is_not, in, not_in\n" +
      "  - Text fields (input_text, output_text): contains, not_contains, starts_with, ends_with\n" +
      "  - Numeric fields (cost, latency_ms, input_tokens, output_tokens): eq, neq, gt, gte, lt, lte, between (value=[min,max]), is_null, is_not_null\n" +
      "  - Datetime fields (request_start_time, request_end_time): is, before, after, between (value=[start,end] as ISO 8601)\n" +
      "  - Boolean fields (is_json, is_tool_call, is_plain_text): is_true, is_false\n" +
      "  - Array fields (tags, metadata_keys, tool_names, output_keys, input_variable_keys): contains, not_contains, in, not_in, is_empty, is_not_empty\n" +
      "  - Nested fields (metadata, output, input_variables): key_equals, key_not_equals, key_contains, in, not_in, is_empty, is_not_empty — requires nested_key\n\n" +
      "EXAMPLES:\n" +
      '  Find GPT-4o requests: {filters: [{field:"engine", operator:"is", value:"gpt-4o"}]}\n' +
      '  Expensive requests: {filters: [{field:"cost", operator:"gte", value:0.10}]}\n' +
      '  By metadata: {filters: [{field:"metadata", operator:"key_equals", value:"customer_123", nested_key:"user_id"}]}\n' +
      '  Free-text search: {q: "refund policy"}\n' +
      '  Complex AND/OR: {filter_group: {logic:"OR", filters: [{field:"tags", operator:"contains", value:"prod"}, {logic:"AND", filters: [...]}]}}',
    inputSchema: SearchRequestLogsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-request": {
    name: "get-request",
    description:
      "Retrieve a single request's full payload by ID, returned as a prompt blueprint. " +
      "Includes the prompt template content, model configuration, provider, token counts, " +
      "cost, and timing data. Useful for debugging, replaying requests, or extracting data for evaluations.",
    inputSchema: GetRequestArgsSchema,
    annotations: { readOnlyHint: true },
  },

  // ── Tracking ────────────────────────────────────────────────────────
  "log-request": {
    name: "log-request",
    description:
      "Log an LLM request/response pair to PromptLayer. Input and output must be in Prompt Blueprint " +
      "format: {type:'chat', messages:[{role, content:[{type:'text', text}]}]}. " +
      "Supports structured outputs, tool calls, extended thinking, and error tracking.",
    inputSchema: LogRequestArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "create-spans-bulk": {
    name: "create-spans-bulk",
    description: "Create OpenTelemetry-compatible spans in bulk for distributed tracing. Each span can optionally include a log_request.",
    inputSchema: CreateSpansBulkArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Datasets ────────────────────────────────────────────────────────
  "list-datasets": {
    name: "list-datasets",
    description: "List datasets with pagination. Filter by name, status, dataset_group_id, prompt_id, report_id, etc.",
    inputSchema: ListDatasetsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-dataset-group": {
    name: "create-dataset-group",
    description: "Create a dataset group. An empty draft version (version_number=-1) is created automatically. Names must be unique per workspace.",
    inputSchema: CreateDatasetGroupArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "create-dataset-version-from-file": {
    name: "create-dataset-version-from-file",
    description: "Create a dataset version by uploading base64-encoded CSV/JSON content. Processed asynchronously. Max 100MB.",
    inputSchema: CreateDatasetVersionFromFileArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "create-dataset-version-from-filter-params": {
    name: "create-dataset-version-from-filter-params",
    description: "Create a dataset version from request log history using filter criteria. Populated asynchronously.",
    inputSchema: CreateDatasetVersionFromFilterParamsArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Evaluations ─────────────────────────────────────────────────────
  "list-evaluations": {
    name: "list-evaluations",
    description: "List evaluation pipelines (called 'reports' in the API) with pagination. Filter by name, status, workspace_id.",
    inputSchema: ListEvaluationsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-report": {
    name: "create-report",
    description: "Create an evaluation pipeline (called 'report' in the API) linked to a dataset group. The recommended approach is to add LLM assertion columns that use a language model to score each row. For all available column types, search the PromptLayer docs or visit https://docs.promptlayer.com/features/evaluations/column-types.",
    inputSchema: CreateReportArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "run-report": {
    name: "run-report",
    description: "Execute an evaluation pipeline. Runs all columns against the dataset and produces scores. Name is required.",
    inputSchema: RunReportArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-report": {
    name: "get-report",
    description: "Get evaluation pipeline details including columns and configuration. Use get-report-score for the computed score.",
    inputSchema: GetReportArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-report-score": {
    name: "get-report-score",
    description: "Get the computed score for an evaluation pipeline.",
    inputSchema: GetReportScoreArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "update-report-score-card": {
    name: "update-report-score-card",
    description: "Configure custom scoring for an evaluation pipeline. Specify which column_names contribute to the score, with optional custom code.",
    inputSchema: UpdateReportScoreCardArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-reports-by-name": {
    name: "delete-reports-by-name",
    description: "Archive all evaluation pipelines matching the given name.",
    inputSchema: DeleteReportsByNameArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Agents / Workflows ──────────────────────────────────────────────
  "list-workflows": {
    name: "list-workflows",
    description: "List all agents (called 'workflows' in the API) in the workspace with pagination.",
    inputSchema: ListWorkflowsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-workflow": {
    name: "create-workflow",
    description: "Create a new agent (called 'workflow' in the API) or a new version of an existing one. For new: use 'name'. For versioning: use workflow_id or workflow_name.",
    inputSchema: CreateWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "patch-workflow": {
    name: "patch-workflow",
    description: "Partially update an agent. Merges node changes into a new version. Set a node value to null to remove it.",
    inputSchema: PatchWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "run-workflow": {
    name: "run-workflow",
    description: "Execute an agent by name. Returns results synchronously, or returns immediately with an execution ID if callback_url is set for async webhook delivery.",
    inputSchema: RunWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-workflow-version-execution-results": {
    name: "get-workflow-version-execution-results",
    description: "Poll for agent execution results by execution ID. Returns results when complete, or indicates still running.",
    inputSchema: GetWorkflowVersionExecutionResultsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-workflow": {
    name: "get-workflow",
    description: "Get a single agent (called 'workflow' in the API) by ID or name. Returns the agent details and configuration.",
    inputSchema: GetWorkflowArgsSchema,
    annotations: { readOnlyHint: true },
  },

  // ── Folders ─────────────────────────────────────────────────────────
  "create-folder": {
    name: "create-folder",
    description: "Create a folder for organizing resources. Nest with parent_id. Names unique within parent.",
    inputSchema: CreateFolderArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "edit-folder": {
    name: "edit-folder",
    description: "Rename a folder. Name must be unique within the parent folder.",
    inputSchema: EditFolderArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-folder-entities": {
    name: "get-folder-entities",
    description: "List entities (prompts, agents, datasets, evaluations, folders, etc.) in a folder. Returns root-level entities if folder_id is omitted. Use flatten=true to include all nested contents. Supports search and type filtering.",
    inputSchema: GetFolderEntitiesArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "move-folder-entities": {
    name: "move-folder-entities",
    description: "Move entities (prompts, agents, datasets, evaluations, folders) into a target folder. Omit folder_id to move to workspace root.",
    inputSchema: MoveFolderEntitiesArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-folder-entities": {
    name: "delete-folder-entities",
    description: "Permanently delete entities (prompts, agents, datasets, evaluations, folders). WARNING: This is destructive and cannot be undone. Use cascade=true to recursively delete all folder contents.",
    inputSchema: DeleteFolderEntitiesArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "resolve-folder-id": {
    name: "resolve-folder-id",
    description: "Resolve a folder path (e.g. 'foo/bar') to a folder ID.",
    inputSchema: ResolveFolderIdArgsSchema,
    annotations: { readOnlyHint: true },
  },
} as const;
