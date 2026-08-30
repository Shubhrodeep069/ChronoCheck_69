import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCloudUser } from "@/components/CloudProvider";
import { Progress } from "@/components/ui/progress";
import { buildAchievementCards, buildRoutineSummary, type AchievementCard } from "@/lib/user-metrics";

const EMPTY_SUMMARY = {
  totalTasks: 0,
  completedToday: 0,
  completedAllTime: 0,
  currentStreak: 0,
  weeklyProgress: 0,
  monthlyProgress: 0,
};

export default function AchievementBadges() {
  const { user, loading } = useCloudUser();
  const [selected, setSelected] = useState<string | null>(null);
  const [cards, setCards] = useState<AchievementCard[]>(() => buildAchievementCards([], EMPTY_SUMMARY));
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (loading || !user) return;

    const load = async () => {
      const [progressRes, tasksRes, checkinsRes] = await Promise.all([
        supabase.from("user_feature_progress").select("feature_key,payload").eq("user_id", user.id),
        supabase.from("routine_tasks").select("id").eq("user_id", user.id),
        supabase.from("routine_checkins").select("checkin_date,completed").eq("user_id", user.id),
      ]);

      const routine = buildRoutineSummary(checkinsRes.data ?? [], (tasksRes.data ?? []).length);
      setCards(buildAchievementCards(progressRes.data ?? [], routine));
      setStreak(routine.currentStreak);
    };

    void load();
  }, [loading, user]);

  const unlockedCount = useMemo(() => cards.filter((card) => card.unlocked).length, [cards]);
  const selectedCard = cards.find((card) => card.id === selected);

  return (
    <div className="bg-card p-8 md:p-10 border-[3px] border-electric-pink glow-pink overflow-hidden" style={{ borderRadius: "2.5rem 0.5rem 2.5rem 0.5rem" }}>
      <h2 className="font-display text-3xl md:text-4xl text-gradient-pink-orange mb-2 text-center">🏆 ACHIEVEMENTS</h2>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
          <p className="font-display text-2xl text-gradient-lime-yellow">🔥 {streak} DAY STREAK</p>
          <p className="text-xs text-muted-foreground">Starts at zero and grows with your real routine check-ins.</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
          <p className="font-display text-2xl text-gradient-cyan-purple">{unlockedCount}/{cards.length} UNLOCKED</p>
          <p className="text-xs text-muted-foreground">All achievement progress now begins at 0 for a clean first-day start.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelected(selected === badge.id ? null : badge.id)}
            className={`relative rounded-xl border-2 p-4 text-left transition-all duration-300 ${badge.unlocked ? "border-sunny-yellow bg-sunny-yellow/10 hover:scale-[1.02]" : "border-border bg-muted/20 hover:border-primary/50"} ${selected === badge.id ? "scale-[1.02] ring-2 ring-primary" : ""}`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <span className="text-3xl">{badge.unlocked ? badge.emoji : "🔒"}</span>
              <span className="rounded-full border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {badge.progress}/{badge.max}
              </span>
            </div>
            <p className="font-display text-lg leading-tight text-foreground">{badge.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{badge.desc}</p>
            <Progress value={(badge.progress / badge.max) * 100} className="mt-3 h-2 bg-muted" />
          </button>
        ))}
      </div>

      {selectedCard && (
        <div className="mt-4 text-center animate-bounce-in">
          <div className="comic-bubble text-sm">
            {selectedCard.desc} • {selectedCard.progress}/{selectedCard.max}
          </div>
        </div>
      )}
    </div>
  );
}
