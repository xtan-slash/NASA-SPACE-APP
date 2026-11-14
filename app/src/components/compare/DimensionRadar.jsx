import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DIMENSION_KEYS } from "@/lib/catalog";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];
const LABELS = { soil: "Soil", water: "Water", climate: "Climate", diversity: "Diversity" };

export default function DimensionRadar({ rows }) {
  const data = DIMENSION_KEYS.map((key) => {
    const entry = { dimension: LABELS[key] };
    rows.forEach((r) => {
      entry[r.name] = r.result?.dimension_scores?.[key] ?? 0;
    });
    return entry;
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          {rows.map((r, i) => (
            <Radar
              key={r.id}
              name={r.name}
              dataKey={r.name}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.14}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10.5 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}