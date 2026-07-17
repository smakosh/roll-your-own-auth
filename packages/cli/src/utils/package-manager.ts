import { existsSync } from "node:fs";
import path from "node:path";
import type { Config } from "../types.js";

/** Detect the package manager from lockfiles in the given cwd. */
export function detectPackageManager(cwd: string): Config["packageManager"] {
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(cwd, "bun.lockb"))) return "bun";
  return "npm";
}

/** Build the install command for a package manager. */
export function installCommand(
  pm: Config["packageManager"],
  deps: string[],
  dev = false
): string {
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
