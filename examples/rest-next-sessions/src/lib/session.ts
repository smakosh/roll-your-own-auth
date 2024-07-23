import { cookies } from "next/headers";
import { APP_URL } from "@/lib/env";

export async function getCurrentUser() {
  const res = await fetch(`${APP_URL}/api/auth/me`, {
    headers: {
      Cookie: cookies().toString(),
    },
    cache: "no-cache",
  });

  if (!res.ok) {
    return undefined;
  }

  const data = await res.json();

  if (!data?.id) {
    return undefined;
  }

  return data;
}
