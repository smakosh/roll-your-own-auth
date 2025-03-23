import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  createdAt: text("create_at").default(sql`(CURRENT_TIMESTAMP)`),
});
