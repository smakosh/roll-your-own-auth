import { randomUUID } from "node:crypto";
import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
});
client.on("error", (error: Error) =>
  console.error("Redis error:", error.message),
);
client.connect().catch(console.error);

const PREFIX = "auth:";
const TTL_SECONDS = 60 * 60 * 24 * 7;

export const sessions = {
  async create(userId: string): Promise<string> {
    const sid = randomUUID();
    await client.set(`${PREFIX}${sid}`, userId, { EX: TTL_SECONDS });
    return sid;
  },
  async get(sid: string): Promise<string | null> {
    return client.get(`${PREFIX}${sid}`);
  },
  async destroy(sid: string): Promise<void> {
    await client.del(`${PREFIX}${sid}`);
  },
};
