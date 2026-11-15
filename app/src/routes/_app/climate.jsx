import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Satellite, Loader2, RefreshCw, Layers } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import Notice from "@/components/common/Notice";
import MonthlyClimateChart from "@/components/climate/MonthlyClimateChart";
import AnnualClimateChart from "@/components/climate/AnnualClimateChart";
import SeasonTable from "@/components/climate/SeasonTable";
import SnapshotManifest from "@/components/climate/SnapshotManifest";
import RecentClimateMonitor from "@/components/climate/RecentClimateMonitor";
import { Button } from "@/components/ui/button";
import { useActiveFarm, useFarms, useSnapshots, parseSnapshot } from "@/lib/data";
import { loadClimateSnapshot } from "@/lib/server-fns";
import { POWER_PARAMS } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/climate")({
  head: () => ({
    meta: [
      { title: "NASA climate data · TerraShift AI" },
      { name: "description", content: "Near-real-time and historical NASA POWER daily point data for the farm location, with units, coverage and retrieval provenance." },
    ],
  }),
  component: ClimatePage,
});

const WINDOWS = [
  { value: "recent_30d", label: "30 days", group: "recent" },
  { value: "recent_90d", label: "90 days", group: "recent" },
  { value: "historical_5y", label: "5 years", group: "historical" },
  { value: "historical_10y", label: "10 years", group: "historical" },
];

