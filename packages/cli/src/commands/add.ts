import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import prompts from "prompts";
import { getRegistryComponent } from "../registry/index.js";
import { logger, highlight } from "../utils/logger.js";
import {
  detectPackageManager,
  installCommand,
} from "../utils/package-manager.js";
import type { RegistryFile } from "../types.js";

export interface AddOptions {
  cwd: string;
  /** Overwrite existing files without prompting. */
  overwrite: boolean;
  /** Skip the overwrite prompt and skip existing files instead. */
  yes: boolean;
  /** Directory to write into, relative to cwd. Defaults to ".". */
  path?: string;
}

export async function add(
  components: string[],
  options: AddOptions
): Promise<void> {
  const cwd = path.resolve(options.cwd);

  if (!components.length) {
    logger.error("No component specified. Try: ryo-auth add session-express-prisma");
    process.exitCode = 1;
    return;
  }

  const destRoot = options.path ? path.resolve(cwd, options.path) : cwd;

  for (const name of components) {
    logger.step(`Adding ${highlight(name)}`);

    let component;
    try {
      component = await getRegistryComponent(name);
    } catch (error) {
      logger.error((error as Error).message);
      process.exitCode = 1;
      continue;
    }

    const written: string[] = [];
    const skipped: string[] = [];

    for (const file of component.files) {
      const result = await writeRegistryFile(file, destRoot, options);
      if (result === "written") written.push(file.target);
      else skipped.push(file.target);
    }

    if (written.length) {
      logger.success(
        `Added ${written.length} file${written.length === 1 ? "" : "s"}:`
      );
      for (const f of written) logger.dim(`  + ${path.relative(cwd, path.join(destRoot, f))}`);
    }
    if (skipped.length) {
      logger.warn(`Skipped ${skipped.length} existing file${skipped.length === 1 ? "" : "s"}:`);
      for (const f of skipped) logger.dim(`  - ${path.relative(cwd, path.join(destRoot, f))}`);
    }

    reportDependencies(component, cwd);
  }
}

async function writeRegistryFile(
  file: RegistryFile,
  destRoot: string,
  options: AddOptions
): Promise<"written" | "skipped"> {
  const targetPath = path.resolve(destRoot, file.target);
  const exists = existsSync(targetPath);

  if (exists && !options.overwrite) {
    if (options.yes) return "skipped";

    // If the content is identical there's nothing to do.
    const current = await readFile(targetPath, "utf8");
    if (current === file.content) return "skipped";

    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `${path.relative(destRoot, targetPath)} already exists. Overwrite?`,
      initial: false,
    });
    if (!overwrite) return "skipped";
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, file.content, "utf8");
  return "written";
}

function reportDependencies(
  component: { dependencies?: string[]; devDependencies?: string[] },
  cwd: string
): void {
  const pm = detectPackageManager(cwd);
  const deps = component.dependencies ?? [];
  const devDeps = component.devDependencies ?? [];
  if (!deps.length && !devDeps.length) return;

  logger.break();
  logger.info("Install the required dependencies:");
  if (deps.length) logger.dim(`  ${installCommand(pm, deps)}`);
  if (devDeps.length) logger.dim(`  ${installCommand(pm, devDeps, true)}`);
}
