"use client";

import { useEffect, useRef } from "react";

export function BinaryRainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const fontSize = 22; // Much larger characters for premium visibility
    let cols = Math.floor(canvas.width / fontSize);
    
    // Arrays for column states
    const drops: number[] = [];
    const speeds: number[] = [];
    const colors: string[] = [];

    const initializeColumns = () => {
      cols = Math.floor(canvas.width / fontSize);
      drops.length = 0;
      speeds.length = 0;
      colors.length = 0;

      for (let i = 0; i < cols; i++) {
        // Start columns at random off-screen positions
        drops.push(Math.floor(Math.random() * -50));
        // Vary speeds to create a rich 3D parallax depth effect (0.75x to 1.75x)
        speeds.push(0.65 + Math.random() * 1.15);
        // Curate dual-color cyberpunk mix: 80% Matrix Green, 20% Cyber Cyan
        colors.push(Math.random() > 0.22 ? "#39ff14" : "#00d1ff");
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      canvas.height = parent ? parent.offsetHeight : window.innerHeight;
      initializeColumns();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement || document.body);
    resize();

    const draw = () => {
      // Translucent fill for rich motion trails
      ctx.fillStyle = "rgba(5, 7, 12, 0.14)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `black ${fontSize}px 'Fira Code', 'Courier New', monospace`;

      for (let i = 0; i < cols; i++) {
        const char = Math.random() > 0.5 ? "1" : "0";
        const y = drops[i] * fontSize;
        const color = colors[i];

        // Draw shadow effect for neon light emission
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;

        // Leading character is brighter and has a direct glow
        if (Math.random() > 0.94) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 18;
        } else {
          const alpha = 0.2 + Math.random() * 0.7; // Vary alpha for texture
          // Convert hex colors to translucent rgba
          ctx.fillStyle = color === "#39ff14" 
            ? `rgba(57, 255, 20, ${alpha})` 
            : `rgba(0, 209, 255, ${alpha})`;
        }

        ctx.fillText(char, i * fontSize, y);
        ctx.shadowBlur = 0; // Reset shadow blur for other canvas draws

        // Reset column when it goes past canvas bottom (randomized chance)
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          speeds[i] = 0.65 + Math.random() * 1.15;
        }
        
        // Advance column based on its individual speed factor
        drops[i] += speeds[i];
      }
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full opacity-[0.25]" // Elegant opacity so it doesn't distract readability
      />
      {/* Visual fading mask: smooth transition into the black background at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05070c] to-transparent pointer-events-none" />
    </div>
  );
}
