import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Send, ShieldAlert, Check } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Notice from "@/components/common/Notice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useActiveFarm,
  useCrops,
  useFarms,
  useScenarios,
  useSnapshots,
  parseSnapshot,
} from "@/lib/data";
import { DIMENSION_KEYS, DIMENSION_LABEL } from "@/lib/catalog";
import { scoreScenario } from "@/lib/scoring";
import { explainScenario } from "@/lib/server-fns";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/advisor")({
  head: () => ({
    meta: [
      { title: "AI advisor · TerraShift AI" },
      { name: "description", content: "Explanations of the computed rotation scores, grounded strictly in the score tables and flagged data gaps." },
    ],
  }),
  validateSearch: (search) => ({
    scenario: typeof search.scenario === "string" ? search.scenario : undefined,
    compare: typeof search.compare === "string" ? search.compare : undefined,
  }),
  component: AdvisorPage,
});

const PRESETS = [
  "Explain this score in plain language for the farmer.",
  "Why is water suitability the weakest dimension?",
  "What is missing to make a more confident comparison?",
];

function EvidenceTable({ scenario }) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-border/70 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[12.5px] font-medium">{scenario.scenario}</p>
        <span className="metric text-[12px]">
          {scenario.overall == null ? "not scored" : scenario.overall.toFixed(1)}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:grid-cols-4">
        {DIMENSION_KEYS.map((k) => (
          <div key={k}>
            <p className="text-muted-foreground">{t(DIMENSION_LABEL[k]).replace(" suitability", "")}</p>
            <p className="metric">{scenario.dimensions?.[k] == null ? "—" : scenario.dimensions[k].toFixed(1)}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10.5px] text-muted-foreground">
        Confidence {scenario.confidence} · weights soil {scenario.weights_pct?.soil}%, water{" "}
        {scenario.weights_pct?.water}%, climate {scenario.weights_pct?.climate}%, diversity{" "}
        {scenario.weights_pct?.diversity}%
      </p>
      {scenario.missing?.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 text-[10.5px] text-muted-foreground">
          {scenario.missing.map((m) => (
            <li key={m}>• {m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdvisorPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const { farms, loading: farmsLoading } = useFarms();
  const { farm, ready } = useActiveFarm(farms, farmsLoading);
  const { crops } = useCrops();
  const { scenarios, loading: scenariosLoading } = useScenarios(farm?.id);
  const { latest } = useSnapshots(farm?.id);
  const climate = useMemo(() => parseSnapshot(latest), [latest]);

  const [selected, setSelected] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [busy, setBusy] = useState(false);
  const picked = useRef(false);
  const run = useServerFn(explainScenario);

  useEffect(() => {
    if (picked.current || !ready || scenariosLoading || !scenarios.length) return;
    picked.current = true;
    const fromSearch = [search.scenario, ...(search.compare || "").split(",")]
      .filter(Boolean)
      .filter((id) => scenarios.some((s) => s.id === id));
    setSelected(fromSearch.length ? [...new Set(fromSearch)].slice(0, 4) : [scenarios[0].id]);
  }, [ready, scenariosLoading, scenarios, search.scenario, search.compare]);

  const localScores = useMemo(
    () =>
      selected
        .map((id) => {
          const scenario = scenarios.find((s) => s.id === id);
          if (!scenario) return null;
          let entries = [];
          let weights = {};
          try {
            entries = JSON.parse(scenario.entries_json || "[]");
            weights = JSON.parse(scenario.weights_json || "{}");
          } catch {
            /* keep empty */
          }
          const result = scoreScenario({ farm, climate, crops, scenario: { entries, weights } });
          return { name: scenario.name, result };
        })
        .filter(Boolean),
    [selected, scenarios, farm, climate, crops]
  );

  const ask = async (text) => {
    if (!selected.length) return;
    setBusy(true);
    setAnswer(null);
    try {
      const res = await run({
        data: { scenarioIds: selected, question: (text || "").trim().slice(0, 500) || undefined },
      });
      setAnswer(res);
    } catch (err) {
      setAnswer({ ok: false, error: err?.message || "The explanation request failed." });
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id]
    );

  const evidence = answer?.evidence;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Step 6 · Explanation"
        title="AI advisor"
        description="The advisor receives the computed score tables — never the raw field or a blank prompt. It is instructed to cite only numbers that appear in those tables, and to name the gaps."
      />

      {!farmsLoading && farms.length === 0 ? (
        <Notice tone="warn" title="Add a farm first">
          <Link to="/farm" className="font-medium text-primary hover:underline">
            Set up a farm →
          </Link>
        </Notice>
      ) : !scenariosLoading && scenarios.length === 0 ? (
        <Notice tone="warn" title="No saved scenarios yet">
          Save at least one rotation in the{" "}
          <Link to="/simulator" className="font-medium text-primary hover:underline">
            simulator
          </Link>{" "}
          so the advisor has something grounded to explain.
        </Notice>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.25fr]">
          <div className="space-y-4">
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <p className="kicker">{t("Scenarios to explain")}</p>
                <span className="metric text-[11px] text-muted-foreground">{selected.length}/3</span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {scenarios.map((s) => {
                  const active = selected.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(s.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[12px] transition-colors",
                        active
                          ? "border-primary/45 bg-primary/10"
                          : "border-border/70 hover:border-primary/30"
                      )}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="metric text-[11px] text-muted-foreground">
                          {s.last_score == null ? "—" : Number(s.last_score).toFixed(1)}
                        </span>
                        {active && <Check className="h-3.5 w-3.5 text-primary" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="panel p-4">
              <p className="kicker">{t("Question")}</p>
              <Textarea
                className="mt-2 text-[12.5px]"
                rows={3}
                maxLength={500}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about the numbers in the score table — e.g. why water is low in rabi."
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setQuestion(p);
                      ask(p);
                    }}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-[10.5px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Button
                className="mt-3 w-full gap-1.5"
                onClick={() => ask(question)}
                disabled={busy || !selected.length}
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {busy ? t("Grounding the explanation…") : t("Explain the scores")}
              </Button>
              <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
                The scores are recomputed on the server from the saved records and the NASA POWER snapshot
                before the model sees anything.
              </p>
            </div>

            {localScores.length > 0 && (
              <div className="panel p-4">
                <p className="kicker">{t("Locally computed now")}</p>
                <div className="mt-2 space-y-1.5">
                  {localScores.map((s) => (
                    <div key={s.name} className="flex items-baseline justify-between gap-2 text-[11.5px]">
                      <span className="truncate">{s.name}</span>
                      <span className="metric">
                        {s.result.overall == null ? "not scored" : s.result.overall.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Same engine version as the server, so these match what the advisor was given.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="panel min-h-[220px] p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <p className="text-[12.5px] font-medium">{t("Grounded explanation")}</p>
              </div>

              {busy && (
                <div className="mt-4 space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2.5 animate-pulse rounded-full bg-secondary"
                      style={{ width: `${90 - i * 18}%` }}
                    />
                  ))}
                </div>
              )}

              {!busy && !answer && (
                <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
                  Select one to three scenarios and ask for an explanation. The reply will cite the values in
                  the evidence panel below — including what is missing.
                </p>
              )}

              {!busy && answer && !answer.ok && (
                <Notice tone="danger" title="No AI explanation this time" className="mt-3">
                  {answer.error}
                </Notice>
              )}

              {!busy && answer?.ok && (
                <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-foreground/90">
                  {answer.text}
                </p>
              )}

              <div className="mt-4 flex items-start gap-2 rounded-lg border border-border/70 bg-secondary/40 p-2.5">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                  Model-generated prose, bounded by the tables below. It is not agronomic advice, carries no
                  yield claim, and can still misread a value — check the numbers it cites against the
                  evidence panel.
                </p>
              </div>
            </div>

            {evidence && (
              <div className="panel p-4">
                <p className="kicker">{t("Evidence the model was given")}</p>

                <div className="mt-3 space-y-2">
                  {(evidence.scenarios || []).map((s) => (
                    <EvidenceTable key={s.scenario} scenario={s} />
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 p-3">
                    <p className="text-[11.5px] font-medium">{t("Farm inputs")}</p>
                    <dl className="mt-1.5 space-y-0.5 text-[10.5px] text-muted-foreground">
                      <div className="flex justify-between gap-2">
                        <dt>pH</dt>
                        <dd className="metric">{evidence.farm?.soil_ph ?? "not entered"}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Organic carbon</dt>
                        <dd className="metric">
                          {evidence.farm?.soil_organic_carbon_pct != null
                            ? `${evidence.farm.soil_organic_carbon_pct} %`
                            : "not entered"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Texture</dt>
                        <dd>{evidence.farm?.soil_texture || "not entered"}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Irrigation</dt>
                        <dd>{evidence.farm?.irrigation || "not set"}</dd>
                      </div>
                    </dl>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      Source: {evidence.farm?.soil_source || "not recorded"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/70 p-3">
                    <p className="text-[11.5px] font-medium">{t("Climate basis")}</p>
                    {evidence.climate?.source ? (
                      <div className="mt-1.5 space-y-0.5 text-[10.5px] text-muted-foreground">
                        <p>{evidence.climate.source}</p>
                        <p className="metric">
                          {evidence.climate.requested_start}–{evidence.climate.requested_end}
                        </p>
                        <p>Coverage {evidence.climate.coverage_pct}% of expected days</p>
                        <p>Elevation {evidence.climate.elevation_m ?? "—"} m (model grid)</p>
                        <div className="mt-1.5 space-y-0.5">
                          {Object.entries(evidence.climate.seasons || {}).map(([k, v]) => (
                            <p key={k}>
                              <span className="capitalize">{k}</span>: {v.precipitation_mm} mm,{" "}
                              {v.mean_temp_c} °C, {v.heat_days_35c} heat days
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[10.5px] text-muted-foreground">
                        No NASA POWER snapshot was available for this farm.
                      </p>
                    )}
                  </div>
                </div>

                {answer.deterministic?.length > 0 && (
                  <div className="mt-3 rounded-xl border border-border/70 bg-secondary/30 p-3">
                    <p className="text-[11.5px] font-medium">Deterministic summary (no model involved)</p>
                    <ul className="mt-1 space-y-1 text-[10.5px] leading-relaxed text-muted-foreground">
                      {answer.deterministic.map((d) => (
                        <li key={d.scenario}>{d.summary}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}