/**
 * Fetches the PromptLayer OpenAPI spec from GitHub and extracts a canonical
 * list of endpoints with their parameters. Writes to scripts/openapi-endpoints.json.
 *
 * Usage: npx tsx scripts/fetch-openapi-endpoints.ts
 */

const OPENAPI_URL = "https://raw.githubusercontent.com/magnivorg/prompt-layer-docs/master/openapi.json";
const OUTPUT_PATH = new URL("./openapi-endpoints.json", import.meta.url).pathname;

type OpenAPIParam = {
  name: string;
  in: string;
  required?: boolean;
  schema?: { type?: string; enum?: string[]; default?: unknown; [k: string]: unknown };
  [k: string]: unknown;
};

type OpenAPISchema = {
  type?: string;
  properties?: Record<string, { type?: string | unknown[]; enum?: string[]; [k: string]: unknown }>;
  required?: string[];
  $ref?: string;
  [k: string]: unknown;
};

type CanonicalEndpoint = {
  method: string;
  path: string;
  summary: string;
  operationId: string;
  pathParams: { name: string; type: string; required: boolean }[];
  queryParams: { name: string; type: string; required: boolean; enum?: string[]; default?: unknown }[];
  bodyFields: { name: string; type: string; required: boolean; enum?: string[] }[];
};

function resolveRef(ref: string, spec: Record<string, unknown>): Record<string, unknown> {
  const parts = ref.replace("#/", "").split("/");
  let obj: unknown = spec;
  for (const p of parts) obj = (obj as Record<string, unknown>)[p];
  return obj as Record<string, unknown>;
}

function resolveSchema(schema: OpenAPISchema, spec: Record<string, unknown>): OpenAPISchema {
  if (schema.$ref) return resolveRef(schema.$ref, spec) as OpenAPISchema;
  return schema;
}

function normalizeType(schema: { type?: string | unknown[]; anyOf?: unknown[]; oneOf?: unknown[]; [k: string]: unknown }): string {
  if (typeof schema.type === "string") return schema.type;
  if (Array.isArray(schema.type)) {
    const nonNull = schema.type.filter((t) => t !== "null");
    return nonNull.length === 1 ? String(nonNull[0]) : String(schema.type);
  }
  if (schema.anyOf) {
    const types = (schema.anyOf as Array<{ type?: string }>).map((s) => s.type).filter((t) => t && t !== "null");
    return types.length === 1 ? types[0]! : `union(${types.join(",")})`;
  }
  if (schema.oneOf) return "oneOf";
  return "unknown";
}

async function main() {
  console.error(`Fetching OpenAPI spec from ${OPENAPI_URL}...`);
  const resp = await fetch(OPENAPI_URL);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  const spec = (await resp.json()) as Record<string, unknown>;
  const paths = spec.paths as Record<string, Record<string, Record<string, unknown>>>;

  const endpoints: CanonicalEndpoint[] = [];

  for (const [path, methods] of Object.entries(paths).sort(([a], [b]) => a.localeCompare(b))) {
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      const op = methods[method];
      if (!op) continue;

      const endpoint: CanonicalEndpoint = {
        method: method.toUpperCase(),
        path,
        summary: (op.summary as string) || "",
        operationId: (op.operationId as string) || "",
        pathParams: [],
        queryParams: [],
        bodyFields: [],
      };

      // Parameters (path + query)
      const params = (op.parameters || []) as OpenAPIParam[];
      for (const p of params) {
        const resolved = p.$ref ? (resolveRef(p.$ref as string, spec) as OpenAPIParam) : p;
        if (resolved.in === "header") continue; // skip X-API-KEY
        const schema = resolved.schema || {};
        const entry = {
          name: resolved.name,
          type: normalizeType(schema),
          required: resolved.required ?? false,
          ...(schema.enum ? { enum: schema.enum } : {}),
          ...(schema.default !== undefined ? { default: schema.default } : {}),
        };
        if (resolved.in === "path") endpoint.pathParams.push(entry);
        else if (resolved.in === "query") endpoint.queryParams.push(entry);
      }

      // Request body
      const reqBody = op.requestBody as { content?: Record<string, { schema?: OpenAPISchema }> } | undefined;
      if (reqBody?.content) {
        for (const ct of Object.values(reqBody.content)) {
          let schema = ct.schema;
          if (!schema) continue;
          schema = resolveSchema(schema, spec);

          // Handle anyOf/oneOf wrappers (e.g. anyOf: [$ref, null])
          if (!schema.properties && (schema.anyOf || schema.oneOf)) {
            const variants = (schema.anyOf || schema.oneOf) as OpenAPISchema[];
            const nonNull = variants.filter((v) => v.type !== "null");
            if (nonNull.length === 1) {
              schema = resolveSchema(nonNull[0], spec);
            }
          }

          if (schema.type === "object" && schema.properties) {
            const required = new Set(schema.required || []);
            for (const [name, propSchema] of Object.entries(schema.properties)) {
              const resolved = propSchema.$ref
                ? (resolveRef(propSchema.$ref as string, spec) as typeof propSchema)
                : propSchema;
              endpoint.bodyFields.push({
                name,
                type: normalizeType(resolved),
                required: required.has(name),
                ...(resolved.enum ? { enum: resolved.enum as string[] } : {}),
              });
            }
          }
        }
      }

      endpoints.push(endpoint);
    }
  }

  const { writeFileSync } = await import("fs");
  writeFileSync(OUTPUT_PATH, JSON.stringify(endpoints, null, 2) + "\n");
  console.error(`Wrote ${endpoints.length} endpoints to ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
