import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { aggregatePower, buildPowerUrl } from "@/lib/power";
import { POWER_PARAM_CODES } from "@/lib/catalog";
import { deterministicSummary, scoreScenario, isWithinIndiaBounds } from "@/lib/scoring";
import { DEMO_SCENARIO_IDS, demoResults } from "@/lib/demo-scoring";
import { DEMO_FARM, DEMO_CLIMATE } from "@/lib/demo-data";
import { requireUser } from "@/lib/auth-middleware";
import { secrets } from "base44:runtime";
import { enforceRateLimit } from "@/lib/rate-limit.server";

const DATE_RE = /^\d{8}$/;

function isValidDateKey(value) {
  if (!DATE_RE.test(value || "")) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function daysBetween(start, end) {
  const toDate = (s) =>
    Date.UTC(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));
  return Math.round((toDate(end) - toDate(start)) / 86400000);
}

function shiftUtcDate(date, days) {
  const shifted = new Date(date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8) + "T00:00:00Z");
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10).replace(/-/g, "");
}

function resolveClimateWindow(dataMode, now = new Date()) {
  const today = now.toISOString().slice(0, 10).replace(/-/g, "");
  // POWER products have different publication latencies. Use a conservative
  // seven-day buffer and still report each parameter's actual latest valid date.
  const recentEnd = shiftUtcDate(today, -7);
  if (dataMode === "recent_30d" || dataMode === "recent_90d") {
    const span = dataMode === "recent_30d" ? 29 : 89;
    return { startDate: shiftUtcDate(recentEnd, -span), endDate: recentEnd };
  }
  if (dataMode === "historical_5y" || dataMode === "historical_10y") {
    const year = Number(today.slice(0, 4)) - 1;
    const years = dataMode === "historical_5y" ? 5 : 10;
    return { startDate: String(year - years + 1) + "0101", endDate: String(year) + "1231" };
  }
  return null;
}

const sarvamCache = new Map();
const SARVAM_LANGUAGES = { hi: "hi-IN", kn: "kn-IN" };

/**
 * Translate short interface strings on demand. The caller must be signed in;
 * the API key stays server-side and the request size is deliberately bounded.
 */
export const translateInterfaceBatch = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      targetLanguage: z.enum(["hi", "kn"]),
      texts: z.array(z.string().min(1).max(1800)).min(1).max(12),
    })
  )
  .handler(async ({ data, context }) => {
    enforceRateLimit({ scope: "translate", identity: context.user.id, limit: 10 });
    const apiKey = secrets.get("SARVAM_API_KEY");
    if (!apiKey) return { ok: false, error: "Translation service is not configured." };

    const targetLanguageCode = SARVAM_LANGUAGES[data.targetLanguage];
    const uniqueTexts = [...new Set(data.texts.map((value) => value.trim()).filter(Boolean))];
    const results = {};

    for (const input of uniqueTexts) {
      const cacheKey = `${data.targetLanguage}:${input}`;
      if (sarvamCache.has(cacheKey)) {
        results[input] = sarvamCache.get(cacheKey);
        continue;
      }

      try {
        const response = await fetch("https://api.sarvam.ai/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": apiKey,
          },
          body: JSON.stringify({
            input,
            source_language_code: "en-IN",
            target_language_code: targetLanguageCode,
            model: "sarvam-translate:v1",
            numerals_format: "international",
          }),
          signal: AbortSignal.timeout(20000),
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          return {
            ok: false,
            error: `Sarvam translation failed (HTTP ${response.status}). ${detail.slice(0, 240)}`,
          };
        }

        const payload = await response.json();
        const translated = typeof payload.translated_text === "string" ? payload.translated_text.trim() : "";
        if (!translated) return { ok: false, error: "Sarvam returned an empty translation." };

        results[input] = translated;
        sarvamCache.set(cacheKey, translated);
        if (sarvamCache.size > 1000) sarvamCache.delete(sarvamCache.keys().next().value);
      } catch (error) {
        return { ok: false, error: error?.message || "Could not reach Sarvam translation service." };
      }
    }

    return { ok: true, translations: results };
  });

/**
 * Fetch NASA POWER daily point data for a farm and store the aggregated snapshot
 * with full provenance. Nothing is interpolated: gaps are counted, not filled.
 */
