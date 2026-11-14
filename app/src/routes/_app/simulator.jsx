import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import Notice from "@/components/common/Notice";
import SequenceBuilder from "@/components/simulator/SequenceBuilder";
import WeightsPanel from "@/components/simulator/WeightsPanel";
import ScorePanel from "@/components/simulator/ScorePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DEFAULT_WEIGHTS, PRIORITY_LABEL, SEASON_BY_VALUE } from "@/lib/catalog";import { scoreScenario } from "@/lib/scoring";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/simulator")({
  head: () => ({
    meta: [
      { title: "Rotation simulator · TerraShift AI" },
      { name: "description", content: "Build multi-year crop rotations and score them deterministically on soil, water, climate and diversity with configurable weights." },
    ],
  }),
  component: SimulatorPage,
});

const DEFAULT_SEASONS = ["kharif", "rabi"];

function buildSuggestion({ crops, years, activeSeasons, yearStart }) {
  const out = {};
  let prevFamily = null;
  let prevCrop = null;
  for (let i = 0; i < years; i += 1) {
    const year = yearStart + i;
    for (const season of activeSeasons) {
      const pool = crops.filter((c) => c.season === season);
      if (!pool.length) continue;
      const sorted = [...pool].sort(
        (a, b) => (a.family || "").localeCompare(b.family || "") || a.name.localeCompare(b.name)
      );
      const candidates = sorted.filter((c) => (c.family || "unknown") !== prevFamily);
      const wantsLegume = !prevCrop?.n_fixing;
      const pick =
        (wantsLegume && candidates.find((c) => c.n_fixing)) ||
        candidates.find((c) => !c.n_fixing) ||
        candidates[0] ||
        sorted[0];
      if (!pick) continue;
      out[`${year}:${season}`] = pick.id;
      prevFamily = pick.family || "unknown";
      prevCrop = pick;
    }
  }
  return out;
}

