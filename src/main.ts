import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient, BookletApiError, type ClientOptions, type BookletClient } from "booklet-api-client";

export function isValidVisibility(value: string): value is "public" | "unlisted" {
  return value === "public" || value === "unlisted";
}

export type PublishResult = { id: string; url: string };

export interface RunDeps {
  readFile: (path: string) => string;
  createClient: (options: ClientOptions) => Pick<BookletClient, "publishPage" | "updatePage">;
}

const defaultDeps: RunDeps = {
  readFile: (path) => readFileSync(path, "utf-8"),
  createClient,
};

export async function run(deps: RunDeps = defaultDeps): Promise<void> {
  // @actions/core ^3.x publishes ESM-only (no "require" export condition) —
  // a dynamic import here goes through Node's real (ESM-aware) resolver
  // instead of the strict CJS require() this file otherwise runs under.
  const core = await import("@actions/core");

  const file = core.getInput("file", { required: true });
  const apiKey = core.getInput("api-key", { required: true });
  const pageId = core.getInput("page-id") || null;
  const visibility = core.getInput("visibility") || "unlisted";
  const baseUrl = core.getInput("base-url") || "https://booklet-api.ashwinsathian.com";

  core.setSecret(apiKey);

  if (!isValidVisibility(visibility)) {
    core.setFailed(`Invalid visibility: "${visibility}" — must be "public" or "unlisted"`);
    return;
  }

  core.debug(`Publishing ${file} to ${baseUrl}`);

  let raw: string;
  try {
    raw = deps.readFile(resolve(process.cwd(), file));
  } catch (e) {
    core.setFailed(`Could not read file: ${file} — ${e instanceof Error ? e.message : String(e)}`);
    return;
  }

  const client = deps.createClient({ baseUrl, apiKey, source: "github-action" });

  let result: PublishResult;
  try {
    result = pageId ? await client.updatePage(pageId, { raw, visibility }) : await client.publishPage(raw);
  } catch (e) {
    const message = e instanceof BookletApiError ? e.message : e instanceof Error ? e.message : String(e);
    core.setFailed(`Publish failed: ${message}`);
    return;
  }

  core.setOutput("id", result.id);
  core.setOutput("url", result.url);
  core.info(`Published: ${result.url}`);
}

if (require.main === module) {
  void run();
}
