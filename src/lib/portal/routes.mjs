export const PORTAL_PREFIXES = [
  "/dashboard", "/admin", "/network", "/inventory", "/wallets",
  "/earnings", "/property-payments", "/kyc", "/profile", "/mfa",
];

export const STANDALONE_PREFIXES = [
  "/login", "/signup", "/forgot-password", "/reset-password", "/unauthorized",
  ...PORTAL_PREFIXES,
];

export function matchesPathPrefix(pathname, prefixes) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isPortalPath(pathname) {
  return matchesPathPrefix(pathname, PORTAL_PREFIXES);
}

export function usesStandaloneChrome(pathname) {
  return matchesPathPrefix(pathname, STANDALONE_PREFIXES);
}
