import { SessionData } from "express-session";

export interface CustomSessionData extends SessionData {
  userId?: string;
}
