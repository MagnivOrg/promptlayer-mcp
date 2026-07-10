/** Shared MCP instructions for snippet dependency-first publish ordering (PRO-214). */

export const SNIPPET_PUBLISH_ORDERING_SERVER_INSTRUCTIONS = `
## Snippet dependency-first publish ordering

Publishing a prompt that contains \`@@@snippet_name@@@\` references **fails** unless every referenced snippet already exists in the workspace.

**Always publish leaf snippets before parents** (multi-pass, one API call per prompt/snippet):

1. Snippets with no snippet refs (\`prompt_template.is_snippet=true\` on first publish)
2. Snippets that only reference already-published snippets
3. Parent prompts last

**Create snippets:** set \`prompt_template.is_snippet=true\` on the first \`publish-prompt-template\` call.

**Copy/migrate:** use \`get-prompt-template-raw\` with \`resolve_snippets=false\`, read the response \`snippets\` array, publish each dependency to the destination workspace first, then publish the parent with \`@@@\` markers intact. Never republish content fetched with resolved/inlined snippets.

On HTTP 400, read **Suggested order** in the error and publish missing snippets before retrying the parent.
`.trim();

export const PUBLISH_PROMPT_TEMPLATE_SNIPPET_ORDERING_NOTE =
  "Publish snippet dependencies before parents: leaf snippets first (prompt_template.is_snippet=true on first publish), " +
  "then prompts that reference @@@snippet_name@@@. " +
  "On failure, read Suggested order in the error. " +
  "When copying prompts, fetch with get-prompt-template-raw and resolve_snippets=false.";
