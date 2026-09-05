"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  performLogout,
  performPasswordRecovery,
  performPasswordReset,
  performSignIn,
  performSignUp,
} from "@/lib/auth/operations.mjs";
import {
  validateLoginInput,
  validateRecoveryInput,
  validateResetInput,
  validateSignupInput,
} from "@/lib/auth/validation.mjs";
import { resolveLoginEmail } from "@/lib/auth/login-identifier.mjs";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSiteUrl, SupabaseConfigurationError } from "@/lib/supabase/config";
import {
  createServerSupabaseClient,
  REMEMBER_SESSION_COOKIE,
} from "@/lib/supabase/server";

const initialFailure = (code, fields = {}) => ({ ok: false, code, fields });

function value(formData, key) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry : "";
}

function configurationFailure(error) {
  if (error instanceof SupabaseConfigurationError) {
    return initialFailure("configuration_error");
  }
  return initialFailure("network_error");
}

export async function loginAction(_previousState, formData) {
  const input = validateLoginInput({
    identifier: value(formData, "identifier"),
    password: value(formData, "password"),
  });
  if (!input.valid) return initialFailure("validation_failed", input.errors);

  const remember = formData.get("remember") === "on";

  try {
    const cookieStore = await cookies();
    cookieStore.set(REMEMBER_SESSION_COOKIE, String(remember), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    });

    const email = await resolveLoginEmail(input.values.identifier, async (memberCode) => {
      const admin = createAdminSupabaseClient();
      const { data: node, error: nodeError } = await admin
        .from("network_nodes")
        .select("user_id")
        .eq("member_code", memberCode)
        .maybeSingle();
      if (nodeError) throw nodeError;
      if (!node) return null;

      const { data: profile, error: profileError } = await admin
        .from("profiles")
        .select("email")
        .eq("user_id", node.user_id)
        .maybeSingle();
      if (profileError) throw profileError;
      return profile?.email || null;
    });
    const supabase = await createServerSupabaseClient({ persistent: remember });
    const result = await performSignIn(supabase, { email, password: input.values.password });
    if (!result.ok) return initialFailure(result.code);
  } catch (error) {
    return configurationFailure(error);
  }

  redirect("/dashboard");
}

export async function signupAction(_previousState, formData) {
  const input = validateSignupInput({
    fullName: value(formData, "fullName"),
    email: value(formData, "email"),
    mobilePhone: value(formData, "mobilePhone"),
    sponsorCode: value(formData, "sponsorCode"),
    targetLeg: value(formData, "targetLeg"),
    languageCode: value(formData, "languageCode"),
    password: value(formData, "password"),
    confirmPassword: value(formData, "confirmPassword"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });
  if (!input.valid) return initialFailure("validation_failed", input.errors);

  let hasSession = false;
  try {
    const supabase = await createServerSupabaseClient({ persistent: false });
    const { data: sponsorRows, error: sponsorError } = await supabase.rpc(
      "lookup_network_sponsor",
      { requested_code: input.values.sponsorCode },
    );
    const sponsor = sponsorRows?.[0];
    if (sponsorError || !sponsor) {
      return initialFailure("validation_failed", { sponsorCode: "invalid_sponsor_code" });
    }
    if (!sponsor[`${input.values.targetLeg}_available`]) {
      return initialFailure("validation_failed", { targetLeg: "network_position_occupied" });
    }
    const result = await performSignUp(supabase, {
      ...input.values,
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
    });
    if (!result.ok) return initialFailure(result.code);
    hasSession = Boolean(result.session);
    if (!hasSession) {
      return { ok: true, code: "verification_email_sent", fields: {} };
    }
  } catch (error) {
    return configurationFailure(error);
  }

  redirect("/dashboard");
}

export async function forgotPasswordAction(_previousState, formData) {
  const input = validateRecoveryInput({ email: value(formData, "email") });
  if (!input.valid) return initialFailure("validation_failed", input.errors);

  try {
    const supabase = await createServerSupabaseClient({ persistent: false });
    const result = await performPasswordRecovery(
      supabase,
      input.values.email,
      `${getSiteUrl()}/auth/callback?next=/reset-password`,
    );
    if (!result.ok) return initialFailure(result.code);
    return { ok: true, code: "recovery_email_sent", fields: {} };
  } catch (error) {
    return configurationFailure(error);
  }
}

export async function resetPasswordAction(_previousState, formData) {
  const input = validateResetInput({
    password: value(formData, "password"),
    confirmPassword: value(formData, "confirmPassword"),
  });
  if (!input.valid) return initialFailure("validation_failed", input.errors);

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return initialFailure("expired_link");
    const result = await performPasswordReset(supabase, input.values.password);
    if (!result.ok) return initialFailure(result.code);
  } catch (error) {
    return configurationFailure(error);
  }

  redirect("/login?message=password_updated");
}

export async function logoutAction() {
  try {
    const supabase = await createServerSupabaseClient();
    await performLogout(supabase);
    const cookieStore = await cookies();
    cookieStore.delete(REMEMBER_SESSION_COOKIE);
  } finally {
    redirect("/login?message=signed_out");
  }
}
