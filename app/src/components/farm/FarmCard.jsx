import { Button } from "@/components/ui/button";
import { MapPin, Pencil, Trash2, Check } from "lucide-react";
import { PRIORITY_LABEL, TEXTURE_LABEL, IRRIGATION_LABEL } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

export default function FarmCard({ farm, active, onActivate, onEdit, onDelete }) {
  const { t } = useI18n();
  return (
    <div
      className={
        active
          ? "panel border-primary/40 p-4 ring-1 ring-primary/15"
          : "panel p-4 transition-shadow hover:shadow-md"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.9} />
            <p className="truncate text-[14px] font-medium">{farm.name}</p>
            {farm.is_demo && <span className="chip shrink-0">Demo</span>}
          </div>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {farm.district || t("District not set")} · {farm.area_ha ? `${farm.area_ha} ha` : t("area not set")}
          </p>
        </div>
        {active && (
          <span className="chip border-primary/30 bg-primary/10 text-primary">
            <Check className="h-3 w-3" /> {t("Active")}
          </span>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11.5px]">
        <div>
          <dt className="text-muted-foreground">{t("Coordinates")}</dt>
          <dd className="metric">
            {farm.latitude?.toFixed?.(3) ?? "—"}, {farm.longitude?.toFixed?.(3) ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("Texture")}</dt>
          <dd>{t(TEXTURE_LABEL[farm.soil_texture] || "not entered")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">pH</dt>
          <dd className="metric">{farm.soil_ph ?? t("not entered")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("Organic carbon")}</dt>
          <dd className="metric">
            {farm.soil_organic_carbon != null ? `${farm.soil_organic_carbon} %` : t("not entered")}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">{t("Irrigation")}</dt>
          <dd>{t(IRRIGATION_LABEL[farm.irrigation] || "not set")}</dd>
        </div>
      </dl>

      {farm.priorities?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {farm.priorities.map((p) => (
            <span key={p} className="chip py-0.5 text-[10.5px]">
              {t(PRIORITY_LABEL[p] || p)}
            </span>
          ))}
        </div>
      )}

      {farm.soil_source && (
        <p className="mt-3 border-t border-border/60 pt-2 text-[10.5px] leading-relaxed text-muted-foreground">
          {t("Soil source:")} {farm.soil_source}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {!active && (
          <Button size="sm" variant="secondary" className="h-8 text-[11.5px]" onClick={onActivate}>
            {t("Use this farm")}
          </Button>
        )}
        <Button size="sm" variant="ghost" className="h-8 text-[11.5px]" onClick={onEdit}>
          <Pencil className="mr-1.5 h-3 w-3" /> {t("Edit")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-[11.5px] text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="mr-1.5 h-3 w-3" /> {t("Delete")}
        </Button>
      </div>
    </div>
  );
}