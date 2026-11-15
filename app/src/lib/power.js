// NASA POWER daily point API — request builder and aggregation.
// Everything returned here is derived from the API response; no values are estimated
// or filled in. Days the API reports as fill values are excluded and counted as gaps.

import { POWER_PARAM_CODES, POWER_PARAMS, SEASONS } from "./catalog.js";

export const POWER_BASE = "https://power.larc.nasa.gov/api/temporal/daily/point";

export function buildPowerUrl({ latitude, longitude, startDate, endDate, timeStandard = "UTC" }) {
  const params = new URLSearchParams({
    parameters: POWER_PARAM_CODES.join(","),
    community: "AG",
    longitude: String(longitude),
    latitude: String(latitude),
    start: startDate,
    end: endDate,
    format: "JSON",
    "time-standard": timeStandard,
  });
  return `${POWER_BASE}?${params.toString()}`;
}

function dayList(startDate, endDate) {
  const out = [];
  const start = Date.UTC(
    Number(startDate.slice(0, 4)),
    Number(startDate.slice(4, 6)) - 1,
    Number(startDate.slice(6, 8))
  );
  const end = Date.UTC(Number(endDate.slice(0, 4)), Number(endDate.slice(4, 6)) - 1, Number(endDate.slice(6, 8)));
  for (let t = start; t <= end; t += 86400000) {
    const d = new Date(t);
    const key = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
      d.getUTCDate()
    ).padStart(2, "0")}`;
    out.push({ key, year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  }
  return out;
}

const round = (x, digits = 2) =>
  x == null || !Number.isFinite(x) ? null : Number(x.toFixed(digits));

function mean(values) {
  const valid = values.filter((v) => v != null && Number.isFinite(v));
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function aggregatePower(json, { startDate, endDate, dataMode = "custom" }) {
  const parameters = json?.properties?.parameter || {};
  const fill = json?.header?.fill_value ?? -999;
  const days = dayList(startDate, endDate);
  const unitMap = Object.fromEntries(POWER_PARAMS.map((p) => [p.code, p.unit]));

  const get = (code, key) => {
    const raw = parameters[code]?.[key];
    if (raw == null || String(raw).trim() === "") return null;
    const value = Number(raw);
    // POWER fill values may arrive as numbers or strings. Always reject the
    // documented -999 sentinel even if the response header omits fill_value.
    if (!Number.isFinite(value) || value === Number(fill) || value === -999) return null;
    return value;
  };

  const coverage = {};
  const parameterLatestDates = {};
  for (const code of POWER_PARAM_CODES) {
    const validDays = days.filter((d) => get(code, d.key) != null);
    coverage[code] = days.length ? validDays.length / days.length : 0;
    parameterLatestDates[code] = validDays.length ? validDays[validDays.length - 1].key : null;
  }

  // Annual summaries
  const years = [...new Set(days.map((d) => d.year))];
  const annual = years.map((year) => {
    const yearDays = days.filter((d) => d.year === year);
    const precipVals = yearDays.map((d) => get("PRECTOTCORR", d.key));
    const precipValid = precipVals.filter((v) => v != null);
    return {
      year,
      days: yearDays.length,
      precip_mm: round(precipValid.reduce((a, b) => a + b, 0), 1),
      precip_days: precipValid.length,
      t2m_c: round(mean(yearDays.map((d) => get("T2M", d.key))), 2),
      t2m_max_c: round(mean(yearDays.map((d) => get("T2M_MAX", d.key))), 2),
      gwetroot: round(mean(yearDays.map((d) => get("GWETROOT", d.key))), 3),
      solar_mj: round(mean(yearDays.map((d) => get("ALLSKY_SFC_SW_DWN", d.key))), 2),
      heat_days_35: yearDays.filter((d) => { const value = get("T2M_MAX", d.key); return value != null && value >= 35; }).length,
      heavy_rain_days_50: yearDays.filter((d) => { const value = get("PRECTOTCORR", d.key); return value != null && value >= 50; }).length,
    };
  });

  // Monthly climatology (mean of daily values per calendar month, across years)
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthDays = days.filter((d) => d.month === month);
    const precipVals = monthDays.map((d) => get("PRECTOTCORR", d.key)).filter((v) => v != null);
    const yearsCount = new Set(monthDays.map((d) => d.year)).size || 1;
    return {
      month,
      precip_mm: round(precipVals.reduce((a, b) => a + b, 0) / yearsCount, 1),
      rain_days: round(precipVals.filter((v) => v >= 1).length / yearsCount, 1),
      t2m_c: round(mean(monthDays.map((d) => get("T2M", d.key))), 2),
      t2m_max_c: round(mean(monthDays.map((d) => get("T2M_MAX", d.key))), 2),
      rh2m: round(mean(monthDays.map((d) => get("RH2M", d.key))), 1),
      gwetroot: round(mean(monthDays.map((d) => get("GWETROOT", d.key))), 3),
      solar_mj: round(mean(monthDays.map((d) => get("ALLSKY_SFC_SW_DWN", d.key))), 2),
      years: yearsCount,
    };
  });

  // Season windows. Each day is assigned to the season-year the window started in,
  // so a rabi window (Nov–Mar) is counted as one season rather than split across years.
  const seasonYearOf = (d, season) => {
    if (season.value === "rabi") return d.month >= 11 ? d.year : d.year - 1;
    return d.year;
  };
  const expectedSeasonDays = (season, year) => {
    const start = season.value === "rabi" ? Date.UTC(year, 10, 1) :
      season.value === "kharif" ? Date.UTC(year, 5, 1) : Date.UTC(year, 3, 1);
    const end = season.value === "rabi" ? Date.UTC(year + 1, 2, 31) :
      season.value === "kharif" ? Date.UTC(year, 9, 31) : Date.UTC(year, 4, 31);
    return Math.round((end - start) / 86400000) + 1;
  };
  const seasons = {};
  for (const season of SEASONS) {
    const seasonDays = days.filter((d) => season.months.includes(d.month));
    const buckets = {};
    for (const d of seasonDays) {
      const y = seasonYearOf(d, season);
      (buckets[y] ||= []).push(d);
    }
    const perYear = Object.entries(buckets)
      .map(([yearText, bucket]) => {
        const year = Number(yearText);
        const expectedDays = expectedSeasonDays(season, year);
        const precipValid = bucket.map((d) => get("PRECTOTCORR", d.key)).filter((v) => v != null);
        const tempValid = bucket.map((d) => get("T2M", d.key)).filter((v) => v != null);
        const maxTempValid = bucket.map((d) => get("T2M_MAX", d.key)).filter((v) => v != null);
        const completeWindow = bucket.length >= expectedDays * 0.95;
        const adequateCoverage = precipValid.length >= bucket.length * 0.95 && tempValid.length >= bucket.length * 0.95;
        return {
          year,
          days: bucket.length,
          expected_days: expectedDays,
          complete: completeWindow && adequateCoverage,
          precip_mm: completeWindow && precipValid.length >= bucket.length * 0.95
            ? precipValid.reduce((a, b) => a + b, 0)
            : null,
          t2m_c: mean(bucket.map((d) => get("T2M", d.key))),
          t2m_max_c: maxTempValid.length >= bucket.length * 0.95 ? mean(maxTempValid) : null,
          gwetroot: mean(bucket.map((d) => get("GWETROOT", d.key))),
          heat_days_35: bucket.filter((d) => { const value = get("T2M_MAX", d.key); return value != null && value >= 35; }).length,
          heat_days_38: bucket.filter((d) => { const value = get("T2M_MAX", d.key); return value != null && value >= 38; }).length,
          heavy_rain_days_50: bucket.filter((d) => { const value = get("PRECTOTCORR", d.key); return value != null && value >= 50; }).length,
        };
      })
      .filter((p) => p.complete && p.precip_mm != null && p.t2m_c != null && p.t2m_max_c != null)
      .sort((a, b) => a.year - b.year);

    seasons[season.value] = {
      label: season.label,
      window: season.window,
      years: perYear.length,
      days: round(mean(perYear.map((p) => p.days)), 0),
      precip_mm: round(mean(perYear.map((p) => p.precip_mm)), 1),
      t2m_c: round(mean(perYear.map((p) => p.t2m_c)), 2),
      t2m_max_c: round(mean(perYear.map((p) => p.t2m_max_c)), 2),
      gwetroot: round(mean(perYear.map((p) => p.gwetroot)), 3),
      heat_days_35: round(mean(perYear.map((p) => p.heat_days_35)), 1),
      heat_days_38: round(mean(perYear.map((p) => p.heat_days_38)), 1),
      heavy_rain_days_50: round(mean(perYear.map((p) => p.heavy_rain_days_50)), 1),
      by_year: perYear,
    };
  }

  const keyParams = mean([coverage.T2M, coverage.PRECTOTCORR]);
  const daily = days.map((d) => ({
    date: d.key,
    precip_mm: get("PRECTOTCORR", d.key),
    t2m_c: get("T2M", d.key),
    t2m_max_c: get("T2M_MAX", d.key),
    rh2m: get("RH2M", d.key),
    gwetroot: get("GWETROOT", d.key),
    solar_mj: get("ALLSKY_SFC_SW_DWN", d.key),
    ws2m: get("WS2M", d.key),
  }));
  const sumValid = (values) => {
    const valid = values.filter((v) => v != null && Number.isFinite(v));
    return valid.length ? round(valid.reduce((a, b) => a + b, 0), 1) : null;
  };
  const recentSummary = {
    days_requested: days.length,
    rainfall_total_mm: sumValid(daily.map((d) => d.precip_mm)),
    rainfall_days_available: daily.filter((d) => d.precip_mm != null).length,
    mean_temp_c: round(mean(daily.map((d) => d.t2m_c)), 2),
    mean_max_temp_c: round(mean(daily.map((d) => d.t2m_max_c)), 2),
    mean_humidity_pct: round(mean(daily.map((d) => d.rh2m)), 1),
    mean_root_zone_wetness: round(mean(daily.map((d) => d.gwetroot)), 3),
    mean_solar_mj: round(mean(daily.map((d) => d.solar_mj)), 2),
    mean_wind_ms: round(mean(daily.map((d) => d.ws2m)), 2),
  };

  return {
    source: "NASA POWER — Daily point API (Agroclimatology community)",
    source_url: buildPowerUrl({
      latitude: json?.geometry?.coordinates?.[1],
      longitude: json?.geometry?.coordinates?.[0],
      startDate,
      endDate,
      timeStandard: "UTC",
    }),
    api_version: json?.header?.api?.version || null,
    model_sources: json?.header?.sources || [],
    time_standard: json?.header?.time_standard || "UTC",
    data_mode: dataMode,
    parameter_latest_dates: parameterLatestDates,
    elevation_m: json?.geometry?.coordinates?.[2] ?? null,
    fill_value: fill,
    start_date: startDate,
    end_date: endDate,
    params: POWER_PARAMS.map((p) => ({ ...p })),
    units: unitMap,
    coverage,
    coverage_key: round(keyParams, 4),
    recent_summary: recentSummary,
    daily: dataMode === "recent_30d" || dataMode === "recent_90d" ? daily : [],
    annual,
    monthly,
    seasons,
    years_covered: years.length,
  };
}