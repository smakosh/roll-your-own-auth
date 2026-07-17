import { Request, Response } from "express";

import { prisma } from "@/config";
import { generateMagicLinkToken } from "@/features/auth/utils/tokens";
import { sendMagicLink } from "@/features/auth/utils/email";

export const magicLinkHandler = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const token = generateMagicLinkToken(user.id);

  await sendMagicLink(email, token);

  return res.json({ message: "Magic link sent" }).status(200);
};
