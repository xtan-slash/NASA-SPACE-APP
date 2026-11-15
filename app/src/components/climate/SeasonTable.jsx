import { SEASONS } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

const n = (v, digits = 1) => (v == null ? "—" : Number(v).toFixed(digits));

export default function SeasonTable({ seasons }) {
  const { t } = useI18n();
  if (!seasons) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-border/80 text-left">
            <th className="py-2 pr-3 font-medium text-muted-foreground">{t("Season")}</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground">{t("Rainfall")}</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground">{t("Mean temp")}</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground">{t("Days ≥35 °C")}</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground">{t("Heavy-rain days")}</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground">{t("Root-zone wetness")}</th>
            <th className="py-2 font-medium text-muted-foreground">{t("Seasons used")}</th>
          </tr>
        </thead>
        <tbody>
          {SEASONS.map((s) => {
            const row = seasons[s.value];
            return (
              <tr key={s.value} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 pr-3">
                  <span className="font-medium">{t(s.label)}</span>
                  <span className="ml-1.5 text-[10.5px] text-muted-foreground">{s.window}</span>
                </td>
                <td className="metric py-2.5 pr-3">{n(row?.precip_mm)} mm</td>
                <td className="metric py-2.5 pr-3">{n(row?.t2m_c, 2)} °C</td>
                <td className="metric py-2.5 pr-3">{n(row?.heat_days_35, 1)}</td>
                <td className="metric py-2.5 pr-3">{n(row?.heavy_rain_days_50, 1)}</td>
                <td className="metric py-2.5 pr-3">{n(row?.gwetroot, 2)}</td>
                <td className="metric py-2.5">{row?.years ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
        Averages across the complete season windows inside the requested range. Rainfall is a season total;
        temperature is a mean of daily means. Root-zone wetness is a model variable between 0 and 1, not a
        soil-moisture measurement.
      </p>
    </div>
  );
}