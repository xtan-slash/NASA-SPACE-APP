# TerraShift AI: Security and Authentication

_Last reviewed: 15 November 2026_

This document describes the intended and currently configured application access model. Static checks are not a substitute for live authorization testing or an independent security assessment.

## 1. Account and data model

The private workspace uses creator-owned records. The current Base44 entity rules are:

| Entity | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Farm | Signed-in user or admin | Creator only | Creator only | Creator only |
| Scenario | Signed-in user or admin | Creator only | Creator only | Creator only |
| ClimateSnapshot | Signed-in user or admin | Creator only | Creator only | Creator only |
| UserCrop | Signed-in user or admin | Creator only | Creator only | Creator only |
| Crop master catalogue | Admin only | Public read | Admin only | Admin only |

Admin accounts do not have a cross-account read, update, or delete bypass for private Farm, Scenario, ClimateSnapshot, or UserCrop records.

The shared Crop master catalogue is readable by the public and writable only by admins. Personal crop additions and edits are stored in UserCrop and merged into the catalogue for that account. They do not mutate shared master Crop records.

The active-farm selection is stored separately per account. The Harohalli demonstration farm is seeded as a private copy for each account when its farm list loads. It is not intended to be one shared private Farm record.

## 2. Authentication routes and workspace gate

The application includes these routes:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/mfa`
- Protected personal workspace routes under the authenticated app route group.

The app layout includes signed-in account and sign-out controls.

**Open verification item:** registration role provisioning needs a fresh-account test. Do not assume that self-registration creates the intended Base44 User record and role until that flow has been tested end to end.

## 3. Protected server functions

- `loadClimateSnapshot` requires an authenticated user, verifies access to the referenced Farm, checks requested coordinates against the saved Farm coordinates, and uses the saved farm location for the NASA POWER request.
- `explainScenario` requires an authenticated user before loading scenario evidence and invoking the AI explanation flow.
- The AI Advisor language selection is passed to the explanation function as an allow-listed language code: English, Hindi, or Kannada.

These behaviours are reflected in the source and static audit. Runtime authorization still needs to be tested with anonymous requests and identifiers belonging to a different account.

## 4. Public demonstration boundary

The public demo routes use fixed sample data and deterministic demo scoring. The public demo advisor is designed not to access private workspace records or invoke the authenticated generative AI advisor.

The public demo is read-only. It is intended for evaluation and exploration of the sample scenario, not for creating, editing, or deleting a user's private farm or scenario records.

## 5. Additional safeguards

The current implementation includes:
- Validation of calendar-date inputs.
- Validation of paired latitude/longitude inputs and supported geographic bounds.
- Security response headers, including a report-only Content Security Policy.
- Best-effort in-memory request throttling for protected and public demo server functions.

**Rate-limit limitation:** in-memory throttling applies per running application instance. It is not a globally shared counter and does not provide a distributed rate-limiting guarantee. A durable shared store or edge/WAF-level control would be needed for stronger enforcement across instances.

**CSP limitation:** the Content Security Policy is report-only. It reports policy violations but does not yet enforce blocking. Review browser reports before changing it to enforcement mode.

## 6. Static validation performed

During the latest Base44 workspace review, the following command completed successfully:

```bash
npm run lint && npm run audit:security && npm audit --audit-level=moderate && npm run build
```

Reported results:
- ESLint passed.
- `npm run audit:security` passed its static checks for creator-only private entities, shared Crop catalogue permissions, UserCrop override handling, account-specific active-farm storage, sidebar labelling, and protected server-function/public-demo boundaries.
- npm audit reported zero vulnerabilities at the time of the check.
- The production build passed.

The static audit is a source-level check. It does not prove that Base44 enforces every policy as expected at runtime, that registration provisions roles correctly, or that all backend paths resist cross-account access.

The Base44 workspace version reported during the review was:

```
6cd411f6a451ca20e448513ac089ea6b2312f0bc
```

The GitHub source snapshot reviewed separately was commit `8552bda94c3050d8c614236e8ad00a48a10e9996`. These are identifiers from different systems. Neither identifier alone proves which version is deployed to the public production URL.

## 7. Required live security tests

Keep these items open until the results are recorded:

1. Run the Base44 security scan and review its findings.
2. Test anonymous access to Farm, Scenario, ClimateSnapshot, and UserCrop records.
3. Test with two separate signed-in accounts. Confirm each can read, update, and delete only its own records.
4. Confirm ordinary users can read the master Crop catalogue but cannot create, update, or delete master Crop records.
5. Confirm a user can create and edit their own UserCrop records without changing shared Crop records.
6. Confirm registration provisions the corresponding Base44 User record with the intended default role.
7. Call protected backend functions without authentication and with another user's farm/scenario identifiers. Confirm access is rejected.
8. Confirm sign-out clears access and protected routes return to the login flow.
9. Review CSP report-only output and decide whether the policy is ready for enforcement.

## Important

A successful build, dependency audit, lint run, and static policy audit are useful engineering checks. They do not prove runtime RLS enforcement, secure role provisioning, or the complete authentication lifecycle. Do not describe TerraShift AI as independently security-audited until those tests have been completed by an appropriate reviewer.
