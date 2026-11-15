import { MapPin } from "lucide-react";

/** Lightweight, static map-style cue for a selected NASA POWER grid point. */
export default function LocationCue({ label, lat, lon, compact = false }) {
  return (
    <div
      role="img"
      aria-label={`${label}, latitude ${Number(lat).toFixed(2)}, longitude ${Number(lon).toFixed(2)}`}
      className={`relative isolate overflow-hidden rounded-xl border border-primary/15 bg-[#e8eee3] text-[#294b3b] ${compact ? "h-[76px] w-[112px] shrink-0" : "h-[112px] w-full sm:w-[168px]"}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 48%, rgba(91,126,94,.22) 49%, rgba(91,126,94,.22) 51%, transparent 52%), linear-gradient(0deg, transparent 48%, rgba(91,126,94,.22) 49%, rgba(91,126,94,.22) 51%, transparent 52%), radial-gradient(ellipse at 22% 28%, #c4d6b9 0 12%, transparent 13%), radial-gradient(ellipse at 78% 72%, #c4d6b9 0 18%, transparent 19%)",
          backgroundSize: "34px 34px, 34px 34px, 100% 100%, 100% 100%",
        }}
      />
      <svg aria-hidden="true" viewBox="0 0 180 112" className="absolute inset-0 h-full w-full" fill="none">
        <path d="M-8 82 C28 70 35 28 72 38 S124 96 188 48" stroke="#8da98a" strokeWidth="5" strokeLinecap="round" />
        <path d="M-8 82 C28 70 35 28 72 38 S124 96 188 48" stroke="#f7f5e9" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 5" />
        <path d="M24 -8 L62 120 M132 -8 L104 120" stroke="#b2c6a7" strokeWidth="2" />
        <path d="M0 18 C38 8 64 16 88 4 M112 108 C134 88 153 90 184 98" stroke="#b2c6a7" strokeWidth="1.5" />
      </svg>
      <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <span className="absolute h-8 w-8 animate-ping rounded-full bg-primary/15" />
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-md">
          <MapPin className="h-3.5 w-3.5" fill="currentColor" />
        </span>
      </span>
      <span className="absolute bottom-1.5 left-2 rounded-md bg-white/85 px-1.5 py-0.5 font-mono text-[8px] font-medium tracking-tight text-[#294b3b] shadow-sm">
        {Number(lat).toFixed(2)}°N · {Number(lon).toFixed(2)}°E
      </span>
    </div>
  );
}