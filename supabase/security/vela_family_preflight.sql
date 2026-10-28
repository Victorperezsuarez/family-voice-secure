-- Vela security preflight: READ ONLY. Run with Supabase SQL Editor in a staging project.
-- This script does not modify schema, RLS, permissions or data.
-- It inspects high-risk controls before applying a separate migration.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('families', 'family_users', 'family_invitations', 'family_members')
  AND c.relkind IN ('r','p')
ORDER BY c.relname;

SELECT tablename, policyname, cmd, roles, qual AS using_condition,
       with_check AS insert_update_condition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('families', 'family_users', 'family_invitations', 'family_members')
ORDER BY tablename, policyname;

SELECT p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS arguments,
       p.prosecdef AS security_definer,
       p.proconfig AS settings,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prokind = 'f'
  AND p.proname IN ('is_family_member','is_family_admin','can_edit_family',
                   'create_default_roles_for_family','create_default_roles_trigger')
ORDER BY p.proname;

SELECT c.relname AS table_name, t.tgname AS trigger_name,
       pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname IN ('families','family_users','family_invitations')
  AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- Manual security assertions to verify after remediation:
-- 1. Outsider cannot insert a membership into another family, even as 'admin'.
-- 2. Family creator receives admin membership in the same transaction as creation.
-- 3. Invitation token can be accepted only once, before expiration, by intended account.
-- 4. Unauthenticated clients cannot invoke privileged role setup functions.
-- 5. Family A cannot read or mutate Family B's private records.
-- IMPORTANT: Do not test malicious INSERTs in production.
