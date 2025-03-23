import { Request, Response } from "express";

export const logoutHandler = async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (process.env.SESSION_COOKIE_NAME) {
      res.clearCookie(process.env.SESSION_COOKIE_NAME);
    }
    if (err) {
      res.status(400).json({
        message: err.message,
      });
    }

    res.status(200).json({
      message: "User logged out succcessfully",
    });
  });
};
