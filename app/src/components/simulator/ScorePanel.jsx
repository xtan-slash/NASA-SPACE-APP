import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check, Loader2, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIMENSION_KEYS, DIMENSION_LABEL } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const SHORT = { soil: "Soil", water: "Water", climate: "Climate", diversity: "Diversity" };

const CONFIDENCE = {
  high: { label: "High confidence", className: "border-primary/30 bg-primary/10 text-primary" },
  medium: { label: "Medium confidence", className: "border-accent/35 bg-accent/10 text-accent" },
  low: { label: "Low confidence", className: "border-destructive/30 bg-destructive/10 text-destructive" },
  none: { label: "Not scored", className: "border-border bg-secondary text-muted-foreground" },
};

function DimensionRow({ dimKey, score, weightPct }) {
  const { t } = useI18n();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12.5px] font-medium">{t(DIMENSION_LABEL[dimKey])}</span>
        <span className="metric text-[12px]">
          {score == null ? "—" : score.toFixed(1)}
          <span className="ml-1.5 text-[10px] text-muted-foreground">
            {weightPct != null ? `w ${weightPct.toFixed(0)}%` : t("excluded")}
          </span>
        </span>
      </div>
      <div className="mt-1 h-[5px] overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", score == null ? "bg-border" : "bg-primary/85")}
          style={{ width: `${score ?? 0}%` }}
        />
      </div>
    </div>
  );
}

export default function ScorePanel({ result, scenarioName, onSave, saving, canSave, savedId, climateBasis }) {
  const { t } = useI18n();
  const confidence = CONFIDENCE[result?.confidence?.level || "none"];
  const hasResult = result && result.status === "ok";
  const missing = result?.missing || [];

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="kicker">{t("Live score")}</p>
            <p className="mt-1 text-[13px] font-medium leading-tight">{scenarioName || t("Untitled rotation")}</p>
          </div>
          <span className={cn("rounded-full border px-2.5 py-1 text-[10.5px] font-medium", confidence.className)}>
            {t(confidence.label)}
          </span>
        </div>

        <div className="mt-4 flex items-end gap-2">
          <span className="metric text-[44px] font-medium leading-none">
            {result?.overall != null ? result.overall.toFixed(1) : "—"}
          </span>
          <span className="pb-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            {t("of 100")}
          </span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
          Deterministic weighted mean of the dimensions available for this farm. Not a yield score.
        </p>

        <div className="mt-4 space-y-3">
          {DIMENSION_KEYS.map((key) => (
            <DimensionRow
              key={key}
              dimKey={key}
              score={result?.dimension_scores?.[key] ?? null}
              weightPct={result?.weights?.effective_pct?.[key] ?? null}
            />
          ))}
        </div>

        {result?.weights?.renormalised && (
          <p className="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-2 text-[10.5px] leading-relaxed">
            One dimension could not be scored, so the configured weights were renormalised over the rest.
            Excluded dimensions are shown as “excluded”.
          </p>
        )}

        {result?.status === "insufficient" && (
          <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-[11px] leading-relaxed text-destructive">
            Not enough input dimensions to score this rotation. At least two of soil, water, climate and
            diversity must be computable.
          </p>
        )}

        {result?.errors?.length > 0 && result.status !== "ok" && (
          <ul className="mt-3 space-y-1 text-[11px] text-destructive">
            {result.errors.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" className="h-8 gap-1.5 text-[11.5px]" onClick={onSave} disabled={!canSave || saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : savedId ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
            {saving ? t("Saving…") : savedId ? t("Update scenario") : t("Save scenario")}
          </Button>
          {savedId && (
            <Button asChild size="sm" variant="secondary" className="h-8 gap-1.5 text-[11.5px]">
              <Link to="/advisor" search={{ scenario: savedId }}>
                <Sparkles className="h-3 w-3" /> {t("Explain")}
              </Link>
            </Button>
          )}
        </div>
        {!canSave && !savedId && (
          <p className="mt-2 text-[10.5px] text-muted-foreground">
            Saving needs a name, at least two filled seasons and no unresolved input errors.
          </p>
        )}
      </div>

      {missing.length > 0 && (
        <div className="panel p-4">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium">
            <AlertTriangle className="h-3.5 w-3.5 text-accent" /> {t("Missing data & uncertainty")}
          </p>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {missing.map((m) => (
              <li key={m}>• {m}</li>
            ))}
          </ul>
          <div className="mt-2.5 space-y-1 border-t border-border/60 pt-2 text-[10.5px] leading-relaxed text-muted-foreground">
            {(result?.uncertainty || []).map((u) => (
              <p key={u.message}>— {u.message}</p>
            ))}
          </div>
        </div>
      )}

      {hasResult && (
        <div className="panel p-4">
          <p className="text-[12.5px] font-medium">{t("What the engine found")}</p>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {result.findings.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
          {climateBasis && (
            <p className="mt-2.5 border-t border-border/60 pt-2 text-[10px] leading-relaxed text-muted-foreground">
              {climateBasis}
            </p>
          )}
        </div>
      )}

      {hasResult && (
        <div className="panel overflow-hidden">
          <div className="flex items-baseline justify-between px-4 pt-4">
            <p className="text-[12.5px] font-medium">{t("Season by season")}</p>
            <span className="kicker">0–100</span>
          </div>
          <div className="mt-2 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[420px] text-[11px]">
              <thead>
                <tr className="border-b border-border/70 text-left text-muted-foreground">
                  <th className="px-4 py-1.5 font-medium">{t("Season")}</th>
                  <th className="px-2 py-1.5 font-medium">{t("Crop")}</th>
                  {["soil", "water", "climate"].map((k) => (
                    <th key={k} className="px-2 py-1.5 text-right font-medium">
                      {t(SHORT[k])}
                    </th>
                  ))}
                  <th className="px-4 py-1.5 text-right font-medium">{t("Total")}</th>
                </tr>
              </thead>
              <tbody>
                {result.years.map((y) => (
                  <tr key={`${y.year}-${y.season}`} className="border-b border-border/40 last:border-0">
                    <td className="whitespace-nowrap px-4 py-1.5 text-muted-foreground">
                      {y.year} {y.season_label}
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="font-medium">{y.crop_name}</span>
                    </td>
                    {["soil", "water", "climate"].map((k) => (
                      <td key={k} className="metric px-2 py-1.5 text-right">
                        {y.scores[k] == null ? "—" : y.scores[k].toFixed(0)}
                      </td>
                    ))}
                    <td className="metric px-4 py-1.5 text-right font-medium">
                      {y.season_total == null ? "—" : y.season_total.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-2 p-3 sm:hidden">
            {result.years.map((y) => (
              <article key={`${y.year}-${y.season}`} className="rounded-lg border border-border/70 bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">{y.year} {y.season_label}</p>
                    <p className="mt-0.5 truncate text-[12px] font-medium">{y.crop_name}</p>
                  </div>
                  <span className="metric shrink-0 text-[12px] font-semibold">{y.season_total == null ? "—" : y.season_total.toFixed(0)}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 border-t border-border/60 pt-2">
                  {["soil", "water", "climate"].map((k) => (
                    <div key={k}>
                      <p className="text-[9.5px] text-muted-foreground">{t(SHORT[k])}</p>
                      <p className="metric mt-0.5 text-[11px]">{y.scores[k] == null ? "—" : y.scores[k].toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}