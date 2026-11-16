import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { TOOL_DEFINITIONS } from "../build/types.js";

function assertAnnotations(tools) {
  assert.deepEqual(tools.map(({ name }) => name).sort(), Object.keys(TOOL_DEFINITIONS).sort());
  for (const tool of tools) {
    assert.deepEqual(tool.annotations, TOOL_DEFINITIONS[tool.name].annotations, tool.name);
    if (/^(get|list|search)-/.test(tool.name)) {
      assert.equal(tool.annotations.readOnlyHint, true, tool.name);
    }
    if (!tool.annotations.readOnlyHint) {
      assert.equal(typeof tool.annotations.destructiveHint, "boolean", tool.name);
    }
    if (tool.name.startsWith("delete-")) {
      assert.equal(tool.annotations.readOnlyHint, false, tool.name);
      assert.equal(tool.annotations.destructiveHint, true, tool.name);
    }
  }
  for (const name of ["create-smart-table", "update-smart-table", "add-smart-table-rows"]) {
    assert.equal(tools.find((tool) => tool.name === name).annotations.destructiveHint, false, name);
  }
  for (const name of ["update-smart-table-cell", "create-smart-table-version", "run-workflow", "test-execute-tool-registry"]) {
    assert.equal(tools.find((tool) => tool.name === name).annotations.destructiveHint, true, name);
  }
}

test("stdio tools/list includes tool annotations", { timeout: 15000 }, async () => {
  const client = new Client({ name: "annotation-test", version: "1.0.0" });
  try {
    await client.connect(new StdioClientTransport({
      command: process.execPath,
      args: ["build/index.js"],
      stderr: "pipe",
    }));
    assertAnnotations((await client.listTools()).tools);
  } finally {
    await client.close();
  }
});

test("hosted HTTP tools/list includes tool annotations", { timeout: 15000 }, async () => {
  const child = spawn(process.execPath, ["gcp/build/server.mjs"], {
    env: { ...process.env, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const client = new Client({ name: "annotation-test", version: "1.0.0" });
  try {
    const port = await new Promise((resolve, reject) => {
      let output = "";
      let errors = "";
      child.stderr.on("data", (chunk) => { errors += chunk; });
      child.on("error", reject);
      child.on("exit", (code) => reject(new Error(`HTTP server exited (${code}): ${errors}`)));
      child.stdout.on("data", (chunk) => {
        output += chunk;
        const match = output.match(/listening on port (\d+)/);
        if (match) resolve(match[1]);
      });
    });
    await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`)));
    assertAnnotations((await client.listTools()).tools);
  } finally {
    await client.close();
    const exited = once(child, "exit");
    child.kill();
    await exited;
  }
});
