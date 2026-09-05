import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loadWallets(userId) {
  const supabase = await createServerSupabaseClient();
  const { data: wallets, error } = await supabase.from("wallets").select("id,kind,currency,created_at").eq("user_id", userId).order("kind");
  if (error) return { wallets: [], transactions: [], error: "wallet_error" };
  const enriched = await Promise.all((wallets || []).map(async (wallet) => {
    const { data } = await supabase.rpc("wallet_balance", { target_wallet_id: wallet.id });
    return { ...wallet, balance: data || 0 };
  }));
  const walletIds = enriched.map((wallet) => wallet.id);
  if (!walletIds.length) return { wallets: enriched, transactions: [], error: null };
  const { data: accounts } = await supabase.from("financial_accounts").select("id,wallet_id").in("wallet_id", walletIds);
  const accountIds = (accounts || []).map((account) => account.id);
  const { data: entries } = accountIds.length ? await supabase.from("financial_entries").select("id,account_id,debit,credit,memo,created_at,financial_journals!inner(id,transaction_type,description,posted_at,status)").in("account_id", accountIds).order("created_at", { ascending: false }).limit(50) : { data: [] };
  return { wallets: enriched, transactions: entries || [], error: null };
}

export async function loadEarnings(userId) {
  const supabase = await createServerSupabaseClient();
  const [direct, binary, incentives] = await Promise.all([
    supabase.from("direct_commissions").select("id,qualifying_amount,rate,amount,status,rule_version,created_at").eq("beneficiary_user_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("binary_compensation_results").select("id,commission_amount,status,opening_left,opening_right,new_left,new_right,matched_left,matched_right,closing_left,closing_right,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("monthly_incentive_results").select("id,period_start,qualifying_volume,consecutive_months,amount,status,created_at").eq("user_id", userId).order("period_start", { ascending: false }).limit(50),
  ]);
  return { direct: direct.data || [], binary: binary.data || [], incentives: incentives.data || [], error: direct.error || binary.error || incentives.error ? "earnings_error" : null };
}

export async function loadPropertyPayments(userId) {
  const supabase = await createServerSupabaseClient();
  const { data: purchases, error } = await supabase.from("property_purchases").select("id,status,purchase_amount,down_payment_amount,finance_charge,total_payable,start_date,real_estate_projects(name),plots(plot_number)").eq("user_id", userId).order("created_at", { ascending: false });
  const ids = (purchases || []).map((purchase) => purchase.id);
  const { data: installments } = ids.length ? await supabase.from("installments").select("id,purchase_id,installment_number,due_date,total_due,amount_paid,status").in("purchase_id", ids).order("due_date") : { data: [] };
  const { data: payments } = ids.length ? await supabase.from("manual_payments").select("id,purchase_id,amount,payment_date,payment_method_code,manual_reference,status,created_at").in("purchase_id", ids).order("created_at", { ascending: false }) : { data: [] };
  return { purchases: purchases || [], installments: installments || [], payments: payments || [], error: error ? "payments_error" : null };
}

export async function loadFinancialAdmin() {
  const supabase = await createServerSupabaseClient();
  const [payments, purchases, installments, profiles, methods, rules, reconciliations, workers] = await Promise.all([
    supabase.from("manual_payments").select("id,user_id,purchase_id,amount,payment_date,payment_method_code,manual_reference,status,entered_by,verified_by,created_at,profiles!manual_payments_user_id_fkey(display_name,email)").order("created_at", { ascending: false }).limit(100),
    supabase.from("property_purchases").select("id,user_id,total_payable,status,real_estate_projects(name),plots(plot_number)").eq("status", "active").order("created_at", { ascending: false }),
    supabase.from("installments").select("id,purchase_id,installment_number,due_date,total_due,amount_paid,status").neq("status", "paid").order("due_date").limit(500),
    supabase.from("profiles").select("user_id,display_name,email").eq("status", "active").order("display_name"),
    supabase.from("payment_methods").select("code,display_name").eq("active", true).order("sort_order"),
    supabase.from("compensation_rules").select("id,kind,version,name,configured,active,effective_from").order("created_at", { ascending: false }),
    supabase.from("financial_reconciliation_runs").select("id,run_key,status,totals,findings,created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("financial_worker_runs").select("id,job_name,run_key,status,details,started_at,completed_at").order("started_at", { ascending: false }).limit(20),
  ]);
  return { payments: payments.data || [], purchases: purchases.data || [], installments: installments.data || [], profiles: profiles.data || [], methods: methods.data || [], rules: rules.data || [], reconciliations: reconciliations.data || [], workers: workers.data || [], error: payments.error || purchases.error || installments.error || profiles.error ? "admin_financial_error" : null };
}
