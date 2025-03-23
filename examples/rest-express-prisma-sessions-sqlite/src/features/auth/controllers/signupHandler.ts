import { Request, Response } from "express";
import argon2 from "argon2";

import { prisma } from "@/config";
import { CustomSessionData } from "@/features/auth/types";

export const signupHandler = async (req: Request, res: Response) => {
  const userDetails = req.body;

  const hashedPasword = await argon2.hash(userDetails.password);

  const user = await prisma.user.create({
    data: {
      name: userDetails.name,
      email: userDetails.email,
      password: hashedPasword,
    },
    select: {
      id: true,
      email: true,
      name: true,
      posts: true,
    },
  });

  (req.session as CustomSessionData).userId = String(user.id);

  return res.status(200).json(user);
};
