import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const githubCallbackHandler = async (req: Request, res: Response) => {
  const user = req.user as { id: string };

  const access_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

  const refresh_token = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: process.env
        .JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );

  res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME!, refresh_token, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE),
  });

  res.cookie(process.env.ACCESS_TOKEN_COOKIE_NAME!, access_token, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Number(process.env.ACCESS_TOKEN_COOKIE_MAX_AGE),
  });

  res.redirect(String(process.env.FRONTEND_URL ?? "http://localhost:3000"));
};
