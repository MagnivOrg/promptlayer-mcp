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

## Verifying Against the Backend Source Code

The OpenAPI spec and docs can lag behind the actual server. To verify against the real backend:

### Prerequisites

You need GitHub access to `MagnivOrg/promptlayer-app` (the backend repo). The Cursor Cloud Agent token must be scoped to include it.

### What to do

1. Clone the backend repo:
```bash
gh repo clone MagnivOrg/promptlayer-app /tmp/promptlayer-app
```

2. Find the route definitions. The backend is likely Flask or FastAPI. Search for route registrations:
```bash
# FastAPI
rg "(@app\.|@router\.)(get|post|put|patch|delete)" /tmp/promptlayer-app --type py -l

# Flask
rg "(\.route|\.add_url_rule)" /tmp/promptlayer-app --type py -l
```

3. For each endpoint in our MCP (listed in `scripts/extract-mcp-tools.ts` TOOL_TO_ENDPOINT), find the matching route handler in the backend and compare:
   - **Path**: does the route path match?
   - **Method**: GET/POST/PATCH/DELETE match?
   - **Request body / query params**: compare the Pydantic model (FastAPI) or request parsing (Flask) field-by-field against our Zod schema in `src/types.ts`
   - **Required vs optional**: check defaults in the backend model
   - **Field types**: string, integer, boolean, array, object -- do they match?

4. Specific things to look for:
   - Endpoints that exist in the backend but are **not in the OpenAPI spec or docs** (undocumented endpoints)
   - Fields accepted by the backend that aren't in the OpenAPI spec (the spec may be auto-generated but filtered)
   - Fields in the OpenAPI spec that the backend actually ignores
   - **Renamed or moved endpoints** -- the backend may have aliases or redirects

5. Key files/patterns to search:
```bash
# Find all API route files
rg "APIRouter|Blueprint" /tmp/promptlayer-app --type py -l

# Find specific endpoint handlers
rg "prompt.templates|prompt-templates" /tmp/promptlayer-app --type py -l
rg "track.score|track-score|track_score" /tmp/promptlayer-app --type py -l
rg "log.request|log-request|log_request" /tmp/promptlayer-app --type py -l
rg "workflow|agent" /tmp/promptlayer-app --type py -l
rg "report|evaluation" /tmp/promptlayer-app --type py -l
rg "dataset" /tmp/promptlayer-app --type py -l
rg "spans" /tmp/promptlayer-app --type py -l
rg "folder" /tmp/promptlayer-app --type py -l

# Find Pydantic models (request schemas)
rg "class.*BaseModel" /tmp/promptlayer-app --type py -l
```

6. For each discrepancy found, update:
   - `src/types.ts` -- fix the Zod schema
   - `scripts/diff-endpoints.ts` -- add/remove known exceptions
   - `src/types.ts` -- add `// NOTE:` comments on deviations

7. Run `npm run sync:check` to confirm the OpenAPI-level check still passes after changes.

### Automating this (future)

A script could be written (`scripts/verify-against-backend.ts`) that:
1. Clones `promptlayer-app`
2. Parses Python route definitions and Pydantic models using AST/regex
3. Outputs a `backend-endpoints.json` in the same format as `openapi-endpoints.json`
4. Runs the same diff logic

This would give us a three-way comparison: **backend code** vs **OpenAPI spec** vs **MCP schemas**.

## Files

| File | Purpose |
|---|---|
| `scripts/fetch-openapi-endpoints.ts` | Downloads + extracts OpenAPI endpoints |
| `scripts/extract-mcp-tools.ts` | Extracts MCP tool schemas, contains `TOOL_TO_ENDPOINT` mapping |
| `scripts/diff-endpoints.ts` | Structural diff, contains `KNOWN_EXCEPTIONS` |
| `scripts/openapi-endpoints.json` | Generated (gitignored) |
| `scripts/mcp-tools.json` | Generated (gitignored) |
