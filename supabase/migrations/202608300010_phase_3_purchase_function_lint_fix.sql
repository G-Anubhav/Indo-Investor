begin;

do $$
declare function_definition text;
begin
  select pg_get_functiondef(p.oid) into function_definition
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='admin_create_property_purchase';

  function_definition:=replace(
    function_definition,
    'final_amount numeric; i integer;',
    'final_amount numeric;'
  );
  execute function_definition;
end $$;

commit;
