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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-2 text-[11px] shadow-sm">
      <p className="font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="mt-0.5" style={{ color: p.color }}>
          {p.name}:{" "}
          <span className="metric">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
          {p.dataKey === "precip_mm" ? " mm" : " days"}
        </p>
      ))}
    </div>
  );
}

export default function AnnualClimateChart({ annual }) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={annual || []} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
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
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          <Bar
            yAxisId="left"
            dataKey="precip_mm"
            name="Annual rainfall"
            fill="hsl(var(--chart-1))"
            radius={[3, 3, 0, 0]}
            barSize={28}
          />
          <Line
            yAxisId="right"
            dataKey="heat_days_35"
            name="Days ≥35 °C"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}