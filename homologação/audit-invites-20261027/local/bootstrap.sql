-- Disposable LOCAL PostgreSQL only. Auth schema/tables are created by official Auth migrations.
create role postgres nologin; -- Expected grant target in official Auth migrations.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema if not exists auth;
create schema private;
grant usage on schema public,auth to anon,authenticated,service_role;
-- auth.uid()/auth.jwt() come from official Auth migrations, not test replacements.
