import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const PUBLIC_ROUTES = ["/", "/auth/login", "/api/auth", "/api/auth/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!req.auth && !isPublic) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (req.auth && (pathname === "/" || pathname.startsWith("/auth"))) {
    const home = req.nextUrl.clone();
    home.pathname = "/dashboard";
    home.searchParams.delete("callbackUrl");
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
