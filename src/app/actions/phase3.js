"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalAccess } from "@/lib/auth/session";
import { boundedText, validMoney, validUuid } from "@/lib/phase3/presentation.mjs";

function finish(code) { revalidatePath("/admin/financials"); redirect(`/admin/financials?result=${code}`); }

export async function recordManualPaymentAction(formData) {
  const { supabase } = await requirePortalAccess("/admin/financials");
  const userId = formData.get("user_id"), purchaseId = formData.get("purchase_id"), installmentId = formData.get("installment_id");
  const amount = validMoney(formData.get("amount"));
  if (!validUuid(userId) || !validUuid(purchaseId) || (installmentId && !validUuid(installmentId)) || !amount) finish("invalid");
  const { error } = await supabase.rpc("admin_record_manual_payment", {
    requested_user_id: userId, requested_purchase_id: purchaseId, requested_installment_id: installmentId || null,
    requested_amount: amount, requested_method: boundedText(formData.get("method"), 32), requested_reference: boundedText(formData.get("reference"), 120) || null,
    requested_payment_date: boundedText(formData.get("payment_date"), 10), requested_notes: boundedText(formData.get("notes"), 1000) || null,
    requested_idempotency_key: `manual-ui:${crypto.randomUUID()}`,
  });
  finish(error ? "failed" : "recorded");
}

export async function reviewManualPaymentAction(formData) {
  const { supabase } = await requirePortalAccess("/admin/financials");
  const paymentId = formData.get("payment_id"), operation = formData.get("operation"), reason = boundedText(formData.get("reason"), 500);
  if (!validUuid(paymentId) || !["verify", "reject", "reverse"].includes(operation)) finish("invalid");
  const rpc = operation === "verify" ? "admin_verify_manual_payment" : operation === "reject" ? "admin_reject_manual_payment" : "admin_reverse_manual_payment";
  const args = operation === "verify" ? { target_payment_id: paymentId } : { target_payment_id: paymentId, reason };
  if (operation !== "verify" && reason.length < 3) finish("invalid");
  const { error } = await supabase.rpc(rpc, args);
  finish(error ? "failed" : operation);
}
