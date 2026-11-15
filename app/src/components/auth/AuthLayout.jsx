// Full-screen card shared by the auth pages; it sets its own color tokens so it stays readable under any theme.
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const { t } = useI18n();
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
      <div className="absolute right-4 top-4"><LanguageSwitcher compact /></div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Icon className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t(title)}</h1>
          {subtitle && <p className="mt-2 text-muted-foreground">{t(subtitle)}</p>}
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">{children}</div>
        {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{typeof footer === "string" ? t(footer) : footer}</p>}
      </div>
    </div>
  );
}