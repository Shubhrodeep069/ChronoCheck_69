const DECOR = [
  { emoji: "🔥", top: "5%", left: "3%", size: "text-5xl", delay: "0s" },
  { emoji: "✨", top: "15%", right: "5%", size: "text-6xl", delay: "1s" },
  { emoji: "🎨", top: "40%", left: "2%", size: "text-4xl", delay: "0.5s" },
  { emoji: "🎮", bottom: "20%", right: "3%", size: "text-5xl", delay: "1.5s" },
  { emoji: "🤖", bottom: "10%", left: "5%", size: "text-4xl", delay: "2s" },
  { emoji: "⚡", top: "60%", right: "2%", size: "text-5xl", delay: "0.8s" },
  { emoji: "🎯", top: "80%", left: "8%", size: "text-3xl", delay: "1.2s" },
  { emoji: "💎", top: "25%", left: "90%", size: "text-4xl", delay: "0.3s" },
];

export default function FloatingDecor() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated gradient blobs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, hsl(268, 72%, 59%), transparent)",
          top: "-10%",
          right: "-10%",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, hsl(187, 100%, 50%), transparent)",
          bottom: "-5%",
          left: "-5%",
          animation: "float 10s ease-in-out 2s infinite",
        }}
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, hsl(342, 100%, 60%), transparent)",
          top: "40%",
          left: "30%",
          animation: "float 7s ease-in-out 1s infinite",
        }}
      />
      {/* Floating emojis */}
      {DECOR.map((d, i) => (
        <span
          key={i}
          className={`absolute ${d.size} opacity-30 select-none`}
          style={{
            top: d.top,
            left: d.left,
            right: d.right,
            bottom: d.bottom,
            animation: `float 4s ease-in-out ${d.delay} infinite`,
          } as React.CSSProperties}
        >
          {d.emoji}
        </span>
      ))}
    </div>
  );
}
