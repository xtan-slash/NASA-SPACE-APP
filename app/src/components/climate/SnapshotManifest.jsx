import { ExternalLink } from "lucide-react";
import CoverageBar from "@/components/climate/CoverageBar";
import { useI18n } from "@/lib/i18n";

function formatUtc(iso, locale) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(locale, { timeZone: "UTC", year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}

const fmtRange = (start, end) => [start, end].map((key) => key ? key.slice(0, 4) + "-" + key.slice(4, 6) + "-" + key.slice(6, 8) : "—").join(" → ");

function expectedDayCount(start, end) {
  if (!/^\d{8}$/.test(start || "") || !/^\d{8}$/.test(end || "")) return null;
  const toUtc = (key) => Date.UTC(Number(key.slice(0, 4)), Number(key.slice(4, 6)) - 1, Number(key.slice(6, 8)));
  const count = Math.round((toUtc(end) - toUtc(start)) / 86400000) + 1;
  return count > 0 ? count : null;
}

function formatDateKey(key, locale) {
  if (!/^\d{8}$/.test(key || "")) return "—";
  return new Date(Date.UTC(Number(key.slice(0, 4)), Number(key.slice(4, 6)) - 1, Number(key.slice(6, 8)))).toLocaleDateString(locale, { timeZone: "UTC", year: "numeric", month: "short", day: "2-digit" });
}

export default function SnapshotManifest({ snapshot, payload }) {
  const { t, locale } = useI18n();
  if (!snapshot || !payload) return null;
  const startDate = payload.start_date || snapshot.start_date;
  const endDate = payload.end_date || snapshot.end_date;
  const expectedDays = expectedDayCount(startDate, endDate);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="panel p-4">
        <p className="kicker">{t("Source & retrieval")}</p>
        <dl className="mt-3 space-y-2 text-[11.5px]">
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">{t("Dataset")}</dt><dd className="font-medium">{payload.source}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">{t("Underlying model")}</dt><dd>{(payload.model_sources || []).join(", ") || t("not reported")} ({t("reanalysis / assimilated")})</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">{t("API version")}</dt><dd className="metric">{payload.api_version || "—"}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">{t("Point")}</dt><dd className="metric">{snapshot.latitude?.toFixed(4)}, {snapshot.longitude?.toFixed(4)}{payload.elevation_m != null ? " · " + payload.elevation_m.toFixed(1) + " m" : ""}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">{t("Requested days")}</dt><dd className="metric">{fmtRange(startDate, endDate)}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">{t("Retrieved (UTC)")}</dt><dd className="metric">{formatUtc(snapshot.retrieved_at || payload.retrieved_at_utc, locale)}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">{t("Time standard")}</dt><dd>{payload.time_standard || "LST"}</dd></div>
        </dl>
        {payload.source_url && <a href={payload.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 break-all text-[11px] font-medium text-primary hover:underline">{t("Open the exact API request")} <ExternalLink className="h-3 w-3 shrink-0" /></a>}
      </div>
      <div className="panel p-4">
        <div className="flex items-baseline justify-between"><p className="kicker">{t("Data availability")}</p><span className="metric text-[11px] text-muted-foreground">{((payload.coverage_key || 0) * 100).toFixed(1)}% {t("key parameters")}</span></div>
        <p className="prose-note mt-1">{t("Share of expected daily values returned for the requested window. Missing days are excluded from averages — never interpolated. Fill value sentinel:")} {payload.fill_value}.</p>
        <p className="mt-2 rounded-lg bg-secondary/50 px-3 py-2 text-[10.5px] leading-relaxed text-muted-foreground">{t("Completeness is not accuracy: 100% means valid values were returned for every requested day. It does not measure model accuracy, spatial resolution or field-level validation.")}{expectedDays ? " " + t("Expected days") + ": " + expectedDays + "." : ""}</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {(payload.params || []).map((p) => {
            const coverage = payload.coverage?.[p.code] ?? 0;
            const validDays = expectedDays == null ? null : Math.round(coverage * expectedDays);
            const latest = payload.parameter_latest_dates?.[p.code];
            const detail = validDays == null ? (latest ? t("Latest") + ": " + formatDateKey(latest, locale) : "") : validDays + " / " + expectedDays + " " + t("days") + (latest ? " · " + t("Latest") + ": " + formatDateKey(latest, locale) : "");
            return <CoverageBar key={p.code} label={p.code} unit={t(p.label) + " · " + p.unit} value={coverage} detail={detail} />;
          })}
        </div>
      </div>
    </div>
  );
}