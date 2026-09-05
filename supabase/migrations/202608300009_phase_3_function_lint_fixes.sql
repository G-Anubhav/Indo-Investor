begin;

create or replace function public.issue_direct_commission(target_purchase_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare purchase_row public.property_purchases%rowtype; sponsor_id uuid; rule_row public.compensation_rules%rowtype;
 paid_total numeric; rate_value numeric; commission_amount numeric; result_id uuid; posted_journal_id uuid;
begin
 if exists(select 1 from public.direct_commissions where purchase_id=target_purchase_id) then select id into result_id from public.direct_commissions where purchase_id=target_purchase_id; return result_id; end if;
 select * into purchase_row from public.property_purchases where id=target_purchase_id;
 select sponsor_user_id into sponsor_id from public.network_nodes where user_id=purchase_row.user_id;
 if sponsor_id is null then return null; end if;
 select coalesce(sum(pa.amount),0) into paid_total from public.payment_allocations pa join public.installments i on i.id=pa.installment_id where i.purchase_id=target_purchase_id and pa.reversed_at is null;
 if paid_total<purchase_row.down_payment_amount or purchase_row.down_payment_amount<=0 then return null; end if;
 select * into rule_row from public.compensation_rules where kind='direct_referral' and active and configured and coalesce(effective_from,'-infinity')<=now() and coalesce(effective_to,'infinity')>now() order by version desc limit 1;
 if not found then return null; end if;
 rate_value:=(rule_row.parameters->>'rate')::numeric;
 if rate_value<0 or rate_value>1 then raise exception using errcode='22023',message='invalid_direct_rule'; end if;
 commission_amount:=round(purchase_row.down_payment_amount*rate_value,2);
 insert into public.direct_commissions(beneficiary_user_id,referred_user_id,purchase_id,qualifying_amount,rate,amount,rule_id,rule_version,calculation_inputs,status)
 values(sponsor_id,purchase_row.user_id,target_purchase_id,purchase_row.down_payment_amount,rate_value,commission_amount,rule_row.id,rule_row.version,jsonb_build_object('down_payment',purchase_row.down_payment_amount,'rate',rate_value),'pending') returning id into result_id;
 if commission_amount>0 then posted_journal_id:=public.create_wallet_credit(sponsor_id,'main_cash','PLATFORM:DIRECT_COMMISSION_EXPENSE',commission_amount,'direct_referral_commission','direct_commission',result_id,'direct-commission:'||target_purchase_id,null,'system'); end if;
 update public.direct_commissions set journal_id=posted_journal_id,status='credited' where id=result_id;
 return result_id;
end; $$;

create or replace function public.run_binary_compensation_cycle(requested_cycle_key text,requested_starts_at timestamptz,requested_ends_at timestamptz)
returns uuid language plpgsql security definer set search_path='' as $$
declare rule_row public.compensation_rules%rowtype; cycle_id uuid; member record; prior record;
 left_ratio numeric; right_ratio numeric; rate_value numeric; payout_cap numeric; minimum_volume numeric;
 total_left numeric; total_right numeric; match_units numeric; matched_left numeric; matched_right numeric; payout numeric; result_id uuid; posted_journal_id uuid;
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
   if payout>0 then posted_journal_id:=public.create_wallet_credit(member.user_id,'main_cash','PLATFORM:BINARY_COMMISSION_EXPENSE',payout,'binary_commission','binary_result',result_id,'binary-result:'||result_id,null,'worker'); update public.binary_compensation_results set journal_id=posted_journal_id,status='credited' where id=result_id; end if;
 end loop;
 update public.binary_compensation_cycles set status='completed',completed_at=now() where id=cycle_id; return cycle_id;
exception when others then if cycle_id is not null then update public.binary_compensation_cycles set status='failed',completed_at=now() where id=cycle_id; end if; raise;
end; $$;

create or replace function public.run_monthly_incentives(requested_period_start date)
returns integer language plpgsql security definer set search_path='' as $$
declare rule_row public.compensation_rules%rowtype; member record; threshold numeric; required_months integer; award numeric; qualifying_count integer; inserted_count integer:=0; result_id uuid; posted_journal_id uuid;
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
   if result_id is not null then inserted_count:=inserted_count+1; if member.volume>=threshold and qualifying_count+1>=required_months and award>0 then posted_journal_id:=public.create_wallet_credit(member.user_id,'property_installment','PLATFORM:INCENTIVE_EXPENSE',award,'monthly_incentive','incentive_result',result_id,'monthly-incentive:'||result_id,null,'worker'); update public.monthly_incentive_results set journal_id=posted_journal_id,status='credited' where id=result_id; end if; end if;
   result_id:=null;
 end loop; return inserted_count;
end; $$;

create or replace function public.run_phase3_daily_workers(target_date date default current_date)
returns uuid language plpgsql security definer set search_path='' as $$
declare run_id uuid; worker_run_key text:=target_date::text; reminders integer; reconciliation_id uuid;
begin
 perform pg_advisory_xact_lock(hashtext('phase3-daily:'||worker_run_key));
 select w.id into run_id from public.financial_worker_runs w where w.job_name='phase3_daily' and w.run_key=worker_run_key;
 if run_id is not null then return run_id; end if;
 insert into public.financial_worker_runs(job_name,run_key,status) values('phase3_daily',worker_run_key,'running') returning id into run_id;
 reminders:=public.generate_installment_reminders(target_date); reconciliation_id:=public.run_financial_reconciliation('daily:'||worker_run_key);
 update public.financial_worker_runs set status='completed',completed_at=now(),details=jsonb_build_object('reminders',reminders,'reconciliation_id',reconciliation_id) where id=run_id; return run_id;
exception when others then if run_id is not null then update public.financial_worker_runs set status='failed',completed_at=now(),details=jsonb_build_object('error','worker_failed') where id=run_id; end if; raise;
end; $$;

commit;
