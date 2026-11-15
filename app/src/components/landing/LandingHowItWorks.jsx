import { MapPin, Satellite, SlidersHorizontal, BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const STEPS = [
  {
    icon: MapPin,
    title: "Describe the farm point",
    text: "Any location in India: latitude and longitude, area, and the soil texture, pH and organic carbon you can measure or estimate. Entered values are yours; nothing is inferred.",
  },
  {
    icon: Satellite,
    title: "Load its climate record",
    text: "The app requests the NASA POWER daily point API for that grid cell and stores the response with its exact URL, units, date range and coverage — so a score can always be traced back.",
  },
  {
    icon: SlidersHorizontal,
    title: "Build and weight the rotation",
    text: "Assign crops to each year and season, then set how much soil, water, climate and diversity should count. Inconsistent weights or a missing crop are caught before scoring.",
  },
  {
    icon: BarChart3,
    title: "Compare and explain",
    text: "Read the dimension scores, per-season totals, confidence and the list of missing inputs. Compare at least three rotations side by side, then have the advisor restate the results.",
  },
];

export default function LandingHowItWorks() {
  const { t } = useI18n();

  return (
    <section id="how" className="border-y border-border/70 bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="kicker">{t("How it works")}</p>
        <h2 className="mt-2 max-w-xl text-[25px] font-medium leading-tight sm:text-[31px]">
          {t("From a coordinate to a comparison in four steps.")}
        </h2>

        <ol className="mt-8 grid gap-3.5 md:grid-cols-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="panel flex gap-3.5 p-5">
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <span className="metric flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[11.5px] text-primary-foreground">
                    0{index + 1}
                  </span>
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.9} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-medium">{t(step.title)}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{t(step.text)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}