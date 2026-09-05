import test from "node:test";
import assert from "node:assert/strict";
import {
  isProductionConfigurationSafe,
  portalRuntimeConfigurationIssues,
  productionConfigurationIssues,
} from "../src/lib/production/config.mjs";
import { validateSeedEnvironment } from "../scripts/seed-guard.mjs";

const safeProduction = {
  NODE_ENV: "production", APP_ENVIRONMENT: "production", SUPABASE_ENVIRONMENT: "production", ALLOW_DEV_SEED: "false",
  NEXT_PUBLIC_SUPABASE_URL: "https://productionref.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  NEXT_PUBLIC_SITE_URL: "https://invest.example.com", SUPABASE_SERVICE_ROLE_KEY: "service", SUPABASE_PROJECT_REF: "productionref",
  SMTP_USER: "mailer", SMTP_PASS: "secret", CONTACT_RECIPIENT_EMAIL: "leads@example.com",
};

test("safe production configuration requires HTTPS, isolated secrets, and disabled development seed", () => {
  assert.equal(isProductionConfigurationSafe(safeProduction), true);
  assert.deepEqual(productionConfigurationIssues(safeProduction), []);
});

test("unsafe production configuration is rejected without exposing values", () => {
  const issues = productionConfigurationIssues({ ...safeProduction, NEXT_PUBLIC_SITE_URL: "http://localhost:3000", ALLOW_DEV_SEED: "true", DEV_SEED_ADMIN_EMAIL: "admin@example.test" });
  assert.ok(issues.includes("invalid_production_site_url"));
  assert.ok(issues.includes("development_seed_not_disabled"));
  assert.ok(issues.includes("development_credentials_present"));
  assert.equal(issues.some((issue) => issue.includes("admin@example.test")), false);
});

test("portal runtime is available without unrelated production operations configuration", () => {
  assert.deepEqual(portalRuntimeConfigurationIssues({
    NODE_ENV: "production",
    NEXT_PUBLIC_SUPABASE_URL: "https://productionref.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  }), []);
});

test("portal runtime rejects missing or insecure production Supabase configuration", () => {
  assert.deepEqual(portalRuntimeConfigurationIssues({ NODE_ENV: "production" }), [
    "missing:NEXT_PUBLIC_SUPABASE_URL",
    "missing:NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);
  assert.ok(portalRuntimeConfigurationIssues({
    NODE_ENV: "production",
    NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  }).includes("insecure_production_supabase_url"));
});

test("development seed refuses production even when its opt-in flag is true", () => {
  assert.throws(() => validateSeedEnvironment({ ...safeProduction, ALLOW_DEV_SEED: "true" }), /disabled in production/);
});
