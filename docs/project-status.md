# TerraShift AI — Project Status

_Last updated: 15 November 2026 (latest Base44 source snapshot mirrored to GitHub)_

## Product snapshot
- **Challenge:** NASA Space Apps Challenge 2026, Field Shift: Adapting Farms with NASA Data.
- **Product:** TerraShift AI.
- **Original pilot:** Harohalli, Ramanagara, Karnataka, India.
- **Geographic capability:** Farm location search and manual coordinates support locations across India.
- **Application:** https://app.base44.com/apps/6af80c5819da5107aefce1e2/editor/preview
- **Production app:** https://terra-shift-ai-earth.base44.app/
- **GitHub:** https://github.com/xtan-slash/NASA-SPACE-APP
- **Figma:** https://www.figma.com/design/vm1vpLWyygL4nhNInOjrwK

## Implemented
- Farm profile with location, soil, irrigation, and farmer priorities.
- India-wide location search and manual coordinate support with mainland bounding-box validation.
- Crop library and private per-account crop parameter overrides.
- NASA POWER Daily Point API historical climate integration, daily parsing, and annual/monthly/seasonal aggregation.
- Missing-value handling, data coverage reporting, and recent climate monitoring.
- Deterministic scenario scoring across soil, water, climate, and crop diversity, with configurable weights and edge-case handling.
- Scenario simulator and comparison workflow.
- Evidence-grounded AI advisor for private workspace scenarios; deterministic explanations for public demo.
- English, Hindi, and Kannada language options.
- Login, registration, password recovery, reset, and MFA routes.
- Protected application workspace and sign-out control.
- Creator-only read/update/delete access for Farm, Scenario, ClimateSnapshot, and UserCrop, with signed-in creation and no admin cross-account bypass.
- Shared public-read master Crop catalogue with admin-only writes.
- Authenticated server functions for climate loading and scenario explanation.
- Public read-only demo routes, including Judge Mode, using fixed sample data.
- Account-specific active-farm selection and per-account private Harohalli demo-farm seeding.
- Landing-page selected-location preview, location cue graphic, and loading skeletons.
- Mobile-friendly comparison and season-by-season score cards.
- Best-effort per-runtime request throttling for expensive/private and public demo server functions.
- Input validation for calendar dates and paired coordinates.
- Security response headers, including report-only CSP.
- Hindi and Kannada translations for newer location-aware demo and climate features.

## Latest source and validation
- **Base44 source branch:** `main`.
- **Base44 source commit:** `d7ed4d726fb83739623485e1b6abd9747765a974`.
- **Latest Base44 checkpoint:** `6af984dddb460f31c37984ca` (not deployed to production).
- **Production deployment:** remains the 15 November 2026 deployment of checkpoint `6af96eb9b058cc2c703a1dae`.
- **GitHub sync:** current Base44 tracked source mirrored under `app/`; project and app README files updated.
- `npm run lint`: passed.
- `npm run audit:security`: passed static checks.
- `npm audit --audit-level=moderate`: zero reported vulnerabilities.
- `npm run build`: passed.

Static checks do not replace live anonymous and cross-account authorization tests. The GitHub source snapshot has not been independently clean-built in this sync operation.

## Demonstration and data limitations
- NASA POWER history shown in the pilot is 2020–2025, not a 2026–2029 forecast.
- POWER values are gridded model/reanalysis data, not farm sensor measurements.
- The original Harohalli point 12.68° N, 77.48° E is a demo point, not a surveyed farm.
- No farmer interview or verified farm crop history is available.
- Ragi monocrop, ragi–horsegram, and maize–horsegram sequences are illustrative scenarios, not an observed farmer baseline or validated recommendations.
- Crop parameters and demo soil values are illustrative unless supported by a recorded source.
- The simulator supports one crop per season and does not yet model intercropping.
- The scoring system is heuristic and is not a yield, income, or validated soil-health prediction.
- POWER GWETROOT is root-zone wetness, not a field soil test.
- Per-runtime in-memory rate limits are not globally distributed; edge/WAF or durable shared enforcement would be needed for stronger production guarantees.

## Remaining verification
1. Test login, sign-out, password reset, and registration flow in the live preview.
2. Confirm registration provisions a Base44 User record and default role correctly.
3. Test anonymous access and cross-user isolation for Farm, Scenario, ClimateSnapshot, and UserCrop using two real accounts.
4. Test protected server functions against unauthenticated and cross-user requests.
5. Confirm India location retrieval outside Karnataka, for example Ludhiana, Punjab.
6. Manually review Hindi and Kannada screens, including authentication and MFA routes.
7. Review Nominatim usage-policy compliance and consider a controlled geocoding proxy/provider.
8. Review CSP report-only browser reports before considering enforcement.
9. Deploy the latest Base44 checkpoint only after preview review and explicit readiness confirmation.

## Design status
The Figma file contains an editable TerraShift AI dashboard frame and reusable KPI card component. Climate Explorer was the next planned design screen and is not recorded as completed.
