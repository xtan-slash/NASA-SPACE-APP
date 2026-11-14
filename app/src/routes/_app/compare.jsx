import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Sparkles, Check } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Notice from "@/components/common/Notice";
import DimensionBars from "@/components/compare/DimensionBars";
import DimensionRadar from "@/components/compare/DimensionRadar";
import SeasonLines from "@/components/compare/SeasonLines";
import { Button } from "@/components/ui/button";
import {
  useActiveFarm,
  useCrops,
  useFarms,
  useScenarios,
  useSnapshots,
  parseSnapshot,
  scenarioEntries,
  scenarioWeights,
} from "@/lib/data";
import { DIMENSION_KEYS, DIMENSION_LABEL } from "@/lib/catalog";
import { scoreScenario } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/compare")({
  head: () => ({
    meta: [
      { title: "Scenario comparison · TerraShift AI" },
      { name: "description", content: "Compare at least three saved crop rotations side by side on the same farm, climate snapshot and scoring weights." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { t } = useI18n();
  const { farms, loading: farmsLoading } = useFarms();
  const { farm, ready } = useActiveFarm(farms, farmsLoading);
  const { crops } = useCrops();
  const { scenarios, loading } = useScenarios(farm?.id);
  const { latest } = useSnapshots(farm?.id);
  const climate = useMemo(() => parseSnapshot(latest), [latest]);

  const [selected, setSelected] = useState([]);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current || !ready || loading) return;
    hydrated.current = true;
    setSelected(scenarios.slice(0, 3).map((s) => s.id));
  }, [ready, loading, scenarios]);

  const rows = useMemo(
    () =>
      selected
        .map((id) => {
          const scenario = scenarios.find((s) => s.id === id);
          if (!scenario) return null;
          const result = scoreScenario({
            farm,
            climate,
            crops,
            scenario: { entries: scenarioEntries(scenario), weights: scenarioWeights(scenario) || {} },
          });
          return { id, name: scenario.name, scenario, result };
        })
        .filter(Boolean),
    [selected, scenarios, farm, climate, crops]
  );

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id)
        ? prev.length <= 3
          ? prev
          : prev.filter((x) => x !== id)
        : prev.length >= 4
          ? prev
          : [...prev, id]
    );

  const deltas = useMemo(() => {
    if (rows.length < 2) return [];
    const [a, b] = rows;
    return DIMENSION_KEYS.map((key) => {
      const av = a.result?.dimension_scores?.[key];
      const bv = b.result?.dimension_scores?.[key];
      if (av == null || bv == null) return null;
      return { key, value: Math.round((av - bv) * 10) / 10 };
    }).filter(Boolean);
  }, [rows]);

  if (!farmsLoading && farms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader kicker="Step 5 · Charts" title="Comparison" />
        <Notice tone="warn" title="Add a farm first">
          <Link to="/farm" className="font-medium text-primary hover:underline">
            Set up a farm →
          </Link>
        </Notice>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Step 5 · Charts"
        title="Comparison"
        description="Compare three illustrative rotation hypotheses side by side. No farmer-reported crop history is available for this pilot, so the baseline is not an observed farm rotation."
        actions={
          <Button asChild className="gap-1.5">
            <Link to="/advisor" search={{ compare: selected.join(",") }}>
              <Sparkles className="h-3.5 w-3.5" /> {t("Explain comparison")}
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading scenarios…")}
        </div>
      ) : scenarios.length < 3 ? (
        <Notice tone="info" title="At least three saved scenarios are needed">
          The Field Shift challenge asks you to compare at least three rotation strategies, including an existing rotation where known. No farmer-reported history is available for this pilot, so use a clearly labelled illustrative baseline. Save three scenarios in the{" "}
          <Link to="/simulator" className="font-medium text-primary hover:underline">
            simulator
          </Link>.
        </Notice>
      ) : (
        <>
          <Notice tone="warn" title="Illustrative comparison, not a farmer baseline">
            No farmer interview or farm-level crop history was available. The ragi monocrop baseline and both alternatives are hypothetical research scenarios. The farm soil profile, farm coordinates and crop parameters are demo inputs. NASA POWER data currently covers 2020–2025 and is used as historical seasonal context for the 2026–2029 scenarios, not as a forecast. Scores are prototype suitability indicators, not validated agronomic recommendations or yield predictions. Scenarios with different numbers or types of cropped seasons have different cropping-intensity assumptions; their overall scores should not be treated as a like-for-like ranking.
          </Notice>
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <p className="kicker">{t("Scenarios in the comparison")}</p>
              <span className="metric text-[11px] text-muted-foreground">{selected.length}/4</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {scenarios.map((s) => {
                const active = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {active && <Check className="h-3 w-3" />}
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-4">
              <h2 className="text-[15px] font-medium">{t("Overall score")}</h2>
              <p className="prose-note mt-1">One number per rotation, from the same deterministic formula.</p>
              <div className="mt-3">
                <DimensionBars rows={rows} />
              </div>
            </div>
            <div className="panel p-4">
              <h2 className="text-[15px] font-medium">{t("Dimension profile")}</h2>
              <p className="prose-note mt-1">
                A missing dimension is drawn at zero — check the table below before reading the shape.
              </p>
              <div className="mt-1">
                <DimensionRadar rows={rows} />
              </div>
            </div>
          </div>

          <div className="panel p-4">
            <h2 className="text-[15px] font-medium">{t("Season by season")}</h2>
            <div className="mt-2">
              <SeasonLines rows={rows} />
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="px-4 pt-4">
              <h2 className="text-[15px] font-medium">{t("Score table")}</h2>
            </div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[640px] text-[11.5px]">
                <thead>
                  <tr className="border-b border-border/70 text-left text-muted-foreground">
                    <th className="px-4 py-2 font-medium">{t("Scenario")}</th>
                    {DIMENSION_KEYS.map((k) => (
                      <th key={k} className="px-2 py-2 text-right font-medium">
                        {t(DIMENSION_LABEL[k]).replace(" suitability", "")}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-right font-medium">{t("Overall")}</th>
                    <th className="px-4 py-2 font-medium">{t("Confidence")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-border/40 last:border-0">
                      <td className="px-4 py-2.5 font-medium">{r.name}</td>
                      {DIMENSION_KEYS.map((k) => (
                        <td key={k} className="metric px-2 py-2.5 text-right">
                          {r.result?.dimension_scores?.[k] == null
                            ? "—"
                            : r.result.dimension_scores[k].toFixed(1)}
                        </td>
                      ))}
                      <td className="metric px-2 py-2.5 text-right font-medium">
                        {r.result?.overall == null ? "—" : r.result.overall.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 capitalize">{r.result?.confidence?.level || "none"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {deltas.length > 0 && (
            <div className="panel p-4">
              <h2 className="text-[15px] font-medium">{t("Deterministic differences")}</h2>
              <p className="prose-note mt-1">
                Arithmetic on the two leading scenarios — {rows[0].name} minus {rows[1].name}. Positive means
                the first scores higher.
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[11.5px]">
                <li className="flex items-center justify-between gap-3 rounded-lg bg-secondary/50 px-3 py-1.5">
                  <span className="font-medium">Overall score</span>
                  <span className="metric">
                    {rows[0].result?.overall == null || rows[1].result?.overall == null
                      ? t("not comparable")
                      : `${rows[0].result.overall - rows[1].result.overall > 0 ? "+" : ""}${(
                          rows[0].result.overall - rows[1].result.overall
                        ).toFixed(1)}`}
                  </span>
                </li>
                {deltas.map((d) => (
                  <li
                    key={d.key}
                    className="flex items-center justify-between gap-3 rounded-lg bg-secondary/50 px-3 py-1.5"
                  >
                    <span>{DIMENSION_LABEL[d.key]}</span>
                    <span className="metric">
                      {d.value > 0 ? "+" : ""}
                      {d.value.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {rows.map((r) => (
              <div key={r.id} className="panel p-4">
                <p className="text-[12.5px] font-medium">{r.name}</p>
                {r.result?.missing?.length ? (
                  <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
                    {r.result.missing.map((m) => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    All model inputs were present for this scenario.
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}