import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { select } from "@inquirer/prompts";
import chalk from "chalk";
import { copyDir } from "../copy.js";
import { fetchExampleSource } from "../git.js";
import {
  choices,
  findClientExample,
  findServerExample,
  REPO_URL,
  type AuthMethod,
  type ExampleEntry,
} from "../registry.js";

export interface InitOptions {
  serverDir: string;
  clientDir: string;
  force: boolean;
}

export interface InitDeps {
  fetchExample: typeof fetchExampleSource;
  prompt: typeof select;
}

async function isNonEmptyDirectory(path: string): Promise<boolean> {
  if (!existsSync(path)) return false;
  const entries = await readdir(path);
  return entries.length > 0;
}

async function scaffold(
  example: ExampleEntry,
  targetDir: string,
  options: InitOptions,
  deps: InitDeps
): Promise<void> {
  if (!options.force && (await isNonEmptyDirectory(targetDir))) {
    console.error(
      chalk.red(
        `Directory "${targetDir}" already exists and is not empty. Re-run with --force to overwrite.`
      )
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    chalk.yellow(`Cloning ${example.path} into ${targetDir}/ directory...`)
  );
  const fetched = await deps.fetchExample(REPO_URL, example.path);
  try {
    await copyDir(fetched.dir, targetDir, { overwrite: true });
    console.log(chalk.green(`Created ${targetDir}/ from ${example.name}.`));
  } finally {
    await fetched.cleanup().catch(() => {});
  }
}

export async function runInit(
  options: InitOptions,
  deps: InitDeps = { fetchExample: fetchExampleSource, prompt: select }
): Promise<void> {
  console.log(chalk.green("Starting the ryo-auth initialization process..."));

  const toChoices = (values: string[]) =>
    values.map((value) => ({ name: value, value }));

  const auth = (await deps.prompt({
    message: "Pick the auth approach you'd like:",
    choices: toChoices(choices.authMethods()),
  })) as AuthMethod;

  const serverFramework = await deps.prompt({
    message: "Server side, pick the server side framework you are using:",
    choices: toChoices(choices.serverFrameworks(auth)),
  });

  const database = await deps.prompt({
    message: "Pick the database you would like to use:",
    choices: toChoices(choices.databases(auth, serverFramework)),
  });

  const orm = await deps.prompt({
    message: "Pick the ORM you would like to use:",
    choices: toChoices(choices.orms(auth, serverFramework, database)),
  });

  const clientFramework = await deps.prompt({
    message: "Now client side, pick the client side framework you are using:",
    choices: toChoices(choices.clientFrameworks(auth)),
  });

  const server = findServerExample({ auth, framework: serverFramework, database, orm });
  const client = findClientExample({ auth, framework: clientFramework });

  if (server) {
    await scaffold(server, options.serverDir, options, deps);
  } else {
    console.log(
      chalk.red("No matching server example found for the selected options.")
    );
  }

  if (client) {
    await scaffold(client, options.clientDir, options, deps);
  } else {
    console.log(
      chalk.red("No matching client example found for the selected options.")
    );
  }

  console.log(chalk.green("Setup complete!"));
}
