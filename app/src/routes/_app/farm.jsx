import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import Notice from "@/components/common/Notice";
import FarmForm from "@/components/farm/FarmForm";
import FarmCard from "@/components/farm/FarmCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActiveFarm, useFarms } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/farm")({
  head: () => ({
    meta: [
      { title: "Farm setup · TerraShift AI" },
      { name: "description", content: "Record the farm location, soil inputs, irrigation status and farmer priorities used by the rotation scoring engine." },
    ],
  }),
  component: FarmPage,
});

function FarmPage() {
  const { t } = useI18n();
  const { farms, loading, reload } = useFarms();
  const { farm: activeFarm, setActiveFarm, ready } = useActiveFarm(farms, loading);
  const [editingId, setEditingId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    if (ready && !editingId) setEditingId(activeFarm?.id ?? "new");
  }, [ready, activeFarm?.id, editingId]);

  const editing = editingId === "new" ? null : farms.find((f) => f.id === editingId) || null;

  const handleSaved = async (saved) => {
    await reload();
    if (saved?.id) setActiveFarm(saved.id);
    setEditingId(saved?.id ?? "new");
  };

  const remove = async () => {
    if (!confirm) return;
    try {
      await base44.entities.Farm.delete(confirm.id);
      toast.success("Farm deleted");
      setConfirm(null);
      setEditingId("new");
      await reload();
    } catch (err) {
      toast.error(err?.message || "Could not delete the farm.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Step 1 · Inputs"
        title="Farm setup"
        description="Set up a farm anywhere in India. Its coordinates drive the NASA POWER point request; soil values drive the soil-health dimension. Data coverage varies by location and date range. Anything you leave blank is reported as a gap, never guessed."
        actions={
          <Button onClick={() => setEditingId("new")} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> {t("New farm")}
          </Button>
        }
      />

      <Notice tone="warn" title="Demo inputs are labelled">
        The seeded Harohalli farm uses illustrative soil values, not a laboratory soil test. Replace them with
        your own values before drawing conclusions — the advisor repeats whatever provenance is recorded here.
      </Notice>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="panel p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[17px] font-medium">
              {editing ? `${t("Edit")} ${editing.name}` : t("New farm profile")}
            </h2>
            {editing?.is_demo && <span className="chip">{t("Demo record")}</span>}
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="flex items-center gap-2 py-10 text-[13px] text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading farms…")}
              </div>
            ) : (
              <FarmForm
                key={editingId || "new"}
                farm={editing}
                onSaved={handleSaved}
                onCancel={farms.length ? () => setEditingId(activeFarm?.id ?? null) : undefined}
              />
            )}
          </div>
        </section>

        <aside className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="kicker">{t("Saved farms")}</p>
            <span className="metric text-[11px] text-muted-foreground">{farms.length}</span>
          </div>
          {!loading && farms.length === 0 && (
            <Notice tone="info">{t("No farms yet. Save a profile to start scoring rotations.")}</Notice>
          )}
          {farms.map((f) => (
            <FarmCard
              key={f.id}
              farm={f}
              active={f.id === activeFarm?.id}
              onActivate={() => setActiveFarm(f.id)}
              onEdit={() => setEditingId(f.id)}
              onDelete={() => setConfirm(f)}
            />
          ))}
          <Notice tone="info">
            Next: load real climate data on the{" "}
            <Link to="/climate" className="font-medium text-primary hover:underline">
              NASA climate page
            </Link>
            .
          </Notice>
        </aside>
      </div>

      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{confirm?.name}”?</DialogTitle>
            <DialogDescription>
              The farm profile is removed. Scenarios saved for this farm will keep their stored names but will
              no longer have a farm to score against.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              {t("Keep farm")}
            </Button>
            <Button variant="destructive" onClick={remove}>
              {t("Delete farm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}