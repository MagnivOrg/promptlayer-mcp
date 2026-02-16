# PromptLayer MCP Server

MCP server that wraps the [PromptLayer REST API](https://docs.promptlayer.com/reference/rest-api-reference), giving any MCP-compatible client access to all 33 PromptLayer tools.

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

### Tracking

| Tool | Description |
|---|---|
| `log-request` | Log an LLM request/response pair. Input/output in Prompt Blueprint format. |
| `track-prompt` | Link a logged request to a prompt template. |
| `track-score` | Score a logged request (0-100). Supports named scores. |
| `track-metadata` | Attach metadata to a logged request. |
| `track-group` | Associate a request with a group. |
| `create-spans-bulk` | Create OpenTelemetry spans in bulk for tracing. |

### Datasets

| Tool | Description |
|---|---|
| `list-datasets` | List datasets with filtering. |
| `create-dataset-group` | Create a dataset group (container for versions). |
| `create-dataset-version-from-file` | Create a version from base64 CSV/JSON. |
| `create-dataset-version-from-filter-params` | Create a version from request log history. |

### Evaluations

| Tool | Description |
|---|---|
| `list-evaluations` | List evaluation pipelines. |
| `create-report` | Create an evaluation pipeline on a dataset. |
| `run-report` | Execute a pipeline. |
| `get-report` | Get pipeline details. |
| `get-report-score` | Get the computed score. |
| `add-report-column` | Add an evaluation step (one per request). |
| `update-report-score-card` | Configure custom scoring logic. |
| `delete-reports-by-name` | Archive pipelines by name. |

### Agents

| Tool | Description |
|---|---|
| `list-workflows` | List all agents. |
| `create-workflow` | Create an agent or new version. |
| `patch-workflow` | Partially update an agent. |
| `run-workflow` | Execute an agent by name. |
| `get-workflow-version-execution-results` | Poll for execution results. |

### Other

| Tool | Description |
|---|---|
| `create-folder` | Create a folder for organizing resources. |

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
  types.ts      # Zod schemas + TOOL_DEFINITIONS for all 33 tools
  client.ts     # HTTP client for PromptLayer API
  handlers.ts   # Registers all tools with the MCP server
  utils.ts      # Shared utilities (query params, error handling, handler factory)
scripts/
  fetch-openapi-endpoints.ts   # Downloads + extracts OpenAPI spec
  extract-mcp-tools.ts         # Extracts MCP tool schemas for comparison
  diff-endpoints.ts            # Structural diff with known exceptions
```
