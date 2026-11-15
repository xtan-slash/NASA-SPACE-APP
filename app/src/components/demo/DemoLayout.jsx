import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, FlaskConical, Sprout } from "lucide-react";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const DEMO_NAV = [
  { to: "/demo", label: "Overview", exact: true },
  { to: "/demo/climate", label: "Climate" },
  { to: "/demo/compare", label: "Comparison" },
  { to: "/demo/advisor", label: "AI advisor" },
  { to: "/demo/judge", label: "Judge Mode" },
];

export default function DemoLayout({ children }) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const search = useRouterState({ select: (state) => state.location.search });

  return (
    <div className="min-h-screen">
      <div className="bg-accent/15 px-4 py-2 text-center text-[11px] font-medium tracking-wide text-foreground/80">
        {t("Demonstration Data — a sample farm, sample crops and a recorded NASA POWER summary. Read-only: no real records are shown or changed.")}
      </div>

      <header className="border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sprout className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="font-heading text-[15px] font-semibold tracking-tight">TerraShift AI</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.1em] text-foreground/70">
              <FlaskConical className="h-3 w-3" /> {t("Demo")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <LanguageSwitcher compact />
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-secondary/60"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("Public site")}
            </Link>
            <Link
              to="/login"
              search={{ returnTo: "/dashboard" }}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-secondary/60"
            >
              {t("Sign in")}
            </Link>
            <Link
              to="/register"
              search={{ returnTo: "/dashboard" }}
              className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("Create account")}
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-2 sm:px-6 lg:px-8">
          <nav className="-mx-1 flex gap-1 overflow-x-auto scrollbar-slim">
            {DEMO_NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  search={search}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  )}
                >
                  {t(item.label)}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-border/60 px-4 py-2 sm:hidden">
          <LanguageSwitcher compact />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}