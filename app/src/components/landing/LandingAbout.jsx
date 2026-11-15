import { Sprout } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const FACTS = [
  { value: "2020–2025", label: "NASA POWER window" },
  { value: "8", label: "Daily parameters" },
  { value: "4", label: "Scoring dimensions" },
  { value: "0–100", label: "Score scale" },
];

export default function LandingAbout() {
  const { t } = useI18n();

  return (
    <section className="border-y border-border/70 bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:gap-14 lg:px-8">
        <div>
          <p className="kicker">{t("The project")}</p>
          <h2 className="mt-2 max-w-lg text-[25px] font-medium leading-tight sm:text-[30px]">
            {t("A scenario lab for adaptation decisions, not a yield forecast.")}
          </h2>
          <div className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-muted-foreground">
            <p>
              {t(
                "Farmers and extension advisors face a moving baseline: rainfall that arrives in shorter, heavier spells, hotter rabi nights, and soils whose organic carbon has been drawn down by continuous cereal cropping."
              )}
            </p>
            <p>
              {t(
                "TerraShift AI does not predict what a field will yield. It makes the comparison explicit: choose a point, read the climate record NASA already publishes for it, describe the soil you have, and score alternative multi-year rotations against those inputs — so options can be discussed with evidence instead of intuition."
              )}
            </p>
            <p>
              {t(
                "The private workspace requests NASA POWER data for your saved coordinates, subject to the service's publication delay. The public demo uses a fixed recorded 2020–2025 NASA POWER sample. The private advisor uses generative AI to explain server-recomputed evidence; the public demo advisor uses deterministic rules. Neither explanation changes the score."
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 self-start">
          {FACTS.map((fact) => (
            <div key={fact.label} className="panel p-4">
              <p className="metric text-[22px] leading-none">{fact.value}</p>
              <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{t(fact.label)}</p>
            </div>
          ))}
          <div className="panel-flat col-span-2 flex items-start gap-2.5 p-3.5">
            <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.9} />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t(
                "Built for the NASA Space Apps Challenge 2026 “Field Shift” brief: open data, open method, and honest limits."
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}