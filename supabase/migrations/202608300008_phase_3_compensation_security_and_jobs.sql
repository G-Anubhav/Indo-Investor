begin;

create or replace function public.admin_configure_payment_plan(
 target_plan_id uuid, requested_annual_rate numeric, requested_minimum_down_rate numeric, requested_active boolean
) returns boolean language plpgsql security definer set search_path='' as $$
begin
 if not public.is_executive(auth.uid()) then raise exception using errcode='42501',message='executive_required'; end if;
 if requested_annual_rate not between 0 and 1 or requested_minimum_down_rate not between 0 and 1 then raise exception using errcode='22023',message='invalid_plan_configuration'; end if;
 if requested_active then update public.payment_plan_definitions set active=false where code=(select code from public.payment_plan_definitions where id=target_plan_id); end if;
 update public.payment_plan_definitions set annual_rate=requested_annual_rate,minimum_down_payment_rate=requested_minimum_down_rate,configured=true,active=requested_active where id=target_plan_id;
 if not found then raise exception using errcode='P0002',message='payment_plan_not_found'; end if; return true;
end; $$;

create or replace function public.admin_create_compensation_rule(
 requested_kind public.compensation_rule_kind, requested_name text, requested_parameters jsonb,
 requested_effective_from timestamptz, requested_active boolean
) returns uuid language plpgsql security definer set search_path='' as $$
declare created_id uuid; next_version integer;
begin
 if not public.is_executive(auth.uid()) then raise exception using errcode='42501',message='executive_required'; end if;
 if jsonb_typeof(requested_parameters)<>'object' then raise exception using errcode='22023',message='invalid_rule_parameters'; end if;
 if requested_kind='direct_referral' and not (requested_parameters ? 'rate') then raise exception using errcode='22023',message='direct_rate_required'; end if;
 if requested_kind='binary_matching' and not (requested_parameters ?& array['left_ratio','right_ratio','rate','cycle']) then raise exception using errcode='22023',message='binary_parameters_required'; end if;
 if requested_kind='monthly_incentive' and not (requested_parameters ?& array['volume_threshold','consecutive_months','amount']) then raise exception using errcode='22023',message='incentive_parameters_required'; end if;
 perform pg_advisory_xact_lock(hashtext('compensation-rule:'||requested_kind::text));
 select coalesce(max(version),0)+1 into next_version from public.compensation_rules where kind=requested_kind;
 if requested_active then update public.compensation_rules set active=false,effective_to=coalesce(effective_to,requested_effective_from) where kind=requested_kind and active; end if;
 insert into public.compensation_rules(kind,version,name,parameters,configured,active,effective_from,created_by)
 values(requested_kind,next_version,trim(requested_name),requested_parameters,true,requested_active,requested_effective_from,auth.uid()) returning id into created_id;
 return created_id;
end; $$;

create or replace function public.admin_property_wallet_topup(
 target_user_id uuid, requested_amount numeric, requested_reference text, requested_idempotency_key text
) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); clearing_account uuid; wallet_account uuid; journal_id uuid;
begin
 if not public.is_executive(actor) then raise exception using errcode='42501',message='executive_required'; end if;
 if requested_amount<=0 or char_length(trim(requested_reference))<2 then raise exception using errcode='22023',message='invalid_topup'; end if;
 select id into clearing_account from public.financial_accounts where code='PLATFORM:PROPERTY_WALLET_TOPUP_CLEARING';
 select a.id into wallet_account from public.wallets w join public.financial_accounts a on a.wallet_id=w.id where w.user_id=target_user_id and w.kind='property_installment' for update of w;
 if wallet_account is null then raise exception using errcode='P0002',message='wallet_not_found'; end if;
 journal_id:=public.create_balanced_journal('property_wallet_topup','Approved manual property wallet top-up','profile',target_user_id,'manual',actor,requested_idempotency_key,clearing_account,wallet_account,requested_amount);
 insert into public.security_audit_log(actor_user_id,target_user_id,action,source,details) values(actor,target_user_id,'financial.property_wallet_topup','database',jsonb_build_object('journal_id',journal_id,'reference',trim(requested_reference)));
 return journal_id;
