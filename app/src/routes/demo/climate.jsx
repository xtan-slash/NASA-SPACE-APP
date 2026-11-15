import { createFileRoute, Link } from "@tanstack/react-router";
import { Satellite, BarChart3 } from "lucide-react";
import Notice from "@/components/common/Notice";
import MonthlyClimateChart from "@/components/climate/MonthlyClimateChart";
import AnnualClimateChart from "@/components/climate/AnnualClimateChart";
import SeasonTable from "@/components/climate/SeasonTable";
import SnapshotManifest from "@/components/climate/SnapshotManifest";
import { DEMO_SNAPSHOT } from "@/lib/demo-data";
import { useI18n } from "@/lib/i18n";
import { usePublicDemoLocation } from "@/lib/use-public-demo-location";

export const Route = createFileRoute("/demo/climate")({
  validateSearch: (search) => ({
    place: typeof search.place === "string" ? search.place.slice(0, 100) : "",
    lat: Number.isFinite(Number(search.lat)) ? Number(search.lat) : null,
    lon: Number.isFinite(Number(search.lon)) ? Number(search.lon) : null,
  }),
  component: DemoClimate,
});

function DemoClimate() {
  const { t } = useI18n();
  const { place, lat, lon } = Route.useSearch();
  const locationData = usePublicDemoLocation({ place, lat, lon });
  const payload = locationData.climate;

  return (
    <div className="space-y-6">
      <header className="border-b border-border/70 pb-6">
        <p className="kicker">{t("Demonstration data · NASA POWER")}</p>
        <h1 className="mt-1.5 text-[26px] font-medium leading-tight sm:text-[31px]">{t("Climate dashboard")}</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          {t(
            "A recorded NASA POWER daily point response for the demonstration point, aggregated by month and by season. In a private workspace the same page requests the API live for your own coordinates."
          )}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <Satellite className="h-3.5 w-3.5" />
          {locationData.location.name || place || "Harohalli demo point"} · {locationData.location.latitude.toFixed(3)}, {locationData.location.longitude.toFixed(3)} ·{" "}
          <a
            href="https://power.larc.nasa.gov/data-access-viewer/"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            power.larc.nasa.gov
          </a>
        </p>
      </header>

      {locationData.loading && <Notice tone="info" title="Loading location climate">Requesting the 2020–2025 NASA POWER daily record for the selected coordinates and recalculating the demo scores.</Notice>}
      {locationData.error && <Notice tone="danger" title="Location data unavailable">{locationData.error} The charts below are showing the fixed Harohalli demonstration dataset as a fallback.</Notice>}
      <Notice tone="warn" title={t("Demonstration dataset")}>
        {locationData.hasPoint
          ? "NASA POWER values below are requested for the selected coordinate and describe its gridded model cell, not the field. Soil and crop inputs remain illustrative Harohalli demo assumptions. Historical data only, not a forecast."
          : "These values use the recorded Harohalli NASA POWER demonstration dataset. They describe the model grid cell, not the field, and are historical — not a forecast."}
      </Notice>

      {(!locationData.hasPoint || locationData.data) && (
        <SnapshotManifest
          snapshot={{
            ...DEMO_SNAPSHOT,
            latitude: locationData.data ? locationData.location.latitude : DEMO_SNAPSHOT.latitude,
            longitude: locationData.data ? locationData.location.longitude : DEMO_SNAPSHOT.longitude,
            start_date: payload.start_date || DEMO_SNAPSHOT.start_date,
            end_date: payload.end_date || DEMO_SNAPSHOT.end_date,
            retrieved_at: payload.retrieved_at_utc || DEMO_SNAPSHOT.retrieved_at,
          }}
          payload={payload}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium">{t("Monthly climatology")}</h2>
            <span className="kicker">mm · °C</span>
          </div>
          <p className="prose-note mt-1">
            {t("Mean monthly rainfall total and mean daily temperature across")} {payload.years_covered}{" "}
            {t("years")}.
          </p>
          <div className="mt-3">
            <MonthlyClimateChart monthly={payload.monthly} />
          </div>
        </div>

        <div className="panel p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium">{t("Year by year")}</h2>
            <span className="kicker">mm · days</span>
          </div>
          <p className="prose-note mt-1">
            {t("Annual rainfall and the count of days with maximum temperature at or above 35 °C.")}
          </p>
          <div className="mt-3">
            <AnnualClimateChart annual={payload.annual} />
          </div>
        </div>
      </div>

      <div className="panel p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[15px] font-medium">{t("Season windows used by the scoring engine")}</h2>
          <span className="kicker">{t("NASA POWER · derived")}</span>
        </div>
        <div className="mt-3">
          <SeasonTable seasons={payload.seasons} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Notice tone="info" title={t("What this dataset is")}> 
          {t(
            "NASA POWER distributes meteorology derived from assimilation models (MERRA-2) and satellite inputs on a coarse grid. The value for a point represents the model grid cell containing that point, not an on-farm measurement."
          )}
        </Notice>
        <Notice tone="warn" title={t("What it cannot tell you")}> 
          {t(
            "No field-level soil moisture, canopy condition or yield is inferred. Root-zone wetness is a land-surface model output, and no future climate projection is produced here."
          )}
        </Notice>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/demo/compare"
          search={{ place, lat, lon }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-[12.5px] font-medium text-primary-foreground"
        >
          <BarChart3 className="h-3.5 w-3.5" /> {t("Compare rotations next")}
        </Link>
      </div>
    </div>
  );
}