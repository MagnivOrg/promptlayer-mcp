# Keeping the MCP in Sync with PromptLayer REST API

## Overview

The PromptLayer MCP server wraps the [PromptLayer REST API](https://docs.promptlayer.com/reference/rest-api-reference). The source of truth for endpoint schemas is the [OpenAPI spec](https://github.com/magnivorg/prompt-layer-docs/blob/master/openapi.json) in the docs repo.

Three scripts automate the comparison between what the OpenAPI spec defines and what our MCP implements. **No LLM is needed** -- the comparison is purely structural.

## Quick Start

```bash
npm run sync:check
```

This runs all three steps and prints a diff report. Exit code 0 means everything is in sync; exit code 1 means there are discrepancies to fix.

## How It Works

### Step 1: Fetch the OpenAPI spec

```bash
npm run sync:fetch
```

Downloads the OpenAPI spec from GitHub and extracts a flat JSON list of every endpoint with its method, path, parameters (path/query), and body fields. Writes `scripts/openapi-endpoints.json`.

Each entry looks like:
```json
{
  "method": "POST",
  "path": "/rest/track-score",
  "summary": "Track Score",
  "operationId": "trackScore",
  "pathParams": [],
  "queryParams": [],
  "bodyFields": [
    { "name": "request_id", "type": "integer", "required": true },
    { "name": "score", "type": "integer", "required": true },
    { "name": "name", "type": "string", "required": false }
  ]
}
```

### Step 2: Extract MCP tool definitions

```bash
npm run sync:extract
```

Imports our `TOOL_DEFINITIONS` from `src/types.ts`, converts each Zod schema to JSON Schema, and writes `scripts/mcp-tools.json`.

Each entry looks like:
```json
{
  "toolName": "track-score",
  "method": "POST",
  "path": "/rest/track-score",
  "description": "...",
  "fields": [
    { "name": "request_id", "type": "integer", "required": true },
    { "name": "score", "type": "integer", "required": true },
    { "name": "name", "type": "string", "required": false }
  ]
}
```

The mapping from MCP tool name to REST endpoint (method + path) is maintained in `scripts/extract-mcp-tools.ts` in the `TOOL_TO_ENDPOINT` constant. When adding a new tool, add its mapping there.

### Step 3: Diff

```bash
npm run sync:diff
```

Compares the two JSON files and reports:

| Category | Meaning |
|---|---|
| **MISSING IN MCP** | OpenAPI has this endpoint but we don't have a tool for it |
| **EXTRA IN MCP** | We have a tool that doesn't match any OpenAPI endpoint (could be a docs-only endpoint like `update-report-score-card`) |
| **MISSING FIELD** | OpenAPI defines a parameter/field that our tool schema is missing |
| **EXTRA FIELD** | Our tool schema has a field not in the OpenAPI spec |
| **TYPE MISMATCH** | Field exists in both but has different types |
| **REQUIRED MISMATCH** | Field exists in both but differs on required/optional |

## Adding a New Endpoint

1. Run `npm run sync:check` to see what's missing
2. Add the Zod schema to `src/types.ts`
3. Add the tool definition to `TOOL_DEFINITIONS` in `src/types.ts`
4. Add the client method to `src/client.ts`
5. Register the tool in `src/handlers.ts`
6. Add the tool-to-endpoint mapping in `scripts/extract-mcp-tools.ts` (`TOOL_TO_ENDPOINT`)
7. Run `npm run sync:check` again to verify

## Known Gaps

Some endpoints are documented in the PromptLayer reference text but **not** in the OpenAPI spec. These will show as `EXTRA IN MCP` in the diff. This is expected for:

- `PATCH /reports/{report_id}/score-card` (update-report-score-card)

Some fields we add for MCP convenience (like `callback_url` on run-workflow, documented in text but not OpenAPI) will show as `EXTRA FIELD`. Review these manually.

## Files

| File | Purpose |
|---|---|
| `scripts/fetch-openapi-endpoints.ts` | Downloads + extracts OpenAPI endpoints |
| `scripts/extract-mcp-tools.ts` | Extracts MCP tool schemas |
| `scripts/diff-endpoints.ts` | Structural diff, reports discrepancies |
| `scripts/openapi-endpoints.json` | Generated: canonical OpenAPI endpoints |
| `scripts/mcp-tools.json` | Generated: what MCP implements |
