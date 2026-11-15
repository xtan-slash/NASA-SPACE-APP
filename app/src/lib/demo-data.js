// Demonstration dataset for the public read-only demo (/demo).
// It is static: the demo makes no database reads and no writes, so a visitor cannot
// touch any user's farms, crops, climate snapshots or scenarios.
//
// The climate block is a real NASA POWER daily-point response for the demonstration
// point (12.68 N, 77.48 E; 2020-01-01 to 2025-12-31), aggregated by src/lib/power.js
// and recorded on 2026-11-15. It is historical context, not a forecast.

export const DEMO_FARM = {
  "id": "demo-farm",
  "name": "Harohalli pilot block",
  "district": "Ramanagara, Karnataka, India",
  "latitude": 12.68,
  "longitude": 77.48,
  "area_ha": 2,
  "soil_texture": "red_loam",
  "soil_ph": 6.3,
  "soil_organic_carbon": 0.62,
  "irrigation": "rainfed",
  "priorities": [
    "soil_health",
    "water_security",
    "climate_resilience",
    "income_stability",
    "livestock_feed",
    "diversification"
  ],
  "soil_source": "Demo input — illustrative values, not a laboratory soil test",
  "notes": "Demonstration farm record. Not a real farm and not connected to any user workspace.",
  "is_demo": true
};

export const DEMO_SNAPSHOT = {
  "start_date": "20200101",
  "end_date": "20251231",
  "retrieved_at": "2026-11-15T05:20:00.000Z",
  "coverage_key": 1,
  "latitude": 12.68,
  "longitude": 77.48
};

