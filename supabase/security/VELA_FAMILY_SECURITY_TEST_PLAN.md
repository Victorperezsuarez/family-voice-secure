# Vela family security: staged test plan

Status: PREPARED, NOT EXECUTED. No production DB changes are authorized by this file.

## Evidence from Supabase screenshots
- RLS enabled on families, family_users and family_invitations.
- family_users INSERT policy currently checks only auth.uid() = user_id.
- family_users SELECT checks auth.uid() = user_id.
- families creation policy checks created_by = auth.uid().
- Trigger on families creates default custom roles.
- Privileged role-setup functions are SECURITY DEFINER. Direct EXECUTE was revoked from anon and authenticated and verified false.
- Two test families have their creator as an admin.
- Invitation tokens are unique, have expiry and status, but no acceptance RPC was found by name.
- Existing family_invitations policies allow SELECT and INSERT; inspect both INSERT policy bodies before migration.

## Gate 1 — Read-only verification
1. Run vela_family_preflight.sql in a staging Supabase project.
2. Inspect existing family_users/families/family_invitations policy definitions.
3. Inspect frontend code for any direct family_users insert and invitation acceptance flow.
4. Verify whether an invitation token is ever logged, placed in a URL, or exposed via SELECT.
5. Take a staging backup or snapshot.

## Gate 2 — Negative/positive integration tests (staging only)
- User A creates Family A and becomes its admin.
- User B cannot directly add themself to Family A.
- User B cannot grant themself admin or assign a custom role.
- User A cannot add arbitrary accounts as admin through client-side direct inserts.
- User B can join only through a valid, unexpired, unused invitation for their identity.
- Reusing a token fails; expired/revoked token fails; mismatched email fails.
- User B cannot read Family A data before joining.
- Once authorized, User B can access only permitted Family A records.
- Family C records remain inaccessible to users of Family A.
- Creating a family still works after the new policies are applied.
- Concurrent acceptance of the same invitation cannot create duplicate memberships.

## Gate 3 — Migration and rollback
The sibling *_DRAFT.sql is a design candidate, not a production migration.
It deliberately does not implement invitation acceptance.
The policy includes a membership-table lookup that needs RLS recursion testing.
Do not apply to production until this draft is revised, tests pass,
the application code is compatible and rollback has been validated.

## Priority findings
P0: Prevent unauthorized self-enrollment in arbitrary family.
P0: Validate invitations server-side and consume atomically.
P1: Verify SELECT policies cannot leak invitation tokens.
P1: Review SECURITY DEFINER search_path, function grants and ownership.
P1: Verify family creator bootstrap and existing roles remain functional.
