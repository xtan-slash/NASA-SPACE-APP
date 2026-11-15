// Deterministic crop-rotation scoring engine.
// Pure functions, no randomness, no network. The same module runs in the browser
// (live preview of a scenario) and on the server (grounding for the AI advisor),
// so the numbers the advisor sees are recomputed, never taken from the client.

import {
  DIMENSION_KEYS,
  DIMENSION_LABEL,
  IRRIGATION,
  OC_THRESHOLD,
  SEASON_BY_VALUE,
} from "./catalog.js";

export const ENGINE_VERSION = "1.0.0";
export const EFFECTIVE_RAIN_FACTOR = 0.75; // share of season rainfall assumed plant-available
export const PH_PENALTY_PER_UNIT = 14;
export const TEMP_PENALTY_PER_DEG = 11;

// Broad India mainland bounding box. This rejects clearly offshore/out-of-country
// points before a POWER request; it is not a coastline or island landmask.
export const INDIA_BOUNDS = { minLat: 6.0, maxLat: 37.2, minLon: 68.0, maxLon: 97.5 };
export function isWithinIndiaBounds(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lon) &&
    lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat &&
    lon >= INDIA_BOUNDS.minLon && lon <= INDIA_BOUNDS.maxLon;
}
const POORLY_DRAINED = ["clay", "clay_loam", "vertisol"];
const IRRIGATION_MM = Object.fromEntries(IRRIGATION.map((i) => [i.value, i.assumed_mm]));

export const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));
export const r1 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 10) / 10);

export function normalizeWeights(raw) {
  const errors = [];
  const values = {};
  for (const key of DIMENSION_KEYS) {
    const v = Number(raw?.[key]);
    if (raw?.[key] === "" || raw?.[key] == null) {
      errors.push(`${DIMENSION_LABEL[key]}: weight is required.`);
      values[key] = 0;
    } else if (!Number.isFinite(v)) {
      errors.push(`${DIMENSION_LABEL[key]}: weight must be a number.`);
      values[key] = 0;
    } else if (v < 0) {
      errors.push(`${DIMENSION_LABEL[key]}: weight cannot be negative.`);
      values[key] = 0;
    } else if (v > 10) {
      errors.push(`${DIMENSION_LABEL[key]}: weight must be 10 or less.`);
      values[key] = 0;
    } else {
      values[key] = v;
    }
  }
  const sum = DIMENSION_KEYS.reduce((a, k) => a + values[k], 0);
  if (sum <= 0) errors.push("Weights must add up to more than zero.");
  const normalized = {};
  for (const key of DIMENSION_KEYS) normalized[key] = sum > 0 ? values[key] / sum : 0;
  return { valid: errors.length === 0, errors, values, sum, normalized };
}

export function validateFarm(farm) {
  const errors = [];
  if (!farm?.name?.trim()) errors.push("Farm name is required.");
  const lat = Number(farm?.latitude);
  const lon = Number(farm?.longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) errors.push("Latitude must be between -90 and 90.");
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) errors.push("Longitude must be between -180 and 180.");
  else if (Number.isFinite(lat) && !isWithinIndiaBounds(lat, lon)) errors.push("Coordinates must fall within the supported India bounding box before requesting NASA POWER data.");
  const area = Number(farm?.area_ha);
  if (!Number.isFinite(area) || area <= 0) errors.push("Area must be a positive number of hectares.");
  if (farm?.soil_ph !== null && farm?.soil_ph !== undefined && farm?.soil_ph !== "") {
    const ph = Number(farm.soil_ph);
    if (!Number.isFinite(ph) || ph < 0 || ph > 14) errors.push("Soil pH must be between 0 and 14.");
  }
  if (farm?.soil_organic_carbon !== null && farm?.soil_organic_carbon !== undefined && farm?.soil_organic_carbon !== "") {
    const oc = Number(farm.soil_organic_carbon);
    if (!Number.isFinite(oc) || oc < 0 || oc > 15) errors.push("Soil organic carbon must be between 0 and 15 %.");
  }
  return errors;
}

