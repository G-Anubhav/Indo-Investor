import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePortalAccess, isExecutiveRole } from "../src/lib/auth/access.mjs";
import { safeAuthRedirect } from "../src/lib/auth/redirects.mjs";

const user = { id: "user-a" };
const affiliate = { user_id: "user-a", status: "active", role_key: "affiliate" };
const admin = { user_id: "admin-a", status: "active", role_key: "admin" };

test("unauthenticated protected access is rejected", () => {
  assert.deepEqual(evaluatePortalAccess({ user: null, profile: null, pathname: "/dashboard" }), {
    allowed: false,
    reason: "unauthenticated",
  });
});

test("Phase 2 portal routes remain behind authenticated access", () => {
  for (const pathname of ["/network", "/network/index", "/inventory", "/inventory/demo"]) {
    assert.deepEqual(
      evaluatePortalAccess({ user: null, profile: null, pathname }),
      { allowed: false, reason: "unauthenticated" },
    );
  }
});

test("Phase 3 financial routes remain behind authenticated access", () => {
  for (const pathname of ["/wallets", "/earnings", "/property-payments", "/admin/financials"]) {
    assert.equal(evaluatePortalAccess({ user: null, profile: null, pathname }).allowed, false);
  }
});

test("affiliate can access the authenticated dashboard", () => {
  assert.deepEqual(evaluatePortalAccess({ user, profile: affiliate, pathname: "/dashboard" }), { allowed: true });
});

test("affiliate cannot access administrative routes", () => {
  assert.deepEqual(evaluatePortalAccess({ user, profile: affiliate, pathname: "/admin" }), {
    allowed: false,
    reason: "unauthorized",
  });
});

test("server-granted executive and admin roles can access administrative routes", () => {
  assert.equal(isExecutiveRole("executive"), true);
  assert.deepEqual(evaluatePortalAccess({ user, profile: admin, pathname: "/admin" }), { allowed: true });
});

test("inactive and missing profiles cannot enter the portal", () => {
  assert.equal(evaluatePortalAccess({ user, profile: null, pathname: "/dashboard" }).reason, "profile_unavailable");
  assert.equal(evaluatePortalAccess({ user, profile: { ...affiliate, status: "disabled" }, pathname: "/dashboard" }).reason, "account_inactive");
});

test("authentication callback rejects open redirects", () => {
  assert.equal(safeAuthRedirect("https://evil.example"), "/dashboard");
  assert.equal(safeAuthRedirect("//evil.example"), "/dashboard");
  assert.equal(safeAuthRedirect("/reset-password"), "/reset-password");
});
