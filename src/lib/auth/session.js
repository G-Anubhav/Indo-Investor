import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { evaluatePortalAccess } from "./access.mjs";

export async function getAuthenticatedContext() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return { supabase, user: null, profile: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, full_name, display_name, email, mobile_phone, status, role_key, language_code, created_at")
    .eq("user_id", user.id)
    .single();

  return {
    supabase,
    user,
    profile: profileError ? null : profile,
  };
}

export async function requirePortalAccess(pathname = "/dashboard") {
  const context = await getAuthenticatedContext();
  const decision = evaluatePortalAccess({ ...context, pathname });

  if (!decision.allowed) {
    if (decision.reason === "unauthenticated") redirect("/login?error=session_expired");
    if (decision.reason === "unauthorized") redirect("/unauthorized");
    redirect(`/login?error=${decision.reason}`);
  }

  if (pathname.startsWith("/admin")) {
    const { data: privilegedAccess, error } = await context.supabase.rpc("privileged_access_ready");
    if (error || !privilegedAccess) redirect("/mfa?error=mfa_required");
  }

  return context;
}
