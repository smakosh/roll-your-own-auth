import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";

import { setTokenCookies } from "@/features/auth/lib/tokens";

export const refreshHandler = async (c: Context) => {
  const REFRESH_COOKIE =
    process.env.REFRESH_TOKEN_COOKIE_NAME ?? "RollYourOwnAuth_REFRESH";
  const refreshToken = getCookie(c)[REFRESH_COOKIE];

  if (!refreshToken) {
    return c.json({ message: "Refresh token is expired!" }, 400);
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as {
      id: string;
    };

    const { access_token } = setTokenCookies(c, decoded.id);

    return c.json({ access_token }, 200);
  } catch {
    return c.json({ message: "Invalid refresh token" }, 401);
  }
};
