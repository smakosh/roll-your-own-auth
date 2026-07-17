import express from "express";

import { validate } from "@/features/auth/middlewares/validate";
import { magicLinkSchema } from "@/features/auth/validation/magicLink";

import { logoutHandler } from "@/features/auth/controllers/logoutHandler";
import { meHandler } from "@/features/auth/controllers/meHandler";
import { magicLinkHandler } from "@/features/auth/controllers/magicLinkHandler";
import { verifyMagicLinkHandler } from "@/features/auth/controllers/verifyMagicLinkHandler";
import { refreshHandler } from "@/features/auth/controllers/refreshHandler";

const authRouter = express.Router();

authRouter.post("/magic-link", validate(magicLinkSchema), magicLinkHandler);
authRouter.post("/verify-magic-link", verifyMagicLinkHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.get("/logout", logoutHandler);
authRouter.get("/me", meHandler);

export { authRouter };
