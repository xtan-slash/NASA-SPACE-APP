import { useMemo, useState } from "react";
import { ChevronDown, Database, Satellite } from "lucide-react";
import { DEMO_CLIMATE, DEMO_CROPS, DEMO_FARM, DEMO_SNAPSHOT, DEMO_WEIGHTS } from "@/lib/demo-data";
import { DIMENSION_KEYS, DIMENSION_LABEL, IRRIGATION_LABEL, TEXTURE_LABEL } from "@/lib/catalog";

const fmt = (value, digits = 1, suffix = "") =>
  value == null || !Number.isFinite(Number(value)) ? "—" : `${Number(value).toFixed(digits)}${suffix}`;

function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 py-1.5 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="metric text-right">{value ?? "—"}</dd>
    </div>
  );
}

function CropParameters({ crop }) {
  return (
    <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-semibold">{crop.name}</p>
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          Illustrative scoring inputs
        </span>
      </div>
      <dl className="mt-2 grid gap-x-4 sm:grid-cols-2 text-[10.5px]">
        <Field label="Water demand used" value={fmt(crop.water_need_mm, 0, " mm / season")} />
        <Field label="Crop pH range used" value={`${crop.ph_min}–${crop.ph_max}`} />
        <Field label="Optimum mean temperature" value={`${crop.temp_opt_min}–${crop.temp_opt_max} °C`} />
        <Field label="Heat threshold" value={fmt(crop.heat_threshold_c, 0, " °C")} />
        <Field label="Organic-carbon demand class" value={crop.oc_need} />
        <Field label="Texture preference" value={(crop.texture_preferred || []).map((v) => TEXTURE_LABEL[v] || v).join(", ")} />
        <Field label="Legume flag used" value={crop.n_fixing ? "Yes" : "No"} />
        <Field label="Flood-sensitive flag" value={crop.flood_sensitive ? "Yes" : "No"} />
      </dl>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        These are the exact values supplied to the scoring engine for this demo crop. Published references displayed elsewhere are informational only and do not replace these inputs.
      </p>
    </div>
  );
}

