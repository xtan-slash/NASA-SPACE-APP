import { Satellite, Repeat, Droplets, SlidersHorizontal, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const FEATURES = [
  {
    icon: Satellite,
    title: "Climate analysis",
    text: "Live NASA POWER daily point requests for the farm coordinates: rainfall, temperature, heat days, heavy-rain days and root-zone wetness, summarised by month and by season.",
  },
  {
    icon: Repeat,
    title: "Crop rotation comparison",
    text: "Build multi-year, multi-season sequences from the crop library and compare them on identical inputs, weights and climate windows.",
  },
  {
    icon: Droplets,
    title: "Soil and water assessment",
    text: "pH, texture and organic carbon are scored against each crop's requirements, while seasonal rainfall and assumed irrigation are checked against crop water demand.",
  },
  {
    icon: SlidersHorizontal,
    title: "Scenario simulation",
    text: "Adjust the four dimension weights and watch the scores, per-season totals and confidence change — instantly and deterministically, in the browser.",
  },
  {
    icon: Sparkles,
    title: "AI-powered explanations",
    text: "The advisor restates the numbers the engine already computed, names the weakest dimension and the data gaps. It never invents a figure.",
  },
];

export default function LandingFeatures() {
  const { t } = useI18n();

  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <p className="kicker">{t("What the prototype does")}</p>
      <h2 className="mt-2 max-w-xl text-[25px] font-medium leading-tight sm:text-[31px]">
        {t("Five pieces that make a rotation decision checkable.")}
      </h2>

      <div className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className={
                index === 0
                  ? "panel p-5 sm:col-span-2 lg:col-span-1"
                  : "panel p-5"
              }
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <h3 className="mt-3.5 text-[15px] font-medium">{t(feature.title)}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{t(feature.text)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}