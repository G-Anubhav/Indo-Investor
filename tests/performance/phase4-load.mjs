import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","DEV_SEED_ADMIN_EMAIL","DEV_SEED_ADMIN_PASSWORD","DEV_SEED_AFFILIATE_EMAIL","DEV_SEED_AFFILIATE_PASSWORD"];
assert.deepEqual(required.filter((key) => !process.env[key]), []);
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);
const member = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
}

async function measure(label, count, operation) {
  const results = await Promise.all(Array.from({ length: count }, async () => {
    const started = performance.now();
    const result = await operation();
    return { milliseconds: performance.now() - started, error: result.error };
  }));
  const times = results.map((item) => item.milliseconds);
  const errors = results.filter((item) => item.error).length;
  return { label, requests: count, errors, errorRate: errors / count, p50Ms: Math.round(percentile(times, .5)), p95Ms: Math.round(percentile(times, .95)), maxMs: Math.round(Math.max(...times)) };
}

async function main() {
  const [adminLogin, memberLogin] = await Promise.all([
    admin.auth.signInWithPassword({ email: process.env.DEV_SEED_ADMIN_EMAIL, password: process.env.DEV_SEED_ADMIN_PASSWORD }),
    member.auth.signInWithPassword({ email: process.env.DEV_SEED_AFFILIATE_EMAIL, password: process.env.DEV_SEED_AFFILIATE_PASSWORD }),
  ]);
  assert.equal(adminLogin.error, null);
  assert.equal(memberLogin.error, null);
  const userId = memberLogin.data.user.id;
  const reports = await Promise.all([
    measure("member eligibility RPC", 40, () => member.rpc("can_withdraw", { check_user_id: userId })),
    measure("executive KYC queue", 40, () => admin.from("kyc_submissions").select("id,user_id,version,status,submitted_at").eq("status", "pending_review").order("submitted_at", { ascending: false }).limit(25)),
  ]);
  assert.ok(reports.every((report) => report.errorRate === 0), "Load probe must complete without errors");
  process.stdout.write(`${JSON.stringify({ environment: "hosted-development", concurrency: 40, reports }, null, 2)}\n`);
  await Promise.all([admin.auth.signOut({ scope: "local" }), member.auth.signOut({ scope: "local" })]);
}
main().catch((error) => { process.stderr.write(`Phase 4 load probe failed: ${error.message}\n`); process.exitCode = 1; });
