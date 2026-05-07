# PromptLayer MCP Server

MCP server that wraps the [PromptLayer REST API](https://docs.promptlayer.com/reference/rest-api-reference), giving any MCP-compatible client access to all 60 PromptLayer tools.

## Setup

```bash
npm install
```

Set your API key:

```bash
export PROMPTLAYER_API_KEY=pl_your_key_here
```

Or create a `.env` file (see `.env.example`).

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

### Datasets

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

### Evaluations

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
