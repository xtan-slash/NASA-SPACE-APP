import { ExternalLink } from "lucide-react";
import CoverageBar from "@/components/climate/CoverageBar";

function formatUtc(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const fmtRange = (start, end) =>
  `${start?.slice(0, 4)}-${start?.slice(4, 6)}-${start?.slice(6, 8)} → ${end?.slice(0, 4)}-${end?.slice(
    4,
    6
  )}-${end?.slice(6, 8)}`;

export default function SnapshotManifest({ snapshot, payload }) {
  if (!snapshot || !payload) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="panel p-4">
        <p className="kicker">Source & retrieval</p>
        <dl className="mt-3 space-y-2 text-[11.5px]">
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Dataset</dt>
            <dd className="font-medium">{payload.source}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Underlying model</dt>
            <dd>{(payload.model_sources || []).join(", ") || "not reported"} (reanalysis / assimilated)</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">API version</dt>
            <dd className="metric">{payload.api_version || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Point</dt>
            <dd className="metric">
              {snapshot.latitude?.toFixed(4)}, {snapshot.longitude?.toFixed(4)}
              {payload.elevation_m != null ? ` · ${payload.elevation_m.toFixed(1)} m` : ""}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Requested days</dt>
            <dd className="metric">{fmtRange(snapshot.start_date, snapshot.end_date)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Retrieved (UTC)</dt>
            <dd className="metric">{formatUtc(snapshot.retrieved_at)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Time standard</dt>
            <dd>{payload.time_standard || "LST"}</dd>
          </div>
        </dl>
        {payload.source_url && (
          <a
            href={payload.source_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 break-all text-[11px] font-medium text-primary hover:underline"
          >
            Open the exact API request <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        )}
      </div>

      <div className="panel p-4">
        <div className="flex items-baseline justify-between">
          <p className="kicker">Data availability</p>
          <span className="metric text-[11px] text-muted-foreground">
            {((payload.coverage_key || 0) * 100).toFixed(1)}% key params
          </span>
        </div>
        <p className="prose-note mt-1">
          Share of expected daily values returned for the requested window. Missing days are excluded from
          averages — never interpolated. Fill value sentinel: {payload.fill_value}.
        </p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {(payload.params || []).map((p) => (
            <CoverageBar
              key={p.code}
              label={`${p.code}`}
              unit={`${p.label} · ${p.unit}`}
              value={payload.coverage?.[p.code] ?? 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}