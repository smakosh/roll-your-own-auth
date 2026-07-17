import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  choices,
  EXAMPLES,
  findByName,
  findClientExample,
  findServerExample,
} from "../src/registry.js";

const MONOREPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

describe("EXAMPLES registry", () => {
  it("has unique component names", () => {
    const names = EXAMPLES.map((example) => example.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(EXAMPLES.map((example) => [example.name, example.path]))(
    "%s points at an existing example directory (%s)",
    (_name, path) => {
      expect(existsSync(join(MONOREPO_ROOT, path))).toBe(true);
    },
  );

  it.each(EXAMPLES.map((example) => [example.name, example.path]))(
    "%s example has a src directory for `add` to copy from",
    (_name, path) => {
      expect(existsSync(join(MONOREPO_ROOT, path, "src"))).toBe(true);
    },
  );

  it("finds components by name", () => {
    expect(findByName("session-express-prisma")?.path).toBe(
      "examples/rest-express-prisma-sessions-sqlite",
    );
    expect(findByName("nope")).toBeUndefined();
  });
});

describe("findServerExample", () => {
  it("resolves the classic express/prisma sessions combo", () => {
    expect(
      findServerExample({
        auth: "Sessions",
        framework: "Express.js",
        database: "SQLite",
        orm: "Prisma",
      })?.name,
    ).toBe("session-express-prisma");
  });

  it("resolves the drizzle sessions combo", () => {
    expect(
      findServerExample({
        auth: "Sessions",
        framework: "Express.js",
        database: "SQLite",
        orm: "Drizzle",
      })?.name,
    ).toBe("session-express-drizzle");
  });

  it("resolves the express JWT combo", () => {
    expect(
      findServerExample({
        auth: "JWT",
        framework: "Express.js",
        database: "SQLite",
        orm: "Prisma",
      })?.name,
    ).toBe("jwt-express-prisma");
  });

  it("resolves the previously-missing NestJS/Postgres JWT combo", () => {
    expect(
      findServerExample({
        auth: "JWT",
        framework: "NestJS",
        database: "Postgres",
        orm: "Prisma",
      })?.name,
    ).toBe("jwt-nest-prisma");
  });

  it("resolves the Hono sessions combo", () => {
    expect(
      findServerExample({
        auth: "Sessions",
        framework: "Hono",
        database: "SQLite",
        orm: "Prisma",
      })?.name,
    ).toBe("session-hono-prisma");
  });

  it("resolves the Hono JWT combo", () => {
    expect(
      findServerExample({
        auth: "JWT",
        framework: "Hono",
        database: "SQLite",
        orm: "Prisma",
      })?.name,
    ).toBe("jwt-hono-prisma");
  });

  it("resolves the GitHub SSO combo", () => {
    expect(
      findServerExample({
        auth: "SSO",
        framework: "Express.js",
        database: "SQLite",
        orm: "Prisma",
      })?.name,
    ).toBe("sso-github-express-prisma");
  });

  it("resolves the passwordless combo", () => {
    expect(
      findServerExample({
        auth: "Passwordless",
        framework: "Express.js",
        database: "SQLite",
        orm: "Prisma",
      })?.name,
    ).toBe("passwordless-express-prisma");
  });

  it("returns undefined for combos that have no example", () => {
    expect(
      findServerExample({
        auth: "Sessions",
        framework: "NestJS",
        database: "Postgres",
        orm: "Prisma",
      }),
    ).toBeUndefined();
  });
});

describe("findClientExample", () => {
  it("resolves the client combos", () => {
    expect(
      findClientExample({ auth: "Sessions", framework: "Next.js" })?.name,
    ).toBe("session-next");
    expect(findClientExample({ auth: "JWT", framework: "Next.js" })?.name).toBe(
      "jwt-next",
    );
    expect(
      findClientExample({ auth: "Sessions", framework: "TanStack Start" })
        ?.name,
    ).toBe("session-tanstack");
  });

  it("returns undefined when no client example exists", () => {
    expect(
      findClientExample({ auth: "JWT", framework: "TanStack Start" }),
    ).toBeUndefined();
  });
});

describe("choices", () => {
  it("derives auth methods from the registry", () => {
    expect(choices.authMethods()).toEqual([
      "Sessions",
      "JWT",
      "SSO",
      "Passwordless",
    ]);
  });

  it("offers Hono for both Sessions and JWT", () => {
    expect(choices.serverFrameworks("Sessions")).toContain("Hono");
    expect(choices.serverFrameworks("JWT")).toContain("Hono");
  });

  it("offers NestJS only for JWT", () => {
    expect(choices.serverFrameworks("JWT")).toContain("NestJS");
    expect(choices.serverFrameworks("Sessions")).not.toContain("NestJS");
  });

  it("offers TanStack Start only for Sessions", () => {
    expect(choices.clientFrameworks("Sessions")).toContain("TanStack Start");
    expect(choices.clientFrameworks("JWT")).not.toContain("TanStack Start");
  });

  it("never leads the init prompts into a dead end", () => {
    for (const auth of choices.authMethods()) {
      for (const framework of choices.serverFrameworks(auth)) {
        for (const database of choices.databases(auth, framework)) {
          for (const orm of choices.orms(auth, framework, database)) {
            expect(
              findServerExample({ auth, framework, database, orm }),
            ).toBeDefined();
          }
        }
      }
      for (const framework of choices.clientFrameworks(auth)) {
        expect(findClientExample({ auth, framework })).toBeDefined();
      }
    }
  });
});
