import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCloudUser } from "@/components/CloudProvider";
import { buildRoutineSummary, buildScheduleScore, type ScheduleScoreData } from "@/lib/user-metrics";

const TONE_CLASS = {
  lime: "bg-lime-green",
  cyan: "bg-neon-cyan",
  yellow: "bg-sunny-yellow",
  pink: "bg-electric-pink",
} as const;

const EMPTY_SCORE: ScheduleScoreData = {
  total: 0,
  categories: [
    { label: "Daily Completion", emoji: "✅", score: 0, grade: "E", tone: "lime" },
    { label: "Routine Consistency", emoji: "📅", score: 0, grade: "E", tone: "cyan" },
    { label: "Time Balance", emoji: "⏳", score: 0, grade: "E", tone: "yellow" },
    { label: "Tool Momentum", emoji: "⚡", score: 0, grade: "E", tone: "pink" },
  ],
};

export default function ScheduleScore() {
  const { user, loading } = useCloudUser();
  const [data, setData] = useState<ScheduleScoreData>(EMPTY_SCORE);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const load = async () => {
      const [progressRes, tasksRes, checkinsRes] = await Promise.all([
        supabase.from("user_feature_progress").select("feature_key,payload").eq("user_id", user.id),
        supabase.from("routine_tasks").select("id").eq("user_id", user.id),
        supabase.from("routine_checkins").select("checkin_date,completed").eq("user_id", user.id),
      ]);

      const routine = buildRoutineSummary(checkinsRes.data ?? [], (tasksRes.data ?? []).length);
      setAnimated(false);
      setData(buildScheduleScore(progressRes.data ?? [], routine));
      window.setTimeout(() => setAnimated(true), 100);
    };

    void load();
  }, [loading, user]);

  const totalEmoji = data.total >= 90 ? "🏆" : data.total >= 75 ? "⭐" : data.total >= 50 ? "👍" : "🌱";

  return (
    <div className="bg-card p-8 md:p-10 border-[3px] border-hot-purple glow-purple overflow-hidden" style={{ borderRadius: "0.5rem 2rem 0.5rem 2rem" }}>
      <h2 className="font-display text-3xl md:text-4xl text-gradient-cyan-purple mb-4 text-center">📈 SCHEDULE SCORE</h2>

      <div className="text-center mb-4">
        <div className="inline-block relative">
          <span className="font-display text-7xl md:text-8xl text-gradient-pink-orange">{animated ? data.total : 0}</span>
          <span className="font-display text-2xl text-muted-foreground">/100</span>
          <span className="absolute -top-2 -right-8 text-3xl">{totalEmoji}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Starts at 0 and grows from your real routine and feature usage.</p>
      </div>

      <div className="space-y-3">
        {data.categories.map((cat) => (
          <div key={cat.label}>
            <div className="mb-1 flex justify-between text-sm font-bold">
              <span>{cat.emoji} {cat.label}</span>
              <span className="font-display text-lg">{cat.grade}</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ease-out ${TONE_CLASS[cat.tone]}`} style={{ width: animated ? `${cat.score}%` : "0%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
