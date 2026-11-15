import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Play, Satellite, Sparkles, MapPin, SlidersHorizontal } from "lucide-react";
import { DIMENSION_KEYS, DIMENSION_LABEL } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import { usePublicDemoLocation } from "@/lib/use-public-demo-location";
import LocationCue from "@/components/common/LocationCue";
import { Skeleton } from "@/components/ui/skeleton";

export default function LandingHero() {
  const { t } = useI18n();
  const previewLocations = [
    { label: "Harohalli, Karnataka", lat: 12.68, lon: 77.48 },
    { label: "Anantapur, Andhra Pradesh", lat: 14.68, lon: 77.60 },
    { label: "Ludhiana, Punjab", lat: 30.90, lon: 75.85 },
  ];
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewLocation = previewLocations[previewIndex];
  const locationData = usePublicDemoLocation({ place: previewLocation.label, lat: previewLocation.lat, lon: previewLocation.lon });
  const rows = locationData.results;
  const lead = [...rows].sort((a, b) => (b.result.overall ?? 0) - (a.result.overall ?? 0))[0];

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-20 lg:pt-16">
      <div className="reveal">
        <p className="kicker">{t("NASA Space Apps 2026 · Field Shift")}</p>
        <h1 className="mt-3 text-[34px] font-medium leading-[1.06] tracking-tight sm:text-[46px] lg:text-[52px]">
          {t("Helping Farms Adapt to a Changing Climate.")}
        </h1>
        <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-muted-foreground">
          {t(
            "TerraShift AI turns NASA Earth observation and climate data into an explorable scenario lab. Pick any point in India, read its climate record, and compare multi-year crop rotations on soil, water, climate fit and diversity — with every input and formula visible."
          )}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[13.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Play className="h-3.5 w-3.5" /> {t("Explore demo")}
          </Link>
          <Link
            to="/login"
            search={{ returnTo: "/dashboard" }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-[13.5px] font-medium transition-colors hover:bg-secondary/60"
          >
            {t("Sign in")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/register"
            search={{ returnTo: "/dashboard" }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-[13.5px] font-medium transition-colors hover:bg-secondary/60"
          >
            {t("Create account")}
          </Link>
        </div>

        <div className="mt-5 max-w-xl rounded-xl border border-primary/15 bg-primary/[0.035] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary">
              <MapPin className="h-3.5 w-3.5" /> {t("Try a sample location")}
            </span>
            <span className="rounded-full bg-card px-2 py-1 font-mono text-[9.5px] text-muted-foreground">NASA POWER point preview</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <LocationCue label={previewLocation.label} lat={previewLocation.lat} lon={previewLocation.lon} compact />
            <div className="min-w-0">
              <p className="text-[12px] font-medium">{previewLocation.label}</p>
              <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
                {previewLocation.lat.toFixed(2)}°N, {previewLocation.lon.toFixed(2)}°E
              </p>
              <p className="mt-1 text-[9.5px] text-muted-foreground">{t("NASA POWER grid point")}</p>
            </div>
          </div>
          <input
            aria-label={t("Preview location selector")}
            type="range"
            min="0"
            max={previewLocations.length - 1}
            step="1"
            value={previewIndex}
            onChange={(event) => setPreviewIndex(Number(event.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer accent-primary"
          />
          <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
            <span>South</span><span>Central</span><span>North</span>
          </div>
          <p className="mt-2 rounded-lg bg-card px-2.5 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
            <span className="text-primary">$</span> Compare rotations near {previewLocation.lat.toFixed(2)}, {previewLocation.lon.toFixed(2)}
          </p>
          <Link
            to="/demo/"
            search={{
              place: previewLocation.label,
              lat: previewLocation.lat,
              lon: previewLocation.lon,
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-[12.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("Explore this location")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
          {t("No account is needed to explore the demo. Demonstration data is labelled throughout.")}
        </p>
      </div>

      <div className="panel reveal p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="kicker">{t("Demo · highest scored rotation")}</p>
            <p className="mt-1.5 truncate text-[15px] font-medium">{locationData.loading ? t("Loading rotation scores…") : t(lead.name)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {previewLocation.label} · {previewLocation.lat.toFixed(2)}, {previewLocation.lon.toFixed(2)}
            </p>
          </div>
          <div className="shrink-0 rounded-xl bg-primary px-3 py-2 text-center text-primary-foreground">
            <span className="metric block text-[22px] leading-none">{locationData.loading ? "…" : lead.result.overall?.toFixed(1)}</span>
            <span className="mt-1 block font-mono text-[8.5px] uppercase tracking-[0.14em] opacity-80">
              {t("of 100")}
            </span>
          </div>
        </div>

        {locationData.error && <p className="mt-3 text-[10.5px] text-amber-700">{locationData.error}</p>}
        {locationData.loading ? (
          <div className="mt-5 space-y-4" aria-label={t("Loading historical climate and rotation scores")}>
            {DIMENSION_KEYS.map((key) => (
              <div key={key}>
                <div className="mb-2 flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-[5px] w-full" />
              </div>
            ))}
            <p className="text-[10.5px] text-muted-foreground">{t("Fetching NASA POWER daily history for 2020–2025…")}</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {DIMENSION_KEYS.map((key) => {
              const value = lead.result.dimension_scores[key];
              return (
                <div key={key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11.5px] font-medium">{t(DIMENSION_LABEL[key])}</span>
                    <span className="metric text-[11px] text-muted-foreground">
                      {value == null ? t("excluded") : value.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-1 h-[5px] overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary/85" style={{ width: `${value ?? 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border/70 pt-3 text-[10.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Satellite className="h-3 w-3" /> {locationData.loading ? "Loading NASA POWER · 2020–2025" : "NASA POWER daily point · 2020–2025"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> {t("Deterministic scores")}
          </span>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          {t(
            "Demonstration data: sample farm, sample crops and a recorded NASA POWER summary. Scores are scenario comparisons, not yield predictions."
          )}
        </p>
      </div>
    </section>
  );
}