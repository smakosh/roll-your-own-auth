# Roll Your Own Auth — GitHub SSO (Express + Prisma + SQLite)

GitHub OAuth sign-on with Passport.js. After GitHub verifies the user, the API issues JWT access/refresh tokens stored in httpOnly cookies — same token strategy as the JWT examples, no passwords stored.

## Getting started

1. Create a GitHub OAuth App at https://github.com/settings/developers
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:4000/auth/github/callback`
2. Copy `.env.example` to `.env` and fill in `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
3. `pnpm install && pnpm prisma:migrate && pnpm dev`
