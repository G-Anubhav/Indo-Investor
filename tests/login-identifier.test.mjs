import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidLoginIdentifier,
  resolveLoginEmail,
} from "../src/lib/auth/login-identifier.mjs";

test("email login does not perform a member lookup", async () => {
  let lookedUp = false;
  const email = await resolveLoginEmail(" USER@Example.Test ", async () => {
    lookedUp = true;
    return null;
  });
  assert.equal(email, "user@example.test");
  assert.equal(lookedUp, false);
});

test("member login resolves its email only through the supplied server lookup", async () => {
  let requestedCode;
  const email = await resolveLoginEmail("iiiw1001", async (memberCode) => {
    requestedCode = memberCode;
    return "member@example.test";
  });
  assert.equal(requestedCode, "IIIW1001");
  assert.equal(email, "member@example.test");
});

test("unknown member login uses a non-routable identity", async () => {
  assert.equal(
    await resolveLoginEmail("IIIW9999", async () => null),
    "iiiw9999@invalid.invalid",
  );
  assert.equal(isValidLoginIdentifier("IIIW9999"), true);
  assert.equal(isValidLoginIdentifier("not-a-member"), false);
});
