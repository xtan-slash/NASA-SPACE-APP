# TerraShift AI: Project Status

_Last reviewed: 15 November 2026_

## Product snapshot

- **Challenge:** NASA Space Apps Challenge 2026, Field Shift: Adapting Farms with NASA Data.
- **Product:** TerraShift AI.
- **Original demonstration pilot:** Harohalli, Ramanagara, Karnataka, India.
- **Geographic capability:** Farm location search and manual coordinates support locations across India.
- **Live application:** https://terra-shift-ai-earth.base44.app/
- **Base44 workspace:** https://app.base44.com/apps/6af80c5819da5107aefce1e2
- **GitHub:** https://github.com/xtan-slash/NASA-SPACE-APP
- **Figma:** https://www.figma.com/design/vm1vpLWyygL4nhNInOjrwK/

## Implemented application capabilities

### Farm and crop setup
- Farm profile with location, soil, irrigation, and farmer-priority inputs.
- India-wide location search and manual coordinate support with geographic bounds validation.
- Shared Crop master catalogue and private per-account UserCrop additions/overrides.
- Account-specific active-farm selection.
- A private Harohalli demonstration-farm copy seeded for each account when its farm list loads.

### Climate and scenario analysis
- NASA POWER Daily Point API historical climate integration.
- Daily data parsing and annual, monthly, and seasonal aggregation.
- Missing-value handling and data-coverage reporting.
- Deterministic scenario scoring across soil, water, climate, and crop diversity.
- Configurable scoring weights and missing-dimension handling.
- Scenario simulator and comparison workflow.
- AI explanations for authenticated workspace scenarios.
- Deterministic explanations for the public sample-data demo.

### Application experience
- English, Hindi, and Kannada language options.
- Login, registration, password recovery, reset, and MFA routes.
- Protected personal workspace and sign-out control.
- Public read-only demo routes, including Judge Mode, using fixed sample data.
- Landing-page selected-location preview, location cue graphic, and loading skeletons.
- Mobile-friendly comparison and season-by-season score cards.

### Security-related implementation
- Creator-only read/update/delete rules for Farm, Scenario, ClimateSnapshot, and UserCrop.
- Signed-in creation for private records.
- Public-read, admin-write permissions for the shared Crop master catalogue.
- Authenticated server functions for climate loading and scenario explanation.
- Validation for calendar dates and paired coordinates.
- Security response headers, including report-only Content Security Policy.
- Best-effort in-memory request throttling per running application instance.

## Source and validation status

### Source identifiers

- **GitHub source snapshot:** commit `8552bda94c3050d8c614236e8ad00a48a10e9996` (15 November 2026).
- **Base44 workspace version reported during review:** `6cd411f6a451ca20e448513ac089ea6b2312f0bc`.
- **Source relationship:** the application source is mirrored under `app/` in GitHub. This is not an automatic two-way sync.
- **Deployment relationship:** the identifiers above do not establish which exact Base44 version is currently deployed to the public production URL. Do not infer deployment status from a GitHub commit or workspace version alone.

Six important source files were compared between the Base44 workspace and the GitHub snapshot during the latest review. Those six files matched exactly. This was a targeted comparison, not a byte-for-byte verification of every repository file.

### Checks reported in the Base44 workspace

The following command completed successfully:

```bash
npm run lint && npm run audit:security && npm audit --audit-level=moderate && npm run build
```

Results:
- ESLint: passed.
- Static security audit: passed.
- npm audit: zero reported vulnerabilities at the time of the check.
- Production build: passed.

The public live routes checked during the review returned HTTP 200:
- `/methodology`
- `/demo`
- `/demo/climate`

These route checks confirm that the pages responded. They do not prove that all authenticated workflows or backend authorization rules work correctly.

No GitHub commit status checks were reported for the reviewed source commit. The Base44 workspace checks above should not be described as GitHub Actions or repository CI results.

## Demonstration, data, and model limitations

- The Harohalli demonstration uses NASA POWER historical data for 2020–2025. It is not a 2026–2029 climate forecast.
- NASA POWER values are gridded climate/reanalysis data, not farm sensor measurements.
- The demonstration point at 12.68° N, 77.48° E is not a surveyed farm boundary or verified field centroid.
- No farmer interview or verified farm crop history is available.
- Ragi monocrop, ragi–horsegram, and maize–horsegram sequences are illustrative scenarios, not an observed farmer baseline or validated recommendations.
- Demo crop parameters and demo soil inputs are illustrative unless supported by a traceable source.
- The simulator models one crop per season and does not yet model intercropping.
- The scoring system is heuristic. It is not a yield, income, nutrient-balance, or validated soil-health prediction.
- NASA POWER GWETROOT represents model root-zone wetness, not a field soil test or direct field soil-moisture measurement.
- Confidence labels are completeness/uncertainty indicators, not statistical probabilities.
- Per-runtime in-memory request throttling is not globally distributed. Stronger shared or edge-level enforcement would be needed for a production-grade rate-limiting guarantee.

## Remaining verification

1. Test login, sign-out, password reset, and registration in the live application.
2. Confirm registration provisions a Base44 User record and the intended default role.
3. Test anonymous access to Farm, Scenario, ClimateSnapshot, and UserCrop.
4. Use two separate accounts to verify each account can access only its own private records.
5. Verify ordinary users can read the shared Crop catalogue but cannot write to it.
6. Verify personal UserCrop changes do not mutate master Crop records.
7. Test protected server functions without authentication and with another user's farm/scenario identifiers.
8. Confirm sign-out clears access and protected routes return to the login flow.
9. Test location retrieval outside Karnataka, for example Ludhiana, Punjab.
10. Review Hindi and Kannada screens, including authentication and MFA routes.
11. Review Nominatim usage-policy compliance and consider a controlled geocoding proxy/provider.
12. Review CSP report-only browser reports before considering enforcement.
13. Confirm the exact Base44 checkpoint and deployment version before making any production-deployment claim.

## Design status

The Figma file contains an editable TerraShift AI dashboard frame and reusable KPI card component. Climate Explorer was the next planned design screen and is not recorded as completed.
