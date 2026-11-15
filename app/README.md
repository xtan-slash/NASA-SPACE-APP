# TerraShift AI application source

This directory is the current source snapshot of TerraShift AI, mirrored from the Base44 workspace.

- **Product:** TerraShift AI
- **Challenge:** NASA Space Apps Challenge 2026, Field Shift: Adapting Farms with NASA Data
- **Framework:** TanStack Start, React 19, Base44 SDK
- **Source branch:** Base44 `main`
- **Source commit:** `d7ed4d726fb83739623485e1b6abd9747765a974`
- **Snapshot date:** 15 November 2026

## Features in this source

- India-wide farm location selection and coordinate validation.
- NASA POWER Daily Point historical climate retrieval and aggregation.
- Climate coverage, missing-value handling, and recent climate monitoring.
- Crop catalogue with private per-account crop overrides.
- Rotation simulation and deterministic scoring across soil, water, climate, and diversity.
- Scenario comparison and evidence-grounded AI advisor.
- Public demo and Judge Mode routes.
- English, Hindi, and Kannada interface translations.
- Authentication, MFA routes, owner-scoped records, server-side validation, and protected server functions.
- Per-runtime request throttling and security response headers.
- Location cue graphics and loading skeletons.

## Local development

```bash
npm ci
base44 login
base44 link
base44 dev
```

## Checks

```bash
npm run lint
npm run audit:security
npm audit --audit-level=moderate
npm run build
```

The latest recorded validation passed lint, the static security audit, dependency audit (zero reported vulnerabilities), and production build. Static security checks do not replace live anonymous and cross-account authorization testing.

## Important limitations

- NASA POWER is gridded historical climate context, not an in-field sensor or a forecast.
- The scoring model is a heuristic prototype, not a validated yield, income, or soil-health prediction.
- Demonstration crop sequences and farm inputs are illustrative, not farmer-reported baselines or validated local recommendations.
- Rate limiting is per runtime instance, not a globally distributed limiter.
- Live two-account isolation testing remains outstanding.

The root repository README and `docs/` contain the project overview, methodology, data provenance, security notes, and status. This snapshot is not an automatic two-way sync with Base44.
