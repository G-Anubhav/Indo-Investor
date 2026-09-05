"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalAccess } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { cleanText, inspectKycFile, KYC_DOCUMENT_TYPES, normalizeDigits, normalizeIfsc, normalizePan, validAadhaarLast4, validBankAccount, validIfsc, validPan, validUuid } from "@/lib/phase4/validation.mjs";

function go(path, result) { revalidatePath(path); redirect(`${path}?result=${result}`); }
function failed(error) { return error ? "failed" : "ok"; }

export async function startKycAction() {
  const { supabase } = await requirePortalAccess("/kyc");
  const { error } = await supabase.rpc("start_or_get_kyc_draft");
  go("/kyc", failed(error));
}

export async function saveKycAction(formData) {
  const { supabase } = await requirePortalAccess("/kyc");
  const submissionId = formData.get("submission_id");
  const pan = normalizePan(formData.get("pan"));
  const aadhaar = normalizeDigits(formData.get("aadhaar_last4"));
  const bank = normalizeDigits(formData.get("bank_account"));
  const ifsc = normalizeIfsc(formData.get("ifsc"));
  const holder = cleanText(formData.get("account_holder"), 120);
  if (!validUuid(submissionId) || !validPan(pan) || !validAadhaarLast4(aadhaar) || !validBankAccount(bank) || !validIfsc(ifsc) || holder.length < 2) go("/kyc", "invalid");
  const { error } = await supabase.rpc("save_kyc_draft", { target_submission_id: submissionId, requested_pan: pan, requested_aadhaar_last4: aadhaar, requested_bank_account: bank, requested_ifsc: ifsc, requested_account_holder: holder });
  go("/kyc", error ? "failed" : "saved");
}

export async function uploadKycDocumentAction(formData) {
  const { supabase, user } = await requirePortalAccess("/kyc");
  const submissionId = String(formData.get("submission_id") || "");
  const documentType = String(formData.get("document_type") || "");
  const file = formData.get("document");
  if (!validUuid(submissionId) || !KYC_DOCUMENT_TYPES.has(documentType) || !(file instanceof File)) go("/kyc", "invalid");
  const buffer = Buffer.from(await file.arrayBuffer());
  const inspection = inspectKycFile({ name: file.name, type: file.type, size: buffer.length, bytes: buffer });
  if (!inspection.ok) go("/kyc", inspection.code);
  const hash = createHash("sha256").update(buffer).digest("hex");
  const objectPath = `${user.id}/${submissionId}/${documentType}/${crypto.randomUUID()}.${inspection.extension}`;
  const { data: intentId, error: intentError } = await supabase.rpc("create_kyc_upload_intent", { target_submission_id: submissionId, requested_document_type: documentType, requested_object_path: objectPath, requested_mime_type: file.type, requested_size_bytes: buffer.length, requested_sha256: hash });
  if (intentError) go("/kyc", "failed");
  const admin = createAdminSupabaseClient();
  const { error: uploadError } = await admin.storage.from("kyc-private").upload(objectPath, buffer, { contentType: file.type, upsert: false, cacheControl: "private, max-age=0" });
  if (uploadError) go("/kyc", "failed");
  const { error: finalizeError } = await supabase.rpc("finalize_kyc_upload", { target_intent_id: intentId, requested_original_filename: inspection.safeName });
  if (finalizeError) { await admin.storage.from("kyc-private").remove([objectPath]); go("/kyc", "failed"); }
  go("/kyc", "uploaded");
}

export async function submitKycAction(formData) {
  const { supabase } = await requirePortalAccess("/kyc");
  const submissionId = formData.get("submission_id");
  if (!validUuid(submissionId)) go("/kyc", "invalid");
  const { error } = await supabase.rpc("submit_kyc", { target_submission_id: submissionId });
  go("/kyc", error ? "failed" : "submitted");
}

export async function reviewKycAction(formData) {
  const { supabase } = await requirePortalAccess("/admin/kyc");
  const submissionId = String(formData.get("submission_id") || "");
  const decision = String(formData.get("decision") || "");
  const reason = cleanText(formData.get("reason"), 500);
  const notes = cleanText(formData.get("notes"), 1000);
  if (!validUuid(submissionId) || !["approved", "rejected", "resubmission_required"].includes(decision) || (decision !== "approved" && reason.length < 3)) go(`/admin/kyc/${submissionId}`, "invalid");
  const { error } = await supabase.rpc("admin_review_kyc", { target_submission_id: submissionId, requested_decision: decision, requested_reason: reason || null, requested_notes: notes || null });
  go(`/admin/kyc/${submissionId}`, error ? "failed" : "reviewed");
}

export async function openKycDocumentAction(formData) {
  const { supabase } = await requirePortalAccess("/admin/kyc");
  const documentId = String(formData.get("document_id") || "");
  if (!validUuid(documentId)) redirect("/admin/kyc?result=invalid");
  const { data: path, error } = await supabase.rpc("record_kyc_document_access", { target_document_id: documentId });
  if (error || !path) redirect("/admin/kyc?result=failed");
  const admin = createAdminSupabaseClient();
  const { data, error: signedError } = await admin.storage.from("kyc-private").createSignedUrl(path, 120, { download: false });
  if (signedError || !data?.signedUrl) redirect("/admin/kyc?result=failed");
  redirect(data.signedUrl);
}
