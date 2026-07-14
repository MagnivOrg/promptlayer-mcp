/**
 * Concrete Smart Table row/cell payload documentation for MCP agents.
 * Mirrors the shapes validated against the live API (PRO-213 / MCP companion).
 */

export const EXAMPLE_TEXT_COLUMN_ID = "770e8400-e29b-41d4-a716-446655440002";
export const EXAMPLE_COMPUTED_COLUMN_ID = "880e8400-e29b-41d4-a716-446655440003";
export const EXAMPLE_CELL_ID = "990e8400-e29b-41d4-a716-446655440004";

/** Correct add-rows values: one map per row, keys = column UUIDs, values = raw TEXT. */
export const ADD_ROWS_VALUES_EXAMPLE = [
  { [EXAMPLE_TEXT_COLUMN_ID]: "Alice" },
  { [EXAMPLE_TEXT_COLUMN_ID]: "Bob" },
];

export const TEXT_CELL_READ_EXAMPLE = {
  id: EXAMPLE_CELL_ID,
  column_id: EXAMPLE_TEXT_COLUMN_ID,
  row_index: 0,
  status: "COMPLETED",
  display_value: "Customer question about billing",
  value: { value: "Customer question about billing" },
  last_computed_version: null,
};

export const COMPUTED_CELL_READ_EXAMPLE = {
  id: "aa0e8400-e29b-41d4-a716-446655440005",
  column_id: EXAMPLE_COMPUTED_COLUMN_ID,
  row_index: 0,
  status: "COMPLETED",
  display_value: "true",
  value: { value: true },
  last_computed_version: 42,
};

export const ADD_SMART_TABLE_ROWS_VALUES_DESCRIPTION =
  "Optional per-row maps of `{column_id: rawValue}`. Keys must be column UUID strings (not titles). " +
  "Pass the raw TEXT value only — do not nest `{value: ...}` or `{display_value: ...}` (those are cell-read/update shapes). " +
  "Only TEXT columns accept values on create; computed columns start STALE/empty. " +
  `Example: ${JSON.stringify(ADD_ROWS_VALUES_EXAMPLE)}.`;

export const UPDATE_SMART_TABLE_CELL_DISPLAY_VALUE_DESCRIPTION =
  "Human-readable TEXT cell content. Only TEXT columns can be edited directly; recalculate computed cells instead.";

export const UPDATE_SMART_TABLE_CELL_VALUE_DESCRIPTION =
  'Optional structured cell payload for TEXT columns, usually `{"value": "..."}`. Prefer `display_value` for simple text edits.';

export function buildAddSmartTableRowsToolDescription(): string {
  return (
    "Append up to 100 rows to a Smart Table sheet. Pass count to create blank row shells for computed columns " +
    "(preferred over padding CSV file seeds with empty lines, which are skipped on import). " +
    "Optionally pass `values` as a list of `{column_id: rawValue}` maps — one map per row — using TEXT column UUIDs only. " +
    `Example values: ${JSON.stringify(ADD_ROWS_VALUES_EXAMPLE)}.`
  );
}

export function buildListSmartTableRowsToolDescription(): string {
  return (
    "List rows in a Smart Table sheet with optional column metadata and row counts. " +
    "Each cell includes `display_value` (UI string), nested `value.value` (structured JSON), and `last_computed_version` " +
    "(null for manual TEXT input; set after a successful computed run). " +
    `TEXT example: ${JSON.stringify(TEXT_CELL_READ_EXAMPLE)}. ` +
    `Computed example: ${JSON.stringify(COMPUTED_CELL_READ_EXAMPLE)}.`
  );
}

export function buildGetSmartTableCellToolDescription(): string {
  return (
    "Get a Smart Table cell by UUID. Response fields: `display_value` (UI string), nested `value.value` (structured JSON), " +
    "and `last_computed_version` (null for TEXT input; set on computed columns after a successful run). " +
    `TEXT example: ${JSON.stringify(TEXT_CELL_READ_EXAMPLE)}. ` +
    `Computed example: ${JSON.stringify(COMPUTED_CELL_READ_EXAMPLE)}.`
  );
}

export function buildUpdateSmartTableCellToolDescription(): string {
  return (
    "Update a Smart Table TEXT cell by `cell_id`. Computed cells cannot be edited directly — use recalculate tools instead. " +
    `Example: {"display_value": "Updated answer text"}. For structured updates, pass value as {"value": "..."}.`
  );
}

export const SMART_TABLE_ROW_CELL_PAYLOAD_SERVER_INSTRUCTIONS = [
  "When adding rows, pass `values` as `[{column_uuid: rawText}, ...]` — column UUID keys and raw TEXT values only;",
  "do not key by column title or nest `{value: ...}` / `{display_value: ...}` inside row values.",
  "Cell reads expose `display_value`, nested `value.value`, and `last_computed_version`",
  "(null for TEXT; set after computed runs).",
  "Edit TEXT cells via update-smart-table-cell; recalculate computed cells instead of editing them.",
].join(" ");
