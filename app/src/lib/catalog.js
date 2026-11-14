// Shared catalog of configurable options. All crop/soil parameter values stored on
// Crop records are DEMO ILLUSTRATIVE values that the user can edit — nothing here is
// presented as a measured or authoritative agronomic source.

export const SEASONS = [
  { value: "kharif", label: "Kharif", months: [6, 7, 8, 9, 10], window: "Jun–Oct" },
  { value: "rabi", label: "Rabi", months: [11, 12, 1, 2, 3], window: "Nov–Mar" },
  { value: "summer", label: "Summer / Zaid", months: [4, 5], window: "Apr–May" },
];

export const SEASON_BY_VALUE = Object.fromEntries(SEASONS.map((s) => [s.value, s]));

export const TEXTURES = [
  { value: "sandy", label: "Sandy" },
  { value: "sandy_loam", label: "Sandy loam" },
  { value: "red_loam", label: "Red loam" },
  { value: "loam", label: "Loam" },
  { value: "clay_loam", label: "Clay loam" },
  { value: "clay", label: "Clay" },
  { value: "vertisol", label: "Black cotton soil (vertisol)" },
];

export const TEXTURE_LABEL = Object.fromEntries(TEXTURES.map((t) => [t.value, t.label]));

export const IRRIGATION = [
  { value: "rainfed", label: "Rainfed only", assumed_mm: 0 },
  { value: "supplemental", label: "Supplemental irrigation", assumed_mm: 120 },
  { value: "assured", label: "Assured irrigation", assumed_mm: 250 },
];

export const IRRIGATION_LABEL = Object.fromEntries(IRRIGATION.map((i) => [i.value, i.label]));

export const ROTATION_ROLES = [
  { value: "cereal", label: "Cereal" },
  { value: "legume", label: "Legume / pulse" },
  { value: "oilseed", label: "Oilseed" },
  { value: "vegetable", label: "Vegetable" },
  { value: "fodder", label: "Fodder" },
  { value: "cash", label: "Commercial / cash" },
];

export const PRIORITIES = [
  { value: "soil_health", label: "Restore soil health" },
  { value: "water_security", label: "Reduce water risk" },
  { value: "income_stability", label: "Stabilise income" },
  { value: "climate_resilience", label: "Climate resilience" },
  { value: "diversification", label: "Diversify crops" },
  { value: "livestock_feed", label: "Livestock feed" },
];

export const PRIORITY_LABEL = Object.fromEntries(PRIORITIES.map((p) => [p.value, p.label]));

export const OC_LEVELS = [
  { value: "low", label: "Low demand", threshold: 0.45 },
  { value: "medium", label: "Medium demand", threshold: 0.65 },
  { value: "high", label: "High demand", threshold: 0.85 },
];

export const OC_THRESHOLD = Object.fromEntries(OC_LEVELS.map((o) => [o.value, o.threshold]));

// NASA POWER parameters requested from the daily point API (AG community).
export const POWER_PARAMS = [
  { code: "T2M", label: "Mean air temperature", unit: "°C" },
  { code: "T2M_MAX", label: "Maximum air temperature", unit: "°C" },
  { code: "T2M_MIN", label: "Minimum air temperature", unit: "°C" },
  { code: "PRECTOTCORR", label: "Precipitation (bias corrected)", unit: "mm/day" },
  { code: "RH2M", label: "Relative humidity at 2 m", unit: "%" },
  { code: "GWETROOT", label: "Root-zone soil wetness", unit: "fraction 0–1" },
  { code: "ALLSKY_SFC_SW_DWN", label: "All-sky shortwave irradiance", unit: "MJ/m²/day" },
  { code: "WS2M", label: "Wind speed at 2 m", unit: "m/s" },
];

export const POWER_PARAM_CODES = POWER_PARAMS.map((p) => p.code);

export const DIMENSION_KEYS = ["soil", "water", "climate", "diversity"];

export const DIMENSION_LABEL = {
  soil: "Soil health suitability",
  water: "Water suitability",
  climate: "Climate suitability",
  diversity: "Crop diversity",
};

export const DEFAULT_WEIGHTS = { soil: 6, water: 6, climate: 5, diversity: 3 };

export const DEMO_LOCATION = {
  name: "Harohalli pilot block",
  district: "Ramanagara, Karnataka",
  latitude: 12.68,
  longitude: 77.48,
};