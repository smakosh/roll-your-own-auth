import { Request, Response } from "express";

export const logoutHandler = async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (process.env.SESSION_COOKIE_NAME) {
      res.clearCookie(process.env.SESSION_COOKIE_NAME);
    }
    if (err) {
      res
        .json({
          message: err.message,
        })
        .status(400);
    }

    res
      .json({
        message: "User logged out succcessfully",
      })
      .status(200);
  });
};
