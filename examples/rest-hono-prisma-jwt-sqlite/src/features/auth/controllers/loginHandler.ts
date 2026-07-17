import type { Context } from "hono";
import argon2 from "argon2";

import { prisma } from "@/config";
import { setTokenCookies } from "@/features/auth/lib/tokens";

export const loginHandler = async (c: Context) => {
  const credentials = c.get("validated");

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { id: true, name: true, email: true, password: true },
  });

  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  const valid = await argon2.verify(user.password, credentials.password);
  if (!valid) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  const { access_token } = setTokenCookies(c, user.id);

  return c.json({ access_token }, 200);
};
