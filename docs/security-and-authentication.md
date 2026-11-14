# TerraShift AI — Security and Authentication

_Last reviewed: 14 November 2026_

## Implemented configuration

The Base44 app now has a signed-in workspace gate and owner-oriented row-level access rules.

| Entity | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Farm | Signed-in user or admin | Record owner or admin | Record owner or admin | Record owner or admin |
| Scenario | Signed-in user or admin | Record owner or admin | Record owner or admin | Record owner or admin |
| ClimateSnapshot | Signed-in user or admin | Record owner or admin | Record owner or admin | Record owner or admin |
| Crop | Admin only | Shared/public read retained | Admin only | Admin only |

The Crop library is intentionally shared so signed-in users can browse common crop definitions. Only admins can modify the library.

## Authentication routes and app gate
- /login
- /register
- /forgot-password
- /reset-password
- /mfa
- Protected application workspace under the / app route group
- Signed-in email and sign-out control in the app layout

The app uses Base44's authentication components and user context. Registration and user provisioning should be tested before inviting additional users. The current workspace previously showed one registered admin user; do not assume that arbitrary self-registration automatically creates an authorized application User record with the correct role.

## Protected server functions
- `loadClimateSnapshot` requires an authenticated user, verifies access to the referenced Farm, checks requested coordinates against the saved Farm coordinates, and uses the saved farm location for the NASA POWER request.
- `explainScenario` requires an authenticated user before loading scenario evidence and invoking the AI explanation flow.

## Validation already performed
- Entity schemas were inspected after the RLS changes.
- `npm run lint` passed.
- `npm run build` passed.
- A Base44 checkpoint was saved: **Login gate, owner-based data permissions and protected backend functions**.
- Checkpoint commit: `32d685bff114832e3f2a271547dcc081dac4f050`.

## Security work still required
The implementation is not yet independently security-audited. The following checks remain open:
1. Re-run the Base44 security scan and confirm the four public-record-access critical findings are resolved.
2. Test anonymous access to Farm, Scenario, and ClimateSnapshot records.
3. Test two separate user accounts and verify each can read/update/delete only their own records.
4. Verify that Crop records remain readable to signed-in users while writes are admin-only.
5. Verify registration creates or provisions a corresponding Base44 User record with the intended role. Test invite-only or admin-provisioned registration if required.
6. Attempt to call both protected backend functions without authentication and with another user's farm/scenario IDs.
7. Check any webhooks, scheduled jobs, or external callers not covered by static app-code caller analysis.
8. Confirm sign-out clears access and protected routes return to the login flow.

## Important
A successful local build proves code compiles; it does not prove that runtime RLS enforcement or the complete authentication lifecycle is secure. Keep the remaining tests visible until they have been executed and recorded.