end; $$;

create or replace function public.run_binary_compensation_cycle(
 requested_cycle_key text, requested_starts_at timestamptz, requested_ends_at timestamptz
) returns uuid language plpgsql security definer set search_path='' as $$
declare rule_row public.compensation_rules%rowtype; cycle_id uuid; member record; prior record;
 left_ratio numeric; right_ratio numeric; rate_value numeric; payout_cap numeric; minimum_volume numeric;
 total_left numeric; total_right numeric; match_units numeric; matched_left numeric; matched_right numeric; payout numeric; result_id uuid; journal_id uuid;
begin
 if requested_ends_at<=requested_starts_at then raise exception using errcode='22023',message='invalid_cycle_range'; end if;
 perform pg_advisory_xact_lock(hashtext('binary-cycle:'||requested_cycle_key));
 select id into cycle_id from public.binary_compensation_cycles where cycle_key=requested_cycle_key; if cycle_id is not null then return cycle_id; end if;
 select * into rule_row from public.compensation_rules where kind='binary_matching' and configured and active and coalesce(effective_from,'-infinity')<=requested_ends_at and coalesce(effective_to,'infinity')>requested_starts_at order by version desc limit 1;
 if not found then raise exception using errcode='55000',message='binary_rule_not_configured'; end if;
 left_ratio:=(rule_row.parameters->>'left_ratio')::numeric; right_ratio:=(rule_row.parameters->>'right_ratio')::numeric; rate_value:=(rule_row.parameters->>'rate')::numeric;
 payout_cap:=coalesce((rule_row.parameters->>'payout_cap')::numeric,999999999999.99); minimum_volume:=coalesce((rule_row.parameters->>'minimum_volume')::numeric,0);
 if left_ratio<=0 or right_ratio<=0 or rate_value<0 or rate_value>1 or payout_cap<0 or minimum_volume<0 then raise exception using errcode='22023',message='invalid_binary_rule'; end if;
 insert into public.binary_compensation_cycles(cycle_key,starts_at,ends_at,rule_id,rule_version) values(requested_cycle_key,requested_starts_at,requested_ends_at,rule_row.id,rule_row.version) returning id into cycle_id;
 for member in select distinct beneficiary_user_id user_id from public.business_volume_events where effective_at<requested_ends_at loop
   select closing_left,closing_right into prior from public.binary_compensation_results where user_id=member.user_id order by created_at desc limit 1;
   select coalesce(sum(volume) filter(where network_side='left'),0),coalesce(sum(volume) filter(where network_side='right'),0) into total_left,total_right from public.business_volume_events where beneficiary_user_id=member.user_id and effective_at>=requested_starts_at and effective_at<requested_ends_at;
   total_left:=coalesce(prior.closing_left,0)+total_left; total_right:=coalesce(prior.closing_right,0)+total_right;
   match_units:=case when least(total_left,total_right)<minimum_volume then 0 else least(total_left/left_ratio,total_right/right_ratio) end;
   matched_left:=round(match_units*left_ratio,2); matched_right:=round(match_units*right_ratio,2); payout:=least(round(match_units*rate_value,2),payout_cap);
   insert into public.binary_compensation_results(cycle_id,user_id,opening_left,opening_right,new_left,new_right,matched_left,matched_right,commission_rate,commission_amount,closing_left,closing_right,calculation_inputs,status)
   values(cycle_id,member.user_id,coalesce(prior.closing_left,0),coalesce(prior.closing_right,0),total_left-coalesce(prior.closing_left,0),total_right-coalesce(prior.closing_right,0),matched_left,matched_right,rate_value,payout,total_left-matched_left,total_right-matched_right,jsonb_build_object('left_ratio',left_ratio,'right_ratio',right_ratio,'rate',rate_value,'cap',payout_cap,'minimum',minimum_volume),case when payout>0 then 'pending'::public.compensation_status else 'skipped'::public.compensation_status end) returning id into result_id;
   if payout>0 then journal_id:=public.create_wallet_credit(member.user_id,'main_cash','PLATFORM:BINARY_COMMISSION_EXPENSE',payout,'binary_commission','binary_result',result_id,'binary-result:'||result_id,null,'worker'); update public.binary_compensation_results set journal_id=journal_id,status='credited' where id=result_id; end if;
 end loop;
 update public.binary_compensation_cycles set status='completed',completed_at=now() where id=cycle_id; return cycle_id;
