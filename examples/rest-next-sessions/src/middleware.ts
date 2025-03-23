import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "./lib/session";

const PROTECTED_ROUTES = ["/dashboard"];
const UNAUHTENTICATED_ROUTES = ["/"];
const AUTH_ROUTES = ["/login", "/signup"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = PROTECTED_ROUTES.includes(path);
  const isUnauthenticatedRoute = UNAUHTENTICATED_ROUTES.includes(path);
  const isAuthRoute = AUTH_ROUTES.includes(path);

  const cookieStore = await cookies();
  const cookie = cookieStore.get("RollYourOwnAuth")?.value;

  if (isProtectedRoute) {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }

  if (isUnauthenticatedRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute && cookie) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}
