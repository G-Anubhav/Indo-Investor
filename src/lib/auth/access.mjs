export const EXECUTIVE_ROLES = new Set(["executive", "admin"]);

export function isExecutiveRole(role) {
  return EXECUTIVE_ROLES.has(role);
}

export function evaluatePortalAccess({ user, profile, pathname }) {
  if (!user) return { allowed: false, reason: "unauthenticated" };
  if (!profile) return { allowed: false, reason: "profile_unavailable" };
  if (profile.status !== "active") return { allowed: false, reason: "account_inactive" };
  if (pathname.startsWith("/admin") && !isExecutiveRole(profile.role_key)) {
    return { allowed: false, reason: "unauthorized" };
  }
  return { allowed: true };
}
