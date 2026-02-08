/**
 * TypeScript types and Zod schemas for PromptLayer API
 */

import { z } from "zod";

// Zod Schemas for Tool Input Validation
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
      "Filter by status: 'active' (default) returns only active templates, 'deleted' returns only deleted/archived templates, 'all' returns both"
    ),
  api_key: z
    .string()
    .optional()
    .describe(
      "PromptLayer API key (optional, defaults to PROMPTLAYER_API_KEY env var)"
    ),
});

// API request types derived from Zod (MCP-specific fields omitted for client use)
export type GetPromptTemplateParams = Omit<
  z.infer<typeof GetPromptTemplateArgsSchema>,
  "prompt_name" | "api_key"
>;
export type ListPromptTemplatesParams = Omit<
  z.infer<typeof ListPromptTemplatesArgsSchema>,
  "api_key"
>;

// --- Prompt template schemas (API: Completion Template | Chat Template) ---

const ImageURLSchema = z.object({
  url: z.string(),
  detail: z.string().nullable().optional(),
});

const MediaSchema = z.object({
  title: z.string().describe("Title of the media"),
  type: z.string().describe("Type of the media. For example, image/png"),
  url: z.string(),
});

/** Content block: text */
export const TextContentSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  id: z.null().optional(),
  annotations: z.null().optional(),
});

/** Content block: thinking (e.g. extended thinking) */
export const ThinkingContentSchema = z.object({
  type: z.literal("thinking"),
  thinking: z.string(),
});

/** Content block: image URL */
export const ImageContentSchema = z.object({
  type: z.literal("image_url"),
  image_url: ImageURLSchema,
  image_variable: z.string().nullable().optional(),
  id: z.null().optional(),
  annotations: z.null().optional(),
});

/** Content block: media */
export const MediaContentSchema = z.object({
  type: z.literal("media"),
  media: MediaSchema,
});

/** Content block: media variable placeholder */
export const MediaVariableSchema = z.object({
  type: z.literal("media_variable"),
  name: z.string(),
});

/** Union of all content block types (completion or message content) */
export const PromptContentBlockSchema = z.discriminatedUnion("type", [
  TextContentSchema,
  ThinkingContentSchema,
  ImageContentSchema,
  MediaContentSchema,
  MediaVariableSchema,
]);

/** Completion prompt template (type: "completion") */
export const CompletionPromptSchema = z
  .object({
    type: z.literal("completion"),
    content: z.array(PromptContentBlockSchema),
    input_variables: z.array(z.string()).default([]),
    template_format: z.enum(["f-string", "jinja2"]).default("f-string"),
  })
  .passthrough(); // Allow additional properties

/** Message content: text, image, media, or media variable (no thinking in system/user) */
const MessageContentBlockSchema = z.discriminatedUnion("type", [
  TextContentSchema,
  ImageContentSchema,
  MediaContentSchema,
  MediaVariableSchema,
]);

/** Assistant/tool message content may include thinking */
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

/** Union of all chat message types */
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

/** Chat prompt template (type: "chat") */
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

/** Prompt template: completion or chat (discriminated by type) */
export const PromptTemplateSchema = z.discriminatedUnion("type", [
  CompletionPromptSchema,
  ChatPromptSchema,
]);

// Provider-specific / open-ended objects: use record of unknown (API does not fix shape)
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

// Snippet reference schema (appears in response snippets array)
const SnippetReferenceSchema = z.object({
  prompt_name: z.string(),
  version: z.number(),
});

// Zod output schemas (single source for response shapes)
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
  .passthrough(); // Allow additional properties from backend

/** Single prompt template item in list response (matches GetPromptTemplateResponse) */
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

/** List prompt templates response (GET /prompt-templates) */
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

// Response types derived from Zod (used by client and handlers)
export type GetPromptTemplateResponse = z.infer<
  typeof GetPromptTemplateResponseSchema
>;
export type ListPromptTemplateItem = z.infer<
  typeof ListPromptTemplateItemSchema
>;
export type ListPromptTemplatesResponse = z.infer<
  typeof ListPromptTemplatesResponseSchema
>;

// Tool definitions: single source for MCP tool metadata + schemas (used by handlers and codegen)
export const TOOL_DEFINITIONS = {
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
    outputSchema: GetPromptTemplateResponseSchema,
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
    outputSchema: ListPromptTemplatesResponseSchema,
    annotations: { readOnlyHint: true },
  },
} as const;
