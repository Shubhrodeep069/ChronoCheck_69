import { useState, useEffect, useCallback } from "react";

const STYLES = ["flip", "emoji-analog", "text"] as const;

export default function WildClock() {
  const [time, setTime] = useState(new Date());
  const [styleIdx, setStyleIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const s = setInterval(() => setStyleIdx((i) => (i + 1) % STYLES.length), 10000);
    return () => { clearInterval(t); clearInterval(s); };
  }, []);

  const cycleStyle = useCallback(() => setStyleIdx((i) => (i + 1) % STYLES.length), []);

  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();
  const h12 = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  const pad = (n: number) => String(n).padStart(2, "0");

  const style = STYLES[styleIdx];

  return (
    <div
      onClick={cycleStyle}
      className="cursor-pointer select-none text-center"
      title="Click to change style!"
    >
      {style === "flip" && (
        <div className="flex items-center justify-center gap-2">
          {[pad(h12), pad(m), pad(s)].map((digit, i) => (
            <div
              key={i}
              className="relative bg-midnight border-[3px] border-neon-cyan rounded-lg px-3 py-2 glow-cyan"
            >
              <span className="font-display text-5xl md:text-7xl text-gradient-cyan-purple">
                {digit}
              </span>
            </div>
          ))}
          <span className="font-display text-3xl text-electric-pink ml-2 animate-float">{ampm}</span>
        </div>
      )}

      {style === "emoji-analog" && (
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-neon-cyan glow-cyan flex items-center justify-center bg-midnight/80">
            {/* Hour hand */}
            <div
              className="absolute text-4xl origin-bottom"
              style={{
                transform: `rotate(${(h % 12) * 30 + m * 0.5}deg) translateY(-30px)`,
                bottom: "50%",
              }}
            >
              👆
            </div>
            {/* Minute hand */}
            <div
              className="absolute text-3xl origin-bottom"
              style={{
                transform: `rotate(${m * 6}deg) translateY(-40px)`,
                bottom: "50%",
              }}
            >
              ☝️
            </div>
            {/* Second hand */}
            <div
              className="absolute text-2xl origin-bottom"
              style={{
                transform: `rotate(${s * 6}deg) translateY(-45px)`,
                bottom: "50%",
                transition: "transform 0.2s ease",
              }}
            >
              🔥
            </div>
            <span className="text-3xl">⏰</span>
          </div>
          {/* Decorative emojis around */}
          {["🕐", "🕒", "🕕", "🕘"].map((e, i) => (
            <span
              key={i}
              className="absolute text-xl"
              style={{
                top: `${50 + 48 * Math.sin((i * Math.PI) / 2 - Math.PI / 2)}%`,
                left: `${50 + 48 * Math.cos((i * Math.PI) / 2 - Math.PI / 2)}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {e}
            </span>
          ))}
        </div>
      )}

      {style === "text" && (
        <div className="space-y-1">
          <div className="font-display text-5xl md:text-7xl text-gradient-pink-orange">
            It's {h12} o'clock!
          </div>
          <div className="font-display text-3xl md:text-4xl text-neon-cyan">
            and {m} minutes {s} seconds ⚡
          </div>
          <div className="text-2xl animate-float">{h >= 6 && h < 12 ? "🌅" : h < 18 ? "☀️" : h < 21 ? "🌆" : "🌙"}</div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2 opacity-60">tap to switch vibes ✨</p>
    </div>
  );
}
