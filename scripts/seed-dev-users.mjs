import { createClient } from "@supabase/supabase-js";
import { validateSeedEnvironment } from "./seed-guard.mjs";

async function findUserByEmail(supabase, email) {
  let page = 1;
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email === email);
    if (user) return user;
    if (data.users.length < 100) return null;
    page += 1;
  }
  return null;
}

async function ensureUser(supabase, account) {
  let user = await findUserByEmail(supabase, account.email);

  if (!user) {
    if (account.allowNetworkRoot) {
      const requestedAt = new Date();
      const expiresAt = new Date(requestedAt.getTime() + (10 * 60 * 1000));
      const { error: requestError } = await supabase
        .from("network_root_creation_requests")
        .upsert({
          email: account.email.toLowerCase(),
          requested_at: requestedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        }, { onConflict: "email" });
      if (requestError) throw requestError;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.fullName,
        language_code: "en",
        ...(account.sponsorCode ? {
          sponsor_code: account.sponsorCode,
          target_leg: account.targetLeg,
        } : {}),
      },
      app_metadata: account.allowNetworkRoot ? { allow_network_root: true } : {},
    });
    if (error) {
      if (account.allowNetworkRoot) {
        await supabase
          .from("network_root_creation_requests")
          .delete()
          .eq("email", account.email.toLowerCase());
      }
      throw error;
    }
    user = data.user;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role_key: account.role })
    .eq("user_id", user.id);
  if (profileError) throw profileError;

  return user.id;
}

async function getNetworkNode(supabase, userId) {
  const { data, error } = await supabase
    .from("network_nodes")
    .select("user_id, member_code")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

function demoEmail(label, baseEmail) {
  return `${label}-${baseEmail}`;
}

async function seedProject(supabase, users) {
  const { data: project, error: projectError } = await supabase
    .from("real_estate_projects")
    .upsert({
      name: "PHASE 2 DEVELOPMENT ESTATE",
      slug: "phase-2-development-estate",
      description: "Development-only inventory used to verify the Phase 2 plot grid and hold lifecycle.",
      status: "active",
      location_name: "DEVELOPMENT DATA - NOT A REAL PROJECT",
      metadata: { development_seed: true, grid_columns: 6 },
    }, { onConflict: "slug" })
    .select("id")
    .single();
  if (projectError) throw projectError;

  const { data: existingPlots, error: existingError } = await supabase
    .from("plots")
    .select("id")
    .eq("project_id", project.id);
  if (existingError) throw existingError;
  if (existingPlots.length > 0) {
    const { error: deleteError } = await supabase
      .from("plot_holds")
      .delete()
      .in("plot_id", existingPlots.map((plot) => plot.id));
    if (deleteError) throw deleteError;
  }

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + (48 * 60 * 60 * 1000));
  const plots = Array.from({ length: 24 }, (_, index) => {
    const plotNumber = String(index + 1).padStart(2, "0");
    const base = {
      project_id: project.id,
      plot_number: plotNumber,
      grid_row: Math.floor(index / 6) + 1,
      grid_column: (index % 6) + 1,
      area_sq_yd: 120 + ((index % 3) * 30),
      dimensions: index % 2 === 0 ? "30 ft x 40 ft" : "30 ft x 50 ft",
      price: 3000000 + (index * 50000),
      status: "available",
      held_by_user_id: null,
      hold_expires_at: null,
      booked_by_user_id: null,
      booked_at: null,
    };
    if (index === 1) return { ...base, status: "token_hold", held_by_user_id: users.affiliate, hold_expires_at: expiresAt.toISOString() };
    if (index === 2) return { ...base, status: "sold", booked_by_user_id: users.left, booked_at: createdAt.toISOString() };
    return base;
  });

  const { data: seededPlots, error: plotsError } = await supabase
    .from("plots")
    .upsert(plots, { onConflict: "project_id,plot_number" })
    .select("id, plot_number");
  if (plotsError) throw plotsError;

  const heldPlot = seededPlots.find((plot) => plot.plot_number === "02");
  const { error: holdError } = await supabase.from("plot_holds").insert({
    plot_id: heldPlot.id,
    user_id: users.affiliate,
    status: "active",
    created_at: createdAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  });
  if (holdError) throw holdError;
}

