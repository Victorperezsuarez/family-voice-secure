-- VELA / FAMILY ACCESS: STAGING-ONLY CANDIDATE (not production approved)
-- Replaces unrestricted self-enrollment with a tightly scoped creator bootstrap.
-- Important: This is a transitional policy, NOT the complete invitations solution.
-- Existing application must be checked for its family creation sequence first.
-- Preflight: confirm schema/policies match the audit; make a staging backup.
BEGIN;

-- Remove the existing policy that lets any authenticated user self-enroll
-- in an arbitrary family with a client-selected role.
DROP POLICY IF EXISTS "Users can join families" ON public.family_users;

-- A user may bootstrap ONLY their own creator/admin membership.
-- Family identity comes from families.created_by, not client-submitted role.
-- Avoid querying family_users from its own RLS policy (RLS recursion risk).
CREATE POLICY "Family creator bootstrap admin only"
ON public.family_users
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND role = 'admin'
  AND role_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.families AS f
    WHERE f.id = family_id
      AND f.created_by = (SELECT auth.uid())
  )
);

COMMIT;

-- SECURITY LIMITATIONS: do not deploy until addressed:
-- * The creator can potentially reinsert their membership if removed.
--   A production-grade solution should atomically bootstrap membership
--   via a trusted SECURITY DEFINER trigger/function, and deny direct inserts.
-- * Existing families SELECT RLS uses family_users. Confirm creator can see
--   newly created family when attempting to bootstrap, or INSERT will fail.
-- * Invitations require a server-controlled, transactional accept RPC with
--   validated user/email, expiry, token reuse prevention, role assignment.
-- * Other permissive INSERT policies, if present, OR together in PostgreSQL.
--   Review pg_policies before assuming this policy is the only INSERT path.
-- * A migration rollback and authenticated-user integration tests are required.