export function validateCrop(crop) {
  const errors = [];
  if (!crop?.name?.trim()) errors.push("Crop name is required.");
  const demand = Number(crop?.water_need_mm);
  if (!Number.isFinite(demand) || demand <= 0) errors.push("Seasonal water demand must be greater than zero.");
  const phMin = Number(crop?.ph_min);
  const phMax = Number(crop?.ph_max);
  if (!Number.isFinite(phMin) || !Number.isFinite(phMax) || phMin > phMax) errors.push("pH range is invalid.");
  const tMin = Number(crop?.temp_opt_min);
  const tMax = Number(crop?.temp_opt_max);
  if (!Number.isFinite(tMin) || !Number.isFinite(tMax) || tMin > tMax) errors.push("Temperature range is invalid.");
  return errors;
}

function phFit(ph, min, max) {
  if (ph == null || min == null || max == null) return null;
  if (ph >= min && ph <= max) return 100;
  const distance = ph < min ? min - ph : ph - max;
  return clamp(100 - PH_PENALTY_PER_UNIT * distance);
}

function textureFit(texture, preferred = [], marginal = []) {
  if (!texture) return null;
  if (preferred.includes(texture)) return 100;
  if (marginal.includes(texture)) return 62;
  return 35;
}

function rangeFit(value, min, max, penaltyPerUnit) {
  if (value == null || min == null || max == null) return null;
  if (value >= min && value <= max) return 100;
  const distance = value < min ? min - value : value - max;
  return clamp(100 - penaltyPerUnit * distance);
}

function combine(parts) {
  const usable = parts.filter((p) => p.score != null);
  const weightSum = usable.reduce((a, p) => a + p.weight, 0);
  if (!usable.length || weightSum <= 0) return null;
  return usable.reduce((a, p) => a + p.score * (p.weight / weightSum), 0);
}

function seasonClimate(climate, seasonValue) {
  if (!climate?.seasons) return null;
  const s = climate.seasons[seasonValue];
  if (!s) return null;
  return s;
}

