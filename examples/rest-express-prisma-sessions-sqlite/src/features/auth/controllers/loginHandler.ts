import { Request, Response } from "express";
import argon2 from "argon2";

import { prisma } from "@/config";
import { CustomSessionData } from "@/features/auth/types";

export const loginHandler = async (req: Request, res: Response) => {
  const credentials = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email: credentials.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const passwordMatch = await argon2.verify(user.password, credentials.password).catch(() => false);

  if (!passwordMatch) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  (req.session as CustomSessionData).userId = String(user.id);

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return res.status(200).json(userData);
};
