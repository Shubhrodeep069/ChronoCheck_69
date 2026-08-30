import { useState } from "react";
import { useFeatureStorage } from "@/hooks/use-feature-storage";

const FACTS = [
  "🤯 The average person spends 31 HOURS in meetings per month. That's like binge-watching 10 seasons of a show!",
  "📊 73% of people do other work during meetings. We see you, multitaskers!",
  "⏰ Monday 9 AM is the MOST dreaded meeting time. Surprise surprise!",
  "🧠 It takes 23 minutes to refocus after a meeting interruption. RIP productivity!",
  "💰 Unnecessary meetings cost US companies $37 BILLION per year. That's a lot of pizza!",
  "😴 The ideal meeting length is 25 minutes. Anything longer and brains start melting!",
  "🎮 Workers spend about 4 hours per week just PREPARING for meetings. Could've been gaming!",
  "🤖 By 2025, AI will eliminate 50% of unnecessary meetings. The robots are saving us!",
  "🌍 Time zones mean someone is ALWAYS in a meeting somewhere. The meeting never stops!",
  "🍕 Meetings with food are rated 30% more productive. Pizza = productivity confirmed!",
  "📱 92% of people admit to multitasking during virtual meetings. The other 8% are lying!",
  "⚡ Standing meetings are 34% shorter than sitting ones. Legs don't lie!",
];

export default function RandomFactGenerator() {
  const { state, setState } = useFeatureStorage("random-facts", { fact: null as string | null, stats: { spins: 0 } });
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    setSpinning(true);
    setTimeout(() => {
      const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
      setState((prev) => ({ fact, stats: { spins: prev.stats.spins + 1 } }));
      setSpinning(false);
    }, 800);
  };

  return <div className="relative bg-card p-8 md:p-10 border-[3px] border-bright-orange glow-orange overflow-hidden" style={{ borderRadius: "1rem 3rem 1rem 3rem", transform: "rotate(2deg)", animation: "float 4.5s ease-in-out 0.3s infinite" }}>
    <h2 className="font-display text-3xl md:text-4xl text-gradient-pink-orange mb-4 text-center">💥 FACT BURST</h2>
    <button onClick={spin} disabled={spinning} className="btn-3d-purple w-full py-4 font-display text-2xl tracking-wider rounded-xl text-foreground hover:animate-jiggle disabled:opacity-50">{spinning ? "🌀 SPINNING..." : "🎲 SPIN THE FACT"}</button>
    {state.fact && !spinning && <div className="mt-4 animate-bounce-in"><div className="comic-bubble text-base font-body font-semibold leading-relaxed">{state.fact}</div></div>}
  </div>;
}
