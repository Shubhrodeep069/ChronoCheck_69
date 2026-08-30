import { useState } from "react";
import ConfettiBlast from "./ConfettiBlast";
import TypewriterText from "./TypewriterText";
import { useFeatureStorage } from "@/hooks/use-feature-storage";

export default function DurationChecker() {
  const { state, setState } = useFeatureStorage("duration-checker", {
    start: "",
    minutes: "",
    blocked: "",
    result: null as null | { works: boolean; endTime?: string },
    stats: { checks: 0, successes: 0, failures: 0 },
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);

  const check = () => {
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return (h || 0) * 60 + (m || 0); };
    const fromMin = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const startMin = toMin(state.start); const dur = parseInt(state.minutes) || 0; const endMin = startMin + dur; const endTime = fromMin(endMin);
    const blockedSlots = state.blocked.split(",").map((s) => s.trim()).filter(Boolean);
    const hasConflict = blockedSlots.some((slot) => { const parts = slot.split("-"); if (parts.length !== 2) return false; const bs = toMin(parts[0]), be = toMin(parts[1]); return startMin < be && endMin > bs; });
    setState((prev) => ({ ...prev, result: { works: !hasConflict, endTime }, stats: { checks: prev.stats.checks + 1, successes: prev.stats.successes + (hasConflict ? 0 : 1), failures: prev.stats.failures + (hasConflict ? 1 : 0) } }));
    if (!hasConflict) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2000); } else { setShake(true); setTimeout(() => setShake(false), 600); }
  };

  return <div className={`relative bg-card p-8 md:p-10 border-[3px] border-sunny-yellow overflow-hidden ${shake ? "animate-shake" : ""}`} style={{ borderRadius: "0.5rem 2.5rem 0.5rem 2.5rem", transform: "rotate(-1deg)", animation: shake ? undefined : "float 3.5s ease-in-out 1s infinite", boxShadow: "0 0 20px hsla(49, 100%, 65%, 0.5)" }}>
    {showConfetti && <ConfettiBlast />}
    <h2 className="font-display text-3xl md:text-4xl text-gradient-lime-yellow mb-4 text-center">⚡ DURATION CHECK</h2>
    <div className="space-y-3">
      <input type="time" className="chrono-input w-full" value={state.start} onChange={(e) => setState((p) => ({ ...p, start: e.target.value }))} />
      <p className="text-sm text-muted-foreground">⚡ Start time</p>
      <input type="number" className="chrono-input w-full" placeholder="⏱️ Minutes needed" value={state.minutes} onChange={(e) => setState((p) => ({ ...p, minutes: e.target.value }))} />
      <input className="chrono-input w-full" placeholder="🚫 10:00-11:00, 14:00-15:00" value={state.blocked} onChange={(e) => setState((p) => ({ ...p, blocked: e.target.value }))} />
      <p className="text-sm text-muted-foreground">🚫 Blocked slots</p>
      <button onClick={check} className="chrono-btn-orange w-full py-3 font-display text-xl tracking-wider rounded-lg hover:animate-jiggle">🧮 DO THE MATH</button>
    </div>
    {state.result && <div className="mt-4 text-center animate-bounce-in">{state.result.works ? <div className="comic-bubble text-xl font-display"><TypewriterText text={`🎉 WORKS! Ends at ${state.result.endTime}`} speed={35} /></div> : <div className="comic-bubble !bg-electric-pink !text-foreground !border-foreground text-xl font-display"><TypewriterText text="🙅‍♂️ NOPE! BLOCKED!" speed={40} /></div>}</div>}
  </div>;
}
