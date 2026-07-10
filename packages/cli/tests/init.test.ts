import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { select } from "@inquirer/prompts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runInit, type InitDeps } from "../src/commands/init.js";
import type { FetchedExample } from "../src/git.js";

let workDir: string;
let fixtures: string[];

function promptQueue(answers: string[]): InitDeps["prompt"] {
  const queue = [...answers];
  const prompt = async () => {
    const next = queue.shift();
    if (next === undefined) throw new Error("prompt called too many times");
    return next;
  };
  return prompt as unknown as typeof select;
}

/** Fake fetcher that creates a one-file app for whichever example is requested. */
function fakeFetchExample() {
  return async (
    _repoUrl: string,
    examplePath: string
  ): Promise<FetchedExample> => {
    const root = await mkdtemp(join(tmpdir(), "ryo-init-fixture-"));
    fixtures.push(root);
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "package.json"), `{"name":"fixture"}`);
    await writeFile(join(root, "src", "main.ts"), examplePath);
    return {
      dir: root,
      exampleRoot: root,
      cleanup: async () => rm(root, { recursive: true, force: true }),
    };
  };
}

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "ryo-init-target-"));
  fixtures = [];
  process.exitCode = undefined;
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
  await rm(workDir, { recursive: true, force: true });
  for (const fixture of fixtures) {
    await rm(fixture, { recursive: true, force: true });
  }
});

describe("runInit", () => {
  it("scaffolds server and client from the chosen combo", async () => {
    const serverDir = join(workDir, "server");
    const clientDir = join(workDir, "client");

    await runInit(
      { serverDir, clientDir, force: false },
      {
        fetchExample: fakeFetchExample(),
        prompt: promptQueue([
          "Sessions",
          "Express.js",
          "SQLite",
          "Prisma",
          "Next.js",
        ]),
      }
    );

    expect(await readFile(join(serverDir, "src", "main.ts"), "utf8")).toBe(
      "examples/rest-express-prisma-sessions-sqlite"
    );
    expect(await readFile(join(clientDir, "src", "main.ts"), "utf8")).toBe(
      "examples/rest-next-sessions"
    );
    expect(process.exitCode).toBeUndefined();
  });

  it("scaffolds the NestJS/Postgres JWT combo end to end", async () => {
    const serverDir = join(workDir, "server");
    const clientDir = join(workDir, "client");

    await runInit(
      { serverDir, clientDir, force: false },
      {
        fetchExample: fakeFetchExample(),
        prompt: promptQueue(["JWT", "NestJS", "Postgres", "Prisma", "Next.js"]),
      }
    );

    expect(await readFile(join(serverDir, "src", "main.ts"), "utf8")).toBe(
      "examples/rest-nest-prisma-jwt-postgres"
    );
    expect(await readFile(join(clientDir, "src", "main.ts"), "utf8")).toBe(
      "examples/rest-next-jwt"
    );
  });

  it("refuses to write into an existing non-empty directory without --force", async () => {
    const serverDir = join(workDir, "server");
    const clientDir = join(workDir, "client");
    await mkdir(serverDir, { recursive: true });
    await writeFile(join(serverDir, "precious.txt"), "do not delete");

    await runInit(
      { serverDir, clientDir, force: false },
      {
        fetchExample: fakeFetchExample(),
        prompt: promptQueue([
          "Sessions",
          "Express.js",
          "SQLite",
          "Drizzle",
          "TanStack Start",
        ]),
      }
    );

    expect(await readFile(join(serverDir, "precious.txt"), "utf8")).toBe(
      "do not delete"
    );
    expect(existsSync(join(serverDir, "src", "main.ts"))).toBe(false);
    expect(process.exitCode).toBe(1);
    // the client scaffold should still have gone through
    expect(await readFile(join(clientDir, "src", "main.ts"), "utf8")).toBe(
      "examples/rest-tanstack-sessions"
    );
  });

  it("overwrites an existing directory with --force", async () => {
    const serverDir = join(workDir, "server");
    const clientDir = join(workDir, "client");
    await mkdir(serverDir, { recursive: true });
    await writeFile(join(serverDir, "old.txt"), "old");

    await runInit(
      { serverDir, clientDir, force: true },
      {
        fetchExample: fakeFetchExample(),
        prompt: promptQueue([
          "Sessions",
          "Express.js",
          "SQLite",
          "Prisma",
          "Next.js",
        ]),
      }
    );

    expect(existsSync(join(serverDir, "src", "main.ts"))).toBe(true);
    expect(process.exitCode).toBeUndefined();
  });
});
