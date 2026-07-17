# Roll Your Own Auth — Passwordless (Express + Prisma + SQLite)

Magic-link auth: the user enters their email, the API sends a short-lived JWT link via nodemailer, and clicking it exchanges the link token for JWT access/refresh tokens in httpOnly cookies. No passwords stored.

## Getting started

1. Copy `.env.example` to `.env` and fill in `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MAGIC_LINK_SECRET` and your SMTP credentials.
2. `pnpm install && pnpm prisma:migrate && pnpm dev`
3. `POST /auth/magic-link` with `{ "email": "you@example.com" }`, then open the link from the email (or POST the token to `/auth/verify-magic-link`).
