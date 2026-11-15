import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Leaf, Satellite, BarChart3, Sparkles, ShieldAlert, Lock, FlaskConical } from "lucide-react";
import Notice from "@/components/common/Notice";
import { DEMO_CROPS, DEMO_FARM } from "@/lib/demo-data";
import { TEXTURE_LABEL } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import { usePublicDemoLocation } from "@/lib/use-public-demo-location";
import LocationCue from "@/components/common/LocationCue";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/demo/")({
  validateSearch: (search) => ({
    place: typeof search.place === "string" ? search.place.slice(0, 100) : "",
    lat: Number.isFinite(Number(search.lat)) ? Number(search.lat) : null,
    lon: Number.isFinite(Number(search.lon)) ? Number(search.lon) : null,
  }),
  component: DemoOverview,
});

function DemoOverview() {
  const { t } = useI18n();
  const { place, lat, lon } = Route.useSearch();
  const locationData = usePublicDemoLocation({ place, lat, lon });
  const hasSelectedPoint = locationData.hasPoint;
  const rows = locationData.results;
  const climate = locationData.climate;

  return (
    <div className="space-y-6">
      <header className="border-b border-border/70 pb-6">
        <p className="kicker">{t("Demonstration data · read-only")}</p>
        <h1 className="mt-1.5 text-[26px] font-medium leading-tight sm:text-[31px]">{t("Rotation lab demo")}</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          {t(
            "A sample farm point in Karnataka, a recorded NASA POWER climate summary for 2020–2025 and three illustrative rotations — all scored by the same deterministic engine the private workspace uses."
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/demo/climate"
            search={{ place, lat, lon }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-[12.5px] font-medium transition-colors hover:bg-secondary/60"
          >
            <Satellite className="h-3.5 w-3.5" /> {t("Climate dashboard")}
          </Link>
          <Link
            to="/demo/compare"
            search={{ place, lat, lon }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-[12.5px] font-medium transition-colors hover:bg-secondary/60"
          >
            <BarChart3 className="h-3.5 w-3.5" /> {t("Compare rotations")}
          </Link>
          <Link
            to="/demo/judge"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3.5 py-2 text-[12.5px] font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <FlaskConical className="h-3.5 w-3.5" /> Judge walkthrough
          </Link>
          <Link
            to="/register"
            search={{ returnTo: "/dashboard" }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-[12.5px] font-medium text-primary-foreground"
          >
            {t("Create a private workspace")}
          </Link>
        </div>
      </header>

      {hasSelectedPoint && (
        <Notice tone="info" title={`Selected location: ${place}`}>
          <p>
            Selected coordinates: {lat.toFixed(2)}°N, {lon.toFixed(2)}°E.
            {locationData.loading
              ? " Loading the selected point's NASA POWER climate history and recalculating crop-rotation scores."
              : locationData.error
                ? ` ${locationData.error} The fixed Harohalli demo dataset is shown as a fallback.`
                : " NASA POWER climate history and crop-rotation scores below use this selected point. Soil and crop inputs remain illustrative Harohalli demo assumptions."}
          </p>
        </Notice>
      )}

      <Notice tone="warn" title="Everything here is demonstration data">
        {t(
          "The farm, crops and scenarios are sample records served from a static demonstration file. This demo cannot create, edit or delete anything, and it never reads another user's workspace."
        )}
      </Notice>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} /> {t("Sample farm")}
            </span>
            <span className="chip">{t("Demo inputs")}</span>
          </div>
          <p className="mt-3 text-[15px] font-medium leading-tight">{hasSelectedPoint ? place : DEMO_FARM.name}</p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {hasSelectedPoint ? "Selected NASA POWER point" : `${DEMO_FARM.district} · ${DEMO_FARM.area_ha} ha`}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {(hasSelectedPoint ? lat : DEMO_FARM.latitude).toFixed(2)}°N, {(hasSelectedPoint ? lon : DEMO_FARM.longitude).toFixed(2)}°E
          </p>
          <div className="mt-3">
            <LocationCue
              label={hasSelectedPoint ? place : DEMO_FARM.name}
              lat={hasSelectedPoint ? lat : DEMO_FARM.latitude}
              lon={hasSelectedPoint ? lon : DEMO_FARM.longitude}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {t(TEXTURE_LABEL[DEMO_FARM.soil_texture])} · pH {DEMO_FARM.soil_ph} · OC {DEMO_FARM.soil_organic_carbon} % ·{" "}
            {t("Rainfed only")}
          </p>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Satellite className="h-3.5 w-3.5" strokeWidth={1.8} /> {t("Climate summary")}
            </span>
            <span className="chip">{locationData.loading ? "Loading" : hasSelectedPoint && !locationData.error ? "Location data" : t("Recorded")}</span>
          </div>
          <p className="mt-3 text-[15px] font-medium leading-tight">NASA POWER daily</p>
          {locationData.loading ? (
            <div className="mt-2 space-y-2" aria-label={t("Loading historical climate data")}>
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              {climate.start_date.slice(0, 4)}–{climate.end_date.slice(0, 4)} ·{" "}
              {(climate.coverage_key * 100).toFixed(1)}% {t("coverage")}
            </p>
          )}
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {t(
              "Gridded reanalysis values for the selected point's grid cell — not a farm sensor, and historical rather than a forecast."
            )}
          </p>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Leaf className="h-3.5 w-3.5" strokeWidth={1.8} /> {t("Crop library")}
            </span>
            <span className="chip">{DEMO_CROPS.length} {t("demo")}</span>
          </div>
          <p className="mt-3 text-[15px] font-medium leading-tight">
            {DEMO_CROPS.length} {t("crop records")}
          </p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {DEMO_CROPS.filter((c) => c.n_fixing).length} {t("legumes")} ·{" "}
            {new Set(DEMO_CROPS.map((c) => c.family)).size} {t("families")}
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {t("Water demand, pH and temperature ranges are illustrative values, editable in a private workspace.")}
          </p>
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="kicker">{t("Scenario scores")}</p>
            <h2 className="mt-1 text-[17px] font-medium">{t("Three illustrative rotations on the same inputs")}</h2>
          </div>
          <Link to="/demo/compare" search={{ place, lat, lon }} className="text-[11.5px] font-medium text-primary hover:underline">
            {t("Open the comparison →")}
          </Link>
        </div>

        {locationData.loading ? (
          <div className="mt-4 space-y-3" aria-label={t("Loading historical climate and rotation scores")}>
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3 border-b border-border/70 py-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-2.5 w-56 max-w-full" />
                </div>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-7 w-12" />
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">{t("Fetching NASA POWER daily history for 2020–2025…")}</p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border/70">
            {rows.map(({ id, name, result }) => (
              <li key={id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">{t(name)}</p>
                  <p className="text-[10.5px] text-muted-foreground">
                    {result.years.length} {t("seasons")} · {t(result.confidence.level)} {t("confidence")} ·{" "}
                    {result.missing.length} {t("missing input notes")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {Object.entries(result.dimension_scores).map(([key, value]) => (
                    <span key={key} className="metric rounded-md bg-secondary px-1.5 py-1 text-[10.5px] text-muted-foreground">
                      {t(key === "soil" ? "soil" : key === "water" ? "water" : key === "climate" ? "climate" : "diversity")}{" "}
                      {value == null ? "—" : value.toFixed(0)}
                    </span>
                  ))}
                </div>
                <span className="metric rounded-md bg-primary px-2 py-1 text-[12px] text-primary-foreground">
                  {result.overall == null ? "—" : result.overall.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/70 pt-3">
          <Link
            to="/demo/advisor"
            search={{ place, lat, lon }}
            className="inline-flex items-center gap-2 text-[11.5px] font-medium text-primary hover:underline"
          >
            <Sparkles className="h-3.5 w-3.5" /> {t("Ask the advisor to explain these scores")}
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5" /> {t("Comparisons, not yield or income predictions.")}
          </span>
        </div>
      </section>

      <div className="panel-flat flex items-start gap-2.5 p-4">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          {t(
            "Read-only by design: the demo has no forms, no save buttons and no database access. Sign in to add farms, request NASA POWER data and save your own rotation scenarios."
          )}
        </p>
      </div>
    </div>
  );
}