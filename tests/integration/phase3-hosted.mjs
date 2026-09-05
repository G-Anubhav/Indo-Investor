import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY","SUPABASE_ENVIRONMENT","DEV_SEED_ADMIN_EMAIL","DEV_SEED_ADMIN_PASSWORD","DEV_SEED_AFFILIATE_EMAIL","DEV_SEED_AFFILIATE_PASSWORD"];
assert.deepEqual(required.filter((key)=>!process.env[key]),[]);
assert.equal(process.env.SUPABASE_ENVIRONMENT,"development");
const options={auth:{persistSession:false,autoRefreshToken:false}};
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,options);
const affiliate=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,options);
const service=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,options);

async function main(){
 const adminLogin=await admin.auth.signInWithPassword({email:process.env.DEV_SEED_ADMIN_EMAIL,password:process.env.DEV_SEED_ADMIN_PASSWORD});assert.equal(adminLogin.error,null);
 const childEmail=`phase2-left-${process.env.DEV_SEED_AFFILIATE_EMAIL}`;
 const affiliateLogin=await affiliate.auth.signInWithPassword({email:childEmail,password:process.env.DEV_SEED_AFFILIATE_PASSWORD});assert.equal(affiliateLogin.error,null);
 const userId=affiliateLogin.data.user.id;
 const purchaseQuery=await affiliate.from("property_purchases").select("id").eq("status","active").limit(1).single();assert.equal(purchaseQuery.error,null);
 const purchaseId=purchaseQuery.data.id;
 const runKey=`phase3-hosted-${Date.now()}`;
 const recorded=await admin.rpc("admin_record_manual_payment",{requested_user_id:userId,requested_purchase_id:purchaseId,requested_installment_id:null,requested_amount:1000,requested_method:"bank_transfer",requested_reference:runKey,requested_payment_date:new Date().toISOString().slice(0,10),requested_notes:"Hosted concurrency verification",requested_idempotency_key:`${runKey}:payment`});assert.equal(recorded.error,null);
 const paymentId=recorded.data;
 const verificationAttempts=await Promise.all([admin.rpc("admin_verify_manual_payment",{target_payment_id:paymentId}),admin.rpc("admin_verify_manual_payment",{target_payment_id:paymentId})]);
 assert.ok(verificationAttempts.every(({error})=>!error),"Concurrent verification retries should both resolve safely");
 const allocations=await service.from("payment_allocations").select("id,amount").eq("payment_id",paymentId);assert.equal(allocations.error,null);assert.equal(allocations.data.reduce((sum,row)=>sum+Number(row.amount),0),1000);
 const journals=await service.from("financial_journals").select("id").eq("reference_type","manual_payment").eq("reference_id",paymentId);assert.equal(journals.error,null);assert.equal(journals.data.length,1);

 const wallet=await affiliate.from("wallets").select("id").eq("kind","property_installment").single();assert.equal(wallet.error,null);
 const balanceBefore=await affiliate.rpc("wallet_balance",{target_wallet_id:wallet.data.id});assert.equal(balanceBefore.error,null);
 const topup=await admin.rpc("admin_property_wallet_topup",{target_user_id:userId,requested_amount:100000,requested_reference:runKey,requested_idempotency_key:`${runKey}:topup`});assert.equal(topup.error,null);
 const installment=await affiliate.from("installments").select("id,total_due,amount_paid").eq("purchase_id",purchaseId).lt("amount_paid",250000).order("installment_number").limit(1).single();assert.equal(installment.error,null);
 const available=Number(balanceBefore.data)+100000;const outstanding=Number(installment.data.total_due)-Number(installment.data.amount_paid);const debit=Math.min(outstanding,Math.floor(available/2)+1);assert.ok(debit>0);
 const debitAttempts=await Promise.all([affiliate.rpc("pay_installment_from_wallet",{target_installment_id:installment.data.id,target_wallet_kind:"property_installment",requested_amount:debit,requested_idempotency_key:`${runKey}:debit-a`}),affiliate.rpc("pay_installment_from_wallet",{target_installment_id:installment.data.id,target_wallet_kind:"property_installment",requested_amount:debit,requested_idempotency_key:`${runKey}:debit-b`})]);
 assert.equal(debitAttempts.filter(({error})=>!error).length,1,"Exactly one concurrent wallet debit should succeed");
 const balanceAfter=await affiliate.rpc("wallet_balance",{target_wallet_id:wallet.data.id});assert.equal(balanceAfter.error,null);assert.equal(Number(balanceAfter.data),available-debit);
 const cycle=await service.from("binary_compensation_cycles").select("id,status").eq("cycle_key","phase3-development-2026-08").single();assert.equal(cycle.error,null);assert.equal(cycle.data.status,"completed");
 const binaryResults=await service.from("binary_compensation_results").select("id,opening_left,opening_right,new_left,new_right,matched_left,matched_right,closing_left,closing_right,commission_amount,status").eq("cycle_id",cycle.data.id);assert.equal(binaryResults.error,null);assert.ok(binaryResults.data.some((row)=>Number(row.matched_left)>0&&Number(row.matched_right)>0&&row.status==="credited"));
 const cycleRetry=await service.rpc("run_binary_compensation_cycle",{requested_cycle_key:"phase3-development-2026-08",requested_starts_at:"2026-08-01T00:00:00Z",requested_ends_at:"2026-09-01T00:00:00Z"});assert.equal(cycleRetry.error,null);assert.equal(cycleRetry.data,cycle.data.id);
 const incentives=await service.from("monthly_incentive_results").select("id,amount,status,rule_version").eq("period_start","2026-08-01");assert.equal(incentives.error,null);assert.ok(incentives.data.some((row)=>row.status==="credited"&&Number(row.amount)>0));
 const reconciliation=await service.from("financial_reconciliation_runs").select("status,findings").eq("run_key","phase3-development-seed").single();assert.equal(reconciliation.error,null);assert.ok(["clean","discrepancy"].includes(reconciliation.data.status));
 const walletEntries=await affiliate.from("financial_entries").select("id,debit,credit,financial_journals!inner(id,transaction_type,status)").limit(5);assert.equal(walletEntries.error,null);assert.ok(walletEntries.data.length>0);
 const adminPayments=await admin.from("manual_payments").select("id,profiles!manual_payments_user_id_fkey(display_name,email)").limit(5);assert.equal(adminPayments.error,null);
 const purchaseRelations=await affiliate.from("property_purchases").select("id,real_estate_projects(name),plots(plot_number)").limit(5);assert.equal(purchaseRelations.error,null);assert.ok(purchaseRelations.data.length>0);
 await Promise.all([admin.auth.signOut({scope:"local"}),affiliate.auth.signOut({scope:"local"})]);
 process.stdout.write("Hosted Phase 3 idempotency and concurrency verification passed.\n");
}
main().catch((error)=>{process.stderr.write(`Hosted Phase 3 verification failed: ${error.message}\n`);process.exitCode=1;});
