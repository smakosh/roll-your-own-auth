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
        sameSite: "lax",
    });

    return res.json({ access_token }).status(200);
};
