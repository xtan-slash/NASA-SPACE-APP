import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Satellite, MapPin, Leaf, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import { DIMENSION_KEYS, DIMENSION_LABEL as DIM_LABEL, TEXTURE_LABEL } from "@/lib/catalog";
import {
  parseSnapshot,
  scenarioEntries,
  scenarioWeights,
  useActiveFarm,
  useCrops,
  useFarms,
  useScenarios,
  useSnapshots,
} from "@/lib/data";
import { scoreScenario } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · TerraShift AI" },
      { name: "description", content: "Your private workspace: farms anywhere in India, NASA POWER climate context, and crop rotation scenarios scored on soil, water, climate and diversity." },
    ],
  }),
  component: Overview,
});

function ScoreDial({ value }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[126px] w-[126px] shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${((value || 0) / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="metric text-[25px] font-medium leading-none">
          {value == null ? "—" : value.toFixed(1)}
        </span>
        <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">of 100</span>
      </div>
    </div>
  );
}

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "2-digit" })
    : "—";

function Overview() {
  const { t } = useI18n();
  const { farms, loading: farmsLoading } = useFarms();
  const { farm, ready } = useActiveFarm(farms, farmsLoading);
  const { crops } = useCrops();
  const { scenarios, loading: scenariosLoading } = useScenarios(farm?.id);
  const { latest } = useSnapshots(farm?.id);
  const climate = useMemo(() => parseSnapshot(latest), [latest]);

  const scored = useMemo(
    () =>
      scenarios
        .map((s) => ({
          scenario: s,
          result: scoreScenario({
            farm,
            climate,
            crops,
            scenario: {
              entries: scenarioEntries(s),
              weights: scenarioWeights(s) || { soil: 6, water: 6, climate: 5, diversity: 3 },
            },
          }),
        }))
        .sort((a, b) => (b.result.overall ?? -1) - (a.result.overall ?? -1)),
    [scenarios, farm, climate, crops]
  );

  const lead = scored[0];
  const demoCrops = crops.filter((c) => c.is_demo).length;

  if (!farmsLoading && farms.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-[30px] font-medium">{t("Start with a farm")}</h1>
        <p className="prose-note max-w-xl">
          {t(
            "TerraShift AI scores crop rotations against a farm profile and its NASA POWER climate record. Add a farm to begin."
          )}
        </p>
        <Link
          to="/farm"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
        >
          {t("Farm setup")} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="reveal space-y-8">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">{t("NASA Space Apps 2026 · Field Shift")}</p>
          <h1 className="mt-2 max-w-xl text-[29px] font-medium leading-[1.1] sm:text-[36px]">
            {farm?.name || t("Rotation planning")}, {t("scored on NASA data.")}
          </h1>
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
            {t(
              "Compare multi-year rotations on soil, water, climate and diversity. Every number below is recomputed from the saved records and the NASA POWER series — soil and crop parameters may be illustrative, and model assumptions are disclosed."
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/simulator"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("Open simulator")} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/climate"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-secondary/60"
          >
            {t("Climate data")}
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} /> {t("Active farm")}
            </span>
            <span className="chip">{farm?.is_demo ? t("Demo inputs") : t("Your inputs")}</span>
          </div>
          <p className="mt-3 text-[15px] font-medium leading-tight">{farm?.name || "—"}</p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {farm?.area_ha ? `${farm.area_ha} ha · ` : ""}
            {farm?.latitude?.toFixed?.(2)}°N, {farm?.longitude?.toFixed?.(2)}°E
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {TEXTURE_LABEL[farm?.soil_texture] || "texture not set"} · pH {farm?.soil_ph ?? "—"} · OC{" "}
            {farm?.soil_organic_carbon != null ? `${farm.soil_organic_carbon} %` : "—"}
          </p>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Satellite className="h-3.5 w-3.5" strokeWidth={1.8} /> {t("Climate source")}
            </span>
            <span className="chip">{latest ? t("Loaded") : t("Not loaded")}</span>
          </div>
          <p className="mt-3 text-[15px] font-medium leading-tight">
            {latest ? t("NASA POWER daily") : t("No snapshot yet")}
          </p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {latest
              ? `${latest.start_date?.slice(0, 4)}–${latest.end_date?.slice(0, 4)} · ${(
                  (climate?.coverage_key || 0) * 100
                ).toFixed(1)}% ${t("coverage")}`
              : t("Water and climate dimensions are excluded until loaded")}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {latest
              ? `${t("Retrieved")} ${fmtDate(latest.retrieved_at)} UTC · ${t("MERRA-2 based")}`
              : "power.larc.nasa.gov"}
          </p>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Leaf className="h-3.5 w-3.5" strokeWidth={1.8} /> {t("Crop library")}
            </span>
            <span className="chip">{demoCrops > 0 ? `${demoCrops} demo` : "Custom"}</span>
          </div>
          <p className="mt-3 text-[15px] font-medium leading-tight">
            {crops.length} {t("crop records")}
          </p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {crops.filter((c) => c.n_fixing).length} {t("legumes")} ·{" "}
            {new Set(crops.map((c) => c.family)).size} {t("families")}
          </p>
          <Link to="/crops" className="mt-1.5 inline-block text-[11px] font-medium text-primary hover:underline">
            {t("Edit parameters →")}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="kicker">{t("Highest-scoring saved rotation")}</p>
              <h2 className="mt-1.5 truncate text-[19px] font-medium">
                {lead?.scenario?.name || t("No saved scenario yet")}
              </h2>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                {lead
                  ? `${lead.scenario.year_start}–${lead.scenario.year_end} · ${lead.scenario.seasons_count} seasons · ${
                      lead.result.confidence.level
                    } confidence`
                  : t("Build one in the simulator to see a score")}
              </p>
            </div>
            <ScoreDial value={lead?.result?.overall ?? null} />
          </div>

          {lead ? (
            <div className="mt-5 space-y-4">
              {DIMENSION_KEYS.map((key) => {
                const value = lead.result.dimension_scores?.[key];
                const weight = lead.result.weights.effective_pct?.[key];
                return (
                  <div key={key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[12.5px] font-medium">{t(DIM_LABEL[key])}</span>
                      <span className="metric text-[12px] text-muted-foreground">
                        {value == null ? t("excluded") : value.toFixed(1)}
                        {weight != null && <span className="ml-1.5 text-[10px]">· w {weight.toFixed(0)}%</span>}
                      </span>
                    </div>
                    <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn("h-full rounded-full", value == null ? "bg-border" : "bg-primary/85")}
                        style={{ width: `${value ?? 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5">
              <Link
                to="/simulator"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-[12.5px] font-medium text-primary-foreground"
              >
                {t("Build a rotation")} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {lead?.result.findings?.length > 0 && (
            <ul className="mt-5 space-y-1 rounded-xl border border-border/70 bg-secondary/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              {lead.result.findings.slice(0, 3).map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel flex flex-col p-5">
          <div className="flex items-center justify-between">
            <p className="kicker">{t("Scenario scores")}</p>
            <Link to="/compare" className="text-[11.5px] font-medium text-primary hover:underline">
              {t("Compare")}
            </Link>
          </div>
          {scenariosLoading ? (
            <div className="flex items-center gap-2 py-6 text-[12px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("Loading…")}
            </div>
          ) : scored.length === 0 ? (
            <p className="py-6 text-[12px] text-muted-foreground">{t("No saved rotations for this farm yet.")}</p>
          ) : (
            <ul className="mt-2 divide-y divide-border/70">
              {scored.map(({ scenario, result }, i) => (
                <li key={scenario.id} className="flex items-center gap-3 py-2.5">
                  <span className="metric w-4 text-[10.5px] text-muted-foreground">0{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{scenario.name}</p>
                    <p className="text-[10.5px] text-muted-foreground">
                      {scenario.seasons_count} {t("seasons")} · {t(result.confidence.level)} {t("confidence")}
                    </p>
                  </div>
                  <span className="metric rounded-md bg-secondary px-2 py-1 text-[12px]">
                    {result.overall == null ? "—" : result.overall.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto space-y-2 pt-4">
            {lead?.result.missing?.length > 0 && (
              <div className="flex items-start gap-2 rounded-xl border border-accent/25 bg-accent/10 p-3">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                <p className="text-[11px] leading-relaxed text-foreground/80">
                  {lead.result.missing[0]}
                  {lead.result.missing.length > 1 ? ` (+${lead.result.missing.length - 1} more)` : ""}
                </p>
              </div>
            )}
            <Link
              to="/advisor"
              className="inline-flex items-center gap-2 text-[11.5px] font-medium text-primary hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" /> {t("Ask the advisor to explain these scores")}
            </Link>
          </div>
        </div>
      </section>

      <section className="panel-flat p-4">
        <p className="kicker">{t("What this dashboard is not")}</p>
        <div className="mt-2 grid gap-3 text-[12px] leading-relaxed text-muted-foreground sm:grid-cols-3">
          <p>
            <span className="font-medium text-foreground">No yield prediction.</span> Scores express input
            suitability and rotation structure only.
          </p>
          <p>
            <span className="font-medium text-foreground">Not validated advice.</span> Higher is not
            “recommended”; use it to compare options with an agronomist.
          </p>
          <p>
            <span className="font-medium text-foreground">No hidden data.</span>{" "}
            <Link to="/method" className="text-primary hover:underline">
              Every formula and constant is documented.
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}