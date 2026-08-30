import { useState, type ReactNode, type MouseEvent } from "react";

interface RippleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function RippleButton({ children, onClick, className = "", disabled }: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    onClick?.();
  };

  return (
    <button onClick={handleClick} className={`relative overflow-hidden ${className}`} disabled={disabled}>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-foreground/20 pointer-events-none"
          style={{
            left: r.x - 50,
            top: r.y - 50,
            width: 100,
            height: 100,
            animation: "ripple-expand 0.6s ease-out forwards",
          }}
        />
      ))}
      {children}
    </button>
  );
}