async function seedPhase3(supabase, users) {
  const { data: project, error: projectError } = await supabase
    .from("real_estate_projects")
    .upsert({
      name: "PHASE 3 FINANCIAL DEMO ESTATE",
      slug: "phase-3-financial-demo-estate",
      description: "DEVELOPMENT ONLY - manual payments, wallets, and compensation verification.",
      status: "active",
      location_name: "DEVELOPMENT DATA - NOT A REAL PROJECT",
      metadata: { development_seed: true, phase: 3 },
    }, { onConflict: "slug" })
    .select("id")
    .single();
  if (projectError) throw projectError;

  const plotRows = [
    { project_id: project.id, plot_number: "DEV-L", grid_row: 1, grid_column: 1, area_sq_yd: 100, price: 3000000 },
    { project_id: project.id, plot_number: "DEV-R", grid_row: 1, grid_column: 2, area_sq_yd: 100, price: 3000000 },
  ];
  const { error: plotInsertError } = await supabase.from("plots").upsert(plotRows, { onConflict: "project_id,plot_number", ignoreDuplicates: true });
  if (plotInsertError) throw plotInsertError;
  const { data: plots, error: plotsError } = await supabase.from("plots").select("id,plot_number").eq("project_id", project.id).in("plot_number", ["DEV-L", "DEV-R"]);
  if (plotsError) throw plotsError;

  const { data: plan, error: planError } = await supabase.from("payment_plan_definitions").update({ annual_rate: 0, minimum_down_payment_rate: 0.1, configured: true, active: true }).eq("code", "term_12").select("id").single();
  if (planError) throw planError;
  await supabase.from("payment_plan_definitions").update({ active: false }).in("code", ["term_24", "term_36"]);

  const rules = [
    { id: "63000000-0000-0000-0000-000000000001", kind: "direct_referral", version: 1, name: "DEVELOPMENT ONLY - direct 10%", parameters: { rate: 0.1 } },
    { id: "63000000-0000-0000-0000-000000000002", kind: "binary_matching", version: 1, name: "DEVELOPMENT ONLY - binary demo", parameters: { left_ratio: 1, right_ratio: 1, rate: 0.1, cycle: "demo", payout_cap: 100000, minimum_volume: 1 } },
    { id: "63000000-0000-0000-0000-000000000003", kind: "monthly_incentive", version: 1, name: "DEVELOPMENT ONLY - monthly demo", parameters: { volume_threshold: 500000, consecutive_months: 1, amount: 25000 } },
  ].map((rule) => ({ ...rule, configured: true, active: true, effective_from: "2026-01-01T00:00:00Z", created_by: users.admin }));
  const { error: rulesError } = await supabase.from("compensation_rules").upsert(rules, { onConflict: "kind,version" });
  if (rulesError) throw rulesError;

  const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: loginError } = await adminClient.auth.signInWithPassword({ email: process.env.DEV_SEED_ADMIN_EMAIL, password: process.env.DEV_SEED_ADMIN_PASSWORD });
  if (loginError) throw loginError;

  async function rpc(name, args) {
    const { data, error } = await adminClient.rpc(name, args);
    if (error) throw error;
    return data;
  }

  const buyers = [{ userId: users.left, plotNumber: "DEV-L", suffix: "left" }, { userId: users.right, plotNumber: "DEV-R", suffix: "right" }];
  for (const buyer of buyers) {
    const plot = plots.find((candidate) => candidate.plot_number === buyer.plotNumber);
    const purchaseId = await rpc("admin_create_property_purchase", {
      requested_user_id: buyer.userId, requested_plot_id: plot.id, requested_plan_id: plan.id,
      requested_purchase_amount: 3000000, requested_down_payment: 500000, requested_finance_charge: 0,
      requested_start_date: "2026-08-01", requested_idempotency_key: `phase3-dev-purchase-${buyer.suffix}`,
    });
    const paymentId = await rpc("admin_record_manual_payment", {
      requested_user_id: buyer.userId, requested_purchase_id: purchaseId, requested_installment_id: null,
      requested_amount: 500000, requested_method: "bank_transfer", requested_reference: `DEV-VERIFIED-${buyer.suffix.toUpperCase()}`,
      requested_payment_date: "2026-08-15", requested_notes: "DEVELOPMENT ONLY verified payment", requested_idempotency_key: `phase3-dev-payment-verified-${buyer.suffix}`,
    });
    await rpc("admin_verify_manual_payment", { target_payment_id: paymentId });
  }

  const leftPurchase = await supabase.from("property_purchases").select("id").eq("idempotency_key", "phase3-dev-purchase-left").single();
  for (const sample of [{ suffix: "pending", status: "pending" }, { suffix: "rejected", status: "rejected" }]) {
    const paymentId = await rpc("admin_record_manual_payment", {
      requested_user_id: users.left, requested_purchase_id: leftPurchase.data.id, requested_installment_id: null,
      requested_amount: 100000, requested_method: "upi", requested_reference: `DEV-${sample.suffix.toUpperCase()}`,
      requested_payment_date: "2026-08-20", requested_notes: `DEVELOPMENT ONLY ${sample.suffix} payment`, requested_idempotency_key: `phase3-dev-payment-${sample.suffix}`,
    });
    if (sample.status === "rejected") {
      const existing = await supabase.from("manual_payments").select("status").eq("id", paymentId).single();
      if (existing.data?.status === "pending_verification") await rpc("admin_reject_manual_payment", { target_payment_id: paymentId, reason: "DEVELOPMENT ONLY rejection" });
    }
  }
  await adminClient.auth.signOut({ scope: "local" });

  const { error: binaryError } = await supabase.rpc("run_binary_compensation_cycle", { requested_cycle_key: "phase3-development-2026-08", requested_starts_at: "2026-08-01T00:00:00Z", requested_ends_at: "2026-09-01T00:00:00Z" });
  if (binaryError) throw binaryError;
  const { error: incentiveError } = await supabase.rpc("run_monthly_incentives", { requested_period_start: "2026-08-01" });
  if (incentiveError) throw incentiveError;
  const { error: reconciliationError } = await supabase.rpc("run_financial_reconciliation", { requested_run_key: "phase3-development-seed" });
  if (reconciliationError) throw reconciliationError;
}

