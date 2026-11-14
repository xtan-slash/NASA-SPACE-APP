import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-2 text-[11px] shadow-sm">
      <p className="font-medium">{label}</p>
      <p className="metric mt-0.5">{payload[0].value == null ? "not scored" : Number(payload[0].value).toFixed(1)} / 100</p>
    </div>
  );
}

export default function DimensionBars({ rows }) {
  const data = rows.map((r) => ({
    name: r.name,
    score: r.result?.overall ?? null,
  }));
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10.5, fill: "hsl(var(--muted-foreground))" }}
            interval={0}
            tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
          />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10.5, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--secondary))" }} />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={44}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Overall deterministic score. Bars are absent where too little data exists to compute a score.
      </p>
    </div>
  );
}