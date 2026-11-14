# TerraShift AI — NASA Data Sources and Provenance

_Last reviewed: 14 November 2026_

This document separates datasets that the current prototype actually calls from datasets named in the NASA Space Apps challenge resources that remain possible extensions.

## 1. Integrated: NASA POWER Daily Point API

**Status:** Integrated in src/lib/power.js.

**Endpoint:** https://power.larc.nasa.gov/api/temporal/daily/point

**Community:** Agroclimatology (AG).

**Request dimensions:** latitude, longitude, start date, end date, selected parameters, JSON format.

### Parameters requested by the current app

| Code | Meaning in app | Unit configured in app |
| --- | --- | --- |
| T2M | Mean air temperature | °C |
| T2M_MAX | Maximum air temperature | °C |
| T2M_MIN | Minimum air temperature | °C |
| PRECTOTCORR | Bias-corrected precipitation | mm/day |
| RH2M | Relative humidity at 2 m | % |
| GWETROOT | Root-zone soil wetness | fraction 0–1 |
| ALLSKY_SFC_SW_DWN | All-sky shortwave irradiance | MJ/m²/day |
| WS2M | Wind speed at 2 m | m/s |

The application aggregates daily values into annual, monthly, and seasonal summaries. Kharif is currently represented as June–October, Rabi as November–March, and Summer/Zaid as April–May. These are prototype calendar windows and must be checked against the actual crop calendar of the pilot farm.

### Important interpretation notes

- NASA POWER's Daily API returns analysis-ready daily solar and meteorological time series. Its documentation says the parameters are returned at their original source spatial resolution.
- The app makes a point request. It is not measuring the field with an on-site sensor and does not ingest a surveyed field polygon.
- NASA POWER documents the Daily API default time standard as Local Solar Time (LST). The current request builder does not pass an explicit time-standard parameter, so the response should be treated as using the documented default unless the code is changed.
- API fill values are excluded and counted as missing. They are not treated as zero.
- GWETROOT is a POWER root-zone soil-wetness variable. It is not a farm soil test and is not a substitute for SMAP surface-soil-moisture observations.
- Rainfall-to-water-supply conversion and irrigation amounts used by the score are model assumptions, not direct NASA observations.

Official documentation: https://power.larc.nasa.gov/docs/services/api/temporal/daily/

## 2. Challenge-listed NASA datasets: possible future integrations

The official challenge resources identify the following NASA datasets and uses. They are **not currently integrated in the app** unless explicitly noted above.

| Dataset | Potential use in TerraShift AI | Integration status |
| --- | --- | --- |
| SMAP | Surface soil moisture and freeze/thaw context for water-stress analysis | Not integrated |
| GPM / IMERG | Precipitation rate/accumulation and extreme-rainfall context | Not integrated |
| Landsat | Reflectance and vegetation indices for field-scale crop vigor/seasonal change | Not integrated |
| MODIS / VIIRS | Vegetation indices and broader seasonal vegetation trends | Not integrated |
| ECOSTRESS | Land-surface temperature and evapotranspiration context | Not integrated |
| SRTM | Elevation and terrain inputs for slope/runoff/erosion context | Not integrated |
| NASA POWER | Daily meteorological/agroclimatology time series | Integrated |

A future integration must identify the exact product and version, units, spatial and temporal resolution, access method, coverage, missing-data policy, processing/resampling method, and limitations. Do not add a dataset name to the UI as if it were live until data is actually fetched and verified.

## 3. Local and farm-specific information

### Soil profile

The Farm record supports:
- Soil texture
- Soil pH
- Soil organic carbon (%)
- Soil data source/provenance
- Irrigation category

These values are entered by the user. For a real farm, request a soil-test report or another traceable local source and store its date and method. If the team uses demo values, label them as demo values.

### Crop characteristics

The Crop record supports:
- Crop family and rotation role
- Season and duration
- Seasonal water demand
- Suitable pH and temperature ranges
- Heat threshold
- Organic-carbon demand category
- Preferred/marginal soil texture
- Nitrogen-fixing and flood-sensitivity flags
- Source note and demo flag

These parameters must be validated against locally relevant agricultural references or qualified agronomic advice before being used for real recommendations. The current demo catalog is not a validated crop database for Harohalli.

### Farmer priorities

The app includes priorities such as soil health, water security, income stability, climate resilience, diversification, and livestock feed. The current Farm entity describes these as guidance for scenario discussion, not numeric score inputs.

## 4. Sources that need local relevance checks

The challenge resource page also lists several U.S.-specific datasets and services (for example Web Soil Survey, SSURGO, Cropland Data Layer, PRISM, NAIP, CoCoRaHS, and USGS NWIS). These should not be treated as suitable local datasets for Harohalli without a clear reason and a validated geographic coverage check.

The challenge also lists FAO Global Agro-Ecological Zones (GAEZ) as a global agricultural context source. It may be evaluated for crop suitability context, but it is not a replacement for field soil tests or farmer knowledge.

## 5. Source and uncertainty rules

For every displayed data layer, retain:
1. Provider and dataset/product name
2. Product/version where available
3. Request URL or query parameters
4. Location or spatial footprint
5. Start/end date and temporal aggregation
6. Units
7. Retrieval timestamp
8. Coverage and missing-data count
9. Processing or resampling steps
10. Known limitations and whether values are observed, modelled, or user-entered

Never merge satellite-derived, model-derived, lab-measured, and user-entered values without labelling their provenance.
