-- VELA: DRAFT migration for staging only.
-- DO NOT RUN ON PRODUCTION until the invitation acceptance path and RLS integration tests pass.
-- Scope: close the arbitrary self-enrollment hole in public.family_users.
-- Existing policy: "Users can join families" WITH CHECK (auth.uid() = user_id).
-- This draft replaces it with a creator-only bootstrap rule. Invitations are intentionally
-- NOT accepted through direct family_users INSERT; a validated server-side RPC will be needed.
BEGIN;

DROP POLICY IF EXISTS "Users can join families" ON public.family_users;

CREATE POLICY "Family creator can bootstrap own admin membership"
ON public.family_users
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND role = 'admin'
  AND role_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.families f
    WHERE f.id = family_id
      AND f.created_by = (SELECT auth.uid())
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.family_users fu
    WHERE fu.family_id = family_id
  )
);

COMMIT;

-- STOP: This draft is not production-ready.
-- The family_users self-query in an INSERT policy may interact with existing RLS;
-- test for recursion/visibility and bootstrap with two isolated test users.
-- The current invitation workflow needs an atomic server-side acceptance function:
-- validate recipient identity, token expiry, pending status and one-time use;
-- then insert membership and mark invitation accepted in one transaction.
-- Test before any production change, and add a rollback migration.
