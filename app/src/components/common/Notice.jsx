import { AlertTriangle, Info, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const TONES = {
  info: { icon: Info, box: "border-border/80 bg-secondary/50", iconClass: "text-muted-foreground" },
  warn: { icon: AlertTriangle, box: "border-accent/30 bg-accent/10", iconClass: "text-accent" },
  danger: { icon: ShieldAlert, box: "border-destructive/30 bg-destructive/10", iconClass: "text-destructive" },
  ok: { icon: CheckCircle2, box: "border-primary/25 bg-primary/5", iconClass: "text-primary" },
};

export default function Notice({ tone = "info", title, children, className }) {
  const config = TONES[tone] || TONES.info;
  const Icon = config.icon;
  const { t } = useI18n();
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border p-3.5", config.box, className)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.iconClass)} strokeWidth={1.9} />
      <div className="min-w-0 text-[12px] leading-relaxed">
        {title && <p className="font-semibold text-foreground">{t(title)}</p>}
        <div className={cn(title && "mt-0.5", "text-muted-foreground")}>{children}</div>
      </div>
    </div>
  );
}