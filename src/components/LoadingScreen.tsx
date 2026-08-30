import { useEffect, useState } from "react";
import { Clock, Zap, Sparkles } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    // Animate progress over 2 seconds
    const duration = 2000;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(onComplete, 200);
      }
    };

    requestAnimationFrame(updateProgress);

    return () => clearInterval(dotsInterval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl animate-float"
          style={{
            background: "linear-gradient(135deg, #ff2d92, #ff6b35)",
            top: "10%",
            left: "10%",
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full opacity-20 blur-3xl animate-float-slow"
          style={{
            background: "linear-gradient(135deg, #00f0ff, #9d4edd)",
            bottom: "20%",
            right: "15%",
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-15 blur-3xl animate-float"
          style={{
            background: "linear-gradient(135deg, #ccff00, #fffc31)",
            top: "50%",
            right: "30%",
            animationDelay: "1s",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo/Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 animate-pulse">
            <Clock className="w-24 h-24 mx-auto text-[#ff2d92] opacity-50 blur-sm" />
          </div>
          <Clock className="w-24 h-24 mx-auto text-[#ff2d92] relative z-10" />
          <Sparkles className="w-8 h-8 text-[#00f0ff] absolute -top-2 -right-4 animate-bounce" />
          <Zap className="w-6 h-6 text-[#fffc31] absolute -bottom-2 -left-4 animate-pulse" />
        </div>

        {/* Title */}
        <h1
          className="font-display text-5xl md:text-7xl mb-4"
          style={{
            background: "linear-gradient(135deg, #ff2d92, #ff6b35, #00f0ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          CHRONOCHECK
        </h1>

        {/* Loading text */}
        <p className="text-[#00f0ff] font-display text-xl md:text-2xl mb-8">
          LOADING YOUR SCHEDULE{dots}
        </p>

        {/* Progress bar */}
        <div className="w-64 md:w-80 mx-auto">
          <div className="h-3 bg-[#1a1a2e] rounded-full overflow-hidden border-2 border-[#9d4edd]">
            <div
              className="h-full rounded-full transition-all duration-100 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #ff2d92, #ff6b35, #00f0ff)",
                boxShadow: "0 0 20px rgba(255, 45, 146, 0.5)",
              }}
            />
          </div>
          <p className="text-[#ccff00] font-display text-sm mt-2">{Math.round(progress)}%</p>
        </div>

        {/* Fun facts while loading */}
        <div className="mt-8 text-muted-foreground text-sm max-w-md mx-auto">
          <p className="italic">
            &ldquo;The average person spends 2.5 years of their life in meetings&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
