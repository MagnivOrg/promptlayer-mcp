# CLAUDE.md

Project conventions and decisions for the PromptLayer MCP server.

## Architecture

- `src/types.ts` -- Zod input schemas + TOOL_DEFINITIONS for all tools
- `src/handlers.ts` -- Registers all tools with the MCP server (single file, data-driven)
- `src/client.ts` -- HTTP client with `get`/`post`/`patch`/`del` helpers
- `src/utils.ts` -- Query params, error handling, shared `createToolHandler` factory
- `src/index.ts` -- Entry point

## Response types: don't add them

Client methods return `Promise<unknown>`. Do not add typed response interfaces.

The handler `JSON.stringify`s whatever the API returns and passes it to the LLM as text. Nothing inspects the response shape. Typed responses would be unvalidated guesses that drift silently when the API changes -- TypeScript can't catch runtime shape mismatches.

This matches every major MCP server (GitHub, Stripe, official reference servers). The pattern is: type the inputs (Zod schemas sent to the LLM as tool definitions), stringify the outputs.

## Input schemas are the source of truth

Every tool's input schema is a Zod object in `src/types.ts`, verified against the PromptLayer OpenAPI spec. Run `npm run sync:check` to detect drift. The check must exit 0.

Known exceptions to the OpenAPI diff are declared in `scripts/diff-endpoints.ts` with inline comments explaining each one. If you add a new exception, also add a `// NOTE:` comment on the affected schema in `src/types.ts`.

## Adding a new endpoint

1. Add Zod schema + entry in `TOOL_DEFINITIONS` in `src/types.ts`
2. Add client method in `src/client.ts`
3. Register the tool in `src/handlers.ts`
4. Add mapping in `scripts/extract-mcp-tools.ts` (`TOOL_TO_ENDPOINT`)
5. Run `npm run sync:check` -- must exit 0

## Commands

- `npm run build` -- Compile TypeScript
- `npm run dev` -- Run with tsx
- `npm run sync:check` -- Verify schemas match OpenAPI spec (exit 0 = pass)
