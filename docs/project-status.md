# TerraShift AI — Project Status

_Last updated: 14 November 2026_

## Product snapshot
- **Challenge:** NASA Space Apps Challenge 2026, Field Shift: Adapting Farms with NASA Data.
- **Product:** TerraShift AI.
- **Original pilot:** Harohalli, Ramanagara, Karnataka, India.
- **Geographic capability:** Farm location search and manual coordinates support locations across India.
- **Application:** https://app.base44.com/apps/6af80c5819da5107aefce1e2/editor/preview
- **GitHub:** https://github.com/xtan-slash/NASA-SPACE-APP
- **Figma:** https://www.figma.com/design/vm1vpLWyygL4nhNInOjrwK

## Implemented
- Farm profile with location, soil, irrigation, and farmer priorities.
- India-wide location search and manual coordinates.
- Crop library and crop parameter editing.
- NASA POWER Daily Point API historical climate integration.
- Climate aggregation and missing-data coverage.
- Deterministic scenario scoring and weight controls.
- Scenario simulator and comparison workflow.
- Evidence-grounded AI advisor.
- English, Hindi, and Kannada language options.
- Login, registration, password recovery, reset, and MFA routes.
- Protected application workspace and sign-out control.
- Owner/admin RLS for Farm, Scenario, and ClimateSnapshot.
- Shared read-only Crop library for non-admin users; admin-only crop writes.
- Authenticated server functions for climate loading and scenario explanation.

## Verified in the latest security-related code checkpoint
- Lint passed.
- Production build passed.
- Entity schemas inspected after RLS configuration.
- Base44 checkpoint saved: `6af8363f48a31f6866dc3f1f`.
- Checkpoint commit: `32d685bff114832e3f2a271547dcc081dac4f050`.

## Demonstration and data limitations
- NASA POWER history shown in the prototype is 2020–2025, not a 2026–2029 forecast.
- Original Harohalli point 12.68° N, 77.48° E is a demo point, not a surveyed farm.
- No farmer interview or verified farm crop history is available.
- Ragi monocrop, ragi–horsegram, and maize–horsegram sequences are illustrative scenarios, not a farmer's observed baseline or validated recommendations.
- Crop parameters and demo soil values are illustrative unless supported by a recorded source.
- Simulator supports one crop per season and does not yet model intercropping.
- The scoring system is heuristic and is not a yield, income, or validated soil-health prediction.
- POWER GWETROOT is root-zone wetness, not a field soil test.

## Open tasks for the next session
1. Test login, sign-out, password reset, and registration flow in the live preview.
2. Confirm whether registration provisions a Base44 User record and default role correctly.
3. Re-run the Base44 security scan.
4. Test anonymous access and cross-user isolation for Farm, Scenario, and ClimateSnapshot.
5. Test protected server functions against unauthenticated and cross-user requests.
6. Browser-test India location search, manual coordinates, and language switching.
7. Review Nominatim usage-policy compliance and decide whether to add a controlled geocoding proxy/provider.
8. Continue app-to-GitHub source mirroring if a repeatable export/sync path is established. This repository currently contains documentation only.

## Design status
A Figma file has been created with an editable TerraShift AI dashboard frame and reusable KPI card component. Climate Explorer was the next planned design screen but has not yet been recorded as completed.
