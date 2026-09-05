"use server";

import { revalidatePath } from "next/cache";
import { requirePortalAccess } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function safeProjectSlug(value) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    ? value
    : null;
}

export async function lookupSponsorAction(code) {
  const normalized = typeof code === "string" ? code.trim().toUpperCase() : "";
  if (!/^IIIW[0-9]{4,}$/.test(normalized)) {
    return { ok: false, code: "invalid_sponsor_code" };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("lookup_network_sponsor", {
      requested_code: normalized,
    });
    if (error || !data?.[0]) return { ok: false, code: "invalid_sponsor_code" };
    return { ok: true, sponsor: data[0] };
  } catch {
    return { ok: false, code: "network_error" };
  }
}

export async function acquirePlotHoldAction(plotId, projectSlug) {
  await requirePortalAccess("/inventory");
  const slug = safeProjectSlug(projectSlug);
  if (typeof plotId !== "string" || !/^[0-9a-f-]{36}$/i.test(plotId) || !slug) {
    return { ok: false, code: "invalid_plot" };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("acquire_plot_hold", {
      requested_plot_id: plotId,
    });
    if (error) {
      const conflict = error.message?.includes("plot_unavailable");
      return { ok: false, code: conflict ? "plot_unavailable" : "hold_failed" };
    }
    revalidatePath(`/inventory/${slug}`);
    return { ok: true, hold: data?.[0] || null };
  } catch {
    return { ok: false, code: "network_error" };
  }
}

export async function releasePlotHoldAction(plotId, projectSlug) {
  await requirePortalAccess("/inventory");
  const slug = safeProjectSlug(projectSlug);
  if (typeof plotId !== "string" || !/^[0-9a-f-]{36}$/i.test(plotId) || !slug) {
    return { ok: false, code: "invalid_plot" };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("release_plot_hold", {
      requested_plot_id: plotId,
    });
    if (error || !data) return { ok: false, code: "release_failed" };
    revalidatePath(`/inventory/${slug}`);
    return { ok: true };
  } catch {
    return { ok: false, code: "network_error" };
  }
}
