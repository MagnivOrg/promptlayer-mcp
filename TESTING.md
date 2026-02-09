# Keeping the MCP in Sync with PromptLayer REST API

## Quick Start

```bash
npm run sync:check
```

Exit code 0 = in sync (pass). Exit code 1 = new issues found (fail).

Known exceptions are declared in `scripts/diff-endpoints.ts` and don't cause failures.

## How It Works

Three scripts, no LLM needed. The source of truth is the [OpenAPI spec](https://github.com/magnivorg/prompt-layer-docs/blob/master/openapi.json).

### Step 1: Fetch OpenAPI endpoints

```bash
npm run sync:fetch
```

Downloads the spec, extracts every endpoint into `scripts/openapi-endpoints.json` with method, path, path/query params, and body fields.

### Step 2: Extract MCP tool definitions

```bash
npm run sync:extract
```

Imports `TOOL_DEFINITIONS` from `src/types.ts`, converts Zod schemas to JSON Schema, writes `scripts/mcp-tools.json`. The tool-to-endpoint mapping is in `scripts/extract-mcp-tools.ts` (`TOOL_TO_ENDPOINT`).

### Step 3: Diff

```bash
npm run sync:diff
```

Structurally compares the two JSON files:

| Category | Meaning |
|---|---|
| **MISSING IN MCP** | OpenAPI has an endpoint we don't cover |
| **EXTRA IN MCP** | We have a tool not in the OpenAPI spec |
| **MISSING FIELD** | OpenAPI has a field our schema is missing |
| **EXTRA FIELD** | Our schema has a field not in OpenAPI |
| **TYPE MISMATCH** | Same field, different type |
| **REQUIRED MISMATCH** | Same field, different required/optional |

## Known Exceptions

Some issues are expected and won't cause the script to fail. They're declared in the `KNOWN_EXCEPTIONS` array in `scripts/diff-endpoints.ts` with inline comments explaining each one.

Current known exceptions:

| Issue | Why |
|---|---|
| `update-report-score-card` extra in MCP | Endpoint is in [reference docs](https://docs.promptlayer.com/reference/update-report-score-card) but not in OpenAPI spec |
| `callback_url` extra field on `run-workflow` | Field is in [reference docs](https://docs.promptlayer.com/reference/run-workflow) but not in OpenAPI spec |
| `log-request` input/output type mismatch | OpenAPI uses `oneOf(ChatPrompt, CompletionPrompt)`, we use `object` because we pass through as-is |

When adding a new exception: add the exact issue string to `KNOWN_EXCEPTIONS` in `scripts/diff-endpoints.ts` with a comment explaining why. Also add a `// NOTE:` comment on the affected code in `src/types.ts`.

## Adding a New Endpoint

1. `npm run sync:check` -- see what's missing
2. Add Zod schema + tool definition in `src/types.ts`
3. Add client method in `src/client.ts`
4. Register the tool in `src/handlers.ts`
5. Add mapping in `scripts/extract-mcp-tools.ts` (`TOOL_TO_ENDPOINT`)
6. `npm run sync:check` -- verify it passes

## Files

| File | Purpose |
|---|---|
| `scripts/fetch-openapi-endpoints.ts` | Downloads + extracts OpenAPI endpoints |
| `scripts/extract-mcp-tools.ts` | Extracts MCP tool schemas, contains `TOOL_TO_ENDPOINT` mapping |
| `scripts/diff-endpoints.ts` | Structural diff, contains `KNOWN_EXCEPTIONS` |
| `scripts/openapi-endpoints.json` | Generated (gitignored) |
| `scripts/mcp-tools.json` | Generated (gitignored) |
