# CLAUDE.md

Project conventions and decisions for the PromptLayer MCP server.

## Architecture

- `src/types.ts` -- Zod input schemas + TOOL_DEFINITIONS for all tools
- `src/handlers.ts` -- Registers all tools with the MCP server (single file, data-driven)
- `src/client.ts` -- HTTP client with `get`/`post`/`patch`/`del` helpers
- `src/utils.ts` -- Query params, error handling, shared `createToolHandler` factory
- `src/index.ts` -- Entry point
- `gcp/src/index.ts` -- Cloud Run HTTP variant. Reuses `src/types.ts` and `src/client.ts`, but has its own dispatch table (`TOOL_HANDLERS`) — every tool registered in `src/handlers.ts` needs a matching entry here.

## Response types: don't add them

Client methods return `Promise<unknown>`. Do not add typed response interfaces.

The handler `JSON.stringify`s whatever the API returns and passes it to the LLM as text. Nothing inspects the response shape. Typed responses would be unvalidated guesses that drift silently when the API changes -- TypeScript can't catch runtime shape mismatches.

This matches every major MCP server (GitHub, Stripe, official reference servers). The pattern is: type the inputs (Zod schemas sent to the LLM as tool definitions), stringify the outputs.

## Input schemas are the source of truth

Every tool's input schema is a Zod object in `src/types.ts`. Schemas should match what the backend actually accepts (check `RequestLogFilterParams` and similar Pydantic models), not just the OpenAPI spec which may be outdated.

## Adding a new endpoint

1. Add Zod schema + entry in `TOOL_DEFINITIONS` in `src/types.ts`
2. Add client method in `src/client.ts`
3. Register the tool in `src/handlers.ts`
4. Bump the `version` in `package.json` (minor for additive changes)
4. Add a dispatch entry in `gcp/src/index.ts` `TOOL_HANDLERS` so the Cloud Run server exposes it too

## Commands

- `npm run build` -- Compile TypeScript
- `npm run dev` -- Run with tsx