exception when others then
 if cycle_id is not null then update public.binary_compensation_cycles set status='failed',completed_at=now() where id=cycle_id; end if; raise;
end; $$;

create or replace function public.run_monthly_incentives(requested_period_start date)
returns integer language plpgsql security definer set search_path='' as $$
declare rule_row public.compensation_rules%rowtype; member record; threshold numeric; required_months integer; award numeric; qualifying_count integer; inserted_count integer:=0; result_id uuid; journal_id uuid;
begin
 if requested_period_start<>date_trunc('month',requested_period_start)::date then raise exception using errcode='22023',message='period_must_start_month'; end if;
 perform pg_advisory_xact_lock(hashtext('monthly-incentive:'||requested_period_start::text));
 select * into rule_row from public.compensation_rules where kind='monthly_incentive' and configured and active and coalesce(effective_from,'-infinity')<requested_period_start+interval '1 month' and coalesce(effective_to,'infinity')>requested_period_start order by version desc limit 1;
 if not found then raise exception using errcode='55000',message='incentive_rule_not_configured'; end if;
 threshold:=(rule_row.parameters->>'volume_threshold')::numeric; required_months:=(rule_row.parameters->>'consecutive_months')::integer; award:=(rule_row.parameters->>'amount')::numeric;
 if threshold<=0 or required_months<=0 or award<0 then raise exception using errcode='22023',message='invalid_incentive_rule'; end if;
 for member in select beneficiary_user_id user_id,sum(volume) volume from public.business_volume_events where effective_at>=requested_period_start and effective_at<requested_period_start+interval '1 month' group by beneficiary_user_id loop
   select count(*) into qualifying_count from public.monthly_incentive_results where user_id=member.user_id and period_start<requested_period_start and period_start>=requested_period_start-make_interval(months=>required_months-1) and qualifying_volume>=threshold;
   insert into public.monthly_incentive_results(user_id,period_start,rule_id,rule_version,qualifying_volume,consecutive_months,amount,calculation_inputs,status)
   values(member.user_id,requested_period_start,rule_row.id,rule_row.version,member.volume,case when member.volume>=threshold then qualifying_count+1 else 0 end,case when member.volume>=threshold and qualifying_count+1>=required_months then award else 0 end,jsonb_build_object('threshold',threshold,'required_months',required_months,'configured_amount',award),case when member.volume>=threshold and qualifying_count+1>=required_months and award>0 then 'pending'::public.compensation_status else 'skipped'::public.compensation_status end)
   on conflict(user_id,period_start,rule_id) do nothing returning id into result_id;
   if result_id is not null then inserted_count:=inserted_count+1; if member.volume>=threshold and qualifying_count+1>=required_months and award>0 then journal_id:=public.create_wallet_credit(member.user_id,'property_installment','PLATFORM:INCENTIVE_EXPENSE',award,'monthly_incentive','incentive_result',result_id,'monthly-incentive:'||result_id,null,'worker'); update public.monthly_incentive_results set journal_id=journal_id,status='credited' where id=result_id; end if; end if;
   result_id:=null;
 end loop; return inserted_count;
end; $$;

