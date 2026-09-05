begin;

-- Trigger and internal composition functions must never be API-callable.
revoke all on function public.assert_journal_balanced(uuid) from public,anon,authenticated;
revoke all on function public.handle_new_auth_user() from public,anon,authenticated;
revoke all on function public.initialize_financial_wallets() from public,anon,authenticated;
revoke all on function public.initialize_network_node() from public,anon,authenticated;
revoke all on function public.provision_financial_wallets(uuid) from public,anon,authenticated;
revoke all on function public.refresh_installment_state(uuid) from public,anon,authenticated;
revoke all on function public.reverse_payment_financial_effects() from public,anon,authenticated;
revoke all on function public.sync_auth_user_email() from public,anon,authenticated;

drop policy kyc_submissions_owner_or_executive_read on public.kyc_submissions;
create policy kyc_submissions_owner_or_executive_read on public.kyc_submissions
for select to authenticated using(user_id=(select auth.uid()) or (select public.is_executive()));

drop policy kyc_documents_owner_or_executive_read on public.kyc_documents;
create policy kyc_documents_owner_or_executive_read on public.kyc_documents
for select to authenticated using(user_id=(select auth.uid()) or (select public.is_executive()));

drop policy kyc_review_events_owner_or_executive_read on public.kyc_review_events;
create policy kyc_review_events_owner_or_executive_read on public.kyc_review_events
for select to authenticated using(target_user_id=(select auth.uid()) or (select public.is_executive()));

commit;
