import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copyDir, listFiles } from "../src/copy.js";

let source: string;
let target: string;

beforeEach(async () => {
  source = await mkdtemp(join(tmpdir(), "ryo-copy-src-"));
  target = await mkdtemp(join(tmpdir(), "ryo-copy-target-"));

  await mkdir(join(source, "lib", "auth"), { recursive: true });
  await writeFile(join(source, "server.ts"), "server");
  await writeFile(join(source, "lib", "auth", "session.ts"), "session");
});

afterEach(async () => {
  await rm(source, { recursive: true, force: true });
  await rm(target, { recursive: true, force: true });
});

describe("listFiles", () => {
  it("lists nested files relative to the root, sorted", async () => {
    expect(await listFiles(source)).toEqual([
      join("lib", "auth", "session.ts"),
      "server.ts",
    ]);
  });
});

describe("copyDir", () => {
  it("copies the whole tree preserving structure", async () => {
    const result = await copyDir(source, target);

    expect(result.written).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
    expect(
      await readFile(join(target, "lib", "auth", "session.ts"), "utf8")
    ).toBe("session");
    expect(await readFile(join(target, "server.ts"), "utf8")).toBe("server");
  });

  it("skips existing files by default", async () => {
    await mkdir(join(target, "lib", "auth"), { recursive: true });
    await writeFile(join(target, "lib", "auth", "session.ts"), "mine");

    const result = await copyDir(source, target);

    expect(result.written).toHaveLength(1);
    expect(result.skipped).toEqual([join(target, "lib", "auth", "session.ts")]);
    expect(
      await readFile(join(target, "lib", "auth", "session.ts"), "utf8")
    ).toBe("mine");
  });

  it("overwrites existing files when asked to", async () => {
    await mkdir(join(target, "lib", "auth"), { recursive: true });
    await writeFile(join(target, "lib", "auth", "session.ts"), "mine");

    const result = await copyDir(source, target, { overwrite: true });

    expect(result.written).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
    expect(
      await readFile(join(target, "lib", "auth", "session.ts"), "utf8")
    ).toBe("session");
  });

  it("copies into a directory that does not exist yet", async () => {
    const nested = join(target, "does", "not", "exist");
    const result = await copyDir(source, nested);

    expect(result.written).toHaveLength(2);
    expect(await readFile(join(nested, "server.ts"), "utf8")).toBe("server");
  });
});
