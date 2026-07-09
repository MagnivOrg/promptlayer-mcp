/** Canonical Smart Table column type metadata for MCP tool schemas and server instructions. */

export const SMART_TABLE_COLUMN_TYPE_DESCRIPTION =
  "Smart Table column type. Use uppercase backend enum values (for example COMPARE, COMPOSITION, TEXT).";

/** Legacy evaluate-only type; smart tables migrate DATASET columns to TEXT. */
export const SMART_TABLE_NON_CREATABLE_COLUMN_TYPES = ["DATASET"] as const;

/** Lowercase aliases accepted for backwards compatibility with simplified docs/tools. */
export const SMART_TABLE_COLUMN_TYPE_ALIASES: Record<string, SmartTableCreatableColumnType> = {
  text: "TEXT",
  prompt_template: "PROMPT_TEMPLATE",
  llm: "PROMPT_TEMPLATE",
  code: "CODE_EXECUTION",
  score: "LLM_ASSERTION",
  comparison: "COMPARE",
  compare: "COMPARE",
  composition: "COMPOSITION",
};

export const SMART_TABLE_CREATABLE_COLUMN_TYPES = [
  "TEXT",
  "ABSOLUTE_NUMERIC_DISTANCE",
  "AI_DATA_EXTRACTION",
  "APPLY_DIFF",
  "ASSERT_VALID",
  "COALESCE",
  "CONDITION",
  "CODE_EXECUTION",
  "COMBINE_COLUMNS",
  "COMPARE",
  "COMPOSITION",
  "CONTAINS",
  "CONVERSATION_SIMULATOR",
  "COSINE_SIMILARITY",
  "COUNT",
  "ENDPOINT",
  "FOR_LOOP",
  "HUMAN",
  "JSON_PATH",
  "LLM_ASSERTION",
  "MATH_OPERATOR",
  "MCP",
  "MIN_MAX",
  "PARSE_VALUE",
  "PROMPT_TEMPLATE",
  "REGEX",
  "REGEX_EXTRACTION",
  "VARIABLE",
  "WHILE_LOOP",
  "WORKFLOW",
  "XML_PATH",
] as const;

export type SmartTableCreatableColumnType = (typeof SMART_TABLE_CREATABLE_COLUMN_TYPES)[number];

const SMART_TABLE_COLUMN_TYPE_GROUPS = [
  {
    label: "Data source / execution",
    types: [
      "PROMPT_TEMPLATE",
      "WORKFLOW",
      "CODE_EXECUTION",
      "ENDPOINT",
      "MCP",
      "CONVERSATION_SIMULATOR",
      "HUMAN",
      "WHILE_LOOP",
      "FOR_LOOP",
    ],
  },
  {
    label: "Simple eval",
    types: [
      "COMPARE",
      "CONTAINS",
      "REGEX",
      "ABSOLUTE_NUMERIC_DISTANCE",
      "ASSERT_VALID",
      "MATH_OPERATOR",
    ],
  },
  {
    label: "LLM eval",
    types: ["LLM_ASSERTION", "AI_DATA_EXTRACTION", "COSINE_SIMILARITY"],
  },
  {
    label: "Helper",
    types: [
      "JSON_PATH",
      "XML_PATH",
      "REGEX_EXTRACTION",
      "PARSE_VALUE",
      "COUNT",
      "MIN_MAX",
      "COALESCE",
      "COMBINE_COLUMNS",
      "APPLY_DIFF",
      "VARIABLE",
      "CONDITION",
    ],
  },
] as const satisfies ReadonlyArray<{
  label: string;
  types: readonly SmartTableCreatableColumnType[];
}>;

export interface SmartTableColumnTypeGroups {
  input: readonly SmartTableCreatableColumnType[];
  reference: readonly SmartTableCreatableColumnType[];
  computed: readonly SmartTableCreatableColumnType[];
}

export function groupSmartTableColumnTypesForAgents(): SmartTableColumnTypeGroups {
  const computed = new Set<SmartTableCreatableColumnType>();
  for (const group of SMART_TABLE_COLUMN_TYPE_GROUPS) {
    for (const columnType of group.types) {
      computed.add(columnType);
    }
  }

  return {
    input: ["TEXT"],
    reference: ["COMPOSITION"],
    computed: [...computed].sort(),
  };
}

function formatGroupedTypeLines(grouped: SmartTableColumnTypeGroups): string[] {
  return [
    `Input (editable, no computation): ${grouped.input.join(", ")}`,
    `Reference (mirrors another sheet/column, not executed): ${grouped.reference.join(", ")}`,
    `Computed (runs per row): ${grouped.computed.join(", ")}`,
  ];
}

export function normalizeSmartTableColumnType(columnType: string): SmartTableCreatableColumnType {
  const normalized = columnType.trim();
  if (!normalized) {
    throw new Error("type is required");
  }

  const alias = SMART_TABLE_COLUMN_TYPE_ALIASES[normalized.toLowerCase()];
  if (alias) {
    return alias;
  }

  if ((SMART_TABLE_CREATABLE_COLUMN_TYPES as readonly string[]).includes(normalized)) {
    return normalized as SmartTableCreatableColumnType;
  }

  throw new Error(`type must be one of: ${SMART_TABLE_CREATABLE_COLUMN_TYPES.join(", ")}`);
}

export function smartTableColumnTypeFieldDescription(): string {
  const grouped = groupSmartTableColumnTypesForAgents();
  return [SMART_TABLE_COLUMN_TYPE_DESCRIPTION, ...formatGroupedTypeLines(grouped)].join(" ");
}

export function buildCreateSmartTableColumnToolDescription(): string {
  const grouped = groupSmartTableColumnTypesForAgents();
  return [
    "Add a column to a Smart Table sheet.",
    ...formatGroupedTypeLines(grouped),
    "Use uppercase enum values in the type field (for example COMPARE, COMPOSITION, TEXT).",
    "Columns can depend on other columns via the dependencies field.",
  ].join("\n");
}

export const SMART_TABLE_COLUMN_TYPE_SERVER_INSTRUCTIONS = [
  "Use uppercase backend enum values for column types (for example TEXT, COMPARE, COMPOSITION).",
  ...formatGroupedTypeLines(groupSmartTableColumnTypesForAgents()),
  "Direct cell edits are for text cells; computed cells should be recalculated via cell or sheet operation tools.",
].join(" ");
