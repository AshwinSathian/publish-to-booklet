import { test } from "node:test";
import assert from "node:assert/strict";
import { idempotencyKey, isValidVisibility, run } from "../src/main";

function withInputs(inputs: Record<string, string>, fn: () => Promise<void>) {
  const keys = Object.keys(inputs).map((k) => `INPUT_${k.toUpperCase()}`);
  for (const [k, v] of Object.entries(inputs)) process.env[`INPUT_${k.toUpperCase()}`] = v;
  return fn().finally(() => {
    for (const k of keys) delete process.env[k];
    process.exitCode = undefined;
  });
}

test("isValidVisibility accepts only public/unlisted", () => {
  assert.equal(isValidVisibility("public"), true);
  assert.equal(isValidVisibility("unlisted"), true);
  assert.equal(isValidVisibility("private"), false);
  assert.equal(isValidVisibility(""), false);
});

test("run() fails on an invalid visibility input", async () => {
  await withInputs({ file: "doc.md", "api-key": "key", visibility: "private" }, async () => {
    await run({
      readFile: () => "irrelevant",
      createClient: () => {
        throw new Error("should not be called");
      },
    });
    assert.equal(process.exitCode, 1);
  });
});

test("run() fails when the file can't be read", async () => {
  await withInputs({ file: "missing.md", "api-key": "key" }, async () => {
    await run({
      readFile: () => {
        throw new Error("ENOENT: no such file");
      },
      createClient: () => {
        throw new Error("should not be called");
      },
    });
    assert.equal(process.exitCode, 1);
  });
});

test("run() publishes a new page when no page-id is given", async () => {
  const calls: unknown[] = [];
  await withInputs({ file: "doc.md", "api-key": "key" }, async () => {
    await run({
      readFile: () => "# Hello",
      createClient: () => ({
        publishPage: async (raw: string, opts?: unknown) => {
          calls.push(["publish", raw, opts]);
          return { id: "abc123", url: "https://booklet.example/abc123" } as never;
        },
        updatePage: async () => {
          throw new Error("should not be called");
        },
      }),
    });
    assert.deepEqual(calls, [["publish", "# Hello", { visibility: "unlisted", idempotencyKey: idempotencyKey("doc.md") }]]);
    assert.notEqual(process.exitCode, 1);
  });
});

test("run() updates an existing page when page-id is given", async () => {
  const calls: unknown[] = [];
  await withInputs(
    { file: "doc.md", "api-key": "key", "page-id": "abc123", visibility: "public" },
    async () => {
      await run({
        readFile: () => "# Hello",
        createClient: () => ({
          publishPage: async () => {
            throw new Error("should not be called");
          },
          updatePage: async (id: string, patch: unknown) => {
            calls.push(["update", id, patch]);
            return { id: "abc123", url: "https://booklet.example/abc123" } as never;
          },
        }),
      });
      assert.deepEqual(calls, [["update", "abc123", { raw: "# Hello", visibility: "public" }]]);
      assert.notEqual(process.exitCode, 1);
    },
  );
});

test("idempotencyKey is stable across attempts of one run and differs per run and file", () => {
  const env = { GITHUB_REPOSITORY: "o/r", GITHUB_RUN_ID: "1", GITHUB_RUN_ATTEMPT: "1" };
  const key = idempotencyKey("a.md", env);
  assert.match(key ?? "", /^[0-9a-f]{64}$/);
  assert.equal(idempotencyKey("a.md", { ...env, GITHUB_RUN_ATTEMPT: "2" }), key);
  assert.notEqual(idempotencyKey("b.md", env), key);
  assert.notEqual(idempotencyKey("a.md", { ...env, GITHUB_RUN_ID: "2" }), key);
  assert.equal(idempotencyKey("a.md", {}), undefined);
});
