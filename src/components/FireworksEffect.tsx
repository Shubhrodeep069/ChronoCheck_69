import { useEffect, useRef } from "react";

export default function FireworksEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = canvas.parentElement?.clientHeight || 400;

    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[] = [];
    const colors = ["#FF3366", "#00F5FF", "#FF9F1C", "#9D4EDD", "#B3FF3A", "#FFE74C"];

    // Create 3 burst points
    for (let burst = 0; burst < 3; burst++) {
      const cx = canvas.width * (0.2 + Math.random() * 0.6);
      const cy = canvas.height * (0.2 + Math.random() * 0.4);
      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.3;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
        });
      }
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.life -= 0.015;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Trail
        ctx.beginPath();
        ctx.arc(p.x - p.vx, p.y - p.vy, p.size * p.life * 0.5, 0, Math.PI * 2);
        ctx.globalAlpha = Math.max(0, p.life * 0.3);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (alive) animId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50"
    />
  );
}
