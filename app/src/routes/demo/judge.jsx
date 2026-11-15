import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Database, FlaskConical, Satellite, Sprout } from "lucide-react";
import Notice from "@/components/common/Notice";
import { DEMO_CLIMATE, DEMO_CROPS, DEMO_FARM, DEMO_SCENARIOS, DEMO_SNAPSHOT, DEMO_WEIGHTS } from "@/lib/demo-data";
import { demoResults } from "@/lib/demo-scoring";
import { DIMENSION_LABEL, IRRIGATION_LABEL, TEXTURE_LABEL } from "@/lib/catalog";

export const Route = createFileRoute("/demo/judge")({
  head: () => ({
    meta: [
      { title: "Judge walkthrough · TerraShift AI" },
      { name: "description", content: "A guided technical walkthrough of how TerraShift AI turns recorded NASA POWER climate data and labelled farm and crop inputs into deterministic crop-rotation comparisons." },
    ],
  }),
  component: JudgeWalkthrough,
});

const STEPS = [
  { title: "Define the farm point", subtitle: "Location and input provenance", icon: Sprout },
  { title: "Retrieve NASA POWER data", subtitle: "Source, request and observation window", icon: Satellite },
  { title: "Process the climate record", subtitle: "Coverage and seasonal aggregation", icon: Database },
  { title: "Calculate the scores", subtitle: "Inputs, assumptions and deterministic formula", icon: FlaskConical },
  { title: "Compare rotation scenarios", subtitle: "Results, gaps and interpretation", icon: Check },
];

const n = (value, digits = 1) => value == null ? "—" : Number(value).toFixed(digits);

function Metric({ label, value, note }) {
  return <div className="rounded-xl border border-border/70 bg-card p-3"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="metric mt-1 text-[20px]">{value}</p>{note && <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>}</div>;
}