export const DEMO_CROPS = [
  {
    "id": "demo-ragi",
    "name": "Ragi (finger millet)",
    "local_name": "Ragi",
    "family": "Poaceae",
    "rotation_role": "cereal",
    "season": "kharif",
    "duration_days": 110,
    "water_need_mm": 450,
    "ph_min": 5,
    "ph_max": 7.5,
    "temp_opt_min": 20,
    "temp_opt_max": 30,
    "heat_threshold_c": 35,
    "oc_need": "medium",
    "texture_preferred": [
      "red_loam",
      "sandy_loam",
      "loam"
    ],
    "texture_marginal": [
      "clay_loam",
      "sandy"
    ],
    "n_fixing": false,
    "flood_sensitive": true,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-maize",
    "name": "Maize",
    "local_name": "Mekke jola",
    "family": "Poaceae",
    "rotation_role": "cereal",
    "season": "kharif",
    "duration_days": 110,
    "water_need_mm": 550,
    "ph_min": 5.5,
    "ph_max": 7.5,
    "temp_opt_min": 21,
    "temp_opt_max": 32,
    "heat_threshold_c": 35,
    "oc_need": "high",
    "texture_preferred": [
      "red_loam",
      "loam",
      "sandy_loam"
    ],
    "texture_marginal": [
      "clay_loam"
    ],
    "n_fixing": false,
    "flood_sensitive": true,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-horsegram",
    "name": "Horse gram",
    "local_name": "Huruli",
    "family": "Fabaceae",
    "rotation_role": "legume",
    "season": "rabi",
    "duration_days": 90,
    "water_need_mm": 250,
    "ph_min": 5,
    "ph_max": 8,
    "temp_opt_min": 15,
    "temp_opt_max": 28,
    "heat_threshold_c": 38,
    "oc_need": "low",
    "texture_preferred": [
      "red_loam",
      "sandy_loam"
    ],
    "texture_marginal": [
      "clay_loam"
    ],
    "n_fixing": true,
    "flood_sensitive": false,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-fieldbean",
    "name": "Field bean (avare)",
    "local_name": "Avare",
    "family": "Fabaceae",
    "rotation_role": "legume",
    "season": "kharif",
    "duration_days": 120,
    "water_need_mm": 450,
    "ph_min": 5.5,
    "ph_max": 7.5,
    "temp_opt_min": 18,
    "temp_opt_max": 28,
    "heat_threshold_c": 35,
    "oc_need": "medium",
    "texture_preferred": [
      "red_loam",
      "loam"
    ],
    "texture_marginal": [
      "clay_loam"
    ],
    "n_fixing": true,
    "flood_sensitive": true,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-groundnut",
    "name": "Groundnut",
    "local_name": "Shenga",
    "family": "Fabaceae",
    "rotation_role": "oilseed",
    "season": "kharif",
    "duration_days": 110,
    "water_need_mm": 550,
    "ph_min": 5.5,
    "ph_max": 7.5,
    "temp_opt_min": 22,
    "temp_opt_max": 30,
    "heat_threshold_c": 35,
    "oc_need": "low",
    "texture_preferred": [
      "sandy_loam",
      "red_loam",
      "sandy"
    ],
    "texture_marginal": [
      "loam"
    ],
    "n_fixing": true,
    "flood_sensitive": false,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-cowpea",
    "name": "Cowpea",
    "local_name": "Alasande",
    "family": "Fabaceae",
    "rotation_role": "legume",
    "season": "summer",
    "duration_days": 75,
    "water_need_mm": 300,
    "ph_min": 5.5,
    "ph_max": 8,
    "temp_opt_min": 22,
    "temp_opt_max": 32,
    "heat_threshold_c": 38,
    "oc_need": "low",
    "texture_preferred": [
      "red_loam",
      "sandy_loam",
      "loam"
    ],
    "texture_marginal": [
      "clay_loam"
    ],
    "n_fixing": true,
    "flood_sensitive": false,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-pigeonpea",
    "name": "Pigeon pea (tur)",
    "local_name": "Togari",
    "family": "Fabaceae",
    "rotation_role": "legume",
    "season": "kharif",
    "duration_days": 160,
    "water_need_mm": 500,
    "ph_min": 5.5,
    "ph_max": 8,
    "temp_opt_min": 20,
    "temp_opt_max": 32,
    "heat_threshold_c": 38,
    "oc_need": "low",
    "texture_preferred": [
      "red_loam",
      "loam",
      "clay_loam"
    ],
    "texture_marginal": [
      "sandy_loam"
    ],
    "n_fixing": true,
    "flood_sensitive": false,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-chickpea",
    "name": "Chickpea (bengal gram)",
    "local_name": "Kadale",
    "family": "Fabaceae",
    "rotation_role": "legume",
    "season": "rabi",
    "duration_days": 105,
    "water_need_mm": 350,
    "ph_min": 6,
    "ph_max": 8.5,
    "temp_opt_min": 15,
    "temp_opt_max": 25,
    "heat_threshold_c": 35,
    "oc_need": "low",
    "texture_preferred": [
      "clay_loam",
      "vertisol",
      "loam"
    ],
    "texture_marginal": [
      "red_loam"
    ],
    "n_fixing": true,
    "flood_sensitive": true,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-sorghum",
    "name": "Sorghum (jowar)",
    "local_name": "Jola",
    "family": "Poaceae",
    "rotation_role": "cereal",
    "season": "rabi",
    "duration_days": 115,
    "water_need_mm": 400,
    "ph_min": 5.5,
    "ph_max": 8.5,
    "temp_opt_min": 20,
    "temp_opt_max": 32,
    "heat_threshold_c": 38,
    "oc_need": "medium",
    "texture_preferred": [
      "vertisol",
      "clay_loam",
      "red_loam"
    ],
    "texture_marginal": [
      "loam"
    ],
    "n_fixing": false,
    "flood_sensitive": false,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-sunflower",
    "name": "Sunflower",
    "local_name": "Suryakanthi",
    "family": "Asteraceae",
    "rotation_role": "oilseed",
    "season": "summer",
    "duration_days": 95,
    "water_need_mm": 450,
    "ph_min": 5.5,
    "ph_max": 8,
    "temp_opt_min": 20,
    "temp_opt_max": 30,
    "heat_threshold_c": 35,
    "oc_need": "medium",
    "texture_preferred": [
      "loam",
      "clay_loam",
      "red_loam"
    ],
    "texture_marginal": [
      "sandy_loam"
    ],
    "n_fixing": false,
    "flood_sensitive": false,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-foddermaize",
    "name": "Fodder maize",
    "local_name": "Hasu mekke jola",
    "family": "Poaceae",
    "rotation_role": "fodder",
    "season": "kharif",
    "duration_days": 85,
    "water_need_mm": 500,
    "ph_min": 5.5,
    "ph_max": 7.5,
    "temp_opt_min": 20,
    "temp_opt_max": 32,
    "heat_threshold_c": 38,
    "oc_need": "medium",
    "texture_preferred": [
      "loam",
      "red_loam",
      "sandy_loam"
    ],
    "texture_marginal": [
      "clay_loam"
    ],
    "n_fixing": false,
    "flood_sensitive": false,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  },
  {
    "id": "demo-tomato",
    "name": "Tomato",
    "local_name": "Tomato",
    "family": "Solanaceae",
    "rotation_role": "vegetable",
    "season": "summer",
    "duration_days": 120,
    "water_need_mm": 500,
    "ph_min": 5.5,
    "ph_max": 7,
    "temp_opt_min": 18,
    "temp_opt_max": 28,
    "heat_threshold_c": 35,
    "oc_need": "high",
    "texture_preferred": [
      "red_loam",
      "loam"
    ],
    "texture_marginal": [
      "sandy_loam"
    ],
    "n_fixing": false,
    "flood_sensitive": true,
    "is_demo": true,
    "source_note": "Illustrative demonstration values for the prototype — not a validated agronomic source."
  }
];

