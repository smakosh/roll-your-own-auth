import { Request, Response } from "express";

import { prisma } from "@/config";
import {
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
} from "@/features/auth/utils/tokens";

export const verifyMagicLinkHandler = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const decoded = verifyToken(token, process.env.MAGIC_LINK_SECRET!) as {
      id: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const access_token = generateAccessToken(user.id);
    const refresh_token = generateRefreshToken(user.id);

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

    return res.json({ access_token }).status(200);
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
