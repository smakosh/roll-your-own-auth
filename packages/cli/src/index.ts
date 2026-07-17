import { Command } from "commander";
import { add } from "./commands/add.js";
import { list } from "./commands/list.js";
import { logger } from "./utils/logger.js";

const program = new Command();

program
  .name("ryo-auth")
  .description("Add copy-paste auth code to your project, shadcn style.")
  .version("0.1.0");

program
  .command("add")
  .description("Add auth code to your project")
  .argument("[components...]", "the component(s) to add, e.g. session-express-prisma")
  .option("-c, --cwd <cwd>", "the working directory", process.cwd())
  .option("-p, --path <path>", "the directory to write files into, relative to cwd")
  .option("-o, --overwrite", "overwrite existing files", false)
  .option("-y, --yes", "skip prompts; skip existing files instead of overwriting", false)
  .action(async (components: string[], opts) => {
    await add(components, {
      cwd: opts.cwd,
      path: opts.path,
      overwrite: Boolean(opts.overwrite),
      yes: Boolean(opts.yes),
    });
  });

program
  .command("list")
  .alias("ls")
  .description("List the available components in the registry")
  .action(async () => {
    await list();
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
