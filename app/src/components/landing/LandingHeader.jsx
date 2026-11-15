import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#data", label: "Data & limits" },
];

export default function LandingHeader() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-4 w-4" strokeWidth={1.9} />
          </span>
          <span className="leading-tight">
            <span className="block font-heading text-[15px] font-semibold tracking-tight">TerraShift AI</span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
              {t("Climate-smart agriculture")}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.label)}
            </a>
          ))}
          <Link to="/demo" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("Demo")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher compact />
          </div>
          <Link
            to="/login"
            search={{ returnTo: "/dashboard" }}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-secondary/60"
          >
            {t("Sign in")}
          </Link>
          <Link
            to="/register"
            search={{ returnTo: "/dashboard" }}
            className="rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("Create account")}
          </Link>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-2 sm:hidden">
        <LanguageSwitcher compact />
      </div>
    </header>
  );
}