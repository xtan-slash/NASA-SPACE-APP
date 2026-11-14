# TerraShift AI — Scoring Methodology

_Last reviewed: 14 November 2026 · Engine version currently defined in app: 1.0.0_

## Purpose

The score is a deterministic, explainable comparison aid for crop-rotation scenarios. It combines four dimensions where the necessary inputs are available:

1. Soil suitability
2. Water suitability
3. Climate suitability
4. Crop diversity / rotation structure

It is not a yield forecast, income forecast, nutrient-budget model, or validated prediction of future soil health.

## 1. Configured weights

The app uses four user-configurable weights from 0 to 10:

| Dimension | Default raw weight | Default normalized share |
| --- | ---: | ---: |
| Soil | 6 | 30% |
| Water | 6 | 30% |
| Climate | 5 | 25% |
| Diversity | 3 | 15% |
| **Total** | **20** | **100%** |

The normalized weight for dimension k is rawWeight_k / sum(all raw weights).

If a dimension cannot be scored because required data is missing, the engine excludes it and renormalizes the remaining available dimensions. The result therefore must display both configured and effective weights.

At least two dimensions must be available for a scenario to receive an overall score. Weight inputs must be numeric, non-negative, no greater than 10, and have a positive total.

## 2. Soil suitability

The soil score combines available sub-checks:

| Sub-check | Internal weight | Current rule |
| --- | ---: | --- |
| pH fit | 42% | 100 when farm pH is within the crop's configured pH range; otherwise subtract 14 points per pH unit outside the range, clamped to 0–100 |
| Texture compatibility | 33% | 100 for a preferred texture, 62 for a marginal texture, 35 for other textures |
| Organic-carbon demand | 25% | 100 × farm SOC / crop threshold, clamped to 0–100 |

The organic-carbon thresholds used by the current catalog are:
- Low demand: 0.45%
- Medium demand: 0.65%
- High demand: 0.85%

Only sub-checks with the required inputs are included; their internal weights are renormalized over the available sub-checks.

**Limitations:** this is a heuristic compatibility score. It does not calculate nutrient balance, soil carbon change, compaction, salinity, erosion, or measured soil-health improvement. Texture preferences and crop thresholds need local validation.

## 3. Water suitability

The current implementation estimates seasonal water supply as:

effectiveRain = seasonPrecipitation × 0.75

assumedSupply = effectiveRain + assumedIrrigation

The assumed irrigation allowances in the current catalog are:
- Rainfed: 0 mm/season
- Supplemental: 120 mm/season
- Assured: 250 mm/season

Water coverage is:

coverage = assumedSupply / cropSeasonalWaterDemand

The base water score is:
- 100 when coverage is at least 1.0
- 100 × coverage^1.1 when coverage is below 1.0

If coverage exceeds 1.5 on clay, clay-loam, or vertisol soil, the engine applies an excess-water penalty, capped at 18 points.

**Limitations:** the 75% effective-rain factor and irrigation allowances are assumptions. The calculation does not model irrigation scheduling, runoff, infiltration, groundwater, soil-water storage, crop growth stage, or field-specific evapotranspiration. It must not be presented as measured water availability.

## 4. Climate suitability

Climate suitability combines:
- 50% temperature fit
- 30% heat-stress penalty component
- 20% heavy-rain penalty component

Temperature fit is 100 inside the crop's configured optimum temperature range. Outside the range, 11 points are subtracted per degree Celsius beyond the nearest bound, clamped to 0–100.

The engine uses a 35°C or 38°C daily maximum threshold depending on the crop's configured heat threshold. The heat penalty is:

min(40, (heatDays / seasonDays) × 180)

The heavy-rain share is based on days with precipitation at or above 50 mm. The penalty is:
- Flood-sensitive crop: min(30, heavyRainShare × 300)
- Other crop: min(12, heavyRainShare × 120)

The final climate score is:

0.5 × temperatureFit + 0.3 × (100 − heatPenalty) + 0.2 × (100 − rainPenalty)

**Limitations:** these are transparent prototype heuristics. They do not constitute a crop growth model or a locally calibrated heat/flood response model. Thresholds need crop- and region-specific review.

## 5. Crop diversity / rotation structure

The diversity score combines:
- 40% normalized Shannon diversity across crop families
- 35% legume-share score
- 25% family alternation between consecutive entries

The legume-share component currently gives full score when legumes account for 20–50% of sequence entries. Below 20%, the score scales down; above 50%, it is reduced.

Family alternation is the proportion of consecutive crop transitions where the family changes.

**Limitations:** this is a rotation-structure heuristic. A legume flag does not measure biological nitrogen fixation, residual nitrogen, pest suppression, disease breaks, biomass, or soil organic matter. The engine explicitly describes a legume-to-non-legume carryover as a structural benefit, not a measured nutrient credit.

## 6. Missing data, confidence, and uncertainty

The engine records missing information such as:
- No NASA POWER climate snapshot
- Missing soil pH, texture, or organic carbon
- Missing irrigation status
- NASA POWER daily coverage below 95%
- Crop records still using illustrative demo parameters

The result includes a confidence label:
- **High:** no listed missing items and key climate coverage is at least 97% (or coverage is unavailable)
- **Medium:** no more than one listed missing item
- **Low:** more than one listed missing item
- **None:** scenario cannot be scored or has invalid inputs

The engine returns missing-data and assumption messages alongside the score. Missing dimensions are not silently treated as zero.

## 7. Comparison rules

For a challenge-ready demonstration, compare at least three scenarios:
1. Existing farmer rotation (baseline)
2. Alternative rotation prioritising water/climate resilience
3. Alternative rotation prioritising soil/rotation diversity

These are scenario labels, not pre-approved agronomic recommendations. Populate them using the actual farm's current crops and locally checked crop options. If the current rotation is unknown, ask the farmer or mark the baseline as a clearly labelled illustrative scenario.

Compare the dimension scores, overall score, effective weights, confidence, missing data, crop-family sequence, and trade-offs. Do not select a "winner" solely from a higher composite score if the inputs are incomplete or illustrative.

## 8. AI advisor boundary

The AI advisor should explain only the deterministic score tables, findings, configured/effective weights, and missing-data flags supplied by the application. It should not:
- Invent crop facts or local soil observations
- Claim yield or income increases
- Claim measured nitrogen credits or carbon sequestration
- Turn an illustrative crop parameter into a verified fact
- Hide uncertainty or missing information

## 9. Validation needed before field use

- Verify crop parameters with local agricultural references or qualified agronomists.
- Use a dated soil test for soil pH, organic carbon, and texture where possible.
- Confirm the local crop calendar and revise the prototype season windows if required.
- Check NASA POWER coverage and spatial suitability for the selected farm point.
- Compare model outputs with farmer knowledge and independent field evidence.
- Keep the scoring engine version and assumptions visible when results are saved.
