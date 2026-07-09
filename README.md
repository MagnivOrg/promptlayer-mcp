# PromptLayer MCP Server

MCP server that wraps the [PromptLayer REST API](https://docs.promptlayer.com/reference/rest-api-reference), giving any MCP-compatible client access to all 79 PromptLayer tools.

## Setup

```bash
npm install
```

Set your API key:

```bash
export PROMPTLAYER_API_KEY=pl_your_key_here
```

Or create a `.env` file (see `.env.example`).

### Self-hosted PromptLayer

If you run a self-hosted PromptLayer instance, set `PROMPTLAYER_BASE_URL` to point the MCP server at it. When unset, it defaults to `https://api.promptlayer.com`. Note that this must be the **API domain** of your instance, not the web interface domain.

```bash
export PROMPTLAYER_BASE_URL=https://api.promptlayer.your-company.example.com
export PROMPTLAYER_API_KEY=pl_your_key_here
```

The same variable can be passed in MCP client configs via the `env` block (see Claude Desktop / Cursor examples below).

## Usage

### With Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "promptlayer": {
      "command": "npx",
      "args": ["-y", "@promptlayer/mcp-server"],
      "env": {
        "PROMPTLAYER_API_KEY": "pl_your_key_here"
      }
    }
  }
}
```

### With Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "promptlayer": {
      "command": "npx",
      "args": ["-y", "@promptlayer/mcp-server"],
      "env": {
        "PROMPTLAYER_API_KEY": "pl_your_key_here"
      }
    }
  }
}
```

### Remote (Streamable HTTP)

Use the hosted MCP server at `https://mcp.promptlayer.com/mcp` with any client that supports Streamable HTTP transport. Pass your API key via the `Authorization` header:

```json
{
  "mcpServers": {
    "promptlayer": {
      "type": "streamable-http",
      "url": "https://mcp.promptlayer.com/mcp",
      "headers": {
        "Authorization": "Bearer pl_your_key_here"
      }
    }
  }
}
```

### From source

```bash
npm run build
node build/index.js
```

## Tools

### Prompt Templates

| Tool | Description |
|---|---|
| `get-prompt-template` | Get a template by name/ID with optional version or release label. Returns provider-formatted `llm_kwargs`. |
| `get-prompt-template-raw` | Get raw template data without filling variables. For sync, caching, inspection. |
| `list-prompt-templates` | List templates with pagination. Filter by name, label, status. |
| `publish-prompt-template` | Create a new version of a template with content, metadata, and release labels. |
| `list-prompt-template-labels` | List release labels on a template. |
| `create-prompt-label` | Attach a release label to a template version. |
| `move-prompt-label` | Move a label to a different version. |
| `delete-prompt-label` | Delete a label. |
| `get-snippet-usage` | Find all templates referencing a snippet. |
| `patch-prompt-template-version` | Partially update a template — applies field-level patches and creates a new version. |

### Tool Registry

| Tool | Description |
|---|---|
| `list-tool-registries` | List all tools in the workspace. |
| `get-tool-registry` | Get a tool by ID or name. Optionally resolve a specific version by label or version number. |
| `create-tool-registry` | Create a new tool with an initial version. |
| `create-tool-version` | Create a new version of an existing tool with an updated definition. |
| `test-execute-tool-registry` | Run a tool's execution body in the sandbox against test inputs. Returns the body's return value plus stdout/stderr/duration. Supports unsaved `execution` / `tool_definition` overrides via `label` or `version`. |

### Env Vars

Workspace- and tool-scoped environment variables auto-injected into a tool's sandbox execution. Tool-scoped vars override workspace-scoped vars on the same key. Values are encrypted at rest; list responses only return a `value_suffix` (last 4 chars), never the full plaintext. `create-*` only scaffolds an empty placeholder by name; the user sets the real value in Settings, Environment Variables. Update and delete are intentionally only exposed in the UI to keep programmatic surfaces out of the secret-write and destructive paths.

