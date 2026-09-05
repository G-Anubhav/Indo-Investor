import { NextResponse } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";
import { portalRuntimeConfigurationIssues } from "@/lib/production/config.mjs";

const protectedPrefixes = ["/dashboard", "/admin", "/network", "/inventory", "/wallets", "/earnings", "/property-payments", "/kyc", "/profile", "/mfa"];

export async function middleware(request) {
  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (isProtected && portalRuntimeConfigurationIssues().length > 0) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "?error=configuration_error";
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { response, user } = await refreshSupabaseSession(request);
    if (isProtected && !user) {
      const hadSessionCookie = request.cookies
        .getAll()
        .some(({ name }) => name.startsWith("sb-") && name.includes("auth-token"));
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = `?error=${hadSessionCookie ? "session_expired" : "authentication_required"}`;
      return NextResponse.redirect(loginUrl);
    }
    return response;
  } catch {
    if (!isProtected) return NextResponse.next();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "?error=configuration_error";
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|pdf)$).*)",
  ],
};
