import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

import { prisma } from "@/config";

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
        return res
            .json({
                message: "User not found",
            })
            .status(404);
    }

    await argon2.verify(user.password, credentials.password).catch();

    const access_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRESIN,
    });
    const refresh_token = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRESIN }
    );

    res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME!, refresh_token, {
        expires: new Date(
            Date.now() + Number(process.env.REFRESH_TOKEN_COOKIE_EXPIRES)
        ),
        secure: true,
        httpOnly: true,
    });

    return res.json({ access_token }).status(200);
};
