import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runAdd } from "../src/commands/add.js";
import type { FetchedExample } from "../src/git.js";

let fixtureRoot: string;
let targetDir: string;
let cleanupCalls: number;

/**
 * Builds a fake fetchExample that lays out an example the way the sparse
 * checkout would: <root>/package.json plus <root>/src/** auth code.
 */
async function makeFixture() {
  fixtureRoot = await mkdtemp(join(tmpdir(), "ryo-add-fixture-"));
  const src = join(fixtureRoot, "src");
  await mkdir(join(src, "lib"), { recursive: true });
  await writeFile(join(src, "server.ts"), "server");
  await writeFile(join(src, "lib", "auth.ts"), "auth");
  await writeFile(
    join(fixtureRoot, "package.json"),
    JSON.stringify({ dependencies: { express: "^4.0.0", zod: "^3.0.0" } })
  );

  cleanupCalls = 0;
  const fetchExample = async (): Promise<FetchedExample> => ({
    dir: src,
    exampleRoot: fixtureRoot,
    cleanup: async () => {
      cleanupCalls += 1;
    },
  });
  return fetchExample;
}

beforeEach(async () => {
  targetDir = await mkdtemp(join(tmpdir(), "ryo-add-target-"));
  process.exitCode = undefined;
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
  await rm(targetDir, { recursive: true, force: true });
  if (fixtureRoot) await rm(fixtureRoot, { recursive: true, force: true });
});

describe("runAdd", () => {
  it("copies the example src into the target dir and cleans up", async () => {
    const fetchExample = await makeFixture();

    await runAdd(
      "session-express-prisma",
      { dir: targetDir, overwrite: false },
      { fetchExample }
    );

    expect(await readFile(join(targetDir, "server.ts"), "utf8")).toBe("server");
    expect(await readFile(join(targetDir, "lib", "auth.ts"), "utf8")).toBe(
      "auth"
    );
    expect(cleanupCalls).toBe(1);
    expect(process.exitCode).toBeUndefined();
  });

  it("suggests installing the example's dependencies", async () => {
    const fetchExample = await makeFixture();

    await runAdd(
      "session-express-prisma",
      { dir: targetDir, overwrite: false },
      { fetchExample }
    );

    const output = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(output).toContain("npm install express zod");
  });

  it("does not clobber existing files without --overwrite", async () => {
    const fetchExample = await makeFixture();
    await writeFile(join(targetDir, "server.ts"), "mine");

    await runAdd(
      "session-express-prisma",
      { dir: targetDir, overwrite: false },
      { fetchExample }
    );

    expect(await readFile(join(targetDir, "server.ts"), "utf8")).toBe("mine");
    expect(await readFile(join(targetDir, "lib", "auth.ts"), "utf8")).toBe(
      "auth"
    );
  });

  it("overwrites existing files with --overwrite", async () => {
    const fetchExample = await makeFixture();
    await writeFile(join(targetDir, "server.ts"), "mine");

    await runAdd(
      "session-express-prisma",
      { dir: targetDir, overwrite: true },
      { fetchExample }
    );

    expect(await readFile(join(targetDir, "server.ts"), "utf8")).toBe("server");
  });

  it("fails with exit code 1 for unknown components", async () => {
    const fetchExample = vi.fn();

    await runAdd(
      "definitely-not-a-component",
      { dir: targetDir, overwrite: false },
      { fetchExample }
    );

    expect(process.exitCode).toBe(1);
    expect(fetchExample).not.toHaveBeenCalled();
  });

  it("fails gracefully when fetching the example blows up", async () => {
    const fetchExample = vi.fn().mockRejectedValue(new Error("git exploded"));

    await runAdd(
      "session-express-prisma",
      { dir: targetDir, overwrite: false },
      { fetchExample }
    );

    expect(process.exitCode).toBe(1);
    const output = vi
      .mocked(console.error)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(output).toContain("git exploded");
  });
});
