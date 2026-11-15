// Scoring for the public demonstration dataset. Pure functions over the static
// demo records — the demo never reads a user's farms, crops or snapshots, and the
// same module runs on the server so the demo advisor restates recomputed numbers.

import { DEMO_CLIMATE, DEMO_CROPS, DEMO_FARM, DEMO_SCENARIOS, DEMO_WEIGHTS } from "./demo-data.js";
import { deterministicSummary, scoreScenario } from "./scoring.js";

export const DEMO_SCENARIO_IDS = DEMO_SCENARIOS.map((s) => s.id);

export function demoResults(climate = DEMO_CLIMATE, location = DEMO_FARM) {
  return DEMO_SCENARIOS.map((scenario) => {
    const result = scoreScenario({
      farm: { ...DEMO_FARM, ...location },
      climate,
      crops: DEMO_CROPS,
      scenario: { entries: scenario.entries, weights: DEMO_WEIGHTS },
    });
    return { id: scenario.id, name: scenario.name, scenario, result };
  });
}

export function demoResultById(id) {
  return demoResults().find((row) => row.id === id) || null;
}

function compact(result) {
  return {
    overall: result.overall,
    confidence: result.confidence.level,
    dimensions: result.dimension_scores,
    available_dimensions: result.available_dimensions,
    effective_weights_pct: result.weights.effective_pct,
    findings: result.findings,
    missing: result.missing,
    uncertainty: result.uncertainty.map((u) => u.message),
    seasons: result.years.map((y) => ({
      year: y.year,
      season: y.season,
      crop: y.crop_name,
      soil: y.scores.soil,
      water: y.scores.water,
      climate: y.scores.climate,
      supply_mm: y.water_detail.supply_mm,
      demand_mm: y.water_detail.demand_mm,
      coverage: y.water_detail.coverage,
      season_temp_c: y.climate_detail.season_temp_c,
    })),
    diversity: result.diversity,
  };
}

/**
 * The evidence block handed to the demo advisor. Only demonstration values — no
 * user record is read or included.
 */
export function demoEvidence(ids) {
  const selected = demoResults().filter((row) => ids.includes(row.id));
  return {
    dataset: "Demonstration data (static sample farm, sample crops, recorded NASA POWER summary)",
    farm: {
      name: DEMO_FARM.name,
      district: DEMO_FARM.district,
      area_ha: DEMO_FARM.area_ha,
      soil_texture: DEMO_FARM.soil_texture,
      soil_ph: DEMO_FARM.soil_ph,
      soil_organic_carbon_pct: DEMO_FARM.soil_organic_carbon,
      irrigation: DEMO_FARM.irrigation,
      soil_source: DEMO_FARM.soil_source,
    },
    climate: {
      source: DEMO_CLIMATE.source,
      model_sources: DEMO_CLIMATE.model_sources,
      requested_start: DEMO_CLIMATE.start_date,
      requested_end: DEMO_CLIMATE.end_date,
      coverage_pct: Math.round((DEMO_CLIMATE.coverage_key || 0) * 1000) / 10,
      note: "Gridded reanalysis values for the grid cell containing the point — not on-farm measurement, and historical rather than a forecast.",
      seasons: Object.fromEntries(
        Object.entries(DEMO_CLIMATE.seasons || {}).map(([key, value]) => [
          key,
          {
            window: value.window,
            seasons_used: value.years,
            precipitation_mm: value.precip_mm,
            mean_temp_c: value.t2m_c,
            heat_days_35c: value.heat_days_35,
            heavy_rain_days_50mm: value.heavy_rain_days_50,
            root_zone_wetness: value.gwetroot,
          },
        ])
      ),
    },
    scenarios: selected.map((row) => ({
      scenario: row.name,
      sequence: row.result.years.map((y) => `${y.year} ${y.season_label}: ${y.crop_name}`),
      ...compact(row.result),
      deterministic_summary: deterministicSummary(row.result, row.name),
    })),
    scoring_notes: {
      scale:
        "Each dimension is scored 0-100; the overall score is the weight-normalised mean of the available dimensions.",
      weights: "Weights are user-configured integers 0-10, normalised to percentages.",
      excluded_from_scope:
        "No yield, income, nutrient balance or erosion modelling is performed. Scores are heuristic comparisons.",
    },
  };
}