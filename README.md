# TerraShift AI
### Field Shift: Adapting Farms with NASA Data | NASA Space Apps Challenge 2026

TerraShift AI is an AI-assisted, explainable web app for exploring crop-rotation strategies using NASA climate context and farm-entered information. Harohalli, Karnataka is the original pilot, while farm setup now supports locations across India.

> **Decision support, not a prescription.** Scores are prototype suitability indicators based on disclosed inputs and assumptions. They are not validated yield, income, nutrient-balance, or guaranteed soil-improvement predictions. Farmers and local agricultural experts remain the decision-makers.

## Challenge
The official Field Shift brief asks teams to combine NASA Earth observations with local soil information, crop characteristics, and farmer priorities. It asks for comparison of at least three rotation strategies, including the existing rotation where known, and an explanation of evidence, potential benefits, information gaps, and risks.

Official brief: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/

## Current application
The runnable app is hosted in Base44 and built with TanStack Start, React 19, and the Base44 SDK.

- Farm setup with location search and manual coordinates for locations across India.
- Soil, irrigation, and farmer-priority inputs with provenance/demo disclosures.
- Configurable crop library.
- NASA POWER Daily Point API integration for historical climate context.
- Daily data parsing, annual/monthly/seasonal aggregation, and missing-data coverage.
- Deterministic scoring across soil, water, climate, and crop diversity.
- Scenario simulator, comparison view, methodology page, and evidence-grounded AI advisor.
- English, Hindi, and Kannada language options.
- Sign-in, registration, password reset, MFA routes, signed-in app gate, and owner-based data access rules.

**Base44 app:** https://app.base44.com/apps/6af80c5819da5107aefce1e2/editor/preview

## NASA data
**Integrated:** NASA POWER Daily Point API (Agroclimatology community). See [NASA data sources](docs/nasa-data-sources.md).

The app requests T2M, T2M_MAX, T2M_MIN, PRECTOTCORR, RH2M, GWETROOT, ALLSKY_SFC_SW_DWN, and WS2M. The current pilot history is 2020–2025. This is historical context, not a forecast for 2026–2029.

**Not yet integrated:** SMAP, GPM/IMERG, Landsat, MODIS/VIIRS, ECOSTRESS, and SRTM. Do not present these as live app data until implemented and verified.

NASA POWER API docs: https://power.larc.nasa.gov/docs/services/api/temporal/daily/

## Pilot and agronomic context
The original demo point is 12.68° N, 77.48° E. It is not a surveyed farm boundary or verified field centroid. Harohalli/Ramanagara is treated as UAS Bengaluru Agro-climatic Zone 5, Eastern Dry Zone, in the current local-context note.

No farmer interview or verified farm crop history is available. The current ragi monocrop, ragi–horsegram, and maize–horsegram scenarios are illustrative hypotheses, not a real farmer baseline or validated recommendations. The simulator currently models one crop per season and does not model intercropping.

See [local crop context](docs/local-crop-context.md).

## Scoring and limitations
The deterministic scoring engine is documented in [scoring methodology](docs/scoring-methodology.md). Default normalized weights are Soil 30%, Water 30%, Climate 25%, and Diversity 15%. Heuristics and assumptions are disclosed in the method. Demo crop parameters and demo soil inputs must not be presented as verified facts.

## Security and account model
Farm, Scenario, and ClimateSnapshot records use owner/admin access rules. The shared Crop library remains publicly readable, while crop create/update/delete are admin-only. The app's protected workspace requires sign-in; climate loading and AI scenario explanation backend functions require an authenticated user.

See [security and authentication](docs/security-and-authentication.md). The implementation has passed lint/build, but a fresh security scan and multi-user/anonymous access tests remain outstanding. Do not treat the configuration as independently security-audited.

## Documentation
- [System architecture](docs/architecture.md)
- [NASA data sources and provenance](docs/nasa-data-sources.md)
- [Scoring methodology](docs/scoring-methodology.md)
- [Local crop context](docs/local-crop-context.md)
- [Security and authentication](docs/security-and-authentication.md)
- [Current project status and next steps](docs/project-status.md)

## Design
Figma product UI: https://www.figma.com/design/vm1vpLWyygL4nhNInOjrwK

## Repository scope
The full tracked application source has now been exported from the Base44 workspace into [`app/`](app/), including routes, components, scoring and data logic, Base44 entity schemas, configuration, and the dependency lockfile. Generated build output, installed dependencies, local app-link metadata, and secrets are excluded. The repository root retains the challenge and project documentation. This is a source snapshot, not an automatic two-way sync with Base44.

## Local event
Harohalli local event: https://www.spaceappschallenge.org/2026/local-events/harohalli/
Global offers: https://www.spaceappschallenge.org/2026/global-offers/
