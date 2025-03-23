import { cookies } from "next/headers";
import { APP_URL } from "@/lib/env";
import { cache } from "react";

export const getCurrentUserCached = cache(async () => {
  const res = await fetch(`${APP_URL}/api/auth/me`, {
    headers: {
      Cookie: (await cookies()).toString(),
    },
  });

  if (!res.ok) {
    return undefined;
  }

  const data = await res.json();

  if (!data?.id) {
    return undefined;
  }

  return data;
})

export const getCurrentUser = async () => {
  const res = await fetch(`${APP_URL}/api/auth/me`, {
    headers: {
      Cookie: (await cookies()).toString(),
    },
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