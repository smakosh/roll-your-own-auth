# Starter Expansion Plan — roll-your-own-auth

## Overview

This document tracks the plan for adding new template starters to the
roll-your-own-auth CLI registry. Each starter is a JSON file in
`packages/cli/registry/` following the `RegistryComponent` schema, plus an
entry in `packages/cli/registry/index.json` and a matching docs page.

### Registry Component Schema

```ts
interface RegistryFile {
  path: string;       // relative path within the starter
  target: string;    // destination path in user's project (under src/)
  content: string;   // file content (escaped string with \n)
}

interface RegistryComponent {
  name: string;
  type: string;              // "auth:server" | "auth:client"
  dependencies: string[];
  devDependencies: string[];
  files: RegistryFile[];
}
```

### Index Entry Schema (in index.json)

```ts
interface RegistryIndexEntry {
  name: string;
  type: string;
  title: string;
  description: string;
  dependencies: string[];
  devDependencies: string[];
}
```

---

## Current Starters (9)

### Session — Servers (4)

| # | Name | Framework | Key Deps |
|---|------|-----------|----------|
| 1 | session-express-prisma | Express | express-session, redis, connect-redis, passport, helmet, winston, argon2, zod |
| 2 | session-hono-prisma | Hono | hono, @hono/node-server, redis, connect-redis, argon2, zod |
| 3 | session-fastify-prisma | Fastify | fastify, @fastify/cors, @fastify/cookie, @fastify/session, connect-redis, redis, argon2, zod |
| 4 | session-graphql-prisma | Apollo GraphQL | @apollo/server, graphql, graphql-tag, cookie, redis, connect-redis, argon2, zod |

### Session — Clients (5)

| # | Name | Framework | Key Deps |
|---|------|-----------|----------|
| 5 | session-nextjs-client | Next.js (App Router) | zod |
| 6 | session-remix-client | Remix | @remix-run/node, @remix-run/react, zod |
| 7 | session-tanstack-router-vite-client | TanStack Router + Vite | @tanstack/react-router, react, react-dom, zod |
| 8 | session-tanstack-start-client | TanStack Start | @tanstack/react-start, @tanstack/react-router, react, react-dom, zod |
| 9 | session-react-router-vite-client | React Router + Vite | react-router-dom, react, react-dom, zod |

---

## New Starters (5)

### JWT Auth

#### 1. jwt-express-prisma (server)

- **Type:** `auth:server`
- **Title:** JWT — Express + Prisma
- **Description:** JWT auth for Express using access and refresh tokens, Prisma, argon2 password hashing and zod validation.
- **Dependencies:** `express`, `dotenv`, `cors`, `jsonwebtoken`, `argon2`, `zod`, `@prisma/client`, `cookie-parser`
- **DevDependencies:** `prisma`, `@types/express`, `@types/cors`, `@types/jsonwebtoken`, `@types/cookie-parser`
- **Routes:** `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`

| File | Target | Description |
|------|--------|-------------|
| `server.ts` | `src/server.ts` | Express app: dotenv, cors, json, cookie-parser, auth routes at /auth |
| `features/auth/routes/index.ts` | `src/features/auth/routes/index.ts` | Router: signup, login, refresh, logout, me (me+logout behind auth middleware) |
| `features/auth/middlewares/validate.ts` | `src/features/auth/middlewares/validate.ts` | Zod validation middleware (same as session-express-prisma) |
| `features/auth/middlewares/auth.ts` | `src/features/auth/middlewares/auth.ts` | JWT verification: reads Authorization Bearer header, verifies, attaches userId to req |
| `features/auth/controllers/signupHandler.ts` | `src/features/auth/controllers/signupHandler.ts` | Hash password (argon2), create user, generate access+refresh tokens, set refresh cookie, return user+accessToken |
| `features/auth/controllers/loginHandler.ts` | `src/features/auth/controllers/loginHandler.ts` | Find user by email, verify password, generate tokens, set refresh cookie, return user+accessToken |
| `features/auth/controllers/refreshHandler.ts` | `src/features/auth/controllers/refreshHandler.ts` | Read refresh token from cookie, verify, generate new access+refresh (rotation), set new cookie, return accessToken |
| `features/auth/controllers/logoutHandler.ts` | `src/features/auth/controllers/logoutHandler.ts` | Clear refresh token cookie |
| `features/auth/controllers/meHandler.ts` | `src/features/auth/controllers/meHandler.ts` | Read userId from req (set by auth middleware), find user, return user data |
| `features/auth/validation/login.ts` | `src/features/auth/validation/login.ts` | Zod: email, password min 8 |
| `features/auth/validation/signup.ts` | `src/features/auth/validation/signup.ts` | Zod: name min 1, email, password min 8 |
| `features/auth/utils/tokens.ts` | `src/features/auth/utils/tokens.ts` | `generateAccessToken(userId)` 15min JWT, `generateRefreshToken(userId)` 7d JWT, `verifyToken(token, secret)` |
| `config/index.ts` | `src/config/index.ts` | PrismaClient instance |

