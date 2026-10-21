-- VELA FAMILY CREATOR BOOTSTRAP — REVIEW ONLY; DO NOT RUN IN PRODUCTION.
-- Requires separate staging verification of existing family creation policies,
-- function ownership, and invitation acceptance. This file is intentionally
-- not a production migration.
--
-- The existing AFTER INSERT trigger on_family_created_create_roles sorts
-- before zz_vela_bootstrap_family_creator. It creates custom_roles first.
-- This trigger inserts the creator with the Admin role_id immediately.
-- Both triggers run inside the same INSERT transaction.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'families'
      AND t.tgname = 'on_family_created_create_roles'
      AND NOT t.tgisinternal AND t.tgenabled <> 'D'
  ) THEN
    RAISE EXCEPTION 'Expected role-creation trigger not present/enabled';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='family_users'
      AND cmd IN ('INSERT','ALL') AND policyname <> 'Users can join families'
  ) THEN
    RAISE EXCEPTION 'Unexpected membership write policy: review before applying';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.vela_bootstrap_family_creator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $body$
DECLARE
  v_admin_role_id uuid;
BEGIN
  IF NEW.created_by IS NULL THEN
    RAISE EXCEPTION 'Family creator required';
  END IF;

  SELECT cr.id INTO STRICT v_admin_role_id
  FROM public.custom_roles AS cr
  WHERE cr.family_id = NEW.id AND cr.name = 'Admin';

  INSERT INTO public.family_users (family_id, user_id, role, role_id)
  VALUES (NEW.id, NEW.created_by, 'admin', v_admin_role_id);

  RETURN NEW;
END;
$body$;

DROP TRIGGER IF EXISTS zz_vela_bootstrap_family_creator ON public.families;
CREATE TRIGGER zz_vela_bootstrap_family_creator
AFTER INSERT ON public.families
FOR EACH ROW
EXECUTE FUNCTION public.vela_bootstrap_family_creator();

-- RLS still protects direct client writes, while SECURITY DEFINER trigger
-- inserts the trusted membership. Existing policies need a complete review.
DROP POLICY IF EXISTS "Users can join families" ON public.family_users;

REVOKE EXECUTE ON FUNCTION public.vela_bootstrap_family_creator()
FROM PUBLIC, anon, authenticated;

COMMIT;

-- STAGING TESTS REQUIRED BEFORE PRODUCTION:
-- * A signed-in user creates a family, receives exactly one Admin membership
--   with role_id belonging to that family, and can SELECT their new family.
-- * Unauthenticated/other user cannot spoof created_by.
-- * Direct family_users inserts by authenticated clients are denied.
-- * Trigger failure rolls back the entire family creation transaction.
-- * Invitation acceptance function inserts membership and role_id consistently.
-- * No other permissive membership write policies or grants bypass this design.
-- * Existing families and roles remain unchanged by the migration.
-- * Test rollback and application compatibility before any deployment.
