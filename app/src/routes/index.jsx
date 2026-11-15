import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingAbout from "@/components/landing/LandingAbout";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingData from "@/components/landing/LandingData";
import LandingFooter from "@/components/landing/LandingFooter";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TerraShift AI | Climate-Smart Agriculture" },
      {
        name: "description",
        content:
          "TerraShift AI helps explore climate-smart agricultural adaptation strategies across India using NASA Earth observation data, climate analysis, soil parameters, and crop rotation scenario comparisons.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "TerraShift AI | Climate-Smart Agriculture" },
      {
        property: "og:description",
        content:
          "Explore climate-smart crop rotation scenarios for any point in India, built on NASA POWER climate data, farm soil inputs and a documented deterministic scoring engine.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TerraShift AI | Climate-Smart Agriculture" },
      {
        name: "twitter:description",
        content:
          "NASA Earth observation data, climate analysis and crop rotation scenario comparisons for climate-smart agriculture across India.",
      },
    ],
  }),
  component: LandingPage,
});

function ClosingCta() {
  const { t } = useI18n();
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="panel flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="max-w-lg">
          <h2 className="text-[20px] font-medium leading-snug sm:text-[24px]">
            {t("Try the demo, then run it on your own farm point.")}
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {t(
              "The demo is read-only and uses sample data. A free account gives you a private workspace: your farms, your climate requests, your saved rotations."
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Play className="h-3.5 w-3.5" /> {t("Explore demo")}
          </Link>
          <Link
            to="/register"
            search={{ returnTo: "/dashboard" }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-secondary/60"
          >
            {t("Create account")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingAbout />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingData />
        <ClosingCta />
      </main>
      <LandingFooter />
    </div>
  );
}