function scoreYear({ farm, crop, entry, season, prevCrop }) {
  const flags = [];
  const soilParts = [
    {
      key: "ph",
      label: "Soil pH fit",
      weight: 0.42,
      score: phFit(farm.soil_ph, crop.ph_min, crop.ph_max),
      evidence: `Farm pH ${farm.soil_ph ?? "not entered"}; crop range ${crop.ph_min}–${crop.ph_max}`,
    },
    {
      key: "texture",
      label: "Texture compatibility",
      weight: 0.33,
      score: textureFit(farm.soil_texture, crop.texture_preferred, crop.texture_marginal),
      evidence: `Farm texture ${farm.soil_texture ?? "not entered"}; crop preferences editable on the crop record`,
    },
    {
      key: "organic_carbon",
      label: "Organic-carbon demand",
      weight: 0.25,
      score:
        farm.soil_organic_carbon != null && OC_THRESHOLD[crop.oc_need]
          ? clamp(100 * (farm.soil_organic_carbon / OC_THRESHOLD[crop.oc_need]))
          : null,
      evidence: `Farm organic carbon ${farm.soil_organic_carbon ?? "not entered"} %; crop demand level ${
        crop.oc_need ?? "not set"
      } (needs ${OC_THRESHOLD[crop.oc_need] ?? "–"} %)`,
    },
  ];
  const soil = combine(soilParts);
  if (soilParts.some((p) => p.score == null)) {
    flags.push("Soil score uses fewer than three sub-checks because farm soil inputs are missing.");
  }

  const climateSeason = seasonClimate(entry.__climate, entry.__seasonValue);
  const demand = Number(crop.water_need_mm);
  let water = null;
  let waterDetail = {
    demand_mm: Number.isFinite(demand) ? demand : null,
    season_rain_mm: climateSeason?.precip_mm ?? null,
    irrigation_mm: IRRIGATION_MM[farm.irrigation] ?? 0,
    effective_rain_mm: null,
    supply_mm: null,
    coverage: null,
    surplus_penalty: null,
  };
  if (climateSeason && Number.isFinite(demand) && demand > 0) {
    const effectiveRain = (climateSeason.precip_mm ?? 0) * EFFECTIVE_RAIN_FACTOR;
    const supply = effectiveRain + waterDetail.irrigation_mm;
    const coverage = supply / demand;
    const base = coverage >= 1 ? 100 : clamp(100 * Math.pow(coverage, 1.1));
    const surplusPenalty =
      coverage > 1.5 && POORLY_DRAINED.includes(farm.soil_texture)
        ? Math.min(18, (coverage - 1.5) * 22)
        : 0;
    water = clamp(base - surplusPenalty);
    waterDetail = {
      ...waterDetail,
      effective_rain_mm: r1(effectiveRain),
      supply_mm: r1(supply),
      coverage: r1(coverage),
      surplus_penalty: r1(surplusPenalty),
    };
    if (coverage < 1) flags.push(`${season.label}: water supply covers ${Math.round(coverage * 100)}% of demand.`);
    if (surplusPenalty > 0) flags.push(`${season.label}: excess water on a poorly drained soil is penalised.`);
  }

  let climate = null;
  let climateDetail = {
    season_temp_c: climateSeason?.t2m_c ?? null,
    temp_fit: null,
    heat_days: null,
    heat_penalty: null,
    heavy_rain_days: null,
    rain_penalty: null,
  };
  if (climateSeason) {
    const tempFit = rangeFit(climateSeason.t2m_c, crop.temp_opt_min, crop.temp_opt_max, TEMP_PENALTY_PER_DEG);
    const threshold = Number(crop.heat_threshold_c) <= 35 ? 35 : 38;
    const heatDays = threshold === 35 ? climateSeason.heat_days_35 : climateSeason.heat_days_38;
    const days = climateSeason.days || 1;
    const heatPenalty = Math.min(40, ((heatDays ?? 0) / days) * 180);
    const heavyShare = (climateSeason.heavy_rain_days_50 ?? 0) / days;
    const rainPenalty = crop.flood_sensitive ? Math.min(30, heavyShare * 300) : Math.min(12, heavyShare * 120);
    climate = clamp(0.5 * tempFit + 0.3 * (100 - heatPenalty) + 0.2 * (100 - rainPenalty));
    climateDetail = {
      season_temp_c: r1(climateSeason.t2m_c),
      temp_fit: r1(tempFit),
      heat_threshold_c: threshold,
      heat_days: heatDays ?? null,
      heat_penalty: r1(heatPenalty),
      heavy_rain_days: climateSeason.heavy_rain_days_50 ?? null,
      rain_penalty: r1(rainPenalty),
    };
  }

  const carryover =
    prevCrop && prevCrop.n_fixing && !crop.n_fixing
      ? `${prevCrop.name} (legume) preceded this crop — a rotation-structure benefit, not a measured nutrient credit.`
      : null;

  return {
    year: entry.year,
    season: season.value,
    season_label: season.label,
    crop_id: crop.id,
    crop_name: crop.name,
    family: crop.family,
    n_fixing: !!crop.n_fixing,
    scores: { soil: r1(soil), water: r1(water), climate: r1(climate) },
    soil_parts: soilParts.map((p) => ({ label: p.label, score: r1(p.score), evidence: p.evidence })),
    water_detail: waterDetail,
    climate_detail: climateDetail,
    carryover,
    flags,
  };
}

