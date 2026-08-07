import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { loginRateLimiter, apiMutationRateLimiter } from "@/lib/rate-limit";

const PUBLIC_ROUTES = ["/", "/auth/login", "/api/auth", "/api/auth/register", "/api/stripe/webhooks"];

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const httpMethod = req.method ?? "GET";
  const ip = getIp(req);

  // ── Rate limiting login ────────────────────────────────────────────────────
  const isLoginEndpoint = pathname === "/api/auth/callback/credentials";
  if (isLoginEndpoint && httpMethod === "POST") {
    const result = loginRateLimiter.check(ip);
    if (!result.ok) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
          "X-RateLimit-Reset": String(Date.now() + result.retryAfterMs),
        },
      });
    }
  }

  // ── Rate limiting mutations API ────────────────────────────────────────────
  const isApiMutation =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/api/stripe/webhooks") &&
    MUTATION_METHODS.has(httpMethod);

  if (isApiMutation) {
    const result = apiMutationRateLimiter.check(ip);
    if (!result.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
          },
        },
      );
    }
  }

  // ── CSRF : Content-Type guard sur les mutations API ───────────────────────
  // Les formulaires HTML classiques ne peuvent pas envoyer application/json,
  // ce qui bloque les attaques CSRF inter-origine sans token dédié.
  if (isApiMutation) {
    const contentType = req.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const isMultipart = contentType.includes("multipart/form-data");
    if (!isJson && !isMultipart) {
      return NextResponse.json(
        { error: "Unsupported Media Type" },
        { status: 415 },
      );
    }
  }

  // ── Auth guard ─────────────────────────────────────────────────────────────
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
