import { Request, Response } from "express";

export const logoutHandler = async (req: Request, res: Response) => {
    res.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME!).status(200).end();
};
