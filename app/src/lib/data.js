import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const ACTIVE_FARM_KEY = "terrashift.activeFarmId";

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

export function useFarms() {
  const state = useCollection(() => base44.entities.Farm.list("-created_date"));
  return { farms: state.items, ...state };
}

export function useCrops() {
  const state = useCollection(() => base44.entities.Crop.list("name"));
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
        { sort: "-retrieved_at", limit: 20 }
      );
    },
    [farmId]
  );
  const latest = state.items.find((s) => s.status === "ready") || null;
  return { snapshots: state.items, latest, ...state };
}

export function useActiveFarm(farms, loading) {
  const [activeId, setActiveId] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setActiveId(window.localStorage.getItem(ACTIVE_FARM_KEY));
    } catch {
      setActiveId(null);
    }
    setHydrated(true);
  }, []);

  const farm = (farms || []).find((f) => f.id === activeId) || (farms || [])[0] || null;

  const setActiveFarm = (id) => {
    try {
      window.localStorage.setItem(ACTIVE_FARM_KEY, id);
    } catch {
      /* storage may be unavailable; selection still applies for this visit */
    }
    setActiveId(id);
  };

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