#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";

// src/commands/add.ts
import { mkdir, readFile as readFile2, writeFile } from "fs/promises";
import { existsSync as existsSync3 } from "fs";
import path3 from "path";
import prompts from "prompts";

// src/registry/index.ts
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
var REGISTRY_URL = process.env.RYO_AUTH_REGISTRY_URL?.replace(/\/$/, "");
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var LOCAL_REGISTRY_DIR = path.resolve(__dirname, "..", "registry");
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (${res.status} ${res.statusText})`);
  }
  return await res.json();
}
async function readLocalJson(file) {
  const full = path.join(LOCAL_REGISTRY_DIR, file);
  if (!existsSync(full)) {
    throw new Error(`Registry file not found: ${file}`);
  }
  return JSON.parse(await readFile(full, "utf8"));
}
async function loadJson(file) {
  if (REGISTRY_URL) {
    return fetchJson(`${REGISTRY_URL}/${file}`);
  }
  return readLocalJson(file);
}
async function getRegistryIndex() {
  return loadJson("index.json");
}
async function getRegistryComponent(name) {
  const safe = name.replace(/[^a-z0-9-_]/gi, "");
  if (safe !== name) {
    throw new Error(`Invalid component name: ${name}`);
  }
  try {
    return await loadJson(`${safe}.json`);
  } catch {
    throw new Error(`Component "${name}" was not found in the registry.`);
  }
}

// src/utils/logger.ts
import { blue, bold, cyan, dim, green, red, yellow } from "kleur/colors";
var logger = {
  info: (msg) => console.log(`${cyan("info")} ${msg}`),
  success: (msg) => console.log(`${green("\u2714")} ${msg}`),
  warn: (msg) => console.log(`${yellow("warn")} ${msg}`),
  error: (msg) => console.error(`${red("\u2716")} ${msg}`),
  step: (msg) => console.log(`${blue("\u203A")} ${msg}`),
  plain: (msg) => console.log(msg),
  dim: (msg) => console.log(dim(msg)),
  break: () => console.log("")
};
var highlight = (msg) => bold(cyan(msg));

// src/utils/package-manager.ts
import { existsSync as existsSync2 } from "fs";
import path2 from "path";
function detectPackageManager(cwd) {
  if (existsSync2(path2.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync2(path2.join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync2(path2.join(cwd, "bun.lockb"))) return "bun";
  return "npm";
}
function installCommand(pm, deps, dev = false) {
  const pkgs = deps.join(" ");
  switch (pm) {
    case "pnpm":
      return `pnpm add ${dev ? "-D " : ""}${pkgs}`;
    case "yarn":
      return `yarn add ${dev ? "-D " : ""}${pkgs}`;
    case "bun":
      return `bun add ${dev ? "-d " : ""}${pkgs}`;
    default:
      return `npm install ${dev ? "-D " : ""}${pkgs}`;
  }
}

// src/commands/add.ts
async function add(components, options) {
  const cwd = path3.resolve(options.cwd);
  if (!components.length) {
    logger.error("No component specified. Try: ryo-auth add session-express-prisma");
    process.exitCode = 1;
    return;
  }
  const destRoot = options.path ? path3.resolve(cwd, options.path) : cwd;
  for (const name of components) {
    logger.step(`Adding ${highlight(name)}`);
    let component;
    try {
      component = await getRegistryComponent(name);
    } catch (error) {
      logger.error(error.message);
      process.exitCode = 1;
      continue;
    }
    const written = [];
    const skipped = [];
    for (const file of component.files) {
      const result = await writeRegistryFile(file, destRoot, options);
      if (result === "written") written.push(file.target);
      else skipped.push(file.target);
    }
    if (written.length) {
      logger.success(
        `Added ${written.length} file${written.length === 1 ? "" : "s"}:`
      );
      for (const f of written) logger.dim(`  + ${path3.relative(cwd, path3.join(destRoot, f))}`);
    }
    if (skipped.length) {
      logger.warn(`Skipped ${skipped.length} existing file${skipped.length === 1 ? "" : "s"}:`);
      for (const f of skipped) logger.dim(`  - ${path3.relative(cwd, path3.join(destRoot, f))}`);
    }
    reportDependencies(component, cwd);
  }
}
async function writeRegistryFile(file, destRoot, options) {
  const targetPath = path3.resolve(destRoot, file.target);
  const exists = existsSync3(targetPath);
  if (exists && !options.overwrite) {
    if (options.yes) return "skipped";
    const current = await readFile2(targetPath, "utf8");
    if (current === file.content) return "skipped";
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `${path3.relative(destRoot, targetPath)} already exists. Overwrite?`,
      initial: false
    });
    if (!overwrite) return "skipped";
  }
  await mkdir(path3.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, file.content, "utf8");
  return "written";
}
function reportDependencies(component, cwd) {
  const pm = detectPackageManager(cwd);
  const deps = component.dependencies ?? [];
  const devDeps = component.devDependencies ?? [];
  if (!deps.length && !devDeps.length) return;
  logger.break();
  logger.info("Install the required dependencies:");
  if (deps.length) logger.dim(`  ${installCommand(pm, deps)}`);
  if (devDeps.length) logger.dim(`  ${installCommand(pm, devDeps, true)}`);
}

// src/commands/list.ts
async function list() {
  let index;
  try {
    index = await getRegistryIndex();
  } catch (error) {
    logger.error(error.message);
    process.exitCode = 1;
    return;
  }
  logger.break();
  logger.plain(`Available components in ${highlight(index.name)}:`);
  logger.break();
  for (const c of index.components) {
    logger.plain(`  ${highlight(c.name)}  ${c.title ? `\u2014 ${c.title}` : ""}`);
    if (c.description) logger.dim(`      ${c.description}`);
  }
  logger.break();
  logger.dim(`Add one with: ryo-auth add <component>`);
}

// src/index.ts
var program = new Command();
program.name("ryo-auth").description("Add copy-paste auth code to your project, shadcn style.").version("0.1.0");
program.command("add").description("Add auth code to your project").argument("[components...]", "the component(s) to add, e.g. session-express-prisma").option("-c, --cwd <cwd>", "the working directory", process.cwd()).option("-p, --path <path>", "the directory to write files into, relative to cwd").option("-o, --overwrite", "overwrite existing files", false).option("-y, --yes", "skip prompts; skip existing files instead of overwriting", false).action(async (components, opts) => {
  await add(components, {
    cwd: opts.cwd,
    path: opts.path,
    overwrite: Boolean(opts.overwrite),
    yes: Boolean(opts.yes)
  });
});
program.command("list").alias("ls").description("List the available components in the registry").action(async () => {
  await list();
});
program.parseAsync(process.argv).catch((error) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
