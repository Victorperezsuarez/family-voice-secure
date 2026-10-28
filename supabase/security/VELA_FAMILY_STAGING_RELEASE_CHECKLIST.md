# Vela family access — staging release checklist

Implementation files:
- `supabase/security/vela_family_access_STAGING_CANDIDATE.sql`
- `src/lib/vela-family-access.ts`

**DO NOT EXECUTE ON PRODUCTION.** This is a staging candidate and has not been executed or integration-tested.

## Preflight compatibility blockers
1. Run the read-only `supabase/security/vela_family_preflight.sql` in a separate Supabase test project. Confirm actual RLS policies, constraints and triggers match assumptions.
2. Verify `families` INSERT policy enforces `created_by = auth.uid()` and SELECT permits the new creator to see their family after bootstrap.
3. Verify `family_users` has no additional permissive INSERT or ALL policies. Confirm that existing members' role_id is set by the custom role trigger and whether a new bootstrap member's role_id can remain NULL. If not, revise trigger before staging.
4. Verify `family_invitations` token column accepts the hashed string (67 characters), `email` is nullable or valid, and status accepts 'accepted'. Verify no trigger sends email containing the hashed token.
5. Check whether legacy pending invitations need cancellation/reissue; the new accept RPC does not accept legacy plaintext tokens.
6. Confirm `auth.users.email_confirmed_at` is present and email confirmation is enabled for intended users.
7. Verify migration's function ownership and no unexpected PUBLIC/anon EXECUTE grants.
8. Check that current UI does not rely on direct INSERT to `family_users` or `family_invitations`. The current main branch has missing family UI component files, so frontend integration is not yet complete.

## Integration scenarios with TWO authenticated test accounts
- A creates Family A -> transaction commits and A is admin exactly once.
- B creates Family B -> B is admin only there.
- B direct INSERT into A's `family_users` -> denied.
- B direct INSERT with `role='admin'` -> denied.
- B direct INSERT into `family_invitations` -> denied.
- A issues invitation for B, receives raw token once; DB stores only hash prefixed `v1:`.
- B accepts with verified matching email -> becomes specified member; status accepted.
- B attempts to accept same token again -> denied.
- Wrong email, expired token, non-admin inviter, and malformed token -> denied.
- Two concurrent acceptance attempts -> only one succeeds.
- B cannot read or change unrelated Family C's data.
- Existing test families A and B still have one creator/admin.
- No RLS recursion errors; no elevated grants or unexpected roles.

## Go / no-go
No production release until:
- migration and rollback both tested on staging,
- all cases above pass,
- existing custom_roles/role_id integration confirmed,
- build succeeds and UI integration works,
- legacy invitation handling agreed.

## Cost control
Only provision a paid staging branch once these code and schema prerequisites are resolved. Delete staging when tests finish to stop hourly charges.
