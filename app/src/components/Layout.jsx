import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sprout,
  LayoutDashboard,
  MapPin,
  BookOpen,
  Satellite,
  SlidersHorizontal,
  BarChart3,
  Sparkles,
  Info,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/farm", label: "Farm setup", icon: MapPin },
  { to: "/crops", label: "Crop library", icon: BookOpen },
  { to: "/climate", label: "NASA climate", icon: Satellite },
  { to: "/simulator", label: "Rotation simulator", icon: SlidersHorizontal },
  { to: "/compare", label: "Comparison", icon: BarChart3 },
  { to: "/advisor", label: "AI advisor", icon: Sparkles },
  { to: "/method", label: "Method & limits", icon: Info },
];

function NavLinks({ onNavigate }) {
  const { t } = useI18n();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: item.exact }}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            activeProps={{
              className:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm",
            }}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
            {t(item.label)}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  const { t } = useI18n();
  return (
    <Link to="/" className="flex items-center gap-3 px-1 py-1">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Sprout className="h-5 w-5" strokeWidth={1.9} />
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-[15px] font-semibold tracking-tight">TerraShift AI</span>
        <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
          {t("Rotation lab")}
        </span>
      </span>
    </Link>
  );
}

function SidebarFooter() {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/40 p-3">
      <p className="kicker">{t("Pilot region")}</p>
      <p className="mt-1 text-[12.5px] font-medium leading-snug">{t("Harohalli, Karnataka, India")}</p>
      <p className="mt-2 border-t border-border/60 pt-2 text-[11px] leading-relaxed text-muted-foreground">
        {t(
          "Hackathon prototype · NASA Space Apps 2026 “Field Shift”. Scores are scenario comparisons, not validated agronomic advice."
        )}
      </p>
    </div>
  );
}

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r border-border/70 bg-card/50 px-4 py-6 backdrop-blur lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto scrollbar-slim">
          <p className="kicker mb-2 px-3">{t("Workspace")}</p>
          <NavLinks />
        </div>
        <LanguageSwitcher />
        <div className="rounded-xl border border-border/70 bg-card/60 p-3">
          <p className="truncate text-[11px] text-muted-foreground">{user?.email || t("Signed in")}</p>
          <button type="button" onClick={logout} className="mt-2 inline-flex items-center gap-2 text-[12px] font-medium text-foreground hover:text-primary">
            <LogOut className="h-3.5 w-3.5" /> {t("Sign out")}
          </button>
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur">
          <Brand />
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <button type="button" onClick={logout} aria-label={t("Sign out")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card/70">
              <LogOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={open ? t("Close menu") : t("Open menu")}
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card/70"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>
        {open && (
          <div className="border-b border-border/70 bg-card/95 px-4 py-4 backdrop-blur">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>

      <main className="min-w-0 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-9">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
        <footer className="mx-auto mt-14 w-full max-w-6xl border-t border-border/70 pt-5 text-[11.5px] leading-relaxed text-muted-foreground">
          {t(
            "Climate inputs: NASA POWER daily point API (MERRA-2 based, modelled/satellite-derived — not on-farm measurement). Soil and crop parameters are demo inputs unless replaced. No yield predictions are made."
          )}
        </footer>
      </main>
    </div>
  );
}