"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeLocale, supportedLocales } from "@/lib/i18n/translations";
import { LANGUAGE_COOKIE } from "@/lib/i18n/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function safeReturnPath(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

export async function setLanguageAction(formData) {
  const requestedLocale = formData.get("language");
  const locale = supportedLocales.includes(requestedLocale)
    ? requestedLocale
    : normalizeLocale(requestedLocale);
  const returnTo = safeReturnPath(formData.get("returnTo"));
  const cookieStore = await cookies();

  cookieStore.set(LANGUAGE_COOKIE, locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ language_code: locale })
        .eq("user_id", user.id);
    }
  } catch {
    // Public language selection must still work when Supabase is unavailable.
  }

  redirect(returnTo);
}
