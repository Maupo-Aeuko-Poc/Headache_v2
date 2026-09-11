import React, { useEffect, useRef } from 'react';
import { drawScaredMan, drawSmugMan, roughLine, drawCrossHatch, INK } from '../game/renderers';
import { assetLoader } from '../game/imageAssets';

interface MainMenuProps {
  onRun: () => void;
  onBreathe: () => void;
  onDie: () => void;
  highScore: number;
  reducedMotion: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onRun,
  onBreathe,
  onDie,
  highScore,
  reducedMotion
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 2-second alternating timer between Scared Man and Smug Man as requested in PDF page 2
  useEffect(() => {
    let animFrameId: number;

    const render = (now: number) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const W = canvas.width;
          const H = canvas.height;
          ctx.clearRect(0, 0, W, H);

          // Background of the portrait box: Weathered rugged dark ochre
          ctx.fillStyle = '#261f17';
          ctx.fillRect(0, 0, W, H);

          // Timing: 2 seconds scared, 2 seconds smug
          const cycle = (now / 1000) % 4;
          const isScared = cycle < 2.0;

          // Glitch / transition phase around the 2-second mark
          const isGlitching =
            !reducedMotion &&
            ((cycle > 1.82 && cycle < 2.1) || (cycle > 3.82 || cycle < 0.1));

          const jitterX = isGlitching ? (Math.random() - 0.5) * 14 : 0;
          const jitterY = isGlitching ? (Math.random() - 0.5) * 8 : 0;

          ctx.save();
          ctx.translate(jitterX, jitterY);

          // Draw high-resolution authentic generated split portrait from PDF page 1
          const portraitImg = assetLoader.getImage('menuPortrait');
          if (portraitImg) {
            // Draw photo/etching asset
            ctx.drawImage(portraitImg, 8, 8, W - 16, H - 16);

            // Scared side highlight (left) or Smug side highlight (right)
            if (isScared) {
              // Darken right side subtly to emphasize scared expression
              ctx.fillStyle = 'rgba(10, 8, 6, 0.45)';
              ctx.fillRect(W / 2, 8, W / 2 - 8, H - 16);

              // Scared left eye twitch and sweat drops
              const tremor = (Math.random() - 0.5) * 2;
              ctx.fillStyle = 'rgba(235, 220, 185, 0.12)';
              ctx.fillRect(8 + tremor, 8, W / 2 - 8, H - 16);

              // Tear droplet dripping
              const tearY = 80 + ((now / 1000) * 45) % 90;
              ctx.fillStyle = '#ebdcb9';
              ctx.beginPath();
              ctx.arc(W * 0.32, tearY, 2, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Darken left side subtly to emphasize smug alter-ego
              ctx.fillStyle = 'rgba(10, 8, 6, 0.45)';
              ctx.fillRect(8, 8, W / 2 - 8, H - 16);

              // Glowing cigar ember on right side
              const emberPulse = Math.sin(now / 150) * 0.3 + 0.7;
              ctx.fillStyle = `rgba(232, 106, 36, ${emberPulse})`;
              ctx.shadowColor = '#e86a24';
              ctx.shadowBlur = 10;
              ctx.fillRect(W * 0.72, H * 0.62, 5, 5);
              ctx.shadowBlur = 0;

              // Drifting smoke curls
              for (let i = 0; i < 4; i++) {
                const sy = H * 0.6 - i * 16 - ((now / 1000) * 14) % 44;
                const sx = W * 0.74 + Math.sin(now / 400 + i) * 8;
                ctx.strokeStyle = `rgba(224, 214, 189, ${0.35 - i * 0.08})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(sx, sy, 8 + i * 3, 0, Math.PI * 2);
                ctx.stroke();
              }
            }

            if (isGlitching) {
              // Scratchy glitch lines cutting across portrait
              ctx.fillStyle = 'rgba(255, 60, 40, 0.25)';
              ctx.fillRect(8, (Math.random() * (H - 40)), W - 16, 12);
              for (let i = 0; i < 14; i++) {
                const gy = Math.random() * H;
                roughLine(
                  ctx,
                  Math.random() * 40,
                  gy,
                  W - Math.random() * 40,
                  gy + (Math.random() - 0.5) * 10,
                  i % 2 === 0 ? INK : '#ebdcb9',
                  1.5
                );
              }
            }
          } else {
            // Procedural fallback while image prepares
            drawCrossHatch(ctx, 0, 0, W, H, 14, 'rgba(21, 17, 13, 0.35)');
            if (isScared) {
              drawScaredMan(ctx, W / 2, H / 2 + 10, 1.45, now / 1000);
            } else {
              drawSmugMan(ctx, W / 2, H / 2 + 10, 1.45, now / 1000);
            }
          }

          ctx.restore();

          // Inked portrait borders & corners
          ctx.lineWidth = 4;
          ctx.strokeStyle = INK;
          ctx.strokeRect(4, 4, W - 8, H - 8);
          roughLine(ctx, 0, 0, W, 0, INK, 3);
          roughLine(ctx, W, 0, W, H, INK, 3);
          roughLine(ctx, W, H, 0, H, INK, 3);
          roughLine(ctx, 0, H, 0, 0, INK, 3);

          // Center torn paper crease separating the two halves
          roughLine(ctx, W / 2, 8, W / 2, H - 8, 'rgba(21, 17, 13, 0.7)', 2, 2.5);

          // Paper corner ticks
          for (let i = 0; i < 8; i++) {
            roughLine(ctx, i * 14, 0, i * 12, 16, INK, 1);
            roughLine(ctx, W - i * 14, H, W - i * 12, H - 16, INK, 1);
          }
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-10 z-20 pointer-events-auto bg-[#0a0806]/85 backdrop-blur-[2px]">
      {/* Left Column: Title & Buttons */}
      <div className="flex flex-col items-start justify-center max-w-lg space-y-6">
        <div className="space-y-1">
          <h1 className="font-cinzel text-5xl sm:text-7xl font-black tracking-tight text-[#d5c29b] drop-shadow-[2px_3px_0_#000]">
            HEADACHE
          </h1>
          <p className="font-elite text-sm sm:text-base text-[#9e8b6b] tracking-wide">
            by Maupo Aeuko Poc
          </p>
        </div>

        <nav aria-label="Main Menu" className="flex flex-col space-y-3 pt-4 w-56 sm:w-68">
          {/* Run button (Plays Prologue and launches directly into Run) */}
          <button
            id="menu-btn-run"
            onClick={onRun}
            className="eerie-button text-left flex items-center justify-between group py-3 px-5 text-xl font-bold"
          >
            <span className="text-xl tracking-wider text-[#f5ebd7] group-hover:text-[#ffffff]">Run</span>
            <span className="opacity-60 group-hover:opacity-100 transition-opacity text-xs font-courier tracking-widest text-[#d5c29b]">
              [ START ]
            </span>
          </button>

          {/* Breathe button (Settings) */}
          <button
            id="menu-btn-breathe"
            onClick={onBreathe}
            className="eerie-button text-left flex items-center justify-between group py-2.5 px-5"
          >
            <span className="text-lg">Breathe</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-courier tracking-widest text-[#ebdcb9]">
              [ SETTINGS ]
            </span>
          </button>

          {/* Die button (Exit) */}
          <button
            id="menu-btn-die"
            onClick={onDie}
            className="eerie-button text-left flex items-center justify-between group py-2.5 px-4 text-[#a88264] hover:text-[#d96a57]"
          >
            <span>Die</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-courier tracking-widest">
              [ EXIT ]
            </span>
          </button>
        </nav>

        {/* Eerie Lore Epigraph from PDF */}
        <div className="pt-6 space-y-2 border-t border-[#47392a] max-w-sm text-xs font-elite text-[#806f57] leading-relaxed">
          <p className="italic">
            “Nothing outside the glass is real. Nothing inside it is kind.”
          </p>
          <p className="text-[11px] opacity-75">
            Controls: A / D or ← / → to move · Space to jump twice · Shift / X to dash.
          </p>
          {highScore > 0 && (
            <p className="text-[#c4b08b] font-courier font-bold pt-1">
              The glass remembers {highScore.toLocaleString()} metres reached.
            </p>
          )}
        </div>
      </div>

      {/* Right Column: The 2-Second Alternating Glitching Portrait Box */}
      <div className="mt-8 md:mt-0 flex flex-col items-center">
        <div className="relative p-2 bg-[#261f17] border border-[#524434] shadow-[0_0_35px_rgba(0,0,0,0.9)]">
          <canvas
            ref={canvasRef}
            width={320}
            height={380}
            className="w-64 h-80 sm:w-80 sm:h-96 block"
          />
          {/* Subtle label below box */}
          <div className="mt-2 text-center font-cinzel text-[11px] tracking-[0.25em] text-[#705e46]">
            ONE FACE · TWO WAYS TO LIE
          </div>
        </div>
      </div>
    </div>
  );
};
