import type { Context } from "hono";

import { prisma } from "@/config";
import { getSessionUserId } from "@/features/auth/lib/cookies";

export const meHandler = async (c: Context) => {
  const userId = await getSessionUserId(c);

  if (!userId) {
    return c.json({ message: "Not authenticated" }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  return c.json(user, 200);
};
