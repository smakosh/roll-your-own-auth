import type { Context } from "hono";

import { clearTokenCookies } from "@/features/auth/lib/tokens";

export const logoutHandler = async (c: Context) => {
  clearTokenCookies(c);
  return c.body(null, 200);
};
