# TerraShift AI — System Architecture

_Last reviewed: 14 November 2026_

## 1. Product scope
TerraShift AI is an India-location-enabled crop-rotation decision-support prototype. Harohalli, Karnataka is the original pilot context. It combines a farm profile, configurable crop attributes, NASA POWER climate history, deterministic scoring, scenario comparison, and evidence-grounded AI explanations.

It is not a farm-management system, crop-yield model, or substitute for a soil test or agronomist.

## 2. Technology
- Application: TanStack Start, React 19, JavaScript, Vite
- UI: Tailwind CSS and Radix-based component library
- Data and persistence: Base44 entities and SDK
- AI explanation: server-side Base44 AI integration
- Charts: Recharts
- Hosting/runtime: Base44-hosted application
- Location search: OpenStreetMap Nominatim in the farm form, with manual coordinate entry as fallback
- Languages: English, Hindi, Kannada

## 3. Routes
| Route | Purpose |
| --- | --- |
| / | Public overview |
| /login | Sign in |
| /register | Registration |
| /forgot-password | Password recovery |
| /reset-password | Password reset |
| /mfa | Multi-factor authentication flow |
| /farm | Farm location, soil, irrigation, and priorities |
| /crops | Crop library |
| /climate | NASA POWER climate history and coverage |
| /simulator | Build crop sequences |
| /compare | Compare saved scenarios |
| /method | Scoring methodology |
| /advisor | Explain computed scenario results |

The application workspace is protected by a signed-in route gate. Authentication routes remain outside the protected workspace.

## 4. Data model
### Farm
Stores farm/block name, district, state, latitude/longitude, area, soil texture, soil pH, soil organic carbon, irrigation category, farmer priorities, soil-data provenance, notes, and demo status.

Soil values are user-entered, not retrieved from NASA POWER.

### Crop
Stores crop name/local name, botanical family, rotation role, season, duration, seasonal water-demand parameter, pH and temperature ranges, heat threshold, organic-carbon demand category, preferred/marginal soil textures, nitrogen-fixing flag, flood sensitivity, source note, and demo status.

### ClimateSnapshot
Stores farm ID, requested point, date range, source, exact source URL, retrieval timestamp, coverage, payload, and fetch status/error.

### Scenario
Stores farm ID, crop/season/year sequence, scoring weights, date range, crop IDs, last score, confidence, and notes.

## 5. Data flow
1. A signed-in user creates/selects a farm and enters its location and available soil information.
2. The app obtains coordinates through location search or manual entry.
3. The server-side climate function verifies access to the farm and checks that submitted coordinates match the saved farm coordinates.
4. The function requests NASA POWER Daily Point data for the saved farm point and selected date range.
5. Daily data is parsed; fill values are treated as missing.
6. The app aggregates valid observations into annual, monthly, and seasonal summaries, retaining parameter coverage.
7. The user creates crop-sequence scenarios.
8. The deterministic scoring engine evaluates each scenario using available farm, crop, and climate inputs.
9. The compare view presents scores, component dimensions, missing data, confidence, and caveats.
10. The server-side AI advisor explains computed evidence and should not invent agronomic facts or extrapolate beyond supplied evidence.

## 6. NASA POWER integration
Endpoint: https://power.larc.nasa.gov/api/temporal/daily/point

Community: AG (Agroclimatology).

Requested parameters:
- T2M, T2M_MAX, T2M_MIN
- PRECTOTCORR
- RH2M
- GWETROOT
- ALLSKY_SFC_SW_DWN
- WS2M

The original pilot history is 2020–2025. It is historical context, not a forecast for the 2026–2029 scenario horizon. The current request builder does not explicitly set time-standard; NASA POWER Daily API default is Local Solar Time (LST).

A POWER point request is not an in-field sensor measurement or a surveyed field polygon extraction. GWETROOT is root-zone wetness, not a laboratory soil test or SMAP surface-soil-moisture observation.

## 7. Location support
The farm form supports India-wide location search through OpenStreetMap Nominatim and manual latitude/longitude entry. Search results can populate district/state and coordinates; users must verify the selected location. Manual coordinates remain a fallback.

Production hardening still needed:
- Confirm compliance with Nominatim's current usage policy, including request rate, caching, attribution, and application identification. A controlled geocoding provider or server-side proxy may be preferable.
- Validate coordinates against the intended India coverage if the product is to remain India-only.
- Handle ambiguous place names and geocoding failures without silently selecting a result.

## 8. Trust, safety, and explainability
- Retain source, request URL, date range, units, retrieval time, and coverage.
- Keep missing values missing; do not fabricate observations.
- Distinguish model-derived gridded data from farmer-entered or lab-measured values.
- Label demo farm values and crop parameters.
- Show configured and effective scoring weights when dimensions are unavailable.
- Do not call the score a yield forecast, income forecast, or proof of soil-health improvement.
- Treat farmer priorities as context unless explicitly included in the scoring implementation.
- Ground AI explanations in deterministic findings, scores, and missing-data flags.

## 9. Current limitations
- No farmer interview or verified farm-level crop history is available.
- Baseline and alternative sequences are illustrative hypotheses.
- Current simulator assigns one crop per season; it cannot model simultaneous intercrops.
- Crop catalog parameters and demo soil values need local validation.
- The scoring engine is heuristic and not a calibrated crop/yield model.
- Additional NASA datasets are not yet integrated.

## References
- NASA Space Apps Field Shift brief: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/
- NASA POWER Daily API: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- UAS Bengaluru agro-climatic zones: https://www.uasbangalore.edu.in/en/agroclimatic-zones-uas-bangalore/
