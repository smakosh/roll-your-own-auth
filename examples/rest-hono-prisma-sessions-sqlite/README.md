# Roll Your Own Auth — Hono Sessions (Hono + Prisma + SQLite)

Cookie session auth for Hono. Sessions are stored in Redis (opaque session id → user id, 7-day TTL) and carried by an httpOnly cookie.

## Getting started

1. Start Redis locally (`docker run -p 6379:6379 redis` or `brew services start redis`).
2. Copy `.env.example` to `.env`.
3. `pnpm install && pnpm prisma:migrate && pnpm dev`
