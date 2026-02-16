/**
 * Pretty-prints all MCP tool names, descriptions, and annotations.
 *
 * Usage: npx tsx scripts/show-descriptions.ts
 */

import { TOOL_DEFINITIONS } from "../src/types.js";

const CATEGORY_ORDER = [
  "Prompt Templates",
  "Tracking",
  "Datasets",
  "Evaluations",
  "Agents / Workflows",
  "Folders",
];

// Derive categories from the comment markers in TOOL_DEFINITIONS
const TOOL_CATEGORIES: Record<string, string> = {
  "get-prompt-template": "Prompt Templates",
  "get-prompt-template-raw": "Prompt Templates",
  "list-prompt-templates": "Prompt Templates",
  "publish-prompt-template": "Prompt Templates",
  "list-prompt-template-labels": "Prompt Templates",
  "create-prompt-label": "Prompt Templates",
  "move-prompt-label": "Prompt Templates",
  "delete-prompt-label": "Prompt Templates",
  "get-snippet-usage": "Prompt Templates",
  "log-request": "Tracking",
  "create-spans-bulk": "Tracking",
  "list-datasets": "Datasets",
  "create-dataset-group": "Datasets",
  "create-dataset-version-from-file": "Datasets",
  "create-dataset-version-from-filter-params": "Datasets",
  "list-evaluations": "Evaluations",
  "create-report": "Evaluations",
  "run-report": "Evaluations",
  "get-report": "Evaluations",
  "get-report-score": "Evaluations",
  "update-report-score-card": "Evaluations",
  "delete-reports-by-name": "Evaluations",
  "list-workflows": "Agents / Workflows",
  "get-workflow": "Agents / Workflows",
  "create-workflow": "Agents / Workflows",
  "patch-workflow": "Agents / Workflows",
  "run-workflow": "Agents / Workflows",
  "get-workflow-version-execution-results": "Agents / Workflows",
  "create-folder": "Folders",
  "edit-folder": "Folders",
  "get-folder-entities": "Folders",
  "move-folder-entities": "Folders",
  "delete-folder-entities": "Folders",
  "resolve-folder-id": "Folders",
};

// Group tools by category
const grouped = new Map<string, { name: string; description: string; readOnly: boolean }[]>();
for (const cat of CATEGORY_ORDER) grouped.set(cat, []);

for (const [name, def] of Object.entries(TOOL_DEFINITIONS)) {
  const cat = TOOL_CATEGORIES[name] ?? "Other";
  if (!grouped.has(cat)) grouped.set(cat, []);
  grouped.get(cat)!.push({
    name,
    description: def.description,
    readOnly: (def.annotations as { readOnlyHint?: boolean })?.readOnlyHint ?? false,
  });
}

// Print
const SEP = "─".repeat(80);

for (const [category, tools] of grouped) {
  if (tools.length === 0) continue;
  console.log(`\n${"═".repeat(80)}`);
  console.log(`  ${category.toUpperCase()} (${tools.length} tools)`);
  console.log(`${"═".repeat(80)}`);

  for (const tool of tools) {
    const badge = tool.readOnly ? "📖 read" : "✏️  write";
    console.log(`\n${SEP}`);
    console.log(`  ${tool.name}  [${badge}]`);
    console.log(SEP);
    // Word-wrap description at ~76 chars
    const words = tool.description.split(" ");
    let line = "  ";
    for (const word of words) {
      if (line.length + word.length + 1 > 78) {
        console.log(line);
        line = "  " + word;
      } else {
        line += (line.length > 2 ? " " : "") + word;
      }
    }
    if (line.trim()) console.log(line);
  }
}

console.log(`\n${"═".repeat(80)}`);
console.log(`  TOTAL: ${Object.keys(TOOL_DEFINITIONS).length} tools`);
console.log(`${"═".repeat(80)}\n`);
