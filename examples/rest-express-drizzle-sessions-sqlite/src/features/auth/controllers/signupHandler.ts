import { Request, Response } from "express";
import argon2 from "argon2";

import { CustomSessionData } from "@/features/auth/types";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const signupHandler = async (req: Request, res: Response) => {
  const userDetails = req.body;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, userDetails.email)
  });

  if (existingUser?.id) {
    return res.status(409).json({message: "Email already exists, please use a different email or login."})
  }

  const hashedPasword = await argon2.hash(userDetails.password);

  const user = await db.insert(users).values({
    name: userDetails.name,
    email: userDetails.email,
    password: hashedPasword
  }).returning({ id: users.id });

  (req.session as CustomSessionData).userId = String(user[0].id);

  return res.status(200).json(user[0]);
};
