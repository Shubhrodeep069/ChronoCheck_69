import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface CloudUserContextValue {
  user: User | null;
  loading: boolean;
}

const CloudUserContext = createContext<CloudUserContextValue | undefined>(undefined);

export function CloudProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const ensureSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let nextUser = session?.user ?? null;

      if (!nextUser) {
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          console.error("Anonymous sign-in failed", error);
        } else {
          nextUser = data.user ?? data.session?.user ?? null;
        }
      }

      if (isMounted) {
        setUser(nextUser);
        setLoading(false);
      }
    };

    void ensureSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <CloudUserContext.Provider value={value}>{children}</CloudUserContext.Provider>;
}

export function useCloudUser() {
  const context = useContext(CloudUserContext);

  if (!context) {
    throw new Error("useCloudUser must be used inside CloudProvider");
  }

  return context;
}