export const DEMO_SCENARIOS = [
  {
    "id": "baseline-ragi",
    "name": "Illustrative baseline · Ragi monocrop",
    "notes": "Illustrative reference scenario only. No farmer interview or farm-level crop history was available; ragi is a common dryland cereal in the region.",
    "year_start": 2026,
    "year_end": 2029,
    "entries": [
      {
        "year": 2026,
        "season": "kharif",
        "crop_id": "demo-ragi"
      },
      {
        "year": 2027,
        "season": "kharif",
        "crop_id": "demo-ragi"
      },
      {
        "year": 2028,
        "season": "kharif",
        "crop_id": "demo-ragi"
      },
      {
        "year": 2029,
        "season": "kharif",
        "crop_id": "demo-ragi"
      }
    ]
  },
  {
    "id": "ragi-horsegram",
    "name": "Rotation candidate · Ragi + horsegram",
    "notes": "Illustrative cereal–pulse hypothesis, not a farmer-reported practice or validated recommendation.",
    "year_start": 2026,
    "year_end": 2029,
    "entries": [
      {
        "year": 2026,
        "season": "kharif",
        "crop_id": "demo-ragi"
      },
      {
        "year": 2026,
        "season": "rabi",
        "crop_id": "demo-horsegram"
      },
      {
        "year": 2027,
        "season": "kharif",
        "crop_id": "demo-ragi"
      },
      {
        "year": 2027,
        "season": "rabi",
        "crop_id": "demo-horsegram"
      },
      {
        "year": 2028,
        "season": "kharif",
        "crop_id": "demo-ragi"
      },
      {
        "year": 2028,
        "season": "rabi",
        "crop_id": "demo-horsegram"
      },
      {
        "year": 2029,
        "season": "kharif",
        "crop_id": "demo-ragi"
      },
      {
        "year": 2029,
        "season": "rabi",
        "crop_id": "demo-horsegram"
      }
    ]
  },
  {
    "id": "maize-horsegram",
    "name": "Rotation candidate · Maize + horsegram",
    "notes": "Illustrative cereal–pulse hypothesis used to compare a higher-water-demand cereal against the baseline.",
    "year_start": 2026,
    "year_end": 2029,
    "entries": [
      {
        "year": 2026,
        "season": "kharif",
        "crop_id": "demo-maize"
      },
      {
        "year": 2026,
        "season": "rabi",
        "crop_id": "demo-horsegram"
      },
      {
        "year": 2027,
        "season": "kharif",
        "crop_id": "demo-maize"
      },
      {
        "year": 2027,
        "season": "rabi",
        "crop_id": "demo-horsegram"
      },
      {
        "year": 2028,
        "season": "kharif",
        "crop_id": "demo-maize"
      },
      {
        "year": 2028,
        "season": "rabi",
        "crop_id": "demo-horsegram"
      },
      {
        "year": 2029,
        "season": "kharif",
        "crop_id": "demo-maize"
      },
      {
        "year": 2029,
        "season": "rabi",
        "crop_id": "demo-horsegram"
      }
    ]
  }
];

