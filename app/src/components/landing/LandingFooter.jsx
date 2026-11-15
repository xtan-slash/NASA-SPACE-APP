import { Link } from "@tanstack/react-router";
import { ExternalLink, Sprout } from "lucide-react";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export default function LandingFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/70 bg-card/50">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sprout className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="font-heading text-[15px] font-semibold tracking-tight">TerraShift AI</span>
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
              {t(
                "An open prototype built for the NASA Space Apps Challenge 2026 “Field Shift” brief: climate-smart crop rotation scenarios with a documented, deterministic method."
              )}
            </p>
          </div>

          <nav>
            <p className="kicker">{t("Explore")}</p>
            <ul className="mt-3 space-y-2 text-[12px]">
              <li>
                <Link to="/demo" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t("Explore demo")}
                </Link>
              </li>
              <li>
                <Link to="/login" search={{ returnTo: "/dashboard" }} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t("Sign in")}
                </Link>
              </li>
              <li>
                <Link to="/register" search={{ returnTo: "/dashboard" }} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t("Create account")}
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t("Method & limits")}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="kicker">{t("Data sources")}</p>
            <ul className="mt-3 space-y-2 text-[12px]">
              <li>
                <a
                  href="https://power.larc.nasa.gov/data-access-viewer/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  NASA POWER daily point API
                  <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.spaceappschallenge.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  NASA International Space Apps Challenge
                  <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                </a>
              </li>
              <li className="text-muted-foreground">{t("Soil and crop parameters: user inputs (demo values by default)")}</li>
            </ul>
          </div>

          <div>
            <p className="kicker">{t("Limitations")}</p>
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
              {t(
                "Gridded climate values are not farm measurements. No yield, income, nutrient-balance or erosion model is included. Scores are comparative suitability indicators that assume the entered inputs are representative."
              )}
            </p>
            <div className="mt-3">
              <LanguageSwitcher compact />
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-1.5 border-t border-border/70 pt-4 text-[10.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("TerraShift AI · hackathon prototype · not an operational advisory service.")}</p>
          <p className="font-mono uppercase tracking-[0.12em]">{t("Deterministic engine · open method")}</p>
        </div>
      </div>
    </footer>
  );
}