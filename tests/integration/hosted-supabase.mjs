import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const requiredVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_PROJECT_REF",
  "SUPABASE_ENVIRONMENT",
  "DEV_SEED_ADMIN_EMAIL",
  "DEV_SEED_ADMIN_PASSWORD",
  "DEV_SEED_AFFILIATE_EMAIL",
  "DEV_SEED_AFFILIATE_PASSWORD",
];

function validateTarget() {
  const missing = requiredVariables.filter((name) => !process.env[name]);
  assert.deepEqual(missing, [], `Missing hosted-test variables: ${missing.join(", ")}`);
  assert.equal(process.env.SUPABASE_ENVIRONMENT, "development");

  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  assert.equal(url.hostname, `${process.env.SUPABASE_PROJECT_REF}.supabase.co`);
}

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function signIn(supabase, email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  assert.equal(error, null, `Hosted login failed for ${email}`);
  assert.ok(data.user);
  if (data.session?.access_token) {
    await supabase.realtime.setAuth(data.session.access_token);
  }
  return data.user;
}

function waitForSubscription(channel) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Realtime subscription timed out")), 12000);
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        resolve();
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        clearTimeout(timeout);
        reject(new Error(`Realtime subscription failed: ${status}`));
      }
    });
  });
}

async function main() {
  validateTarget();

  const anonymous = client();
  const affiliateClient = client();
  const adminClient = client();

  const affiliateUser = await signIn(
    affiliateClient,
    process.env.DEV_SEED_AFFILIATE_EMAIL,
    process.env.DEV_SEED_AFFILIATE_PASSWORD,
  );
  const adminUser = await signIn(
    adminClient,
    process.env.DEV_SEED_ADMIN_EMAIL,
    process.env.DEV_SEED_ADMIN_PASSWORD,
  );

  const { data: affiliateRows, error: affiliateReadError } = await affiliateClient
    .from("profiles")
    .select("user_id, role_key, status");
  assert.equal(affiliateReadError, null);
  assert.deepEqual(affiliateRows.map(({ user_id }) => user_id), [affiliateUser.id]);
  assert.equal(affiliateRows[0].role_key, "affiliate");

  const { data: crossUserChanges, error: crossUserError } = await affiliateClient
    .from("profiles")
    .update({ display_name: "RLS SHOULD BLOCK THIS" })
    .eq("user_id", adminUser.id)
    .select("user_id");
  assert.equal(crossUserError, null);
  assert.deepEqual(crossUserChanges, []);

  const { error: escalationError } = await affiliateClient
    .from("profiles")
    .update({ role_key: "admin" })
    .eq("user_id", affiliateUser.id);
  assert.ok(escalationError, "Role escalation must be rejected by column grants.");

  const { data: adminRows, error: adminReadError } = await adminClient
    .from("profiles")
    .select("user_id, role_key");
  assert.equal(adminReadError, null);
  assert.ok(adminRows.some(({ user_id }) => user_id === affiliateUser.id));
  assert.ok(adminRows.some(({ user_id }) => user_id === adminUser.id));

  const { data: affiliateWallets, error: affiliateWalletError } = await affiliateClient
    .from("wallets")
    .select("id,user_id,kind");
  assert.equal(affiliateWalletError, null);
  assert.equal(affiliateWallets.length, 2);
  assert.ok(affiliateWallets.every(({ user_id }) => user_id === affiliateUser.id));

  const { data: adminWallets, error: adminWalletError } = await adminClient
    .from("wallets")
    .select("id,user_id,kind");
  assert.equal(adminWalletError, null);
  assert.ok(adminWallets.length >= 4, "Admin can inspect operational wallet records");

  const { error: forgedJournalError } = await affiliateClient
    .from("financial_journals")
    .insert({
      transaction_type: "forged",
      description: "forged",
      reference_type: "profile",
      origin: "manual",
      idempotency_key: `forged-${Date.now()}`,
    });
  assert.ok(forgedJournalError, "Affiliates cannot create financial journals");

  const { error: unauthorizedVerificationError } = await affiliateClient.rpc(
    "admin_verify_manual_payment",
    { target_payment_id: "00000000-0000-0000-0000-000000000000" },
  );
  assert.match(unauthorizedVerificationError?.message || "", /executive_required/);

  const { data: anonymousRows, error: anonymousError } = await anonymous
    .from("profiles")
    .select("user_id");
  assert.ok(anonymousError || anonymousRows.length === 0);

  const { data: affiliateNode, error: nodeError } = await affiliateClient
    .from("network_nodes")
    .select("user_id, member_code")
    .eq("user_id", affiliateUser.id)
    .single();
  assert.equal(nodeError, null);

  const { data: treeRows, error: treeError } = await affiliateClient.rpc("get_network_tree", {
    requested_root_user_id: affiliateUser.id,
    requested_depth: 3,
  });
  assert.equal(treeError, null);
  assert.ok(treeRows.length >= 4, "Seeded recursive network should be available");
  assert.equal(treeRows[0].user_id, affiliateNode.user_id);

  const { data: referralRows, error: referralError } = await affiliateClient.rpc("get_direct_referrals", {
    page_number: 1,
    page_size: 20,
  });
  assert.equal(referralError, null);
  assert.ok(referralRows.length >= 2, "Seeded root should have multiple direct referrals");

  const { data: networkRows, error: networkError } = await affiliateClient.rpc("get_network_index", {
    page_number: 1,
    page_size: 25,
    leg_filter: "left",
  });
  assert.equal(networkError, null);
  assert.ok(networkRows.length >= 2);
  assert.ok(networkRows.every((row) => row.network_side === "left"));

  const { error: genealogyMutationError } = await affiliateClient
    .from("network_nodes")
    .update({ placement_leg: "right" })
    .eq("user_id", treeRows[1].user_id);
  assert.ok(genealogyMutationError, "Direct genealogy mutations must be denied");

  const { data: project, error: projectError } = await affiliateClient
    .from("real_estate_projects")
    .select("id, slug")
    .eq("slug", "phase-2-development-estate")
    .single();
  assert.equal(projectError, null);
  const { data: plots, error: plotsError } = await affiliateClient
    .from("plots")
    .select("id, status")
    .eq("project_id", project.id)
    .order("plot_number");
  assert.equal(plotsError, null);
  assert.ok(plots.some((plot) => plot.status === "available"));
  assert.ok(plots.some((plot) => plot.status === "token_hold"));
  assert.ok(plots.some((plot) => plot.status === "sold"));

  const availablePlots = plots.filter((plot) => plot.status === "available");
  const { error: directPlotMutationError } = await affiliateClient
    .from("plots")
    .update({ status: "sold" })
    .eq("id", availablePlots[0].id);
  assert.ok(directPlotMutationError, "Direct inventory mutation must be denied");

  const attempts = await Promise.all([
    affiliateClient.rpc("acquire_plot_hold", { requested_plot_id: availablePlots[0].id }),
    adminClient.rpc("acquire_plot_hold", { requested_plot_id: availablePlots[0].id }),
  ]);
  const winners = attempts.filter(({ error }) => !error);
  assert.equal(winners.length, 1, "Exactly one simultaneous hold acquisition must succeed");
  const winningClient = attempts[0].error ? adminClient : affiliateClient;
  const { data: released, error: releaseError } = await winningClient.rpc("release_plot_hold", {
    requested_plot_id: availablePlots[0].id,
  });
  assert.equal(releaseError, null);
  assert.equal(released, true);

  let resolveRealtime;
  const realtimeEvent = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Realtime plot update was not delivered")), 12000);
    resolveRealtime = (payload) => {
      clearTimeout(timeout);
      resolve(payload);
    };
  });
  const channel = affiliateClient
    .channel(`phase2-hosted-test-${Date.now()}`)
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "plots",
      filter: `project_id=eq.${project.id}`,
    }, (payload) => {
      if (payload.new.id === availablePlots[1].id) resolveRealtime(payload);
  });
  await waitForSubscription(channel);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const { error: realtimeHoldError } = await adminClient.rpc("acquire_plot_hold", {
    requested_plot_id: availablePlots[1].id,
  });
  assert.equal(realtimeHoldError, null);
  const payload = await realtimeEvent;
  assert.equal(payload.new.status, "token_hold");
  await adminClient.rpc("release_plot_hold", { requested_plot_id: availablePlots[1].id });
  await affiliateClient.removeChannel(channel);

  const { data: anonymousProjects, error: anonymousProjectsError } = await anonymous
    .from("real_estate_projects")
    .select("id");
  assert.ok(anonymousProjectsError || anonymousProjects.length === 0);

  await Promise.all([
    affiliateClient.auth.signOut({ scope: "local" }),
    adminClient.auth.signOut({ scope: "local" }),
  ]);
  affiliateClient.realtime.disconnect();
  adminClient.realtime.disconnect();

  process.stdout.write("Hosted Supabase Phase 1, Phase 2, and Phase 3 access verification passed.\n");
}

main().catch((error) => {
  process.stderr.write(`Hosted Supabase verification failed: ${error.message}\n`);
  process.exitCode = 1;
});