export const loadClimateSnapshot = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      farmId: z.string().min(1).max(64),
      locationLabel: z.string().max(120).optional(),
      latitude: z.number().min(6.0).max(37.2),
      longitude: z.number().min(68.0).max(97.5),
      startDate: z.string().refine(isValidDateKey, "Use a valid YYYYMMDD date.").optional(),
      endDate: z.string().refine(isValidDateKey, "Use a valid YYYYMMDD date.").optional(),
      dataMode: z.enum(["recent_30d", "recent_90d", "historical_5y", "historical_10y"]).optional(),
      forceRefresh: z.boolean().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    enforceRateLimit({ scope: "climate-fetch", identity: context.user.id, limit: 4, windowMs: 5 * 60_000 });
    const requestedWindow = data.dataMode ? resolveClimateWindow(data.dataMode) : null;
    const startDate = requestedWindow?.startDate || data.startDate;
    const endDate = requestedWindow?.endDate || data.endDate;
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    if (!startDate || !endDate) return { ok: false, error: "Choose a climate data window or provide both start and end dates." };
    if (startDate > endDate) return { ok: false, error: "Start date must be before the end date." };
    if (startDate < "19840101") return { ok: false, error: "NASA POWER daily data starts on 1984-01-01." };
    if (endDate > today) return { ok: false, error: "The end date cannot be in the future." };
    if (daysBetween(startDate, endDate) > 3660) {
      return { ok: false, error: "Request at most 10 years of daily data in one go." };
    }

    const base = context.getBase44();
    let farm;
    try {
      farm = await base.entities.Farm.get(data.farmId);
    } catch {
      return { ok: false, error: "Farm not found or you do not have permission to access it." };
    }
    if (Math.abs(Number(farm.latitude) - data.latitude) > 0.00001 || Math.abs(Number(farm.longitude) - data.longitude) > 0.00001) {
      return { ok: false, error: "The submitted coordinates do not match the saved farm. Reload the farm and try again." };
    }
    const mode = data.dataMode || "custom";
    const cacheTtlMs = mode.startsWith("recent_") ? 6 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    if (!data.forceRefresh) {
      try {
        const cachedPage = await base.entities.ClimateSnapshot.filter(
          { farm_id: farm.id, status: "ready", data_mode: mode, start_date: startDate, end_date: endDate },
          { sort: "-retrieved_at", limit: 10 }
        );
        const nowMs = Date.now();
        const cached = (cachedPage.items || []).find((item) => {
          const retrievedMs = Date.parse(item.retrieved_at || "");
          return (
            Number.isFinite(retrievedMs) &&
            nowMs - retrievedMs >= 0 &&
            nowMs - retrievedMs < cacheTtlMs &&
            item.time_standard === "UTC" &&
            Math.abs(Number(item.latitude) - Number(farm.latitude)) <= 0.00001 &&
            Math.abs(Number(item.longitude) - Number(farm.longitude)) <= 0.00001
          );
        });
        if (cached) {
          try {
            return { ok: true, snapshot: { ...cached, payload: JSON.parse(cached.payload_json || "{}") }, cache_hit: true };
          } catch {
            // A malformed cached payload is ignored and fetched again.
          }
        }
      } catch {
        // Cache lookup failure must not prevent a fresh NASA request.
      }
    }

    const url = buildPowerUrl({
      latitude: farm.latitude,
      longitude: farm.longitude,
      startDate,
      endDate,
    });

    let json;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "TerraShiftAI/1.0 (NASA Space Apps prototype)" },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) {
        return { ok: false, error: `NASA POWER returned HTTP ${res.status}. The service may be busy — try again.` };
      }
      json = await res.json();
    } catch (err) {
      return { ok: false, error: `Could not reach NASA POWER: ${err?.message || "network error"}` };
    }

    if (!json?.properties?.parameter) {
      return {
        ok: false,
        error: `NASA POWER response had no parameter data. ${(json?.messages || []).join(" ") || ""}`.trim(),
      };
    }

    const aggregated = aggregatePower(json, { startDate, endDate, dataMode: data.dataMode || "custom" });
    aggregated.requested_params = POWER_PARAM_CODES;
    aggregated.requested_window = {
      mode: data.dataMode || "custom",
      start_date: startDate,
      end_date: endDate,
      publication_buffer_days: data.dataMode?.startsWith("recent_") ? 7 : null,
    };
    aggregated.retrieved_at_utc = new Date().toISOString();

    const record = await base.entities.ClimateSnapshot.create({
      farm_id: farm.id,
      location_label: farm.name || "Farm point",
      latitude: farm.latitude,
      longitude: farm.longitude,
      start_date: startDate,
      end_date: endDate,
      data_mode: mode,
      time_standard: aggregated.time_standard,
      source: aggregated.source,
      source_url: url,
      retrieved_at: new Date().toISOString(),
      coverage_key: aggregated.coverage_key,
      payload_json: JSON.stringify(aggregated),
      status: "ready",
      error_message: "",
    });

    return { ok: true, snapshot: { ...record, payload: aggregated }, cache_hit: false };
  });

