"use client";

import { useEffect, useRef } from "react";

interface RainStream {
  x: number;
  y: number; // current pixel position of the head
  speed: number;
  fontSize: number;
  color: string;
  opacity: number;
  glow: boolean;
  chars: string[];
  maxLength: number;
}

export function BinaryRainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const streams: RainStream[] = [];

    const initializeStreams = () => {
      streams.length = 0;
      // Beautiful density: roughly one stream per 20-30 pixels of screen width
      const spacing = 24;
      const count = Math.floor(canvas.width / spacing);

      for (let i = 0; i < count; i++) {
        // Depth cue: 0.15 (far background) to 1.0 (near foreground)
        const depth = 0.15 + Math.random() * 0.85;
        
        // Font sizes scaled according to depth (ranging from 12px to 42px)
        const fontSize = Math.floor(12 + depth * 30);
        
        // Speed proportional to depth/size for genuine 3D parallax falling speed
        const speed = 0.8 + depth * 2.8;
        
        // Cyberpunk colors: 70% Matrix neon green, 30% digital cyan
        const color = Math.random() > 0.3 ? "#39ff14" : "#00d1ff";
        
        // Opacity proportional to depth so background streams fade out gracefully
        const opacity = 0.1 + depth * 0.8;
        
        // High depth streams emit a strong neon glow
        const glow = depth > 0.65;
        
        // Random stream character length (8 to 22 characters)
        const maxLength = Math.floor(8 + depth * 14);
        
        // Populate initial binary trail
        const chars: string[] = [];
        for (let j = 0; j < maxLength; j++) {
          chars.push(Math.random() > 0.5 ? "1" : "0");
        }

        streams.push({
          // Slightly jitter horizontal position for natural volumetric dispersion
          x: i * spacing + (Math.random() * 12 - 6),
          // Stagger starting heights so they enter the screen sequentially
          y: Math.random() * -canvas.height - 100,
          speed,
          fontSize,
          color,
          opacity,
          glow,
          chars,
          maxLength,
        });
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      canvas.height = parent ? parent.offsetHeight : window.innerHeight;
      initializeStreams();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement || document.body);
    resize();

    const draw = () => {
      // Clear the canvas completely on each frame to draw beautiful, crisp, glows without blurring artifacts
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let s = 0; s < streams.length; s++) {
        const stream = streams[s];

        // Draw each stream character in its trail from head to tail
        for (let i = 0; i < stream.maxLength; i++) {
          const charY = stream.y - i * stream.fontSize;

          // Skip drawing if character is off-screen
          if (charY < -stream.fontSize || charY > canvas.height + stream.fontSize) {
            continue;
          }

          const char = stream.chars[i] || "1";
          
          // Tail opacity graduates from 1.0 (head) to 0.05 (tail end)
          const tailFade = 1.0 - i / stream.maxLength;
          
          // Edge fade near bottom of the banner for seamless transition
          const bottomFade = Math.min(1, (canvas.height - charY) / 120);
          
          const currentOpacity = stream.opacity * tailFade * Math.max(0, bottomFade);
          if (currentOpacity <= 0) continue;

          // Head character (i === 0) is drawn with extra brightness and optional neon glow
          if (i === 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 1.1})`;
            if (stream.glow) {
              ctx.shadowColor = stream.color;
              ctx.shadowBlur = 18;
            } else {
              ctx.shadowBlur = 0;
            }
          } else {
            ctx.shadowBlur = 0;
            // Digital green or cyan body
            if (stream.color === "#39ff14") {
              ctx.fillStyle = `rgba(57, 255, 20, ${currentOpacity})`;
            } else {
              ctx.fillStyle = `rgba(0, 209, 255, ${currentOpacity})`;
            }
          }

          ctx.font = `bold ${stream.fontSize}px 'Fira Code', 'Courier New', monospace`;
          ctx.fillText(char, stream.x, charY);
        }

        // Reset drop shadow for subsequent draws
        ctx.shadowBlur = 0;

        // Move the stream down
        stream.y += stream.speed;

        // Randomly morph symbols within the trail at a low rate for dynamic matrix texture
        if (Math.random() > 0.95) {
          const randIdx = Math.floor(Math.random() * stream.chars.length);
          stream.chars[randIdx] = Math.random() > 0.5 ? "1" : "0";
        }

        // Reset stream once it falls completely off-screen
        const streamTotalHeight = stream.maxLength * stream.fontSize;
        if (stream.y - streamTotalHeight > canvas.height) {
          stream.y = Math.random() * -300 - 50;
          stream.x = Math.random() * canvas.width;
          // Re-randomize binary symbols
          for (let j = 0; j < stream.maxLength; j++) {
            stream.chars[j] = Math.random() > 0.5 ? "1" : "0";
          }
        }
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
        className="w-full h-full opacity-[0.45]" // Amplified visibility for amazing aesthetic impact
      />
      {/* High-quality smooth bottom gradient overlay blending into cyber-black */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#05070c] via-[#05070c]/80 to-transparent pointer-events-none" />
    </div>
  );
}
