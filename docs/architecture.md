# TerraShift AI — System Architecture

_Last reviewed: 14 November 2026_

## 1. Product scope

TerraShift AI is a web-based crop-rotation decision-support prototype for a Harohalli, Karnataka pilot. It combines a farm profile, configurable crop attributes, NASA POWER climate history, deterministic scoring, scenario comparison, and evidence-grounded AI explanations.

It is not a farm-management system, crop-yield model, or substitute for a soil test or agronomist.

## 2. Current technology

- **Application framework:** TanStack Start
- **UI:** React 19, JavaScript, Tailwind CSS, component library based on Radix UI
- **Data and persistence:** Base44 entities and Base44 SDK
- **AI explanation:** TanStack AI through the Base44 AI gateway
- **Charts:** Recharts
- **Map capability:** React Leaflet is installed in project dependencies; do not assume a field-boundary or satellite overlay is implemented without verifying the relevant page.
- **Hosting/runtime:** Base44-hosted application, built with Vite and the Cloudflare Vite plugin.

## 3. Main application routes

| Route | Purpose |
| --- | --- |
| / or app home | Overview and entry point |
| /farm | Farm location, soil profile, irrigation, and priorities |
| /crops | Configurable crop library |
| /climate | NASA POWER climate history and coverage |
| /simulator | Build a multi-season crop sequence |
| /compare | Compare saved rotation scenarios |
| /method | Explain scoring and assumptions |
| /advisor | Ask for plain-language explanations of computed results |

## 4. Data model

Base44 entities currently defined:

### Farm

Stores farm/block name, district, latitude/longitude, area, soil texture, soil pH, soil organic carbon, irrigation category, farmer priorities, soil-data provenance, notes, and demo status.

Soil values are supplied by the user. soil_source should identify the soil test/source and date, or explicitly say that the value is a demo input.

### Crop

Stores crop name/local name, botanical family, rotation role, season, duration, seasonal water-demand parameter, pH range, optimum temperature range, heat threshold, organic-carbon demand category, preferred/marginal soil textures, nitrogen-fixing flag, flood sensitivity, source note, and demo status.

Crop parameter values are editable. Demo values must not be represented as validated local agronomic facts.

### ClimateSnapshot

Stores farm ID, requested point, date range, source, exact source URL, retrieval timestamp, coverage key, payload, and fetch status/error.

The payload contains aggregated values, units, and coverage information derived from NASA POWER responses.

### Scenario

Stores farm ID, crop/season/year sequence, scoring weights, date range, crop IDs, last score, confidence, and notes.

## 5. Data flow

1. A user creates or selects a farm and enters its location and available soil information.
2. The app builds a NASA POWER Daily Point API request for that point and a selected date range.
3. The returned daily series is parsed. API fill values are treated as missing, not converted into observations.
4. The app aggregates the valid data into annual, monthly, and Kharif/Rabi/Summer summaries. Parameter coverage is retained.
5. A user creates multiple rotation scenarios using crop records and season/year entries.
6. The deterministic scoring engine evaluates each scenario using available farm, crop, and climate inputs.
7. The compare view presents scenario scores, component dimensions, missing data, confidence, and caveats.
8. The AI advisor receives recomputed score evidence on the server and explains those results. It should not invent agronomic facts or extrapolate beyond the supplied evidence.

## 6. NASA POWER integration

Current endpoint:

https://power.larc.nasa.gov/api/temporal/daily/point

The request uses:
- parameters: the selected comma-separated POWER parameter codes
- community=AG
- latitude and longitude
- start and end in YYYYMMDD form
- format=JSON

The current code does not explicitly set time-standard; NASA POWER documents the Daily API default as Local Solar Time (LST). If UTC is required, the request must explicitly set time-standard=UTC and the UI/docs must state that choice.

Current requested parameters:
- T2M, T2M_MAX, T2M_MIN
- PRECTOTCORR
- RH2M
- GWETROOT
- ALLSKY_SFC_SW_DWN
- WS2M

The app currently uses the POWER point product, not a field-boundary extraction or in-field sensor. A point response must not be described as a direct measurement of the user's exact field.

## 7. Trust, safety, and explainability

- Keep source name, request URL, date range, units, retrieval time, and data coverage visible.
- Keep missing values missing. Do not silently interpolate or fabricate observations.
- Distinguish satellite/model-derived gridded data from farmer-entered or lab-measured data.
- Label illustrative crop parameters and demo farm values.
- Show configured and effective scoring weights when some dimensions are unavailable.
- Explain the score components and assumptions in plain language.
- Do not call the score a yield forecast, income forecast, or proof of soil-health improvement.
- Treat farmer priorities as constraints/context; do not imply they are included in the numeric score unless the implementation explicitly changes.
- Keep AI explanations grounded in the deterministic engine's returned findings, scores, and missing-data flags.

## 8. Current gaps / next engineering steps

1. Verify the compare page always supports at least three scenarios and clearly identifies the existing rotation.
2. Validate the current Harohalli pilot point and avoid presenting it as a real farm.
3. Add sourced local crop parameter profiles, retaining source and date for every parameter.
4. Consider SMAP, GPM/IMERG, Landsat/MODIS/VIIRS, ECOSTRESS, and SRTM as separate future integrations. Each needs a product choice, spatial/temporal resolution handling, provenance, missing-data policy, and test.
5. Evaluate whether the current seasonal windows match local cropping calendars; allow local configuration if needed.
6. Add automated tests for API parsing, fill values, aggregation, scoring boundaries, and missing-data behaviour.
7. Mirror the Base44 application source into GitHub once a safe, repeatable export/sync workflow is selected.

## References

- NASA Space Apps Field Shift brief: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/
- Challenge resources: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/?tab=resources
- NASA POWER Daily API: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