function SimulatorPage() {
  const { t } = useI18n();
  const { farms, loading: farmsLoading } = useFarms();
  const { farm, ready } = useActiveFarm(farms, farmsLoading);
  const { crops, loading: cropsLoading } = useCrops();
  const { latest } = useSnapshots(farm?.id);
  const { scenarios, loading: scenariosLoading, reload: reloadScenarios } = useScenarios(farm?.id);

  const climate = useMemo(() => parseSnapshot(latest), [latest]);

  const [name, setName] = useState("Balanced pulse rotation");
  const [yearStart, setYearStart] = useState(2026);
  const [years, setYears] = useState(4);
  const [activeSeasons, setActiveSeasons] = useState(DEFAULT_SEASONS);
  const [entries, setEntries] = useState({});
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const initialized = useRef(false);

  // Open on an existing scenario, or a clearly-labelled starting suggestion.
  useEffect(() => {
    if (initialized.current || cropsLoading || scenariosLoading || !ready) return;
    if (!farm || !crops.length) return;
    initialized.current = true;
    if (scenarios.length) {
      loadScenario(scenarios[0]);
    } else {
      setEntries(buildSuggestion({ crops, years, activeSeasons, yearStart }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, farm, crops, scenarios, cropsLoading, scenariosLoading]);

  const entryList = useMemo(() => {
    const out = [];
    for (let i = 0; i < years; i += 1) {
      const year = yearStart + i;
      for (const season of activeSeasons) {
        const cropId = entries[`${year}:${season}`];
        if (cropId) out.push({ year, season, crop_id: cropId });
      }
    }
    return out;
  }, [entries, yearStart, years, activeSeasons]);

  const result = useMemo(
    () => scoreScenario({ farm, climate, crops, scenario: { entries: entryList, weights } }),
    [farm, climate, crops, entryList, weights]
  );

  function loadScenario(scenario) {
    if (!scenario) return;
    const ents = scenarioEntries(scenario);
    const yearsUsed = [...new Set(ents.map((e) => e.year))].sort();
    const seasonsUsed = [...new Set(ents.map((e) => e.season))].filter((s) => SEASON_BY_VALUE[s]);
    setEditingId(scenario.id);
    setName(scenario.name);
    setYearStart(yearsUsed[0] ?? 2026);
    setYears(Math.max(1, yearsUsed.length || 1));
    setActiveSeasons(seasonsUsed.length ? seasonsUsed : DEFAULT_SEASONS);
    setEntries(Object.fromEntries(ents.map((e) => [`${e.year}:${e.season}`, e.crop_id])));
    setWeights(scenarioWeights(scenario) || DEFAULT_WEIGHTS);
  }

  const reset = () => {
    setEditingId(null);
    setName("New rotation");
    setEntries({});
    setWeights(DEFAULT_WEIGHTS);
  };

  const save = async () => {
    if (!farm) return;
    if (!name.trim() || entryList.length < 2) {
      toast.error("Name the scenario and fill at least two seasons first.");
      return;
    }
    if (result.status !== "ok") {
      toast.error(result.errors[0] || "Resolve the input problems before saving.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        farm_id: farm.id,
        entries_json: JSON.stringify(entryList),
        weights_json: JSON.stringify(weights),
        year_start: yearStart,
        year_end: yearStart + years - 1,
        seasons_count: entryList.length,
        crop_ids: [...new Set(entryList.map((e) => e.crop_id))],
        last_score: result.overall,
        last_confidence: result.confidence.level,
        last_scored_at: new Date().toISOString(),
      };
      const saved = editingId
        ? await base44.entities.Scenario.update(editingId, payload)
        : await base44.entities.Scenario.create(payload);
      setEditingId(saved.id);
      await reloadScenarios();
      toast.success(editingId ? "Scenario updated" : "Scenario saved");
    } catch (err) {
      toast.error(err?.message || "Could not save the scenario.");
    } finally {
      setSaving(false);
    }
  };

  const removeScenario = async () => {
    if (!confirm) return;
    try {
      await base44.entities.Scenario.delete(confirm.id);
      if (editingId === confirm.id) reset();
      setConfirm(null);
      await reloadScenarios();
      toast.success("Scenario deleted");
    } catch (err) {
      toast.error(err?.message || "Could not delete the scenario.");
    }
  };

  const toggleSeason = (season) =>
    setActiveSeasons((prev) =>
      prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]
    );

  const climateBasis = latest
    ? `Climate basis: NASA POWER daily point data, ${latest.start_date}–${latest.end_date}, retrieved ${new Date(
        latest.retrieved_at
      ).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "2-digit" })}.`
    : "Climate basis: no NASA POWER snapshot loaded — water and climate dimensions are excluded.";

  if (!farmsLoading && farms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader kicker="Step 4 · Compare" title="Rotation simulator" />
        <Notice tone="warn" title="Add a farm first">
          Scenarios are scored against a farm profile and its climate data.{" "}
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
        kicker="Step 4 · Compare"
        title="Rotation simulator"
        description="Build a multi-year sequence, set what matters, and see how a deterministic score changes. Every sub-score is inspectable — the advisor only restates these tables."
        actions={
          <Button variant="secondary" className="gap-1.5" onClick={reset}>
            <Plus className="h-3.5 w-3.5" /> {t("New scenario")}
          </Button>
        }
      />

      {!latest && (
        <Notice tone="warn" title="No climate snapshot for this farm yet">
          Water and climate suitability cannot be scored without NASA POWER data.{" "}
          <Link to="/climate" className="font-medium text-primary hover:underline">
            Load climate data →
          </Link>
        </Notice>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-4">
          <div className="panel p-4">
            <label className="kicker" htmlFor="scenario-name">
              {t("Scenario name")}
            </label>
            <Input
              id="scenario-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 font-heading text-[15px]"
              placeholder="e.g. Ragi–groundnut rotation"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {entryList.length} cropped season{entryList.length === 1 ? "" : "s"} · {yearStart}–
              {yearStart + years - 1}
              {editingId ? " · editing a saved scenario" : ""}
            </p>
            {farm?.priorities?.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Priorities")}</span>
                {farm.priorities.map((p) => (
                  <span key={p} className="chip py-0.5 text-[10px]">
                    {t(PRIORITY_LABEL[p] || p)}
                  </span>
                ))}
              </div>
            )}
          </div>
          <SequenceBuilder
            entries={entries}
            crops={crops}
            yearStart={yearStart}
            years={years}
            activeSeasons={activeSeasons}
            onCell={(key, value) =>
              setEntries((prev) => {
                const next = { ...prev };
                if (value) next[key] = value;
                else delete next[key];
                return next;
              })
            }
            onYears={setYears}
            onYearStart={setYearStart}
            onSeasonToggle={toggleSeason}
            onSuggest={() =>
              setEntries(buildSuggestion({ crops, years, activeSeasons, yearStart }))
            }
            onClear={() => setEntries({})}
          />

          <WeightsPanel weights={weights} onChange={setWeights} />

          <Notice tone="info" title="How the overall score is assembled">
            Each season is scored on soil, water and climate sub-checks; the scenario averages those seasons
            and adds a rotation-level diversity score. The overall number is the weight-normalised mean of the
            dimensions that could actually be computed.
          </Notice>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ScorePanel
            result={result}
            scenarioName={name}
            onSave={save}
            saving={saving}
            canSave={!!name.trim() && entryList.length >= 2 && result.status === "ok"}
            savedId={editingId}
            climateBasis={climateBasis}
          />
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="kicker">
            {t("Saved scenarios for {farm}", { farm: farm?.name || t("this farm") })}
          </p>
          <Link to="/compare" className="text-[12px] font-medium text-primary hover:underline">
            Compare them →
          </Link>
        </div>
        {scenariosLoading ? (
          <div className="flex items-center gap-2 py-6 text-[12.5px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading scenarios…")}
          </div>
        ) : scenarios.length === 0 ? (
          <Notice tone="info">
            No saved scenarios yet. Save the rotation above to compare it against alternatives.
          </Notice>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((s) => (
              <div key={s.id} className="panel flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13.5px] font-medium leading-tight">{s.name}</p>
                  <span className="metric shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11.5px]">
                    {s.last_score == null ? "—" : Number(s.last_score).toFixed(1)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {s.year_start}–{s.year_end} · {s.seasons_count} {t("seasons")} · {t("confidence")}{" "}
                  {s.last_confidence || "n/a"}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  <Button
                    size="sm"
                    variant={s.id === editingId ? "default" : "secondary"}
                    className="h-7 text-[11px]"
                    onClick={() => loadScenario(s)}
                  >
                    {s.id === editingId ? t("Editing") : t("Open")}
                  </Button>
                  <Button asChild size="sm" variant="ghost" className="h-7 gap-1 text-[11px]">
                    <Link to="/advisor" search={{ scenario: s.id }}>
                      <Sparkles className="h-3 w-3" /> {t("Explain")}
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[11px] text-destructive hover:text-destructive"
                    onClick={() => setConfirm(s)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{confirm?.name}”?</DialogTitle>
            <DialogDescription>This removes the saved scenario. The rotation itself is not touched.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              {t("Keep it")}
            </Button>
            <Button variant="destructive" onClick={removeScenario}>
              {t("Delete scenario")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}