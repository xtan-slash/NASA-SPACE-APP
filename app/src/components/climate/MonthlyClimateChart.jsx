import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useI18n } from "@/lib/i18n";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ChartTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-2 text-[11px] shadow-sm">
      <p className="font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="mt-0.5" style={{ color: p.color }}>
          {t(p.name)}: <span className="metric">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
          {p.dataKey === "precip_mm" ? " mm" : " °C"}
        </p>
      ))}
    </div>
  );
}

export default function MonthlyClimateChart({ monthly }) {
  const { t } = useI18n();
  const data = (monthly || []).map((m) => ({ ...m, label: t(MONTHS[m.month - 1]) }));
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip content={(props) => <ChartTooltip {...props} t={t} />} />
          <Legend formatter={(value) => t(value)} wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          <Bar
            yAxisId="left"
            dataKey="precip_mm"
            name="Rainfall"
            fill="hsl(var(--chart-3))"
            radius={[3, 3, 0, 0]}
            barSize={16}
          />
          <Line
            yAxisId="right"
            dataKey="t2m_c"
            name="Mean temp"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            dot={{ r: 2 }}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}