import test from "node:test";
import assert from "node:assert/strict";
import { isPortalPath, usesStandaloneChrome } from "../src/lib/portal/routes.mjs";

const portalRoutes = ["/dashboard","/network","/network/referrals","/network/index","/inventory","/inventory/demo","/wallets","/earnings","/property-payments","/kyc","/profile","/mfa","/admin","/admin/financials","/admin/kyc","/admin/kyc/id"];

test("every authenticated route is classified as portal-only chrome", () => {
  for (const route of portalRoutes) { assert.equal(isPortalPath(route), true, route); assert.equal(usesStandaloneChrome(route), true, route); }
});

test("public pages retain public website chrome", () => {
  for (const route of ["/","/about","/contact-us","/properties/residential"]) assert.equal(usesStandaloneChrome(route), false, route);
});
