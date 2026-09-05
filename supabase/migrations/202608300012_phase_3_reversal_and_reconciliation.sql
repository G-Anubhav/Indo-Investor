begin;

alter table public.business_volume_events add column reversed_at timestamptz;
create index volume_active_period_idx on public.business_volume_events(beneficiary_user_id,effective_at,network_side) where reversed_at is null;

create or replace function public.reverse_payment_financial_effects()
returns trigger language plpgsql security definer set search_path='' as $$
declare commission_row public.direct_commissions%rowtype; original_journal public.financial_journals%rowtype; reverse_id uuid; entry_row record; remaining_verified numeric;
begin
 if old.status='verified' and new.status='reversed' then
   update public.business_volume_events set reversed_at=new.reversed_at where source_payment_id=new.id and reversed_at is null;
   select coalesce(sum(a.amount),0) into remaining_verified from public.payment_allocations a join public.installments i on i.id=a.installment_id where i.purchase_id=new.purchase_id and a.reversed_at is null;
   select * into commission_row from public.direct_commissions where purchase_id=new.purchase_id and status='credited';
   if found and remaining_verified<commission_row.qualifying_amount then
     select * into original_journal from public.financial_journals where id=commission_row.journal_id;
     insert into public.financial_journals(transaction_type,description,reference_type,reference_id,origin,actor_user_id,idempotency_key,reverses_journal_id)
     values('reversal','Direct commission reversal','direct_commission',commission_row.id,'system',new.reversed_by,'direct-commission-reversal:'||commission_row.id,original_journal.id) returning id into reverse_id;
     for entry_row in select * from public.financial_entries where journal_id=original_journal.id loop
       insert into public.financial_entries(journal_id,account_id,debit,credit,memo) values(reverse_id,entry_row.account_id,entry_row.credit,entry_row.debit,'Commission reversal');
     end loop;
     perform public.assert_journal_balanced(reverse_id);
     update public.financial_journals set status='posted',posted_at=now() where id=reverse_id;
     update public.direct_commissions set status='reversed' where id=commission_row.id;
   end if;
 end if;
 return new;
end; $$;

create trigger manual_payment_reverse_financial_effects after update of status on public.manual_payments
for each row execute function public.reverse_payment_financial_effects();

create or replace function public.run_financial_reconciliation(requested_run_key text)
returns uuid language plpgsql security definer set search_path='' as $$
declare run_id uuid; unbalanced bigint; allocation_mismatch bigint; findings jsonb;
begin
 select id into run_id from public.financial_reconciliation_runs where run_key=requested_run_key; if run_id is not null then return run_id; end if;
 select count(*) into unbalanced from (select j.id from public.financial_journals j join public.financial_entries e on e.journal_id=j.id where j.status='posted' group by j.id having coalesce(sum(e.debit),0)<>coalesce(sum(e.credit),0)) x;
 select count(*) into allocation_mismatch from public.installments i where i.amount_paid<>(
   (select coalesce(sum(a.amount),0) from public.payment_allocations a where a.installment_id=i.id and a.reversed_at is null)
   +(select coalesce(sum(e.debit),0) from public.financial_journals j join public.financial_entries e on e.journal_id=j.id join public.financial_accounts fa on fa.id=e.account_id where j.status='posted' and j.transaction_type='wallet_property_payment' and j.reference_type='installment' and j.reference_id=i.id and fa.wallet_id is not null)
 );
 findings:=jsonb_build_array() || case when unbalanced>0 then jsonb_build_array(jsonb_build_object('type','unbalanced_journals','count',unbalanced)) else '[]'::jsonb end || case when allocation_mismatch>0 then jsonb_build_array(jsonb_build_object('type','installment_allocation_mismatch','count',allocation_mismatch)) else '[]'::jsonb end;
 insert into public.financial_reconciliation_runs(run_key,status,totals,findings) values(requested_run_key,case when jsonb_array_length(findings)=0 then 'clean'::public.reconciliation_status else 'discrepancy'::public.reconciliation_status end,jsonb_build_object('unbalanced_journals',unbalanced,'allocation_mismatches',allocation_mismatch),findings) returning id into run_id;
 return run_id;
end; $$;

do $$ declare function_definition text; begin
 select pg_get_functiondef(p.oid) into function_definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='run_binary_compensation_cycle';
 function_definition:=replace(function_definition,'where effective_at<requested_ends_at','where reversed_at is null and effective_at<requested_ends_at');
 function_definition:=replace(function_definition,'where beneficiary_user_id=member.user_id and effective_at>=requested_starts_at','where beneficiary_user_id=member.user_id and reversed_at is null and effective_at>=requested_starts_at');
 execute function_definition;
end $$;

commit;
