import assert from "node:assert/strict";
import test from "node:test";
import {
  performLogout,
  performPasswordRecovery,
  performPasswordReset,
  performSignIn,
  performSignUp,
} from "../src/lib/auth/operations.mjs";

function authClient(overrides = {}) {
  return {
    auth: {
      signInWithPassword: async () => ({ data: { user: { id: "user-a" }, session: { access_token: "test" } }, error: null }),
      signUp: async () => ({ data: { user: { id: "user-a", identities: [{}] }, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ error: null }),
      ...overrides,
    },
  };
}

test("successful login returns the authenticated session", async () => {
  const result = await performSignIn(authClient(), { email: "user@example.test", password: "Password1" });
  assert.equal(result.ok, true);
  assert.equal(result.user.id, "user-a");
});

test("failed login returns a safe generic error", async () => {
  const client = authClient({ signInWithPassword: async () => ({ data: {}, error: new Error("raw provider detail") }) });
  assert.deepEqual(await performSignIn(client, {}), { ok: false, code: "invalid_credentials" });
});

test("logout invalidates the local Supabase session", async () => {
  let scope;
  const client = authClient({ signOut: async (options) => { scope = options.scope; return { error: null }; } });
  assert.deepEqual(await performLogout(client), { ok: true });
  assert.equal(scope, "local");
});

test("password recovery uses the supplied secure callback URL", async () => {
  let captured;
  const client = authClient({ resetPasswordForEmail: async (email, options) => { captured = { email, options }; return { error: null }; } });
  const result = await performPasswordRecovery(client, "user@example.test", "https://portal.example.test/auth/callback");
  assert.equal(result.ok, true);
  assert.equal(captured.options.redirectTo, "https://portal.example.test/auth/callback");
});

test("rate-limited recovery returns a user-safe code", async () => {
  const client = authClient({ resetPasswordForEmail: async () => ({ error: { status: 429, message: "provider detail" } }) });
  assert.deepEqual(await performPasswordRecovery(client, "user@example.test", "https://example.test"), { ok: false, code: "rate_limited" });
});

test("duplicate signup is recognized without exposing provider errors", async () => {
  const client = authClient({ signUp: async () => ({ data: {}, error: { code: "user_already_exists", message: "raw detail" } }) });
  const result = await performSignUp(client, { email: "user@example.test", password: "Password1" });
  assert.deepEqual(result, { ok: false, code: "duplicate_account" });
});

test("password reset reports an expired session safely", async () => {
  const client = authClient({ updateUser: async () => ({ error: { status: 401, message: "raw token detail" } }) });
  assert.deepEqual(await performPasswordReset(client, "NewPassword1"), { ok: false, code: "expired_link" });
});
