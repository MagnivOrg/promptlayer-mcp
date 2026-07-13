/**
 * TypeScript types and Zod schemas for PromptLayer API
 * All schemas verified against OpenAPI spec at:
 *   https://github.com/magnivorg/prompt-layer-docs/blob/master/openapi.json
 */

import { PUBLISH_PROMPT_TEMPLATE_SNIPPET_ORDERING_NOTE } from "./snippetPublishOrdering.js";
import { z } from "zod";
import {
  SMART_TABLE_CREATABLE_COLUMN_TYPES,
  buildCreateSmartTableColumnToolDescription,
  normalizeSmartTableColumnType,
  smartTableColumnTypeFieldDescription,
} from "./columnTypes.js";


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


// ── Structured filter primitives (shared by request search + Smart Table imports) ──
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

// ── Env Vars ─────────────────────────────────────────────────────────────

export const ListWorkspaceEnvVarsArgsSchema = z.object({
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const CreateWorkspaceEnvVarArgsSchema = z.object({
  key: z.string().describe("Env var name. Must match ^[A-Za-z_][A-Za-z0-9_]*$ and not be a reserved runtime name (PATH, LD_PRELOAD, PYTHONSTARTUP, NODE_OPTIONS, etc.)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const ListToolEnvVarsArgsSchema = z.object({
  identifier: z.string().describe("Tool ID (numeric) or name"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const CreateToolEnvVarArgsSchema = z.object({
  identifier: z.string().describe("Tool ID (numeric) or name"),
  key: z.string().describe("Env var name. Must match ^[A-Za-z_][A-Za-z0-9_]*$ and not be a reserved runtime name."),
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

// ── Get Request Analytics Custom Analytics (POST /api/public/v2/requests/analytics/custom-analytics) ──

const METRIC_FIELD_VALUES = [
  "input_tokens", "output_tokens", "cost", "latency_ms", "prompt_version_number",
  "turn_count", "tool_call_count", "cached_tokens", "thinking_tokens",
] as const;

const GROUP_BY_FIELD_VALUES = [
  "engine", "provider_type", "prompt_id", "prompt_version_number", "status",
  "error_type", "tags", "metadata_keys", "output_keys", "input_variable_keys", "tool_names",
] as const;

const CustomChartSeriesSpecSchema = z.object({
  key: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/).describe("Unique series key within the chart"),
  label: z.string().min(1).max(120).describe("Human-readable series label"),
  metric: z.enum(["count", "sum", "avg", "min", "max", "percentile", "distinct_count"]).describe("Aggregation function"),
  metricField: z.enum(METRIC_FIELD_VALUES).optional().describe("Numeric field to aggregate. Required unless metric is count or distinct_count"),
  distinctMetadataKey: z.string().min(1).max(120).optional().describe("Metadata key to count distinct values of. Required when metric is distinct_count"),
  percentile: z.number().min(0).max(100).optional().describe("Required when metric is percentile (0–100)"),
});

const DerivedRatioInsightSchema = z.object({
  label: z.string().min(1).max(200).describe("Display label for this insight"),
  numeratorSeriesKey: z.string().describe("Key of the numerator series"),
  denominatorSeriesKey: z.string().describe("Key of the denominator series"),
});

const CustomChartSpecSchema = z.object({
  id: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/).describe("Stable chart id (unique within the request)"),
  title: z.string().max(200).optional().describe("Optional display title; defaults to id"),
  chartType: z.enum(["bar", "line", "area", "pie", "donut", "histogram", "heatmap", "treemap", "sunburst"])
    .describe("Chart type. Overall aggregates (no timeSeries, no groupBy) must use bar"),
  metric: z.enum(["count", "sum", "avg", "min", "max", "percentile", "distinct_count"]).optional()
    .describe("Aggregation function. Omit when using series (multi-series mode)"),
  metricField: z.enum(METRIC_FIELD_VALUES).optional()
    .describe("Numeric field to aggregate. Required unless metric is count/distinct_count or using series"),
  distinctMetadataKey: z.string().min(1).max(120).optional()
    .describe("Metadata key to count distinct values of. Required when metric is distinct_count"),
  percentile: z.number().min(0).max(100).optional().describe("Required when metric is percentile"),
  series: z.array(CustomChartSeriesSpecSchema).min(2).optional()
    .describe("Multi-series mode: two or more series specs. Omit metric/metricField when using this"),
  derivedInsights: z.array(DerivedRatioInsightSchema).optional()
    .describe("Ratio insights computed from series totals. Multi-series only"),
  groupByField: z.enum(GROUP_BY_FIELD_VALUES).optional()
    .describe("Break down by this request log field. Cannot be combined with groupByMetadataKey"),
  groupByMetadataKey: z.string().min(1).max(120).optional()
    .describe("Break down by values of this metadata key. Cannot be combined with groupByField"),
  secondaryGroupByField: z.enum(GROUP_BY_FIELD_VALUES).optional()
    .describe("Second breakdown dimension — heatmap charts only. Cannot be combined with secondaryGroupByMetadataKey"),
  secondaryGroupByMetadataKey: z.string().min(1).max(120).optional()
    .describe("Second breakdown by values of this metadata key — heatmap charts only"),
  histogramField: z.enum(METRIC_FIELD_VALUES).optional()
    .describe("Numeric field to bucket — histogram charts only"),
  histogramInterval: z.number().positive().optional().describe("Histogram bucket width"),
  hierarchyFields: z.array(z.enum(GROUP_BY_FIELD_VALUES)).min(2).max(5).optional()
    .describe("Nested group-by levels — treemap and sunburst charts only"),
  timeSeries: z.boolean().optional().describe("Bucket results over time when true"),
  timeBucket: z.enum(["auto", "day", "week", "month"]).optional().describe("Time bucket size when timeSeries is true"),
  limit: z.number().int().min(1).max(100).optional().describe("Max group-by buckets to return (default 25)"),
});

export const GetRequestAnalyticsCustomAnalyticsArgsSchema = z.object({
  ...RequestLogQueryShape,
  customCharts: z.array(CustomChartSpecSchema).min(1)
    .describe("One or more analytics queries to compute. IDs must be unique within the request"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

// ── Get Trace Analytics Custom Analytics (POST /api/public/v2/traces/analytics/custom-analytics) ──
// Same chart engine as request custom analytics, but over trace documents.
// Charts aggregate at one of two levels: whole traces (trace_* fields) or the
// individual spans nested inside matching traces (span_* fields). A chart must
// stay at one level; the backend rejects mixed-level charts.

const TraceStructuredFilterSchema = z.object({
  field: z.enum([
    "trace_id", "trace_start", "trace_end", "trace_duration_ms", "trace_status",
    "trace_total_cost_usd", "trace_total_tokens", "trace_input_tokens", "trace_output_tokens",
    "trace_span_count", "trace_depth", "trace_run_by_user_id", "trace_models_used",
    "trace_prompt_ids", "trace_prompt_version_refs", "trace_workflow_ids",
    "trace_workflow_version_refs", "trace_tool_names", "trace_name",
    "span_id", "span_name", "span_type", "span_kind", "span_status",
    "span_duration_ms", "span_cost_usd", "span_tokens", "span_input_tokens", "span_output_tokens",
    "span_models_used", "span_prompt_id", "span_prompt_version_number", "span_prompt_version_ref",
    "span_workflow_id", "span_workflow_version_number", "span_workflow_version_ref",
    "span_tool_name", "span_input_variables", "span_output_text", "span_exception_text",
    "span_attributes", "span_resource", "span_depth", "span_total_child_count", "span_is_leaf",
  ]).describe("Trace-level (trace_*) or span-level (span_*) field to filter on"),
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
  nested_key: z.string().optional().describe("Key name for nested span field operators (span_attributes, span_resource, span_input_variables)"),
});

const TraceStructuredFilterGroupSchema: z.ZodType = z.object({
  logic: z.enum(["AND", "OR", "SPAN_AND", "SPAN_OR"]).optional().describe(
    "AND/OR are cross-span (branches may be satisfied by different spans of the trace). " +
    "SPAN_AND/SPAN_OR require one and the same span to satisfy every/any branch — span-level fields only"
  ),
  filters: z.array(z.union([TraceStructuredFilterSchema, z.lazy(() => TraceStructuredFilterGroupSchema)])).describe("Filters or nested filter groups"),
});

const TRACE_CHART_METRIC_FIELD_VALUES = [
  // Trace-level
  "trace_duration_ms", "trace_total_cost_usd", "trace_total_tokens",
  "trace_input_tokens", "trace_output_tokens", "trace_span_count", "trace_depth",
  // Span-level (nested spans of matching traces)
  "span_duration_ms", "span_cost_usd", "span_tokens", "span_input_tokens", "span_output_tokens",
] as const;

const TRACE_CHART_GROUP_BY_FIELD_VALUES = [
  // Trace-level
  "trace_status", "trace_name", "trace_models_used",
  "trace_prompt_ids", "trace_workflow_ids", "trace_tool_names",
  // Span-level (nested spans of matching traces)
  "span_tool_name", "span_name", "span_type", "span_kind", "span_status",
] as const;

const TraceCustomChartSeriesSpecSchema = z.object({
  key: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/).describe("Unique series key within the chart"),
  label: z.string().min(1).max(120).describe("Human-readable series label"),
  metric: z.enum(["sum", "avg", "min", "max", "percentile"]).describe("Aggregation function"),
  metricField: z.enum(TRACE_CHART_METRIC_FIELD_VALUES).describe("Numeric field to aggregate"),
  percentile: z.number().min(0).max(100).optional().describe("Required when metric is percentile (0–100)"),
});

const TraceCustomChartSpecSchema = z.object({
  id: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/).describe("Stable chart id (unique within the request)"),
  title: z.string().max(200).optional().describe("Optional display title; defaults to id"),
  chartType: z.enum(["bar", "line", "area", "pie", "donut", "histogram", "heatmap", "treemap", "sunburst"])
    .describe("Chart type. Overall aggregates (no timeSeries, no groupBy) must use bar"),
  metric: z.enum(["count", "sum", "avg", "min", "max", "percentile"]).optional()
    .describe("Aggregation function. Omit when using series (multi-series mode)"),
  metricField: z.enum(TRACE_CHART_METRIC_FIELD_VALUES).optional()
    .describe("Numeric field to aggregate. Required unless metric is count or using series"),
  percentile: z.number().min(0).max(100).optional().describe("Required when metric is percentile"),
  series: z.array(TraceCustomChartSeriesSpecSchema).min(2).optional()
    .describe("Multi-series mode: two or more series specs. Omit metric/metricField when using this"),
  groupByField: z.enum(TRACE_CHART_GROUP_BY_FIELD_VALUES).optional()
    .describe("Break down by this trace or span field"),
  secondaryGroupByField: z.enum(TRACE_CHART_GROUP_BY_FIELD_VALUES).optional()
    .describe("Second breakdown dimension — heatmap charts only"),
  histogramField: z.enum(TRACE_CHART_METRIC_FIELD_VALUES).optional()
    .describe("Numeric field to bucket — histogram charts only"),
  histogramInterval: z.number().positive().optional().describe("Histogram bucket width (defaults per field)"),
  hierarchyFields: z.array(z.enum(TRACE_CHART_GROUP_BY_FIELD_VALUES)).min(2).max(5).optional()
    .describe("Nested group-by levels — treemap and sunburst charts only"),
  timeSeries: z.boolean().optional().describe("Bucket results over time when true. Not supported with span-level fields"),
  timeBucket: z.enum(["auto", "day", "week", "month"]).optional().describe("Time bucket size when timeSeries is true"),
  limit: z.number().int().min(1).max(100).optional().describe("Max group-by buckets to return (default 25)"),
});

export const GetTraceAnalyticsCustomAnalyticsArgsSchema = z.object({
  filter_group: TraceStructuredFilterGroupSchema.optional()
    .describe("Trace filters selecting which traces participate (e.g. trace_name is 'agent-turn' plus a trace_start range). Applied before aggregation"),
  customCharts: z.array(TraceCustomChartSpecSchema).min(1)
    .describe("One or more analytics queries to compute. IDs must be unique within the request. Each chart must be all trace-level or all span-level fields"),
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

// ── Smart Tables (public v2) ────────────────────────────────────────────

const UuidSchema = z.string().uuid();
const CursorPaginationShape = {
  cursor: z.string().optional().describe("Pagination cursor from a previous response"),
  limit: z.number().int().min(1).max(100).optional().describe("Items per page (1-100)"),
};
const SmartTablePromptFilterShape = {
  prompt_id: z.number().int().positive().optional().describe("Filter to tables/sheets that reference this prompt"),
  prompt_version_id: z.number().int().positive().optional().describe("Filter to tables/sheets that reference this prompt version"),
  prompt_label_id: z.number().int().positive().optional().describe("Filter to tables/sheets that reference this prompt label"),
};
const SmartTableColumnTypeSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }
    return normalizeSmartTableColumnType(value);
  },
  z.enum(SMART_TABLE_CREATABLE_COLUMN_TYPES as unknown as [string, ...string[]]),
).describe(smartTableColumnTypeFieldDescription());
const SmartCellStatusSchema = z.enum(["STALE", "QUEUED", "DISPATCHED", "RUNNING", "COMPLETED", "FAILED"]);
const SmartTableColumnDependencySchema = z.object({
  column_id: UuidSchema.describe("Source column UUID"),
  reference_type: z.string().optional().describe("Dependency reference type, usually 'value'"),
  config_key: z.string().optional().describe("Optional config key this dependency feeds"),
  config_meta: z.record(z.unknown()).optional().describe("Optional dependency metadata"),
});
const SmartTableRequestLogImportBaseShape = {
  request_log_ids: z.array(z.number().int().positive()).optional().describe("Explicit request log IDs to import"),
  filter_group: StructuredFilterGroupSchema.optional().describe("Structured request log filters. Provide this or request_log_ids."),
  q: z.string().optional().describe("Free-text request log search applied with filter_group"),
  sort_by: z.string().optional().describe("Request log sort field"),
  sort_order: z.enum(["asc", "desc"]).optional().describe("Request log sort direction"),
  metadata_cost_breakdown_key: z.string().optional().describe("Optional metadata key used for cost breakdown filtering"),
  variables_to_parse: z.array(z.string()).optional().describe("Input variable names to extract as columns"),
  include_fields: z.array(z.string()).optional().describe("Additional request fields to include as imported columns"),
  limit: z.number().int().positive().optional().describe("Maximum number of matching request logs to import"),
};
const SmartTableSheetFileSourceSchema = z.object({
  type: z.literal("file"),
  file_name: z.string().min(1).max(255).describe("CSV or JSON file name for a new sheet import"),
  file_content_base64: z.string().min(1).describe("Base64-encoded file content"),
});
const SmartTableSheetRequestLogsSourceSchema = z.object({
  type: z.literal("request_logs"),
  ...SmartTableRequestLogImportBaseShape,
});

export const ListSmartTablesArgsSchema = z.object({
  folder_id: z.number().int().positive().optional().describe("Filter by folder ID"),
  name: z.string().optional().describe("Filter by table title"),
  ...CursorPaginationShape,
  sort: z.enum(["created_at"]).optional().describe("Sort field (default: created_at)"),
  order: z.enum(["asc", "desc"]).optional().describe("Sort direction (default: desc)"),
  ...SmartTablePromptFilterShape,
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const CreateSmartTableArgsSchema = z.object({
  title: z.string().min(1).max(255).optional().describe("Table title. Omit for an auto-generated Untitled Table name."),
  folder_id: z.number().int().positive().optional().describe("Folder ID to place the table into"),
  create_default_sheet: z
    .boolean()
    .optional()
    .describe(
      "Create the default empty Sheet 1 with one text column. Defaults to true when omitted (backward compatible). " +
        "Set false when you will immediately create your own sheet (blank, file import, or request logs) to avoid an unused default sheet.",
    ),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const GetSmartTableArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const UpdateSmartTableArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  title: z.string().min(1).max(255).optional().describe("New table title"),
  folder_id: z.number().int().positive().optional().describe("Folder ID, or omit to leave unchanged"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const DeleteSmartTableArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID to delete"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const ListSmartTableSheetsArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  ...CursorPaginationShape,
  sort: z.enum(["index"]).optional().describe("Sort field (default: index)"),
  order: z.enum(["asc", "desc"]).optional().describe("Sort direction (default: asc)"),
  ...SmartTablePromptFilterShape,
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const CreateSmartTableSheetArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  title: z.string().min(1).max(255).optional().describe(
    "Sheet title. When source=file, an explicit title is used; if omitted, falls back to the file name stem (CSV/JSON).",
  ),
  index: z.number().int().min(0).optional().describe("Sheet index"),
  operation_id: z.string().min(1).max(255).optional().describe("Optional idempotency/status operation ID"),
  source: z.discriminatedUnion("type", [
    SmartTableSheetFileSourceSchema,
    SmartTableSheetRequestLogsSourceSchema,
  ]).optional().describe(
    "Optional data source for the new sheet. Omit to create a blank sheet with a default Column A scaffold, " +
    "then add columns and rows incrementally. Use file or request_logs to seed rows on creation.",
  ),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const GetSmartTableSheetArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const UpdateSmartTableSheetArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  title: z.string().min(1).max(255).optional().describe("New sheet title"),
  index: z.number().int().min(0).optional().describe("New sheet index"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const DeleteSmartTableSheetArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID to delete"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const GetSmartTableSheetImportOperationArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  operation_id: z.string().min(1).describe("Import operation ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const ImportSmartTableSheetFileArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  operation_id: z.string().optional().describe("Optional idempotency/status operation ID"),
  file_name: z.string().min(1).max(255).describe("CSV file name (.csv only for import into an existing sheet)"),
  file_content_base64: z.string().min(1).describe("Base64-encoded CSV content"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const ImportSmartTableSheetRequestLogsArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  operation_id: z.string().optional().describe("Optional idempotency/status operation ID"),
  ...SmartTableRequestLogImportBaseShape,
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const ListSmartTableColumnsArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  ...CursorPaginationShape,
  sort: z.enum(["position_rank"]).optional().describe("Sort field (default: position_rank)"),
  order: z.enum(["asc", "desc"]).optional().describe("Sort direction (default: asc)"),
  include_system_columns: z.boolean().optional().describe("Include system columns in the response"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const CreateSmartTableColumnArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  title: z.string().min(1).max(255).describe("Column title"),
  type: SmartTableColumnTypeSchema,
  config: z.record(z.unknown()).nullable().optional().describe("Column-type-specific configuration"),
  dependencies: z.array(SmartTableColumnDependencySchema).nullable().optional().describe("Column dependencies"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const UpdateSmartTableColumnArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  column_id: UuidSchema.describe("Column UUID"),
  title: z.string().min(1).max(255).optional().describe("New column title"),
  config: z.record(z.unknown()).nullable().optional().describe("Replacement column configuration"),
  dependencies: z.array(SmartTableColumnDependencySchema).nullable().optional().describe("Replacement column dependencies"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const DeleteSmartTableColumnArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  column_id: UuidSchema.describe("Column UUID to delete"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const ListSmartTableRowsArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  ...CursorPaginationShape,
  sort: z.enum(["row_index"]).optional().describe("Sort field (default: row_index)"),
  order: z.enum(["asc", "desc"]).optional().describe("Sort direction (default: asc)"),
  include_columns: z.boolean().optional().describe("Include column metadata"),
  include_row_count: z.boolean().optional().describe("Include total row count"),
  include_system_columns: z.boolean().optional().describe("Include system columns"),
  include_execution_metadata_aggregates: z.boolean().optional().describe("Include execution metadata aggregates"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const AddSmartTableRowsArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  count: z.number().int().min(1).max(100).optional().describe("Number of rows to add (default: 1, max: 100)"),
  values: z.array(z.record(z.unknown())).max(100).optional().describe("Optional row values, keyed by column UUID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const GetSmartTableCellArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  cell_id: UuidSchema.describe("Cell UUID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const UpdateSmartTableCellArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  cell_id: UuidSchema.describe("Cell UUID"),
  display_value: z.string().nullable().optional().describe("Text to display for a text cell"),
  value: z.unknown().optional().describe("Structured cell value"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const RecalculateSmartTableCellArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  cell_id: UuidSchema.describe("Cell UUID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const RecalculateSmartTableCellsArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  cell_ids: z.array(UuidSchema).min(1).describe("Cell UUIDs to recalculate"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const ListSmartTableOperationsArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const CreateSmartTableOperationArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  operation: z.enum(["recalculate"]).optional().describe("Operation to run (default: recalculate)"),
  column_ids: z.array(UuidSchema).optional().describe("Limit recalculation to these column UUIDs"),
  row_ids: z.array(z.number().int()).optional().describe("Limit recalculation to these row IDs"),
  statuses: z.array(SmartCellStatusSchema).optional().describe("Cell statuses to recalculate. Empty array means no status filter."),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const GetSmartTableOperationArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  operation_id: z.string().min(1).describe("Operation/execution ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const CancelSmartTableOperationArgsSchema = GetSmartTableOperationArgsSchema;

export const GetSmartTableScoreArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const ConfigureSmartTableScoreArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  score_type: z.enum(["auto", "boolean", "numeric", "custom"]).optional().describe("Score configuration type"),
  score_config: z.record(z.unknown()).optional().describe("Full backend score configuration"),
  column_ids: z.array(UuidSchema).optional().describe("Column UUIDs to include in the score"),
  column_names: z.array(z.string()).optional().describe("Column names to include in the score"),
  code: z.string().min(1).max(50000).optional().describe("Custom score code. Implies score_type=custom."),
  code_language: z.enum(["PYTHON", "JAVASCRIPT"]).optional().describe("Custom score code language (default: PYTHON)"),
  true_values: z.array(z.string()).optional().describe("Values treated as true for boolean scoring"),
  false_values: z.array(z.string()).optional().describe("Values treated as false for boolean scoring"),
  assertion_aggregation: z.enum(["all", "any", "mean"]).optional().describe("How boolean assertions are aggregated"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const RecalculateSmartTableScoreArgsSchema = GetSmartTableScoreArgsSchema;

export const ListSmartTableVersionsArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  ...CursorPaginationShape,
  sort: z.enum(["version_number"]).optional().describe("Sort field (default: version_number)"),
  order: z.enum(["asc", "desc"]).optional().describe("Sort direction (default: desc)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const GetSmartTableVersionArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  version_id: UuidSchema.describe("Version UUID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const CreateSmartTableVersionArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  name: z.string().min(1).max(255).optional().describe("Name for a new snapshot version"),
  source_version_id: UuidSchema.optional().describe("Existing version UUID to restore"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const GetSmartTableScoreHistoryArgsSchema = z.object({
  table_id: UuidSchema.describe("Smart Table UUID"),
  sheet_id: UuidSchema.describe("Sheet UUID"),
  max_points: z.number().int().min(50).max(5000).optional().describe("Maximum score-history points (default: 1200)"),
  range: z.string().optional().describe("Score-history range, e.g. all, last_25, last_50, last_100, last_250"),
  resolution: z.string().optional().describe("Score-history resolution (default: auto)"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

const LegacySmartTableMigrationSourceTypeSchema = z.enum(["dataset_group", "dataset", "report"]);

export const ListLegacySmartTableMigrationsArgsSchema = z.object({
  source_type: LegacySmartTableMigrationSourceTypeSchema.optional().describe("Legacy source type to filter by"),
  source_id: z.union([
    z.number().int().positive(),
    z.array(z.number().int().positive()),
  ]).optional().describe("One or more legacy source IDs. Requires source_type."),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const PreviewLegacySmartTableMigrationArgsSchema = z.object({
  source_type: LegacySmartTableMigrationSourceTypeSchema.describe("Legacy source type"),
  source_id: z.number().int().positive().describe("Legacy source ID"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const MigrateLegacyToSmartTableArgsSchema = z.object({
  source_type: LegacySmartTableMigrationSourceTypeSchema.describe("Legacy source type"),
  source_id: z.number().int().positive().describe("Legacy source ID"),
  force: z.boolean().optional().describe("Force remigration of an already migrated source"),
  dry_run: z.boolean().optional().describe("Preview migration work without writing data"),
  resume: z.boolean().optional().describe("Resume prior migration progress when available"),
  continue_on_error: z.boolean().optional().describe("Continue migration after row/column-level errors"),
  include_reports_with_missing_datasets: z.boolean().optional().describe("Include reports even if their datasets are missing"),
  max_version_snapshot_cells: z.number().int().min(0).optional().describe("Maximum cells to snapshot per migrated version"),
  report_preview_row_limit: z.number().int().min(0).optional().describe("Rows to include in migrated report previews"),
  api_key: z.string().optional().describe("PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"),
});

export const GetLegacySmartTableMigrationJobArgsSchema = z.object({
  job_id: z.string().min(1).describe("Legacy Smart Table migration job ID"),
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
      "creation; later versions cannot flip an existing template into a snippet or vice versa. " +
      PUBLISH_PROMPT_TEMPLATE_SNIPPET_ORDERING_NOTE,
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

  // ── Smart Tables ───────────────────────────────────────────────────
  "list-smart-tables": {
    name: "list-smart-tables",
    description:
      "List Smart Tables with cursor pagination. Smart Tables are PromptLayer's general-purpose data and " +
      "computation layer — use them to organise test datasets, run prompt templates across rows, assert " +
      "on outputs, compare results, build evaluations, or track regression over time. " +
      "Filter by folder, title, or referenced prompt.",
    inputSchema: ListSmartTablesArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-smart-table": {
    name: "create-smart-table",
    description:
      "Create a Smart Table. By default creates an empty Sheet 1 with one text column (create_default_sheet=true). " +
      "Set create_default_sheet=false to skip that sheet when you will immediately create your own " +
      "(create-smart-table-sheet with blank/file/request_logs). Tables are general-purpose — they can hold any tabular data and run " +
      "computed columns (PROMPT_TEMPLATE, LLM_ASSERTION, CODE_EXECUTION, COMPARE, etc.) over rows. " +
      "Common uses include evaluations, regression testing, prompt comparisons, and dataset curation. " +
      "When a default sheet is created, response includes default_sheet: { id, title }; use default_sheet.id for next steps " +
      "(create-smart-table-column, add-smart-table-rows, import request logs, etc.). When create_default_sheet=false, default_sheet is omitted.",
    inputSchema: CreateSmartTableArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-smart-table": {
    name: "get-smart-table",
    description: "Get a Smart Table by UUID, including sheet counts and row counts.",
    inputSchema: GetSmartTableArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "update-smart-table": {
    name: "update-smart-table",
    description: "Update a Smart Table title or folder.",
    inputSchema: UpdateSmartTableArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-smart-table": {
    name: "delete-smart-table",
    description:
      "Delete a Smart Table by UUID. WARNING: This is destructive and cannot be undone. " +
      "The table is removed from normal Smart Table listings.",
    inputSchema: DeleteSmartTableArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "list-smart-table-sheets": {
    name: "list-smart-table-sheets",
    description: "List sheets in a Smart Table with cursor pagination.",
    inputSchema: ListSmartTableSheetsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-smart-table-sheet": {
    name: "create-smart-table-sheet",
    description:
      "Add a sheet (tab) to a Smart Table.\n" +
      "  - Omit source to create a blank sheet with a default Column A scaffold, then add columns and rows incrementally.\n" +
      "  - file: seed rows from a base64-encoded CSV or JSON file (only .csv and .json are supported). " +
      "Provide title to name the sheet; if omitted, the title falls back to the file name stem.\n" +
      "  - request_logs: import historical request logs from PromptLayer by filter or explicit IDs — " +
      "    use this to build datasets from real production traffic for evaluation or analysis.",
    inputSchema: CreateSmartTableSheetArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-smart-table-sheet": {
    name: "get-smart-table-sheet",
    description: "Get a single Smart Table sheet.",
    inputSchema: GetSmartTableSheetArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "update-smart-table-sheet": {
    name: "update-smart-table-sheet",
    description: "Update a Smart Table sheet title or index.",
    inputSchema: UpdateSmartTableSheetArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-smart-table-sheet": {
    name: "delete-smart-table-sheet",
    description:
      "Delete a sheet from a Smart Table. WARNING: This is destructive and cannot be undone. " +
      "Use delete-smart-table to delete the whole table.",
    inputSchema: DeleteSmartTableSheetArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-smart-table-sheet-import-operation": {
    name: "get-smart-table-sheet-import-operation",
    description: "Get status for a Smart Table sheet import operation.",
    inputSchema: GetSmartTableSheetImportOperationArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "import-smart-table-sheet-file": {
    name: "import-smart-table-sheet-file",
    description: "Import base64 CSV content into an existing Smart Table sheet. Only .csv is supported (unlike create-smart-table-sheet file source, which also accepts JSON).",
    inputSchema: ImportSmartTableSheetFileArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "import-smart-table-sheet-request-logs": {
    name: "import-smart-table-sheet-request-logs",
    description:
      "Import historical request logs from PromptLayer into a Smart Table sheet. Provide either explicit " +
      "request_log_ids or a filter_group (same syntax as search-request-logs — filter by model, prompt, " +
      "metadata, date range, status, etc.). Use this to add production traffic rows to a table for " +
      "evaluation, comparison, or any other analysis.",
    inputSchema: ImportSmartTableSheetRequestLogsArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "list-smart-table-columns": {
    name: "list-smart-table-columns",
    description: "List columns in a Smart Table sheet.",
    inputSchema: ListSmartTableColumnsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-smart-table-column": {
    name: "create-smart-table-column",
    description: buildCreateSmartTableColumnToolDescription(),
    inputSchema: CreateSmartTableColumnArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "update-smart-table-column": {
    name: "update-smart-table-column",
    description: "Update a Smart Table column title, config, or dependencies. Column type and position are not changed by this tool.",
    inputSchema: UpdateSmartTableColumnArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "delete-smart-table-column": {
    name: "delete-smart-table-column",
    description:
      "Delete a column from a Smart Table sheet, including its cells. WARNING: This is destructive and cannot be undone.",
    inputSchema: DeleteSmartTableColumnArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "list-smart-table-rows": {
    name: "list-smart-table-rows",
    description: "List rows in a Smart Table sheet with optional column metadata and row counts.",
    inputSchema: ListSmartTableRowsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "add-smart-table-rows": {
    name: "add-smart-table-rows",
    description: "Add up to 100 rows to a Smart Table sheet, optionally with values keyed by column UUID.",
    inputSchema: AddSmartTableRowsArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-smart-table-cell": {
    name: "get-smart-table-cell",
    description: "Get a Smart Table cell by UUID.",
    inputSchema: GetSmartTableCellArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "update-smart-table-cell": {
    name: "update-smart-table-cell",
    description: "Update a Smart Table text cell. Computed cells should be recalculated instead.",
    inputSchema: UpdateSmartTableCellArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "recalculate-smart-table-cell": {
    name: "recalculate-smart-table-cell",
    description: "Queue recalculation for one Smart Table computed cell.",
    inputSchema: RecalculateSmartTableCellArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "recalculate-smart-table-cells": {
    name: "recalculate-smart-table-cells",
    description: "Queue recalculation for multiple Smart Table computed cells.",
    inputSchema: RecalculateSmartTableCellsArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "list-smart-table-operations": {
    name: "list-smart-table-operations",
    description: "List active Smart Table sheet operations and cell status counts.",
    inputSchema: ListSmartTableOperationsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-smart-table-operation": {
    name: "create-smart-table-operation",
    description:
      "Trigger a recalculate operation on a Smart Table sheet — executes all computed columns " +
      "(PROMPT_TEMPLATE, LLM_ASSERTION, CODE_EXECUTION, etc.) for the selected rows and columns. " +
      "Scope the run with column_ids, row_ids, or statuses (e.g. only STALE cells). " +
      "Returns an operation_id to poll with get-smart-table-operation.",
    inputSchema: CreateSmartTableOperationArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-smart-table-operation": {
    name: "get-smart-table-operation",
    description: "Get status for a Smart Table sheet operation.",
    inputSchema: GetSmartTableOperationArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "cancel-smart-table-operation": {
    name: "cancel-smart-table-operation",
    description: "Cancel an active Smart Table sheet operation.",
    inputSchema: CancelSmartTableOperationArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-smart-table-score": {
    name: "get-smart-table-score",
    description:
      "Get the configured score and current aggregate result for a Smart Table sheet. " +
      "Useful when the sheet is being used as an evaluation — the score summarises how well the " +
      "assertion/computation columns performed across all rows.",
    inputSchema: GetSmartTableScoreArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "configure-smart-table-score": {
    name: "configure-smart-table-score",
    description:
      "Configure scoring for a Smart Table sheet. Choose which columns contribute, set score_type " +
      "(auto, boolean, numeric, or custom), supply custom Python/JS aggregation code, or pass a full " +
      "score_config object.",
    inputSchema: ConfigureSmartTableScoreArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "recalculate-smart-table-score": {
    name: "recalculate-smart-table-score",
    description: "Recompute the aggregate score for a Smart Table sheet.",
    inputSchema: RecalculateSmartTableScoreArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "list-smart-table-versions": {
    name: "list-smart-table-versions",
    description:
      "List saved snapshots (versions) for a Smart Table sheet. Versions capture the state of all rows " +
      "and cells at a point in time — useful for tracking how results change across prompt updates or runs.",
    inputSchema: ListSmartTableVersionsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "get-smart-table-version": {
    name: "get-smart-table-version",
    description: "Get a saved Smart Table sheet version, including its full snapshot of cell values.",
    inputSchema: GetSmartTableVersionArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-smart-table-version": {
    name: "create-smart-table-version",
    description:
      "Save a named snapshot of a Smart Table sheet's current state — useful for capturing results " +
      "before making changes so you can compare later. Pass source_version_id to restore a prior snapshot.",
    inputSchema: CreateSmartTableVersionArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-smart-table-score-history": {
    name: "get-smart-table-score-history",
    description:
      "Get score history across saved versions for a Smart Table sheet. Use this to track how scores " +
      "change over time — useful for regression monitoring when the sheet is used as an evaluation.",
    inputSchema: GetSmartTableScoreHistoryArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "list-legacy-smart-table-migrations": {
    name: "list-legacy-smart-table-migrations",
    description: "List successful legacy dataset/evaluation to Smart Table migration mappings.",
    inputSchema: ListLegacySmartTableMigrationsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "preview-legacy-smart-table-migration": {
    name: "preview-legacy-smart-table-migration",
    description: "Preview conversion of a legacy dataset group, dataset, or report into a Smart Table.",
    inputSchema: PreviewLegacySmartTableMigrationArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "migrate-legacy-to-smart-table": {
    name: "migrate-legacy-to-smart-table",
    description: "Start or dry-run conversion of a legacy dataset group, dataset, or report into a Smart Table.",
    inputSchema: MigrateLegacyToSmartTableArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "get-legacy-smart-table-migration-job": {
    name: "get-legacy-smart-table-migration-job",
    description: "Get status and result details for a legacy Smart Table migration job.",
    inputSchema: GetLegacySmartTableMigrationJobArgsSchema,
    annotations: { readOnlyHint: true },
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

  // ── Env Vars ────────────────────────────────────────────────────────
  "list-workspace-env-vars": {
    name: "list-workspace-env-vars",
    description: "List workspace-scoped environment variables. Returned values are masked (only `value_suffix` — last 4 chars). Workspace vars auto-inject into every auto-executing tool in this workspace; tool-scoped vars override them on the same key.",
    inputSchema: ListWorkspaceEnvVarsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-workspace-env-var": {
    name: "create-workspace-env-var",
    description: "Scaffold a workspace-scoped environment variable placeholder. Auto-injected into every auto-executing tool in this workspace. The value is always created empty; the user fills in the real value via Settings, Environment Variables. Key must match ^[A-Za-z_][A-Za-z0-9_]*$ and not collide with reserved runtime names.",
    inputSchema: CreateWorkspaceEnvVarArgsSchema,
    annotations: { readOnlyHint: false },
  },
  "list-tool-env-vars": {
    name: "list-tool-env-vars",
    description: "List tool-scoped environment variables for a specific tool (by ID or name). Returned values are masked (only `value_suffix`). Tool-scoped vars override workspace-scoped vars on the same key during sandbox execution.",
    inputSchema: ListToolEnvVarsArgsSchema,
    annotations: { readOnlyHint: true },
  },
  "create-tool-env-var": {
    name: "create-tool-env-var",
    description: "Scaffold a tool-scoped environment variable placeholder on a specific tool. Auto-injected only into THIS tool's sandbox execution and overrides any workspace-scoped var with the same key. The value is always created empty; the user fills in the real value via Settings.",
    inputSchema: CreateToolEnvVarArgsSchema,
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

  "get-request-analytics-custom-analytics": {
    name: "get-request-analytics-custom-analytics",
    description:
      "Run custom analytics queries over request logs. You define which metrics to compute and how to slice them; the API runs the aggregations and returns structured data rows you can use however you want — charts, analysis, dashboards, or programmatic processing.\n\n" +
      "Each query spec in `customCharts` controls:\n" +
      "  - `metric`: count | sum | avg | min | max | percentile (with `percentile` 0–100) | distinct_count (with `distinctMetadataKey`)\n" +
      "  - `metricField`: the numeric field to aggregate (input_tokens, output_tokens, cost, latency_ms, turn_count, tool_call_count, cached_tokens, thinking_tokens)\n" +
      "  - `groupByField`: break down by engine, provider_type, prompt_id, status, error_type, tags, etc.\n" +
      "  - `groupByMetadataKey`: break down by values of a specific metadata key\n" +
      "  - `timeSeries: true`: bucket results over time (`timeBucket`: auto | day | week | month)\n" +
      "  - `series`: multi-series mode — define two or more named series instead of a single metric\n" +
      "  - chart shapes beyond bar/line/area: pie, donut, histogram (`histogramField`), heatmap (`secondaryGroupByField` or `secondaryGroupByMetadataKey`), treemap/sunburst (`hierarchyFields`)\n\n" +
      "Use this when get-request-analytics doesn't cover the slice you need. " +
      "Examples: cost by metadata environment, p95 latency over time by prompt, input vs output token ratio.",
    inputSchema: GetRequestAnalyticsCustomAnalyticsArgsSchema,
    annotations: { readOnlyHint: true },
  },

  "get-trace-analytics-custom-analytics": {
    name: "get-trace-analytics-custom-analytics",
    description:
      "Run custom analytics queries over traces. Same chart engine as get-request-analytics-custom-analytics, but aggregating trace documents at one of two levels:\n" +
      "  - Trace-level (trace_* fields): measure whole traces — e.g. avg trace_duration_ms grouped by trace_name.\n" +
      "  - Span-level (span_* fields): measure the individual spans inside matching traces — e.g. max span_duration_ms grouped by span_tool_name to find the slowest tools.\n\n" +
      "`filter_group` selects which traces participate (trace_name, trace_start range, span existence conditions, etc.); span-level charts then aggregate across every span of those traces.\n\n" +
      "Each chart must be all trace-level or all span-level fields — mixed levels are rejected. Span-level charts do not support timeSeries or metadata breakdowns.\n\n" +
      "Examples: slowest tools across agent traces (groupByField: span_tool_name, metric: max, metricField: span_duration_ms); " +
      "tool call counts (groupByField: span_tool_name, metric: count); " +
      "span duration distribution (chartType: histogram, histogramField: span_duration_ms); " +
      "trace cost by workflow (groupByField: trace_workflow_ids, metric: sum, metricField: trace_total_cost_usd).",
    inputSchema: GetTraceAnalyticsCustomAnalyticsArgsSchema,
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
