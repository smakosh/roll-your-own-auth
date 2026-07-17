# Roll Your Own Auth — Hono JWT (Hono + Prisma + SQLite)

JWT auth for Hono: access/refresh tokens signed with jsonwebtoken, both stored in httpOnly cookies (same cookie strategy as the Express JWT example). Refresh rotates both tokens.

## Getting started

1. Copy `.env.example` to `.env` and set `JWT_SECRET` / `JWT_REFRESH_SECRET`.
2. `pnpm install && pnpm prisma:migrate && pnpm dev`