function ClimatePage() {
  const { t } = useI18n();
  const { farms, loading: farmsLoading } = useFarms();
  const { farm, ready } = useActiveFarm(farms, farmsLoading);
  const { snapshots, reload } = useSnapshots(farm?.id);
  const [viewMode, setViewMode] = useState("recent_30d");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);
  const [snapshotMeta, setSnapshotMeta] = useState(null);
  const autoTried = useRef(new Set());
  const run = useServerFn(loadClimateSnapshot);

  const selectedSnapshot = snapshots.find((item) => item.status === "ready" && item.data_mode === viewMode) || null;

  useEffect(() => {
    if (selectedSnapshot) {
      setPayload(parseSnapshot(selectedSnapshot));
      setSnapshotMeta(selectedSnapshot);
    } else {
      setPayload(null);
      setSnapshotMeta(null);
    }
  }, [selectedSnapshot]);

  const fetchData = useCallback(async (mode = viewMode, forceRefresh = false) => {
    if (!farm) return;
    setLoading(true);
    setError(null);
    try {
      const res = await run({
        data: {
          farmId: farm.id,
          locationLabel: farm.name,
          latitude: Number(farm.latitude),
          longitude: Number(farm.longitude),
          dataMode: mode,
          forceRefresh,
        },
      });
      if (!res?.ok) {
        setError(res?.error || "The NASA POWER request failed.");
        return;
      }
      setPayload(res.snapshot.payload);
      setSnapshotMeta(res.snapshot);
      await reload();
      toast.success(t("NASA POWER data loaded"));
    } catch (err) {
      setError(err?.message || "The NASA POWER request failed.");
    } finally {
      setLoading(false);
    }
  }, [farm, run, viewMode, reload, t]);

  useEffect(() => {
    if (!ready || !farm || loading || selectedSnapshot) return;
    const key = farm.id + ":" + viewMode;
    if (autoTried.current.has(key)) return;
    autoTried.current.add(key);
    fetchData(viewMode);
  }, [ready, farm, loading, selectedSnapshot, viewMode, fetchData]);

  if (!farmsLoading && farms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader kicker="Step 3 · Earth observation" title={t("NASA climate data")} />
        <Notice tone="warn" title={t("Add a farm first")}>
          {t("NASA POWER is queried for a point, so the prototype needs a farm location.")}{" "}
          <Link to="/farm" className="font-medium text-primary hover:underline">
            {t("Set up a farm")} →
          </Link>
        </Notice>
      </div>
    );
  }

  const isRecent = viewMode.startsWith("recent_");

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={t("Step 3 · Earth observation")}
        title={t("NASA climate data")}
        description={t("Explore near-real-time climate monitoring alongside multi-year historical context for this farm's NASA POWER grid point.")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {WINDOWS.map((window) => (
              <Button
                key={window.value}
                size="sm"
                variant={viewMode === window.value ? "default" : "outline"}
                onClick={() => setViewMode(window.value)}
                disabled={loading}
              >
                {t(window.label)}
              </Button>
            ))}
            <Button onClick={() => fetchData(viewMode, true)} disabled={loading || !farm} className="gap-1.5">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {loading ? t("Requesting…") : t("Refresh from NASA")}
            </Button>
          </div>
        }
      >
        {farm && (
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <Satellite className="h-3.5 w-3.5" />
            {farm.name} · {Number(farm.latitude).toFixed(3)}, {Number(farm.longitude).toFixed(3)} ·{" "}
            <a
              href="https://power.larc.nasa.gov/data-access-viewer/"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              power.larc.nasa.gov
            </a>
          </p>
        )}
      </PageHeader>

      <Notice tone="info" title={t("Near-real-time, not instant live data")}>
        {t("NASA POWER is a gridded data service with publication delays. Recent windows end seven days before the current date, and the latest valid date can differ by parameter. This is not a field sensor or weather forecast.")}
      </Notice>

      {error && (
        <Notice tone="danger" title={t("NASA POWER request failed")}>
          {error} {t("No substitute values are shown.")}
        </Notice>
      )}

      {loading && !payload && (
        <div className="panel flex items-center gap-3 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-[13px] font-medium">{t("Requesting daily point data")}</p>
            <p className="text-[11.5px] text-muted-foreground">
              {isRecent ? t("Loading recent daily climate values.") : t("Loading complete historical calendar years.")}
            </p>
          </div>
        </div>
      )}

      {!payload && !loading && (
        <div className="panel p-5">
          <h2 className="text-[16px] font-medium">{t("What will be requested")}</h2>
          <p className="prose-note mt-1">
            {t("The AG (agroclimatology) community daily point endpoint for this farm's coordinates. Missing values remain gaps and are not interpolated.")}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {POWER_PARAMS.map((p) => (
              <div key={p.code} className="flex items-baseline justify-between gap-3 rounded-lg border border-border/70 bg-secondary/30 px-3 py-2">
                <div>
                  <p className="metric text-[12px] font-medium">{p.code}</p>
                  <p className="text-[10.5px] text-muted-foreground">{t(p.label)}</p>
                </div>
                <span className="metric text-[11px] text-muted-foreground">{p.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {payload && (
        <>
          <SnapshotManifest snapshot={snapshotMeta} payload={payload} />
          {isRecent ? (
            <RecentClimateMonitor payload={payload} />
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="panel p-4">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-[15px] font-medium">{t("Monthly climatology")}</h2>
                    <span className="kicker">mm · °C</span>
                  </div>
                  <p className="prose-note mt-1">
                    {t("Mean monthly rainfall total and mean daily temperature across")} {payload.years_covered} {t("years")}.
                  </p>
                  <div className="mt-3"><MonthlyClimateChart monthly={payload.monthly} /></div>
                </div>
                <div className="panel p-4">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-[15px] font-medium">{t("Year by year")}</h2>
                    <span className="kicker">mm · days</span>
                  </div>
                  <p className="prose-note mt-1">{t("Annual rainfall and the count of days with maximum temperature at or above 35 °C.")}</p>
                  <div className="mt-3"><AnnualClimateChart annual={payload.annual} /></div>
                </div>
              </div>

              <div className="panel p-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[15px] font-medium">{t("Season windows used by the scoring engine")}</h2>
                  <span className="kicker">NASA POWER · derived</span>
                </div>
                <div className="mt-3"><SeasonTable seasons={payload.seasons} /></div>
              </div>
            </>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Notice tone="info" title={t("What this dataset is")}>
              {t("NASA POWER distributes meteorology derived from assimilation models and satellite inputs on a coarse grid. It is not a farm measurement, and the value for a point represents the model grid cell containing that point.")}
            </Notice>
            <Notice tone="warn" title={t("What it cannot tell you")}>
              {t("No field-level soil moisture, canopy condition or yield is inferred here. GWETROOT is model-derived root-zone wetness, not a field measurement.")}
            </Notice>
          </div>

          <div className="panel-flat flex items-start gap-3 p-4">
            <Layers className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="text-[11.5px] leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">{t("Planned, not implemented")}</p>
              <p className="mt-0.5">
                {t("SMAP root-zone soil moisture, MODIS NDVI / evapotranspiration and national soil survey polygons are planned integrations. Until implemented, the app relies on POWER plus the soil values you enter yourself.")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}