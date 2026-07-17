import { getRegistryIndex } from "../registry/index.js";
import { logger, highlight } from "../utils/logger.js";

export async function list(): Promise<void> {
  let index;
  try {
    index = await getRegistryIndex();
  } catch (error) {
    logger.error((error as Error).message);
    process.exitCode = 1;
    return;
  }

  logger.break();
  logger.plain(`Available components in ${highlight(index.name)}:`);
  logger.break();
  for (const c of index.components) {
    logger.plain(`  ${highlight(c.name)}  ${c.title ? `— ${c.title}` : ""}`);
    if (c.description) logger.dim(`      ${c.description}`);
  }
  logger.break();
  logger.dim(`Add one with: ryo-auth add <component>`);
}
