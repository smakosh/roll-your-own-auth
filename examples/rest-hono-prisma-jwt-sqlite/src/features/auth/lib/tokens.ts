import type { Context } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import jwt from "jsonwebtoken";

const ACCESS_COOKIE = process.env.ACCESS_TOKEN_COOKIE_NAME ?? "RollYourOwnAuth";
const REFRESH_COOKIE =
  process.env.REFRESH_TOKEN_COOKIE_NAME ?? "RollYourOwnAuth_REFRESH";

export function generateAccessToken(userId: string): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env
      .JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function setTokenCookies(
  c: Context,
  userId: string,
): { access_token: string } {
  const access_token = generateAccessToken(userId);
  const refresh_token = generateRefreshToken(userId);
  const secure = process.env.NODE_ENV === "production";

  setCookie(c, REFRESH_COOKIE, refresh_token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure,
    maxAge:
      Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE ?? 2592000000) / 1000,
  });
  setCookie(c, ACCESS_COOKIE, access_token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure,
    maxAge: Number(process.env.ACCESS_TOKEN_COOKIE_MAX_AGE ?? 1800000) / 1000,
  });

  return { access_token };
}

export function clearTokenCookies(c: Context): void {
  deleteCookie(c, ACCESS_COOKIE, { path: "/" });
  deleteCookie(c, REFRESH_COOKIE, { path: "/" });
}
