import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY","SUPABASE_ENVIRONMENT","DEV_SEED_ADMIN_EMAIL","DEV_SEED_ADMIN_PASSWORD","DEV_SEED_AFFILIATE_PASSWORD"];
assert.deepEqual(required.filter((key) => !process.env[key]), []);
assert.equal(process.env.SUPABASE_ENVIRONMENT, "development");
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
const executive = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);
const member = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);
let testUserId = null;

async function main() {
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;
  const email = `phase4-kyc-${suffix}@example.test`;
  const { data: nodes, error: nodesError } = await service.from("network_nodes").select("user_id,member_code,parent_user_id,placement_leg");
  assert.equal(nodesError, null);
  const occupiedLeft = new Set(nodes.filter((node) => node.parent_user_id && node.placement_leg === "left").map((node) => node.parent_user_id));
  const sponsor = nodes.find((node) => !occupiedLeft.has(node.user_id));
  assert.ok(sponsor, "A development network position is required for the hosted fixture");
  const created = await service.auth.admin.createUser({ email, password: process.env.DEV_SEED_AFFILIATE_PASSWORD, email_confirm: true, user_metadata: { full_name: "Phase 4 KYC Test", sponsor_code: sponsor.member_code, target_leg: "left" } });
  assert.equal(created.error, null);
  const userId = created.data.user.id;
  testUserId = userId;
  const executiveLogin = await executive.auth.signInWithPassword({ email: process.env.DEV_SEED_ADMIN_EMAIL, password: process.env.DEV_SEED_ADMIN_PASSWORD });
  assert.equal(executiveLogin.error, null);
  const memberLogin = await member.auth.signInWithPassword({ email, password: process.env.DEV_SEED_AFFILIATE_PASSWORD });
  assert.equal(memberLogin.error, null);

  const anonymous = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);
  const anonymousRead = await anonymous.from("kyc_submissions").select("id");
  assert.equal(anonymousRead.data?.length || 0, 0);
  const draft = await member.rpc("start_or_get_kyc_draft");
  assert.equal(draft.error, null);
  const n = String(Date.now()).slice(-4);
  const saved = await member.rpc("save_kyc_draft", { target_submission_id: draft.data, requested_pan: `QWERT${n}P`, requested_aadhaar_last4: n, requested_bank_account: `00123456${n}`, requested_ifsc: "HDFC0001234", requested_account_holder: "Phase Four Test" });
  assert.equal(saved.error, null);

  const payload = Buffer.from("%PDF-1.4\nPhase 4 hosted verification\n%%EOF");
  const hash = (await import("node:crypto")).createHash("sha256").update(payload).digest("hex");
  for (const type of ["pan", "aadhaar", "bank_proof"]) {
    const path = `${userId}/${draft.data}/${type}/${crypto.randomUUID()}.pdf`;
    const denied = await member.storage.from("kyc-private").upload(path, payload, { contentType: "application/pdf" });
    assert.ok(denied.error, "Direct authenticated Storage upload must be denied");
    const intent = await member.rpc("create_kyc_upload_intent", { target_submission_id: draft.data, requested_document_type: type, requested_object_path: path, requested_mime_type: "application/pdf", requested_size_bytes: payload.length, requested_sha256: hash });
    assert.equal(intent.error, null);
    const upload = await service.storage.from("kyc-private").upload(path, payload, { contentType: "application/pdf" });
    assert.equal(upload.error, null);
    const finalized = await member.rpc("finalize_kyc_upload", { target_intent_id: intent.data, requested_original_filename: `${type}.pdf` });
    assert.equal(finalized.error, null);
    const scanStarted = await service.rpc("record_kyc_document_scan", { target_document_id: finalized.data, requested_status: "scanning", scanner_reference: "hosted-test-scanner", result_metadata: { test_only: true } });
    assert.equal(scanStarted.error, null);
    const scanClean = await service.rpc("record_kyc_document_scan", { target_document_id: finalized.data, requested_status: "clean", scanner_reference: "hosted-test-scanner", result_metadata: { test_only: true, verdict: "clean" } });
    assert.equal(scanClean.error, null);
  }
  const before = await member.rpc("can_withdraw", { check_user_id: userId });
  assert.equal(before.data, false);
  const submitted = await member.rpc("submit_kyc", { target_submission_id: draft.data });
  assert.equal(submitted.error, null);
  const forbiddenReview = await member.rpc("admin_review_kyc", { target_submission_id: draft.data, requested_decision: "approved", requested_reason: null, requested_notes: null });
  assert.ok(forbiddenReview.error);
  const crossUser = await member.from("kyc_submissions").select("id").neq("user_id", userId);
  assert.equal(crossUser.data?.length || 0, 0);
  const reveal = await executive.rpc("get_kyc_sensitive_for_review", { target_submission_id: draft.data });
  assert.equal(reveal.error, null);
  assert.equal(reveal.data[0].ifsc, "HDFC0001234");
  const reviews = await Promise.all([
    executive.rpc("admin_review_kyc", { target_submission_id: draft.data, requested_decision: "approved", requested_reason: null, requested_notes: "Hosted verification" }),
    executive.rpc("admin_review_kyc", { target_submission_id: draft.data, requested_decision: "approved", requested_reason: null, requested_notes: "Concurrent retry" }),
  ]);
  assert.equal(reviews.filter(({ error }) => !error).length, 1, "Only one concurrent final decision may succeed");
  const after = await member.rpc("can_withdraw", { check_user_id: userId });
  assert.equal(after.error, null);
  assert.equal(after.data, true);
  const directMutation = await member.from("kyc_submissions").update({ status: "approved" }).eq("id", draft.data);
  assert.ok(directMutation.error);
  const audit = await service.from("security_audit_log").select("id").eq("target_user_id", userId).eq("action", "kyc.sensitive_data_accessed");
  assert.equal(audit.error, null);
  assert.ok(audit.data.length > 0);
  await Promise.all([executive.auth.signOut({ scope: "local" }), member.auth.signOut({ scope: "local" })]);
}

async function cleanupTestNetworkNode() {
  if (!testUserId) return;
  const access = await service.rpc("service_set_profile_access", {
    target_user_id: testUserId,
    requested_role: "affiliate",
    requested_status: "disabled",
    change_reason: "Hosted Phase 4 test fixture cleanup",
    operator_reference: "phase4-hosted-test",
  });
  if (access.error) throw access.error;
  const removed = await service.from("network_nodes").delete().eq("user_id", testUserId);
  if (removed.error) throw removed.error;
}

main()
  .then(async () => {
    await cleanupTestNetworkNode();
    process.stdout.write("Hosted Phase 4 KYC, Storage, RLS, audit, and eligibility verification passed.\n");
  })
  .catch(async (error) => {
    try { await cleanupTestNetworkNode(); } catch {}
    process.stderr.write(`Hosted Phase 4 verification failed: ${error.message}\n`);
    process.exitCode = 1;
  });