create or replace function public.run_phase3_daily_workers(target_date date default current_date)
returns uuid language plpgsql security definer set search_path='' as $$
declare run_id uuid; run_key text:=target_date::text; reminders integer; reconciliation_id uuid;
begin
 perform pg_advisory_xact_lock(hashtext('phase3-daily:'||run_key));
 select id into run_id from public.financial_worker_runs where job_name='phase3_daily' and financial_worker_runs.run_key=run_phase3_daily_workers.run_key;
 if run_id is not null then return run_id; end if;
 insert into public.financial_worker_runs(job_name,run_key,status) values('phase3_daily',run_key,'running') returning id into run_id;
 reminders:=public.generate_installment_reminders(target_date); reconciliation_id:=public.run_financial_reconciliation('daily:'||run_key);
 update public.financial_worker_runs set status='completed',completed_at=now(),details=jsonb_build_object('reminders',reminders,'reconciliation_id',reconciliation_id) where id=run_id; return run_id;
exception when others then if run_id is not null then update public.financial_worker_runs set status='failed',completed_at=now(),details=jsonb_build_object('error','worker_failed') where id=run_id; end if; raise;
end; $$;

-- Every financial table is force-RLS and browser roles receive read-only grants.
do $$ declare table_name text; begin
 foreach table_name in array array['payment_methods','payment_plan_definitions','property_purchases','installments','manual_payments','payment_allocations','wallets','financial_accounts','financial_journals','financial_entries','compensation_rules','direct_commissions','business_volume_events','binary_compensation_cycles','binary_compensation_results','monthly_incentive_results','notifications','financial_worker_runs','financial_reconciliation_runs'] loop
   execute format('alter table public.%I enable row level security',table_name);
   execute format('alter table public.%I force row level security',table_name);
   execute format('revoke all on table public.%I from public, anon, authenticated',table_name);
   execute format('grant select on table public.%I to authenticated',table_name);
 end loop;
end $$;

create policy payment_methods_read on public.payment_methods for select to authenticated using(active or public.is_executive());
create policy payment_plans_read on public.payment_plan_definitions for select to authenticated using((active and configured) or public.is_executive());
create policy purchases_own_or_executive on public.property_purchases for select to authenticated using(user_id=auth.uid() or public.is_executive());
create policy installments_own_or_executive on public.installments for select to authenticated using(public.is_executive() or exists(select 1 from public.property_purchases p where p.id=purchase_id and p.user_id=auth.uid()));
create policy payments_own_or_executive on public.manual_payments for select to authenticated using(user_id=auth.uid() or public.is_executive());
create policy allocations_own_or_executive on public.payment_allocations for select to authenticated using(public.is_executive() or exists(select 1 from public.manual_payments p where p.id=payment_id and p.user_id=auth.uid()));
create policy wallets_own_or_executive on public.wallets for select to authenticated using(user_id=auth.uid() or public.is_executive());
create policy accounts_wallet_or_executive on public.financial_accounts for select to authenticated using(public.is_executive() or exists(select 1 from public.wallets w where w.id=wallet_id and w.user_id=auth.uid()));
create policy journals_wallet_or_executive on public.financial_journals for select to authenticated using(public.is_executive() or exists(select 1 from public.financial_entries e join public.financial_accounts a on a.id=e.account_id join public.wallets w on w.id=a.wallet_id where e.journal_id=public.financial_journals.id and w.user_id=auth.uid()));
create policy entries_wallet_or_executive on public.financial_entries for select to authenticated using(public.is_executive() or exists(select 1 from public.financial_accounts a join public.wallets w on w.id=a.wallet_id where a.id=public.financial_entries.account_id and w.user_id=auth.uid()));
create policy rules_active_or_executive on public.compensation_rules for select to authenticated using((active and configured) or public.is_executive());
create policy direct_commissions_own_or_executive on public.direct_commissions for select to authenticated using(beneficiary_user_id=auth.uid() or public.is_executive());
create policy volume_own_or_executive on public.business_volume_events for select to authenticated using(beneficiary_user_id=auth.uid() or public.is_executive());
create policy binary_cycles_authenticated on public.binary_compensation_cycles for select to authenticated using(true);
create policy binary_results_own_or_executive on public.binary_compensation_results for select to authenticated using(user_id=auth.uid() or public.is_executive());
create policy incentives_own_or_executive on public.monthly_incentive_results for select to authenticated using(user_id=auth.uid() or public.is_executive());
create policy notifications_own_or_executive on public.notifications for select to authenticated using(recipient_user_id=auth.uid() or public.is_executive());
create policy worker_runs_executive on public.financial_worker_runs for select to authenticated using(public.is_executive());
create policy reconciliation_executive on public.financial_reconciliation_runs for select to authenticated using(public.is_executive());

