import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loadMyKyc(userId) {
  const supabase = await createServerSupabaseClient();
  const { data: submissions, error } = await supabase.from("kyc_submissions").select("id,version,status,submitted_at,reviewed_at,rejection_reason,created_at,updated_at").eq("user_id", userId).order("version", { ascending: false });
  const current = submissions?.[0] || null;
  const [{ data: documents }, { data: events }, { data: eligible }] = current ? await Promise.all([
    supabase.from("kyc_documents").select("id,document_type,status,scan_status,original_filename,mime_type,size_bytes,uploaded_at,scanned_at").eq("submission_id", current.id).eq("status", "active").order("document_type"),
    supabase.from("kyc_review_events").select("id,event_type,outcome,created_at").eq("submission_id", current.id).order("created_at", { ascending: false }),
    supabase.rpc("can_withdraw", { check_user_id: userId }),
  ]) : [{ data: [] }, { data: [] }, { data: false }];
  return { submissions: submissions || [], current, documents: documents || [], events: events || [], eligible: Boolean(eligible), error: error ? "kyc_load_failed" : null };
}

export async function loadKycQueue({ status = "pending_review", search = "", page = 1 } = {}) {
  const supabase = await createServerSupabaseClient();
  const pageSize = 25;
  const safePage = Math.max(1, Number(page) || 1);
  let userIds = null;
  if (search.trim()) {
    const term = search.trim().slice(0, 80);
    const { data } = await supabase.from("profiles").select("user_id").or(`display_name.ilike.%${term.replaceAll(/[,%()]/g, "")}%,email.ilike.%${term.replaceAll(/[,%()]/g, "")}%`).limit(100);
    userIds = (data || []).map((row) => row.user_id);
    if (!userIds.length) return { rows: [], count: 0, page: safePage, error: null };
  }
  let query = supabase.from("kyc_submissions").select("id,user_id,version,status,submitted_at,reviewed_at,created_at,profiles!kyc_submissions_user_id_fkey(display_name,email)", { count: "exact" });
  if (status && status !== "all") query = query.eq("status", status);
  if (userIds) query = query.in("user_id", userIds);
  const from = (safePage - 1) * pageSize;
  const { data, count, error } = await query.order("submitted_at", { ascending: false, nullsFirst: false }).range(from, from + pageSize - 1);
  return { rows: data || [], count: count || 0, page: safePage, error: error ? "queue_load_failed" : null };
}

export async function loadKycReview(submissionId, reveal = false) {
  const supabase = await createServerSupabaseClient();
  const [{ data: submission, error }, { data: documents }, { data: events }] = await Promise.all([
    supabase.from("kyc_submissions").select("id,user_id,version,status,submitted_at,reviewed_at,rejection_reason,review_notes,created_at,profiles!kyc_submissions_user_id_fkey(display_name,email,mobile_phone,status)").eq("id", submissionId).single(),
    supabase.from("kyc_documents").select("id,document_type,status,scan_status,original_filename,mime_type,size_bytes,uploaded_at,scanned_at").eq("submission_id", submissionId).eq("status", "active").order("document_type"),
    supabase.from("kyc_review_events").select("id,event_type,outcome,actor_user_id,created_at").eq("submission_id", submissionId).order("created_at", { ascending: false }),
  ]);
  let sensitive = null;
  if (reveal && !error) {
    const result = await supabase.rpc("get_kyc_sensitive_for_review", { target_submission_id: submissionId });
    sensitive = result.data?.[0] || null;
  }
  return { submission: error ? null : submission, documents: documents || [], events: events || [], sensitive, error: error ? "review_load_failed" : null };
}
