import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import Notice from "@/components/common/Notice";
import CropCard from "@/components/crops/CropCard";
import CropDialog from "@/components/crops/CropDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCrops } from "@/lib/data";
import { ROTATION_ROLES, SEASONS } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/crops")({
  head: () => ({
    meta: [
      { title: "Crop library · TerraShift AI" },
      { name: "description", content: "Editable crop records: water demand, pH and temperature ranges, texture preferences and rotation role — every parameter the scoring engine uses." },
    ],
  }),
  component: CropsPage,
});

function CropsPage() {
  const { t } = useI18n();
  const { crops, loading, reload } = useCrops();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState("all");
  const [role, setRole] = useState("all");
  const [dialog, setDialog] = useState({ open: false, crop: null });
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return crops.filter((c) => {
      const matchesQuery =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.local_name?.toLowerCase().includes(q) ||
        c.family?.toLowerCase().includes(q);
      const matchesSeason = season === "all" || c.season === season;
      const matchesRole = role === "all" || c.rotation_role === role;
      return matchesQuery && matchesSeason && matchesRole;
    });
  }, [crops, query, season, role]);

  const remove = async () => {
    if (!confirm) return;
    try {
      if (!confirm.user_crop_id) {
        toast.error("Shared master crops cannot be deleted. You can customise a personal copy instead.");
        setConfirm(null);
        return;
      }
      await base44.entities.UserCrop.delete(confirm.user_crop_id);
      toast.success("Your personal crop record was deleted");
      setConfirm(null);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Could not delete the crop.");
    }
  };

  const demoCount = crops.filter((c) => c.is_demo).length;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Step 2 · Parameters"
        title="Crop library"
        description="Browse the shared master crop catalogue and create personal copies. Any changes you make are private to your account and do not alter the shared catalogue."
        actions={
          <Button className="gap-1.5" onClick={() => setDialog({ open: true, crop: null })}>
            <Plus className="h-3.5 w-3.5" /> {t("New crop")}
          </Button>
        }
      />

      <Notice tone="info" title={`${demoCount} of ${crops.length} records still contain illustrative scoring inputs`}>
        Published references are shown separately from scoring inputs. A TNAU field-crop guide provides a tomato soil pH and texture reference; other crop-specific pH, temperature and texture inputs remain illustrative where a suitable source has not been verified. None of these published references are substituted into the scoring model.
      </Notice>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Search by name, local name or family")}
            className="pl-9"
          />
        </div>
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All seasons")}</SelectItem>
            {SEASONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {t(s.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All roles")}</SelectItem>
            {ROTATION_ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {t(r.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading crop library…")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-[14px] font-medium">{t("No crop records match")}</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {t("Adjust the filters, or add a crop with your own parameter values.")}
          </p>
          <Button className="mt-4 gap-1.5" onClick={() => setDialog({ open: true, crop: null })}>
            <Plus className="h-3.5 w-3.5" /> {t("New crop")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onEdit={() => setDialog({ open: true, crop })}
              onDelete={() => setConfirm(crop)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4 text-[12px] text-muted-foreground">
        <span>
          {filtered.length} crop{filtered.length === 1 ? "" : "s"} shown
        </span>
        <span className="text-border">|</span>
        <button
          className="font-medium text-primary hover:underline"
          onClick={() => navigate({ to: "/simulator" })}
        >
          {t("Build a rotation with these crops →")}
        </button>
      </div>

      {dialog.open && (
        <CropDialog
          key={dialog.crop?.id || "new"}
          open={dialog.open}
          crop={dialog.crop}
          onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
          onSaved={reload}
        />
      )}

      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{confirm?.name}”?</DialogTitle>
            <DialogDescription>
              Seasons in saved scenarios that use this crop will be flagged as unresolved when scored.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              {t("Keep crop")}
            </Button>
            <Button variant="destructive" onClick={remove}>
              {t("Delete crop")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}