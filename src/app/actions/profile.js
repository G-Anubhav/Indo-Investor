"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalAccess } from "@/lib/auth/session";
import { validateProfileUpdate } from "@/lib/profile/validation.mjs";

function value(formData, name) {
  const candidate = formData.get(name);
  return typeof candidate === "string" ? candidate : "";
}

export async function updateProfileAction(formData) {
  const { supabase, user, profile } = await requirePortalAccess("/profile");
  const input = validateProfileUpdate({
    fullName: value(formData, "fullName"),
    displayName: value(formData, "displayName"),
    mobilePhone: value(formData, "mobilePhone"),
    languageCode: profile.language_code,
  });

  if (!input.valid) redirect("/profile?error=validation_failed");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.values.fullName,
      display_name: input.values.displayName,
      mobile_phone: input.values.mobilePhone,
      language_code: input.values.languageCode,
    })
    .eq("user_id", user.id);

  if (error) redirect(`/profile?error=${error.code === "23505" ? "duplicate_mobile" : "update_failed"}`);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/profile?message=profile_updated");
}
