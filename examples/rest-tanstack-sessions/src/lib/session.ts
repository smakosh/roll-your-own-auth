import { API_URL } from "@/lib/env";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getCurrentUser = createServerFn({
  method: "GET",
}).handler(async () => {
  const headers = getRequestHeaders() as HeadersInit;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers,
  });

  if (!res.ok) {
    return undefined;
  }

  const data = await res.json();

  if (!data?.id) {
    return undefined;
  }

  return data;
});