revoke all on function public.wallet_balance(uuid) from public,anon;
grant execute on function public.wallet_balance(uuid) to authenticated,service_role;
revoke all on function public.admin_create_property_purchase(uuid,uuid,uuid,numeric,numeric,numeric,date,text) from public,anon;
grant execute on function public.admin_create_property_purchase(uuid,uuid,uuid,numeric,numeric,numeric,date,text) to authenticated,service_role;
revoke all on function public.admin_record_manual_payment(uuid,uuid,uuid,numeric,text,text,date,text,text) from public,anon;
grant execute on function public.admin_record_manual_payment(uuid,uuid,uuid,numeric,text,text,date,text,text) to authenticated,service_role;
revoke all on function public.admin_verify_manual_payment(uuid) from public,anon;
grant execute on function public.admin_verify_manual_payment(uuid) to authenticated,service_role;
revoke all on function public.admin_reject_manual_payment(uuid,text) from public,anon;
grant execute on function public.admin_reject_manual_payment(uuid,text) to authenticated,service_role;
revoke all on function public.admin_reverse_manual_payment(uuid,text) from public,anon;
grant execute on function public.admin_reverse_manual_payment(uuid,text) to authenticated,service_role;
revoke all on function public.pay_installment_from_wallet(uuid,public.wallet_kind,numeric,text) from public,anon;
grant execute on function public.pay_installment_from_wallet(uuid,public.wallet_kind,numeric,text) to authenticated,service_role;
revoke all on function public.admin_configure_payment_plan(uuid,numeric,numeric,boolean) from public,anon;
grant execute on function public.admin_configure_payment_plan(uuid,numeric,numeric,boolean) to authenticated,service_role;
revoke all on function public.admin_create_compensation_rule(public.compensation_rule_kind,text,jsonb,timestamptz,boolean) from public,anon;
grant execute on function public.admin_create_compensation_rule(public.compensation_rule_kind,text,jsonb,timestamptz,boolean) to authenticated,service_role;
revoke all on function public.admin_property_wallet_topup(uuid,numeric,text,text) from public,anon;
grant execute on function public.admin_property_wallet_topup(uuid,numeric,text,text) to authenticated,service_role;
revoke all on function public.run_binary_compensation_cycle(text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.run_binary_compensation_cycle(text,timestamptz,timestamptz) to service_role;
revoke all on function public.run_monthly_incentives(date) from public,anon,authenticated;
grant execute on function public.run_monthly_incentives(date) to service_role;
revoke all on function public.run_phase3_daily_workers(date) from public,anon,authenticated;
grant execute on function public.run_phase3_daily_workers(date) to service_role;
revoke all on function public.run_financial_reconciliation(text) from public,anon,authenticated;
grant execute on function public.run_financial_reconciliation(text) to service_role;
revoke all on function public.generate_installment_reminders(date) from public,anon,authenticated;
grant execute on function public.generate_installment_reminders(date) to service_role;
revoke all on function public.create_balanced_journal(text,text,text,uuid,public.financial_origin,uuid,text,uuid,uuid,numeric,uuid) from public,anon,authenticated;
revoke all on function public.create_wallet_credit(uuid,public.wallet_kind,text,numeric,text,text,uuid,text,uuid,public.financial_origin) from public,anon,authenticated;
revoke all on function public.issue_direct_commission(uuid) from public,anon,authenticated;

do $$ begin
 if not exists(select 1 from cron.job where jobname='phase3-daily-financial-maintenance') then
  perform cron.schedule('phase3-daily-financial-maintenance','15 0 * * *','select public.run_phase3_daily_workers(current_date);');
 end if;
end $$;

commit;