function JudgeWalkthrough() {
  const [step, setStep] = useState(0);
  const rows = demoResults();
  const seasonRows = Object.entries(DEMO_CLIMATE.seasons || {});
  const active = STEPS[step];
  const Icon = active.icon;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="border-b border-border/70 pb-5">
        <p className="kicker">NASA Space Apps 2026 · Field Shift</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[27px] font-medium leading-tight sm:text-[34px]">Judge Mode: From NASA data to rotation scores</h1>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
              A five-stage, evidence-led walkthrough of the public demonstration dataset and the deterministic scoring engine. Follow the same data path used by the demo comparison.
            </p>
          </div>
          <Link to="/demo" className="text-[11.5px] font-medium text-primary hover:underline">Exit Judge Mode →</Link>
        </div>
      </header>

      <Notice tone="warn" title="Recorded public demonstration, not a live API session">
        This walkthrough uses the fixed Harohalli sample farm and a recorded NASA POWER response for 1 January 2020 to 31 December 2025. It does not send a new NASA request while you move through these steps. The private workspace makes fresh requests for a user's saved coordinates, subject to NASA POWER publication delays.
      </Notice>

      <div className="panel p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="kicker">Technical walkthrough</p>
          <span className="metric text-[11px] text-muted-foreground">STEP {step + 1} / {STEPS.length}</span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5" aria-label="Walkthrough progress">
          {STEPS.map((item, index) => (
            <button key={item.title} type="button" onClick={() => setStep(index)}
              aria-label={`Go to step ${index + 1}: ${item.title}`}
              className={`h-2 rounded-full transition-colors ${index <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
        <div className="mt-5 flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></div>
          <div className="min-w-0">
            <p className="kicker">Stage {step + 1}</p>
            <h2 className="mt-1 text-[19px] font-medium">{active.title}</h2>
            <p className="mt-1 text-[11.5px] text-muted-foreground">{active.subtitle}</p>
          </div>
        </div>

        <div className="mt-5 min-h-[310px]">
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Demonstration farm" value={DEMO_FARM.name} note={DEMO_FARM.district} />
                <Metric label="Farm point" value={`${DEMO_FARM.latitude.toFixed(4)}°N, ${DEMO_FARM.longitude.toFixed(4)}°E`} note="Coordinates used for the recorded POWER grid point" />
                <Metric label="Soil texture" value={TEXTURE_LABEL[DEMO_FARM.soil_texture] || DEMO_FARM.soil_texture} note={`pH ${DEMO_FARM.soil_ph} · Organic carbon ${DEMO_FARM.soil_organic_carbon}%`} />
                <Metric label="Irrigation" value={IRRIGATION_LABEL[DEMO_FARM.irrigation]} note={`Area: ${DEMO_FARM.area_ha} ha`} />
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-[12px] font-semibold">Input provenance</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{DEMO_FARM.soil_source}. This is a demonstration record, not a real surveyed farm. These soil values enter the soil checks and irrigation status affects the water balance.</p>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">The app does not infer laboratory soil values from NASA POWER. Farm soil inputs and gridded climate data remain separate evidence sources.</p>
              <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-3">
                <p className="text-[11.5px] font-semibold text-foreground">Private workspace account boundary</p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">Each signed-in account can read, update and delete only the Farm, Scenario and ClimateSnapshot records it created. The shared master Crop catalogue is common reference data; personal crop additions and overrides are stored separately in creator-owned UserCrop records. The active farm selection is stored under a key scoped to that account. This public walkthrough uses fixed demo data and does not access those private records.</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Source" value="NASA POWER" note="Daily Point API · AG community" />
                <Metric label="Requested window" value="2020–2025" note="1 Jan 2020 to 31 Dec 2025" />
                <Metric label="Key-parameter coverage" value={`${n(DEMO_CLIMATE.coverage_key * 100)}%`} note="Recorded daily response" />
              </div>
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-[11px] font-semibold">Recorded API request</p>
                <code className="mt-2 block break-all text-[10px] leading-relaxed text-muted-foreground">{DEMO_CLIMATE.source_url}</code>
                <a href={DEMO_CLIMATE.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-[11px] font-medium text-primary hover:underline">Open the NASA POWER request ↗</a>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {DEMO_CLIMATE.params.map((param) => <div key={param.code} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/40 px-3 py-2"><span className="text-[11px] font-medium">{param.code}</span><span className="text-right text-[10px] text-muted-foreground">{param.label} · {param.unit}</span></div>)}
              </div>
              <p className="text-[10.5px] leading-relaxed text-muted-foreground">API version {DEMO_CLIMATE.api_version} · Time standard {DEMO_CLIMATE.time_standard} · Retrieved {DEMO_SNAPSHOT.retrieved_at} · The public walkthrough displays this recorded response; it does not make a live request.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Coverage" value={`${n(DEMO_CLIMATE.coverage_key * 100)}%`} note="Key daily parameters" />
                <Metric label="Complete seasons" value={seasonRows.reduce((sum, [, value]) => sum + (value.years || 0), 0)} note="Kharif + Rabi + Summer windows" />
                <Metric label="Fill sentinel" value={DEMO_CLIMATE.fill_value} note="Excluded from valid-value aggregation" />
              </div>
              <div className="panel-flat p-3">
                <p className="text-[11px] font-semibold">Seasonal aggregates supplied to the score</p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[500px] text-[10.5px]">
                    <thead><tr className="border-b border-border/70 text-left text-muted-foreground"><th className="py-2">Season</th><th className="py-2 text-right">Rainfall</th><th className="py-2 text-right">Mean T2M</th><th className="py-2 text-right">Heat days ≥35°C</th><th className="py-2 text-right">Heat days ≥38°C</th><th className="py-2 text-right">Heavy-rain days ≥50 mm</th></tr></thead>
                    <tbody>{seasonRows.map(([key, value]) => <tr key={key} className="border-b border-border/40"><td className="py-2 font-medium">{value.label} · {value.window}</td><td className="metric py-2 text-right">{n(value.precip_mm)} mm</td><td className="metric py-2 text-right">{n(value.t2m_c, 2)} °C</td><td className="metric py-2 text-right">{n(value.heat_days_35)}</td><td className="metric py-2 text-right">{n(value.heat_days_38)}</td><td className="metric py-2 text-right">{n(value.heavy_rain_days_50)}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
              <Notice tone="info" title="What happens during processing">
                Fill values are excluded, coverage is calculated, and daily observations are grouped into Kharif (June–October), Rabi (November–March) and Summer (April–May) windows. The engine requires complete season windows; missing days are not silently interpolated.
              </Notice>
              <p className="text-[10.5px] leading-relaxed text-muted-foreground">RH2M, GWETROOT, solar irradiance and wind speed remain useful climate context, but they are not direct inputs to the current score. GWETROOT is model-derived, not a field sensor reading.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Configured weights" value="6 / 6 / 5 / 3" note="Soil / water / climate / diversity" />
                <Metric label="Normalised shares" value="30 / 30 / 25 / 15%" note="Applied when all four dimensions are available" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 p-3"><p className="text-[12px] font-semibold">Soil</p><p className="mt-1 text-[11px] text-muted-foreground">Farm pH fit · texture compatibility · organic-carbon demand. The soil values are illustrative in this demo.</p></div>
                <div className="rounded-xl border border-border/70 p-3"><p className="text-[12px] font-semibold">Water</p><p className="mt-1 text-[11px] text-muted-foreground">Estimated supply = 75% of seasonal rainfall + assumed irrigation allowance. Compared with the crop's illustrative seasonal water-demand parameter.</p></div>
                <div className="rounded-xl border border-border/70 p-3"><p className="text-[12px] font-semibold">Climate</p><p className="mt-1 text-[11px] text-muted-foreground">Mean temperature fit · derived heat-day penalty · derived heavy-rain-day penalty.</p></div>
                <div className="rounded-xl border border-border/70 p-3"><p className="text-[12px] font-semibold">Crop diversity</p><p className="mt-1 text-[11px] text-muted-foreground">Crop-family Shannon diversity · legume share · family alternation across the sequence.</p></div>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-[11.5px] font-semibold">Important modelling boundary</p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">Crop water demand, pH ranges, temperature ranges and crop flags are illustrative demo scoring parameters. Published reference values shown on crop cards are informational only and do not replace these inputs. This model does not simulate evapotranspiration, runoff, soil-water storage or measured nutrient credits.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {rows.map((row) => <div key={row.id} className="rounded-xl border border-border/70 p-3"><p className="text-[11px] font-medium leading-snug">{row.name}</p><p className="metric mt-2 text-[27px]">{n(row.result.overall)}</p><p className="text-[10px] text-muted-foreground">out of 100 · {row.result.confidence.level} confidence</p><div className="mt-3 space-y-1.5">{Object.entries(row.result.dimension_scores).map(([key, value]) => <div key={key} className="flex justify-between gap-2 text-[10px]"><span className="text-muted-foreground">{DIMENSION_LABEL[key]}</span><strong className="metric">{n(value)}</strong></div>)}</div></div>)}
              </div>
              <Notice tone="warn" title="Interpretation">
                These are heuristic suitability comparisons under the recorded assumptions, not yield, income or profit forecasts, and not a validated crop recommendation. No farmer interview or farm-level rotation baseline was available.
              </Notice>
              <div className="flex flex-wrap gap-2">
                <Link to="/demo/compare#score-trace" className="inline-flex items-center rounded-xl bg-primary px-3.5 py-2 text-[11.5px] font-medium text-primary-foreground">Open the full calculation trace →</Link>
                <Link to="/demo/advisor" className="inline-flex items-center rounded-xl border border-border px-3.5 py-2 text-[11.5px] font-medium">See deterministic evidence advisor</Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
          <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-[11.5px] font-medium disabled:opacity-40">
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-[11.5px] font-medium text-primary-foreground">
              Next stage <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link to="/demo/compare" className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-[11.5px] font-medium text-primary-foreground">
              Open full comparison <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>Walkthrough data source: static demo records · no private workspace data</span>
        <Link to="/methodology" className="font-medium text-primary hover:underline">Read complete methodology →</Link>
      </div>
    </div>
  );
}