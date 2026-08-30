const EMOJIS = ["🚀", "✨", "💥", "🎉", "🎊", "⭐", "🔥", "💫"];

export default function ConfettiBlast() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 40}%`,
            animation: `confetti-fall ${0.8 + Math.random() * 1.2}s ease-out ${Math.random() * 0.3}s forwards`,
          }}
        >
          {EMOJIS[i % EMOJIS.length]}
        </span>
      ))}
    </div>
  );
}
