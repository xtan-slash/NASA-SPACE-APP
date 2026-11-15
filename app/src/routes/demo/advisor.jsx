import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Check, ShieldAlert } from "lucide-react";
import Notice from "@/components/common/Notice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DIMENSION_KEYS, DIMENSION_LABEL } from "@/lib/catalog";
import { explainDemoScenario } from "@/lib/server-fns";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { usePublicDemoLocation } from "@/lib/use-public-demo-location";

export const Route = createFileRoute("/demo/advisor")({
  validateSearch: (search) => ({
    place: typeof search.place === "string" ? search.place.slice(0, 100) : "",
    lat: Number.isFinite(Number(search.lat)) ? Number(search.lat) : null,
    lon: Number.isFinite(Number(search.lon)) ? Number(search.lon) : null,
  }),
  component: DemoAdvisor,
});

const SUGGESTIONS = [
  "Why does the ragi and horsegram rotation score higher than the ragi monocrop?",
  "Which dimension is weakest, and what input is missing?",
  "How much of the score comes from the NASA POWER climate window?",
];

function DemoAdvisor() {
  const { t } = useI18n();
  const { place, lat, lon } = Route.useSearch();
  const locationData = usePublicDemoLocation({ place, lat, lon });
  const ROWS = locationData.results;
  const [selected, setSelected] = useState(["baseline-ragi", "ragi-horsegram", "maize-horsegram"]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const explain = useServerFn(explainDemoScenario);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  async function ask(text) {
    if (!selected.length) {
      setError(t("Select at least one demonstration scenario first."));
      return;
    }
    setBusy(true);
    setError("");
    setAnswer("");
    try {
      const res = await explain({ data: {
        scenarioIds: selected,
        question: (text ?? question).slice(0, 400),
        ...(locationData.hasPoint ? { latitude: lat, longitude: lon } : {}),
      } });
      if (!res?.ok) {
        setError(res?.error || t("The explanation service did not respond."));
        return;
      }
      setAnswer(res.text);
    } catch (err) {
      setError(err?.message || t("The explanation service did not respond."));
    } finally {
      setBusy(false);
    }
  }

  const rows = ROWS.filter((row) => selected.includes(row.id));

  return (
    <div className="space-y-6">
      <header className="border-b border-border/70 pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-medium text-sky-700 dark:text-sky-300">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          {t("DETERMINISTIC DEMO · NO GENERATIVE AI")}
        </div>
        <p className="kicker">{t("Demonstration data · evidence advisor")}</p>
        <h1 className="mt-1.5 text-[26px] font-medium leading-tight sm:text-[31px]">{t("Evidence-based score explanation")}</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          {t(
            "This read-only explanation is generated directly from the scores computed for the demonstration dataset. It does not call an external AI service, invent data or change a score."
          )}
        </p>
      </header>

      {locationData.loading && <Notice tone="info" title="Loading location scores">Fetching NASA POWER climate history for {place} and recalculating the demonstration scenarios.</Notice>}
      {locationData.error && <Notice tone="danger" title="Location data unavailable">{locationData.error} The score cards below are showing the fixed Harohalli demo results.</Notice>}
      {place && <Notice tone="warn" title={`Selected location: ${place}`}>Climate evidence and scores use the selected point when its NASA POWER request succeeds. Soil and crop inputs remain illustrative Harohalli demo assumptions.</Notice>}

      <div className="panel p-4">
        <div className="flex items-center justify-between">
          <p className="kicker">{t("Scenarios to explain")}</p>
          <span className="metric text-[11px] text-muted-foreground">{selected.length}/3</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {ROWS.map((row) => {
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

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={busy}
              onClick={() => {
                setQuestion(suggestion);
                ask(suggestion);
              }}
              className="rounded-lg border border-border/80 bg-secondary/40 px-2.5 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
            >
              {t(suggestion)}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value.slice(0, 400))}
            rows={3}
            placeholder={t("Optional: ask a question about these demonstration scores")}
            className="text-[12.5px]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => ask()} disabled={busy || !selected.length} className="gap-1.5">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {busy ? t("Explaining…") : t("Explain these scores")}
            </Button>
            <span className="text-[10.5px] text-muted-foreground">{question.length}/400</span>
          </div>
        </div>
      </div>

      {error && (
        <Notice tone="danger" title="No explanation returned">
          {error}
        </Notice>
      )}

      {answer && (
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="kicker">{t("Score explanation · demonstration data")}</p>
          </div>
          <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed">{answer}</p>
          <p className="mt-4 border-t border-border/70 pt-3 text-[10.5px] leading-relaxed text-muted-foreground">
            {t(
              "This explanation is generated from the deterministic scores below, not from a generative AI model. Check any figure against the table before quoting it."
            )}
          </p>
        </div>
      )}

      <div className="panel p-5">
        <p className="kicker">{t("Deterministic scores behind the answer")}</p>
        <ul className="mt-3 space-y-3">
          {(rows.length ? rows : ROWS).map((row) => (
            <li key={row.id} className="rounded-xl border border-border/70 bg-secondary/30 p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[12.5px] font-medium">{t(row.name)}</p>
                <p className="metric text-[12px]">
                  {row.result.overall == null ? "—" : row.result.overall.toFixed(1)}{" "}
                  <span className="text-[10px] text-muted-foreground">
                    / 100 · {t(row.result.confidence.level)} {t("confidence")}
                  </span>
                </p>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {DIMENSION_KEYS.map((key) => (
                  <div key={key} className="rounded-lg bg-card/70 px-2 py-1.5">
                    <p className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">
                      {t(DIMENSION_LABEL[key])}
                    </p>
                    <p className="metric text-[12px]">
                      {row.result.dimension_scores[key] == null
                        ? "—"
                        : row.result.dimension_scores[key].toFixed(1)}
                    </p>
                  </div>
                ))}
              </div>
              {row.result.findings.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-[10.5px] leading-relaxed text-muted-foreground">
                  {row.result.findings.slice(0, 2).map((finding) => (
                    <li key={finding}>• {finding}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" />
          {t(
            "No yield, income or profit figure exists anywhere in this engine. Scores compare suitability under the stated assumptions."
          )}
        </p>
        <div className="mt-3">
          <Link to="/demo/compare" search={{ place, lat, lon }} className="text-[11.5px] font-medium text-primary hover:underline">
            {t("See the comparison charts →")}
          </Link>
        </div>
      </div>
    </div>
  );
}