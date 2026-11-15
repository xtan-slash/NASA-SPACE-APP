import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { loadPublicDemoLocation } from "@/lib/server-fns";
import { DEMO_CLIMATE, DEMO_FARM } from "@/lib/demo-data";
import { demoResults } from "@/lib/demo-scoring";

export function usePublicDemoLocation({ place, lat, lon }) {
  const load = useServerFn(loadPublicDemoLocation);
  const [state, setState] = useState({ loading: false, error: "", data: null });
  const hasPoint = Boolean(place) && Number.isFinite(lat) && Number.isFinite(lon);

  useEffect(() => {
    let active = true;
    if (!hasPoint) {
      setState({ loading: false, error: "", data: null });
      return () => { active = false; };
    }
    setState({ loading: true, error: "", data: null });
    load({ data: { latitude: lat, longitude: lon } })
      .then((result) => {
        if (!active) return;
        if (!result?.ok) {
          setState({ loading: false, error: result?.error || "Could not load location data.", data: null });
          return;
        }
        setState({ loading: false, error: "", data: result });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: error?.message || "Could not load location data.", data: null });
      });
    return () => { active = false; };
  }, [hasPoint, lat, lon, load]);

  return {
    ...state,
    hasPoint,
    location: state.data?.location
      ? { ...state.data.location, name: place || state.data.location.name }
      : (hasPoint ? { ...DEMO_FARM, name: place, latitude: lat, longitude: lon } : DEMO_FARM),
    climate: state.data?.climate || DEMO_CLIMATE,
    results: state.data?.results || demoResults(),
  };
}