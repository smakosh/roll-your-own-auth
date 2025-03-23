import { APP_URL } from "./env";

export type User = {
  id: string;
  name: string;
  email: string;
} | null;

export const getUser = async () => {
  const res = await fetch(`${APP_URL}/api/auth/me`, {
    credentials: "include",
  });

  const user: User = await res.json();

  return user;
};
