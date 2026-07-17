import { config } from "dotenv";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { authRouter } from "@/features/auth/routes";

config();

const app = new Hono();

app.use(
  "*",
  cors({
    origin: String(process.env.CORS_ORIGIN ?? "http://localhost:3000").split(
      ",",
    ),
    credentials: true,
  }),
);

app.get("/", (c) => c.text("Roll Your Own Auth API"));

app.route("/auth", authRouter);

const port = Number(process.env.PORT ?? 4000);
serve({ fetch: app.fetch, port });
console.log(
  `🚀 Server ready at ${process.env.SCHEME ?? "http"}://${process.env.HOST ?? "localhost"}:${port}`,
);
