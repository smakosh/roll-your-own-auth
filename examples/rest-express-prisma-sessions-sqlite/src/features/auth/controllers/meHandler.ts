import { Request, Response } from "express";

import { CustomSessionData } from "@/features/auth/types";
import { prisma } from "@/config";

export const meHandler = async (req: Request, res: Response) => {
  const session: CustomSessionData = req.session;
  const sessionId: string | undefined = session.userId;
  const userId = (req?.user as any)?.id;

  if (!sessionId && !userId) {
    return res.json({ message: "User already logged out." }).status(400);
  }

  const remainingTime = session.cookie.maxAge || 0;

  if (remainingTime <= 0) {
    return res.json({ message: "Session has expired." }).status(401);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: sessionId || userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return res.json(user).status(200);
};
