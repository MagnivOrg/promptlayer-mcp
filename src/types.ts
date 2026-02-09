/**
 * TypeScript types and Zod schemas for PromptLayer API
 * All 34 REST API endpoints defined as tool definitions.
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
//  PROMPT TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

// ── Get Prompt Template (POST /prompt-templates/{identifier}) ────────────

export const GetPromptTemplateArgsSchema = z.object({
  prompt_name: z
    .string()
    .describe(
      "Name or ID of the prompt template. The identifier can be either the prompt name or the prompt id."
    ),
  version: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Specific version number (optional, defaults to latest). Must be > 0."
    ),
  workspace_id: z.number().int().optional().describe("Workspace ID (optional)"),
  label: z
    .string()
    .optional()
    .describe(
      "Release label like 'prod' or 'staging' (optional). If specified, takes precedence over version."
    ),
  provider: z
    .enum([
      "openai",
      "anthropic",
      "amazon.bedrock",
      "cohere",
      "google",
      "huggingface",
      "mistral",
      "openai.azure",
      "vertexai",
    ])
    .optional()
    .describe(
      "LLM provider to format for (optional). Overrides provider set in Prompt Registry."
    ),
  input_variables: z
    .record(z.string())
    .optional()
    .describe("Variables to format the template with (optional)"),
  metadata_filters: z
    .record(z.string())
    .optional()
    .describe("Optional dictionary of key values used for A/B release labels"),
  model: z
    .string()
    .optional()
    .describe(
      "Optional model name used for returning default parameters with llm_kwargs"
    ),
  model_parameter_overrides: z
    .record(z.unknown())
    .optional()
    .describe(
      "Optional dictionary of model parameter overrides. Will override parameters at runtime for the specified model."
    ),
  api_key: z
    .string()
    .optional()
    .describe(
      "PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"
    ),
});

// ── Get Prompt Template Raw (GET /prompt-templates/{identifier}) ─────────

export const GetPromptTemplateRawArgsSchema = z.object({
  identifier: z
    .string()
    .describe("Prompt template name or ID"),
  version: z
    .number()
    .int()
    .optional()
    .describe("Specific version number. Mutually exclusive with label."),
  label: z
    .string()
    .optional()
    .describe("Release label name (e.g. 'prod'). Mutually exclusive with version."),
  resolve_snippets: z
    .boolean()
    .optional()
    .describe("When true (default), snippets are expanded. When false, raw @@@snippet@@@ references are preserved."),
  include_llm_kwargs: z
    .boolean()
    .optional()
    .describe("When true, includes provider-specific LLM API format in the response. Default false."),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── List Prompt Templates (GET /prompt-templates) ────────────────────────

export const ListPromptTemplatesArgsSchema = z.object({
  page: z
    .number()
    .int()
    .optional()
    .default(1)
    .describe("Page number for pagination"),
  per_page: z
    .number()
    .int()
    .optional()
    .default(30)
    .describe("Number of items per page"),
  label: z
    .string()
    .optional()
    .describe(
      "Filter prompt templates by release label (e.g., 'prod', 'dev', 'staging')"
    ),
  name: z
    .string()
    .optional()
    .describe(
      "Filter prompt templates by name (case-insensitive partial match)"
    ),
  status: z
    .enum(["active", "deleted", "all"])
    .optional()
    .default("active")
    .describe(
      "Filter by status: 'active' (default), 'deleted', or 'all'"
    ),
  api_key: z
    .string()
    .optional()
    .describe(
      "PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"
    ),
});

// ── Publish Prompt Template (POST /rest/prompt-templates) ────────────────

export const PublishPromptTemplateArgsSchema = z.object({
  prompt_name: z
    .string()
    .describe("Name of the prompt template to publish"),
  prompt_template: z
    .record(z.unknown())
    .describe("The prompt template object (chat or completion format)"),
  commit_message: z
    .string()
    .optional()
    .describe("Commit message for this version"),
  tags: z
    .array(z.string())
    .optional()
    .describe("Tags to associate with the prompt template version"),
  metadata: z
    .record(z.unknown())
    .optional()
    .describe("Metadata including model configuration"),
  release_labels: z
    .array(z.string())
    .optional()
    .describe("Release labels to assign (e.g. ['prod', 'staging'])"),
  folder_id: z
    .number()
    .int()
    .optional()
    .describe("Folder ID to place the prompt template in"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── List Prompt Template Labels (GET /prompt-templates/{identifier}/labels)

export const ListPromptTemplateLabelsArgsSchema = z.object({
  identifier: z
    .string()
    .describe("Prompt template name or ID"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Prompt Label (POST /prompts/{prompt_id}/label) ────────────────

export const CreatePromptLabelArgsSchema = z.object({
  prompt_id: z
    .number()
    .int()
    .describe("The prompt version ID to attach the label to"),
  label: z
    .string()
    .describe("The release label name (e.g. 'prod', 'staging')"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Move Prompt Label (PATCH /prompt-labels/{prompt_label_id}) ──────────

export const MovePromptLabelArgsSchema = z.object({
  prompt_label_id: z
    .number()
    .int()
    .describe("The prompt label ID to move"),
  prompt_version_id: z
    .number()
    .int()
    .describe("The target prompt version ID to move the label to"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Delete Prompt Label (DELETE /prompt-labels/{prompt_label_id}) ────────

export const DeletePromptLabelArgsSchema = z.object({
  prompt_label_id: z
    .number()
    .int()
    .describe("The prompt label ID to delete"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Snippet Usage (GET /prompt-templates/{identifier}/snippet-usage) ─

export const GetSnippetUsageArgsSchema = z.object({
  identifier: z
    .string()
    .describe("Prompt template name or ID to check snippet usage for"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ═══════════════════════════════════════════════════════════════════════════
//  TRACKING
// ═══════════════════════════════════════════════════════════════════════════

// ── Log Request (POST /log-request) ──────────────────────────────────────

export const LogRequestArgsSchema = z.object({
  provider: z
    .string()
    .describe("LLM provider name (e.g. 'openai', 'anthropic', 'google', 'cohere')"),
  model: z
    .string()
    .describe("Model name (e.g. 'gpt-4o', 'claude-3-7-sonnet-20250219')"),
  input: z
    .record(z.unknown())
    .describe("Input in Prompt Blueprint format. For chat: {type: 'chat', messages: [{role, content: [{type: 'text', text}]}]}"),
  output: z
    .record(z.unknown())
    .describe("Output in Prompt Blueprint format. For chat: {type: 'chat', messages: [{role: 'assistant', content: [{type: 'text', text}]}]}"),
  request_start_time: z
    .string()
    .optional()
    .describe("ISO 8601 datetime when the request started (e.g. '2024-04-03T20:57:25+00:00')"),
  request_end_time: z
    .string()
    .optional()
    .describe("ISO 8601 datetime when the response was received"),
  parameters: z
    .record(z.unknown())
    .optional()
    .describe("Model parameters (temperature, max_tokens, response_format, etc.)"),
  tags: z
    .array(z.string())
    .optional()
    .describe("Tags for categorizing the request"),
  metadata: z
    .record(z.unknown())
    .optional()
    .describe("Custom key-value metadata for search and filtering"),
  prompt_name: z
    .string()
    .optional()
    .describe("Prompt template name to associate with this request"),
  prompt_id: z
    .number()
    .int()
    .optional()
    .describe("Prompt template ID to associate with this request"),
  prompt_version_number: z
    .number()
    .int()
    .optional()
    .describe("Prompt template version number"),
  prompt_input_variables: z
    .record(z.unknown())
    .optional()
    .describe("Variables used to format the prompt template"),
  input_tokens: z
    .number()
    .int()
    .optional()
    .describe("Number of input tokens used"),
  output_tokens: z
    .number()
    .int()
    .optional()
    .describe("Number of output tokens generated"),
  api_type: z
    .string()
    .optional()
    .describe("API type for openai/azure-openai (e.g. 'chat-completions', 'responses')"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Track Prompt (POST /rest/track-prompt) ───────────────────────────────

export const TrackPromptArgsSchema = z.object({
  request_id: z
    .union([z.string(), z.number()])
    .describe("The PromptLayer request ID to associate the prompt with"),
  prompt_name: z
    .string()
    .describe("Name of the prompt template in the registry"),
  prompt_input_variables: z
    .record(z.unknown())
    .optional()
    .describe("Input variables used to format the prompt template"),
  version: z
    .number()
    .int()
    .optional()
    .describe("Version number of the prompt template (defaults to latest)"),
  label: z
    .string()
    .optional()
    .describe("Release label of the prompt template version"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Track Score (POST /rest/track-score) ─────────────────────────────────

export const TrackScoreArgsSchema = z.object({
  request_id: z
    .union([z.string(), z.number()])
    .describe("The PromptLayer request ID to score"),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Score value between 0 and 100"),
  score_name: z
    .string()
    .optional()
    .describe("Optional name for the score (enables multiple scores per request)"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Track Metadata (POST /rest/track-metadata) ──────────────────────────

export const TrackMetadataArgsSchema = z.object({
  request_id: z
    .union([z.string(), z.number()])
    .describe("The PromptLayer request ID to associate metadata with"),
  metadata: z
    .record(z.unknown())
    .describe("Metadata dictionary (e.g. session_id, user_id, location)"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Track Group (POST /rest/track-group) ─────────────────────────────────

export const TrackGroupArgsSchema = z.object({
  request_id: z
    .union([z.string(), z.number()])
    .describe("The PromptLayer request ID to associate with a group"),
  group_id: z
    .number()
    .int()
    .describe("The group ID to associate the request with"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Spans Bulk (POST /spans-bulk) ─────────────────────────────────

export const CreateSpansBulkArgsSchema = z.object({
  spans: z
    .array(z.record(z.unknown()))
    .describe("Array of span objects to create. Each span describes an operation within a trace."),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ═══════════════════════════════════════════════════════════════════════════
//  DATASETS
// ═══════════════════════════════════════════════════════════════════════════

// ── List Datasets (GET /api/public/v2/datasets) ──────────────────────────

export const ListDatasetsArgsSchema = z.object({
  page: z.number().int().optional().describe("Page number for pagination"),
  per_page: z.number().int().optional().describe("Number of items per page"),
  name: z.string().optional().describe("Filter datasets by name (case-insensitive partial match)"),
  status: z
    .enum(["active", "deleted", "all"])
    .optional()
    .describe("Filter by status: 'active' (default), 'deleted', or 'all'"),
  dataset_group_id: z.number().int().optional().describe("Filter by dataset group ID"),
  prompt_id: z.number().int().optional().describe("Filter by prompt ID"),
  report_id: z.number().int().optional().describe("Filter by report ID"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Dataset Group (POST /api/public/v2/dataset-groups) ────────────

export const CreateDatasetGroupArgsSchema = z.object({
  name: z.string().describe("Name for the dataset group (must be unique within workspace)"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Dataset Version from File (POST /api/public/v2/dataset-versions/from-file)

export const CreateDatasetVersionFromFileArgsSchema = z.object({
  dataset_group_id: z
    .number()
    .int()
    .describe("The dataset group ID to create a version for"),
  file_content: z
    .string()
    .describe("The CSV or JSON file content as a string"),
  file_name: z
    .string()
    .describe("The file name with extension (e.g. 'data.csv' or 'data.json')"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Dataset Version from Filter Params (POST /api/public/v2/dataset-versions/from-filter-params)

export const CreateDatasetVersionFromFilterParamsArgsSchema = z.object({
  dataset_group_id: z
    .number()
    .int()
    .describe("The dataset group ID to create a version for"),
  filter_params: z
    .record(z.unknown())
    .describe("Filter parameters to select request logs for the dataset"),
  columns: z
    .array(z.string())
    .optional()
    .describe("Columns to include in the dataset"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ═══════════════════════════════════════════════════════════════════════════
//  EVALUATIONS
// ═══════════════════════════════════════════════════════════════════════════

// ── List Evaluations (GET /api/public/v2/evaluations) ────────────────────

export const ListEvaluationsArgsSchema = z.object({
  page: z.number().int().optional().describe("Page number for pagination"),
  per_page: z.number().int().optional().describe("Number of items per page"),
  name: z.string().optional().describe("Filter evaluations by name (case-insensitive partial match)"),
  status: z
    .enum(["active", "deleted", "all"])
    .optional()
    .describe("Filter by status: 'active' (default), 'deleted', or 'all'"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Evaluation Pipeline / Report (POST /reports) ──────────────────

export const CreateReportArgsSchema = z.object({
  dataset_group_id: z
    .number()
    .int()
    .describe("ID of the dataset group to use for the evaluation"),
  name: z
    .string()
    .optional()
    .describe("Name for the evaluation pipeline (auto-generated if not provided)"),
  folder_id: z.number().int().optional().describe("Folder ID for organization"),
  dataset_version_number: z
    .number()
    .int()
    .optional()
    .describe("Specific dataset version number (uses latest if not provided)"),
  columns: z
    .array(z.record(z.unknown()))
    .optional()
    .describe("List of evaluation columns to add (each with column_type, name, configuration)"),
  score_configuration: z
    .record(z.unknown())
    .optional()
    .describe("Custom scoring logic configuration"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Run Evaluation (POST /reports/{report_id}/run) ───────────────────────

export const RunReportArgsSchema = z.object({
  report_id: z
    .number()
    .int()
    .describe("The report/evaluation pipeline ID to run"),
  name: z
    .string()
    .optional()
    .describe("Name for this evaluation run"),
  dataset_id: z
    .number()
    .int()
    .optional()
    .describe("Specific dataset ID to run against (uses configured dataset if not provided)"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Evaluation (GET /reports/{report_id}) ────────────────────────────

export const GetReportArgsSchema = z.object({
  report_id: z
    .number()
    .int()
    .describe("The report/evaluation pipeline ID to retrieve"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Evaluation Score (GET /reports/{report_id}/score) ────────────────

export const GetReportScoreArgsSchema = z.object({
  report_id: z
    .number()
    .int()
    .describe("The report/evaluation pipeline ID to get the score for"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Add Column to Evaluation Pipeline (POST /report-columns) ────────────

export const AddReportColumnArgsSchema = z.object({
  report_id: z
    .number()
    .int()
    .describe("The report/evaluation pipeline ID to add the column to"),
  column_type: z
    .string()
    .describe(
      "Type of column: PROMPT_TEMPLATE, ENDPOINT, MCP, HUMAN, CODE_EXECUTION, CODING_AGENT, " +
      "CONVERSATION_SIMULATOR, WORKFLOW, LLM_ASSERTION, AI_DATA_EXTRACTION, COMPARE, CONTAINS, " +
      "REGEX, REGEX_EXTRACTION, COSINE_SIMILARITY, ABSOLUTE_NUMERIC_DISTANCE, JSON_PATH, " +
      "XML_PATH, PARSE_VALUE, APPLY_DIFF, VARIABLE, ASSERT_VALID, COALESCE, COMBINE_COLUMNS, " +
      "COUNT, MATH_OPERATOR, MIN_MAX"
    ),
  name: z.string().describe("Display name for the column (must be unique within the pipeline)"),
  configuration: z
    .record(z.unknown())
    .describe("Column-type-specific configuration object"),
  position: z
    .number()
    .int()
    .optional()
    .describe("Position in the pipeline (auto-assigned if not provided)"),
  is_part_of_score: z
    .boolean()
    .optional()
    .describe("Whether this column contributes to the score calculation"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Configure Custom Scoring (PATCH /reports/{report_id}/score-card) ─────

export const UpdateReportScoreCardArgsSchema = z.object({
  report_id: z
    .number()
    .int()
    .describe("The report/evaluation pipeline ID to configure scoring for"),
  column_names: z
    .array(z.string())
    .describe("List of column names to include in score calculation"),
  code: z
    .string()
    .optional()
    .describe("Custom Python or JavaScript code for score calculation"),
  code_language: z
    .enum(["PYTHON", "JAVASCRIPT"])
    .optional()
    .describe("Language of the custom code: 'PYTHON' (default) or 'JAVASCRIPT'"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Delete Reports by Name (DELETE /reports/name/{report_name}) ──────────

export const DeleteReportsByNameArgsSchema = z.object({
  report_name: z
    .string()
    .describe("Name of the reports to archive"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ═══════════════════════════════════════════════════════════════════════════
//  AGENTS / WORKFLOWS
// ═══════════════════════════════════════════════════════════════════════════

// ── List Agents (GET /workflows) ─────────────────────────────────────────

export const ListWorkflowsArgsSchema = z.object({
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Create Agent (POST /rest/workflows) ──────────────────────────────────

export const CreateWorkflowArgsSchema = z.object({
  name: z
    .string()
    .optional()
    .describe("Name for a new agent. Cannot be used with workflow_id or workflow_name."),
  workflow_id: z
    .number()
    .int()
    .optional()
    .describe("ID of an existing agent to create a new version for"),
  workflow_name: z
    .string()
    .optional()
    .describe("Name of an existing agent to create a new version for"),
  folder_id: z
    .number()
    .int()
    .optional()
    .describe("Folder ID to place the agent in"),
  commit_message: z
    .string()
    .optional()
    .describe("Message describing the changes in this version"),
  nodes: z
    .array(z.record(z.unknown()))
    .describe("Array of node objects. Each needs: name (string), node_type (string), configuration (object), is_output_node (boolean). Optional: dependencies (string[])."),
  required_input_variables: z
    .record(z.string())
    .optional()
    .describe("Map of variable names to their types, e.g. {\"user_query\": \"string\"}"),
  edges: z
    .array(z.record(z.unknown()))
    .optional()
    .describe("Conditional connections between nodes. Each needs: source_node_name, target_node_name, is_and (boolean), conditionals (array)."),
  release_labels: z
    .array(z.string())
    .optional()
    .describe("Release labels to assign (e.g. ['production', 'staging'])"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Update Agent / PATCH (PATCH /rest/workflows/{workflow_id_or_name}) ───

export const PatchWorkflowArgsSchema = z.object({
  workflow_id_or_name: z
    .string()
    .describe("The ID or name of the Agent to update"),
  base_version: z
    .number()
    .int()
    .optional()
    .describe("Base version to apply changes on top of (defaults to latest)"),
  commit_message: z
    .string()
    .optional()
    .describe("Commit message for this version"),
  nodes: z
    .record(z.unknown())
    .optional()
    .describe("Node updates to merge (set a node to null to remove it)"),
  required_input_variables: z
    .record(z.string())
    .optional()
    .describe("Updated required input variables"),
  edges: z
    .array(z.record(z.unknown()))
    .optional()
    .describe("Updated edge configurations"),
  release_labels: z
    .array(z.string())
    .optional()
    .describe("Release labels to assign to the new version"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Run Agent (POST /workflows/{workflow_name}/run) ──────────────────────

export const RunWorkflowArgsSchema = z.object({
  workflow_name: z
    .string()
    .describe("Name of the agent to run (used as path parameter)"),
  input_variables: z
    .record(z.unknown())
    .optional()
    .describe("Input variables for the agent execution"),
  workflow_version_number: z
    .number()
    .int()
    .optional()
    .describe("Specific version number to run (defaults to latest)"),
  workflow_label_name: z
    .string()
    .optional()
    .describe("Release label name to run (e.g. 'prod')"),
  metadata: z
    .record(z.unknown())
    .optional()
    .describe("Metadata key-value pairs to attach to the execution"),
  return_all_outputs: z
    .boolean()
    .optional()
    .describe("If true, return all node outputs. If false (default), return only final output."),
  callback_url: z
    .string()
    .optional()
    .describe("HTTP URL for async webhook. When set, returns 202 immediately and POSTs results to this URL on completion."),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Agent Version Execution Results (GET /workflow-version-execution-results)

export const GetWorkflowVersionExecutionResultsArgsSchema = z.object({
  workflow_version_execution_id: z
    .number()
    .int()
    .describe("The workflow version execution ID to retrieve results for"),
  return_all_outputs: z
    .boolean()
    .optional()
    .describe("If true, include all output nodes in the response"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ═══════════════════════════════════════════════════════════════════════════
//  FOLDERS
// ═══════════════════════════════════════════════════════════════════════════

// ── Create Folder (POST /api/public/v2/folders) ──────────────────────────

export const CreateFolderArgsSchema = z.object({
  name: z
    .string()
    .describe("Name for the folder (must be unique within its parent)"),
  parent_id: z
    .number()
    .int()
    .optional()
    .describe("Parent folder ID for nesting (root level if not provided)"),
  api_key: z
    .string()
    .optional()
    .describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ═══════════════════════════════════════════════════════════════════════════
//  DERIVED TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type GetPromptTemplateParams = Omit<
  z.infer<typeof GetPromptTemplateArgsSchema>,
  "prompt_name" | "api_key"
>;
export type ListPromptTemplatesParams = Omit<
  z.infer<typeof ListPromptTemplatesArgsSchema>,
  "api_key"
>;

// ── Prompt template schemas (kept for response typing) ───────────────────

const ImageURLSchema = z.object({
  url: z.string(),
  detail: z.string().nullable().optional(),
});

const MediaSchema = z.object({
  title: z.string().describe("Title of the media"),
  type: z.string().describe("Type of the media. For example, image/png"),
  url: z.string(),
});

export const TextContentSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  id: z.null().optional(),
  annotations: z.null().optional(),
});

export const ThinkingContentSchema = z.object({
  type: z.literal("thinking"),
  thinking: z.string(),
});

export const ImageContentSchema = z.object({
  type: z.literal("image_url"),
  image_url: ImageURLSchema,
  image_variable: z.string().nullable().optional(),
  id: z.null().optional(),
  annotations: z.null().optional(),
});

export const MediaContentSchema = z.object({
  type: z.literal("media"),
  media: MediaSchema,
});

export const MediaVariableSchema = z.object({
  type: z.literal("media_variable"),
  name: z.string(),
});

export const PromptContentBlockSchema = z.discriminatedUnion("type", [
  TextContentSchema,
  ThinkingContentSchema,
  ImageContentSchema,
  MediaContentSchema,
  MediaVariableSchema,
]);

export const CompletionPromptSchema = z
  .object({
    type: z.literal("completion"),
    content: z.array(PromptContentBlockSchema),
    input_variables: z.array(z.string()).default([]),
    template_format: z.enum(["f-string", "jinja2"]).default("f-string"),
  })
  .passthrough();

const MessageContentBlockSchema = z.discriminatedUnion("type", [
  TextContentSchema,
  ImageContentSchema,
  MediaContentSchema,
  MediaVariableSchema,
]);

const AssistantContentBlockSchema = z.discriminatedUnion("type", [
  TextContentSchema,
  ThinkingContentSchema,
  ImageContentSchema,
]);

const SystemMessageSchema = z.object({
  role: z.literal("system"),
  content: z.array(MessageContentBlockSchema),
  input_variables: z.array(z.string()).default([]),
  template_format: z.enum(["f-string", "jinja2"]).default("f-string"),
  name: z.string().nullable().optional(),
  raw_request_display_role: z.string().default(""),
  dataset_examples: z.array(z.unknown()).default([]),
});

const UserMessageSchema = z.object({
  role: z.literal("user"),
  content: z.array(MessageContentBlockSchema),
  input_variables: z.array(z.string()).default([]),
  template_format: z.enum(["f-string", "jinja2"]).default("f-string"),
  name: z.string().nullable().optional(),
  raw_request_display_role: z.string().default(""),
  dataset_examples: z.array(z.unknown()).default([]),
});

const FunctionCallSchema = z.object({
  name: z.string(),
  arguments: z.string(),
});

const ToolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function").default("function"),
  function: FunctionCallSchema,
});

const AssistantMessageSchema = z.object({
  role: z.literal("assistant"),
  content: z.array(AssistantContentBlockSchema).nullable().optional(),
  input_variables: z.array(z.string()).default([]),
  template_format: z.enum(["f-string", "jinja2"]).default("f-string"),
  function_call: FunctionCallSchema.nullable().optional(),
  tool_calls: z.array(ToolCallSchema).nullable().default([]),
  name: z.string().nullable().optional(),
  raw_request_display_role: z.string().default(""),
  dataset_examples: z.array(z.unknown()).default([]),
});

const FunctionMessageSchema = z.object({
  role: z.literal("function"),
  name: z.string(),
  content: z.array(MessageContentBlockSchema).nullable().optional(),
  input_variables: z.array(z.string()).default([]),
  template_format: z.enum(["f-string", "jinja2"]).default("f-string"),
  raw_request_display_role: z.string().default(""),
  dataset_examples: z.array(z.unknown()).default([]),
});

const ToolMessageSchema = z.object({
  role: z.literal("tool"),
  content: z.array(PromptContentBlockSchema),
  tool_call_id: z.string(),
  name: z.string().nullable().optional(),
  input_variables: z.array(z.string()).default([]),
  template_format: z.enum(["f-string", "jinja2"]).default("f-string"),
  raw_request_display_role: z.string().default(""),
  dataset_examples: z.array(z.unknown()).default([]),
});

const PlaceholderMessageSchema = z.object({
  role: z.literal("placeholder"),
  name: z.string(),
  content: z.array(MessageContentBlockSchema).nullable().default(null),
  raw_request_display_role: z.string().default(""),
  input_variables: z.array(z.string()).default([]),
  template_format: z.enum(["f-string", "jinja2"]).default("f-string"),
});

const DeveloperMessageSchema = z.object({
  role: z.literal("developer"),
  content: z.array(MessageContentBlockSchema),
  name: z.string().nullable().optional(),
  input_variables: z.array(z.string()).default([]),
  template_format: z.enum(["f-string", "jinja2"]).default("f-string"),
  raw_request_display_role: z.string().default(""),
  dataset_examples: z.array(z.unknown()).default([]),
});

const ChatMessageSchema = z.discriminatedUnion("role", [
  SystemMessageSchema,
  UserMessageSchema,
  AssistantMessageSchema,
  FunctionMessageSchema,
  ToolMessageSchema,
  PlaceholderMessageSchema,
  DeveloperMessageSchema,
]);

const FunctionSchema = z.object({
  name: z.string(),
  description: z.string().default(""),
  parameters: z.record(z.unknown()).default({ type: "object", properties: {} }),
});

const ToolSchema = z.object({
  type: z.literal("function").default("function"),
  function: FunctionSchema,
});

const MessageFunctionCallSchema = z.object({
  name: z.string(),
});

const ChatToolChoiceSchema = z.object({
  type: z.literal("function").default("function"),
  function: MessageFunctionCallSchema,
});

export const ChatPromptSchema = z.object({
  type: z.literal("chat"),
  messages: z.array(ChatMessageSchema),
  functions: z.array(FunctionSchema).nullable().default([]),
  tools: z.array(ToolSchema).nullable().optional(),
  function_call: z
    .union([z.string(), MessageFunctionCallSchema])
    .nullable()
    .optional(),
  tool_choice: z
    .union([z.string(), ChatToolChoiceSchema])
    .nullable()
    .optional(),
  input_variables: z.array(z.string()).default([]),
  dataset_examples: z.array(z.unknown()).default([]),
});

export const PromptTemplateSchema = z.discriminatedUnion("type", [
  CompletionPromptSchema,
  ChatPromptSchema,
]);

const ModelParametersSchema = z.record(z.unknown());
const LlmKwargsSchema = z.record(z.unknown());

const MetadataModelSchema = z.object({
  provider: z.string(),
  name: z.string(),
  parameters: ModelParametersSchema.default({}),
  model_config_display_name: z.string().nullable().optional(),
  base_model: z.string().nullable().optional(),
  api_type: z.string().optional(),
  display_params: z.record(z.unknown()).default({}),
});

const MetadataSchema = z
  .object({
    model: MetadataModelSchema.optional(),
    customField: z.string().optional(),
    markdown_enabled: z.boolean().optional(),
  })
  .nullable()
  .optional();

const SnippetReferenceSchema = z.object({
  prompt_name: z.string(),
  version: z.number(),
});

export const GetPromptTemplateResponseSchema = z
  .object({
    success: z.boolean().optional(),
    id: z.number(),
    workspace_id: z.number(),
    prompt_name: z.string(),
    prompt_template: PromptTemplateSchema,
    metadata: MetadataSchema,
    commit_message: z.string().nullable().optional(),
    llm_kwargs: LlmKwargsSchema.nullable().optional(),
    version: z.number(),
    tags: z.array(z.unknown()).default([]),
    snippets: z.array(SnippetReferenceSchema).optional(),
    warning: z.string().nullable().optional(),
    request_id: z.string().optional(),
    provider_id: z.number().nullable().optional(),
    custom_provider: z.record(z.unknown()).nullable().optional(),
    provider_base_url: z.record(z.unknown()).nullable().optional(),
  })
  .passthrough();

export const ListPromptTemplateItemSchema = z.object({
  id: z.number(),
  workspace_id: z.number(),
  prompt_name: z.string(),
  prompt_template: PromptTemplateSchema,
  metadata: MetadataSchema,
  commit_message: z.string().nullable().optional(),
  llm_kwargs: LlmKwargsSchema.nullable().optional(),
  version: z.number(),
  tags: z.array(z.unknown()).default([]),
  folder_id: z.number().nullable().optional(),
  parent_folder_name: z.string().nullable().optional(),
  full_folder_path: z.string().nullable().optional(),
});

export const ListPromptTemplatesResponseSchema = z.object({
  has_next: z.boolean(),
  has_prev: z.boolean(),
  items: z.array(ListPromptTemplateItemSchema),
  next_num: z.number().nullable(),
  prev_num: z.number().nullable(),
  page: z.number(),
  pages: z.number(),
  per_page: z.number(),
  total: z.number(),
});

export type GetPromptTemplateResponse = z.infer<
  typeof GetPromptTemplateResponseSchema
>;
export type ListPromptTemplateItem = z.infer<
  typeof ListPromptTemplateItemSchema
>;
export type ListPromptTemplatesResponse = z.infer<
  typeof ListPromptTemplatesResponseSchema
>;

// ═══════════════════════════════════════════════════════════════════════════
//  TOOL DEFINITIONS – Single source for MCP tool metadata + schemas
// ═══════════════════════════════════════════════════════════════════════════

export const TOOL_DEFINITIONS = {
  // ── Prompt Templates ────────────────────────────────────────────────
  "get-prompt-template": {
    name: "get-prompt-template",
    title: "Get Prompt Template",
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
    title: "Get Prompt Template (Raw)",
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
    title: "List Prompt Templates",
    description:
      "List all prompt templates in the workspace with pagination. " +
      "Filter by name (partial match), release label, or status (active/deleted/all).",
    inputSchema: ListPromptTemplatesArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "publish-prompt-template": {
    name: "publish-prompt-template",
    title: "Publish Prompt Template",
    description:
      "Create a new version of a prompt template. If the prompt_name doesn't exist, creates it. " +
      "The prompt_template object must be in chat format ({type:'chat', messages:[...]}) " +
      "or completion format ({type:'completion', content:[...]}). " +
      "Optionally assign release labels, tags, and metadata with model configuration.",
    inputSchema: PublishPromptTemplateArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "list-prompt-template-labels": {
    name: "list-prompt-template-labels",
    title: "List Prompt Template Labels",
    description:
      "List all release labels (e.g. 'prod', 'staging') assigned to a prompt template.",
    inputSchema: ListPromptTemplateLabelsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-prompt-label": {
    name: "create-prompt-label",
    title: "Create Prompt Template Label",
    description:
      "Attach a release label to a prompt template version. " +
      "Use labels like 'prod', 'staging', 'dev' to manage deployment of prompt versions. " +
      "Requires the prompt version ID (from get-prompt-template or list-prompt-templates).",
    inputSchema: CreatePromptLabelArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "move-prompt-label": {
    name: "move-prompt-label",
    title: "Move Prompt Template Label",
    description:
      "Move a release label from one prompt version to another. " +
      "Use this to promote a new version to 'prod' without deleting and recreating the label. " +
      "Requires the prompt_label_id (from list-prompt-template-labels).",
    inputSchema: MovePromptLabelArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-prompt-label": {
    name: "delete-prompt-label",
    title: "Delete Prompt Template Label",
    description:
      "Delete a release label from a prompt template version. " +
      "Requires prompt_label_id (from list-prompt-template-labels).",
    inputSchema: DeletePromptLabelArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-snippet-usage": {
    name: "get-snippet-usage",
    title: "Get Snippet Usage",
    description:
      "Find all prompts that reference a given snippet (prompt template used as @@@snippet@@@). " +
      "Returns prompt names, version numbers, and release labels that use the snippet.",
    inputSchema: GetSnippetUsageArgsSchema,
    annotations: { readOnlyHint: true },
  },

  // ── Tracking ────────────────────────────────────────────────────────
  "log-request": {
    name: "log-request",
    title: "Log Request",
    description:
      "Log an LLM request/response pair to PromptLayer. Use for custom provider integrations " +
      "or when not using PromptLayer's proxied clients. Input and output must be in Prompt Blueprint " +
      "format: {type:'chat', messages:[{role, content:[{type:'text', text}]}]}. " +
      "Supports structured outputs, tool calls, and extended thinking.",
    inputSchema: LogRequestArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-prompt": {
    name: "track-prompt",
    title: "Track Prompt",
    description:
      "Associate a prompt template with a previously logged request (by request_id). " +
      "Links the request to a prompt in the registry for usage, latency, and cost tracking.",
    inputSchema: TrackPromptArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-score": {
    name: "track-score",
    title: "Track Score",
    description:
      "Assign a score (0-100) to a logged request. Use score_name to store multiple " +
      "named scores per request (e.g. 'relevance', 'accuracy').",
    inputSchema: TrackScoreArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-metadata": {
    name: "track-metadata",
    title: "Track Metadata",
    description:
      "Attach metadata key-value pairs to a logged request. " +
      "Common uses: session_id, user_id, environment, experiment_id. " +
      "Metadata is searchable and filterable in the PromptLayer dashboard.",
    inputSchema: TrackMetadataArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-group": {
    name: "track-group",
    title: "Track Group",
    description:
      "Associate a logged request with a group for organizing related requests together " +
      "(e.g. multi-turn conversations, pipeline steps).",
    inputSchema: TrackGroupArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "create-spans-bulk": {
    name: "create-spans-bulk",
    title: "Create Spans Bulk",
    description:
      "Create multiple OpenTelemetry-compatible spans in bulk for distributed tracing. " +
      "Each span has context (trace_id, span_id), timing, status, attributes, and optional log_request data. " +
      "Use to instrument multi-step LLM pipelines.",
    inputSchema: CreateSpansBulkArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Datasets ────────────────────────────────────────────────────────
  "list-datasets": {
    name: "list-datasets",
    title: "List Datasets",
    description:
      "List datasets with pagination. Filter by name (partial match), status, " +
      "dataset_group_id, prompt_id, or report_id.",
    inputSchema: ListDatasetsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-dataset-group": {
    name: "create-dataset-group",
    title: "Create Dataset Group",
    description:
      "Create a new dataset group (container for dataset versions). " +
      "An initial empty draft version (version_number=-1) is created automatically. " +
      "Names must be unique within the workspace.",
    inputSchema: CreateDatasetGroupArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "create-dataset-version-from-file": {
    name: "create-dataset-version-from-file",
    title: "Create Dataset Version from File",
    description:
      "Upload CSV or JSON content to create a new dataset version. " +
      "Processed asynchronously (webhooks fire on completion). Max 100MB. " +
      "Requires an existing dataset_group_id (from create-dataset-group or list-datasets).",
    inputSchema: CreateDatasetVersionFromFileArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "create-dataset-version-from-filter-params": {
    name: "create-dataset-version-from-filter-params",
    title: "Create Dataset Version from Request History",
    description:
      "Create a dataset version by filtering existing PromptLayer request logs. " +
      "Populated asynchronously. Use to build eval datasets from production traffic.",
    inputSchema: CreateDatasetVersionFromFilterParamsArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Evaluations ─────────────────────────────────────────────────────
  "list-evaluations": {
    name: "list-evaluations",
    title: "List Evaluations",
    description:
      "List evaluation pipelines with pagination. Filter by name (partial match) and status.",
    inputSchema: ListEvaluationsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-report": {
    name: "create-report",
    title: "Create Evaluation Pipeline",
    description:
      "Create a new evaluation pipeline linked to a dataset group. " +
      "Optionally include columns (evaluation steps) and scoring configuration upfront. " +
      "Columns can also be added later with add-report-column.",
    inputSchema: CreateReportArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "run-report": {
    name: "run-report",
    title: "Run Evaluation",
    description:
      "Execute an evaluation pipeline against its dataset. " +
      "Runs all columns sequentially left-to-right. Optionally override the dataset_id.",
    inputSchema: RunReportArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-report": {
    name: "get-report",
    title: "Get Evaluation",
    description:
      "Get evaluation pipeline details by report_id. " +
      "Use get-report-score instead to retrieve the computed score.",
    inputSchema: GetReportArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-report-score": {
    name: "get-report-score",
    title: "Get Evaluation Score",
    description: "Get the computed score for an evaluation pipeline by report_id.",
    inputSchema: GetReportScoreArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "add-report-column": {
    name: "add-report-column",
    title: "Add Column to Evaluation Pipeline",
    description:
      "Add one evaluation step (column) to a pipeline. Only one column per request. " +
      "Columns run left-to-right and can reference previous columns. " +
      "Primary types: PROMPT_TEMPLATE, CODE_EXECUTION, ENDPOINT, WORKFLOW, MCP, HUMAN. " +
      "Eval types: LLM_ASSERTION, COMPARE, CONTAINS, REGEX, COSINE_SIMILARITY. " +
      "Helper types: JSON_PATH, VARIABLE, COALESCE, COMBINE_COLUMNS, MATH_OPERATOR.",
    inputSchema: AddReportColumnArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "update-report-score-card": {
    name: "update-report-score-card",
    title: "Configure Custom Scoring",
    description:
      "Set custom scoring logic for an evaluation pipeline. " +
      "Specify column_names to include in the score. Optionally provide custom Python or JavaScript " +
      "code that receives a 'data' list of row dicts and must return {score: 0-100}.",
    inputSchema: UpdateReportScoreCardArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-reports-by-name": {
    name: "delete-reports-by-name",
    title: "Delete Reports by Name",
    description: "Archive all evaluation pipelines (reports) with the given name in the workspace.",
    inputSchema: DeleteReportsByNameArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Agents / Workflows ──────────────────────────────────────────────
  "list-workflows": {
    name: "list-workflows",
    title: "List Agents",
    description: "List all agents (formerly called workflows) in the workspace.",
    inputSchema: ListWorkflowsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-workflow": {
    name: "create-workflow",
    title: "Create Agent",
    description:
      "Create a new agent or a new version of an existing agent. " +
      "For new agents, provide 'name'. For new versions, provide workflow_id or workflow_name. " +
      "Each node needs: name, node_type, configuration, is_output_node (at least one must be true). " +
      "Use edges for conditional branching between nodes.",
    inputSchema: CreateWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "patch-workflow": {
    name: "patch-workflow",
    title: "Update Agent (PATCH)",
    description:
      "Partially update an agent by merging node changes into a new version. " +
      "Only send the nodes you want to change. Set a node value to null to remove it. " +
      "Fetches base_version (or latest) and merges your updates.",
    inputSchema: PatchWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "run-workflow": {
    name: "run-workflow",
    title: "Run Agent",
    description:
      "Execute an agent by name. Pass input_variables and optionally pin a version or label. " +
      "Returns 201 with results, or 202 if callback_url is provided (async webhook). " +
      "Set return_all_outputs=true to get all node outputs instead of just the final one.",
    inputSchema: RunWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-workflow-version-execution-results": {
    name: "get-workflow-version-execution-results",
    title: "Get Agent Execution Results",
    description:
      "Poll for agent execution results. Returns 200 when complete, 202 when still running. " +
      "Set return_all_outputs=true to include all node outputs with status, value, and errors.",
    inputSchema: GetWorkflowVersionExecutionResultsArgsSchema,
    annotations: { readOnlyHint: true },
  },

  // ── Folders ─────────────────────────────────────────────────────────
  "create-folder": {
    name: "create-folder",
    title: "Create Folder",
    description:
      "Create a folder for organizing prompt templates and other resources. " +
      "Nest folders by setting parent_id. Names must be unique within their parent.",
    inputSchema: CreateFolderArgsSchema,
    annotations: { readOnlyHint: false },
  },
} as const;
