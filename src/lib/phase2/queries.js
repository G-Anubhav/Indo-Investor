import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loadNetworkTree(rootUserId, depth = 3) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_network_tree", {
    requested_root_user_id: rootUserId,
    requested_depth: depth,
  });
  return { rows: data || [], error: error ? "tree_error" : null };
}

export async function loadCurrentNetworkNode(userId) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("network_nodes")
    .select("user_id, member_code, parent_user_id, placement_leg")
    .eq("user_id", userId)
    .single();
  return { node: data || null, error: error ? "network_root_missing" : null };
}

export async function loadDirectReferrals({ page, search, status }) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_direct_referrals", {
    page_number: page,
    page_size: 20,
    search_term: search || null,
    status_filter: status || null,
  });
  return { rows: data || [], error: error ? "referrals_error" : null };
}

export async function loadNetworkIndex({ page, search, status, leg }) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_network_index", {
    page_number: page,
    page_size: 25,
    search_term: search || null,
    status_filter: status || null,
    leg_filter: leg || null,
  });
  return { rows: data || [], error: error ? "network_index_error" : null };
}

export async function loadActiveProjects() {
  const supabase = await createServerSupabaseClient();
  await supabase.rpc("expire_plot_holds");
  const { data, error } = await supabase
    .from("real_estate_projects")
    .select("id, name, slug, description, location_name, metadata, created_at, plots(status)")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  return { projects: data || [], error: error ? "projects_error" : null };
}

export async function loadProjectInventory(slug) {
  const supabase = await createServerSupabaseClient();
  await supabase.rpc("expire_plot_holds");
  const { data: project, error: projectError } = await supabase
    .from("real_estate_projects")
    .select("id, name, slug, description, location_name, metadata")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (projectError || !project) return { project: null, plots: [], error: "project_not_found" };

  const { data: plots, error: plotsError } = await supabase
    .from("plots")
    .select("id, plot_number, grid_row, grid_column, area_sq_yd, dimensions, price, status, held_by_user_id, hold_expires_at, booked_by_user_id, updated_at")
    .eq("project_id", project.id)
    .order("grid_row")
    .order("grid_column");

  return { project, plots: plots || [], error: plotsError ? "plots_error" : null };
}
