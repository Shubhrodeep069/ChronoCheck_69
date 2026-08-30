import { useEffect } from "react";
import { useFeatureStorage } from "@/hooks/use-feature-storage";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);
type SlotStatus = "free" | "busy" | "meeting" | "lunch";
const STATUS_CONFIG: Record<SlotStatus, { label: string; emoji: string; bgClass: string }> = {
  free: { label: "Free", emoji: "░░", bgClass: "bg-lime-green/20 border-lime-green/40" },
  busy: { label: "Busy", emoji: "██", bgClass: "bg-electric-pink/30 border-electric-pink/50" },
  meeting: { label: "Meeting", emoji: "██", bgClass: "bg-hot-purple/30 border-hot-purple/50" },
  lunch: { label: "Lunch", emoji: "░░", bgClass: "bg-sunny-yellow/30 border-sunny-yellow/50" },
};
const CYCLE: SlotStatus[] = ["free", "busy", "meeting", "lunch"];
const initialSlots: Record<number, SlotStatus> = HOURS.reduce<Record<number, SlotStatus>>((acc, hour) => {
  acc[hour] = hour === 12 ? "lunch" : "free";
  return acc;
}, {});

export default function VisualTimeGrid() {
  const { state, setState } = useFeatureStorage("visual-time-grid", { slots: initialSlots as Record<number, SlotStatus>, stats: { edits: 0, freePercent: 100 } });

  const cycleSlot = (hour: number) => setState((prev) => {
    const current = prev.slots[hour] || "free";
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
    const slots = { ...prev.slots, [hour]: next };
    const freeCount = Object.values(slots).filter((s) => s === "free" || s === "lunch").length;
    return { slots, stats: { edits: prev.stats.edits + 1, freePercent: Math.round((freeCount / HOURS.length) * 100) } };
  });

  const freeCount = Object.values(state.slots).filter((s) => s === "free" || s === "lunch").length;
  const busyCount = Object.values(state.slots).filter((s) => s === "busy" || s === "meeting").length;
  const freePercent = Math.round((freeCount / HOURS.length) * 100);

  useEffect(() => {
    if (state.stats.freePercent !== freePercent) setState((prev) => ({ ...prev, stats: { ...prev.stats, freePercent } }));
  }, [freePercent, setState, state.stats.freePercent]);

  return <div className="bg-card p-8 md:p-10 border-[3px] border-neon-cyan glow-cyan overflow-hidden" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem" }}>
    <h2 className="font-display text-3xl md:text-4xl text-gradient-cyan-purple mb-2 text-center">📊 VISUAL TIME GRID</h2>
    <p className="text-sm text-muted-foreground text-center mb-4">Click to block time • Saved to your progress</p>
    <div className="space-y-1 select-none">{HOURS.map((hour) => { const status = state.slots[hour] || "free"; const config = STATUS_CONFIG[status]; const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`; return <div key={hour} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${config.bgClass}`} onClick={() => cycleSlot(hour)}><span className="font-display text-sm w-16 text-muted-foreground">{timeStr}</span><div className="flex-1 h-6 rounded-md relative overflow-hidden"><div className={`absolute inset-0 rounded-md ${status === "free" ? "bg-lime-green/30" : status === "busy" ? "bg-electric-pink/50" : status === "meeting" ? "bg-hot-purple/50" : "bg-sunny-yellow/40"}`} style={{ animation: status !== "free" ? "pulse-glow 2s infinite" : undefined }} /></div><span className="text-xs font-bold w-16 text-right">{config.emoji} {config.label}</span></div>; })}</div>
    <div className="mt-4"><div className="flex justify-between text-sm font-display mb-1"><span className="text-lime-green">FREE: {freeCount}h</span><span className="text-electric-pink">BUSY: {busyCount}h</span></div><div className="h-4 rounded-full bg-muted overflow-hidden border border-muted-foreground/20"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${freePercent}%`, background: "linear-gradient(90deg, hsl(82, 100%, 61%), hsl(187, 100%, 50%))" }} /></div><p className="text-center font-display text-sm mt-1 text-muted-foreground">{freePercent}% FREE TIME</p></div>
    <div className="flex justify-center gap-3 mt-3 flex-wrap">{CYCLE.map((s) => <span key={s} className={`text-xs font-bold px-2 py-1 rounded-full border ${STATUS_CONFIG[s].bgClass}`}>{STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}</span>)}</div>
  </div>;
}