export const DEMO_WEIGHTS = { soil: 6, water: 6, climate: 5, diversity: 3 };

export const DEMO_CLIMATE = {
  "source": "NASA POWER — Daily point API (Agroclimatology community)",
  "source_url": "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M%2CT2M_MAX%2CT2M_MIN%2CPRECTOTCORR%2CRH2M%2CGWETROOT%2CALLSKY_SFC_SW_DWN%2CWS2M&community=AG&longitude=77.48&latitude=12.68&start=20200101&end=20251231&format=JSON",
  "api_version": "v2.10.3",
  "model_sources": [
    "MERRA2",
    "SYN1DEG",
    "POWER"
  ],
  "time_standard": "LST",
  "elevation_m": 720.22,
  "fill_value": -999,
  "start_date": "20200101",
  "end_date": "20251231",
  "params": [
    {
      "code": "T2M",
      "label": "Mean air temperature",
      "unit": "°C"
    },
    {
      "code": "T2M_MAX",
      "label": "Maximum air temperature",
      "unit": "°C"
    },
    {
      "code": "T2M_MIN",
      "label": "Minimum air temperature",
      "unit": "°C"
    },
    {
      "code": "PRECTOTCORR",
      "label": "Precipitation (bias corrected)",
      "unit": "mm/day"
    },
    {
      "code": "RH2M",
      "label": "Relative humidity at 2 m",
      "unit": "%"
    },
    {
      "code": "GWETROOT",
      "label": "Root-zone soil wetness",
      "unit": "fraction 0–1"
    },
    {
      "code": "ALLSKY_SFC_SW_DWN",
      "label": "All-sky shortwave irradiance",
      "unit": "MJ/m²/day"
    },
    {
      "code": "WS2M",
      "label": "Wind speed at 2 m",
      "unit": "m/s"
    }
  ],
  "units": {
    "T2M": "°C",
    "T2M_MAX": "°C",
    "T2M_MIN": "°C",
    "PRECTOTCORR": "mm/day",
    "RH2M": "%",
    "GWETROOT": "fraction 0–1",
    "ALLSKY_SFC_SW_DWN": "MJ/m²/day",
    "WS2M": "m/s"
  },
  "coverage": {
    "T2M": 1,
    "T2M_MAX": 1,
    "T2M_MIN": 1,
    "PRECTOTCORR": 1,
    "RH2M": 1,
    "GWETROOT": 1,
    "ALLSKY_SFC_SW_DWN": 1,
    "WS2M": 1
  },
  "coverage_key": 1,
  "annual": [
    {
      "year": 2020,
      "days": 366,
      "precip_mm": 989.4,
      "precip_days": 366,
      "t2m_c": 24.62,
      "t2m_max_c": 30.73,
      "gwetroot": 0.585,
      "solar_mj": 19.18,
      "heat_days_35": 81,
      "heavy_rain_days_50": 0
    },
    {
      "year": 2021,
      "days": 365,
      "precip_mm": 1294.8,
      "precip_days": 365,
      "t2m_c": 23.96,
      "t2m_max_c": 29.86,
      "gwetroot": 0.61,
      "solar_mj": 18.59,
      "heat_days_35": 46,
      "heavy_rain_days_50": 2
    },
    {
      "year": 2022,
      "days": 365,
      "precip_mm": 1423.8,
      "precip_days": 365,
      "t2m_c": 23.81,
      "t2m_max_c": 29.7,
      "gwetroot": 0.65,
      "solar_mj": 18.37,
      "heat_days_35": 45,
      "heavy_rain_days_50": 1
    },
    {
      "year": 2023,
      "days": 365,
      "precip_mm": 789.8,
      "precip_days": 365,
      "t2m_c": 24.71,
      "t2m_max_c": 31.43,
      "gwetroot": 0.545,
      "solar_mj": 19.51,
      "heat_days_35": 41,
      "heavy_rain_days_50": 0
    },
    {
      "year": 2024,
      "days": 366,
      "precip_mm": 1033.3,
      "precip_days": 366,
      "t2m_c": 25.29,
      "t2m_max_c": 31.62,
      "gwetroot": 0.563,
      "solar_mj": 18.62,
      "heat_days_35": 87,
      "heavy_rain_days_50": 1
    },
    {
      "year": 2025,
      "days": 365,
      "precip_mm": 823.5,
      "precip_days": 365,
      "t2m_c": 24.41,
      "t2m_max_c": 31.01,
      "gwetroot": 0.549,
      "solar_mj": 18.59,
      "heat_days_35": 58,
      "heavy_rain_days_50": 1
    }
  ],
  "monthly": [
    {
      "month": 1,
      "precip_mm": 7.6,
      "rain_days": 1.3,
      "t2m_c": 21.72,
      "t2m_max_c": 29.37,
      "rh2m": 72,
      "gwetroot": 0.557,
      "solar_mj": 18.53,
      "years": 6
    },
    {
      "month": 2,
      "precip_mm": 2.1,
      "rain_days": 0.5,
      "t2m_c": 23.91,
      "t2m_max_c": 33.16,
      "rh2m": 56.3,
      "gwetroot": 0.494,
      "solar_mj": 22.71,
      "years": 6
    },
    {
      "month": 3,
      "precip_mm": 11.3,
      "rain_days": 2.8,
      "t2m_c": 27.35,
      "t2m_max_c": 35.96,
      "rh2m": 45.2,
      "gwetroot": 0.472,
      "solar_mj": 23.54,
      "years": 6
    },
    {
      "month": 4,
      "precip_mm": 41.7,
      "rain_days": 6.7,
      "t2m_c": 29,
      "t2m_max_c": 36.54,
      "rh2m": 49.2,
      "gwetroot": 0.478,
      "solar_mj": 23.49,
      "years": 6
    },
    {
      "month": 5,
      "precip_mm": 168.5,
      "rain_days": 17.3,
      "t2m_c": 27.29,
      "t2m_max_c": 33.1,
      "rh2m": 67.5,
      "gwetroot": 0.538,
      "solar_mj": 20.54,
      "years": 6
    },
    {
      "month": 6,
      "precip_mm": 96.6,
      "rain_days": 13.8,
      "t2m_c": 25.1,
      "t2m_max_c": 30.58,
      "rh2m": 74.4,
      "gwetroot": 0.573,
      "solar_mj": 19.54,
      "years": 6
    },
    {
      "month": 7,
      "precip_mm": 114.4,
      "rain_days": 18.3,
      "t2m_c": 24.22,
      "t2m_max_c": 29.25,
      "rh2m": 78.1,
      "gwetroot": 0.592,
      "solar_mj": 15.78,
      "years": 6
    },
    {
      "month": 8,
      "precip_mm": 174.1,
      "rain_days": 17.3,
      "t2m_c": 24.37,
      "t2m_max_c": 29.39,
      "rh2m": 79.1,
      "gwetroot": 0.627,
      "solar_mj": 17.3,
      "years": 6
    },
    {
      "month": 9,
      "precip_mm": 136.7,
      "rain_days": 18.3,
      "t2m_c": 23.73,
      "t2m_max_c": 28.59,
      "rh2m": 82.2,
      "gwetroot": 0.666,
      "solar_mj": 17.56,
      "years": 6
    },
    {
      "month": 10,
      "precip_mm": 163.9,
      "rain_days": 20.5,
      "t2m_c": 23.39,
      "t2m_max_c": 27.97,
      "rh2m": 83.8,
      "gwetroot": 0.691,
      "solar_mj": 16.85,
      "years": 6
    },
    {
      "month": 11,
      "precip_mm": 95,
      "rain_days": 15.2,
      "t2m_c": 22.18,
      "t2m_max_c": 27.29,
      "rh2m": 83.8,
      "gwetroot": 0.674,
      "solar_mj": 14.64,
      "years": 6
    },
    {
      "month": 12,
      "precip_mm": 47.4,
      "rain_days": 6.2,
      "t2m_c": 21.35,
      "t2m_max_c": 27.71,
      "rh2m": 79.9,
      "gwetroot": 0.635,
      "solar_mj": 15.59,
      "years": 6
    }
  ],
  "seasons": {
    "kharif": {
      "label": "Kharif",
      "window": "Jun–Oct",
      "years": 6,
      "days": 153,
      "precip_mm": 685.5,
      "t2m_c": 24.16,
      "t2m_max_c": 29.15,
      "gwetroot": 0.63,
      "heat_days_35": 0.5,
      "heat_days_38": 0,
      "heavy_rain_days_50": 0.2,
      "by_year": [
        {
          "year": 2020,
          "days": 153,
          "complete": true,
          "precip_mm": 755.3499999999998,
          "t2m_c": 23.80614379084968,
          "t2m_max_c": 28.434379084967322,
          "gwetroot": 0.6526143790849673,
          "heat_days_35": 0,
          "heat_days_38": 0,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2021,
          "days": 153,
          "complete": true,
          "precip_mm": 659.51,
          "t2m_c": 23.822614379084968,
          "t2m_max_c": 28.598300653594784,
          "gwetroot": 0.6410457516339867,
          "heat_days_35": 0,
          "heat_days_38": 0,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2022,
          "days": 153,
          "complete": true,
          "precip_mm": 996.2999999999996,
          "t2m_c": 23.503137254901954,
          "t2m_max_c": 28.12777777777778,
          "gwetroot": 0.7236601307189546,
          "heat_days_35": 0,
          "heat_days_38": 0,
          "heavy_rain_days_50": 1
        },
        {
          "year": 2023,
          "days": 153,
          "complete": true,
          "precip_mm": 488.2200000000001,
          "t2m_c": 25.133660130718955,
          "t2m_max_c": 30.88986928104573,
          "gwetroot": 0.5633986928104578,
          "heat_days_35": 3,
          "heat_days_38": 0,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2024,
          "days": 153,
          "complete": true,
          "precip_mm": 690.55,
          "t2m_c": 24.355163398692813,
          "t2m_max_c": 29.37006535947715,
          "gwetroot": 0.6116339869281043,
          "heat_days_35": 0,
          "heat_days_38": 0,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2025,
          "days": 153,
          "complete": true,
          "precip_mm": 523.0700000000002,
          "t2m_c": 24.3424183006536,
          "t2m_max_c": 29.48326797385621,
          "gwetroot": 0.5881699346405231,
          "heat_days_35": 0,
          "heat_days_38": 0,
          "heavy_rain_days_50": 0
        }
      ]
    },
    "rabi": {
      "label": "Rabi",
      "window": "Nov–Mar",
      "years": 5,
      "days": 151,
      "precip_mm": 187.1,
      "t2m_c": 23.17,
      "t2m_max_c": 30.44,
      "gwetroot": 0.579,
      "heat_days_35": 26.4,
      "heat_days_38": 2.4,
      "heavy_rain_days_50": 0.2,
      "by_year": [
        {
          "year": 2020,
          "days": 151,
          "complete": true,
          "precip_mm": 168.90000000000003,
          "t2m_c": 22.68814569536424,
          "t2m_max_c": 29.875099337748352,
          "gwetroot": 0.5782781456953642,
          "heat_days_35": 28,
          "heat_days_38": 2,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2021,
          "days": 151,
          "complete": true,
          "precip_mm": 265.6000000000001,
          "t2m_c": 22.788543046357617,
          "t2m_max_c": 29.35900662251654,
          "gwetroot": 0.6258278145695365,
          "heat_days_35": 17,
          "heat_days_38": 0,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2022,
          "days": 151,
          "complete": true,
          "precip_mm": 198.08999999999995,
          "t2m_c": 21.99596026490066,
          "t2m_max_c": 29.298675496688737,
          "gwetroot": 0.62635761589404,
          "heat_days_35": 10,
          "heat_days_38": 0,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2023,
          "days": 152,
          "complete": true,
          "precip_mm": 98.35000000000004,
          "t2m_c": 24.983815789473677,
          "t2m_max_c": 32.82703947368422,
          "gwetroot": 0.49868421052631445,
          "heat_days_35": 48,
          "heat_days_38": 7,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2024,
          "days": 151,
          "complete": true,
          "precip_mm": 204.68000000000004,
          "t2m_c": 23.3927152317881,
          "t2m_max_c": 30.82642384105959,
          "gwetroot": 0.564834437086093,
          "heat_days_35": 29,
          "heat_days_38": 3,
          "heavy_rain_days_50": 1
        }
      ]
    },
    "summer": {
      "label": "Summer / Zaid",
      "window": "Apr–May",
      "years": 6,
      "days": 61,
      "precip_mm": 210.2,
      "t2m_c": 28.13,
      "t2m_max_c": 34.79,
      "gwetroot": 0.509,
      "heat_days_35": 30.8,
      "heat_days_38": 11.8,
      "heavy_rain_days_50": 0.5,
      "by_year": [
        {
          "year": 2020,
          "days": 61,
          "complete": true,
          "precip_mm": 97.85999999999997,
          "t2m_c": 29.061639344262286,
          "t2m_max_c": 35.997213114754096,
          "gwetroot": 0.48,
          "heat_days_35": 43,
          "heat_days_38": 16,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2021,
          "days": 61,
          "complete": true,
          "precip_mm": 352.36,
          "t2m_c": 27.34459016393443,
          "t2m_max_c": 33.59524590163935,
          "gwetroot": 0.5270491803278687,
          "heat_days_35": 18,
          "heat_days_38": 7,
          "heavy_rain_days_50": 2
        },
        {
          "year": 2022,
          "days": 61,
          "complete": true,
          "precip_mm": 243.69000000000003,
          "t2m_c": 27.32786885245901,
          "t2m_max_c": 34.1116393442623,
          "gwetroot": 0.5259016393442622,
          "heat_days_35": 28,
          "heat_days_38": 4,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2023,
          "days": 61,
          "complete": true,
          "precip_mm": 173.95000000000005,
          "t2m_c": 27.982950819672123,
          "t2m_max_c": 34.49606557377049,
          "gwetroot": 0.5118032786885246,
          "heat_days_35": 28,
          "heat_days_38": 6,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2024,
          "days": 61,
          "complete": true,
          "precip_mm": 146.73999999999998,
          "t2m_c": 29.44639344262296,
          "t2m_max_c": 36.62475409836065,
          "gwetroot": 0.49344262295082,
          "heat_days_35": 39,
          "heat_days_38": 34,
          "heavy_rain_days_50": 0
        },
        {
          "year": 2025,
          "days": 61,
          "complete": true,
          "precip_mm": 246.59000000000003,
          "t2m_c": 27.627540983606558,
          "t2m_max_c": 33.916065573770496,
          "gwetroot": 0.5152459016393445,
          "heat_days_35": 29,
          "heat_days_38": 4,
          "heavy_rain_days_50": 1
        }
      ]
    }
  },
  "years_covered": 6,
  "retrieved_note": "Recorded NASA POWER response for the demonstration point"
};