| Tool | Description |
|---|---|
| `list-workspace-env-vars` | List workspace-scoped env vars (masked values). |
| `create-workspace-env-var` | Scaffold a workspace-scoped env var placeholder by `key`. Auto-injected into every auto-executing tool in this workspace once the user sets the value. |
| `list-tool-env-vars` | List env vars scoped to a specific tool (by ID or name). |
| `create-tool-env-var` | Scaffold a tool-scoped env var placeholder by `key`. Overrides any workspace-scoped var with the same key during sandbox execution. |

### Tracking

| Tool | Description |
|---|---|
| `log-request` | Log an LLM request/response pair. Input/output in Prompt Blueprint format. |
| `create-spans-bulk` | Create OpenTelemetry spans in bulk for tracing. |
| `search-request-logs` | Search request logs with filters. |
| `get-request` | Get a single request by ID. |
| `get-trace` | Get a trace by ID. |
| `get-request-search-suggestions` | Get filter suggestions for request log search. |
| `get-request-analytics` | Aggregated analytics across request logs (totals, time series, latency percentiles, model/prompt breakdowns). Same filter shape as `search-request-logs`. |

### Smart Tables

Smart Tables are the recommended replacement for legacy datasets and evaluations.

| Tool | Description |
|---|---|
| `list-smart-tables` | List Smart Tables with cursor pagination and filters. |
| `create-smart-table` | Create a Smart Table with a default sheet and text column. Response includes `default_sheet: { id, title }` — use `default_sheet.id` for columns, rows, and imports. |
| `get-smart-table` | Get a Smart Table by UUID. |
| `update-smart-table` | Update a Smart Table title or folder. |
| `list-smart-table-sheets` | List sheets in a Smart Table. |
| `create-smart-table-sheet` | Create a sheet from a file or request-log source. |
| `get-smart-table-sheet` | Get a single sheet. |
| `update-smart-table-sheet` | Update a sheet title or index. |
| `get-smart-table-sheet-import-operation` | Get import operation status. |
| `import-smart-table-sheet-file` | Import base64 CSV content into an existing sheet. |
| `import-smart-table-sheet-request-logs` | Import request logs into an existing sheet. |
| `list-smart-table-columns` | List sheet columns. |
| `create-smart-table-column` | Create a sheet column. |
| `update-smart-table-column` | Update a column title, config, or dependencies. |
| `list-smart-table-rows` | List sheet rows. |
| `add-smart-table-rows` | Add rows to a sheet. |
| `get-smart-table-cell` | Get a cell by UUID. |
| `update-smart-table-cell` | Update a text cell. |
| `recalculate-smart-table-cell` | Recalculate one computed cell. |
| `recalculate-smart-table-cells` | Recalculate multiple computed cells. |
| `list-smart-table-operations` | List active sheet operations and status counts. |
| `create-smart-table-operation` | Start a sheet operation, currently recalculation. |
| `get-smart-table-operation` | Get operation status. |
| `cancel-smart-table-operation` | Cancel an active operation. |
| `get-smart-table-score` | Get sheet score configuration and score. |
| `configure-smart-table-score` | Configure sheet scoring. |
| `recalculate-smart-table-score` | Recalculate a configured sheet score. |
| `list-smart-table-versions` | List sheet versions. |
| `get-smart-table-version` | Get a sheet version snapshot. |
| `create-smart-table-version` | Create or restore a sheet version. |
| `get-smart-table-score-history` | Get sheet score history. |
| `list-legacy-smart-table-migrations` | List successful legacy migration mappings. |
| `preview-legacy-smart-table-migration` | Preview dataset/evaluation conversion into a Smart Table. |
| `migrate-legacy-to-smart-table` | Start or dry-run dataset/evaluation conversion. |
| `get-legacy-smart-table-migration-job` | Get legacy migration job status and result. |

### Legacy Datasets

