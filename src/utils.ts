import { PromptLayerClient } from "./client.js";

export function buildQueryParams(params?: Record<string, unknown>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) sp.set(key, String(value));
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export function getApiKey(providedKey?: string): string {
  const apiKey = providedKey ?? process.env.PROMPTLAYER_API_KEY;
  if (!apiKey) {
    throw new Error("No API key provided. Set PROMPTLAYER_API_KEY environment variable or pass api_key parameter.");
  }
  if (!apiKey.startsWith("pl_")) {
    throw new Error("Invalid API key format. PromptLayer API keys must start with 'pl_'");
  }
  return apiKey;
}

export async function handleApiError(response: Response): Promise<Error> {
  let msg: string;
  try {
    const body = await response.text();
    const parsed = JSON.parse(body);
    msg = parsed.message || parsed.error || parsed.detail || body;
  } catch {
    msg = response.statusText || "Unknown error";
  }
  const status = response.status;
  if (status === 401) return new Error("Invalid PromptLayer API key");
  if (status === 403) return new Error("Permission denied. Check your API key permissions.");
  if (status === 404) return new Error(`Resource not found: ${msg}`);
  if (status === 422) return new Error(`Validation error: ${msg}`);
  if (status === 429) return new Error("Rate limit exceeded. Please try again later.");
  if (status >= 500) return new Error(`PromptLayer service error: ${msg}`);
  return new Error(`PromptLayer API error (${status}): ${msg}`);
}

type Args = Record<string, unknown> & { api_key?: string };

export function createToolHandler(
  call: (client: PromptLayerClient, args: Args) => Promise<unknown>,
  msg: (result: unknown) => string
) {
  return async (args: Args) => {
    try {
      const client = new PromptLayerClient(getApiKey(args.api_key));
      const result = await call(client, args);
      const json = JSON.stringify(result, null, 2);
      return {
        content: [{ type: "text" as const, text: `${msg(result)}\n\n${json}` }],
        structuredContent: result,
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : error}` }],
        isError: true,
      };
    }
  };
}
