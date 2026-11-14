import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SEASON_BY_VALUE } from "@/lib/catalog";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function SeasonLines({ rows }) {
  const keys = [];
  rows.forEach((r) => {
    (r.result?.years || []).forEach((y) => {
      const key = `${y.year} ${SEASON_BY_VALUE[y.season]?.label || y.season}`;
      if (!keys.includes(key)) keys.push(key);
    });
  });

  const data = keys.map((label) => {
    const entry = { label: label.replace(" ", " · ") };
    rows.forEach((r) => {
      const match = (r.result?.years || []).find(
        (y) => `${y.year} ${SEASON_BY_VALUE[y.season]?.label || y.season}` === label
      );
      entry[r.name] = match?.season_total ?? null;
    });
    return entry;
  });

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10.5 }} />
          {rows.map((r, i) => (
            <Line
              key={r.id}
              type="monotone"
              dataKey={r.name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Per-season total: the weighted soil, water and climate sub-scores for that season. Diversity is a
        whole-rotation property and is not plotted per season.
      </p>
    </div>
  );
}