| Tool | Description |
|---|---|
| `list-datasets` | List datasets with filtering. |
| `get-dataset-rows` | Get rows from a dataset version. |
| `create-dataset-group` | Create a dataset group (container for versions). |
| `create-dataset-version-from-file` | Create a version from base64 CSV/JSON. |
| `create-dataset-version-from-filter-params` | Create a version from request log history. |
| `create-draft-dataset-version` | Create a draft dataset version for incremental building. |
| `add-request-log-to-dataset` | Add a request log entry to a draft dataset version. |
| `save-draft-dataset-version` | Finalize and save a draft dataset version. |

### Legacy Evaluations

| Tool | Description |
|---|---|
| `list-evaluations` | List evaluation pipelines. |
| `get-evaluation-rows` | Get rows from an evaluation run. |
| `create-report` | Create an evaluation pipeline on a dataset. |
| `run-report` | Execute a pipeline. |
| `get-report` | Get pipeline details. |
| `get-report-score` | Get the computed score. |
| `add-report-column` | Add a single evaluation column to an existing pipeline. |
| `edit-report-column` | Update a column's type, configuration, name, or position. |
| `delete-report-column` | Delete a single column from a pipeline. |
| `update-report-score-card` | Configure custom scoring logic. |
| `rename-report` | Rename or retag an evaluation pipeline. |
| `delete-report` | Archive a single pipeline by ID. |
| `delete-reports-by-name` | Archive pipelines by name. |

### Agents

| Tool | Description |
|---|---|
| `list-workflows` | List all agents. |
| `get-workflow` | Get an agent by ID or name with optional version or label filter. |
| `get-workflow-labels` | List release labels on an agent. |
| `create-workflow` | Create an agent or new version. |
| `patch-workflow` | Partially update an agent. |
| `run-workflow` | Execute an agent by name. |
| `get-workflow-version-execution-results` | Poll for execution results. |

### Folders

| Tool | Description |
|---|---|
| `create-folder` | Create a folder for organizing resources. |
| `edit-folder` | Rename a folder. |
| `get-folder-entities` | List entities in a folder. Supports search, type filtering, flatten. |
| `move-folder-entities` | Move entities into a target folder. |
| `delete-folder-entities` | Permanently delete entities (prompts, agents, tools, datasets, etc.). |
| `resolve-folder-id` | Resolve a folder path to a folder ID. |

### Skill Collections

| Tool | Description |
|---|---|
| `list-skill-collections` | List all skill collections in the workspace. |
| `create-skill-collection` | Create a new skill collection with optional initial files (`{path, content}`). |
| `get-skill-collection` | Fetch a collection by UUID/name/root_path with file contents. Pin via `version` or `label`. |
| `update-skill-collection` | Rename a collection or update its description. |
| `save-skill-collection-version` | Save a new version. Use `file_updates`, `moves`, `deletes`; optionally attach a `release_label`. |

## Keeping in Sync

Schemas are verified against the [PromptLayer OpenAPI spec](https://github.com/magnivorg/prompt-layer-docs/blob/master/openapi.json). Run:

```bash
npm run sync:check
```

This fetches the spec, extracts our tool schemas, and diffs them structurally. Exit 0 = in sync. See [TESTING.md](TESTING.md) for details.

## Development

```bash
npm run dev       # Run with tsx (hot reload)
npm run build     # Compile TypeScript
npm run watch     # Watch mode
```

### Project Structure

```
src/
  index.ts      # Entry point, starts MCP server
  types.ts      # Zod schemas + TOOL_DEFINITIONS for all tools
  client.ts     # HTTP client for PromptLayer API
  handlers.ts   # Registers all tools with the MCP server
  utils.ts      # Shared utilities (query params, error handling, handler factory)
scripts/
  fetch-openapi-endpoints.ts   # Downloads + extracts OpenAPI spec
  extract-mcp-tools.ts         # Extracts MCP tool schemas for comparison
  diff-endpoints.ts            # Structural diff with known exceptions
```
