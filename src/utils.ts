/**
 * Utility functions and error handling
 */

/**
 * Builds URL query string from object, filtering out undefined and null values.
 */
export function buildQueryParams(params?: Record<string, unknown>): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getApiKey(providedKey?: string): string {
  const apiKey = providedKey ?? process.env.PROMPTLAYER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No API key provided. Set PROMPTLAYER_API_KEY environment variable or pass api_key parameter.",
    );
  }

  // Validate API key format
  if (!apiKey.startsWith("pl_")) {
    throw new Error(
      "Invalid API key format. PromptLayer API keys must start with 'pl_'",
    );
  }

  return apiKey;
}

export async function handleApiError(response: Response): Promise<Error> {
  let errorMessage: string;
  let errorBody: string;

  try {
    errorBody = await response.text();
    const parsed = JSON.parse(errorBody);
    errorMessage = parsed.message || parsed.error || parsed.detail || errorBody;
  } catch {
    errorBody = await response.text();
    errorMessage = errorBody || "Unknown error";
  }

  switch (response.status) {
    case 401:
      return new Error("Invalid PromptLayer API key");
    case 403:
      return new Error("Permission denied. Check your API key permissions.");
    case 404:
      return new Error(`Resource not found: ${errorMessage}`);
    case 422:
      return new Error(`Validation error: ${errorMessage}`);
    case 429:
      return new Error("Rate limit exceeded. Please try again later.");
    case 500:
    case 502:
    case 503:
    case 504:
      return new Error(`PromptLayer service error: ${errorMessage}`);
    default:
      return new Error(
        `PromptLayer API error (${response.status}): ${errorMessage}`,
      );
  }
}

export function formatErrorResponse(error: unknown): {
  content: Array<{ type: "text"; text: string }>;
  isError: boolean;
} {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [
      {
        type: "text" as const,
        text: `Error: ${message}`,
      },
    ],
    isError: true,
  };
}

export function formatSuccessResponse(
  data: unknown,
  text?: string,
): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: unknown;
} {
  const jsonText = JSON.stringify(data, null, 2);
  const displayText = text ? `${text}\n\n${jsonText}` : jsonText;

  return {
    content: [
      {
        type: "text" as const,
        text: displayText,
      },
    ],
    structuredContent: data,
  };
}
