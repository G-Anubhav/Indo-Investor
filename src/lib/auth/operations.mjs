function isDuplicateAccount(error) {
  const value = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
  return value.includes("user_already_exists") || value.includes("already registered");
}

export async function performSignIn(supabase, credentials) {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error || !data?.user) return { ok: false, code: "invalid_credentials" };
  return { ok: true, user: data.user, session: data.session };
}

export async function performSignUp(supabase, input) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: input.emailRedirectTo,
      data: {
        full_name: input.fullName,
        mobile_phone: input.mobilePhone,
        language_code: input.languageCode,
        sponsor_code: input.sponsorCode,
        target_leg: input.targetLeg,
      },
    },
  });

  if (error) {
    return { ok: false, code: isDuplicateAccount(error) ? "duplicate_account" : "signup_failed" };
  }

  if (!data?.user || (Array.isArray(data.user.identities) && data.user.identities.length === 0)) {
    return { ok: false, code: "duplicate_account" };
  }

  return { ok: true, user: data.user, session: data.session || null };
}

export async function performLogout(supabase) {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  return error ? { ok: false, code: "logout_failed" } : { ok: true };
}

export async function performPasswordRecovery(supabase, email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return error
    ? { ok: false, code: error.status === 429 ? "rate_limited" : "recovery_failed" }
    : { ok: true };
}

export async function performPasswordReset(supabase, password) {
  const { error } = await supabase.auth.updateUser({ password });
  return error
    ? { ok: false, code: error.status === 401 ? "expired_link" : "reset_failed" }
    : { ok: true };
}
