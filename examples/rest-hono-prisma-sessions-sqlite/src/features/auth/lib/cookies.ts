import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

import { sessions } from "@/features/auth/sessions";

export const SESSION_COOKIE =
  process.env.SESSION_COOKIE_NAME ?? "RollYourOwnAuth";

export async function getSessionUserId(c: Context): Promise<string | null> {
  const sid = getCookie(c)[SESSION_COOKIE];
  return sid ? sessions.get(sid) : null;
}

export async function setSessionCookie(
  c: Context,
  userId: string,
): Promise<void> {
  const sid = await sessions.create(userId);
  setCookie(c, SESSION_COOKIE, sid, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie(c: Context): Promise<void> {
  const sid = getCookie(c)[SESSION_COOKIE];
  if (sid) await sessions.destroy(sid);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}
