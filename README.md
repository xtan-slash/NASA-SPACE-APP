# TerraShift AI
### Field Shift: Adapting Farms with NASA Data | NASA Space Apps Challenge 2026

TerraShift AI is a farmer-centred decision-support web app for exploring crop-rotation strategies under changing climate and water conditions. The pilot focus is Harohalli, Karnataka, India. Farm locations, crops, soil inputs, and priorities are designed to be configurable.

> **Decision support, not a prescription.** Scores are explainable suitability indicators based on the inputs and assumptions shown by the app. They are not validated yield, income, nutrient-balance, or guaranteed soil-improvement predictions. Farmers and local agricultural experts remain the decision-makers.

## Challenge requirements we are addressing

The official Field Shift brief asks teams to combine NASA Earth observations with local soil information, crop characteristics, and farmer priorities. It specifically asks teams to compare at least three rotation strategies, including the existing rotation, and explain evidence, potential benefits, information gaps, and risks.

Official brief: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/

## Current implementation

The working web app is built and hosted in Base44 using TanStack Start, React 19, and the Base44 SDK.

- Farm setup with location, soil properties, irrigation, and farmer priorities.
- Configurable crop records with crop family, season, water demand, pH and temperature ranges, and rotation traits.
- NASA POWER Daily Point API integration for historical daily agroclimatology data.
- Annual, monthly, and seasonal aggregation with parameter coverage and missing-data tracking.
- Deterministic rotation scoring across soil, water, climate, and crop diversity.
- Multi-scenario comparison, simulator, method notes, and an AI advisor grounded in computed score evidence.

**Repository status:** this GitHub repository currently contains project documentation. The runnable application source is in the Base44 app and has not yet been mirrored into this repository.

## NASA data

**Integrated now:** NASA POWER Daily Point API (Agroclimatology community). See [NASA data sources](docs/nasa-data-sources.md).

**Potential extensions, not yet integrated:** SMAP, GPM/IMERG, Landsat, MODIS/VIIRS, ECOSTRESS, and SRTM. Their use must be verified for the Harohalli pilot and implemented with clear spatial/temporal provenance before being described as live data.

NASA POWER API docs: https://power.larc.nasa.gov/docs/services/api/temporal/daily/

## Scoring and limitations

The current scoring logic is documented in [Scoring methodology](docs/scoring-methodology.md). Crop parameters are configurable. Seed/demo crop parameters are illustrative unless their source notes provide a verified reference. Soil properties are user-supplied farm inputs, not retrieved from NASA POWER.

## Project documentation

- [System architecture](docs/architecture.md)
- [NASA data sources and provenance](docs/nasa-data-sources.md)
- [Scoring methodology and assumptions](docs/scoring-methodology.md)
- [Local crop context for Harohalli](docs/local-crop-context.md)

## Pilot location

Harohalli, Karnataka, India. The pilot coordinates currently prefilled in the app are 12.68° N, 77.48° E and are a demo point, not a surveyed farm boundary or verified field centroid.

## Development priorities

1. Validate the pilot coordinates and replace demo farm inputs with clearly sourced local data.
2. Ensure the comparison view presents at least three strategies, including the existing farmer rotation.
3. Validate crop parameters with locally relevant agricultural sources or qualified agronomists.
4. Improve NASA data provenance, coverage, uncertainty, and spatial-resolution explanations.
5. Add one additional NASA dataset only when it can be integrated and explained reliably.
6. Test the full app flow and prepare a concise project demonstration.

## Local event

Harohalli local event information: https://www.spaceappschallenge.org/2026/local-events/harohalli/
