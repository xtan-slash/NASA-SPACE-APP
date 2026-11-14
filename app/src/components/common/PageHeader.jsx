import { useI18n } from "@/lib/i18n";

export default function PageHeader({ kicker, title, description, actions, children }) {
  const { t } = useI18n();

  return (
    <header className="border-b border-border/70 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {kicker && <p className="kicker">{t(kicker)}</p>}
          <h1 className="mt-1.5 text-[26px] font-medium leading-tight sm:text-[31px]">{t(title)}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">{t(description)}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}