import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { prisma } from "@/config";

export const meHandler = async (req: Request, res: Response) => {
  const { RollYourOwnAuth } = req.cookies;

  if (!RollYourOwnAuth) return res.status(401).json({ message: "Unauthorized!" });

  const decoded: any = jwt.verify(RollYourOwnAuth, process.env.JWT_SECRET!)

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return res.json(user).status(200);
};