function compactResult(result) {
  return {
    overall: result.overall,
    status: result.status,
    confidence: result.confidence.level,
    weights_pct: result.weights.configured_pct,
    effective_pct: result.weights.effective_pct,
    dimensions: result.dimension_scores,
    available: result.available_dimensions,
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
      water_supply_mm: y.water_detail.supply_mm,
      water_demand_mm: y.water_detail.demand_mm,
      water_coverage: y.water_detail.coverage,
      season_temp_c: y.climate_detail.season_temp_c,
    })),
    diversity: result.diversity,
  };
}

/**
 * Grounded explanation. The scenario(s) are re-scored on the server from stored
 * records and the NASA POWER snapshot; the model only restates those numbers.
 */
export const explainScenario = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      scenarioIds: z.array(z.string().min(1)).min(1).max(4),
      question: z.string().max(500).optional(),
      language: z.enum(["en", "hi", "kn"]).default("en"),
    })
  )
  .handler(async ({ data, context }) => {
    enforceRateLimit({ scope: "scenario-advisor", identity: context.user.id, limit: 8 });
    const base = context.getBase44();
    const scenarios = [];
    for (const id of data.scenarioIds) {
      try {
        scenarios.push(await base.entities.Scenario.get(id));
      } catch {
        return { ok: false, error: "A selected scenario no longer exists." };
      }
    }

    const farmId = scenarios[0].farm_id;
    if (scenarios.some((s) => s.farm_id !== farmId)) {
      return { ok: false, error: "Compare scenarios that belong to the same farm so the inputs match." };
    }

    const farm = await base.entities.Farm.get(farmId);
    const crops = await base.entities.Crop.list();

    const snapshotPage = await base.entities.ClimateSnapshot.filter(
      { farm_id: farmId, status: "ready" },
      { sort: "-retrieved_at", limit: 100 }
    );
    // Recent monitor snapshots are deliberately excluded from rotation scoring.
    // Scoring requires historical seasonal aggregates; legacy snapshots without
    // data_mode remain eligible if they contain usable seasonal evidence.
    let snapshot = null;
    let climate = null;
    for (const candidate of snapshotPage.items || []) {
      if (candidate.data_mode === "recent_30d" || candidate.data_mode === "recent_90d") continue;
      try {
        const parsed = JSON.parse(candidate.payload_json || "{}");
        const hasSeasonalEvidence = Object.values(parsed.seasons || {}).some(
          (season) => Array.isArray(season.by_year) && season.by_year.length > 0
        );
        if (hasSeasonalEvidence) {
          snapshot = candidate;
          climate = parsed;
          break;
        }
      } catch {
        // Ignore malformed snapshots and continue to the next historical candidate.
      }
    }

    const packed = scenarios.map((s) => {
      let entries = [];
      let weights = {};
      try {
        entries = JSON.parse(s.entries_json || "[]");
      } catch {
        entries = [];
      }
      try {
        weights = JSON.parse(s.weights_json || "{}");
      } catch {
        weights = {};
      }
      const result = scoreScenario({ farm, climate, crops, scenario: { entries, weights } });
      return {
        scenario: s.name,
        sequence: result.years.map((y) => `${y.year} ${y.season_label}: ${y.crop_name}`),
        ...compactResult(result),
        deterministic_summary: deterministicSummary(result, s.name),
      };
    });

    const evidence = {
      scored_at_utc: new Date().toISOString(),
      farm: {
        name: farm.name,
        district: farm.district,
        area_ha: farm.area_ha,
        soil_texture: farm.soil_texture,
        soil_ph: farm.soil_ph,
        soil_organic_carbon_pct: farm.soil_organic_carbon,
        irrigation: farm.irrigation,
        soil_source: farm.soil_source,
        priorities: farm.priorities,
      },
      climate: climate
        ? {
            source: climate.source,
            model_sources: climate.model_sources,
            requested_start: climate.start_date,
            requested_end: climate.end_date,
            data_mode: climate.data_mode || snapshot.data_mode || "legacy/custom",
            time_standard: climate.time_standard || snapshot.time_standard || "unknown",
            retrieved_at: snapshot.retrieved_at,
            coverage_pct: Math.round((climate.coverage_key || 0) * 1000) / 10,
            elevation_m: climate.elevation_m,
            seasons: Object.fromEntries(
              Object.entries(climate.seasons || {}).map(([k, v]) => [
                k,
                {
                  window: v.window,
                  seasons_used: v.years,
                  precipitation_mm: v.precip_mm,
                  mean_temp_c: v.t2m_c,
                  heat_days_35c: v.heat_days_35,
                  heavy_rain_days_50mm: v.heavy_rain_days_50,
                  root_zone_wetness: v.gwetroot,
                },
              ])
            ),
          }
        : { available: false, note: "No NASA POWER snapshot has been loaded for this farm." },
      scenarios: packed,
      scoring_notes: {
        scale: "Each dimension is scored 0-100; the overall score is the weight-normalised mean of the available dimensions.",
        weights: "Weights are user-configured integers 0-10, normalised to percentages.",
        excluded_from_scope: "No yield, income, nutrient balance or erosion modelling is performed.",
      },
    };

    const systemRules = [
      "You explain the output of a deterministic crop-rotation scoring prototype called TerraShift AI.",
      data.language === "hi"
        ? "Write the entire explanation in clear, natural Hindi (हिन्दी). Keep crop names, NASA POWER, units, dates and numeric values accurate. Do not switch to English except for proper names and technical abbreviations."
        : data.language === "kn"
          ? "Write the entire explanation in clear, natural Kannada (ಕನ್ನಡ). Keep crop names, NASA POWER, units, dates and numeric values accurate. Do not switch to English except for proper names and technical abbreviations."
          : "Write the entire explanation in clear English.",
      "RULES:",
      "1. Use ONLY values that appear in the DATA JSON. Never compute a new number; you may compare or difference values that are present.",
      "2. Never invent or imply satellite observations, farm measurements, weather records, crop parameters, prices, yields or profits.",
      "3. Never state or imply a yield, income or profit prediction, and never claim the rotation is scientifically validated, recommended or proven. Call it a comparison of suitability scores.",
      "4. Climate numbers must be attributed to the NASA POWER daily point API with the requested date range and its coverage percentage.",
      "5. Name at least one missing input or uncertainty from DATA, and one limitation of the method.",
      "6. If the user asks for a recommendation, a yield figure or a guarantee, say plainly that this prototype does not provide that and explain what it does compare.",
      "7. Plain language for a farmer or extension advisor. No markdown headings, no bold, no tables. Use at most five short lines. 120-190 words.",
      "Structure: a verdict sentence naming the highest and lowest dimension with their numbers; two or three 'why' sentences citing specific sub-values; one sentence on data gaps or uncertainty; one sentence on what a person could check next, framed as verification rather than advice.",
    ].join("\n");

    const prompt = `${systemRules}\n\nUSER QUESTION (may be empty): ${
      data.question || "(none — explain and compare the scenarios)"
    }\n\nDATA:\n${JSON.stringify(evidence)}`;

    try {
      const text = await base.asServiceRole.integrations.Core.InvokeLLM({ prompt });
      return {
        ok: true,
        text: typeof text === "string" ? text : JSON.stringify(text),
        evidence,
        deterministic: packed.map((p) => ({ scenario: p.scenario, summary: p.deterministic_summary })),
      };
    } catch (err) {
      return {
        ok: false,
        error: `The AI explanation service did not respond (${err?.message || "unknown error"}). The deterministic scores below are unaffected.`,
        evidence,
        deterministic: packed.map((p) => ({ scenario: p.scenario, summary: p.deterministic_summary })),
      };
    }
  });

