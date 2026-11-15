import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { OC_LEVELS, ROTATION_ROLES, SEASONS, TEXTURES } from "@/lib/catalog";
import { validateCrop } from "@/lib/scoring";
import Notice from "@/components/common/Notice";

const BLANK = {
  name: "",
  local_name: "",
  family: "",
  rotation_role: "cereal",
  season: "kharif",
  duration_days: 120,
  water_need_mm: 450,
  ph_min: 5.5,
  ph_max: 7.5,
  temp_opt_min: 20,
  temp_opt_max: 30,
  heat_threshold_c: 35,
  oc_need: "medium",
  texture_preferred: [],
  texture_marginal: [],
  n_fixing: false,
  flood_sensitive: false,
  source_note: "",
  notes: "",
  is_demo: false,
};

function toForm(crop) {
  if (!crop) return BLANK;
  return {
    ...BLANK,
    ...crop,
    texture_preferred: crop.texture_preferred || [],
    texture_marginal: crop.texture_marginal || [],
  };
}

const num = (v) => (v === "" || v == null ? null : Number(v));

function TexturePicker({ label, hint, selected, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {TEXTURES.map((t) => {
          const active = selected.includes(t.value);
          return (
            <button
              key={t.value}
              type="button"
              onClick={() =>
                onChange(active ? selected.filter((v) => v !== t.value) : [...selected, t.value])
              }
              className={
                active
                  ? "rounded-full border border-primary bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground"
                  : "rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40"
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CropDialog({ open, crop, onOpenChange, onSaved }) {
  const [form, setForm] = useState(() => toForm(crop));
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      name: form.name.trim(),
      water_need_mm: num(form.water_need_mm),
      ph_min: num(form.ph_min),
      ph_max: num(form.ph_max),
      temp_opt_min: num(form.temp_opt_min),
      temp_opt_max: num(form.temp_opt_max),
      heat_threshold_c: num(form.heat_threshold_c),
      duration_days: num(form.duration_days),
      is_demo: /demo|illustrative/i.test(form.source_note || ""),
    };
    const found = validateCrop(payload);
    if (found.length) {
      setErrors(found);
      return;
    }
    setErrors([]);
    setSaving(true);
    try {
      let saved;
      const {
        id: _recordId,
        created_by_id: _createdById,
        created_date: _createdDate,
        updated_date: _updatedDate,
        user_crop_id: _userCropId,
        is_personal: _isPersonal,
        ...cropValues
      } = payload;
      const personalPayload = {
        ...cropValues,
        ...(crop?.master_crop_id ? { master_crop_id: crop.master_crop_id } : crop?.is_personal && crop?.id ? {} : crop?.id ? { master_crop_id: crop.id } : {}),
      };
      if (crop?.user_crop_id) {
        saved = await base44.entities.UserCrop.update(crop.user_crop_id, personalPayload);
      } else {
        saved = await base44.entities.UserCrop.create({ ...personalPayload, is_demo: false });
      }
      toast.success(crop?.user_crop_id ? "Personal crop settings updated" : crop?.id ? "Personal crop copy created" : "Personal crop added");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      setErrors([err?.message || "Could not save the crop."]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{crop?.id ? `Customize ${crop.name}` : "New personal crop record"}</DialogTitle>
          <DialogDescription>
            Changes are saved to your account only. The shared master crop record remains unchanged for other users. Parameter values are inputs to the scoring engine, so record the source where available.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          {errors.length > 0 && (
            <Notice tone="danger" title="Check these inputs">
              <ul className="mt-1 list-disc pl-4">
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Notice>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Crop name</Label>
              <Input className="mt-1.5" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label>Local name</Label>
              <Input
                className="mt-1.5"
                value={form.local_name}
                onChange={(e) => set("local_name", e.target.value)}
                placeholder="e.g. Ragi"
              />
            </div>
            <div>
              <Label>Botanical family</Label>
              <Input
                className="mt-1.5"
                value={form.family}
                onChange={(e) => set("family", e.target.value)}
                placeholder="Poaceae"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Used for the diversity dimension.</p>
            </div>
            <div>
              <Label>Rotation role</Label>
              <Select value={form.rotation_role} onValueChange={(v) => set("rotation_role", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROTATION_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Typical season</Label>
              <Select value={form.season} onValueChange={(v) => set("season", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEASONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label} ({s.window})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (days)</Label>
              <Input
                className="mt-1.5"
                type="number"
                value={form.duration_days}
                onChange={(e) => set("duration_days", e.target.value)}
              />
            </div>
          </div>

          <div className="hairline pt-5">
            <p className="kicker">Water</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Seasonal water demand (mm)</Label>
                <Input
                  className="mt-1.5"
                  type="number"
                  value={form.water_need_mm}
                  onChange={(e) => set("water_need_mm", e.target.value)}
                />
              </div>
              <div className="sm:pt-6">
                <label className="flex items-center gap-2 text-[12.5px]">
                  <input
                    type="checkbox"
                    checked={form.flood_sensitive}
                    onChange={(e) => set("flood_sensitive", e.target.checked)}
                    className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
                  />
                  Sensitive to heavy-rain days (extra penalty)
                </label>
              </div>
            </div>
          </div>

          <div className="hairline pt-5">
            <p className="kicker">Soil and temperature tolerance</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>pH min</Label>
                  <Input
                    className="mt-1.5"
                    type="number"
                    step="0.1"
                    value={form.ph_min}
                    onChange={(e) => set("ph_min", e.target.value)}
                  />
                </div>
                <div>
                  <Label>pH max</Label>
                  <Input
                    className="mt-1.5"
                    type="number"
                    step="0.1"
                    value={form.ph_max}
                    onChange={(e) => set("ph_max", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Organic-carbon demand</Label>
                <Select value={form.oc_need} onValueChange={(v) => set("oc_need", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OC_LEVELS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label} (needs {o.threshold} %)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Optimum temp min (°C)</Label>
                  <Input
                    className="mt-1.5"
                    type="number"
                    value={form.temp_opt_min}
                    onChange={(e) => set("temp_opt_min", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Optimum temp max (°C)</Label>
                  <Input
                    className="mt-1.5"
                    type="number"
                    value={form.temp_opt_max}
                    onChange={(e) => set("temp_opt_max", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Heat-stress threshold (°C)</Label>
                <Input
                  className="mt-1.5"
                  type="number"
                  value={form.heat_threshold_c}
                  onChange={(e) => set("heat_threshold_c", e.target.value)}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Daily maximum temperature counted as a heat day (35 or 38 supported by the data).
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TexturePicker
                label="Preferred textures"
                hint="Scored 100 when the farm matches."
                selected={form.texture_preferred}
                onChange={(v) => set("texture_preferred", v)}
              />
              <TexturePicker
                label="Marginal textures"
                hint="Scored 62 when the farm matches."
                selected={form.texture_marginal}
                onChange={(v) => set("texture_marginal", v)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-border/70 pt-4">
            <label className="flex items-center gap-2 text-[12.5px]">
              <input
                type="checkbox"
                checked={form.n_fixing}
                onChange={(e) => set("n_fixing", e.target.checked)}
                className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
              />
              Legume (biological nitrogen fixing)
            </label>
          </div>

          <div>
            <Label>Source note</Label>
            <Input
              className="mt-1.5"
              value={form.source_note}
              onChange={(e) => set("source_note", e.target.value)}
              placeholder="e.g. ICAR package of practice 2024 — or “illustrative demo value”"
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              className="mt-1.5"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : crop?.id ? "Update crop" : "Add crop"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}