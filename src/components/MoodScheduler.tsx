import { useFeatureStorage } from "@/hooks/use-feature-storage";

const MOODS = [
  { emoji: "😴", label: "Tired", color: "text-hot-purple" },
  { emoji: "⚡", label: "Energetic", color: "text-sunny-yellow" },
  { emoji: "🎉", label: "Social", color: "text-electric-pink" },
  { emoji: "🧠", label: "Focused", color: "text-neon-cyan" },
];

const SUGGESTIONS: Record<string, string[]> = {
  "😴": ["💤 Skip the brainstorm — do admin tasks instead", "☕ Coffee break FIRST, then light emails", "🎧 Put on lo-fi beats and coast through easy wins"],
  "⚡": ["🚀 TACKLE THAT BIG PROJECT NOW!", "💪 Perfect time for creative brainstorming", "🏃 Stack your hardest meetings back-to-back!"],
  "🎉": ["🤝 Schedule team syncs and 1-on-1s", "🎤 Lead that presentation you've been avoiding", "💬 Perfect day for networking calls!"],
  "🧠": ["📝 Deep work mode — block 2 hours minimum", "🔇 Turn off ALL notifications", "🎯 Solve that complex problem you've been dodging"],
};

export default function MoodScheduler() {
  const { state, setState } = useFeatureStorage("mood-scheduler", { selected: 0, stats: { changes: 0 } });
  const mood = MOODS[state.selected];
  const suggestions = SUGGESTIONS[mood.emoji];

  return <div className="relative bg-card p-8 md:p-10 border-[3px] border-lime-green glow-lime overflow-hidden" style={{ borderRadius: "2rem 3rem 1.5rem 2.5rem", transform: "rotate(1deg)", animation: "float 5.5s ease-in-out 0.8s infinite" }}>
    <h2 className="font-display text-3xl md:text-4xl text-gradient-lime-yellow mb-4 text-center">🌊 MOOD SCHEDULER</h2>
    <div className="flex justify-center gap-3 mb-4 flex-wrap">{MOODS.map((m, i) => <button key={i} onClick={() => setState((p) => ({ selected: i, stats: { changes: p.stats.changes + (p.selected === i ? 0 : 1) } }))} className={`text-3xl p-2 rounded-xl border-2 transition-all duration-200 hover:scale-110 ${i === state.selected ? "border-foreground bg-muted scale-110" : "border-transparent hover:border-muted-foreground"}`}>{m.emoji}</button>)}</div>
    <p className={`text-center font-display text-2xl ${mood.color} mb-4`}>{mood.emoji} {mood.label.toUpperCase()} MODE</p>
    <div className="space-y-2">{suggestions.map((s, i) => <div key={i} className="bg-muted rounded-lg p-3 text-sm font-semibold border border-muted-foreground/20 animate-bounce-in" style={{ animationDelay: `${i * 0.1}s` }}>{s}</div>)}</div>
  </div>;
}
