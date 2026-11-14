import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { DIMENSION_KEYS, DIMENSION_LABEL, DEFAULT_WEIGHTS } from "@/lib/catalog";
import { normalizeWeights } from "@/lib/scoring";
import { useI18n } from "@/lib/i18n";

const PRESETS = [
  { label: "Balanced", weights: DEFAULT_WEIGHTS },
  { label: "Water first", weights: { soil: 4, water: 9, climate: 4, diversity: 3 } },
  { label: "Soil first", weights: { soil: 9, water: 4, climate: 4, diversity: 3 } },
  { label: "Equal", weights: { soil: 5, water: 5, climate: 5, diversity: 5 } },
];

export const describeWeight = (key) =>
  ({
    soil: "pH, texture and organic-carbon fit against the farm profile",
    water: "season rainfall + irrigation allowance vs crop demand",
    climate: "season temperature fit plus heat and heavy-rain days",
    diversity: "family mix, legume share and alternation across years",
  })[key] || "";

export default function WeightsPanel({ weights, onChange }) {
  const { t } = useI18n();
  const check = normalizeWeights(weights);

  return (
    <div className="panel p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-medium">{t("Scoring weights")}</h2>
        <span className="kicker">0–10 each</span>
      </div>
      <p className="prose-note mt-1">
        Weights express what matters to this farm. They are normalised to percentages, so only their relative
        size changes the overall score.
      </p>

      <div className="mt-3 space-y-3.5">
        {DIMENSION_KEYS.map((key) => (
          <div key={key}>
            <div className="flex items-baseline justify-between gap-2">
              <label className="text-[12.5px] font-medium" htmlFor={`weight-${key}`}>
                {t(DIMENSION_LABEL[key])}
              </label>
              <span className="metric text-[11.5px] text-muted-foreground">
                {weights[key]} · {check.normalized[key] != null ? (check.normalized[key] * 100).toFixed(1) : "0.0"}%
              </span>
            </div>
            <Slider
              id={`weight-${key}`}
              className="mt-1.5"
              min={0}
              max={10}
              step={1}
              value={[Number(weights[key]) || 0]}
              onValueChange={([v]) => onChange({ ...weights, [key]: v })}
            />
            <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground">{describeWeight(key)}</p>
          </div>
        ))}
      </div>

      {!check.valid && (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-[11px] text-destructive">
          {check.errors[0]}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            size="sm"
            variant="secondary"
            className="h-7 text-[11px]"
            onClick={() => onChange(p.weights)}
          >
            {t(p.label)}
          </Button>
        ))}
      </div>
    </div>
  );
}