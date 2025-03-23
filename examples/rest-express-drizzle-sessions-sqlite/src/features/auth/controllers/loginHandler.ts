import { Request, Response } from "express";
import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { CustomSessionData } from "@/features/auth/types";
import { db } from "@/db";
import { users } from "@/db/schema";

export const loginHandler = async (req: Request, res: Response) => {
  const credentials = req.body;

  const user = await db.query.users.findFirst({
    where: eq(users.email, credentials.email),
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
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
