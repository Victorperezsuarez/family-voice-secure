# Vela — Family creation and invitation security review

Status: audit and proposed remediation only. No production database changes.

## Verified from Supabase inspection (2026-10-18)
- `families`, `family_users`, and `family_invitations` have RLS enabled.
- `family_users` INSERT policy currently checks only `auth.uid() = user_id`. It does **not** validate that the user was invited or authorized to join the specified family. This is a privilege escalation risk because the caller could choose `role='admin'` unless another guard exists.
- `families` INSERT policy checks `created_by = auth.uid()`; creation trigger creates default custom roles but does not insert creator membership.
- Test families A and B each have one admin who is the creator. This confirms current test state, not safety of the creation flow.
- `family_invitations` has INSERT/SELECT policies; no UPDATE policy was visible in the reviewed screenshot. Token is unique, role and status have CHECK constraints.
- SECURITY DEFINER helpers `is_family_member`, `is_family_admin`, `can_edit_family` use `family_users` and `auth.uid()`. Role setup functions were restricted from anon/authenticated EXECUTE.

## GitHub main branch findings
- `src/components/AppLayout.tsx` imports `CreateFamilyModal`, `FamilySwitcher`, and `FamilyDashboard`.
- These files are not present in the main branch `src/components` directory as inspected. Verify build before attempting UI integration.
- `src/App.tsx` does not expose a confirmed working family-creation route.

## Recommended order (not yet implemented)
1. Preserve backup/migration and test in a nonproduction Supabase branch/project.
2. Replace the permissive `family_users` INSERT policy with a server-controlled, transaction-safe join/acceptance flow. Do not grant admin based on client-submitted role.
3. Implement authenticated family creation in a controlled transaction: create family and creator admin membership; retain default-role trigger.
4. Implement invitation acceptance with expiry, invited-email verification, single-use token handling and server-side role assignment. Do not expose raw invitation tokens in logs.
5. Add RLS tests for outsider, invited user, admin, contributor, and viewer; test cross-family isolation and concurrency.
6. Restore/build missing React family UI components only after backend behavior and tests are verified.

Do not run destructive SQL or relax RLS to work around UI failures.
