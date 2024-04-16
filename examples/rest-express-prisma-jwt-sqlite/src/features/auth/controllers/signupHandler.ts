import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

import { prisma } from "@/config";

export const signupHandler = async (req: Request, res: Response) => {
  const userDetails = req.body;

  const hashedPasword = await argon2.hash(userDetails.password);

  const user = await prisma.user.create({
    data: {
      name: userDetails.name,
      email: userDetails.email,
      password: hashedPasword,
    },
  });

  const access_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const refresh_token = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME!, refresh_token, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE)
  });

  res.cookie(process.env.ACCESS_TOKEN_COOKIE_NAME!, access_token, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Number(process.env.ACCESS_TOKEN_COOKIE_MAX_AGE)
  });

  return res.json({ access_token }).status(200);
};
