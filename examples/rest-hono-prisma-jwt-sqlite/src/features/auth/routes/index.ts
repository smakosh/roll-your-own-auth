import { Hono } from "hono";

import { validate } from "@/features/auth/middlewares/validate";
import { signupSchema } from "@/features/auth/validation/signup";
import { loginSchema } from "@/features/auth/validation/login";

import { logoutHandler } from "@/features/auth/controllers/logoutHandler";
import { meHandler } from "@/features/auth/controllers/meHandler";
import { signupHandler } from "@/features/auth/controllers/signupHandler";
import { loginHandler } from "@/features/auth/controllers/loginHandler";
import { refreshHandler } from "@/features/auth/controllers/refreshHandler";

const authRouter = new Hono();

authRouter.post("/signup", validate(signupSchema), signupHandler);
authRouter.post("/login", validate(loginSchema), loginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.get("/logout", logoutHandler);
authRouter.get("/me", meHandler);

export { authRouter };
