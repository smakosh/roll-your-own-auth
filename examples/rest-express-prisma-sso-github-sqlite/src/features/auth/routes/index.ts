import express from "express";
import passport from "passport";

import { logoutHandler } from "@/features/auth/controllers/logoutHandler";
import { meHandler } from "@/features/auth/controllers/meHandler";
import { githubCallbackHandler } from "@/features/auth/controllers/githubCallbackHandler";
import { refreshHandler } from "@/features/auth/controllers/refreshHandler";

const authRouter = express.Router();

authRouter.get("/github", passport.authenticate("github", { session: false }));
authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/auth/github/failure",
  }),
  githubCallbackHandler,
);
authRouter.get("/github/failure", (_req, res) =>
  res.status(401).json({ message: "GitHub authentication failed" }),
);
authRouter.post("/refresh", refreshHandler);
authRouter.get("/logout", logoutHandler);
authRouter.get("/me", meHandler);

export { authRouter };
