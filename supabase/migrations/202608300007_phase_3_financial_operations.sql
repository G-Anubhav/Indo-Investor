begin;

insert into public.financial_accounts (code,name,kind) values
 ('PLATFORM:CASH_CLEARING','Manual payment cash clearing','asset'),
 ('PLATFORM:PROPERTY_RECEIVABLE','Property receivable','asset'),
 ('PLATFORM:DIRECT_COMMISSION_EXPENSE','Direct commission expense','expense'),
 ('PLATFORM:BINARY_COMMISSION_EXPENSE','Binary commission expense','expense'),
 ('PLATFORM:INCENTIVE_EXPENSE','Promotion incentive expense','expense'),
 ('PLATFORM:PROPERTY_WALLET_TOPUP_CLEARING','Property wallet top-up clearing','asset'),
 ('PLATFORM:ADJUSTMENT_CLEARING','Financial adjustment clearing','equity');

create or replace function public.provision_financial_wallets(target_user_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare main_id uuid; property_id uuid;
begin
  insert into public.wallets(user_id,kind) values(target_user_id,'main_cash')
  on conflict(user_id,kind) do update set user_id=excluded.user_id returning id into main_id;
  insert into public.wallets(user_id,kind) values(target_user_id,'property_installment')
  on conflict(user_id,kind) do update set user_id=excluded.user_id returning id into property_id;
  insert into public.financial_accounts(code,name,kind,wallet_id) values
    ('WALLET:MAIN:'||upper(target_user_id::text),'Main Cash Wallet','liability',main_id),
    ('WALLET:PROPERTY:'||upper(target_user_id::text),'Property Installment Wallet','liability',property_id)
  on conflict(code) do nothing;
end; $$;

create or replace function public.initialize_financial_wallets()
returns trigger language plpgsql security definer set search_path='' as $$
begin perform public.provision_financial_wallets(new.user_id); return new; end; $$;

create trigger on_profile_created_initialize_wallets after insert on public.profiles
for each row execute function public.initialize_financial_wallets();

do $$ declare profile_row record; begin
  for profile_row in select user_id from public.profiles loop
    perform public.provision_financial_wallets(profile_row.user_id);
  end loop;
end $$;

create or replace function public.wallet_balance(target_wallet_id uuid)
returns numeric language sql stable security definer set search_path='' as $$
  select coalesce(sum(coalesce(e.credit,0)-coalesce(e.debit,0)),0)::numeric(18,2)
  from public.financial_entries e join public.financial_journals j on j.id=e.journal_id
  join public.financial_accounts a on a.id=e.account_id
  where a.wallet_id=target_wallet_id and j.status='posted';
$$;

create or replace function public.assert_journal_balanced(target_journal_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare debit_total numeric; credit_total numeric; entry_count integer;
begin
  select coalesce(sum(debit),0),coalesce(sum(credit),0),count(*)
  into debit_total,credit_total,entry_count from public.financial_entries where journal_id=target_journal_id;
  if entry_count<2 or debit_total<=0 or debit_total<>credit_total then
    raise exception using errcode='23514',message='journal_not_balanced';
  end if;
end; $$;

create or replace function public.create_balanced_journal(
  requested_type text, requested_description text, requested_reference_type text,
  requested_reference_id uuid, requested_origin public.financial_origin,
  requested_actor uuid, requested_idempotency_key text,
  debit_account_id uuid, credit_account_id uuid, requested_amount numeric,
  reversed_journal_id uuid default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare created_id uuid; existing_id uuid;
begin
  if requested_amount<=0 then raise exception using errcode='22023',message='invalid_journal_amount'; end if;
  select id into existing_id from public.financial_journals where idempotency_key=requested_idempotency_key;
  if existing_id is not null then return existing_id; end if;
  insert into public.financial_journals(transaction_type,description,reference_type,reference_id,origin,actor_user_id,idempotency_key,reverses_journal_id)
  values(requested_type,requested_description,requested_reference_type,requested_reference_id,requested_origin,requested_actor,requested_idempotency_key,reversed_journal_id)
  returning id into created_id;
  insert into public.financial_entries(journal_id,account_id,debit) values(created_id,debit_account_id,round(requested_amount,2));
  insert into public.financial_entries(journal_id,account_id,credit) values(created_id,credit_account_id,round(requested_amount,2));
  perform public.assert_journal_balanced(created_id);
  update public.financial_journals set status='posted',posted_at=now() where id=created_id;
  return created_id;
end; $$;

create or replace function public.protect_posted_financial_records()
returns trigger language plpgsql set search_path='' as $$
declare target_journal public.financial_journals%rowtype;
begin
  if tg_table_name='financial_journals' then
    if tg_op='DELETE' and old.status='posted' then raise exception using errcode='42501',message='posted_journal_immutable'; end if;
    if tg_op='UPDATE' and old.status='posted' then raise exception using errcode='42501',message='posted_journal_immutable'; end if;
    return case when tg_op='DELETE' then old else new end;
  end if;
  select * into target_journal from public.financial_journals where id=coalesce(new.journal_id,old.journal_id);
  if target_journal.status='posted' then raise exception using errcode='42501',message='posted_entries_immutable'; end if;
  return case when tg_op='DELETE' then old else new end;
end; $$;

create trigger financial_journals_immutable before update or delete on public.financial_journals
for each row execute function public.protect_posted_financial_records();
create trigger financial_entries_immutable before update or delete on public.financial_entries
for each row execute function public.protect_posted_financial_records();

create or replace function public.refresh_installment_state(target_installment_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 update public.installments set status=case
   when amount_paid>=total_due then 'paid'::public.installment_status
   when amount_paid>0 then 'partially_paid'::public.installment_status
   when due_date<current_date then 'overdue'::public.installment_status
   when due_date<=current_date then 'due'::public.installment_status
   else 'scheduled'::public.installment_status end
 where id=target_installment_id;
end; $$;

create or replace function public.admin_create_property_purchase(
  requested_user_id uuid, requested_plot_id uuid, requested_plan_id uuid,
  requested_purchase_amount numeric, requested_down_payment numeric,
  requested_finance_charge numeric, requested_start_date date, requested_idempotency_key text
) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); selected_plot public.plots%rowtype; selected_plan public.payment_plan_definitions%rowtype;
 created_id uuid; installment_total numeric; base_amount numeric; final_amount numeric;
begin
 if not public.is_executive(actor) then raise exception using errcode='42501',message='executive_required'; end if;
 select id into created_id from public.property_purchases where idempotency_key=requested_idempotency_key;
 if created_id is not null then return created_id; end if;
 select * into selected_plot from public.plots where id=requested_plot_id for update;
 if not found or selected_plot.status='sold' then raise exception using errcode='22023',message='plot_unavailable'; end if;
 if selected_plot.status='token_hold' and (selected_plot.held_by_user_id<>requested_user_id or selected_plot.hold_expires_at<=now()) then
   raise exception using errcode='22023',message='plot_hold_not_owned'; end if;
 select * into selected_plan from public.payment_plan_definitions where id=requested_plan_id and active and configured;
 if not found then raise exception using errcode='22023',message='payment_plan_not_configured'; end if;
 if requested_purchase_amount<=0 or requested_down_payment<0 or requested_down_payment>requested_purchase_amount or requested_finance_charge<0 then
   raise exception using errcode='22023',message='invalid_purchase_amounts'; end if;
 installment_total:=requested_purchase_amount+requested_finance_charge;
 insert into public.property_purchases(user_id,project_id,plot_id,payment_plan_id,purchase_amount,down_payment_amount,financed_amount,finance_charge,total_payable,start_date,idempotency_key,created_by)
 values(requested_user_id,selected_plot.project_id,requested_plot_id,requested_plan_id,round(requested_purchase_amount,2),round(requested_down_payment,2),round(requested_purchase_amount-requested_down_payment,2),round(requested_finance_charge,2),round(installment_total,2),requested_start_date,requested_idempotency_key,actor)
 returning id into created_id;
 base_amount:=trunc((installment_total/selected_plan.installment_count)*100)/100;
 for i in 1..selected_plan.installment_count loop
   final_amount:=case when i=selected_plan.installment_count then installment_total-(base_amount*(selected_plan.installment_count-1)) else base_amount end;
   insert into public.installments(purchase_id,installment_number,due_date,principal_amount,finance_amount,total_due)
   values(created_id,i,(requested_start_date+(make_interval(months=>i-1)))::date,
     round(final_amount*(requested_purchase_amount/installment_total),2),
     round(final_amount-round(final_amount*(requested_purchase_amount/installment_total),2),2),round(final_amount,2));
 end loop;
 update public.plot_holds set status='converted',ended_at=now() where plot_id=requested_plot_id and status='active';
 update public.plots set status='sold',held_by_user_id=null,hold_expires_at=null,booked_by_user_id=requested_user_id,booked_at=now() where id=requested_plot_id;
 insert into public.security_audit_log(actor_user_id,target_user_id,action,source,details)
 values(actor,requested_user_id,'financial.purchase_created','database',jsonb_build_object('purchase_id',created_id,'plot_id',requested_plot_id));
 return created_id;
end; $$;

create or replace function public.admin_record_manual_payment(
 requested_user_id uuid, requested_purchase_id uuid, requested_installment_id uuid,
 requested_amount numeric, requested_method text, requested_reference text,
 requested_payment_date date, requested_notes text, requested_idempotency_key text
) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); created_id uuid; purchase_owner uuid;
begin
 if not public.is_executive(actor) then raise exception using errcode='42501',message='executive_required'; end if;
 select id into created_id from public.manual_payments where idempotency_key=requested_idempotency_key;
 if created_id is not null then return created_id; end if;
 select user_id into purchase_owner from public.property_purchases where id=requested_purchase_id and status='active';
 if purchase_owner is null or purchase_owner<>requested_user_id then raise exception using errcode='22023',message='invalid_purchase_owner'; end if;
 if requested_installment_id is not null and not exists(select 1 from public.installments where id=requested_installment_id and purchase_id=requested_purchase_id and amount_paid<total_due) then
   raise exception using errcode='22023',message='invalid_installment'; end if;
 if requested_amount<=0 or requested_amount>(select coalesce(sum(total_due-amount_paid),0) from public.installments where purchase_id=requested_purchase_id) then
   raise exception using errcode='22023',message='invalid_payment_amount'; end if;
 if not exists(select 1 from public.payment_methods where code=requested_method and active) then raise exception using errcode='22023',message='invalid_payment_method'; end if;
 insert into public.manual_payments(user_id,purchase_id,installment_id,amount,payment_method_code,manual_reference,payment_date,notes,idempotency_key,entered_by)
 values(requested_user_id,requested_purchase_id,requested_installment_id,round(requested_amount,2),requested_method,nullif(trim(requested_reference),''),requested_payment_date,nullif(trim(requested_notes),''),requested_idempotency_key,actor)
 returning id into created_id;
 insert into public.security_audit_log(actor_user_id,target_user_id,action,source,details)
 values(actor,requested_user_id,'financial.payment_recorded','database',jsonb_build_object('payment_id',created_id));
 return created_id;
end; $$;

create or replace function public.create_wallet_credit(
 target_user_id uuid, target_kind public.wallet_kind, expense_code text, amount numeric,
 transaction_type text, reference_type text, reference_id uuid, idempotency_key text,
 actor uuid, origin public.financial_origin
) returns uuid language plpgsql security definer set search_path='' as $$
declare wallet_account uuid; expense_account uuid;
begin
 select a.id into wallet_account from public.wallets w join public.financial_accounts a on a.wallet_id=w.id where w.user_id=target_user_id and w.kind=target_kind for update of w;
 select id into expense_account from public.financial_accounts where code=expense_code;
 return public.create_balanced_journal(transaction_type,transaction_type,reference_type,reference_id,origin,actor,idempotency_key,expense_account,wallet_account,amount);
end; $$;

create or replace function public.issue_direct_commission(target_purchase_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare purchase_row public.property_purchases%rowtype; sponsor_id uuid; rule_row public.compensation_rules%rowtype;
 paid_total numeric; rate_value numeric; commission_amount numeric; result_id uuid; journal_id uuid;
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
 if commission_amount>0 then journal_id:=public.create_wallet_credit(sponsor_id,'main_cash','PLATFORM:DIRECT_COMMISSION_EXPENSE',commission_amount,'direct_referral_commission','direct_commission',result_id,'direct-commission:'||target_purchase_id,null,'system'); end if;
 update public.direct_commissions set journal_id=journal_id,status='credited' where id=result_id;
 return result_id;
end; $$;

create or replace function public.admin_verify_manual_payment(target_payment_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); payment_row public.manual_payments%rowtype; remaining numeric; allocation numeric; item record;
 cash_account uuid; receivable_account uuid; journal_id uuid;
begin
 if not public.is_executive(actor) then raise exception using errcode='42501',message='executive_required'; end if;
 select * into payment_row from public.manual_payments where id=target_payment_id for update;
 if not found then raise exception using errcode='P0002',message='payment_not_found'; end if;
 if payment_row.status='verified' then select id into journal_id from public.financial_journals where reference_type='manual_payment' and reference_id=target_payment_id; return journal_id; end if;
 if payment_row.status<>'pending_verification' then raise exception using errcode='22023',message='invalid_payment_transition'; end if;
 remaining:=payment_row.amount;
 for item in select * from public.installments where purchase_id=payment_row.purchase_id and amount_paid<total_due and (payment_row.installment_id is null or id=payment_row.installment_id) order by due_date,installment_number for update loop
   exit when remaining<=0; allocation:=least(remaining,item.total_due-item.amount_paid);
   insert into public.payment_allocations(payment_id,installment_id,amount) values(target_payment_id,item.id,allocation);
   update public.installments set amount_paid=amount_paid+allocation where id=item.id;
   perform public.refresh_installment_state(item.id); remaining:=remaining-allocation;
 end loop;
 if remaining<>0 then raise exception using errcode='22023',message='payment_exceeds_outstanding'; end if;
 select id into cash_account from public.financial_accounts where code='PLATFORM:CASH_CLEARING';
 select id into receivable_account from public.financial_accounts where code='PLATFORM:PROPERTY_RECEIVABLE';
 journal_id:=public.create_balanced_journal('manual_property_payment','Verified manual property payment','manual_payment',target_payment_id,'manual',actor,'manual-payment:'||target_payment_id,cash_account,receivable_account,payment_row.amount);
 update public.manual_payments set status='verified',verified_by=actor,verified_at=now() where id=target_payment_id;
 insert into public.notifications(recipient_user_id,type,title,message,reference_type,reference_id,idempotency_key)
 values(payment_row.user_id,'payment.verified','Payment verified','Your manually recorded property payment was verified.','manual_payment',target_payment_id,'payment-verified:'||target_payment_id);
 insert into public.business_volume_events(beneficiary_user_id,source_user_id,source_payment_id,source_purchase_id,network_side,volume,effective_at)
 select a.parent_id,payment_row.user_id,target_payment_id,payment_row.purchase_id,a.branch_leg,payment_row.amount,now() from (
   with recursive ancestors as (
     select n.parent_user_id parent_id,n.placement_leg branch_leg,n.parent_user_id next_user from public.network_nodes n where n.user_id=payment_row.user_id
     union all select n.parent_user_id,n.placement_leg,n.parent_user_id from public.network_nodes n join ancestors x on n.user_id=x.next_user where n.parent_user_id is not null
   ) select parent_id,branch_leg from ancestors where parent_id is not null
 ) a on conflict(beneficiary_user_id,source_payment_id) do nothing;
 perform public.issue_direct_commission(payment_row.purchase_id);
 insert into public.security_audit_log(actor_user_id,target_user_id,action,source,details) values(actor,payment_row.user_id,'financial.payment_verified','database',jsonb_build_object('payment_id',target_payment_id,'journal_id',journal_id));
 return journal_id;
end; $$;

create or replace function public.admin_reject_manual_payment(target_payment_id uuid, reason text)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); owner_id uuid;
begin
 if not public.is_executive(actor) then raise exception using errcode='42501',message='executive_required'; end if;
 if char_length(trim(reason))<3 then raise exception using errcode='22023',message='rejection_reason_required'; end if;
 update public.manual_payments set status='rejected',rejected_by=actor,rejected_at=now(),rejection_reason=trim(reason)
 where id=target_payment_id and status='pending_verification' returning user_id into owner_id;
 if owner_id is null then raise exception using errcode='22023',message='invalid_payment_transition'; end if;
 insert into public.notifications(recipient_user_id,type,title,message,reference_type,reference_id,idempotency_key)
 values(owner_id,'payment.rejected','Payment rejected','A manually recorded property payment was rejected.','manual_payment',target_payment_id,'payment-rejected:'||target_payment_id);
 return true;
end; $$;

create or replace function public.admin_reverse_manual_payment(target_payment_id uuid, reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); payment_row public.manual_payments%rowtype; original_journal public.financial_journals%rowtype; reverse_id uuid; entry_row record;
begin
 if not public.is_executive(actor) then raise exception using errcode='42501',message='executive_required'; end if;
 if char_length(trim(reason))<3 then raise exception using errcode='22023',message='reversal_reason_required'; end if;
 select * into payment_row from public.manual_payments where id=target_payment_id for update;
 if payment_row.status='reversed' then select id into reverse_id from public.financial_journals where reverses_journal_id=(select id from public.financial_journals where reference_type='manual_payment' and reference_id=target_payment_id); return reverse_id; end if;
 if payment_row.status<>'verified' then raise exception using errcode='22023',message='invalid_payment_transition'; end if;
 select * into original_journal from public.financial_journals where reference_type='manual_payment' and reference_id=target_payment_id and status='posted';
 insert into public.financial_journals(transaction_type,description,reference_type,reference_id,origin,actor_user_id,idempotency_key,reverses_journal_id)
 values('reversal','Manual payment reversal','manual_payment',target_payment_id,'manual',actor,'manual-payment-reversal:'||target_payment_id,original_journal.id) returning id into reverse_id;
 for entry_row in select * from public.financial_entries where journal_id=original_journal.id loop
   insert into public.financial_entries(journal_id,account_id,debit,credit,memo) values(reverse_id,entry_row.account_id,entry_row.credit,entry_row.debit,'Reversal');
 end loop;
 perform public.assert_journal_balanced(reverse_id); update public.financial_journals set status='posted',posted_at=now() where id=reverse_id;
 for entry_row in select * from public.payment_allocations where payment_id=target_payment_id and reversed_at is null for update loop
   update public.installments set amount_paid=amount_paid-entry_row.amount where id=entry_row.installment_id;
   update public.payment_allocations set reversed_at=now() where id=entry_row.id;
   perform public.refresh_installment_state(entry_row.installment_id);
 end loop;
 update public.manual_payments set status='reversed',reversed_by=actor,reversed_at=now(),reversal_reason=trim(reason) where id=target_payment_id;
 return reverse_id;
end; $$;

create or replace function public.pay_installment_from_wallet(target_installment_id uuid,target_wallet_kind public.wallet_kind,requested_amount numeric,requested_idempotency_key text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); item public.installments%rowtype; owner_id uuid; wallet_row public.wallets%rowtype; wallet_account uuid; receivable_account uuid; journal_id uuid;
begin
 select i.* into item from public.installments i where i.id=target_installment_id for update;
 select p.user_id into owner_id from public.property_purchases p where p.id=item.purchase_id;
 if owner_id is null or owner_id<>actor then raise exception using errcode='42501',message='installment_access_denied'; end if;
 if requested_amount<=0 or requested_amount>item.total_due-item.amount_paid then raise exception using errcode='22023',message='invalid_payment_amount'; end if;
 select * into wallet_row from public.wallets where user_id=actor and kind=target_wallet_kind for update;
 if public.wallet_balance(wallet_row.id)<requested_amount then raise exception using errcode='22023',message='insufficient_wallet_balance'; end if;
 select id into wallet_account from public.financial_accounts where wallet_id=wallet_row.id;
 select id into receivable_account from public.financial_accounts where code='PLATFORM:PROPERTY_RECEIVABLE';
 journal_id:=public.create_balanced_journal('wallet_property_payment','Wallet property installment payment','installment',target_installment_id,'manual',actor,requested_idempotency_key,wallet_account,receivable_account,requested_amount);
 update public.installments set amount_paid=amount_paid+requested_amount where id=target_installment_id; perform public.refresh_installment_state(target_installment_id);
 return journal_id;
end; $$;

create or replace function public.generate_installment_reminders(target_date date default current_date)
returns integer language plpgsql security definer set search_path='' as $$
declare inserted_count integer;
begin
 insert into public.notifications(recipient_user_id,type,title,message,reference_type,reference_id,idempotency_key)
 select p.user_id,'payment.reminder','Installment due soon','A property installment is due within seven days.','installment',i.id,'installment-reminder:'||i.id||':'||target_date
 from public.installments i join public.property_purchases p on p.id=i.purchase_id
 where p.status='active' and i.amount_paid<i.total_due and i.due_date between target_date and target_date+7
 on conflict(idempotency_key) do nothing;
 get diagnostics inserted_count=row_count; return inserted_count;
end; $$;

create or replace function public.run_financial_reconciliation(requested_run_key text)
returns uuid language plpgsql security definer set search_path='' as $$
declare run_id uuid; unbalanced bigint; allocation_mismatch bigint; findings jsonb;
begin
 select id into run_id from public.financial_reconciliation_runs where run_key=requested_run_key; if run_id is not null then return run_id; end if;
 select count(*) into unbalanced from (select j.id from public.financial_journals j join public.financial_entries e on e.journal_id=j.id where j.status='posted' group by j.id having coalesce(sum(e.debit),0)<>coalesce(sum(e.credit),0)) x;
 select count(*) into allocation_mismatch from public.installments i where i.amount_paid<>(select coalesce(sum(a.amount),0) from public.payment_allocations a where a.installment_id=i.id and a.reversed_at is null);
 findings:=jsonb_build_array() || case when unbalanced>0 then jsonb_build_array(jsonb_build_object('type','unbalanced_journals','count',unbalanced)) else '[]'::jsonb end || case when allocation_mismatch>0 then jsonb_build_array(jsonb_build_object('type','installment_allocation_mismatch','count',allocation_mismatch)) else '[]'::jsonb end;
 insert into public.financial_reconciliation_runs(run_key,status,totals,findings) values(requested_run_key,case when jsonb_array_length(findings)=0 then 'clean'::public.reconciliation_status else 'discrepancy'::public.reconciliation_status end,jsonb_build_object('unbalanced_journals',unbalanced,'allocation_mismatches',allocation_mismatch),findings) returning id into run_id;
 return run_id;
end; $$;

commit;
