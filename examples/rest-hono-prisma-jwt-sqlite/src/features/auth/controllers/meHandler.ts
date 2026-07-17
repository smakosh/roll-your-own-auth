import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";

import { prisma } from "@/config";

export const meHandler = async (c: Context) => {
  const ACCESS_COOKIE =
    process.env.ACCESS_TOKEN_COOKIE_NAME ?? "RollYourOwnAuth";
  const accessToken = getCookie(c)[ACCESS_COOKIE];

  if (!accessToken) {
    return c.json({ message: "Unauthorized!" }, 401);
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      id: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    return c.json(user, 200);
  } catch {
    return c.json({ message: "Unauthorized!" }, 401);
  }
};
