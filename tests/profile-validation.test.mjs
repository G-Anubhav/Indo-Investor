import test from "node:test";
import assert from "node:assert/strict";
import { validateProfileUpdate } from "../src/lib/profile/validation.mjs";

test("profile update normalizes only editable fields", () => {
  const result = validateProfileUpdate({ fullName: "  Asha   Sharma ", displayName: " Asha ", mobilePhone: "+919876543210", languageCode: "hi", role: "admin", memberCode: "IIIW9999" });
  assert.equal(result.valid, true);
  assert.deepEqual(result.values, { fullName: "Asha Sharma", displayName: "Asha", mobilePhone: "+919876543210", languageCode: "hi" });
  assert.equal("role" in result.values, false);
  assert.equal("memberCode" in result.values, false);
});

test("profile update rejects invalid names, phone and language", () => {
  const result = validateProfileUpdate({ fullName: "<x>", displayName: "x", mobilePhone: "9876", languageCode: "xx" });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["displayName", "fullName", "languageCode", "mobilePhone"]);
});