function SeasonTrace({ item }) {
  return (
    <div className="rounded-lg border border-border/70 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[12px] font-semibold">{item.year} · {item.season_label} · {item.crop_name}</p>
        <p className="metric text-[11px]">Season score {fmt(item.season_total)}</p>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Soil checks</p>
          <div className="mt-1 space-y-1.5">
            {item.soil_parts.map((part) => (
              <div key={part.label} className="rounded bg-secondary/50 p-2">
                <div className="flex justify-between gap-2 text-[10.5px]">
                  <span>{part.label}</span><strong className="metric">{fmt(part.score)}</strong>
                </div>
                <p className="mt-1 text-[9.5px] leading-relaxed text-muted-foreground">{part.evidence}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Water balance</p>
          <dl className="mt-1 text-[10.5px]">
            <Field label="Crop demand" value={fmt(item.water_detail.demand_mm, 1, " mm")} />
            <Field label="NASA season rainfall" value={fmt(item.water_detail.season_rain_mm, 1, " mm")} />
            <Field label="Assumed effective rainfall (75%)" value={fmt(item.water_detail.effective_rain_mm, 1, " mm")} />
            <Field label="Assumed irrigation" value={fmt(item.water_detail.irrigation_mm, 0, " mm")} />
            <Field label="Estimated supply" value={fmt(item.water_detail.supply_mm, 1, " mm")} />
            <Field label="Supply / demand" value={fmt(item.water_detail.coverage, 2, "×")} />
            <Field label="Water score" value={fmt(item.scores.water)} />
          </dl>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Climate checks</p>
          <dl className="mt-1 text-[10.5px]">
            <Field label="Season mean T2M" value={fmt(item.climate_detail.season_temp_c, 2, " °C")} />
            <Field label="Temperature fit" value={fmt(item.climate_detail.temp_fit)} />
            <Field label="Heat threshold" value={fmt(item.climate_detail.heat_threshold_c, 0, " °C")} />
            <Field label="Heat days" value={fmt(item.climate_detail.heat_days, 1)} />
            <Field label="Heat penalty" value={fmt(item.climate_detail.heat_penalty)} />
            <Field label="Heavy-rain days (≥50 mm)" value={fmt(item.climate_detail.heavy_rain_days, 1)} />
            <Field label="Heavy-rain penalty" value={fmt(item.climate_detail.rain_penalty)} />
            <Field label="Climate score" value={fmt(item.scores.climate)} />
          </dl>
        </div>
      </div>
      {item.flags?.length > 0 && (
        <ul className="mt-2 space-y-1 text-[10px] text-muted-foreground">
          {item.flags.map((flag) => <li key={flag}>• {flag}</li>)}
        </ul>
      )}
    </div>
  );
}

function ScenarioTrace({ row }) {
  const [open, setOpen] = useState(false);
  const result = row.result;
  const cropMap = useMemo(() => Object.fromEntries(DEMO_CROPS.map((crop) => [crop.id, crop])), []);
  const usedCrops = [...new Set(row.scenario.entries.map((entry) => entry.crop_id))]
    .map((id) => cropMap[id]).filter(Boolean);

  return (
    <section className="rounded-xl border border-border/70 bg-card">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <span className="min-w-0">
          <span className="block text-[12.5px] font-semibold">{row.name}</span>
          <span className="mt-0.5 block text-[10.5px] text-muted-foreground">
            Overall {fmt(result.overall)} / 100 · engine {result.engine_version} · {result.years.length} scored seasons
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-4 border-t border-border/70 p-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold">Crop parameter records actually used</p>
            <div className="grid gap-2 md:grid-cols-2">{usedCrops.map((crop) => <CropParameters key={crop.id} crop={crop} />)}</div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold">Season-level calculation evidence</p>
            <div className="space-y-2">{result.years.map((item, index) => <SeasonTrace key={`${item.year}-${item.season}-${index}`} item={item} />)}</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/70 p-3">
              <p className="text-[11px] font-semibold">Effective overall weights</p>
              <dl className="mt-1 text-[10.5px]">
                {DIMENSION_KEYS.map((key) => <Field key={key} label={DIMENSION_LABEL[key]} value={result.weights.effective_pct[key] == null ? "Excluded" : `${fmt(result.weights.effective_pct[key])}%`} />)}
              </dl>
              <p className="mt-2 text-[9.5px] text-muted-foreground">Configured weights: soil {DEMO_WEIGHTS.soil}, water {DEMO_WEIGHTS.water}, climate {DEMO_WEIGHTS.climate}, diversity {DEMO_WEIGHTS.diversity}. Effective weights are renormalised over available dimensions.</p>
            </div>
            <div className="rounded-lg border border-border/70 p-3">
              <p className="text-[11px] font-semibold">Rotation diversity calculation</p>
              <dl className="mt-1 text-[10.5px]">
                <Field label="Crop families" value={result.diversity?.families?.join(", ")} />
                <Field label="Family counts" value={Object.entries(result.diversity?.family_counts || {}).map(([key, value]) => `${key}: ${value}`).join(", ")} />
                <Field label="Legume share" value={fmt((result.diversity?.legume_share ?? 0) * 100, 1, "%")} />
                <Field label="Family alternation" value={fmt((result.diversity?.alternation ?? 0) * 100, 1, "%")} />
                <Field label="Diversity score" value={fmt(result.dimension_scores.diversity)} />
              </dl>
            </div>
          </div>
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
            <p className="text-[11px] font-semibold">Assumptions and missing information</p>
            <ul className="mt-1 space-y-1 text-[10.5px] leading-relaxed text-muted-foreground">
              {result.uncertainty.map((item) => <li key={item.message}>• {item.message}</li>)}
              {result.missing.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

export default function DemoScoreTrace({ rows }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-border/70 p-3">
          <div className="flex items-center gap-2"><Database className="h-4 w-4 text-primary" /><p className="text-[11px] font-semibold">Farm inputs supplied to the engine</p></div>
          <dl className="mt-2 text-[10.5px]">
            <Field label="Location" value={DEMO_FARM.district} />
            <Field label="Coordinates" value={`${DEMO_FARM.latitude.toFixed(4)}, ${DEMO_FARM.longitude.toFixed(4)}`} />
            <Field label="Soil texture" value={TEXTURE_LABEL[DEMO_FARM.soil_texture] || DEMO_FARM.soil_texture} />
            <Field label="Soil pH" value={DEMO_FARM.soil_ph} />
            <Field label="Organic carbon" value={fmt(DEMO_FARM.soil_organic_carbon, 2, "%")} />
            <Field label="Irrigation" value={IRRIGATION_LABEL[DEMO_FARM.irrigation]} />
            <Field label="Provenance" value={DEMO_FARM.soil_source} />
          </dl>
        </div>
        <div className="rounded-xl border border-border/70 p-3">
          <div className="flex items-center gap-2"><Satellite className="h-4 w-4 text-primary" /><p className="text-[11px] font-semibold">NASA POWER climate basis</p></div>
          <dl className="mt-2 text-[10.5px]">
            <Field label="Source" value="NASA POWER Daily Point API · AG" />
            <Field label="Requested window" value={`${DEMO_CLIMATE.start_date}–${DEMO_CLIMATE.end_date}`} />
            <Field label="Retrieved (UTC)" value={new Date(DEMO_SNAPSHOT.retrieved_at).toLocaleString("en-IN", { timeZone: "UTC", timeZoneName: "short" })} />
            <Field label="Time standard" value={DEMO_CLIMATE.time_standard} />
            <Field label="Key-parameter coverage" value={fmt(DEMO_CLIMATE.coverage_key * 100, 1, "%")} />
            <Field label="Elevation (grid)" value={fmt(DEMO_CLIMATE.elevation_m, 1, " m")} />
          </dl>
          <a href={DEMO_CLIMATE.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-[10.5px] font-medium text-primary hover:underline">Open recorded NASA POWER request ↗</a>
        </div>
      </div>
      <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-3 text-[10.5px] leading-relaxed">
        <p className="font-semibold">Which NASA parameters actually affect the current score?</p>
        <p className="mt-1 text-muted-foreground">The scoring engine uses seasonal PRECTOTCORR rainfall totals, T2M mean temperature, derived heat-day counts from daily maximum temperature, and derived heavy-rain-day counts. It combines these with the crop records and farm inputs shown above.</p>
        <p className="mt-1 text-muted-foreground">RH2M, GWETROOT, ALLSKY_SFC_SW_DWN and WS2M are displayed as climate context but are not direct inputs to the current four-dimension scoring formula. GWETROOT is model-derived, not a field soil-moisture measurement.</p>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold">Inspect the actual calculation inputs and intermediate results</p>
        <div className="space-y-2">{rows.map((row) => <ScenarioTrace key={row.id} row={row} />)}</div>
      </div>
    </div>
  );
}