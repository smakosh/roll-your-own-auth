import { config } from "dotenv";
import express, { Request, Response } from "express";
import session from "express-session";
import cors from "cors";
import { createClient } from "redis";
import passport from "passport";
import helmet from "helmet";
import winston from "winston";
import RedisStore from "connect-redis";

import { authRouter } from "@/features/auth/routes";

config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

async function main(): Promise<void> {
  const app = express();
  app.set("trust proxy", 1);

  const redisClient = createClient();
  redisClient.connect().catch(console.error);
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "auth:",
    disableTouch: true,
  });

  redisClient.on("error", (error: Error) => {
    logger.error(error.message);
  });
  redisClient.on("connect", function () {
    console.log(
      `Redis connected at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    );
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        const origins = String(process.env.CORS_ORIGIN).split(",");
        if (!origin || origins.includes(String(origin))) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed."), false);
        }
      },
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "production" ? undefined : false,
    })
  );
  app.use(
    express.json({
      limit: "20mb",
    })
  );
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(
    session({
      name: process.env.SESSION_COOKIE_NAME,
      secret: String(process.env.SESSION_SECRET),
      store: redisStore,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: Number(process.env.SESSION_MAX_AGE),
        sameSite: "lax",
        path: "/"
      },
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/", (_req: Request, res: Response) =>
    res.send("Roll Your Own Auth API")
  );

  app.use("/auth", authRouter);

  app.listen(process.env.PORT, () => {
    console.log(
      `🚀 Server ready at ${process.env.SCHEME}://${process.env.HOST}:${process.env.PORT}`
    );
  });
}

main().catch((error) => {
  logger.error(error.message);
});
