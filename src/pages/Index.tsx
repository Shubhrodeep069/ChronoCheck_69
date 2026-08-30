import { useState, type ComponentType } from "react";
import WildClock from "@/components/WildClock";
import ConflictDetector from "@/components/ConflictDetector";
import TimeSlotChecker from "@/components/TimeSlotChecker";
import DurationChecker from "@/components/DurationChecker";
import RandomFactGenerator from "@/components/RandomFactGenerator";
import MoodScheduler from "@/components/MoodScheduler";
import FloatingDecor from "@/components/FloatingDecor";
import ParticleBackground from "@/components/ParticleBackground";
import Tilt3DCard from "@/components/Tilt3DCard";
import VisualTimeGrid from "@/components/VisualTimeGrid";
import ScheduleScore from "@/components/ScheduleScore";
import MultiPersonScheduler from "@/components/MultiPersonScheduler";
import TimeZoneConverter from "@/components/TimeZoneConverter";
import AchievementBadges from "@/components/AchievementBadges";
import DailyRoutineTracker from "@/components/DailyRoutineTracker";
import ThemeToggle from "@/components/ThemeToggle";

const FEATURES = [
  { id: "routine", emoji: "🗓️", label: "ROUTINE TRACKER", desc: "Weekly & monthly task check-ins", color: "border-electric-pink", glow: "glow-pink", gradient: "text-gradient-pink-orange" },
  { id: "conflict", emoji: "💥", label: "CONFLICT DETECTOR", desc: "Find clashing time slots", color: "border-electric-pink", glow: "glow-pink", gradient: "text-gradient-pink-orange" },
  { id: "timeslot", emoji: "🔍", label: "TIME-SLOT SPY", desc: "Check if a time is free", color: "border-neon-cyan", glow: "glow-cyan", gradient: "text-gradient-cyan-purple" },
  { id: "duration", emoji: "⚡", label: "DURATION CHECK", desc: "Does your meeting fit?", color: "border-sunny-yellow", glow: "", gradient: "text-gradient-lime-yellow" },
  { id: "facts", emoji: "🎲", label: "FACT BURST", desc: "Random meeting facts", color: "border-bright-orange", glow: "glow-orange", gradient: "text-gradient-pink-orange" },
  { id: "mood", emoji: "🌊", label: "MOOD SCHEDULER", desc: "Schedule by your vibe", color: "border-lime-green", glow: "glow-lime", gradient: "text-gradient-lime-yellow" },
  { id: "grid", emoji: "📊", label: "VISUAL TIME GRID", desc: "Drag & block your day", color: "border-neon-cyan", glow: "glow-cyan", gradient: "text-gradient-cyan-purple" },
  { id: "multi", emoji: "👥", label: "MULTI-PERSON", desc: "Find common free time", color: "border-sunny-yellow", glow: "", gradient: "text-gradient-lime-yellow" },
  { id: "timezone", emoji: "🌍", label: "TIME ZONES", desc: "World clock converter", color: "border-bright-orange", glow: "glow-orange", gradient: "text-gradient-pink-orange" },
  { id: "score", emoji: "📈", label: "SCHEDULE SCORE", desc: "Track progress from zero", color: "border-hot-purple", glow: "glow-purple", gradient: "text-gradient-cyan-purple" },
  { id: "badges", emoji: "🏆", label: "ACHIEVEMENTS", desc: "Earn badges with real usage", color: "border-electric-pink", glow: "glow-pink", gradient: "text-gradient-pink-orange" },
] as const;

type FeatureId = typeof FEATURES[number]["id"];

const FEATURE_COMPONENTS: Record<FeatureId, ComponentType> = {
  routine: DailyRoutineTracker,
  conflict: ConflictDetector,
  timeslot: TimeSlotChecker,
  duration: DurationChecker,
  facts: RandomFactGenerator,
  mood: MoodScheduler,
  grid: VisualTimeGrid,
  multi: MultiPersonScheduler,
  timezone: TimeZoneConverter,
  score: ScheduleScore,
  badges: AchievementBadges,
};

