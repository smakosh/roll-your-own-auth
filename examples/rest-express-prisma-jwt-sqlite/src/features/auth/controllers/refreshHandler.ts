import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomExpressUser } from "@/features/auth/types";

export const refreshHandler = (req: Request, res: Response) => {
    const jwtUser = req.user as CustomExpressUser;

    if (!jwtUser)
        return res.status(400).json({ message: "Refresh token is expired!" });

    const access_token = jwt.sign({ id: jwtUser.id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRESIN,
    });
    const refresh_token = jwt.sign(
        { id: jwtUser.id },
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
