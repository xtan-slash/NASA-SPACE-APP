# TerraShift AI — Security and Authentication

_Last reviewed: 15 November 2026_

## Account and data model

The signed-in workspace uses creator-owned records. The current Base44 entity rules are:

| Entity | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Farm | Signed-in user or admin | Creator only | Creator only | Creator only |
| Scenario | Signed-in user or admin | Creator only | Creator only | Creator only |
| ClimateSnapshot | Signed-in user or admin | Creator only | Creator only | Creator only |
| UserCrop | Signed-in user or admin | Creator only | Creator only | Creator only |
| Crop master catalogue | Admin only | Public read | Admin only | Admin only |

Admin accounts do not have a cross-account read, update, or delete bypass for private Farm, Scenario, ClimateSnapshot, or UserCrop records.

The master Crop catalogue is shared and read-only for ordinary users. Personal crop additions and edits are stored in UserCrop and merged into the catalogue for that account; they do not mutate shared master crop records.

The active-farm selection is stored separately per account. The Harohalli pilot demo is provided as a private copy for each account when its farm list loads, rather than exposing one shared private Farm row to every user.

## Authentication routes and app gate

- /login
- /register
- /forgot-password
- /reset-password
- /mfa
- Protected personal workspace under the authenticated app route group
- Signed-in account and sign-out controls in the app layout

Registration role provisioning still needs a fresh-account test. Do not assume arbitrary self-registration creates an authorized application User record with the intended role until verified.

## Protected server functions and public demo

- `loadClimateSnapshot` requires an authenticated user, verifies access to the referenced Farm, checks requested coordinates against the saved Farm coordinates, and uses the saved farm location for the NASA POWER request.
- `explainScenario` requires an authenticated user before loading scenario evidence and invoking the AI explanation flow.
- The public demo routes use fixed sample data and deterministic demo scoring. The public demo advisor does not access private workspace records or invoke the paid generative AI advisor.
- The AI Advisor language selection is passed to the explanation function as an allow-listed language code (English, Hindi, or Kannada).

## Static validation performed

- `npm run lint` passed.
- `npm run audit:security` passed all six static checks covering creator-only RLS, shared Crop catalogue permissions, UserCrop isolation, account-specific active-farm storage, sidebar labeling, and protected server functions/public demo behavior.
- `npm run build` passed.
- Latest Base44 checkpoint: `6af9786e08b3f90cc6196912`.
- Latest deployed source commit: `dddbf773138800dd5129ccc19958ecf793a93dce`.

## Security work still required

The static audit is not a live authorization or penetration test. The following checks remain open:

1. Re-run the Base44 security scan and review any findings.
2. Test anonymous access to Farm, Scenario, ClimateSnapshot, and UserCrop records.
3. Test two separate signed-in accounts and verify each can read/update/delete only its own records.
4. Verify ordinary users can read the master Crop catalogue but cannot write to it.
5. Verify a user can create and edit their own UserCrop overrides without changing master Crop records.
6. Verify registration creates or provisions the corresponding Base44 User record with the intended default role.
7. Attempt protected backend function calls without authentication and with another user's farm/scenario IDs.
8. Confirm sign-out clears access and protected routes return to the login flow.

## Important

A successful build and static policy audit do not prove runtime RLS enforcement or the complete authentication lifecycle. Keep the live tests visible until they have been executed and recorded.
