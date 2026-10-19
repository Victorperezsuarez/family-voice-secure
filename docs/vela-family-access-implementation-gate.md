# Vela — implementation gate before paying for Supabase Pro

## Decision
Do not enable paid database branching yet. Complete and review the implementation in GitHub, then activate a short-lived staging environment only when ready to test.

## Production-grade design
1. **Bootstrap**: Replace all client INSERT permissions on `family_users` with a trusted, transaction-bound creation flow. In the same transaction as a new `families` row, insert exactly one `admin` membership for `created_by`. Ensure `created_by = auth.uid()` for user-triggered creation. Never take role from the client.
2. **Membership**: Deny direct INSERT, UPDATE and DELETE to ordinary authenticated clients unless there is a narrowly scoped and tested RLS policy. Membership mutation should occur only through authorized database functions or a privileged backend with server-side checks.
3. **Invitations**: Only existing family admins may issue invitations. Store a cryptographic hash of a high-entropy token, not a raw token. On acceptance, verify authenticated recipient's confirmed email, family, role, pending status, expiry and unused token; lock invitation row and insert membership + mark accepted in one transaction. Avoid leaking tokens through ordinary SELECT.
4. **Function hardening**: SECURITY DEFINER functions must set a trusted `search_path`, schema-qualify tables/functions, have explicit narrow EXECUTE grants and avoid trusting user-supplied IDs/roles.
5. **UI**: Restore missing family components or replace their imports, wrap authenticated screens in AuthProvider and protect admin routes; do not confuse client-side route guards with database authorization.
6. **Regression tests**: Test A/B families, uninvited outsiders, valid/invalid/reused/expired invitations, concurrent acceptance, creator bootstrap, cross-family reads/writes and existing users.
7. **Rollback**: Capture policy definitions and backups before staging; migration must have a rollback and a smoke-test checklist.

## Remaining evidence needed before implementation
- Full live `pg_policies` definitions for families, family_users and family_invitations.
- All database triggers/functions that can write these tables.
- Actual client/server code path used to create a family or accept an invitation.
- Staging availability and budget approval.

## Gate to deployment
No production SQL until staging tests are green, a rollback has been tested and the application build succeeds. The current *_DRAFT.sql is **not** a production fix.
