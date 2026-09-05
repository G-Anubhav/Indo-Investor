import { NextResponse } from "next/server";
import { safeAuthRedirect } from "@/lib/auth/redirects.mjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedOtpTypes = new Set(["signup", "recovery", "email_change", "email"]);

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = safeAuthRedirect(requestUrl.searchParams.get("next"));

  try {
    const supabase = await createServerSupabaseClient();
    let error;

    if (code) {
      ({ error } = await supabase.auth.exchangeCodeForSession(code));
    } else if (tokenHash && allowedOtpTypes.has(type)) {
      ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
    } else {
      error = new Error("Missing authentication callback token");
    }

    if (!error) return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch {
    // The user receives a safe error code below; raw auth errors stay server-side.
  }

  return NextResponse.redirect(new URL("/login?error=expired_link", requestUrl.origin));
}
