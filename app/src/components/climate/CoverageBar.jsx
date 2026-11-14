import { cn } from "@/lib/utils";

export default function CoverageBar({ label, value, unit, detail }) {
  const pct = Math.max(0, Math.min(100, (value || 0) * 100));
  const tone = pct >= 99 ? "bg-primary" : pct >= 90 ? "bg-accent" : "bg-destructive";
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-[11.5px]">
        <span className="truncate font-medium">{label}</span>
        <span className={cn("metric shrink-0", pct < 90 ? "text-destructive" : "text-muted-foreground")}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {unit}
        {detail ? ` · ${detail}` : ""}
      </p>
    </div>
  );
}