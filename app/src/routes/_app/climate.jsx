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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveFarm, useFarms, useSnapshots, parseSnapshot } from "@/lib/data";
import { loadClimateSnapshot } from "@/lib/server-fns";
import { POWER_PARAMS } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/climate")({
  head: () => ({
    meta: [
      { title: "NASA climate data · TerraShift AI" },
      { name: "description", content: "Live NASA POWER daily point data for the farm location, with units, requested dates, coverage and retrieval provenance." },
    ],
  }),
  component: ClimatePage,
});

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

function ClimatePage() {
  const { t } = useI18n();
  const { farms, loading: farmsLoading } = useFarms();
  const { farm, ready } = useActiveFarm(farms, farmsLoading);
  const { latest, reload } = useSnapshots(farm?.id);
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2025);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);
  const [snapshotMeta, setSnapshotMeta] = useState(null);
  const autoTried = useRef(null);
  const run = useServerFn(loadClimateSnapshot);

  useEffect(() => {
    setPayload(parseSnapshot(latest));
    setSnapshotMeta(latest || null);
  }, [latest]);

  const fetchData = useCallback(async () => {
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
          startDate: `${startYear}0101`,
          endDate: `${endYear}1231`,
        },
      });
      if (!res?.ok) {
        setError(res?.error || "The NASA POWER request failed.");
        return;
      }
      setPayload(res.snapshot.payload);
      setSnapshotMeta(res.snapshot);
      await reload();
      toast.success("NASA POWER data loaded");
    } catch (err) {
      setError(err?.message || "The NASA POWER request failed.");
    } finally {
      setLoading(false);
    }
  }, [farm, run, startYear, endYear, reload]);

  // Load once automatically so the first visit is not an empty page.
  useEffect(() => {
    if (!ready || !farm || latest || loading) return;
    if (autoTried.current === farm.id) return;
    autoTried.current = farm.id;
    fetchData();
  }, [ready, farm, latest, loading, fetchData]);

  if (!farmsLoading && farms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader kicker="Step 3 · Earth observation" title="NASA climate data" />
        <Notice tone="warn" title="Add a farm first">
          NASA POWER is queried for a point, so the prototype needs a farm location.{" "}
          <Link to="/farm" className="font-medium text-primary hover:underline">
            Set up a farm →
          </Link>
        </Notice>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Step 3 · Earth observation"
        title="NASA climate data"
        description="Daily point data from the NASA POWER API for this farm's coordinates. Every number on this page is returned by the API for the requested window and reported with its units, coverage and retrieval time."
        actions={
          <>
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-1">
              <span className="pl-1 text-[10.5px] uppercase tracking-wider text-muted-foreground">{t("From")}</span>
              <Select value={String(startYear)} onValueChange={(v) => setStartYear(Number(v))}>
                <SelectTrigger className="h-7 w-[74px] border-0 px-1 text-[12px] shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)} disabled={y >= endYear}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{t("to")}</span>
              <Select value={String(endYear)} onValueChange={(v) => setEndYear(Number(v))}>
                <SelectTrigger className="h-7 w-[74px] border-0 px-1 text-[12px] shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)} disabled={y <= startYear}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchData} disabled={loading || !farm} className="gap-1.5">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {loading ? t("Requesting…") : payload ? t("Refresh from NASA") : t("Fetch from NASA")}
            </Button>
          </>
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

      {error && (
        <Notice tone="danger" title="NASA POWER request failed">
          {error} No substitute values are shown — the page stays empty rather than displaying invented data.
        </Notice>
      )}

      {loading && !payload && (
        <div className="panel flex items-center gap-3 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-[13px] font-medium">{t("Requesting daily point data")}</p>
            <p className="text-[11.5px] text-muted-foreground">
              8 parameters × {YEARS.includes(startYear) && YEARS.includes(endYear) ? (endYear - startYear + 1) * 365 : "—"}{" "}
              days from NASA POWER, then aggregating by month and season.
            </p>
          </div>
        </div>
      )}

      {!payload && !loading && (
        <div className="panel p-5">
          <h2 className="text-[16px] font-medium">{t("What will be requested")}</h2>
          <p className="prose-note mt-1">
            The AG (agroclimatology) community daily point endpoint for this farm's coordinates. Nothing is
            pre-baked into the prototype — the table fills in from the live response.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {POWER_PARAMS.map((p) => (
              <div
                key={p.code}
                className="flex items-baseline justify-between gap-3 rounded-lg border border-border/70 bg-secondary/30 px-3 py-2"
              >
                <div>
                  <p className="metric text-[12px] font-medium">{p.code}</p>
                  <p className="text-[10.5px] text-muted-foreground">{p.label}</p>
                </div>
                <span className="metric text-[11px] text-muted-foreground">{p.unit}</span>
              </div>
            ))}
          </div>
          <Button className="mt-4 gap-1.5" onClick={fetchData} disabled={loading || !farm}>
            <RefreshCw className="h-3.5 w-3.5" /> {t("Fetch from NASA POWER")}
          </Button>
        </div>
      )}

      {payload && (
        <>
          <SnapshotManifest snapshot={snapshotMeta} payload={payload} />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[15px] font-medium">{t("Monthly climatology")}</h2>
                <span className="kicker">mm · °C</span>
              </div>
              <p className="prose-note mt-1">
                Mean monthly rainfall total and mean daily temperature across {payload.years_covered} years.
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
                Annual rainfall and the count of days with maximum temperature at or above 35 °C.
              </p>
              <div className="mt-3">
                <AnnualClimateChart annual={payload.annual} />
              </div>
            </div>
          </div>

          <div className="panel p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-medium">{t("Season windows used by the scoring engine")}</h2>
              <span className="kicker">NASA POWER · derived</span>
            </div>
            <div className="mt-3">
              <SeasonTable seasons={payload.seasons} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Notice tone="info" title="What this dataset is">
              NASA POWER distributes meteorology derived from assimilation models (MERRA-2) and satellite
              inputs on a coarse grid. It is not a farm measurement, and the value for a point represents the
              model grid cell containing that point.
            </Notice>
            <Notice tone="warn" title="What it cannot tell you">
              No field-level soil moisture, canopy condition or yield is inferred here. SMAP soil moisture and
              MODIS vegetation indices are listed as planned integrations and are deliberately not shown until
              they are actually implemented.
            </Notice>
          </div>

          <div className="panel-flat flex items-start gap-3 p-4">
            <Layers className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="text-[11.5px] leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">{t("Planned, not implemented")}</p>
              <p className="mt-0.5">
                SMAP root-zone soil moisture (L-band radiometer) · MODIS NDVI / evapotranspiration · soil
                survey polygons from a national soil information system. These would add field-scale evidence;
                until then the app relies on POWER plus the soil values you enter yourself.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}