import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { useCloudUser } from "@/components/CloudProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { user } = useCloudUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;

    let cancelled = false;

    const loadPreference = async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("theme")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled && data?.theme) {
        setTheme(data.theme);
      }
    };

    void loadPreference();

    return () => {
      cancelled = true;
    };
  }, [mounted, setTheme, user]);

  useEffect(() => {
    if (!mounted || !user || !theme) return;

    void supabase.from("user_preferences").upsert(
      [
        {
          user_id: user.id,
          theme,
        },
      ],
      { onConflict: "user_id" },
    );
  }, [mounted, theme, user]);

  if (!mounted) {
    return null;
  }

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 font-display text-base text-foreground transition-transform hover:scale-105"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {theme === "light" ? "DARK MODE" : "LIGHT MODE"}
    </button>
  );
}
