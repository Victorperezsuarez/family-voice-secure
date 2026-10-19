-- Vela family access — STAGING CANDIDATE, NOT PRODUCTION APPROVED.
-- Depends on existing public.families, public.family_users and public.family_invitations
-- schemas documented in docs/vela-family-access-security-audit.md.
-- Review against LIVE staging pg_policies before execution.
BEGIN;

-- Fail closed if unexpected permissive INSERT/ALL policies exist.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'family_users'
      AND cmd IN ('INSERT', 'ALL')
      AND policyname <> 'Users can join families'
  ) THEN
    RAISE EXCEPTION 'Unexpected family_users write policy; review before migrating';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'family_invitations'
      AND cmd IN ('INSERT', 'ALL')
      AND policyname NOT IN ('Admins can create invitations', 'Family admins can create invitations')
  ) THEN
    RAISE EXCEPTION 'Unexpected family_invitations write policy; review before migrating';
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can join families" ON public.family_users;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Family admins can create invitations" ON public.family_invitations;

-- Membership creation is performed only by trusted functions, never by
-- client-controlled role or family_id. Existing RLS SELECT stays in place.
CREATE OR REPLACE FUNCTION public.vela_bootstrap_family_creator()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    RAISE EXCEPTION 'Family creator is required';
  END IF;
  INSERT INTO public.family_users (family_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$;

-- Existing on_family_created_create_roles trigger executes alphabetically
-- before zz_...; its role_id update may run before this membership insert.
-- Therefore verify custom_roles / role_id mapping in staging.
DROP TRIGGER IF EXISTS zz_vela_bootstrap_family_creator ON public.families;
CREATE TRIGGER zz_vela_bootstrap_family_creator
AFTER INSERT ON public.families FOR EACH ROW
EXECUTE FUNCTION public.vela_bootstrap_family_creator();

-- The raw invite token is returned once and never stored in the DB.
-- family_invitations.token holds only 'v1:' + SHA256(token).
-- Existing legacy plaintext tokens will not work with this new acceptance RPC.
CREATE OR REPLACE FUNCTION public.vela_issue_family_invitation(
  p_family_id uuid, p_email text, p_role text DEFAULT 'contributor'
)
RETURNS TABLE(invitation_id uuid, invitation_token text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_token text;
  v_id uuid;
  v_email text := lower(btrim(p_email));
BEGIN
  IF v_actor IS NULL OR p_family_id IS NULL OR
     v_email IS NULL OR v_email = '' OR
     p_role IS NULL OR p_role NOT IN ('admin', 'contributor', 'view-only') THEN
    RAISE EXCEPTION 'Invalid invitation request';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.family_users fu
    WHERE fu.family_id = p_family_id AND fu.user_id = v_actor AND fu.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized to invite';
  END IF;
  v_token := replace(gen_random_uuid()::text, '-', '') ||
             replace(gen_random_uuid()::text, '-', '');
  INSERT INTO public.family_invitations
    (family_id, invited_by, email, role, token, status, expires_at)
  VALUES
    (p_family_id, v_actor, v_email, p_role,
     'v1:' || encode(sha256(convert_to(v_token, 'UTF8')), 'hex'),
     'pending', now() + interval '7 days')
  RETURNING id INTO v_id;
  RETURN QUERY SELECT v_id, v_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.vela_accept_family_invitation(p_token text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_email text;
  v_inv public.family_invitations%ROWTYPE;
BEGIN
  IF v_actor IS NULL OR p_token IS NULL OR length(p_token) <> 64
     OR p_token !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid invitation';
  END IF;
  SELECT lower(u.email) INTO v_email
  FROM auth.users u WHERE u.id = v_actor AND u.email_confirmed_at IS NOT NULL;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Confirmed email required';
  END IF;

  SELECT * INTO v_inv FROM public.family_invitations i
  WHERE i.token = 'v1:' || encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
    AND i.status = 'pending'
    AND i.expires_at > now()
  FOR UPDATE;
  IF NOT FOUND OR lower(v_inv.email) <> v_email THEN
    RAISE EXCEPTION 'Invitation invalid or expired';
  END IF;

  -- Re-check the inviter is still an administrator before admitting a member.
  IF NOT EXISTS (
    SELECT 1 FROM public.family_users fu
    WHERE fu.family_id = v_inv.family_id
      AND fu.user_id = v_inv.invited_by AND fu.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Invitation no longer authorized';
  END IF;

  INSERT INTO public.family_users (family_id, user_id, role)
  VALUES (v_inv.family_id, v_actor, v_inv.role);
  UPDATE public.family_invitations
  SET status = 'accepted'
  WHERE id = v_inv.id AND status = 'pending';
  RETURN v_inv.family_id;
END;
$$;

REVOKE ALL ON FUNCTION public.vela_bootstrap_family_creator() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.vela_issue_family_invitation(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.vela_accept_family_invitation(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vela_issue_family_invitation(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vela_accept_family_invitation(text) TO authenticated;
COMMIT;

-- IMPORTANT LIMITATIONS BEFORE STAGING TEST:
-- 1. Verify any other direct/indirect membership write grants and policies.
-- 2. Verify family creator role_id synchronization with custom_roles trigger.
-- 3. Legacy pending invitations must be migrated or reissued; do not expose raw tokens.
-- 4. Test invitations, transaction rollback, race conditions, email verification.
-- 5. Review SECURITY DEFINER ownership and schema privileges in staging.
-- 6. Confirm frontend never directly inserts into family_users or invitations.
