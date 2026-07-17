export interface RegistryFile {
  /** Path relative to the component root, used for display. */
  path: string;
  /** Default write target relative to the user's project root. */
  target: string;
  /** File contents to write. */
  content: string;
}

export interface RegistryComponent {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  files: RegistryFile[];
}

export interface RegistryIndexEntry {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
}

export interface RegistryIndex {
  name: string;
  homepage?: string;
  components: RegistryIndexEntry[];
}

export interface Config {
  /** Root the CLI writes into, relative to cwd (e.g. "." or "packages/api"). */
  root: string;
  /** Package manager detected in the project. */
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
}
