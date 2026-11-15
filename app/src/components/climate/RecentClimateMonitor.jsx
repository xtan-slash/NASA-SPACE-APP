import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CoverageBar from "@/components/climate/CoverageBar";
import { useI18n } from "@/lib/i18n";

const formatDate = (value) => {
  if (!value) return "—";
  return value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8);
};

const formatNumber = (value, digits = 1) =>
  value == null || !Number.isFinite(Number(value)) ? "—" : Number(value).toFixed(digits);

function Metric({ label, value, unit, note }) {
  return (
    <div className="panel p-4">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="metric mt-2 text-[25px] font-semibold tracking-tight">
        {value} <span className="text-[13px] font-normal text-muted-foreground">{unit}</span>
      </p>
      {note && <p className="mt-1 text-[10.5px] text-muted-foreground">{note}</p>}
    </div>
  );
}

function DailyTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-2 text-[11px] shadow-sm">
      <p className="font-medium">{formatDate(label)}</p>
      <p className="metric mt-1">{formatNumber(payload[0].value, 2)} {unit}</p>
    </div>
  );
}

export default function RecentClimateMonitor({ payload }) {
  const { t } = useI18n();
  const summary = payload?.recent_summary || {};
  const daily = payload?.daily || [];
  const latest = payload?.parameter_latest_dates || {};
  const params = [
    { code: "PRECTOTCORR", label: "Rainfall", unit: "mm/day" },
    { code: "T2M", label: "Mean air temperature", unit: "°C" },
    { code: "RH2M", label: "Relative humidity at 2 m", unit: "%" },
    { code: "GWETROOT", label: "Root-zone soil wetness", unit: "0–1" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={t("Rainfall total")}
          value={formatNumber(summary.rainfall_total_mm)}
          unit="mm"
          note={t("Available daily rainfall values")}
        />
        <Metric
          label={t("Mean air temperature")}
          value={formatNumber(summary.mean_temp_c, 2)}
          unit="°C"
          note={t("Mean of available daily values")}
        />
        <Metric
          label={t("Relative humidity")}
          value={formatNumber(summary.mean_humidity_pct)}
          unit="%"
          note={t("Mean at 2 m")}
        />
        <Metric
          label={t("Root-zone wetness")}
          value={formatNumber(summary.mean_root_zone_wetness, 3)}
          unit="0–1"
          note={t("Model-derived, not field measured")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <h3 className="text-[14px] font-medium">{t("Daily rainfall")}</h3>
          <p className="prose-note mt-1">{t("NASA POWER precipitation for each requested day.")}</p>
          <div className="mt-3 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v) => v.slice(6, 8)} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={(props) => <DailyTooltip {...props} unit="mm" />} />
                <Bar dataKey="precip_mm" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-4">
          <h3 className="text-[14px] font-medium">{t("Daily mean temperature")}</h3>
          <p className="prose-note mt-1">{t("Daily mean air temperature at 2 m.")}</p>
          <div className="mt-3 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v) => v.slice(6, 8)} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={(props) => <DailyTooltip {...props} unit="°C" />} />
                <Line dataKey="t2m_c" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[14px] font-medium">{t("Parameter freshness and coverage")}</h3>
          <span className="text-[10.5px] text-muted-foreground">{t("Latest valid date can differ by parameter")}</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {params.map((parameter) => (
            <div key={parameter.code} className="rounded-lg border border-border/70 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="metric text-[11px] font-medium">{parameter.code}</span>
                <span className="metric text-[10.5px] text-muted-foreground">{formatDate(latest[parameter.code])}</span>
              </div>
              <CoverageBar
                label={t(parameter.label)}
                unit={parameter.unit}
                value={payload.coverage?.[parameter.code] ?? 0}
              />
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10.5px] leading-relaxed text-muted-foreground">
        {t("Near-real-time data, not an instant sensor feed. NASA POWER publication latency varies by parameter. A seven-day request buffer is used, and missing values are not interpolated.")}
      </p>
    </div>
  );
}