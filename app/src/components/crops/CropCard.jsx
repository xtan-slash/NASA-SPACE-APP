import { Pencil, Trash2, Droplets, Thermometer, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROTATION_ROLES, SEASON_BY_VALUE, TEXTURE_LABEL } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

const ROLE_LABEL = Object.fromEntries(ROTATION_ROLES.map((r) => [r.value, r.label]));

export default function CropCard({ crop, onEdit, onDelete }) {
  const { t } = useI18n();
  return (
    <div className="panel flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-medium leading-tight">{crop.name}</p>
          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
            {crop.local_name || crop.family || "—"}
          </p>
        </div>
        {crop.is_demo && <span className="chip shrink-0 py-0.5 text-[10px]">{t("Demo")}</span>}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className="chip py-0.5 text-[10.5px]">{t(ROLE_LABEL[crop.rotation_role] || "Role not set")}</span>
        <span className="chip py-0.5 text-[10.5px]">
          {t(SEASON_BY_VALUE[crop.season]?.label || "Season not set")}
        </span>
        {crop.n_fixing && <span className="chip border-primary/30 bg-primary/10 py-0.5 text-[10.5px] text-primary">N-fixing</span>}
      </div>

      <dl className="mt-3 space-y-1.5 text-[11.5px]">
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Droplets className="h-3 w-3" /> {t("Water demand")}
          </dt>
          <dd className="metric">{crop.water_need_mm} mm</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <FlaskConical className="h-3 w-3" /> {t("pH range")}
          </dt>
          <dd className="metric">
            {crop.ph_min}–{crop.ph_max}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Thermometer className="h-3 w-3" /> {t("Optimum mean")}
          </dt>
          <dd className="metric">
            {crop.temp_opt_min ?? "—"}–{crop.temp_opt_max ?? "—"} °C
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">{t("Organic-carbon demand")}</dt>
          <dd className="capitalize">{crop.oc_need || "—"}</dd>
        </div>
      </dl>

      <div className="mt-2.5 flex flex-wrap gap-1">
        {(crop.texture_preferred || []).map((tex) => (
          <span key={`p-${tex}`} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
            {t(TEXTURE_LABEL[tex] || tex)}
          </span>
        ))}
        {(crop.texture_marginal || []).map((tex) => (
          <span key={`m-${tex}`} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {t(TEXTURE_LABEL[tex] || tex)} ({t("marginal")})
          </span>
        ))}
      </div>

      {crop.source_note && (
        <p className="mt-3 border-t border-border/60 pt-2 text-[10.5px] leading-relaxed text-muted-foreground">
          {crop.source_note}
        </p>
      )}

      <div className="mt-auto flex gap-1.5 pt-3">
        <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={onEdit}>
          <Pencil className="mr-1.5 h-3 w-3" /> {t("Edit")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-[11px] text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="mr-1.5 h-3 w-3" /> {t("Delete")}
        </Button>
      </div>
    </div>
  );
}