-- VELA staging baseline, READ ONLY. Execute only in Supabase project vela-staging.
-- No CREATE/ALTER/INSERT/UPDATE/DELETE statements.
SELECT current_database() AS database_name,
       current_schema() AS current_schema,
       current_setting('server_version') AS postgres_version;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT extname, extversion FROM pg_extension
WHERE extname IN ('pgcrypto','uuid-ossp') ORDER BY extname;

SELECT n.nspname AS schema_name, c.relname AS object_name, c.relkind AS object_kind
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('v','m','p')
ORDER BY c.relname;

-- NOTE: The auth.users table is managed by Supabase. Do not create or modify it.
-- Do not copy production data, invitations, tokens, or user records to staging.
