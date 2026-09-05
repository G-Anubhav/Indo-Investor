begin;

create temporary table phase4_scale_metrics(name text primary key, elapsed_ms numeric, row_count bigint) on commit drop;
grant insert,select on phase4_scale_metrics to authenticated;

do $$
declare sponsor_code text; new_user uuid; fixture_root uuid; fixture_project uuid:=gen_random_uuid(); wallet_account uuid; platform_account uuid; started timestamptz; rows_seen bigint;
begin
  select n.member_code into sponsor_code from public.network_nodes n
  where not exists(select 1 from public.network_nodes c where c.parent_user_id=n.user_id and c.placement_leg='left')
  order by n.joined_at desc limit 1;
  if sponsor_code is null then raise exception 'scale_fixture_requires_network_sponsor'; end if;

  started:=clock_timestamp();
  for i in 1..1000 loop
    new_user:=gen_random_uuid();
    insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
    values('00000000-0000-0000-0000-000000000000',new_user,'authenticated','authenticated','phase4-scale-'||new_user||'@example.test','',now(),'{"provider":"email","providers":["email"]}'::jsonb,jsonb_build_object('full_name','Phase 4 Scale Member','sponsor_code',sponsor_code,'target_leg','left'),now(),now(),'','','','');
    if i=1 then fixture_root:=new_user; end if;
    select member_code into sponsor_code from public.network_nodes where user_id=new_user;
    insert into public.kyc_submissions(user_id,version,status,submitted_at) values(new_user,1,'pending_review',now()-make_interval(secs=>i));
    insert into public.kyc_documents(submission_id,user_id,document_type,object_path,original_filename,mime_type,size_bytes,sha256)
    select id,new_user,'pan',new_user||'/'||id||'/pan/'||gen_random_uuid()||'.pdf','pan.pdf','application/pdf',128,repeat('a',64)
    from public.kyc_submissions where user_id=new_user;
  end loop;
  insert into phase4_scale_metrics values('fixture_network_and_kyc_insert',extract(epoch from clock_timestamp()-started)*1000,1000);

  insert into public.real_estate_projects(id,name,slug,status,metadata) values(fixture_project,'PHASE 4 SCALE PROJECT','phase-4-scale-'||fixture_project,'active','{"test_only":true}');
  started:=clock_timestamp();
  insert into public.plots(project_id,plot_number,grid_row,grid_column,price)
  select fixture_project,'S-'||lpad(i::text,4,'0'),((i-1)/40)+1,((i-1)%40)+1,1000000+i from generate_series(1,1000) i;
  insert into phase4_scale_metrics values('fixture_plot_insert',extract(epoch from clock_timestamp()-started)*1000,1000);

  select a.id into wallet_account from public.financial_accounts a join public.wallets w on w.id=a.wallet_id where w.user_id=fixture_root and w.kind='main_cash';
  select id into platform_account from public.financial_accounts where code='PLATFORM:ADJUSTMENT_CLEARING';
  started:=clock_timestamp();
  for i in 1..1000 loop
    new_user:=gen_random_uuid();
    insert into public.financial_journals(id,transaction_type,description,reference_type,origin,status,posted_at,idempotency_key)
    values(new_user,'scale_test','Rollback-only scale fixture','scale_test','worker','draft',null,'phase4-scale:'||new_user);
    insert into public.financial_entries(journal_id,account_id,debit) values(new_user,platform_account,1);
    insert into public.financial_entries(journal_id,account_id,credit) values(new_user,wallet_account,1);
    update public.financial_journals set status='posted',posted_at=now()-make_interval(secs=>i) where id=new_user;
  end loop;
  insert into phase4_scale_metrics values('fixture_ledger_insert',extract(epoch from clock_timestamp()-started)*1000,1000);

  perform set_config('request.jwt.claims',jsonb_build_object('sub',fixture_root,'role','authenticated')::text,true);
  execute 'set local role authenticated';
  started:=clock_timestamp(); select count(*) into rows_seen from public.get_network_tree(fixture_root,5);
  insert into phase4_scale_metrics values('network_tree_depth_5',extract(epoch from clock_timestamp()-started)*1000,rows_seen);
  started:=clock_timestamp(); select count(*) into rows_seen from public.get_network_index(1,50,null,null,null);
  insert into phase4_scale_metrics values('network_index_page_50',extract(epoch from clock_timestamp()-started)*1000,rows_seen);
  execute 'reset role';

  select user_id into new_user from public.profiles where role_key in('admin','executive') and status='active' limit 1;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',new_user,'role','authenticated')::text,true);
  execute 'set local role authenticated';
  started:=clock_timestamp(); select count(*) into rows_seen from (select id from public.kyc_submissions where status='pending_review' order by submitted_at desc limit 25) q;
  insert into phase4_scale_metrics values('kyc_queue_page_25',extract(epoch from clock_timestamp()-started)*1000,rows_seen);
  execute 'reset role';

  started:=clock_timestamp(); select count(*) into rows_seen from (select p.id from public.plots p where p.project_id=fixture_project order by p.grid_row,p.grid_column limit 1000) q;
  insert into phase4_scale_metrics values('inventory_project_1000',extract(epoch from clock_timestamp()-started)*1000,rows_seen);
  started:=clock_timestamp(); select count(*) into rows_seen from (select e.id from public.financial_entries e where e.account_id=wallet_account order by e.created_at desc limit 50) q;
  insert into phase4_scale_metrics values('wallet_history_page_50',extract(epoch from clock_timestamp()-started)*1000,rows_seen);
end $$;

select name,round(elapsed_ms,2) elapsed_ms,row_count from phase4_scale_metrics order by name;
rollback;
