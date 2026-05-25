"use client";

import { useEffect, useRef } from "react";

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resizing dynamic listener
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Dynamic characters set (Binary + Katakana + Hex)
    const chars = "0123456789ABCDEFｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ".split("");
    const fontSize = 15;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    
    // Y-drops coordinates state
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      // Clear overlay with slight transparency to create beautiful faded trace trails
      ctx.fillStyle = "rgba(5, 7, 12, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Premium cyber-staggered theme styling
        const colorRand = Math.random();
        if (colorRand > 0.96) {
          ctx.fillStyle = "rgba(0, 209, 255, 0.16)"; // Electric Cyan
        } else if (colorRand > 0.93) {
          ctx.fillStyle = "rgba(255, 0, 85, 0.15)"; // Cyber Laser Pink
        } else {
          ctx.fillStyle = "rgba(57, 255, 20, 0.11)"; // Matrix Neon Green
        }

        const x = i * fontSize;
        ctx.fillText(char, x, y * fontSize);

        // Reset drop index when hitting the bottom or by chance
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      });
    };

    // Steady 30fps rendering loop
    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-50 h-full w-full opacity-[0.35]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
