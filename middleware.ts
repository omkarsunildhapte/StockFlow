import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const protectedPaths = ["/dashboard", "/products", "/settings"];
const authPaths = ["/login", "/signup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuth = authPaths.some((p) => pathname === p);

  if (isProtected) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      await verifyToken(token);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (isAuth && token) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      // invalid token — let through to auth page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/settings/:path*", "/login", "/signup"],
};
