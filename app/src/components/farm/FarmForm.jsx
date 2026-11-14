import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { IRRIGATION, PRIORITIES, TEXTURES, DEMO_LOCATION } from "@/lib/catalog";
import { validateFarm } from "@/lib/scoring";
import Notice from "@/components/common/Notice";
import { useI18n } from "@/lib/i18n";

const BLANK = {
  name: "",
  district: "",
  latitude: "",
  longitude: "",
  area_ha: "",
  soil_texture: "",
  soil_ph: "",
  soil_organic_carbon: "",
  irrigation: "rainfed",
  priorities: [],
  soil_source: "",
  notes: "",
};

function toForm(farm) {
  if (!farm) return BLANK;
  return {
    name: farm.name || "",
    district: farm.district || "",
    latitude: farm.latitude ?? "",
    longitude: farm.longitude ?? "",
    area_ha: farm.area_ha ?? "",
    soil_texture: farm.soil_texture || "",
    soil_ph: farm.soil_ph ?? "",
    soil_organic_carbon: farm.soil_organic_carbon ?? "",
    irrigation: farm.irrigation || "rainfed",
    priorities: farm.priorities || [],
    soil_source: farm.soil_source || "",
    notes: farm.notes || "",
  };
}

function numOrNull(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function FarmForm({ farm, onSaved, onCancel }) {
  const { t } = useI18n();
  const [form, setForm] = useState(() => toForm(farm));
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const togglePriority = (value) =>
    setForm((f) => ({
      ...f,
      priorities: f.priorities.includes(value)
        ? f.priorities.filter((p) => p !== value)
        : [...f.priorities, value],
    }));

  const searchLocation = async () => {
    const query = locationQuery.trim();
    if (query.length < 3) {
      setLocationMessage("Enter a village, town, taluk, district or landmark in India.");
      return;
    }
    setSearchingLocation(true);
    setLocationMessage("");
    setLocationResults([]);
    try {
      const params = new URLSearchParams({ q: query, format: "jsonv2", addressdetails: "1", limit: "6", countrycodes: "in" });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Location search is temporarily unavailable. You can enter coordinates manually.");
      const results = await response.json();
      setLocationResults(results);
      if (!results.length) setLocationMessage("No matching Indian locations found. Try a nearby town or enter coordinates manually.");
    } catch (error) {
      setLocationMessage(error?.message || "Could not search this location. Enter coordinates manually.");
    } finally {
      setSearchingLocation(false);
    }
  };

  const chooseLocation = (result) => {
    const address = result.address || {};
    const district = address.state_district || address.district || address.county || "";
    const state = address.state || "";
    setForm((current) => ({
      ...current,
      district: [district, state].filter(Boolean).join(", ") || result.display_name,
      latitude: Number(result.lat).toFixed(5),
      longitude: Number(result.lon).toFixed(5),
    }));
    setLocationMessage("Location selected. Check the coordinates and district before saving.");
    setLocationResults([]);
  };

  const applyDemoCoords = () =>
    setForm((f) => ({
      ...f,
      district: f.district || DEMO_LOCATION.district,
      latitude: DEMO_LOCATION.latitude,
      longitude: DEMO_LOCATION.longitude,
    }));

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      district: form.district.trim(),
      latitude: numOrNull(form.latitude),
      longitude: numOrNull(form.longitude),
      area_ha: numOrNull(form.area_ha),
      soil_texture: form.soil_texture || null,
      soil_ph: numOrNull(form.soil_ph),
      soil_organic_carbon: numOrNull(form.soil_organic_carbon),
      irrigation: form.irrigation || null,
      priorities: form.priorities,
      soil_source: form.soil_source.trim(),
      notes: form.notes.trim(),
      is_demo: form.soil_source.toLowerCase().includes("demo"),
    };
    const found = validateFarm(payload);
    if (found.length) {
      setErrors(found);
      return;
    }
    setErrors([]);
    setSaving(true);
    try {
      const saved = farm?.id
        ? await base44.entities.Farm.update(farm.id, payload)
        : await base44.entities.Farm.create(payload);
      toast.success(farm?.id ? "Farm profile updated" : "Farm profile saved");
      onSaved?.(saved);
    } catch (err) {
      setErrors([err?.message || "Could not save the farm."]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {errors.length > 0 && (
        <Notice tone="danger" title="Check these inputs">
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Notice>
      )}

      <div className="rounded-xl border border-border/70 bg-secondary/30 p-4 space-y-3">
        <div>
          <p className="kicker">{t("Find a location in India")}</p>
          <p className="prose-note mt-1">
            {t(
              "Search by village, town, taluk, district or landmark. Select a result to fill coordinates, or enter them manually below."
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); searchLocation(); } }} placeholder={t("e.g. Harohalli, Ramanagara, Karnataka")} aria-label={t("Search an Indian location")} />
          <Button type="button" variant="outline" onClick={searchLocation} disabled={searchingLocation}>{searchingLocation ? t("Searching…") : t("Search location")}</Button>
        </div>
        {locationResults.length > 0 && (
          <div className="space-y-2" aria-label="Location search results">
            {locationResults.map((result) => (
              <button key={result.place_id} type="button" onClick={() => chooseLocation(result)} className="block w-full rounded-lg border border-border bg-card px-3 py-2 text-left text-[12px] hover:border-primary/50">
                <span className="block font-medium">{result.name || result.display_name.split(",")[0]}</span>
                <span className="mt-0.5 block text-muted-foreground">{result.display_name}</span>
                <span className="mt-1 block font-mono text-[10px] text-muted-foreground">{Number(result.lat).toFixed(5)}, {Number(result.lon).toFixed(5)}</span>
              </button>
            ))}
          </div>
        )}
        {locationMessage && <p className="text-[11px] text-muted-foreground" role="status">{locationMessage}</p>}
        <p className="text-[10px] text-muted-foreground">Location search by OpenStreetMap contributors via Nominatim. Results are approximate; verify the farm coordinates. <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Attribution</a>.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="farm-name">{t("Farm or block name")}</Label>
          <Input
            id="farm-name"
            className="mt-1.5"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Harohalli north block"
          />
        </div>
        <div>
          <Label htmlFor="farm-district">{t("District / state")}</Label>
          <Input
            id="farm-district"
            className="mt-1.5"
            value={form.district}
            onChange={(e) => set("district", e.target.value)}
            placeholder="Ramanagara, Karnataka"
          />
        </div>
        <div>
          <Label htmlFor="farm-area">{t("Cropped area (ha)")}</Label>
          <Input
            id="farm-area"
            className="mt-1.5"
            type="number"
            step="0.1"
            min="0"
            value={form.area_ha}
            onChange={(e) => set("area_ha", e.target.value)}
            placeholder="2.4"
          />
        </div>
        <div>
          <Label htmlFor="farm-lat">{t("Latitude")}</Label>
          <Input
            id="farm-lat"
            className="mt-1.5"
            type="number"
            step="0.0001"
            value={form.latitude}
            onChange={(e) => set("latitude", e.target.value)}
            placeholder="12.68"
          />
        </div>
        <div>
          <Label htmlFor="farm-lon">{t("Longitude")}</Label>
          <Input
            id="farm-lon"
            className="mt-1.5"
            type="number"
            step="0.0001"
            value={form.longitude}
            onChange={(e) => set("longitude", e.target.value)}
            placeholder="77.48"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={applyDemoCoords}
        className="text-[11.5px] font-medium text-primary hover:underline"
      >
        {t("Use Harohalli pilot coordinates (12.68°N, 77.48°E)")}
      </button>

      <div className="hairline pt-5">
        <p className="kicker">{t("Soil profile")}</p>
        <p className="prose-note mt-1">
          {t(
            "These are the farm inputs the score depends on. Leave a field empty rather than guessing — the engine will flag the gap instead of filling it."
          )}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("Dominant texture")}</Label>
            <Select
              value={form.soil_texture || undefined}
              onValueChange={(v) => set("soil_texture", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={t("Not entered")} />
              </SelectTrigger>
              <SelectContent>
                {TEXTURES.map((tex) => (
                  <SelectItem key={tex.value} value={tex.value}>
                    {t(tex.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("Irrigation status")}</Label>
            <Select value={form.irrigation} onValueChange={(v) => set("irrigation", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IRRIGATION.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {t(i.label)} · {t("assumed")} {i.assumed_mm} mm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="farm-ph">{t("Soil pH")}</Label>
            <Input
              id="farm-ph"
              className="mt-1.5"
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={form.soil_ph}
              onChange={(e) => set("soil_ph", e.target.value)}
              placeholder="6.3 (leave empty if untested)"
            />
          </div>
          <div>
            <Label htmlFor="farm-oc">{t("Organic carbon (%)")}</Label>
            <Input
              id="farm-oc"
              className="mt-1.5"
              type="number"
              step="0.01"
              min="0"
              value={form.soil_organic_carbon}
              onChange={(e) => set("soil_organic_carbon", e.target.value)}
              placeholder="0.62 (leave empty if untested)"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="farm-soil-source">{t("Where did the soil values come from?")}</Label>
            <Input
              id="farm-soil-source"
              className="mt-1.5"
              value={form.soil_source}
              onChange={(e) => set("soil_source", e.target.value)}
              placeholder="e.g. soil test, KVK, 2025-03 — or “demo input”"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="kicker">{t("Farmer priorities")}</p>
        <p className="prose-note mt-1">Used to steer the discussion. They do not change the numeric score.</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {PRIORITIES.map((p) => {
            const active = form.priorities.includes(p.value);
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePriority(p.value)}
                className={
                  active
                    ? "rounded-full border border-primary bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground"
                    : "rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                }
              >
                {t(p.label)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="farm-notes">{t("Notes")}</Label>
        <Textarea
          id="farm-notes"
          className="mt-1.5"
          rows={3}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Water source, previous rotation, livestock, anything the advisor should know."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? t("Saving…") : farm?.id ? t("Update farm") : t("Save farm")}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("Cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}