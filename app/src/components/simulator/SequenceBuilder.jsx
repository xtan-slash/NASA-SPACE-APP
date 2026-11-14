import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEASONS, SEASON_BY_VALUE } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { RotateCcw, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const keyOf = (year, season) => `${year}:${season}`;

export default function SequenceBuilder({
  entries,
  crops,
  yearStart,
  years,
  activeSeasons,
  onCell,
  onYears,
  onSeasonToggle,
  onYearStart,
  onSuggest,
  onClear,
}) {
  const { t } = useI18n();
  const yearList = Array.from({ length: years }, (_, i) => yearStart + i);
  const cropsBySeason = (season) => crops.filter((c) => c.season === season);

  const unassigned = yearList.reduce(
    (acc, y) => acc + activeSeasons.filter((s) => !entries[keyOf(y, s)]).length,
    0
  );

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium">{t("Rotation sequence")}</h2>
          <p className="prose-note mt-1">
            {t("Choose a crop for each season. Unfilled seasons are excluded from scoring, not assumed.")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-[11.5px]" onClick={onSuggest}>
            <Sparkles className="h-3 w-3" /> {t("Suggestion")}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-[11.5px]" onClick={onClear}>
            <RotateCcw className="h-3 w-3" /> {t("Clear")}
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <Label className="text-[11.5px]">{t("First year")}</Label>
          <Input
            type="number"
            className="mt-1 h-8 text-[12.5px]"
            value={yearStart}
            min={2024}
            max={2035}
            onChange={(e) => onYearStart(Number(e.target.value) || 2026)}
          />
        </div>
        <div>
          <Label className="text-[11.5px]">{t("Years in rotation")}</Label>
          <Select value={String(years)} onValueChange={(v) => onYears(Number(v))}>
            <SelectTrigger className="mt-1 h-8 text-[12.5px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} year{n === 1 ? "" : "s"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11.5px]">{t("Seasons per year")}</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SEASONS.map((s) => {
              const active = activeSeasons.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onSeasonToggle(s.value)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {t(s.label)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-y-1.5">
          <thead>
            <tr>
              <th className="w-14 pb-1 text-left text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("Year")}
              </th>
              {activeSeasons.map((s) => (
                <th
                  key={s}
                  className="pb-1 text-left text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {t(SEASON_BY_VALUE[s]?.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yearList.map((year) => (
              <tr key={year}>
                <td className="metric pr-2 text-[12px] text-muted-foreground">{year}</td>
                {activeSeasons.map((season) => {
                  const value = entries[keyOf(year, season)];
                  const options = cropsBySeason(season);
                  return (
                    <td key={season} className="pr-1.5">
                      <Select
                        value={value || undefined}
                        onValueChange={(v) => onCell(keyOf(year, season), v === "__none" ? null : v)}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-9 text-[12px]",
                            !value && "border-dashed text-muted-foreground"
                          )}
                        >
                          <SelectValue placeholder={t("Unfilled")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">{t("Leave unfilled")}</SelectItem>
                          {options.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                          {options.length === 0 && (
                            <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
                              No crops tagged for {SEASON_BY_VALUE[season]?.label} in the library
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {unassigned === 0
          ? t("All seasons filled.")
          : `${unassigned} season${unassigned === 1 ? "" : "s"} still unfilled.`}{" "}
        The engine needs at least two cropped seasons.
      </p>
    </div>
  );
}