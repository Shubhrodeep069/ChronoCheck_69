import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useCloudUser } from "@/components/CloudProvider";

export function useFeatureStorage<T extends Record<string, unknown>>(featureKey: string, initialState: T) {
  const { user, loading } = useCloudUser();
  const initialRef = useRef(initialState);
  const [state, setState] = useState<T>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    let cancelled = false;

    const loadState = async () => {
      const { data, error } = await supabase
        .from("user_feature_progress")
        .select("payload")
        .eq("user_id", user.id)
        .eq("feature_key", featureKey)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(`Failed to load ${featureKey}`, error);
        setHydrated(true);
        return;
      }

      if (data?.payload && typeof data.payload === "object" && !Array.isArray(data.payload)) {
        setState({ ...initialRef.current, ...(data.payload as Partial<T>) });
      }

      setHydrated(true);
    };

    void loadState();

    return () => {
      cancelled = true;
    };
  }, [featureKey, loading, user]);

  useEffect(() => {
    if (loading || !user || !hydrated) return;

    const timeout = window.setTimeout(() => {
      void supabase.from("user_feature_progress").upsert(
        [
          {
            user_id: user.id,
            feature_key: featureKey,
            payload: state as unknown as Json,
          },
        ],
        { onConflict: "user_id,feature_key" },
      );
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [featureKey, hydrated, loading, state, user]);

  return {
    state,
    setState,
    hydrated,
    user,
    loading: loading || !hydrated,
  };
}
