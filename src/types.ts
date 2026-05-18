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
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Publish Prompt Template (POST /rest/prompt-templates) ────────────────
// OpenAPI: body = { prompt_template: BasePromptTemplate, prompt_version: PromptVersion, release_labels? }

export const PublishPromptTemplateArgsSchema = z.object({
  prompt_template: z.object({
    prompt_name: z.string().describe("Name of the prompt template"),
    tags: z.array(z.string()).optional().describe("Tags to associate"),
    folder_id: z.number().int().optional().describe("Folder ID to publish into"),
    is_snippet: z.boolean().optional().describe(
      "Mark this template as a reusable snippet (referenced via @@@name@@@ in other prompts). " +
      "Only takes effect when the prompt is first created — publishing a new version of an " +
      "existing template will not flip this flag."
    ),
  }).describe("Template metadata: prompt_name (required), tags, folder_id, is_snippet"),
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
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Dataset Group (POST /api/public/v2/dataset-groups) ────────────

export const CreateDatasetGroupArgsSchema = z.object({
  name: z.string().optional().describe("Dataset group name (unique within workspace). Auto-generated if omitted."),
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

// ── Structured filter primitives (shared by request search + dataset-from-history) ──
// NOTE: value/filters use loose types (z.unknown()) because the backend validates
// operator-field compatibility at runtime. This is tracked as a known exception in
// scripts/diff-endpoints.ts.

const StructuredFilterSchema = z.object({
  field: z.enum([
    "pl_id", "prompt_id", "engine", "provider_type", "input_text", "output_text",
    "prompt_version_number", "input_tokens", "output_tokens", "cost", "latency_ms",
    "request_start_time", "request_end_time", "status",
    "is_json", "is_tool_call", "is_plain_text", "has_trace",
    "tags", "metadata_keys", "metadata", "tool_names",
    "output", "output_keys", "input_variables", "input_variable_keys",
    "turn_count", "tool_call_count",
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

// ── Create Dataset Version from Filter Params (POST /api/public/v2/dataset-versions/from-filter-params)

export const CreateDatasetVersionFromFilterParamsArgsSchema = z.object({
  dataset_group_id: z.number().int().describe("Dataset group ID to create the new version under"),
  request_log_ids: z.array(z.number().int().positive()).optional().describe(
    "Static snapshot mode: pin the dataset to an explicit list of request log IDs (capped at 50,000). " +
    "≤50 IDs run synchronously; >50 are processed asynchronously. " +
    "Datasets created this way are not refreshable."
  ),
  filter_group: StructuredFilterGroupSchema.optional().describe(
    "Structured filter mode: same shape as search-request-logs (AND/OR groups of field/operator/value filters). " +
    "Always processed asynchronously. Persisted on the dataset so refresh_dataset can replay it."
  ),
  q: z.string().optional().describe("Free-text search query applied alongside filter_group"),
  sort_by: z.enum([
    "request_start_time", "input_tokens", "output_tokens", "cost",
    "latency_ms", "status", "turn_count", "tool_call_count",
  ]).optional().describe("Sort field"),
  sort_order: z.enum(["asc", "desc"]).optional().describe("Sort direction (defaults to desc when sort_by is set)"),
  variables_to_parse: z.array(z.string()).optional().describe("Input variable names to extract as dataset columns"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


// ── Get Dataset Rows (GET /api/public/v2/datasets/{dataset_id}/rows) ─────

export const GetDatasetRowsArgsSchema = z.object({
  dataset_id: z.number().int().describe("The ID of the dataset to retrieve rows from"),
  page: z.number().int().optional().describe("Page number (default: 1)"),
  per_page: z.number().int().optional().describe("Rows per page (default: 10, max: 100)"),
  q: z.string().optional().describe("Search query for filtering rows"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Draft Dataset Version (POST /api/public/v2/dataset-versions/create-draft) ─────

export const CreateDraftDatasetVersionArgsSchema = z.object({
  dataset_group_id: z.number().int().describe("ID of the dataset group to create a draft version for"),
  source_dataset_id: z.number().int().optional().describe("Optional ID of an existing dataset version to copy rows from. Must belong to the same dataset group."),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Add Request Log to Draft Dataset (POST /api/public/v2/dataset-versions/add-request-log) ─────

export const AddRequestLogToDatasetVersionArgsSchema = z.object({
  dataset_group_id: z.number().int().describe("ID of the dataset group containing the draft"),
  request_log_id: z.number().int().describe("ID of the request log to add as a dataset row"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Save Draft Dataset Version (POST /api/public/v2/dataset-versions/save-draft) ─────

export const SaveDraftDatasetVersionArgsSchema = z.object({
  dataset_group_id: z.number().int().describe("ID of the dataset group containing the draft to save"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── List Evaluations (GET /api/public/v2/evaluations) ────────────────────

export const ListEvaluationsArgsSchema = z.object({
  page: z.number().int().optional().describe("Page number (default: 1)"),
  per_page: z.number().int().optional().describe("Items per page (default: 10)"),
  name: z.string().optional().describe("Filter by name (case-insensitive partial match)"),
  status: z.enum(["active", "deleted", "all"]).optional().describe("Filter by status (default: 'active')"),
  include_runs: z.boolean().optional().describe("If true, include batch runs nested under each evaluation with status and cell status counts (default: false)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Evaluation Rows (GET /api/public/v2/evaluations/{evaluation_id}/rows)

export const GetEvaluationRowsArgsSchema = z.object({
  evaluation_id: z.number().int().describe("The ID of the evaluation to retrieve rows from"),
  page: z.number().int().optional().describe("Page number (default: 1)"),
  per_page: z.number().int().optional().describe("Rows per page (default: 10, max: 100)"),
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

// ── Delete Report by ID (DELETE /reports/{report_id}) ────────────────────

export const DeleteReportArgsSchema = z.object({
  report_id: z.number().int().describe("Evaluation pipeline ID to archive"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Rename Report (PATCH /reports/{report_id}/rename) ────────────────────

export const RenameReportArgsSchema = z.object({
  report_id: z.number().int().describe("Evaluation pipeline ID to rename"),
  name: z.string().min(1).max(255).optional().describe("New name for the evaluation pipeline. Provide name, tags, or both."),
  tags: z.array(z.string()).optional().describe("Replace the pipeline's tags. Pass an empty array to clear them. Provide name, tags, or both."),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Add Report Column (POST /report-columns) ─────────────────────────────

export const AddReportColumnArgsSchema = z.object({
  report_id: z.number().int().describe("Evaluation pipeline ID to add the column to"),
  column_type: z.string().describe("Column type (e.g. LLM_ASSERTION, CODE_EXECUTION, PROMPT_TEMPLATE). See https://docs.promptlayer.com/features/evaluations/column-types"),
  name: z.string().min(1).describe("Unique column name within the pipeline"),
  configuration: z.record(z.unknown()).describe("Column-type-specific configuration"),
  position: z.number().int().positive().optional().describe("Position in the pipeline (auto-assigned if omitted). Cannot overwrite dataset columns."),
  is_part_of_score: z.boolean().optional().describe("Whether this column contributes to the score (default false)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Edit Report Column (PATCH /report-columns/{report_column_id}) ────────

export const EditReportColumnArgsSchema = z.object({
  report_column_id: z.number().int().describe("Report column ID to edit"),
  report_id: z.number().int().describe("Parent evaluation pipeline ID (must match the column's report)"),
  column_type: z.string().describe("Column type (e.g. LLM_ASSERTION, CODE_EXECUTION, PROMPT_TEMPLATE). DATASET is not allowed."),
  configuration: z.record(z.unknown()).optional().describe("Replacement column configuration"),
  name: z.string().min(1).optional().describe("New column name (must be unique within the pipeline)"),
  position: z.number().int().positive().optional().describe("New position. Cannot overwrite dataset columns."),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Delete Report Column (DELETE /report-columns/{report_column_id}) ─────

export const DeleteReportColumnArgsSchema = z.object({
  report_column_id: z.number().int().describe("Report column ID to delete. Cannot be a DATASET column."),
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
  version: z.number().int().optional().describe("Specific version number (mutually exclusive with label)"),
  label: z.string().optional().describe("Release label name, e.g. 'prod' (mutually exclusive with version)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Agent Labels (GET /workflows/{workflow_id_or_name}/labels) ────────

export const GetWorkflowLabelsArgsSchema = z.object({
  workflow_id_or_name: z.string().describe("Agent ID or name"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


// ── Tool Registry ────────────────────────────────────────────────────

export const ListToolRegistriesArgsSchema = z.object({
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const GetToolRegistryArgsSchema = z.object({
  identifier: z.string().describe("Tool ID (numeric) or name"),
  label: z.string().optional().describe("Resolve version by label name (e.g. 'production')"),
  version: z.number().int().optional().describe("Resolve by specific version number"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const ToolExecutionSchema = z.object({
  type: z.literal("code"),
  language: z.enum(["python", "javascript"]),
  code: z.string().describe("Function body only. Signature is auto-generated; LLM args arrive as a single `args` object."),
});

export const CreateToolRegistryArgsSchema = z.object({
  name: z.string().describe("Tool name (unique per workspace)"),
  tool_definition: z.record(z.unknown()).describe("Tool definition in OpenAI function-calling format: {type: 'function', function: {name, description, parameters}}"),
  description: z.string().optional().describe("Optional human-readable description of the tool"),
  folder_id: z.number().int().optional().describe("Folder ID to place tool in"),
  commit_message: z.string().optional().describe("Commit message for the initial version"),
  execution: ToolExecutionSchema.optional().describe("Optional sandbox-executable body. When set, PromptLayer auto-runs the body between LLM turns whenever a prompt uses this tool."),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const CreateToolVersionArgsSchema = z.object({
  identifier: z.string().describe("Tool ID (numeric) or name"),
  tool_definition: z.record(z.unknown()).describe("Updated tool definition in OpenAI function-calling format"),
  commit_message: z.string().optional().describe("Commit message describing what changed"),
  execution: ToolExecutionSchema.optional().describe("Optional sandbox-executable body to attach to this version. See ToolExecutionSchema for details."),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const TestExecuteToolRegistryArgsSchema = z.object({
  identifier: z.string().describe("Tool ID (numeric) or name"),
  inputs: z.record(z.unknown()).optional().describe("Arguments passed to the tool body, keyed by the tool's parameter names. Same shape the LLM would emit."),
  execution: ToolExecutionSchema.optional().describe("In-flight override of the stored execution config. Lets you test unsaved code without creating a version."),
  tool_definition: z.record(z.unknown()).optional().describe("In-flight override of the stored tool definition. Useful for testing a different function name without saving."),
  label: z.string().optional().describe("Resolve version by label name (e.g. 'production'). Falls back to latest if neither label nor version given."),
  version: z.number().int().optional().describe("Resolve by specific version number"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const CreateFolderArgsSchema = z.object({
  name: z.string().describe("Folder name (unique within parent)"),
  parent_id: z.number().int().optional().describe("Parent folder ID (root if omitted)"),
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
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Resolve Folder ID (GET /api/public/v2/folders/resolve-id) ────────────
// NOTE: Not yet in the OpenAPI spec. Added from backend source.
// Tracked as a known exception in scripts/diff-endpoints.ts.

export const ResolveFolderIdArgsSchema = z.object({
  path: z.string().describe("Folder path to resolve (e.g. 'foo/bar')"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


// ── Skill Collections ────────────────────────────────────────────────────
// Public API endpoints under /api/public/v2/skill-collections.
// MCP supports JSON bodies only (multipart/form-data with ZIP archive uploads
// is intentionally not exposed — agents should send file contents inline).

export const ListSkillCollectionsArgsSchema = z.object({
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

const SkillCollectionFileSchema = z.object({
  path: z.string().describe("Relative file path inside the collection (e.g. 'README.md', 'src/util.ts')"),
  content: z.string().optional().describe("File contents as a string. Defaults to empty string if omitted."),
});

export const CreateSkillCollectionArgsSchema = z.object({
  name: z.string().describe("Collection name. Must be a valid root folder name (will be made unique within the workspace)."),
  description: z.string().optional().describe("Optional human-readable description"),
  folder_id: z.number().int().optional().describe("Folder ID to place the collection into"),
  provider: z.string().optional().describe("Provider hint (e.g. 'claude', 'cursor'). Auto-detected from file paths if omitted."),
  files: z.array(SkillCollectionFileSchema).optional().describe("Initial files for the collection. Each item is {path, content}."),
  commit_message: z.string().optional().describe("Commit message for the initial version"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const GetSkillCollectionArgsSchema = z.object({
  identifier: z.string().describe("Skill collection UUID, name, or root_path"),
  label: z.string().optional().describe("Release label to pin the version (mutually exclusive with version)"),
  version: z.number().int().min(1).optional().describe("Version number to pin (mutually exclusive with label)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const UpdateSkillCollectionArgsSchema = z.object({
  identifier: z.string().describe("Skill collection UUID, name, or root_path"),
  name: z.string().optional().describe("New collection name (will be made unique within the workspace if it collides)"),
  description: z.string().optional().describe("New description. Pass empty string to clear."),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

const SkillCollectionFileMoveSchema = z.object({
  old_path: z.string().describe("Existing relative path"),
  new_path: z.string().describe("New relative path"),
});

export const SaveSkillCollectionVersionArgsSchema = z.object({
  identifier: z.string().describe("Skill collection UUID, name, or root_path"),
  file_updates: z.array(SkillCollectionFileSchema).optional().describe("Files to add or overwrite. Each item is {path, content}. Files not mentioned are carried forward from the previous version."),
  moves: z.array(SkillCollectionFileMoveSchema).optional().describe("Files to rename: [{old_path, new_path}, ...]"),
  deletes: z.array(z.string()).optional().describe("Relative paths of files to delete from the new version"),
  commit_message: z.string().optional().describe("Commit message describing what changed"),
  release_label: z.string().optional().describe("Release label to attach to the new version (e.g. 'production')"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


// ── Patch Prompt Template Version (PATCH /rest/prompt-templates/{identifier}) ──
// Partial update: fetches the base version, applies field-level patches, creates a new version.

export const PatchPromptTemplateVersionArgsSchema = z.object({
  identifier: z.string().describe("Prompt template name or numeric ID"),
  version: z.number().int().optional().describe("Base version number to patch from (mutually exclusive with label; defaults to latest)"),
  label: z.string().optional().describe("Release label identifying the base version (mutually exclusive with version)"),
  messages: z.union([z.record(z.unknown()), z.array(z.record(z.unknown()))]).optional().describe(
    "Chat templates only. " +
    "Object form: index-based patch ({\"0\": {...}}) — only listed indices are updated, others preserved. " +
    "Array form: full replacement of all messages."
  ),
  tools: z.union([z.record(z.unknown()), z.array(z.record(z.unknown())), z.null()]).optional().describe(
    "Chat templates only. Same patching behavior as messages. Pass null to remove all tools."
  ),
  functions: z.union([z.record(z.unknown()), z.array(z.record(z.unknown())), z.null()]).optional().describe(
    "Chat templates only. Same patching behavior as messages. Pass null to remove all functions."
  ),
  function_call: z.union([z.string(), z.record(z.unknown()), z.null()]).optional().describe("Replaces the function_call setting. Null removes."),
  tool_choice: z.union([z.string(), z.record(z.unknown()), z.null()]).optional().describe("Replaces the tool_choice setting. Null removes."),
  content: z.union([z.record(z.unknown()), z.array(z.record(z.unknown()))]).optional().describe(
    "Completion templates only. Same index-based / full-replacement behavior as messages."
  ),
  model_parameters: z.record(z.unknown()).optional().describe("Shallow-merged into existing model parameters (e.g. temperature, max_tokens)."),
  response_format: z.union([z.record(z.unknown()), z.null()]).optional().describe("Convenience field to set response_format inside model parameters. Null removes. Cannot be combined with response_format inside model_parameters."),
  commit_message: z.string().optional().describe("Commit message for the new version"),
  release_labels: z.array(z.string()).optional().describe("Release labels to create or move to the new version"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});




// ── Request log query (shared by /requests/search and /requests/analytics) ──
// Backend models: search uses PostStructuredSearchRequest = RequestLogQuery + page/per_page/include_prompt_name;
// analytics uses RequestLogQuery directly. We share the 4 RequestLogQuery fields here.

const RequestLogQueryShape = {
  filter_group: StructuredFilterGroupSchema.optional().describe("Filter group with AND/OR logic, supports nesting. Wrap multiple filters in an AND group."),
  q: z.string().optional().describe("Free-text search across prompt input and LLM output"),
  sort_by: z.enum([
    "request_start_time", "input_tokens", "output_tokens", "cost", "latency_ms", "status",
    "turn_count", "tool_call_count",
  ]).optional().describe("Sort field"),
  sort_order: z.enum(["asc", "desc"]).optional().describe("Sort direction (must be provided with sort_by)"),
};

// ── Search Request Logs (POST /api/public/v2/requests/search) ────────────
// (StructuredFilter / StructuredFilterGroup are defined higher up so the
// dataset-from-filter-params endpoint can reuse them.)

export const SearchRequestLogsArgsSchema = z.object({
  ...RequestLogQueryShape,
  page: z.number().int().optional().describe("Page number (default: 1)"),
  per_page: z.number().int().optional().describe("Items per page (max: 25)"),
  include_prompt_name: z.boolean().optional().describe("Include prompt template name in results"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Request Analytics (POST /api/public/v2/requests/analytics) ───────
// Same RequestLogQuery body as search-request-logs but returns aggregated
// charts (requests/tokens/cost over time, latency stats, model & prompt
// breakdowns) instead of paginated rows.

export const GetRequestAnalyticsArgsSchema = z.object({
  ...RequestLogQueryShape,
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Request (GET /api/public/v2/requests/{request_id}) ───────────────

export const GetRequestArgsSchema = z.object({
  request_id: z.number().int().describe("Request ID to retrieve"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Trace (GET /api/public/v2/traces/{trace_id}) ─────────────────────

export const GetTraceArgsSchema = z.object({
  trace_id: z.string().describe("Trace ID to retrieve spans for"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Request Search Suggestions (GET /api/public/v2/requests/suggestions) ──

export const GetRequestSearchSuggestionsArgsSchema = z.object({
  field: z.enum([
    "engine", "provider_type", "prompt_id", "prompt", "tags",
    "metadata_keys", "status", "tool_names", "output_keys",
    "input_variable_keys", "metadata_values", "output_values",
    "input_variable_values",
  ]).describe("The field to get suggestion values for"),
  prefix: z.string().optional().describe("Prefix to filter suggestions (case-insensitive)"),
  metadata_key: z.string().optional().describe("Required when field is metadata_values — specifies which metadata key to get values for"),
  prompt_id: z.number().int().optional().describe("Filter suggestions to a specific prompt template (only used when field is prompt)"),
  filter_group: z.string().optional().describe("JSON-encoded filter group to scope suggestions to matching requests"),
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
      "Body has two required objects: prompt_template (with prompt_name, tags, folder_id, is_snippet) and " +
      "prompt_version (with prompt_template content in chat/completion format, commit_message, metadata). " +
      "Optionally assign release_labels. " +
      "IMPORTANT: If the prompt uses snippets, preserve @@@snippet_name@@@ markers in the content. " +
      "Do not inline snippet text — this breaks snippet references. " +
      "To create a snippet (a reusable fragment referenced by other prompts), set " +
      "prompt_template.is_snippet=true on the first publish. The flag is only honored on initial " +
      "creation; later versions cannot flip an existing template into a snippet or vice versa.",
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
      "FILTER SYNTAX: Use filter_group to combine filters with AND/OR logic. Each filter is {field, operator, value, nested_key?}.\n" +
      "Operators by field type:\n" +
      "  - String fields (engine, provider_type): is, is_not, in, not_in\n" +
      "  - Text fields (input_text, output_text): contains, not_contains, starts_with, ends_with\n" +
      "  - Numeric fields (cost, latency_ms, input_tokens, output_tokens, turn_count, tool_call_count): eq, neq, gt, gte, lt, lte, between (value=[min,max]), is_null, is_not_null\n" +
      "  - Datetime fields (request_start_time, request_end_time): is, before, after, between (value=[start,end] as ISO 8601)\n" +
      "  - Boolean fields (is_json, is_tool_call, is_plain_text, has_trace): is_true, is_false\n" +
      "  - Array fields (tags, metadata_keys, tool_names, output_keys, input_variable_keys): contains, not_contains, in, not_in, is_empty, is_not_empty\n" +
      "  - Nested fields (metadata, output, input_variables): key_equals, key_not_equals, key_contains, in, not_in, is_empty, is_not_empty — requires nested_key\n\n" +
      "EXAMPLES:\n" +
      '  Find GPT-4o requests: {filter_group: {logic:"AND", filters: [{field:"engine", operator:"is", value:"gpt-4o"}]}}\n' +
      '  Expensive requests: {filter_group: {logic:"AND", filters: [{field:"cost", operator:"gte", value:0.10}]}}\n' +
      '  By metadata: {filter_group: {logic:"AND", filters: [{field:"metadata", operator:"key_equals", value:"customer_123", nested_key:"user_id"}]}}\n' +
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
      "cost, timing data, and trace_id (if the request was part of a trace). " +
      "Useful for debugging, replaying requests, or extracting data for evaluations.",
    inputSchema: GetRequestArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-trace": {
    name: "get-trace",
    description:
      "Retrieve all spans for a given trace ID. Each span includes metadata and, if it generated " +
      "a request log, the associated request_log_id. Useful for inspecting execution flow across " +
      "multiple LLM calls in a traced operation.",
    inputSchema: GetTraceArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-request-search-suggestions": {
    name: "get-request-search-suggestions",
    description:
      "Get autocomplete suggestions for request log search fields. Returns possible values for a given " +
      "field, optionally filtered by a prefix string. Useful for building search UIs or discovering " +
      "available values (e.g. which engines, tags, or metadata keys exist in your logs).\n\n" +
      "FIELDS: engine, provider_type, prompt_id, prompt, tags, metadata_keys, status, tool_names, " +
      "output_keys, input_variable_keys, metadata_values, output_values, input_variable_values.\n\n" +
      "For metadata_values/output_values/input_variable_values, also provide metadata_key to specify which key.\n" +
      "Rate limited to 10 req/min.",
    inputSchema: GetRequestSearchSuggestionsArgsSchema,
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
    description:
      "Create a dataset version from request log history. Two modes:\n" +
      "  1. request_log_ids — pin to an explicit list of IDs (≤50 sync, >50 async). Snapshot, not refreshable.\n" +
      "  2. filter_group (+ optional q) — structured AND/OR filter, same shape as search-request-logs. " +
      "Async; persisted on the dataset so refresh_dataset can replay it.\n" +
      "Use variables_to_parse to extract specific input variables as dataset columns.",
    inputSchema: CreateDatasetVersionFromFilterParamsArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-dataset-rows": {
    name: "get-dataset-rows",
    description: "Get paginated rows from a dataset. Each row is an array of cells with {type: 'dataset', value: ...}. Supports search via the q parameter.",
    inputSchema: GetDatasetRowsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-draft-dataset-version": {
    name: "create-draft-dataset-version",
    description: "Create a draft dataset version for a dataset group. Optionally copy rows from an existing version. Only one draft can exist per group.",
    inputSchema: CreateDraftDatasetVersionArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "add-request-log-to-dataset": {
    name: "add-request-log-to-dataset",
    description: "Add a request log as a row to the draft dataset version. Extracts input variables, metadata, scores, tags, prompt, and response. Requires create-draft first.",
    inputSchema: AddRequestLogToDatasetVersionArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "save-draft-dataset-version": {
    name: "save-draft-dataset-version",
    description: "Publish a draft dataset version by assigning it a real version number. Processed asynchronously.",
    inputSchema: SaveDraftDatasetVersionArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Evaluations ─────────────────────────────────────────────────────
  "list-evaluations": {
    name: "list-evaluations",
    description: "List evaluation pipelines (called 'reports' in the API) with pagination. Filter by name, status. Set include_runs=true to include batch runs nested under each evaluation.",
    inputSchema: ListEvaluationsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-evaluation-rows": {
    name: "get-evaluation-rows",
    description: "Get paginated evaluation results with dataset inputs and eval outcomes. Each row has dataset cells ({type: 'dataset', value: ...}) followed by eval cells ({type: 'eval', status: 'PASSED'|'FAILED', value: ...}).",
    inputSchema: GetEvaluationRowsArgsSchema,
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
  "delete-report": {
    name: "delete-report",
    description: "Archive a single evaluation pipeline by ID. Prefer this over delete-reports-by-name when you have the report_id, since names can collide.",
    inputSchema: DeleteReportArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "rename-report": {
    name: "rename-report",
    description: "Rename or retag an evaluation pipeline. Provide name, tags, or both. Use this instead of recreating a misnamed pipeline.",
    inputSchema: RenameReportArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "add-report-column": {
    name: "add-report-column",
    description: "Add a single column to an existing evaluation pipeline. Use this to extend a pipeline incrementally instead of recreating the entire report. Column names must be unique within the pipeline. For column types and configuration, see https://docs.promptlayer.com/features/evaluations/column-types.",
    inputSchema: AddReportColumnArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "edit-report-column": {
    name: "edit-report-column",
    description: "Update an existing evaluation column's type, configuration, name, or position. Use this to fix a bug in a CODE_EXECUTION script or change a column's settings without recreating the whole pipeline. Cannot edit DATASET columns.",
    inputSchema: EditReportColumnArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-report-column": {
    name: "delete-report-column",
    description: "Delete a single column from an evaluation pipeline. Cannot delete DATASET columns. Surrounding columns shift left to fill the gap.",
    inputSchema: DeleteReportColumnArgsSchema,
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
    description: "Get a single agent (called 'workflow' in the API) by ID or name. Returns the agent details including full node configuration, edges, and version info. Optionally filter by version number or release label.",
    inputSchema: GetWorkflowArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-workflow-labels": {
    name: "get-workflow-labels",
    description: "List all release labels for an agent (workflow). Returns each label with its name, ID, and the version it points to.",
    inputSchema: GetWorkflowLabelsArgsSchema,
    annotations: { readOnlyHint: true },
  },

  // ── Tool Registry ───────────────────────────────────────────────────
  "list-tool-registries": {
    name: "list-tool-registries",
    description: "List all tools in the Tool Registry for the workspace. Returns tool names, IDs, and metadata.",
    inputSchema: ListToolRegistriesArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-tool-registry": {
    name: "get-tool-registry",
    description: "Get a tool from the Tool Registry by ID or name. Optionally resolve a specific version by label or version number. Returns the tool definition and metadata.",
    inputSchema: GetToolRegistryArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-tool-registry": {
    name: "create-tool-registry",
    description: "Create a new tool in the Tool Registry with an initial version. The tool definition should be in OpenAI function-calling format. Pass an optional `execution` payload to attach a sandbox-executable body that PromptLayer will auto-run between LLM turns.",
    inputSchema: CreateToolRegistryArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "create-tool-version": {
    name: "create-tool-version",
    description: "Create a new version of an existing tool in the Tool Registry. Each version is immutable - this adds a new version with the updated definition. Pass an optional `execution` payload to attach (or replace) the sandbox-executable body for this version.",
    inputSchema: CreateToolVersionArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "test-execute-tool-registry": {
    name: "test-execute-tool-registry",
    description: "Run a tool's execution body in the sandbox against test inputs. Returns the body's return value plus stdout/stderr/duration. Useful for verifying a body before publishing. Pass `execution` and/or `tool_definition` to test unsaved overrides without creating a version. User-code errors return status='error' inside the result (HTTP 200); sandbox infrastructure failures return HTTP 502.",
    inputSchema: TestExecuteToolRegistryArgsSchema,
    annotations: { readOnlyHint: false },
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

  // ── Skill Collections ───────────────────────────────────────────────
  "list-skill-collections": {
    name: "list-skill-collections",
    description: "List all skill collections in the workspace. Returns each collection's UUID, name, root_path, provider, description, and timestamps.",
    inputSchema: ListSkillCollectionsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-skill-collection": {
    name: "create-skill-collection",
    description:
      "Create a new skill collection with optional initial files. Each file is {path, content} where path is relative inside the collection " +
      "(e.g. 'README.md' or 'src/util.ts'). Provider is auto-detected from file paths if omitted (e.g. .claude/* → 'claude'). " +
      "Names are made unique within the workspace if they collide.",
    inputSchema: CreateSkillCollectionArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-skill-collection": {
    name: "get-skill-collection",
    description:
      "Fetch a skill collection by UUID, name, or root_path. Returns the collection metadata, the version object, and a 'files' map of " +
      "{relative_path: file_content}. Pin a specific version with 'version' (number) or 'label' (release label) — these are mutually exclusive. " +
      "If neither is provided, returns the latest committed version.",
    inputSchema: GetSkillCollectionArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "update-skill-collection": {
    name: "update-skill-collection",
    description: "Rename a skill collection or update its description. To save new file contents as a version, use save-skill-collection-version instead.",
    inputSchema: UpdateSkillCollectionArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "save-skill-collection-version": {
    name: "save-skill-collection-version",
    description:
      "Save a new version of a skill collection. Apply file changes via three lists: " +
      "file_updates (add or overwrite — files not mentioned are carried forward unchanged), " +
      "moves (rename), and deletes (remove). Optionally attach a release_label to the new version.",
    inputSchema: SaveSkillCollectionVersionArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Analytics ───────────────────────────────────────────────────────
  "get-request-analytics": {
    name: "get-request-analytics",
    description:
      "Aggregate analytics across request logs — totals (requests, tokens, cost), time-series breakdowns, latency percentiles, " +
      "and most-used models/prompts. Body is the same shape as search-request-logs (filter_group, q, sort_by, sort_order); the response is aggregated, not paginated rows. " +
      "Use this to answer questions like 'how much have we spent on GPT-4o this week?' or 'what's the p90 latency for prod traffic?'.",
    inputSchema: GetRequestAnalyticsArgsSchema,
    annotations: { readOnlyHint: true },
  },

  // ── Prompt Template Patch ───────────────────────────────────────────
  "patch-prompt-template-version": {
    name: "patch-prompt-template-version",
    description:
      "Partially update a prompt template by creating a new version with merged changes. Fetches the base version (latest by default, or pin via version/label), " +
      "applies field-level patches, and creates a new version.\n\n" +
      "MERGE BEHAVIOR:\n" +
      "  - messages/tools/functions/content: object form is index-based patch ({\"0\": {...}} updates only listed indices); array form fully replaces.\n" +
      "  - tools/functions/function_call/tool_choice/response_format: pass null to remove.\n" +
      "  - model_parameters: shallow merge — existing keys are preserved unless overwritten.\n" +
      "  - release_labels: creates or moves the labels to the new version.\n\n" +
      "Use this for surgical edits (e.g. tweak the system message, add a tool, change temperature) without resending the whole template. " +
      "For a full rewrite, use publish-prompt-template instead.",
    inputSchema: PatchPromptTemplateVersionArgsSchema,
    annotations: { readOnlyHint: false },
  },

} as const;
