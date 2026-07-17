import type { Context } from "hono";
import argon2 from "argon2";

import { prisma } from "@/config";
import { setSessionCookie } from "@/features/auth/lib/cookies";

export const signupHandler = async (c: Context) => {
  const userDetails = c.get("validated");

  const hashedPassword = await argon2.hash(userDetails.password);

  const user = await prisma.user.create({
    data: {
      name: userDetails.name,
      email: userDetails.email,
      password: hashedPassword,
    },
    select: { id: true, email: true, name: true },
  });

  await setSessionCookie(c, user.id);

  return c.json(user, 200);
};