function diversityBlock(entries, cropsById) {
  const orderedEntries = [...entries].sort((a, b) => a.year - b.year || seasonIndex(a.season) - seasonIndex(b.season));
  const crops = orderedEntries.map((e) => cropsById[e.crop_id]).filter(Boolean);
  const n = crops.length;
  if (!n) return { score: null, details: null, flags: ["No crops resolved for this sequence."] };
  const familyCounts = {};
  crops.forEach((c) => {
    const f = c.family || "unknown";
    familyCounts[f] = (familyCounts[f] || 0) + 1;
  });
  let shannon = 0;
  Object.values(familyCounts).forEach((count) => {
    const p = count / n;
    shannon -= p * Math.log(p);
  });
  const shannonNorm = n > 1 ? Math.min(1, shannon / Math.log(n)) : 0;
  const legumeShare = crops.filter((c) => c.n_fixing).length / n;
  let legumeScore;
  if (legumeShare >= 0.2 && legumeShare <= 0.5) legumeScore = 100;
  else if (legumeShare < 0.2) legumeScore = clamp(100 * (legumeShare / 0.2) * 0.85);
  else legumeScore = clamp(100 - (legumeShare - 0.5) * 90);
  let transitions = 0;
  let differing = 0;
  let skippedGaps = 0;
  const sequenceIndex = (entry) => entry.year * 3 + seasonIndex(entry.season);
  for (let i = 1; i < orderedEntries.length; i += 1) {
    const previous = orderedEntries[i - 1];
    const current = orderedEntries[i];
    const previousCrop = cropsById[previous.crop_id];
    const currentCrop = cropsById[current.crop_id];
    if (!previousCrop || !currentCrop) continue;
    if (sequenceIndex(current) !== sequenceIndex(previous) + 1) {
      skippedGaps += Math.max(1, sequenceIndex(current) - sequenceIndex(previous) - 1);
      continue;
    }
    transitions += 1;
    if ((currentCrop.family || "unknown") !== (previousCrop.family || "unknown")) differing += 1;
  }
  // With no directly adjacent cropped seasons, alternation is neutral rather than
  // a penalty. Empty/fallow slots are excluded from crop counts and transitions.
  const alternation = transitions ? differing / transitions : 0.5;
  const score = clamp(100 * (0.4 * shannonNorm + 0.35 * (legumeScore / 100) + 0.25 * alternation));
  const flags = [];
  if (skippedGaps > 0) flags.push(`${skippedGaps} empty/fallow season slot(s) were excluded from consecutive-family checks.`);
  if (legumeShare < 0.2) flags.push("Fewer than one in five seasons is a legume.");
  if (alternation < 0.6) flags.push("Same crop family repeats in consecutive seasons.");
  return {
    score,
    details: {
      seasons: n,
      empty_seasons_excluded: skippedGaps,
      adjacent_transitions: transitions,
      families: Object.keys(familyCounts),
      family_counts: familyCounts,
      shannon,
      shannon_norm: shannonNorm,
      legume_share: legumeShare,
      legume_score: legumeScore,
      alternation,
    },
    flags,
  };
}

/**
 * Score one rotation scenario.
 * @param {object} args
 * @param {object} args.farm       Farm record
 * @param {object|null} args.climate Aggregated POWER snapshot ({seasons, coverage, ...}) or null
 * @param {Array} args.crops       Crop records
 * @param {object} args.scenario   { entries: [{year, season, crop_id}], weights: {...} }
 */
