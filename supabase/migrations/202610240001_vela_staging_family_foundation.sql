-- VELA STAGING / MIGRATION 001: family foundation
-- REVIEW AND TEST IN vela-staging ONLY. Never run against the original project.
-- Requires an empty public schema and existing Supabase auth.users.
-- Idempotent for schema creation, but run once in staging as a migration.
BEGIN;

CREATE TABLE public.families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.family_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id)
);
CREATE INDEX family_users_user_idx ON public.family_users(user_id, family_id);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_users ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER functions use fixed search_path and no client EXECUTE grants.
CREATE FUNCTION public.vela_is_family_member(p_family_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
 SELECT EXISTS (
   SELECT 1 FROM public.family_users fu
   WHERE fu.family_id=p_family_id AND fu.user_id=p_user_id
 );
$$;

CREATE FUNCTION public.vela_is_family_admin(p_family_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
 SELECT EXISTS (
   SELECT 1 FROM public.family_users fu
   WHERE fu.family_id=p_family_id AND fu.user_id=p_user_id AND fu.role='admin'
 );
$$;

REVOKE ALL ON FUNCTION public.vela_is_family_member(uuid,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.vela_is_family_admin(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vela_is_family_member(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vela_is_family_admin(uuid,uuid) TO authenticated;

-- Creation only via RPC: do not grant direct family INSERT to clients.
CREATE POLICY families_select ON public.families
FOR SELECT TO authenticated
USING (public.vela_is_family_member(id,(select auth.uid())));

CREATE POLICY family_users_select ON public.family_users
FOR SELECT TO authenticated
USING (public.vela_is_family_member(family_id,(select auth.uid())));

-- No client INSERT, UPDATE or DELETE policies for either table.

CREATE FUNCTION public.vela_create_family(p_name text)
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_family_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='28000';
  END IF;
  IF p_name IS NULL OR length(btrim(p_name)) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Invalid family name' USING ERRCODE='22023';
  END IF;
  INSERT INTO public.families(name,created_by)
  VALUES (btrim(p_name),v_uid) RETURNING id INTO v_family_id;

  INSERT INTO public.family_users(family_id,user_id,role)
  VALUES (v_family_id,v_uid,'admin');

  RETURN v_family_id;
END;
$$;
REVOKE ALL ON FUNCTION public.vela_create_family(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vela_create_family(text) TO authenticated;

COMMIT;

-- NOTE: A subsequent migration will add invitations with verified email,
-- one-time acceptance, expiry and concurrency-safe token handling.
-- Do not grant direct INSERT to family_users or families.
-- TEST with two real authenticated accounts/JWTs before implementing invites.
