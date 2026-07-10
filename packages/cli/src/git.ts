import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function git(args: string[], cwd?: string): Promise<void> {
  await execFileAsync("git", args, { cwd });
}

export interface FetchedExample {
  /** Absolute path of the requested directory inside the temp clone */
  dir: string;
  /** Absolute path of the example root (contains package.json) */
  exampleRoot: string;
  /** Remove the temp clone */
  cleanup: () => Promise<void>;
}

/**
 * Sparse-checkout a single example directory (optionally a sub-directory of
 * it) into a temp dir. Callers must invoke `cleanup()` when done.
 */
export async function fetchExampleSource(
  repoUrl: string,
  examplePath: string,
  subPath = ""
): Promise<FetchedExample> {
  const tempDirectory = await mkdtemp(join(tmpdir(), "ryo-auth-"));
  const sparsePath = subPath ? `${examplePath}/${subPath}` : examplePath;

  const cleanup = () => rm(tempDirectory, { recursive: true, force: true });

  try {
    await git([
      "clone",
      "--filter=blob:none",
      "--no-checkout",
      "--depth=1",
      repoUrl,
      tempDirectory,
    ]);
    await git(["sparse-checkout", "init", "--cone"], tempDirectory);
    await git(["sparse-checkout", "set", sparsePath], tempDirectory);
    await git(["checkout"], tempDirectory);
  } catch (error) {
    await cleanup().catch(() => {});
    throw error;
  }

  return {
    dir: join(tempDirectory, ...sparsePath.split("/")),
    exampleRoot: join(tempDirectory, ...examplePath.split("/")),
    cleanup,
  };
}