export function scoreScenario({ farm, climate, crops, scenario }) {
  const weightCheck = normalizeWeights(scenario?.weights);
  const cropsById = Object.fromEntries((crops || []).map((c) => [c.id, c]));
  const rawEntries = [...(scenario?.entries || [])].sort(
    (a, b) => a.year - b.year || seasonIndex(a.season) - seasonIndex(b.season)
  );

  const errors = [...weightCheck.errors];
  if (!farm) errors.push("Select a farm before scoring.");
  if (rawEntries.length < 2) errors.push("A rotation needs at least two cropped seasons to compare.");

  const unresolved = rawEntries.filter((e) => !cropsById[e.crop_id]);
  if (unresolved.length) errors.push(`${unresolved.length} season(s) point at a crop that no longer exists.`);

  const usableEntries = rawEntries
    .filter((e) => cropsById[e.crop_id])
    .map((e) => ({ ...e, __climate: climate, __seasonValue: e.season }));

  let prevCrop = null;
  let prevEntry = null;
  const years = [];
  if (farm) {
    for (const entry of usableEntries) {
      const crop = cropsById[entry.crop_id];
      const season = SEASON_BY_VALUE[entry.season];
      if (!season) continue;
      const adjacent = prevEntry && entry.year * 3 + seasonIndex(entry.season) === prevEntry.year * 3 + seasonIndex(prevEntry.season) + 1;
      const scored = scoreYear({ farm, crop, entry, season, prevCrop: adjacent ? prevCrop : null });
      years.push(scored);
      prevCrop = crop;
      prevEntry = entry;
    }
  }

  const meanOf = (key) => {
    const vals = years.map((y) => y.scores[key]).filter((v) => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const diversity = diversityBlock(usableEntries, cropsById);
  const dimensionScores = {
    soil: r1(meanOf("soil")),
    water: r1(meanOf("water")),
    climate: r1(meanOf("climate")),
    diversity: diversity.score == null ? null : r1(diversity.score),
  };

  const missing = [];
  if (!climate?.seasons) missing.push("No NASA POWER climate snapshot for this farm — water and climate suitability cannot be scored.");
  if (farm?.soil_ph == null) missing.push("Farm soil pH not entered.");
  if (!farm?.soil_texture) missing.push("Farm soil texture not entered.");
  if (farm?.soil_organic_carbon == null) missing.push("Farm soil organic carbon not entered.");
  if (farm?.irrigation == null) missing.push("Irrigation status not set — assumed rainfed.");
  const coverage = climate?.coverage?.key_params ?? null;
  if (coverage != null && coverage < 0.95) {
    missing.push(`NASA POWER series has gaps: ${(coverage * 100).toFixed(1)}% of expected daily values present.`);
  }
  const demoCrops = usableEntries.map((e) => cropsById[e.crop_id]).filter((c) => c?.is_demo);
  if (demoCrops.length) {
    missing.push(
      `${demoCrops.length} of ${usableEntries.length} crop records still use illustrative demo parameters — not a validated local source.`
    );
  }

  const availableKeys = DIMENSION_KEYS.filter((k) => dimensionScores[k] != null);
  const effectiveWeights = {};
  const effSum = availableKeys.reduce((a, k) => a + weightCheck.normalized[k], 0);
  for (const k of availableKeys) effectiveWeights[k] = effSum > 0 ? weightCheck.normalized[k] / effSum : 0;

  const status = availableKeys.length < 2 ? "insufficient" : errors.length ? "invalid" : "ok";
  const overall =
    status === "ok"
      ? r1(availableKeys.reduce((a, k) => a + dimensionScores[k] * effectiveWeights[k], 0))
      : null;

  // Per-season weighted score over the dimensions that are available for that season.
  years.forEach((y) => {
    const keys = ["soil", "water", "climate"].filter((k) => y.scores[k] != null);
    const sum = keys.reduce((a, k) => a + weightCheck.normalized[k], 0);
    y.season_total =
      keys.length && sum > 0
        ? r1(keys.reduce((a, k) => a + y.scores[k] * (weightCheck.normalized[k] / sum), 0))
        : null;
  });

  const confidenceLevel = (() => {
    if (status !== "ok") return "none";

    // Demo crop parameters are an explicit low-confidence condition in the
    // published methodology, even when they are the only listed gap.
    if (demoCrops.length > 0) return "low";

    const hardMissing = missing.length;
    if (hardMissing >= 2) return "low";
    if (coverage != null && coverage < 0.9) return "low";

    // High confidence requires a loaded climate record with at least 97%
    // coverage, complete farm inputs, and no illustrative crop parameters.
    if (hardMissing === 0 && coverage != null && coverage >= 0.97) return "high";

    // One hard gap or 90–97% climate coverage is medium confidence.
    return "medium";
  })();

  const uncertainty = [];
  if (!climate) {
    uncertainty.push({
      type: "missing",
      message: "Water and climate suitability are excluded; weights were renormalised over the remaining dimensions.",
    });
  }
  if (missing.some((m) => m.includes("demo parameters"))) {
    uncertainty.push({
      type: "assumption",
      message: "Crop water demand, pH ranges and temperature ranges are editable demo values, not local trials.",
    });
  }
  uncertainty.push({
    type: "assumption",
    message: `Effective rainfall is assumed at ${Math.round(
      EFFECTIVE_RAIN_FACTOR * 100
    )}% of POWER season precipitation; irrigation is assumed at ${
      IRRIGATION_MM[farm?.irrigation] ?? 0
    } mm per season for the selected irrigation status.`,
  });
  uncertainty.push({
    type: "scope",
    message: "Scores express input suitability and rotation structure. They are not yield, income or nutrient-balance predictions.",
  });

  // Deterministic findings — the only material the AI advisor may restate.
  const findings = [];
  const ranked = availableKeys.slice().sort((a, b) => dimensionScores[b] - dimensionScores[a]);
  if (ranked.length) {
    findings.push(
      `Strongest dimension: ${DIMENSION_LABEL[ranked[0]]} at ${dimensionScores[ranked[0]].toFixed(1)} of 100.`
    );
    if (ranked.length > 1) {
      findings.push(
        `Weakest dimension: ${DIMENSION_LABEL[ranked[ranked.length - 1]]} at ${dimensionScores[
          ranked[ranked.length - 1]
        ].toFixed(1)}.`
      );
    }
  }
  const deficient = years.filter((y) => y.water_detail.coverage != null && y.water_detail.coverage < 1);
  if (deficient.length) {
    findings.push(
      `${deficient.length} of ${years.length} seasons have estimated water supply below crop demand (lowest ${Math.min(
        ...deficient.map((y) => y.water_detail.coverage)
      ).toFixed(2)}× demand).`
    );
  }
  if (diversity.details) {
    findings.push(
      `Sequence uses ${diversity.details.families.length} crop famil${
        diversity.details.families.length === 1 ? "y" : "ies"
      } across ${diversity.details.seasons} seasons; legumes are ${Math.round(
        diversity.details.legume_share * 100
      )}% of seasons.`
    );
  }
  if (coverage != null) {
    findings.push(`NASA POWER daily coverage for this point: ${(coverage * 100).toFixed(1)}% of expected values.`);
  }

  return {
    engine_version: ENGINE_VERSION,
    status,
    errors: [...new Set(errors)],
    weights: {
      configured: weightCheck.normalized,
      configured_pct: Object.fromEntries(
        DIMENSION_KEYS.map((k) => [k, Math.round(weightCheck.normalized[k] * 1000) / 10])
      ),
      effective: effectiveWeights,
      effective_pct: Object.fromEntries(
        availableKeys.map((k) => [k, Math.round(effectiveWeights[k] * 1000) / 10])
      ),
      raw_sum: weightCheck.sum,
      renormalised: availableKeys.length < DIMENSION_KEYS.length,
    },
    dimension_scores: dimensionScores,
    available_dimensions: availableKeys,
    overall,
    confidence: { level: confidenceLevel, missing_count: missing.length },
    missing,
    uncertainty,
    findings,
    diversity: diversity.details,
    diversity_flags: diversity.flags,
    years,
    scored_at: new Date().toISOString(),
  };
}

function seasonIndex(value) {
  return ["kharif", "rabi", "summer"].indexOf(value);
}

export function explainDimension(key, result) {
  if (!result) return "No result yet.";
  const v = result.dimension_scores?.[key];
  if (v == null) return "Not scored — required inputs are missing.";
  return `${DIMENSION_LABEL[key]}: ${v.toFixed(1)} of 100.`;
}

export function deterministicSummary(result, scenarioName) {
  if (!result) return "";
  if (result.status === "insufficient") {
    return `“${scenarioName}” could not be scored: ${result.errors[0] || "too few input dimensions are available."}`;
  }
  if (result.status === "invalid") {
    return `“${scenarioName}” has input problems: ${result.errors.join(" ")}`;
  }
  const dims = result.available_dimensions
    .map((k) => `${DIMENSION_LABEL[k].replace(" suitability", "")} ${result.dimension_scores[k].toFixed(1)}`)
    .join(", ");
  return `“${scenarioName}” scores ${result.overall.toFixed(1)} of 100 (${dims}), with ${
    result.confidence.level
  } confidence.`;
}