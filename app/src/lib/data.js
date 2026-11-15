import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const ACTIVE_FARM_KEY = "terrashift.activeFarmId";

function activeFarmStorageKey(userId) {
  return userId ? `${ACTIVE_FARM_KEY}:${userId}` : null;
}

function useCollection(loader, deps = []) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loader();
      setItems(Array.isArray(data) ? data : data?.items || []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Could not load records.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, error, reload, setItems };
}

const demoFarmSeedRequests = new Map();

async function loadFarmsWithDemo(userId) {
  if (!userId) return [];
  if (!demoFarmSeedRequests.has(userId)) {
    const request = (async () => {
      const existing = await base44.entities.Farm.list("-created_date");
      const farms = Array.isArray(existing) ? existing : existing?.items || [];
      const hasHarohalliDemo = farms.some((farm) => farm.is_demo && farm.name === "Harohalli pilot block");
      if (!hasHarohalliDemo) {
        await base44.entities.Farm.create({
          name: "Harohalli pilot block",
          district: "Ramanagara, Karnataka",
          latitude: 12.68,
          longitude: 77.48,
          soil_texture: "red_loam",
          soil_ph: 6.3,
          soil_organic_carbon: 0.62,
          irrigation: "rainfed",
          priorities: [],
          soil_source: "Shared project demo template; illustrative values, not a laboratory soil test",
          notes: "Personal demo copy of the TerraShift AI Harohalli pilot block. Replace illustrative soil inputs with verified farm data before interpreting scores.",
          is_demo: true,
        });
      }
      const refreshed = await base44.entities.Farm.list("-created_date");
      return Array.isArray(refreshed) ? refreshed : refreshed?.items || [];
    })();
    demoFarmSeedRequests.set(userId, request);
  }
  try {
    return await demoFarmSeedRequests.get(userId);
  } finally {
    demoFarmSeedRequests.delete(userId);
  }
}

export function useFarms() {
  const { user } = useAuth();
  const state = useCollection(() => loadFarmsWithDemo(user?.id), [user?.id]);
  return { farms: state.items, ...state };
}

export function useCrops() {
  const state = useCollection(async () => {
    const [masterCrops, personalCrops] = await Promise.all([
      base44.entities.Crop.list("name"),
      base44.entities.UserCrop.list("name"),
    ]);
    const personal = Array.isArray(personalCrops) ? personalCrops : personalCrops?.items || [];
    const masters = Array.isArray(masterCrops) ? masterCrops : masterCrops?.items || [];
    const overrides = new Map(personal.filter((c) => c.master_crop_id).map((c) => [c.master_crop_id, c]));
    const merged = masters.map((master) => {
      const override = overrides.get(master.id);
      return override ? { ...master, ...override, id: master.id, user_crop_id: override.id, master_crop_id: master.id, is_personal: true } : { ...master, is_personal: false };
    });
    const custom = personal.filter((c) => !c.master_crop_id).map((c) => ({ ...c, user_crop_id: c.id, is_personal: true }));
    return [...merged, ...custom].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  });
  return { crops: state.items, ...state };
}

export function useScenarios(farmId) {
  const state = useCollection(
    async () => {
      if (!farmId) return [];
      return base44.entities.Scenario.filter({ farm_id: farmId }, { sort: "-created_date", limit: 100 });
    },
    [farmId]
  );
  return { scenarios: state.items, ...state };
}

export function useSnapshots(farmId) {
  const state = useCollection(
    async () => {
      if (!farmId) return [];
      return base44.entities.ClimateSnapshot.filter(
        { farm_id: farmId },
        { sort: "-retrieved_at", limit: 100 }
      );
    },
    [farmId]
  );
  // Recent monitor windows are not valid inputs to seasonal rotation scoring.
  const latest = state.items.find((s) => {
    if (s.status !== "ready" || s.data_mode === "recent_30d" || s.data_mode === "recent_90d") return false;
    try {
      const payload = JSON.parse(s.payload_json || "{}");
      return Object.values(payload.seasons || {}).some(
        (season) => Array.isArray(season.by_year) && season.by_year.length > 0
      );
    } catch {
      return false;
    }
  }) || null;
  return { snapshots: state.items, latest, ...state };
}

export function useActiveFarm(farms, loading) {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const storageKey = activeFarmStorageKey(user?.id);

  useEffect(() => {
    setHydrated(false);
    try {
      setActiveId(storageKey ? window.localStorage.getItem(storageKey) : null);
    } catch {
      setActiveId(null);
    }
    setHydrated(true);
  }, [storageKey]);

  const farm = (farms || []).find((f) => f.id === activeId) || (farms || [])[0] || null;

  const setActiveFarm = (id) => {
    try {
      if (storageKey && id) window.localStorage.setItem(storageKey, id);
    } catch {
      /* storage may be unavailable; selection still applies for this visit */
    }
    setActiveId(id);
  };

  useEffect(() => {
    if (!hydrated || loading || !farms?.length) return;
    const hasValidSelection = farms.some((item) => item.id === activeId);
    if (!hasValidSelection) setActiveFarm(farms[0].id);
  }, [hydrated, loading, farms, activeId, storageKey]);

  return { farm, activeId: farm?.id ?? null, setActiveFarm, ready: hydrated && !loading };
}

export function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function scenarioEntries(scenario) {
  return parseJson(scenario?.entries_json, []);
}

export function scenarioWeights(scenario) {
  return parseJson(scenario?.weights_json, null);
}

export function parseSnapshot(snapshot) {
  if (!snapshot?.payload_json) return null;
  return parseJson(snapshot.payload_json, null);
}