// Public, read-only location analysis. Requests are made server-side, are
// bounded to the supported India mainland rectangle, and never write user records.
const publicDemoClimateCache = new Map();
async function fetchPublicDemoLocation(latitude, longitude) {
  if (!isWithinIndiaBounds(latitude, longitude)) {
    return { ok: false, error: "Choose coordinates within the supported India region." };
  }
  const lat = Number(latitude.toFixed(3));
  const lon = Number(longitude.toFixed(3));
  const cacheKey = `${lat},${lon}:20200101:20251231`;
  const cached = publicDemoClimateCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < 24 * 60 * 60 * 1000) {
    return { ok: true, ...cached.value, cache_hit: true };
  }

  const startDate = "20200101";
  const endDate = "20251231";
  const url = buildPowerUrl({ latitude: lat, longitude: lon, startDate, endDate, timeStandard: "UTC" });
  let json;
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "TerraShiftAI/1.0 (NASA Space Apps prototype)" },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return { ok: false, error: `NASA POWER returned HTTP ${response.status}. Please try again shortly.` };
    json = await response.json();
  } catch (error) {
    return { ok: false, error: `Could not reach NASA POWER: ${error?.message || "network error"}` };
  }
  if (!json?.properties?.parameter) {
    return { ok: false, error: `NASA POWER returned no parameter data. ${(json?.messages || []).join(" ")}`.trim() };
  }

  const climate = aggregatePower(json, { startDate, endDate, dataMode: "historical_6y" });
  climate.requested_params = POWER_PARAM_CODES;
  climate.requested_window = { mode: "historical_6y", start_date: startDate, end_date: endDate };
  climate.retrieved_at_utc = new Date().toISOString();
  const location = {
    name: "Selected demonstration point",
    district: "India",
    latitude: lat,
    longitude: lon,
  };
  const results = demoResults(climate, { ...DEMO_FARM, ...location });
  const value = { climate, results, location };
  publicDemoClimateCache.set(cacheKey, { cachedAt: Date.now(), value });
  if (publicDemoClimateCache.size > 30) {
    const oldest = publicDemoClimateCache.keys().next().value;
    publicDemoClimateCache.delete(oldest);
  }
  return { ok: true, ...value, cache_hit: false };
}

