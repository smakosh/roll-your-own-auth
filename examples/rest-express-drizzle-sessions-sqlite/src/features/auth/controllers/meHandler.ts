import { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { CustomSessionData } from "@/features/auth/types";
import { db } from "@/db";
import { users } from "@/db/schema";

export const meHandler = async (req: Request, res: Response) => {
  const session: CustomSessionData = req.session;
  const sessionId: string | undefined = session.userId;
  const userId = (req?.user as any)?.id;

  if (!sessionId && !userId) {
    return res.status(400).json({ message: "User already logged out." });
  }

  const remainingTime = session.cookie.maxAge || 0;

  if (remainingTime <= 0) {
    return res.json({ message: "Session has expired." }).status(401);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, sessionId || userId),
    columns: {
      password: false,
    },
  });

  return res.status(200).json(user);
};
