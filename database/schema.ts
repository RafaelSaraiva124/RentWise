import {
  integer,
  date,
  varchar,
  uuid,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core/columns/enum";

export const STATUS_ENUM = pgEnum("status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const ROLE_ENUM = pgEnum("role", ["INQUILINO", "SENHORIO"]);
export const RENDA_STATUS_ENUM = pgEnum("renda_status", [
  "PAGO",
  "PENDENTE",
  "VENCIDO",
]);

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: text().notNull(),
  status: STATUS_ENUM("status").notNull().default("PENDING"),
  role: ROLE_ENUM("role").default("INQUILINO"),
  lastActivityDAte: date("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});
