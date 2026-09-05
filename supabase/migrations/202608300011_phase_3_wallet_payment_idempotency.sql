begin;

create or replace function public.pay_installment_from_wallet(target_installment_id uuid,target_wallet_kind public.wallet_kind,requested_amount numeric,requested_idempotency_key text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); item public.installments%rowtype; owner_id uuid; wallet_row public.wallets%rowtype; wallet_account uuid; receivable_account uuid; posted_journal_id uuid;
begin
 select id into posted_journal_id from public.financial_journals where idempotency_key=requested_idempotency_key;
 if posted_journal_id is not null then return posted_journal_id; end if;
 select i.* into item from public.installments i where i.id=target_installment_id for update;
 select p.user_id into owner_id from public.property_purchases p where p.id=item.purchase_id;
 if owner_id is null or owner_id<>actor then raise exception using errcode='42501',message='installment_access_denied'; end if;
 if requested_amount<=0 or requested_amount>item.total_due-item.amount_paid then raise exception using errcode='22023',message='invalid_payment_amount'; end if;
 select * into wallet_row from public.wallets where user_id=actor and kind=target_wallet_kind for update;
 if public.wallet_balance(wallet_row.id)<requested_amount then raise exception using errcode='22023',message='insufficient_wallet_balance'; end if;
 select id into wallet_account from public.financial_accounts where wallet_id=wallet_row.id;
 select id into receivable_account from public.financial_accounts where code='PLATFORM:PROPERTY_RECEIVABLE';
 posted_journal_id:=public.create_balanced_journal('wallet_property_payment','Wallet property installment payment','installment',target_installment_id,'manual',actor,requested_idempotency_key,wallet_account,receivable_account,requested_amount);
 update public.installments set amount_paid=amount_paid+requested_amount where id=target_installment_id;
 perform public.refresh_installment_state(target_installment_id);
 return posted_journal_id;
end; $$;

commit;