**Token strategy:**
- Access token: JWT, 15min expiry, returned in response body
- Refresh token: JWT, 7d expiry, set as httpOnly cookie (`refreshToken` cookie name)
- Token rotation: /refresh issues a new refresh token, invalidating the old one client-side
- Env vars: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT`, `CORS_ORIGIN`

#### 2. jwt-hono-prisma (server)

- **Type:** `auth:server`
- **Title:** JWT — Hono + Prisma
- **Description:** JWT auth for Hono using access and refresh tokens, Prisma, argon2 password hashing and zod validation.
- **Dependencies:** `hono`, `@hono/node-server`, `dotenv`, `jsonwebtoken`, `argon2`, `zod`, `@prisma/client`
- **DevDependencies:** `prisma`, `tsx`
- **Routes:** Same as jwt-express-prisma

| File | Target | Description |
|------|--------|-------------|
| `server.ts` | `src/server.ts` | Hono app: dotenv, cors, auth routes at /auth |
| `features/auth/routes/index.ts` | `src/features/auth/routes/index.ts` | Hono router: signup, login, refresh, logout, me |
| `features/auth/middlewares/validate.ts` | `src/features/auth/middlewares/validate.ts` | Zod validation (same as session-hono-prisma pattern) |
| `features/auth/middlewares/auth.ts` | `src/features/auth/middlewares/auth.ts` | JWT verification: reads Authorization header, verifies, sets userId on context |
| `features/auth/controllers/signupHandler.ts` | `src/features/auth/controllers/signupHandler.ts` | Same logic as express, adapted for Hono Context |
| `features/auth/controllers/loginHandler.ts` | `src/features/auth/controllers/loginHandler.ts` | Same logic, Hono Context |
| `features/auth/controllers/refreshHandler.ts` | `src/features/auth/controllers/refreshHandler.ts` | Same logic, Hono Context |
| `features/auth/controllers/logoutHandler.ts` | `src/features/auth/controllers/logoutHandler.ts` | Clear refresh cookie via Set-Cookie header |
| `features/auth/controllers/meHandler.ts` | `src/features/auth/controllers/meHandler.ts` | Read userId from context, find user |
| `features/auth/validation/login.ts` | `src/features/auth/validation/login.ts` | Zod: email, password min 8 |
| `features/auth/validation/signup.ts` | `src/features/auth/validation/signup.ts` | Zod: name min 1, email, password min 8 |
| `features/auth/utils/tokens.ts` | `src/features/auth/utils/tokens.ts` | Token generation utilities (same as express) |
| `config/index.ts` | `src/config/index.ts` | PrismaClient instance |

#### 3. jwt-nextjs-client (client)

- **Type:** `auth:client`
- **Title:** JWT — Next.js client
- **Description:** Next.js App Router client for JWT auth: typed API wrapper with access token in memory, refresh token in httpOnly cookie, auto-refresh on 401, zod validation and server actions for signup, login, logout and me.
- **Dependencies:** `zod`
- **DevDependencies:** `[]`

| File | Target | Description |
|------|--------|-------------|
| `lib/auth/api.ts` | `src/lib/auth/api.ts` | API wrapper: access token in module-level variable, refresh on 401, credentials:include for refresh cookie |
| `lib/auth/validation.ts` | `src/lib/auth/validation.ts` | Zod: loginSchema, signupSchema |
| `app/actions/auth.ts` | `src/app/actions/auth.ts` | Server actions: loginAction, signupAction, logoutAction, meAction |

**Token management:**
- Access token stored in memory (module-level variable, not persisted)
- Refresh token in httpOnly cookie (set by server, sent automatically with credentials:include)
- On 401 response, automatically call /auth/refresh, retry original request
- `NEXT_PUBLIC_API_URL` env var for API base URL

### SSO / OAuth

#### 4. sso-github-express-prisma (server)

- **Type:** `auth:server`
- **Title:** SSO — GitHub (Express + Prisma)
- **Description:** GitHub OAuth single sign-on for Express using Passport.js, Prisma, JWT session tokens and cookie-parser.
- **Dependencies:** `express`, `dotenv`, `cors`, `passport`, `passport-github2`, `jsonwebtoken`, `@prisma/client`, `cookie-parser`
- **DevDependencies:** `prisma`, `@types/express`, `@types/cors`, `@types/passport`, `@types/passport-github2`
- **Routes:** `GET /auth/github` (redirect to GitHub), `GET /auth/github/callback`, `GET /auth/me`, `POST /auth/logout`

| File | Target | Description |
|------|--------|-------------|
| `server.ts` | `src/server.ts` | Express app: dotenv, cors, json, cookie-parser, passport init, auth routes |
| `features/auth/routes/index.ts` | `src/features/auth/routes/index.ts` | Router: github, github/callback, me, logout |
| `features/auth/config/passport.ts` | `src/features/auth/config/passport.ts` | Passport GitHubStrategy config: clientID, clientSecret, callbackURL from env |
| `features/auth/controllers/githubCallbackHandler.ts` | `src/features/auth/controllers/githubCallbackHandler.ts` | Find/create user by githubId, generate JWT access+refresh, set refresh cookie, redirect to frontend |
| `features/auth/controllers/meHandler.ts` | `src/features/auth/controllers/meHandler.ts` | Read userId from auth middleware, find user |
| `features/auth/controllers/logoutHandler.ts` | `src/features/auth/controllers/logoutHandler.ts` | Clear refresh cookie |
| `features/auth/middlewares/auth.ts` | `src/features/auth/middlewares/auth.ts` | JWT verification middleware |
| `features/auth/utils/tokens.ts` | `src/features/auth/utils/tokens.ts` | Token generation (same as jwt-express-prisma) |
| `config/index.ts` | `src/config/index.ts` | PrismaClient instance |

**OAuth flow:**
1. Client visits `GET /auth/github` -> Passport redirects to GitHub
2. GitHub redirects back to `GET /auth/github/callback`
3. Handler finds/creates user by `githubId`, generates JWT tokens
4. Sets refresh token cookie, redirects to frontend with access token in URL query
5. Frontend stores access token in memory

**Env vars:** `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL`

**Prisma model:** User needs `githubId` field (String?, unique)

### Passwordless

#### 5. passwordless-express-prisma (server)

- **Type:** `auth:server`
- **Title:** Passwordless — Express + Prisma
- **Description:** Passwordless magic-link auth for Express using JWT magic links, nodemailer, Prisma and zod validation.
- **Dependencies:** `express`, `dotenv`, `cors`, `jsonwebtoken`, `nodemailer`, `zod`, `@prisma/client`, `cookie-parser`
- **DevDependencies:** `prisma`, `@types/express`, `@types/cors`, `@types/jsonwebtoken`, `@types/nodemailer`
- **Routes:** `POST /auth/magic-link` (send), `POST /auth/verify-magic-link` (verify), `GET /auth/me`, `POST /auth/logout`

| File | Target | Description |
|------|--------|-------------|
| `server.ts` | `src/server.ts` | Express app: dotenv, cors, json, cookie-parser, auth routes |
| `features/auth/routes/index.ts` | `src/features/auth/routes/index.ts` | Router: magic-link, verify-magic-link, me, logout |
| `features/auth/middlewares/validate.ts` | `src/features/auth/middlewares/validate.ts` | Zod validation middleware |
| `features/auth/middlewares/auth.ts` | `src/features/auth/middlewares/auth.ts` | JWT verification middleware |
| `features/auth/controllers/magicLinkHandler.ts` | `src/features/auth/controllers/magicLinkHandler.ts` | Validate email, find/create user, generate magic link JWT (15min), send email |
| `features/auth/controllers/verifyMagicLinkHandler.ts` | `src/features/auth/controllers/verifyMagicLinkHandler.ts` | Verify magic link JWT, find/create user, generate access+refresh tokens, set refresh cookie, return user+accessToken |
| `features/auth/controllers/meHandler.ts` | `src/features/auth/controllers/meHandler.ts` | Read userId from auth middleware, find user |
| `features/auth/controllers/logoutHandler.ts` | `src/features/auth/controllers/logoutHandler.ts` | Clear refresh cookie |
| `features/auth/validation/magicLink.ts` | `src/features/auth/validation/magicLink.ts` | Zod: email |
| `features/auth/utils/tokens.ts` | `src/features/auth/utils/tokens.ts` | Token generation: access, refresh, magic link |
| `features/auth/utils/email.ts` | `src/features/auth/utils/email.ts` | Nodemailer transport, sendMagicLink function |
| `config/index.ts` | `src/config/index.ts` | PrismaClient instance |

**Magic link flow:**
1. User enters email -> `POST /auth/magic-link`
2. Server finds/creates user by email, generates magic link JWT (15min expiry)
3. Server sends email with link: `${FRONTEND_URL}/verify?token=<jwt>`
4. User clicks link -> frontend calls `POST /auth/verify-magic-link` with token
5. Server verifies magic link JWT, generates access+refresh tokens
6. Sets refresh cookie, returns user + access token

**Env vars:** `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MAGIC_LINK_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FRONTEND_URL`, `CORS_ORIGIN`

---

## Documentation Pages

### Pages to Create

| Path | Content |
|------|---------|
| `pages/jwt/index.mdx` | Overview + cards for server/client starters |
| `pages/jwt/server/express.mdx` | CLI + FileTree + Steps (same pattern as express.mdx) |
| `pages/jwt/server/hono.mdx` | CLI + FileTree + Steps |
| `pages/jwt/client/nextjs.mdx` | CLI + FileTree + description |
| `pages/jwt/server/_meta.json` | `{ "express": "Express.js", "hono": "Hono" }` |
| `pages/jwt/client/_meta.json` | `{ "nextjs": "Next.js" }` |
| `pages/jwt/_meta.json` | `{ "index": "Get started", "server": "Server", "client": "Client" }` |
| `pages/sso/github.mdx` | Replace "Coming soon" with CLI + FileTree + Steps |
| `pages/passwordless/index.mdx` | Overview + cards |
| `pages/passwordless/express.mdx` | CLI + FileTree + Steps |
| `pages/passwordless/_meta.json` | `{ "index": "Get started", "express": "Express.js" }` |
| `pages/sessions/server/hono.mdx` | CLI + FileTree + Steps (starter exists, docs missing) |
| `pages/sessions/server/fastify.mdx` | CLI + FileTree + Steps (starter exists, docs missing) |
| `pages/sessions/client/remix.mdx` | CLI + FileTree + description (starter exists, docs missing) |
| `pages/sessions/client/nextjs.mdx` | Replace empty content with CLI + FileTree + description |

### Pages to Delete/Replace

| Path | Action |
|------|--------|
| `pages/jwt.mdx` | Delete (replaced by `pages/jwt/` directory) |
| `pages/passwordless.mdx` | Delete (replaced by `pages/passwordless/` directory) |

### Meta Files to Update

| Path | Changes |
|------|---------|
| `pages/_meta.json` | No change needed (jwt/passwordless entries already point to dirs) |
| `pages/sessions/server/_meta.json` | Add `"hono": "Hono"`, `"fastify": "Fastify"` |
| `pages/sessions/index.mdx` | Update "coming soon" links for Hono, Fastify, Remix |

---

## Registry Updates

### `packages/cli/registry/index.json`

Add 5 new entries to the `components` array:

```json
{
  "name": "jwt-express-prisma",
  "type": "auth:server",
  "title": "JWT — Express + Prisma",
  "description": "JWT auth for Express using access and refresh tokens, Prisma, argon2 password hashing and zod validation.",
  "dependencies": ["express", "dotenv", "cors", "jsonwebtoken", "argon2", "zod", "@prisma/client", "cookie-parser"],
  "devDependencies": ["prisma", "@types/express", "@types/cors", "@types/jsonwebtoken", "@types/cookie-parser"]
},
{
  "name": "jwt-hono-prisma",
  "type": "auth:server",
  "title": "JWT — Hono + Prisma",
  "description": "JWT auth for Hono using access and refresh tokens, Prisma, argon2 password hashing and zod validation.",
  "dependencies": ["hono", "@hono/node-server", "dotenv", "jsonwebtoken", "argon2", "zod", "@prisma/client"],
  "devDependencies": ["prisma", "tsx"]
},
{
  "name": "jwt-nextjs-client",
  "type": "auth:client",
  "title": "JWT — Next.js client",
  "description": "Next.js App Router client for JWT auth: typed API wrapper with access token in memory, refresh token in httpOnly cookie, auto-refresh on 401, zod validation and server actions for signup, login, logout and me.",
  "dependencies": ["zod"],
  "devDependencies": []
},
{
  "name": "sso-github-express-prisma",
  "type": "auth:server",
  "title": "SSO — GitHub (Express + Prisma)",
  "description": "GitHub OAuth single sign-on for Express using Passport.js, Prisma, JWT session tokens and cookie-parser.",
  "dependencies": ["express", "dotenv", "cors", "passport", "passport-github2", "jsonwebtoken", "@prisma/client", "cookie-parser"],
  "devDependencies": ["prisma", "@types/express", "@types/cors", "@types/passport", "@types/passport-github2"]
},
{
  "name": "passwordless-express-prisma",
  "type": "auth:server",
  "title": "Passwordless — Express + Prisma",
  "description": "Passwordless magic-link auth for Express using JWT magic links, nodemailer, Prisma and zod validation.",
  "dependencies": ["express", "dotenv", "cors", "jsonwebtoken", "nodemailer", "zod", "@prisma/client", "cookie-parser"],
  "devDependencies": ["prisma", "@types/express", "@types/cors", "@types/jsonwebtoken", "@types/nodemailer"]
}
```

### New Component JSON Files

| File | Lines (est.) |
|------|-------------|
| `packages/cli/registry/jwt-express-prisma.json` | ~120 |
| `packages/cli/registry/jwt-hono-prisma.json` | ~100 |
| `packages/cli/registry/jwt-nextjs-client.json` | ~30 |
| `packages/cli/registry/sso-github-express-prisma.json` | ~80 |
| `packages/cli/registry/passwordless-express-prisma.json` | ~110 |

---

## Future Starters (not in this batch)

### JWT
- `jwt-fastify-prisma` — JWT auth with Fastify + Prisma
- `jwt-graphql-prisma` — JWT auth with Apollo GraphQL + Prisma
- `jwt-remix-client` — Remix client for JWT auth
- `jwt-tanstack-start-client` — TanStack Start client for JWT auth
- `jwt-tanstack-router-vite-client` — TanStack Router + Vite client for JWT auth
- `jwt-react-router-vite-client` — React Router + Vite client for JWT auth

### SSO / OAuth
- `sso-github-hono-prisma` — GitHub OAuth with Hono + Prisma
- `sso-github-fastify-prisma` — GitHub OAuth with Fastify + Prisma
- `sso-google-express-prisma` — Google OAuth with Express + Prisma
- `sso-google-hono-prisma` — Google OAuth with Hono + Prisma

### Passwordless
- `passwordless-hono-prisma` — Magic link auth with Hono + Prisma
- `passwordless-fastify-prisma` — Magic link auth with Fastify + Prisma

### 2FA
- `2fa-express-prisma` — TOTP 2FA with Express + Prisma
- `2fa-hono-prisma` — TOTP 2FA with Hono + Prisma
- `2fa-tanstack-start-client` — TanStack Start client for 2FA

---

## Implementation Notes

### Patterns to Follow
1. **Import alias:** All starters use `@/` alias for `src/` (or `~/` for Remix's `app/`)
2. **Validation:** Zod schemas in `features/auth/validation/` (server) or `lib/auth/validation.ts` (client)
3. **Password hashing:** argon2 for all password-based auth
4. **Config:** PrismaClient instance in `config/index.ts`
5. **Env vars:** Use `process.env.X ?? "default"` pattern
6. **JSON escaping:** Content strings use `\n` for newlines, `\"` for quotes

### Token Strategy (JWT starters)
- Access token: JWT, 15min, in response body (client stores in memory)
- Refresh token: JWT, 7d, in httpOnly cookie (name: `refreshToken`)
- Token rotation: /refresh issues new access + refresh tokens
- No DB storage for tokens (stateless JWT)
- Env vars: `JWT_SECRET` (access), `JWT_REFRESH_SECRET` (refresh)

### Prisma Models
- Session starters: `User { id, name, email, password }`
- JWT starters: `User { id, name, email, password }` (same)
- SSO starters: `User { id, name, email, githubId? }` (githubId optional, unique)
- Passwordless starters: `User { id, email, name? }` (no password, name optional)

### Docs Pattern
Each docs page follows this structure:
1. `## CLI` section with `npx ryo-auth@latest add <name>` command
2. `## Manual Installation` section with `<FileTree>` component
3. `<Steps>` section with code blocks (for server starters)
4. Brief description paragraph
