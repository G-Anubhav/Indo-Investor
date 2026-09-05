const ALLOWED_AUTH_REDIRECTS = new Set(["/dashboard", "/reset-password"]);

export function safeAuthRedirect(candidate, fallback = "/dashboard") {
  return ALLOWED_AUTH_REDIRECTS.has(candidate) ? candidate : fallback;
}
