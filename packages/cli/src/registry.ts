export type AuthMethod = "Sessions" | "JWT";
export type Side = "server" | "client";

export interface ExampleEntry {
  /** shadcn-style component name used by `ryo-auth add` */
  name: string;
  /** Path of the example inside the roll-your-own-auth monorepo */
  path: string;
  side: Side;
  auth: AuthMethod;
  framework: string;
  database?: string;
  orm?: string;
  description: string;
}

export const REPO_URL = "https://github.com/smakosh/roll-your-own-auth.git";

export const EXAMPLES: ExampleEntry[] = [
  {
    name: "session-express-prisma",
    path: "examples/rest-express-prisma-sessions-sqlite",
    side: "server",
    auth: "Sessions",
    framework: "Express.js",
    database: "SQLite",
    orm: "Prisma",
    description: "Express REST API with session auth (Prisma + SQLite + Redis store)",
  },
  {
    name: "session-express-drizzle",
    path: "examples/rest-express-drizzle-sessions-sqlite",
    side: "server",
    auth: "Sessions",
    framework: "Express.js",
    database: "SQLite",
    orm: "Drizzle",
    description: "Express REST API with session auth (Drizzle + SQLite + Redis store)",
  },
  {
    name: "jwt-express-prisma",
    path: "examples/rest-express-prisma-jwt-sqlite",
    side: "server",
    auth: "JWT",
    framework: "Express.js",
    database: "SQLite",
    orm: "Prisma",
    description: "Express REST API with JWT auth (Prisma + SQLite)",
  },
  {
    name: "jwt-nest-prisma",
    path: "examples/rest-nest-prisma-jwt-postgres",
    side: "server",
    auth: "JWT",
    framework: "NestJS",
    database: "Postgres",
    orm: "Prisma",
    description: "NestJS REST API with JWT auth (Prisma + Postgres)",
  },
  {
    name: "session-next",
    path: "examples/rest-next-sessions",
    side: "client",
    auth: "Sessions",
    framework: "Next.js",
    description: "Next.js client consuming a session-based REST API",
  },
  {
    name: "jwt-next",
    path: "examples/rest-next-jwt",
    side: "client",
    auth: "JWT",
    framework: "Next.js",
    description: "Next.js client consuming a JWT-based REST API",
  },
  {
    name: "session-tanstack",
    path: "examples/rest-tanstack-sessions",
    side: "client",
    auth: "Sessions",
    framework: "TanStack Start",
    description: "TanStack Start client consuming a session-based REST API",
  },
];

export function findByName(name: string): ExampleEntry | undefined {
  return EXAMPLES.find((example) => example.name === name);
}

export interface ServerSelection {
  auth: AuthMethod;
  framework: string;
  database: string;
  orm: string;
}

export interface ClientSelection {
  auth: AuthMethod;
  framework: string;
}

export function findServerExample(
  selection: ServerSelection
): ExampleEntry | undefined {
  return EXAMPLES.find(
    (example) =>
      example.side === "server" &&
      example.auth === selection.auth &&
      example.framework === selection.framework &&
      example.database === selection.database &&
      example.orm === selection.orm
  );
}

export function findClientExample(
  selection: ClientSelection
): ExampleEntry | undefined {
  return EXAMPLES.find(
    (example) =>
      example.side === "client" &&
      example.auth === selection.auth &&
      example.framework === selection.framework
  );
}

function unique(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

/** Choices are derived from the registry so prompts can never lead to a dead end. */
export const choices = {
  authMethods(): AuthMethod[] {
    return unique(EXAMPLES.map((example) => example.auth)) as AuthMethod[];
  },
  serverFrameworks(auth: AuthMethod): string[] {
    return unique(
      EXAMPLES.filter((e) => e.side === "server" && e.auth === auth).map(
        (e) => e.framework
      )
    );
  },
  databases(auth: AuthMethod, framework: string): string[] {
    return unique(
      EXAMPLES.filter(
        (e) => e.side === "server" && e.auth === auth && e.framework === framework
      ).map((e) => e.database)
    );
  },
  orms(auth: AuthMethod, framework: string, database: string): string[] {
    return unique(
      EXAMPLES.filter(
        (e) =>
          e.side === "server" &&
          e.auth === auth &&
          e.framework === framework &&
          e.database === database
      ).map((e) => e.orm)
    );
  },
  clientFrameworks(auth: AuthMethod): string[] {
    return unique(
      EXAMPLES.filter((e) => e.side === "client" && e.auth === auth).map(
        (e) => e.framework
      )
    );
  },
};
