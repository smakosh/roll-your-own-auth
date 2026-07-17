import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { RegistryComponent, RegistryIndex } from "../types.js";

/**
 * Base URL for the hosted registry. Override with RYO_AUTH_REGISTRY_URL to
 * point at a local server or a fork. When unset, the bundled local registry
 * shipped with the CLI is used.
 */
const REGISTRY_URL = process.env.RYO_AUTH_REGISTRY_URL?.replace(/\/$/, "");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** dist/index.js → ../registry (bundled with the published package). */
const LOCAL_REGISTRY_DIR = path.resolve(__dirname, "..", "registry");

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (${res.status} ${res.statusText})`);
  }
  return (await res.json()) as T;
}

async function readLocalJson<T>(file: string): Promise<T> {
  const full = path.join(LOCAL_REGISTRY_DIR, file);
  if (!existsSync(full)) {
    throw new Error(`Registry file not found: ${file}`);
  }
  return JSON.parse(await readFile(full, "utf8")) as T;
}

async function loadJson<T>(file: string): Promise<T> {
  if (REGISTRY_URL) {
    return fetchJson<T>(`${REGISTRY_URL}/${file}`);
  }
  return readLocalJson<T>(file);
}

/** Load the registry index listing all available components. */
export async function getRegistryIndex(): Promise<RegistryIndex> {
  return loadJson<RegistryIndex>("index.json");
}

/** Resolve a single component (with its files) by name. */
export async function getRegistryComponent(
  name: string
): Promise<RegistryComponent> {
  const safe = name.replace(/[^a-z0-9-_]/gi, "");
  if (safe !== name) {
    throw new Error(`Invalid component name: ${name}`);
  }
  try {
    return await loadJson<RegistryComponent>(`${safe}.json`);
  } catch {
    throw new Error(`Component "${name}" was not found in the registry.`);
  }
}
