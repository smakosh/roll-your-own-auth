import { readFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { copyDir } from "../copy.js";
import { fetchExampleSource } from "../git.js";
import { EXAMPLES, findByName, REPO_URL } from "../registry.js";

export interface AddOptions {
  dir: string;
  overwrite: boolean;
}

export interface AddDeps {
  fetchExample: typeof fetchExampleSource;
}

export function printAvailableComponents(): void {
  console.log(chalk.yellow("Available components:"));
  for (const example of EXAMPLES) {
    console.log(
      `  ${chalk.cyan(example.name.padEnd(24))} ${chalk.gray(example.description)}`
    );
  }
  console.log(
    chalk.gray("\nUsage: ryo-auth add <component> [--dir src] [--overwrite]")
  );
}

async function readExampleDependencies(
  exampleRoot: string
): Promise<Record<string, string> | null> {
  try {
    const pkg = JSON.parse(
      await readFile(join(exampleRoot, "package.json"), "utf8")
    ) as { dependencies?: Record<string, string> };
    return pkg.dependencies ?? null;
  } catch {
    return null;
  }
}

/**
 * shadcn-style: sparse-checkout an example, then copy only its `src/` auth
 * code into the user's project instead of scaffolding the whole app.
 */
export async function runAdd(
  component: string,
  options: AddOptions,
  deps: AddDeps = { fetchExample: fetchExampleSource }
): Promise<void> {
  const example = findByName(component);
  if (!example) {
    console.error(chalk.red(`Unknown component "${component}".`));
    console.log(
      chalk.yellow(`Available: ${EXAMPLES.map((e) => e.name).join(", ")}`)
    );
    process.exitCode = 1;
    return;
  }

  console.log(chalk.yellow(`Fetching ${component} from ${example.path}...`));

  let fetched;
  try {
    fetched = await deps.fetchExample(REPO_URL, example.path, "src");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error fetching example: ${message}`));
    process.exitCode = 1;
    return;
  }

  try {
    const { written, skipped } = await copyDir(fetched.dir, options.dir, {
      overwrite: options.overwrite,
    });

    for (const file of written) console.log(chalk.green(`  + ${file}`));
    for (const file of skipped)
      console.log(chalk.gray(`  skip (exists) ${file}`));

    console.log(
      chalk.green(
        `\nDone. Added ${written.length} file${written.length === 1 ? "" : "s"}` +
          (skipped.length ? `, skipped ${skipped.length} existing.` : ".")
      )
    );

    const dependencies = await readExampleDependencies(fetched.exampleRoot);
    if (dependencies) {
      console.log(chalk.yellow("\nInstall the example's dependencies:"));
      console.log(
        `  npm install ${Object.keys(dependencies).sort().join(" ")}`
      );
    } else {
      console.log(
        chalk.yellow(
          `\nInstall the example's dependencies (see ${example.path}/package.json for the full list).`
        )
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error adding component: ${message}`));
    process.exitCode = 1;
  } finally {
    await fetched.cleanup().catch(() => {});
  }
}
