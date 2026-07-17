import type { Context } from "hono";

import { clearSessionCookie } from "@/features/auth/lib/cookies";

export const logoutHandler = async (c: Context) => {
  await clearSessionCookie(c);
  return c.json({ message: "User logged out successfully" }, 200);
};
