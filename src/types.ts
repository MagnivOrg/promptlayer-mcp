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
  }).describe("Template metadata: prompt_name (required), tags, folder_id"),
  prompt_version: z.object({
    prompt_template: z.record(z.unknown()).describe("The template content in chat ({type:'chat', messages:[...]}) or completion format"),
    commit_message: z.string().optional().describe("Commit message (max 72 chars)"),
    metadata: z.record(z.unknown()).optional().describe("Metadata including model configuration"),
  }).describe("Version data: prompt_template content (required), commit_message, metadata"),
  release_labels: z.array(z.string()).optional().describe("Release labels to assign (e.g. ['prod'])"),
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
  prompt_version_number: z.number().int().describe("The version number to attach the label to"),
  name: z.string().describe("The label name (e.g. 'prod', 'staging')"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Move Prompt Label (PATCH /prompt-labels/{prompt_label_id}) ──────────
// OpenAPI: body = { prompt_version_number: int }

export const MovePromptLabelArgsSchema = z.object({
  prompt_label_id: z.number().int().describe("The prompt label ID to move"),
  prompt_version_number: z.number().int().describe("Target version number to move the label to"),
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
  metadata: z.record(z.unknown()).optional().describe("Custom key-value metadata for search/filtering"),
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

// ── Track Prompt (POST /rest/track-prompt) ───────────────────────────────

export const TrackPromptArgsSchema = z.object({
  request_id: z.number().int().describe("PromptLayer request ID"),
  prompt_name: z.string().describe("Prompt template name in the registry"),
  prompt_input_variables: z.record(z.unknown()).optional().describe("Input variables used to format the template"),
  version: z.number().int().optional().describe("Version number (defaults to latest)"),
  label: z.string().optional().describe("Release label of the prompt version"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Track Score (POST /rest/track-score) ─────────────────────────────────

export const TrackScoreArgsSchema = z.object({
  request_id: z.number().int().describe("PromptLayer request ID"),
  score: z.number().int().min(0).max(100).describe("Score value (0-100)"),
  name: z.string().optional().describe("Score name for multiple scores per request (e.g. 'relevance')"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Track Metadata (POST /rest/track-metadata) ──────────────────────────

export const TrackMetadataArgsSchema = z.object({
  request_id: z.number().int().describe("PromptLayer request ID"),
  metadata: z.record(z.unknown()).describe("Metadata key-value pairs (e.g. {session_id, user_id})"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Track Group (POST /rest/track-group) ─────────────────────────────────

export const TrackGroupArgsSchema = z.object({
  request_id: z.number().int().describe("PromptLayer request ID"),
  group_id: z.number().int().describe("Group ID to associate the request with"),
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
  name: z.string().describe("Dataset group name (unique within workspace)"),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
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
  prompt_id: z.number().int().optional().describe("Filter by prompt ID"),
  prompt_version_id: z.number().int().optional().describe("Filter by prompt version ID"),
  prompt_label_id: z.number().int().optional().describe("Filter by prompt label ID"),
  workspace_id: z.number().int().optional().describe("Workspace ID"),
  start_time: z.string().optional().describe("Start time filter (ISO 8601)"),
  end_time: z.string().optional().describe("End time filter (ISO 8601)"),
  tags: z.array(z.string()).optional().describe("Filter by tags"),
  metadata: z.record(z.unknown()).optional().describe("Filter by metadata key-value pairs"),
  scores: z.record(z.unknown()).optional().describe("Filter by score criteria"),
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

// ── Add Column to Evaluation Pipeline (POST /report-columns) ────────────

export const AddReportColumnArgsSchema = z.object({
  report_id: z.number().int().describe("Evaluation pipeline ID"),
  column_type: z.enum([
    "ABSOLUTE_NUMERIC_DISTANCE", "AI_DATA_EXTRACTION", "ASSERT_VALID",
    "CONVERSATION_SIMULATOR", "COALESCE", "CODE_EXECUTION", "COMBINE_COLUMNS",
    "COMPARE", "CONTAINS", "COSINE_SIMILARITY", "COUNT", "ENDPOINT", "MCP",
    "HUMAN", "JSON_PATH", "LLM_ASSERTION", "MATH_OPERATOR", "MIN_MAX",
    "PARSE_VALUE", "APPLY_DIFF", "PROMPT_TEMPLATE", "REGEX", "REGEX_EXTRACTION",
    "VARIABLE", "XML_PATH", "WORKFLOW", "CODING_AGENT",
  ]).describe("Column type"),
  name: z.string().describe("Column name (unique within pipeline)"),
  configuration: z.record(z.unknown()).describe("Column-type-specific configuration"),
  position: z.number().int().optional().describe("Position in pipeline (auto-assigned if omitted)"),
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
  required_input_variables: z.record(z.unknown()).optional().describe("Input variable names to types, e.g. {user_query: 'string'}"),
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
  required_input_variables: z.record(z.unknown()).optional().describe("Replaces input variables entirely if provided"),
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
  metadata: z.record(z.unknown()).optional().describe("Metadata to attach to the execution"),
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
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});


export const CreateFolderArgsSchema = z.object({
  name: z.string().describe("Folder name (unique within parent)"),
  parent_id: z.number().int().optional().describe("Parent folder ID (root if omitted)"),
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
      "Retrieve a prompt template by name or ID, with optional version/label selection. " +
      "Returns the template with provider-formatted llm_kwargs ready for your LLM client. " +
      "Use input_variables to fill template placeholders. Use label (e.g. 'prod') or version number " +
      "to pin a specific version; defaults to latest. " +
      "Use get-prompt-template-raw instead if you need unformatted template data for caching or sync.",
    inputSchema: GetPromptTemplateArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-prompt-template-raw": {
    name: "get-prompt-template-raw",
    description:
      "Retrieve raw prompt template data without applying input variables or provider formatting. " +
      "Ideal for GitHub sync, local caching, and template inspection. " +
      "Set resolve_snippets=false to preserve raw @@@snippet@@@ references. " +
      "Set include_llm_kwargs=true to include provider-specific format. " +
      "Use get-prompt-template instead if you need formatted output with filled variables.",
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
      "Optionally assign release_labels.",
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
  "track-prompt": {
    name: "track-prompt",
    description: "Associate a prompt template with a logged request by request_id.",
    inputSchema: TrackPromptArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-score": {
    name: "track-score",
    description: "Assign a score (0-100) to a logged request. Use 'name' for multiple named scores per request.",
    inputSchema: TrackScoreArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-metadata": {
    name: "track-metadata",
    description: "Attach metadata key-value pairs to a logged request for search and filtering.",
    inputSchema: TrackMetadataArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-group": {
    name: "track-group",
    description: "Associate a logged request with a group.",
    inputSchema: TrackGroupArgsSchema,
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
    description: "List evaluation pipelines with pagination. Filter by name, status, workspace_id.",
    inputSchema: ListEvaluationsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-report": {
    name: "create-report",
    description: "Create an evaluation pipeline linked to a dataset group. Optionally include columns and scoring config.",
    inputSchema: CreateReportArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "run-report": {
    name: "run-report",
    description: "Execute an evaluation pipeline. Runs all columns against the dataset. Name is required.",
    inputSchema: RunReportArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-report": {
    name: "get-report",
    description: "Get evaluation pipeline details. Use get-report-score for the computed score.",
    inputSchema: GetReportArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-report-score": {
    name: "get-report-score",
    description: "Get the computed score for an evaluation pipeline.",
    inputSchema: GetReportScoreArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "add-report-column": {
    name: "add-report-column",
    description: "Add one evaluation column to a pipeline. One column per request. Column types include PROMPT_TEMPLATE, CODE_EXECUTION, LLM_ASSERTION, COMPARE, etc.",
    inputSchema: AddReportColumnArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "update-report-score-card": {
    name: "update-report-score-card",
    description: "Configure custom scoring for an evaluation pipeline. Specify column_names and optional custom code.",
    inputSchema: UpdateReportScoreCardArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-reports-by-name": {
    name: "delete-reports-by-name",
    description: "Archive all evaluation pipelines with the given name.",
    inputSchema: DeleteReportsByNameArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Agents / Workflows ──────────────────────────────────────────────
  "list-workflows": {
    name: "list-workflows",
    description: "List all agents in the workspace with pagination.",
    inputSchema: ListWorkflowsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-workflow": {
    name: "create-workflow",
    description: "Create a new agent or new version of an existing one. For new: use 'name'. For versioning: use workflow_id or workflow_name.",
    inputSchema: CreateWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "patch-workflow": {
    name: "patch-workflow",
    description: "Partially update an agent. Merges node changes into a new version. Set node to null to remove.",
    inputSchema: PatchWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "run-workflow": {
    name: "run-workflow",
    description: "Execute an agent by name. Returns 201 with results, or 202 if callback_url is set.",
    inputSchema: RunWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-workflow-version-execution-results": {
    name: "get-workflow-version-execution-results",
    description: "Poll for agent execution results. Returns 200 when complete, 202 when still running.",
    inputSchema: GetWorkflowVersionExecutionResultsArgsSchema,
    annotations: { readOnlyHint: true },
  },

  // ── Folders ─────────────────────────────────────────────────────────
  "create-folder": {
    name: "create-folder",
    description: "Create a folder for organizing resources. Nest with parent_id. Names unique within parent.",
    inputSchema: CreateFolderArgsSchema,
    annotations: { readOnlyHint: false },
  },
} as const;
