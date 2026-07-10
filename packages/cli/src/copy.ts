import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

export interface CopyResult {
  written: string[];
  skipped: string[];
}

/** List every file under `dir`, as paths relative to `dir`. */
export async function listFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        files.push(relative(dir, fullPath));
      }
    }
  }

  await walk(dir);
  return files.sort();
}

/**
 * Copy every file from `sourceDir` into `targetDir`, preserving structure.
 * Existing files are skipped unless `overwrite` is set.
 */
export async function copyDir(
  sourceDir: string,
  targetDir: string,
  options: { overwrite?: boolean } = {}
): Promise<CopyResult> {
  const written: string[] = [];
  const skipped: string[] = [];

  for (const rel of await listFiles(sourceDir)) {
    const to = join(targetDir, rel);
    if (existsSync(to) && !options.overwrite) {
      skipped.push(to);
      continue;
    }
    await mkdir(dirname(to), { recursive: true });
    await copyFile(join(sourceDir, rel), to);
    written.push(to);
  }

  return { written, skipped };
}
