# TerraShift AI

### Field Shift: Adapting Farms with NASA Data | NASA Space Apps Challenge 2026

TerraShift AI is an AI-assisted, explainable web application for exploring crop-rotation scenarios using NASA climate context, farm-entered information, and configurable crop characteristics. Harohalli, Karnataka is the original demonstration pilot. Farm setup supports locations across India.

> **Decision support, not an agronomic prescription.** The current scores are prototype suitability indicators based on disclosed inputs, assumptions, and heuristics. They are not validated yield, income, nutrient-balance, or soil-improvement predictions. Farmers and qualified local agricultural experts remain the decision-makers.

## Project links

- **Live application:** https://terra-shift-ai-earth.base44.app/
- **GitHub repository:** https://github.com/xtan-slash/NASA-SPACE-APP
- **NASA Space Apps challenge:** https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/
- **Harohalli local event:** https://www.spaceappschallenge.org/2026/local-events/harohalli/

## What the application currently includes

- Farm setup with India-wide location search and manual coordinates.
- Farm-entered soil, irrigation, and farmer-priority information.
- A configurable crop catalogue, with private per-account crop additions and overrides.
- Historical climate retrieval through the NASA POWER Daily Point API.
- Daily data parsing, annual/monthly/seasonal aggregation, and missing-data coverage reporting.
- Deterministic scenario scoring across soil, water, climate, and crop diversity.
- Crop-rotation scenario creation, simulation, and comparison.
- An AI advisor for authenticated workspace scenarios and deterministic explanations in the public demo.
- English, Hindi, and Kannada language options.
- Sign-in, registration, password recovery, MFA routes, and a protected workspace.
- Private per-account Farm, Scenario, ClimateSnapshot, and UserCrop records.
- Public, read-only demonstration routes using fixed sample data.
- Input validation, response security headers, and best-effort server-function request throttling.

The current implementation and outstanding work are tracked in [Project status](docs/project-status.md).

## NASA data: integrated and not yet integrated

**Integrated:** NASA POWER Daily Point API (Agroclimatology community).

The application requests:

| Parameter | Meaning |
| --- | --- |
| T2M | Mean air temperature |
| T2M_MAX | Maximum air temperature |
| T2M_MIN | Minimum air temperature |
| PRECTOTCORR | Bias-corrected precipitation |
| RH2M | Relative humidity at 2 m |
| GWETROOT | Root-zone soil wetness |
| ALLSKY_SFC_SW_DWN | All-sky shortwave irradiance |
| WS2M | Wind speed at 2 m |

The current Harohalli demonstration uses historical data for 2020–2025. These records are historical gridded climate context, not a forecast for 2026–2029 and not measurements from sensors installed on a farm.

**Not integrated:** SMAP, GPM/IMERG, Landsat, MODIS/VIIRS, ECOSTRESS, and SRTM. These are possible future data sources and must not be described as active application inputs.

See [NASA data sources and provenance](docs/nasa-data-sources.md).

## Pilot context and agronomic limitations

- The original demonstration point is 12.68° N, 77.48° E. It is not a surveyed farm boundary or verified field centroid.
- The Harohalli/Ramanagara pilot context is treated as UAS Bengaluru Agro-climatic Zone 5, Eastern Dry Zone.
- No farmer interview or verified farm-level crop history is currently available.
- The ragi monocrop, ragi–horsegram, and maize–horsegram sequences are illustrative comparison scenarios, not an observed farmer baseline or validated recommendations.
- Demo crop parameters and demo soil values are illustrative unless a traceable source is recorded.
- The simulator currently models one crop per season. It does not model intercropping.

See [local crop context](docs/local-crop-context.md).

## Scoring and interpretation

The deterministic scoring engine compares four dimensions using default normalized weights:

- Soil: 30%
- Water: 30%
- Climate: 25%
- Crop diversity: 15%

Weights can be configured. When a dimension cannot be scored because required information is missing, it is excluded and the remaining available weights are renormalized. The application reports missing information and assumptions alongside the score.

The scoring system is a transparent prototype heuristic. Its confidence label is not a probability, and a higher composite score does not establish that a rotation is agronomically superior.

See [scoring methodology](docs/scoring-methodology.md).

## Security and account model

The private workspace uses creator-only read, update, and delete access for Farm, Scenario, ClimateSnapshot, and UserCrop records. Signed-in users can create their own records. Admin accounts do not have a cross-account read/update/delete bypass for these private entities.

The shared Crop master catalogue is publicly readable and admin-write only. Personal crop additions and edits are stored separately in UserCrop. The public demo uses fixed sample data and is designed not to access private workspace records.

Static checks have passed in the current Base44 workspace, but live anonymous-access, two-account isolation, and authentication lifecycle tests remain outstanding. Per-runtime in-memory throttling is best-effort and is not a globally distributed rate limiter. These checks do not amount to an independent security audit.

See [security and authentication](docs/security-and-authentication.md).

## Repository and source status

The tracked application source is mirrored under [app/](app/), including routes, components, scoring and data logic, translations, Base44 entity schemas, configuration, and dependency files. GitHub is a source mirror of the Base44 workspace, not an automatic two-way sync. A change in one environment should not be assumed to have reached the other until it is synced and verified.

The latest repository source snapshot referenced by the project status is commit `8552bda` (15 November 2026). The current Base44 workspace reports version `6cd411f6a451ca20e448513ac089ea6b2312f0bc`. These identifiers refer to different systems and should not be treated as proof that a particular Base44 checkpoint is deployed to production.

For the latest validation results and remaining verification tasks, see [Project status](docs/project-status.md).

## Documentation

- [System architecture](docs/architecture.md)
- [NASA data sources and provenance](docs/nasa-data-sources.md)
- [Scoring methodology](docs/scoring-methodology.md)
- [Local crop context](docs/local-crop-context.md)
- [Security and authentication](docs/security-and-authentication.md)
- [Project status and next steps](docs/project-status.md)
