import { useState } from "react";
import ConfettiBlast from "./ConfettiBlast";
import FireworksEffect from "./FireworksEffect";
import TypewriterText from "./TypewriterText";
import { useFeatureStorage } from "@/hooks/use-feature-storage";

export default function ConflictDetector() {
  const { state, setState } = useFeatureStorage("conflict-detector", {
    slot1Start: "",
    slot1End: "",
    slot2Start: "",
    slot2End: "",
    result: null as null | boolean,
    stats: { checks: 0, noConflicts: 0, conflicts: 0 },
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [shake, setShake] = useState(false);

  const check = () => {
    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const a1 = toMin(state.slot1Start), a2 = toMin(state.slot1End);
    const b1 = toMin(state.slot2Start), b2 = toMin(state.slot2End);
    const conflict = a1 < b2 && b1 < a2;
    setState((prev) => ({
      ...prev,
      result: conflict,
      stats: {
        checks: prev.stats.checks + 1,
        noConflicts: prev.stats.noConflicts + (conflict ? 0 : 1),
        conflicts: prev.stats.conflicts + (conflict ? 1 : 0),
      },
    }));
    if (conflict) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } else {
      setShowConfetti(true);
      setShowFireworks(true);
      setTimeout(() => { setShowConfetti(false); setShowFireworks(false); }, 2500);
    }
  };

  return <div className={`relative bg-card p-8 md:p-10 border-[3px] border-electric-pink glow-pink overflow-hidden ${shake ? "animate-shake" : ""}`} style={{ borderRadius: "2rem 0.5rem 2rem 0.5rem", transform: "rotate(-2deg)", animation: shake ? undefined : "float 4s ease-in-out infinite" }}>
    {showConfetti && <ConfettiBlast />}
    {showFireworks && <FireworksEffect />}
    <h2 className="font-display text-3xl md:text-4xl text-gradient-pink-orange mb-4 text-center">⭐ CONFLICT DETECTOR</h2>
    <div className="space-y-3">
      <div className="flex gap-2">
        <input type="time" className="chrono-input flex-1" value={state.slot1Start} onChange={(e) => setState((p) => ({ ...p, slot1Start: e.target.value }))} />
        <input type="time" className="chrono-input flex-1" value={state.slot1End} onChange={(e) => setState((p) => ({ ...p, slot1End: e.target.value }))} />
      </div>
      <p className="text-sm text-center text-muted-foreground">🚀 Slot 1 Start-End</p>
      <div className="flex gap-2">
        <input type="time" className="chrono-input flex-1" value={state.slot2Start} onChange={(e) => setState((p) => ({ ...p, slot2Start: e.target.value }))} />
        <input type="time" className="chrono-input flex-1" value={state.slot2End} onChange={(e) => setState((p) => ({ ...p, slot2End: e.target.value }))} />
      </div>
      <p className="text-sm text-center text-muted-foreground">🎯 Another One</p>
      <button onClick={check} className="chrono-btn-pink w-full py-3 font-display text-xl tracking-wider rounded-lg text-foreground hover:animate-jiggle">💥 CLASH OR PASS?</button>
    </div>
    {state.result !== null && <div className={`mt-4 text-center font-display text-2xl animate-bounce-in ${state.result ? "text-electric-pink" : "text-lime-green"}`}>
      {state.result ? <div className="comic-bubble !bg-electric-pink !text-foreground !border-foreground"><TypewriterText text="💥 CLASH DETECTED! 💥" speed={40} /></div> : <div className="comic-bubble"><TypewriterText text="🎉 ALL CLEAR! PASS! 🎊" speed={40} /></div>}
    </div>}
  </div>;
}
