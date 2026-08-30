import { useEffect, useMemo, useState } from "react";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useCloudUser } from "@/components/CloudProvider";

type Period = "weekly" | "monthly";
type PlanRow = Tables<"routine_plans">;
type TaskRow = Tables<"routine_tasks">;
type CheckinRow = Tables<"routine_checkins">;

const PERIODS: Period[] = ["weekly", "monthly"];

const toDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfWeek = (date = new Date()) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
};

function Ring({ value, label, helper }: { value: number; label: string; helper: string }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - value * circumference;

  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4 text-center">
      <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28 -rotate-90">
        <circle cx="60" cy="60" r={radius} className="fill-none stroke-muted" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="fill-none stroke-primary transition-all duration-500"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <p className="-mt-20 font-display text-3xl text-foreground">{Math.round(value * 100)}%</p>
      <p className="mt-10 font-display text-lg text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

export default function DailyRoutineTracker() {
  const { user, loading } = useCloudUser();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [newTask, setNewTask] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const load = async () => {
      const [plansRes, tasksRes, checkinsRes] = await Promise.all([
        supabase.from("routine_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
        supabase.from("routine_tasks").select("*").eq("user_id", user.id).order("sort_order", { ascending: true }),
        supabase.from("routine_checkins").select("*").eq("user_id", user.id).order("checkin_date", { ascending: false }),
      ]);

      setPlans(plansRes.data ?? []);
      setTasks(tasksRes.data ?? []);
      setCheckins(checkinsRes.data ?? []);
    };

    void load();
  }, [loading, user]);

  const planMap = useMemo(() => Object.fromEntries(plans.map((plan) => [plan.id, plan])), [plans]);
  const todayKey = toDateKey();
  const weeklyTasks = tasks.filter((task) => planMap[task.plan_id]?.period === "weekly");
  const monthlyTasks = tasks.filter((task) => planMap[task.plan_id]?.period === "monthly");
  const activeTasks = selectedPeriod === "weekly" ? weeklyTasks : monthlyTasks;

  const completedToday = activeTasks.filter((task) =>
    checkins.some((checkin) => checkin.task_id === task.id && checkin.checkin_date === todayKey && checkin.completed),
  ).length;

  const weeklyWindow = toDateKey(startOfWeek());
  const monthWindow = toDateKey(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const weeklyDone = checkins.filter((checkin) => checkin.completed && checkin.checkin_date >= weeklyWindow).length;
  const monthlyDone = checkins.filter((checkin) => checkin.completed && checkin.checkin_date >= monthWindow).length;
  const weeklyProgress = weeklyTasks.length > 0 ? Math.min(1, weeklyDone / (weeklyTasks.length * Math.max(1, new Date().getDay() || 7))) : 0;
  const monthlyProgress = monthlyTasks.length > 0 ? Math.min(1, monthlyDone / (monthlyTasks.length * Math.max(1, new Date().getDate()))) : 0;

  const ensurePlan = async (period: Period) => {
    const existing = plans.find((plan) => plan.period === period && plan.is_active);
    if (existing) return existing;
    if (!user) return null;

    const { data, error } = await supabase
      .from("routine_plans")
      .insert([
        {
          user_id: user.id,
          period,
          title: period === "weekly" ? "Weekly Routine" : "Monthly Routine",
        },
      ])
      .select()
      .single();

    if (error || !data) return null;
    setPlans((prev) => [...prev, data]);
    return data;
  };

  const addTask = async () => {
    if (!newTask.trim() || !user) return;
    setSaving(true);
    const plan = await ensurePlan(selectedPeriod);
    if (!plan) {
      setSaving(false);
      return;
    }

    const currentCount = tasks.filter((task) => task.plan_id === plan.id).length;
    const { data } = await supabase
      .from("routine_tasks")
      .insert([
        {
          user_id: user.id,
          plan_id: plan.id,
          title: newTask.trim(),
          sort_order: currentCount,
        },
      ])
      .select()
      .single();

    if (data) {
      setTasks((prev) => [...prev, data]);
      setNewTask("");
    }
    setSaving(false);
  };

  const toggleCheckin = async (task: TaskRow) => {
    if (!user) return;
    const existing = checkins.find((checkin) => checkin.task_id === task.id && checkin.checkin_date === todayKey);
    const nextCompleted = !existing?.completed;

    const payload = {
      user_id: user.id,
      task_id: task.id,
      checkin_date: todayKey,
      completed: nextCompleted,
      completed_at: nextCompleted ? new Date().toISOString() : null,
    };

    const { data } = await supabase
      .from("routine_checkins")
      .upsert([payload], { onConflict: "task_id,checkin_date" })
      .select()
      .single();

    if (data) {
      setCheckins((prev) => {
        const withoutCurrent = prev.filter((item) => !(item.task_id === task.id && item.checkin_date === todayKey));
        return [data, ...withoutCurrent];
      });
    }
  };

  return (
    <div className="bg-card p-8 md:p-10 border-[3px] border-primary overflow-hidden" style={{ borderRadius: "1.5rem 0.75rem 1.5rem 0.75rem" }}>
      <h2 className="font-display text-3xl md:text-4xl text-gradient-pink-orange mb-2 text-center">🗓️ ROUTINE TRACKER</h2>
      <p className="text-center text-sm text-muted-foreground mb-5">Build your weekly or monthly routine, then check tasks off every day.</p>

      <div className="flex flex-wrap justify-center gap-2 mb-5">
        {PERIODS.map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => setSelectedPeriod(period)}
            className={`rounded-full border-2 px-4 py-2 font-display text-base transition-transform hover:scale-105 ${selectedPeriod === period ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/40 text-foreground"}`}
          >
            {period === "weekly" ? "WEEKLY" : "MONTHLY"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder={`Add a ${selectedPeriod} task`}
              className="chrono-input flex-1"
            />
            <button
              type="button"
              onClick={addTask}
              disabled={saving}
              className="chrono-btn-pink inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-display text-lg text-foreground disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> ADD TASK
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="p-3 text-left font-display text-base">Task</th>
                  <th className="p-3 text-left font-display text-base">Today</th>
                </tr>
              </thead>
              <tbody>
                {activeTasks.length > 0 ? (
                  activeTasks.map((task) => {
                    const isDone = checkins.some((checkin) => checkin.task_id === task.id && checkin.checkin_date === todayKey && checkin.completed);
                    return (
                      <tr key={task.id} className="border-t border-border/70">
                        <td className="p-3 font-medium text-foreground">{task.title}</td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => toggleCheckin(task)}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-sm ${isDone ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}
                          >
                            {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                            {isDone ? "DONE" : "CHECK IN"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={2} className="p-6 text-center text-muted-foreground">No tasks yet — add your first routine item.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-center">
            <p className="font-display text-2xl text-gradient-cyan-purple">TODAY: {completedToday}/{activeTasks.length || 0}</p>
            <p className="text-sm text-muted-foreground">Check in once a task is done to keep your progress accurate.</p>
          </div>
        </div>

        <div className="grid gap-4">
          <Ring value={weeklyProgress} label="Weekly Progress" helper={`${weeklyDone} completions in this week`} />
          <Ring value={monthlyProgress} label="Monthly Progress" helper={`${monthlyDone} completions in this month`} />
        </div>
      </div>
    </div>
  );
}
