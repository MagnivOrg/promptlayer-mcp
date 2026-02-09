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
  function_name: z
    .string()
    .describe("The name of the LLM function called (e.g. 'openai.chat.completions.create')"),
  provider_type: z
    .string()
    .optional()
    .describe("Provider type (e.g. 'openai', 'anthropic')"),
  args: z
    .array(z.unknown())
    .optional()
    .describe("Positional arguments passed to the function"),
  kwargs: z
    .record(z.unknown())
    .optional()
    .describe("Keyword arguments / parameters passed to the function (model, messages, temperature, etc.)"),
  tags: z
    .array(z.string())
    .optional()
    .describe("Tags to associate with the request"),
  request_response: z
    .record(z.unknown())
    .optional()
    .describe("The response from the LLM provider"),
  request_start_time: z
    .number()
    .optional()
    .describe("Unix timestamp when the request started"),
  request_end_time: z
    .number()
    .optional()
    .describe("Unix timestamp when the request ended"),
  metadata: z
    .record(z.unknown())
    .optional()
    .describe("Metadata dictionary to associate with the request"),
  prompt_id: z
    .number()
    .int()
    .optional()
    .describe("Prompt template version ID to associate with this request"),
  prompt_version: z
    .number()
    .int()
    .optional()
    .describe("Prompt template version number"),
  prompt_input_variables: z
    .record(z.unknown())
    .optional()
    .describe("Input variables used with the prompt template"),
  group_id: z
    .number()
    .int()
    .optional()
    .describe("Group ID to associate with the request"),
  return_pl_id: z
    .boolean()
    .optional()
    .describe("If true, returns the PromptLayer request ID"),
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
  workflow_name: z
    .string()
    .optional()
    .describe("Name for the agent (required for new agents)"),
  workflow_id: z
    .number()
    .int()
    .optional()
    .describe("ID of existing agent to create a new version for"),
  commit_message: z
    .string()
    .optional()
    .describe("Commit message for this version"),
  nodes: z
    .array(z.record(z.unknown()))
    .describe("Array of node configurations for the agent"),
  required_input_variables: z
    .record(z.string())
    .optional()
    .describe("Map of required input variable names to their types"),
  edges: z
    .array(z.record(z.unknown()))
    .optional()
    .describe("Array of edge configurations connecting nodes"),
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
    .describe("Name of the agent/workflow to run"),
  input_variables: z
    .record(z.unknown())
    .optional()
    .describe("Input variables to pass to the agent"),
  version: z
    .number()
    .int()
    .optional()
    .describe("Specific version to run (defaults to latest)"),
  label: z
    .string()
    .optional()
    .describe("Release label to use (e.g. 'prod')"),
  metadata: z
    .record(z.unknown())
    .optional()
    .describe("Metadata to associate with the execution"),
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
      "Retrieve a prompt template from PromptLayer using either the prompt_name or prompt_id. " +
      "Optionally, specify version (version number) or label (release label like 'prod') to retrieve a specific version. " +
      "If not specified, the latest version is returned. PromptLayer will try to read the model provider from the parameters " +
      "you attached to the prompt template. You can optionally pass in a provider to override the one set in the Prompt Registry. " +
      "This will return LLM-specific arguments that can be passed directly into your LLM client. To format the template with input variables, use input_variables.",
    inputSchema: GetPromptTemplateArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-prompt-template-raw": {
    name: "get-prompt-template-raw",
    title: "Get Prompt Template (Raw)",
    description:
      "Retrieve raw prompt template data without applying input variables. " +
      "Designed for GitHub sync, local caching, and template inspection. " +
      "By default, snippets are resolved (expanded). Use resolve_snippets=false to get the raw template with snippet references intact. " +
      "Unlike the POST endpoint, this GET endpoint does not accept input_variables or provider.",
    inputSchema: GetPromptTemplateRawArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "list-prompt-templates": {
    name: "list-prompt-templates",
    title: "List Prompt Templates",
    description:
      "Get a paginated list of all prompt templates in your workspace. Supports filtering by release label, " +
      "name (case-insensitive partial match), and status (active/deleted/all). Returns pagination information " +
      "including page numbers, total count, and navigation flags.",
    inputSchema: ListPromptTemplatesArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "publish-prompt-template": {
    name: "publish-prompt-template",
    title: "Publish Prompt Template",
    description:
      "Publish a new version of a prompt template programmatically. " +
      "Create or update prompt templates with chat or completion format, " +
      "commit messages, tags, metadata, and release labels.",
    inputSchema: PublishPromptTemplateArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "list-prompt-template-labels": {
    name: "list-prompt-template-labels",
    title: "List Prompt Template Labels",
    description:
      "Retrieve all release labels assigned to a prompt template. " +
      "Identifiers can be either prompt_name or prompt_id.",
    inputSchema: ListPromptTemplateLabelsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-prompt-label": {
    name: "create-prompt-label",
    title: "Create Prompt Template Label",
    description:
      "Create a release label for a prompt template version. " +
      "Labels like 'prod', 'staging', 'dev' help manage deployment of different prompt versions.",
    inputSchema: CreatePromptLabelArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "move-prompt-label": {
    name: "move-prompt-label",
    title: "Move Prompt Template Label",
    description:
      "Move a release label from one prompt template version to another. " +
      "This is useful for promoting a new version to 'prod' without deleting and recreating labels.",
    inputSchema: MovePromptLabelArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-prompt-label": {
    name: "delete-prompt-label",
    title: "Delete Prompt Template Label",
    description: "Delete a release label from a prompt template version.",
    inputSchema: DeletePromptLabelArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-snippet-usage": {
    name: "get-snippet-usage",
    title: "Get Snippet Usage",
    description:
      "Get all prompts that use a given snippet (prompt template). " +
      "Returns a list of prompts and their version numbers that reference this snippet, " +
      "as well as any release labels that reference it.",
    inputSchema: GetSnippetUsageArgsSchema,
    annotations: { readOnlyHint: true },
  },

  // ── Tracking ────────────────────────────────────────────────────────
  "log-request": {
    name: "log-request",
    title: "Log Request",
    description:
      "Log a request to PromptLayer. This is useful for logging requests from custom LLM providers. " +
      "Supports structured outputs, tool/function definitions, and all standard LLM request metadata.",
    inputSchema: LogRequestArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-prompt": {
    name: "track-prompt",
    title: "Track Prompt",
    description:
      "Associate a prompt template with a previously logged request. " +
      "Links the request to a specific prompt in the registry for tracking usage, latency, and cost.",
    inputSchema: TrackPromptArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-score": {
    name: "track-score",
    title: "Track Score",
    description:
      "Associate a score (0-100) with a request. " +
      "Supports multiple named scores per request via score_name parameter.",
    inputSchema: TrackScoreArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-metadata": {
    name: "track-metadata",
    title: "Track Metadata",
    description:
      "Associate a metadata dictionary with a request. " +
      "Useful for tracking session_ids, user_ids, location, and other contextual information.",
    inputSchema: TrackMetadataArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "track-group": {
    name: "track-group",
    title: "Track Group",
    description:
      "Associate a group with a request. Groups help organize related requests together.",
    inputSchema: TrackGroupArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "create-spans-bulk": {
    name: "create-spans-bulk",
    title: "Create Spans Bulk",
    description:
      "Create multiple spans in bulk for distributed tracing. " +
      "Each span describes an operation within a trace.",
    inputSchema: CreateSpansBulkArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Datasets ────────────────────────────────────────────────────────
  "list-datasets": {
    name: "list-datasets",
    title: "List Datasets",
    description:
      "Retrieve a paginated list of datasets. Supports filtering by name, status, " +
      "dataset group, prompt, report, and workspace.",
    inputSchema: ListDatasetsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-dataset-group": {
    name: "create-dataset-group",
    title: "Create Dataset Group",
    description:
      "Create a new dataset group within a workspace. " +
      "An initial draft dataset (version_number = -1) is automatically created. " +
      "Dataset group names must be unique within a workspace.",
    inputSchema: CreateDatasetGroupArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "create-dataset-version-from-file": {
    name: "create-dataset-version-from-file",
    title: "Create Dataset Version from File",
    description:
      "Create a new dataset version by uploading CSV or JSON file content. " +
      "The file is processed asynchronously. Maximum file size: 100MB.",
    inputSchema: CreateDatasetVersionFromFileArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "create-dataset-version-from-filter-params": {
    name: "create-dataset-version-from-filter-params",
    title: "Create Dataset Version from Filter Params",
    description:
      "Create a new dataset version by filtering existing request logs. " +
      "The dataset is populated asynchronously based on the provided filter parameters.",
    inputSchema: CreateDatasetVersionFromFilterParamsArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Evaluations ─────────────────────────────────────────────────────
  "list-evaluations": {
    name: "list-evaluations",
    title: "List Evaluations",
    description:
      "Retrieve a paginated list of evaluations in your workspace. " +
      "Supports filtering by name and status (active/deleted/all).",
    inputSchema: ListEvaluationsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-report": {
    name: "create-report",
    title: "Create Evaluation Pipeline",
    description:
      "Create a new evaluation pipeline (report) associated with a dataset. " +
      "Supports optional evaluation columns and custom scoring configuration.",
    inputSchema: CreateReportArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "run-report": {
    name: "run-report",
    title: "Run Evaluation",
    description:
      "Run an evaluation pipeline. Executes all columns in the pipeline against the dataset.",
    inputSchema: RunReportArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-report": {
    name: "get-report",
    title: "Get Evaluation",
    description:
      "Retrieve information about an evaluation pipeline by its report ID.",
    inputSchema: GetReportArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-report-score": {
    name: "get-report-score",
    title: "Get Evaluation Score",
    description:
      "Retrieve the score of a specific evaluation pipeline by its report ID.",
    inputSchema: GetReportScoreArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "add-report-column": {
    name: "add-report-column",
    title: "Add Column to Evaluation Pipeline",
    description:
      "Add a new evaluation step (column) to an existing evaluation pipeline. " +
      "Columns execute sequentially from left to right. Supports many column types " +
      "including PROMPT_TEMPLATE, CODE_EXECUTION, LLM_ASSERTION, and more.",
    inputSchema: AddReportColumnArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "update-report-score-card": {
    name: "update-report-score-card",
    title: "Configure Custom Scoring",
    description:
      "Configure custom scoring logic for an evaluation pipeline. " +
      "Specify which columns to include in score calculation and optionally provide custom code.",
    inputSchema: UpdateReportScoreCardArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-reports-by-name": {
    name: "delete-reports-by-name",
    title: "Delete Reports by Name",
    description:
      "Archive all reports with the specified name within the workspace.",
    inputSchema: DeleteReportsByNameArgsSchema,
    annotations: { readOnlyHint: false },
  },

  // ── Agents / Workflows ──────────────────────────────────────────────
  "list-workflows": {
    name: "list-workflows",
    title: "List Agents",
    description: "Get a list of all agents (workflows) in the system.",
    inputSchema: ListWorkflowsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-workflow": {
    name: "create-workflow",
    title: "Create Agent",
    description:
      "Create a new agent or a new version of an existing agent programmatically. " +
      "Define nodes, edges, input variables, and release labels.",
    inputSchema: CreateWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "patch-workflow": {
    name: "patch-workflow",
    title: "Update Agent (PATCH)",
    description:
      "Partially update an agent by creating a new version with merged changes. " +
      "Modify specific nodes without resending the entire configuration. " +
      "Set a node to null to remove it.",
    inputSchema: PatchWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "run-workflow": {
    name: "run-workflow",
    title: "Run Agent",
    description:
      "Run an agent/workflow by name. Pass input variables and optionally specify a version or release label.",
    inputSchema: RunWorkflowArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-workflow-version-execution-results": {
    name: "get-workflow-version-execution-results",
    title: "Get Agent Version Execution Results",
    description:
      "Retrieve the execution results of a specific agent version. " +
      "Returns 200 when finished, 202 when still running. " +
      "Set return_all_outputs=true to include all output nodes.",
    inputSchema: GetWorkflowVersionExecutionResultsArgsSchema,
    annotations: { readOnlyHint: true },
  },

  // ── Folders ─────────────────────────────────────────────────────────
  "create-folder": {
    name: "create-folder",
    title: "Create Folder",
    description:
      "Create a new folder in the workspace. Folders can be nested within other folders " +
      "by providing a parent_id. Folder names must be unique within their parent.",
    inputSchema: CreateFolderArgsSchema,
    annotations: { readOnlyHint: false },
  },
} as const;
