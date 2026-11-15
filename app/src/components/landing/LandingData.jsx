import { Info, Satellite, AlertTriangle, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ITEMS = [
  {
    icon: Satellite,
    title: "NASA POWER Daily Point data",
    text: "Climate values come from the NASA POWER daily point API (agroclimatology community) for the grid cell containing the chosen coordinate. POWER distributes modelled and satellite-derived meteorology (MERRA-2 based); it is not a farm-level weather station or soil sensor.",
  },
  {
    icon: Info,
    title: "Root-zone wetness is model-derived",
    text: "The root-zone wetness parameter (GWETROOT) is a land-surface model output reported for the grid cell. It is never presented here as a measured field soil-moisture value.",
  },
  {
    icon: AlertTriangle,
    title: "Historical record, not a climate forecast",
    text: "The 2020–2025 POWER window is used as historical seasonal context for hypothetical future rotation sequences. The app makes no climate projection, no weather forecast and no yield, income or profit prediction.",
  },
  {
    icon: ShieldCheck,
    title: "Scores are heuristic comparisons",
    text: "Each rotation receives a transparent 0–100 score on soil, water, climate and diversity. Higher is not “recommended”: it means the sequence fits the inputs you entered better under the stated assumptions.",
  },
];

export default function LandingData() {
  const { t } = useI18n();

  return (
    <section id="data" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
        <div>
          <p className="kicker">{t("Data & limits")}</p>
          <h2 className="mt-2 text-[25px] font-medium leading-tight sm:text-[31px]">
            {t("Where the numbers come from — and what they are not.")}
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(
              "TerraShift AI is a hackathon prototype. It uses one openly documented NASA dataset plus inputs a farmer or advisor enters themselves, and it says so on every screen."
            )}
          </p>
          <div className="panel-flat mt-4 p-3.5">
            <p className="kicker">{t("Not integrated, not claimed")}</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
              {t(
                "SMAP soil moisture, MODIS vegetation indices and national soil survey polygons are listed as planned integrations. They are deliberately absent until they are actually implemented."
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="panel p-4">
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.9} />
                  <h3 className="text-[13px] font-medium leading-snug">{t(item.title)}</h3>
                </span>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{t(item.text)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}