export const loadPublicDemoLocation = createServerFn({ method: "POST" })
  .validator(z.object({
    latitude: z.number().min(6).max(37.2),
    longitude: z.number().min(68).max(97.5),
  }))
  .handler(async ({ data }) => {
    enforceRateLimit({ scope: "public-demo-location", limit: 8 });
    return fetchPublicDemoLocation(data.latitude, data.longitude);
  });

/**
 * Public demo advisor: deterministic only. It recomputes the selected fixed
 * scenarios against the selected point's NASA POWER climate history.
 */
export const explainDemoScenario = createServerFn({ method: "POST" })
  .validator(z.object({
    scenarioIds: z.array(z.enum(DEMO_SCENARIO_IDS)).min(1).max(3),
    question: z.string().max(400).optional(),
    latitude: z.number().min(6).max(37.2).optional(),
    longitude: z.number().min(68).max(97.5).optional(),
  }).superRefine((value, ctx) => {
    if ((value.latitude == null) !== (value.longitude == null)) {
      ctx.addIssue({
        code: "custom",
        message: "Latitude and longitude must be provided together.",
        path: ["latitude"],
      });
    }
  }))
  .handler(async ({ data }) => {
    enforceRateLimit({ scope: "public-demo-advisor", limit: 12 });
    let climate = DEMO_CLIMATE;
    let location = DEMO_FARM;
    if (data.latitude != null && data.longitude != null) {
      const loaded = await fetchPublicDemoLocation(data.latitude, data.longitude);
      if (!loaded.ok) return loaded;
      climate = loaded.climate;
      location = { ...DEMO_FARM, ...loaded.location };
    }
    const rows = demoResults(climate, location).filter((row) => data.scenarioIds.includes(row.id));
    const scenarioLines = rows.map((row) => {
      const dimensions = Object.entries(row.result.dimension_scores || {})
        .map(([key, value]) => `${key}: ${value == null ? "not scored" : Number(value).toFixed(1)}`)
        .join(", ");
      return `${row.name}: overall ${row.result.overall == null ? "not scored" : Number(row.result.overall).toFixed(1)}/100 (${dimensions}).`;
    });
    const questionNote = data.question?.trim()
      ? ` Your question was: "${data.question.trim()}". This public demo summarises computed evidence only; it does not provide agronomic advice.`
      : "";
    const text = `Demonstration data for ${location.name || "the selected point"} (${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}). ${scenarioLines.join(" ")} Scores are heuristic comparisons, not yield, income or profit forecasts. NASA POWER values describe a gridded historical model record for 2020–2025, not an on-farm sensor or future forecast. Soil and crop parameters remain illustrative Harohalli demo inputs, not local soil measurements. Review missing inputs and uncertainty before interpreting scores.${questionNote}`;
    return { ok: true, text, explanationType: "deterministic", climate_location: location };
  });