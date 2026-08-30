import type { Json } from "@/integrations/supabase/types";

export interface FeatureProgressRow {
  feature_key: string;
  payload: Json;
}

export interface RoutineCheckinLike {
  checkin_date: string;
  completed: boolean;
}

export interface RoutineSummary {
  totalTasks: number;
  completedToday: number;
  completedAllTime: number;
  currentStreak: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

export interface AchievementCard {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  progress: number;
  max: number;
  unlocked: boolean;
}

export interface ScoreCategory {
  label: string;
  emoji: string;
  score: number;
  grade: string;
  tone: "lime" | "cyan" | "yellow" | "pink";
}

export interface ScheduleScoreData {
  total: number;
  categories: ScoreCategory[];
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const formatDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfWeek = (value: Date) => {
  const date = new Date(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfMonth = (value: Date) => new Date(value.getFullYear(), value.getMonth(), 1);

const isRecord = (value: Json): value is Record<string, Json> => !!value && typeof value === "object" && !Array.isArray(value);

const getPayload = (rows: FeatureProgressRow[], key: string): Record<string, Json> => {
  const value = rows.find((row) => row.feature_key === key)?.payload;
  return value && isRecord(value) ? value : {};
};

const getCount = (payload: Record<string, Json>, ...paths: string[]) => {
  for (const path of paths) {
    const value = path.split(".").reduce<any>((acc, part) => (acc == null || typeof acc !== "object" ? undefined : acc[part]), payload);
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return 0;
};

const getGrade = (score: number) => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "E";
};

export function buildRoutineSummary(checkins: RoutineCheckinLike[], totalTasks: number): RoutineSummary {
  const completed = checkins.filter((item) => item.completed);
  const today = new Date();
  const todayKey = formatDateKey(today);
  const weekStart = startOfWeek(today);
  const monthStart = startOfMonth(today);

  const completedDates = Array.from(new Set(completed.map((item) => item.checkin_date))).sort((a, b) => b.localeCompare(a));

  let currentStreak = 0;
  for (let offset = 0; offset < completedDates.length + 1; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = formatDateKey(date);
    if (completedDates.includes(key)) currentStreak += 1;
    else break;
  }

  const completedToday = completed.filter((item) => item.checkin_date === todayKey).length;
  const weeklyCompleted = completed.filter((item) => item.checkin_date >= formatDateKey(weekStart)).length;
  const monthlyCompleted = completed.filter((item) => item.checkin_date >= formatDateKey(monthStart)).length;
  const elapsedWeekDays = Math.max(1, Math.floor((today.getTime() - weekStart.getTime()) / 86400000) + 1);
  const elapsedMonthDays = Math.max(1, today.getDate());

  return {
    totalTasks,
    completedToday,
    completedAllTime: completed.length,
    currentStreak,
    weeklyProgress: totalTasks > 0 ? clamp(weeklyCompleted / (totalTasks * elapsedWeekDays)) : 0,
    monthlyProgress: totalTasks > 0 ? clamp(monthlyCompleted / (totalTasks * elapsedMonthDays)) : 0,
  };
}

export function buildAchievementCards(rows: FeatureProgressRow[], routine: RoutineSummary): AchievementCard[] {
  const conflict = getPayload(rows, "conflict-detector");
  const slot = getPayload(rows, "time-slot-checker");
  const duration = getPayload(rows, "duration-checker");
  const mood = getPayload(rows, "mood-scheduler");
  const facts = getPayload(rows, "random-facts");
  const grid = getPayload(rows, "visual-time-grid");
  const multi = getPayload(rows, "multi-person-scheduler");
  const timezone = getPayload(rows, "time-zone-converter");

  const cards = [
    { id: "routine-starter", emoji: "🌱", label: "Routine Starter", desc: "Complete your first routine check-in.", progress: routine.completedAllTime, max: 1 },
    { id: "consistency-crew", emoji: "✅", label: "Consistency Crew", desc: "Finish 7 routine tasks across any days.", progress: routine.completedAllTime, max: 7 },
    { id: "streak-master", emoji: "🔥", label: "Streak Master", desc: "Reach a 14-day routine streak.", progress: routine.currentStreak, max: 14 },
    { id: "conflict-buster", emoji: "💥", label: "Conflict Buster", desc: "Clear 10 conflict checks without overlap.", progress: getCount(conflict, "stats.noConflicts"), max: 10 },
    { id: "slot-scout", emoji: "🔍", label: "Slot Scout", desc: "Find 10 free moments with the time-slot tool.", progress: getCount(slot, "stats.freeHits"), max: 10 },
    { id: "duration-ace", emoji: "⏱️", label: "Duration Ace", desc: "Fit 10 sessions perfectly into your day.", progress: getCount(duration, "stats.successes"), max: 10 },
    { id: "mood-mapper", emoji: "🌊", label: "Mood Mapper", desc: "Update your scheduling mood 7 times.", progress: getCount(mood, "stats.changes"), max: 7 },
    { id: "grid-architect", emoji: "📊", label: "Grid Architect", desc: "Edit your visual grid 15 times.", progress: getCount(grid, "stats.edits"), max: 15 },
    { id: "team-sync", emoji: "👥", label: "Team Sync", desc: "Find common time for the whole team 5 times.", progress: getCount(multi, "stats.successes"), max: 5 },
    { id: "world-hopper", emoji: "🌍", label: "World Hopper", desc: "Convert time zones 12 times.", progress: getCount(timezone, "stats.conversions"), max: 12 },
    { id: "fact-collector", emoji: "🎲", label: "Fact Collector", desc: "Spin 10 scheduling facts.", progress: getCount(facts, "stats.spins", "spins"), max: 10 },
    { id: "planning-pro", emoji: "🗂️", label: "Planning Pro", desc: "Create 10 routine tasks across your plans.", progress: routine.totalTasks, max: 10 },
  ];

  return cards.map((card) => ({ ...card, progress: Math.min(card.progress, card.max), unlocked: card.progress >= card.max }));
}

export function buildScheduleScore(rows: FeatureProgressRow[], routine: RoutineSummary): ScheduleScoreData {
  const conflict = getPayload(rows, "conflict-detector");
  const slot = getPayload(rows, "time-slot-checker");
  const duration = getPayload(rows, "duration-checker");
  const mood = getPayload(rows, "mood-scheduler");
  const facts = getPayload(rows, "random-facts");
  const grid = getPayload(rows, "visual-time-grid");
  const multi = getPayload(rows, "multi-person-scheduler");
  const timezone = getPayload(rows, "time-zone-converter");

  const toolMomentum = Math.min(100, (getCount(conflict, "stats.checks") + getCount(slot, "stats.checks") + getCount(duration, "stats.checks") + getCount(mood, "stats.changes") + getCount(facts, "stats.spins", "spins") + getCount(grid, "stats.edits") + getCount(multi, "stats.runs") + getCount(timezone, "stats.conversions")) * 5);
  const dailyCompletion = routine.totalTasks > 0 ? Math.round((routine.completedToday / routine.totalTasks) * 100) : 0;
  const routineConsistency = Math.round(routine.monthlyProgress * 100);
  const timeBalance = Math.round(Math.min(100, getCount(grid, "stats.freePercent")));
  const planningDepth = Math.min(100, routine.totalTasks * 10 + Math.round(routine.weeklyProgress * 30));
  const momentumScore = planningDepth > 0 ? Math.round((toolMomentum + planningDepth) / 2) : toolMomentum;

  const categories: ScoreCategory[] = [
    { label: "Daily Completion", emoji: "✅", score: dailyCompletion, grade: getGrade(dailyCompletion), tone: "lime" },
    { label: "Routine Consistency", emoji: "📅", score: routineConsistency, grade: getGrade(routineConsistency), tone: "cyan" },
    { label: "Time Balance", emoji: "⏳", score: timeBalance, grade: getGrade(timeBalance), tone: "yellow" },
    { label: "Tool Momentum", emoji: "⚡", score: momentumScore, grade: getGrade(momentumScore), tone: "pink" },
  ];

  return { total: Math.round(categories.reduce((sum, category) => sum + category.score, 0) / categories.length), categories };
}
