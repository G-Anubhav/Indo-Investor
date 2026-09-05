import assert from "node:assert/strict";
import test from "node:test";
import {
  validateLoginInput,
  validatePassword,
  validateSignupInput,
} from "../src/lib/auth/validation.mjs";

test("login validation normalizes email and accepts a password", () => {
  const result = validateLoginInput({ identifier: " USER@Example.Test ", password: "Password1" });
  assert.equal(result.valid, true);
  assert.equal(result.values.identifier, "user@example.test");
});

test("login validation accepts and normalizes an IIIW member ID", () => {
  const result = validateLoginInput({ identifier: " iiiw1001 ", password: "Password1" });
  assert.equal(result.valid, true);
  assert.equal(result.values.identifier, "IIIW1001");
});

test("login validation rejects an invalid email or member ID", () => {
  const result = validateLoginInput({ identifier: "unknown-user", password: "Password1" });
  assert.equal(result.valid, false);
  assert.equal(result.errors.identifier, "validation_failed");
});

test("password policy requires length, mixed case, and a number", () => {
  assert.deepEqual(validatePassword("weak"), [
    "password_too_short",
    "password_uppercase_required",
    "password_number_required",
  ]);
  assert.deepEqual(validatePassword("StrongPassword1"), []);
});

test("signup rejects malformed input and missing consent", () => {
  const result = validateSignupInput({
    fullName: "A",
    email: "bad",
    mobilePhone: "9876543210",
    password: "weak",
    confirmPassword: "different",
    languageCode: "invalid",
    acceptTerms: false,
  });
  assert.equal(result.valid, false);
  assert.equal(result.errors.email, "invalid_email");
  assert.equal(result.errors.mobilePhone, "invalid_mobile_phone");
  assert.equal(result.errors.acceptTerms, "terms_required");
  assert.equal(result.values.languageCode, "en");
});

test("signup requires a valid sponsor and explicit binary leg", () => {
  const valid = validateSignupInput({
    fullName: "Network Member",
    email: "member@example.test",
    mobilePhone: "+919876543210",
    sponsorCode: "iiiw1002",
    targetLeg: "left",
    password: "StrongPassword1",
    confirmPassword: "StrongPassword1",
    languageCode: "en",
    acceptTerms: true,
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.values.sponsorCode, "IIIW1002");
  assert.equal(valid.values.targetLeg, "left");
});

test("signup accepts the sequential IIIW sponsor format", () => {
  const result = validateSignupInput({ email: "member@example.test", fullName: "New Member", mobilePhone: "", languageCode: "en", password: "Secure123", confirmPassword: "Secure123", sponsorCode: "iiiw1002", targetLeg: "left", acceptTerms: true });
  assert.equal(result.valid, true);
  assert.equal(result.values.sponsorCode, "IIIW1002");
});
