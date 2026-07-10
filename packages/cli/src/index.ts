#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";
import { printAvailableComponents, runAdd } from "./commands/add.js";
import { runInit } from "./commands/init.js";

const pkg = createRequire(import.meta.url)("../package.json") as {
  version: string;
  description: string;
};

const program = new Command();

program
  .name("ryo-auth")
  .description(pkg.description)
  .version(pkg.version);

program
  .command("init")
  .description("Scaffold a server and client auth setup from the examples")
  .option("--server-dir <dir>", "directory to scaffold the server into", "server")
  .option("--client-dir <dir>", "directory to scaffold the client into", "client")
  .option("-f, --force", "overwrite existing non-empty directories", false)
  .action(async (options: { serverDir: string; clientDir: string; force: boolean }) => {
    await runInit(options);
  });

program
  .command("add")
  .description("Add auth code from an example into your project (shadcn style)")
  .argument("[component]", "component to add, e.g. session-express-prisma")
  .option("-d, --dir <dir>", "target directory to copy files into", "src")
  .option("-o, --overwrite", "overwrite existing files", false)
  .action(
    async (
      component: string | undefined,
      options: { dir: string; overwrite: boolean }
    ) => {
      if (!component) {
        printAvailableComponents();
        return;
      }
      await runAdd(component, options);
    }
  );

program
  .command("list")
  .description("List the available auth examples/components")
  .action(() => {
    printAvailableComponents();
  });

program.parseAsync(process.argv);