export default function Index() {
  const [active, setActive] = useState<FeatureId | null>(null);

  const ActiveComponent = active ? FEATURE_COMPONENTS[active] : null;
  const activeFeature = FEATURES.find((feature) => feature.id === active);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--page-gradient)", backgroundSize: "400% 400%", animation: "gradient-shift 15s ease infinite" }}>
      <ParticleBackground />
      <FloatingDecor />

      <div className="relative z-10 px-4 py-8 md:px-8 max-w-7xl mx-auto">
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        <header className="text-center mb-8 md:mb-12" style={{ transform: "rotate(-1deg)" }}>
          <div className="inline-block relative">
            <h1 className="font-display text-7xl md:text-9xl text-gradient-pink-orange leading-none">CHRONOCHECK</h1>
            <span className="absolute -top-4 -right-8 text-4xl animate-float">⚡</span>
            <span className="absolute -bottom-2 -left-6 text-3xl animate-float-slow">🔥</span>
          </div>
          <p className="font-display text-2xl md:text-3xl text-neon-cyan mt-2 tracking-widest">YOUR SCHEDULE, NOW TRACKED FOR REAL</p>
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            {["🗓️ DAILY ROUTINES", "💾 SAVED PROGRESS", "☀️ LIGHT MODE READY"].map((tag) => (
              <span key={tag} className="bg-muted border-2 border-hot-purple text-foreground font-bold text-xs md:text-sm px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </header>

        <section className="mb-10 md:mb-14 flex justify-center" style={{ transform: "rotate(1deg)" }}>
          <Tilt3DCard>
            <div className="bg-card/50 backdrop-blur-sm border-2 border-neon-cyan rounded-2xl p-6 md:p-8 glow-cyan">
              <WildClock />
            </div>
          </Tilt3DCard>
        </section>

        {!active && (
          <div className="animate-fade-in">
            <h2 className="font-display text-3xl md:text-4xl text-center text-gradient-cyan-purple mb-8">🎯 PICK YOUR TOOL 🎯</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {FEATURES.map((feature, index) => (
                <Tilt3DCard key={feature.id}>
                  <button
                    onClick={() => setActive(feature.id)}
                    className={`w-full bg-card/80 backdrop-blur-sm border-[3px] ${feature.color} rounded-2xl p-5 md:p-6 text-center transition-all duration-300 hover:scale-105 group ${feature.glow}`}
                    style={{ transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)` }}
                  >
                    <span className="text-4xl md:text-5xl block mb-2 group-hover:scale-125 transition-transform duration-300">{feature.emoji}</span>
                    <h3 className={`font-display text-sm md:text-base ${feature.gradient} leading-tight mb-1`}>{feature.label}</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">{feature.desc}</p>
                  </button>
                </Tilt3DCard>
              ))}
            </div>
          </div>
        )}

        {active && ActiveComponent && (
          <div className="animate-bounce-in">
            <button
              onClick={() => setActive(null)}
              className="mb-6 flex items-center gap-2 bg-muted/50 backdrop-blur-sm border-2 border-muted-foreground/30 rounded-full px-5 py-2 font-display text-lg text-foreground hover:border-neon-cyan hover:text-neon-cyan transition-all duration-300 hover:scale-105 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              BACK TO TOOLS
            </button>

            <div className="text-center mb-6">
              <span className="text-5xl block mb-2">{activeFeature?.emoji}</span>
              <h2 className={`font-display text-4xl md:text-5xl ${activeFeature?.gradient}`}>{activeFeature?.label}</h2>
            </div>

            <div className="max-w-5xl mx-auto">
              <Tilt3DCard>
                <ActiveComponent />
              </Tilt3DCard>
            </div>
          </div>
        )}

        <footer className="text-center mt-16 md:mt-24 pb-8" style={{ transform: "rotate(1deg)" }}>
          <p className="font-display text-xl text-muted-foreground">MADE WITH 🔥, REAL TRACKING, AND ZERO FAKE STARTER STATS</p>
        </footer>
      </div>
    </div>
  );
}
