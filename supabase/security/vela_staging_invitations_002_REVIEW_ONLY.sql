-- VELA STAGING / MIGRATION 002 / REVIEW ONLY — DO NOT EXECUTE YET
-- Depends on migration 001: public.families(id,created_by), public.family_users(family_id,user_id,role).
-- Design: opaque random token, SHA-256 hash at rest, email-bound, expiring, single-use.
-- Invitation delivery is NOT implemented; the invite RPC returns a token to the inviting admin.
-- SECURITY: review function owner, EXECUTE privileges, schema exposure, and test two accounts first.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.vela_family_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  invited_email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  accepted_by uuid REFERENCES auth.users(id),
  accepted_at timestamptz,
  CONSTRAINT vela_invitation_email_normalized CHECK (
    invited_email = lower(btrim(invited_email)) AND length(invited_email) BETWEEN 3 AND 320
  ),
  CONSTRAINT vela_invitation_expiry CHECK (expires_at > created_at),
  CONSTRAINT vela_invitation_acceptance_consistency CHECK (
    (status = 'accepted' AND accepted_by IS NOT NULL AND accepted_at IS NOT NULL)
    OR (status <> 'accepted' AND accepted_by IS NULL AND accepted_at IS NULL)
  )
);
CREATE INDEX vela_family_invites_family_idx ON public.vela_family_invitations(family_id, status);
CREATE INDEX vela_family_invites_email_idx ON public.vela_family_invitations(invited_email, status);
ALTER TABLE public.vela_family_invitations ENABLE ROW LEVEL SECURITY;
-- No direct client table policies. All access goes through reviewed RPC functions.
REVOKE ALL ON TABLE public.vela_family_invitations FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.vela_issue_family_invitation(
  p_family_id uuid, p_email text, p_role text DEFAULT 'member'
) RETURNS TABLE(invitation_id uuid, invitation_token text, expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_email text := lower(btrim(p_email));
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
  v_id uuid;
  v_expires timestamptz := now() + interval '7 days';
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF v_email IS NULL OR length(v_email) NOT BETWEEN 3 AND 320 OR position('@' in v_email) < 2 THEN
    RAISE EXCEPTION 'Invalid invitation email';
  END IF;
  IF p_role IS NULL OR p_role NOT IN ('admin','member') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.family_users fu
    WHERE fu.family_id = p_family_id AND fu.user_id = v_actor AND fu.role = 'admin'
  ) THEN RAISE EXCEPTION 'Not authorized to invite'; END IF;
  INSERT INTO public.vela_family_invitations
    (family_id, invited_by, invited_email, role, token_hash, expires_at)
  VALUES (p_family_id, v_actor, v_email, p_role,
    encode(extensions.digest(v_token, 'sha256'), 'hex'), v_expires)
  RETURNING id INTO v_id;
  RETURN QUERY SELECT v_id, v_token, v_expires;
END;
$$;

CREATE FUNCTION public.vela_accept_family_invitation(p_token text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_email text;
  v_inv public.vela_family_invitations%ROWTYPE;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT lower(btrim(u.email)) INTO v_email
  FROM auth.users u WHERE u.id = v_actor AND u.email_confirmed_at IS NOT NULL;
  IF v_email IS NULL THEN RAISE EXCEPTION 'Verified email required'; END IF;
  IF p_token IS NULL OR length(p_token) <> 64 OR p_token !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid invitation token';
  END IF;
  SELECT * INTO v_inv FROM public.vela_family_invitations i
  WHERE i.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  FOR UPDATE;
  IF NOT FOUND OR v_inv.status <> 'pending' OR v_inv.expires_at <= now()
     OR v_inv.invited_email <> v_email THEN
    RAISE EXCEPTION 'Invitation invalid, expired, or not intended for this account';
  END IF;
  INSERT INTO public.family_users(family_id, user_id, role)
  VALUES (v_inv.family_id, v_actor, v_inv.role)
  ON CONFLICT (family_id, user_id) DO NOTHING;
  IF NOT FOUND THEN RAISE EXCEPTION 'User already belongs to this family'; END IF;
  UPDATE public.vela_family_invitations
  SET status='accepted', accepted_by=v_actor, accepted_at=now()
  WHERE id=v_inv.id;
  RETURN v_inv.family_id;
END;
$$;

REVOKE ALL ON FUNCTION public.vela_issue_family_invitation(uuid,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.vela_accept_family_invitation(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vela_issue_family_invitation(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vela_accept_family_invitation(text) TO authenticated;
COMMIT;

-- IMPORTANT REVIEW ITEMS BEFORE RUN:
-- 1. Ensure functions are owned by privileged migration owner, not authenticated.
-- 2. Verify extensions.gen_random_bytes and extensions.digest exist in staging.
-- 3. Check PostgREST exposed schemas / default privileges.
-- 4. Add invite revocation, resend/rate-limits and email delivery before real users.
-- 5. Test: non-admin issue denied; wrong email denied; expired/replayed denied;
--    successful acceptance; role unchanged; cross-family isolation retained.
