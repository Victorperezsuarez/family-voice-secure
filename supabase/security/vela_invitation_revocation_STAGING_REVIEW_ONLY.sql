-- VELA / SEC-001 — STAGING ONLY — REVIEW BEFORE EXECUTION
-- DO NOT RUN IN ORIGINAL PRODUCTION DATABASE.
-- Requires public.vela_family_invitations, public.family_users and auth.uid().
-- SECURITY DEFINER owner must be a trusted migration role with required privileges.
BEGIN;

ALTER TABLE public.vela_family_invitations
  ADD COLUMN IF NOT EXISTS revoked_by uuid,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz;

-- The two revocation fields must be present together, and only on revoked rows.
-- NOT VALID avoids unexpectedly blocking migration if legacy data needs review;
-- validation must succeed before the migration is considered complete.
ALTER TABLE public.vela_family_invitations
  ADD CONSTRAINT vela_invitation_revocation_consistency
  CHECK (
    (status = 'revoked' AND revoked_by IS NOT NULL AND revoked_at IS NOT NULL)
    OR (status <> 'revoked' AND revoked_by IS NULL AND revoked_at IS NULL)
  ) NOT VALID;

ALTER TABLE public.vela_family_invitations
  VALIDATE CONSTRAINT vela_invitation_revocation_consistency;

ALTER TABLE public.vela_family_invitations
  ADD CONSTRAINT vela_family_invitations_revoked_by_fkey
  FOREIGN KEY (revoked_by) REFERENCES auth.users(id);

CREATE OR REPLACE FUNCTION public.vela_revoke_family_invitation(p_invitation_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_inv public.vela_family_invitations%ROWTYPE;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT *
    INTO v_inv
    FROM public.vela_family_invitations i
   WHERE i.id = p_invitation_id
   FOR UPDATE;

  -- Uniform error avoids revealing whether another family's invitation exists.
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or not authorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.family_users fu
     WHERE fu.family_id = v_inv.family_id
       AND fu.user_id = v_actor
       AND fu.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Invitation not found or not authorized';
  END IF;

  IF v_inv.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending invitations can be revoked';
  END IF;

  UPDATE public.vela_family_invitations
     SET status = 'revoked',
         revoked_by = v_actor,
         revoked_at = now()
   WHERE id = v_inv.id;

  RETURN v_inv.id;
END;
$function$;

REVOKE ALL ON FUNCTION public.vela_revoke_family_invitation(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vela_revoke_family_invitation(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.vela_revoke_family_invitation(uuid) TO authenticated;

COMMIT;

-- POST-MIGRATION TEST PLAN (run separately, not part of migration):
-- 1. Confirm revoked_by/revoked_at columns and consistency CHECK.
-- 2. Confirm anon EXECUTE=false, authenticated EXECUTE=true.
-- 3. Member attempts revoke -> denied; invitation remains pending.
-- 4. Admin revokes pending invitation -> status revoked + actor/time recorded.
-- 5. Recipient attempts accept revoked token -> denied.
-- 6. Admin attempts revoke accepted invitation -> denied; unchanged.
-- 7. Admin from different family attempts revoke -> denied.
-- 8. Review simultaneous accept/revoke behavior and migration rollback plan.