async function main() {
  validateSeedEnvironment();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const adminId = await ensureUser(supabase, {
    email: process.env.DEV_SEED_ADMIN_EMAIL,
    password: process.env.DEV_SEED_ADMIN_PASSWORD,
    fullName: "HOSTED DEVELOPMENT TEST ADMIN",
    role: "admin",
    allowNetworkRoot: true,
  });
  const affiliateId = await ensureUser(supabase, {
    email: process.env.DEV_SEED_AFFILIATE_EMAIL,
    password: process.env.DEV_SEED_AFFILIATE_PASSWORD,
    fullName: "HOSTED DEVELOPMENT TEST AFFILIATE",
    role: "affiliate",
    allowNetworkRoot: true,
  });

  const affiliateNode = await getNetworkNode(supabase, affiliateId);
  const childPassword = process.env.DEV_SEED_AFFILIATE_PASSWORD;
  const leftId = await ensureUser(supabase, {
    email: demoEmail("phase2-left", process.env.DEV_SEED_AFFILIATE_EMAIL),
    password: childPassword,
    fullName: "PHASE 2 DEVELOPMENT LEFT MEMBER",
    role: "affiliate",
    sponsorCode: affiliateNode.member_code,
    targetLeg: "left",
  });
  const rightId = await ensureUser(supabase, {
    email: demoEmail("phase2-right", process.env.DEV_SEED_AFFILIATE_EMAIL),
    password: childPassword,
    fullName: "PHASE 2 DEVELOPMENT RIGHT MEMBER",
    role: "affiliate",
    sponsorCode: affiliateNode.member_code,
    targetLeg: "right",
  });
  const leftNode = await getNetworkNode(supabase, leftId);
  await ensureUser(supabase, {
    email: demoEmail("phase2-left-left", process.env.DEV_SEED_AFFILIATE_EMAIL),
    password: childPassword,
    fullName: "PHASE 2 DEVELOPMENT LEVEL THREE MEMBER",
    role: "affiliate",
    sponsorCode: leftNode.member_code,
    targetLeg: "left",
  });
  await ensureUser(supabase, {
    email: demoEmail("phase2-left-right", process.env.DEV_SEED_AFFILIATE_EMAIL),
    password: childPassword,
    fullName: "PHASE 2 DEVELOPMENT LEVEL THREE REFERRAL",
    role: "affiliate",
    sponsorCode: leftNode.member_code,
    targetLeg: "right",
  });

  const users = { admin: adminId, affiliate: affiliateId, left: leftId, right: rightId };
  await seedProject(supabase, users);
  await seedPhase3(supabase, users);

  process.stdout.write(
    `Phase 1 accounts, Phase 2 network/inventory, and Phase 3 financial demo data are ready in project ${process.env.SUPABASE_PROJECT_REF}.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`Development seed failed: ${error.message}\n`);
  process.exitCode = 1;
});
