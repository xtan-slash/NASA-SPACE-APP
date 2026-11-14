// NASA POWER daily point API — request builder and aggregation.
// Everything returned here is derived from the API response; no values are estimated
// or filled in. Days the API reports as fill values are excluded and counted as gaps.

import { POWER_PARAM_CODES, POWER_PARAMS, SEASONS } from "./catalog.js";

export const POWER_BASE = "https://power.larc.nasa.gov/api/temporal/daily/point";

export function buildPowerUrl({ latitude, longitude, startDate, endDate }) {
  const params = new URLSearchParams({
    parameters: POWER_PARAM_CODES.join(","),
    community: "AG",
    longitude: String(longitude),
    latitude: String(latitude),
    start: startDate,
    end: endDate,
    format: "JSON",
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

export function aggregatePower(json, { startDate, endDate }) {
  const parameters = json?.properties?.parameter || {};
  const fill = json?.header?.fill_value ?? -999;
  const days = dayList(startDate, endDate);
  const unitMap = Object.fromEntries(POWER_PARAMS.map((p) => [p.code, p.unit]));

  const get = (code, key) => {
    const v = parameters[code]?.[key];
    return v == null || v === fill ? null : Number(v);
  };

  const coverage = {};
  for (const code of POWER_PARAM_CODES) {
    const present = days.filter((d) => get(code, d.key) != null).length;
    coverage[code] = days.length ? present / days.length : 0;
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
      heat_days_35: yearDays.filter((d) => (get("T2M_MAX", d.key) ?? -999) >= 35).length,
      heavy_rain_days_50: yearDays.filter((d) => (get("PRECTOTCORR", d.key) ?? 0) >= 50).length,
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
  const seasons = {};
  for (const season of SEASONS) {
    const seasonDays = days.filter((d) => season.months.includes(d.month));
    const buckets = {};
    for (const d of seasonDays) {
      const y = seasonYearOf(d, season);
      (buckets[y] ||= []).push(d);
    }
    const expectedDays = seasonDays.length / Math.max(1, Object.keys(buckets).length);
    const perYear = Object.entries(buckets)
      .map(([year, bucket]) => {
        const precipValid = bucket.map((d) => get("PRECTOTCORR", d.key)).filter((v) => v != null);
        return {
          year: Number(year),
          days: bucket.length,
          complete: bucket.length >= expectedDays * 0.95,
          precip_mm: precipValid.length === bucket.length ? precipValid.reduce((a, b) => a + b, 0) : null,
          t2m_c: mean(bucket.map((d) => get("T2M", d.key))),
          t2m_max_c: mean(bucket.map((d) => get("T2M_MAX", d.key))),
          gwetroot: mean(bucket.map((d) => get("GWETROOT", d.key))),
          heat_days_35: bucket.filter((d) => (get("T2M_MAX", d.key) ?? -999) >= 35).length,
          heat_days_38: bucket.filter((d) => (get("T2M_MAX", d.key) ?? -999) >= 38).length,
          heavy_rain_days_50: bucket.filter((d) => (get("PRECTOTCORR", d.key) ?? 0) >= 50).length,
        };
      })
      .filter((p) => p.complete && p.precip_mm != null && p.t2m_c != null)
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

  return {
    source: "NASA POWER — Daily point API (Agroclimatology community)",
    source_url: buildPowerUrl({
      latitude: json?.geometry?.coordinates?.[1],
      longitude: json?.geometry?.coordinates?.[0],
      startDate,
      endDate,
    }),
    api_version: json?.header?.api?.version || null,
    model_sources: json?.header?.sources || [],
    time_standard: json?.header?.time_standard || null,
    elevation_m: json?.geometry?.coordinates?.[2] ?? null,
    fill_value: fill,
    start_date: startDate,
    end_date: endDate,
    params: POWER_PARAMS.map((p) => ({ ...p })),
    units: unitMap,
    coverage,
    coverage_key: round(keyParams, 4),
    annual,
    monthly,
    seasons,
    years_covered: years.length,
  };
}