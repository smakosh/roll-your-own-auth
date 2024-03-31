import express from "express";

import { validate } from "@/features/auth/middlewares/validate";
import { signupSchema } from "@/features/auth/validation/signup";
import { loginSchema } from "@/features/auth/validation/login";

import { logoutHandler } from "@/features/auth/controllers/logoutHandler";
import { meHandler } from "@/features/auth/controllers/meHandler";
import { signupHandler } from "@/features/auth/controllers/signupHandler";
import { loginHandler } from "@/features/auth/controllers/loginHandler";
import passport from "passport";
import { refreshHandler } from "../controllers/refreshHandler";

const authRouter = express.Router();

authRouter.post("/signup", validate(signupSchema), signupHandler);
authRouter.post("/login", validate(loginSchema), loginHandler);
authRouter.post(
    "/refresh",
    passport.authenticate("jwt-refresh", { session: false }),
    refreshHandler
);
authRouter.get(
    "/logout",
    passport.authenticate("jwt", { session: false }),
    logoutHandler
);
authRouter.get(
    "/me",
    passport.authenticate("jwt", { session: false }),
    meHandler
);

export { authRouter };
