import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import Notice from "@/components/common/Notice";
import DimensionBars from "@/components/compare/DimensionBars";
import DimensionRadar from "@/components/compare/DimensionRadar";
import SeasonLines from "@/components/compare/SeasonLines";
import DemoScoreTrace from "@/components/compare/DemoScoreTrace";
import { DIMENSION_KEYS, DIMENSION_LABEL } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { usePublicDemoLocation } from "@/lib/use-public-demo-location";

export const Route = createFileRoute("/demo/compare")({
  validateSearch: (search) => ({
    place: typeof search.place === "string" ? search.place.slice(0, 100) : "",
    lat: Number.isFinite(Number(search.lat)) ? Number(search.lat) : null,
    lon: Number.isFinite(Number(search.lon)) ? Number(search.lon) : null,
  }),
  component: DemoCompare,
});

function DemoCompare() {
  const { t } = useI18n();
  const { place, lat, lon } = Route.useSearch();
  const locationData = usePublicDemoLocation({ place, lat, lon });
  const ALL = locationData.results;
  const [selected, setSelected] = useState(ALL.map((row) => row.id));
  const rows = ALL.filter((row) => selected.includes(row.id));

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="space-y-6">
      <header className="border-b border-border/70 pb-6">
        <p className="kicker">{t("Demonstration data · comparison")}</p>
        <h1 className="mt-1.5 text-[26px] font-medium leading-tight sm:text-[31px]">{t("Rotation comparison")}</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          {place ? `Three illustrative rotations scored using NASA POWER historical climate data for ${place} and illustrative Harohalli soil and crop inputs.` : t("Three illustrative rotations scored on the same demonstration farm, the same recorded NASA POWER summary and the same weights (soil 6, water 6, climate 5, diversity 3).")}
        </p>
      </header>

      {locationData.loading && <Notice tone="info" title="Loading location scores">Fetching NASA POWER climate history and recalculating all three rotation scenarios.</Notice>}
      {locationData.error && <Notice tone="danger" title="Location data unavailable">{locationData.error} Showing the fixed Harohalli demo comparison instead.</Notice>}
      <Notice tone="warn" title="Illustrative comparison, not a farmer baseline">
        {t(
          "No farmer interview or farm-level crop history was available, so all three sequences are hypothetical. Scenarios with different numbers of cropped seasons have different cropping-intensity assumptions — read the dimension scores, not only the overall number."
        )}
      </Notice>

      <div className="panel p-4">
        <div className="flex items-center justify-between">
          <p className="kicker">{t("Scenarios in the comparison")}</p>
          <span className="metric text-[11px] text-muted-foreground">{selected.length}/3</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {ALL.map((row) => {
            const active = selected.includes(row.id);
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => toggle(row.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {active && <Check className="h-3 w-3" />}
                {t(row.name)}
              </button>
            );
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <Notice tone="info" title="Select at least one scenario">
          {t("Pick a rotation above to see its scores and charts.")}
        </Notice>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-4">
              <h2 className="text-[15px] font-medium">{t("Overall score")}</h2>
              <p className="prose-note mt-1">
                {t("One number per rotation, from the same deterministic formula.")}
              </p>
              <div className="mt-3">
                <DimensionBars rows={rows} />
              </div>
            </div>
            <div className="panel p-4">
              <h2 className="text-[15px] font-medium">{t("Dimension profile")}</h2>
              <p className="prose-note mt-1">
                {t("A missing dimension is drawn at zero — check the table below before reading the shape.")}
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
              <table className="w-full min-w-[620px] text-[11.5px]">
                <thead>
                  <tr className="border-b border-border/70 text-left text-muted-foreground">
                    <th className="px-4 py-2 font-medium">{t("Scenario")}</th>
                    {DIMENSION_KEYS.map((key) => (
                      <th key={key} className="px-2 py-2 text-right font-medium">
                        {t(DIMENSION_LABEL[key])}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-right font-medium">{t("Overall")}</th>
                    <th className="px-4 py-2 font-medium">{t("Confidence")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/40 last:border-0">
                      <td className="px-4 py-2.5 font-medium">{t(row.name)}</td>
                      {DIMENSION_KEYS.map((key) => (
                        <td key={key} className="metric px-2 py-2.5 text-right">
                          {row.result.dimension_scores[key] == null
                            ? "—"
                            : row.result.dimension_scores[key].toFixed(1)}
                        </td>
                      ))}
                      <td className="metric px-2 py-2.5 text-right font-medium">
                        {row.result.overall == null ? "—" : row.result.overall.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 capitalize">{t(row.result.confidence.level)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <section id="score-trace" className="space-y-3 scroll-mt-24">
            <div>
              <p className="kicker">Traceable calculation</p>
              <h2 className="mt-1 text-[17px] font-medium">How each rotation score was produced</h2>
              <p className="prose-note mt-1">Inspect the recorded NASA POWER basis, illustrative farm inputs, crop parameters and season-level intermediate calculations used by the exact scoring function.</p>
            </div>
            <DemoScoreTrace rows={rows} />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            {rows.map((row) => (
              <div key={row.id} className="panel p-4">
                <p className="text-[12.5px] font-medium">{t(row.name)}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{t(row.scenario.notes)}</p>
                <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
                  {row.result.missing.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/demo/advisor"
              search={{ place, lat, lon }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-[12.5px] font-medium text-primary-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" /> {t("Explain this comparison")}
            </Link>
            <Link to="/demo/climate" search={{ place, lat, lon }} className="text-[11.5px] font-medium text-primary hover:underline">
              {t("Back to the climate dashboard →")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}