import { Request, Response } from "express";
import { prisma } from "@/config";
import { CustomExpressUser } from "@/features/auth/types";

export const meHandler = async (req: Request, res: Response) => {
    const jwtUser = req.user as CustomExpressUser;

    if (!jwtUser) return res.status(401).json({ message: "Unauthorized!" });

    const user = await prisma.user.findUnique({
        where: {
            id: jwtUser.id,
        },
        select: {
            id: true,
            email: true,
            name: true,
        },
    });

    return res.json(user).status(200);
};
