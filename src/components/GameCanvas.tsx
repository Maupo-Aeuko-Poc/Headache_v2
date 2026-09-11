import React, { useEffect, useRef, useState } from 'react';
import {
  Player,
  Platform,
  Monster,
  SurrealObject,
  RiddleGate,
  BiomeConfig,
  Difficulty,
  Particle,
  MemoryShard
} from '../types';
import {
  drawPlatform,
  drawMonster,
  drawSurrealObject,
  drawRiddleGate,
  drawRunner,
  drawScenery,
  drawMemoryShard,
  INK
} from '../game/renderers';
import {
  drawAnimatedPlayer,
  drawAnimatedMonster,
  drawSeamlessPlatform
} from '../game/spriteSheets';
import { LevelGenerator } from '../game/levelGenerator';
import { getBiomeForDistance } from '../game/biomes';
import { sounds } from '../audio/soundEngine';

interface GameCanvasProps {
  difficulty: Difficulty;
  resolution: number;
  reducedMotion: boolean;
  onDie: (reason: string, distance: number) => void;
  onAskRiddle: (gate: RiddleGate) => void;
  onReachGoal: () => void;
  activeGate: RiddleGate | null;
  onUpdateStats: (distance: number, biome: BiomeConfig, dashCooldown: number) => void;
  warpMetersRef: React.MutableRefObject<number | null>;
  seed?: number;
}

const W = 960;
const H = 540;
const METER_PX = 10;
const GOAL_METERS = 50000;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  difficulty,
  resolution,
  reducedMotion,
  onDie,
  onAskRiddle,
  onReachGoal,
  activeGate,
  onUpdateStats,
  warpMetersRef,
  seed
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeVirtualKeys, setActiveVirtualKeys] = useState<Record<string, boolean>>({});

  const onDieRef = useRef(onDie);
  onDieRef.current = onDie;
  const onAskRiddleRef = useRef(onAskRiddle);
  onAskRiddleRef.current = onAskRiddle;
  const onReachGoalRef = useRef(onReachGoal);
  onReachGoalRef.current = onReachGoal;
  const onUpdateStatsRef = useRef(onUpdateStats);
  onUpdateStatsRef.current = onUpdateStats;
  const activeGateRef = useRef(activeGate);
  activeGateRef.current = activeGate;
  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;
  const resolutionRef = useRef(resolution);
  resolutionRef.current = resolution;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const lastReportedMeterRef = useRef(-1);
  const lastReportedCdRef = useRef(-1);

  // References for game state to keep RAF loop completely independent of React renders
  const stateRef = useRef<{
    generator: LevelGenerator;
    platforms: Platform[];
    monsters: Monster[];
    objects: SurrealObject[];
    gates: RiddleGate[];
    shards: MemoryShard[];
    particles: Particle[];
    player: Player;
    camX: number;
    furthestX: number;
    keys: Set<string>;
    time: number;
    isRunning: boolean;
    seed: number;
  }>({
    generator: new LevelGenerator(Date.now(), difficulty),
    platforms: [],
    monsters: [],
    objects: [],
    gates: [],
    shards: [],
    particles: [],
    player: {
      x: 80,
      y: 400,
      vx: 0,
      vy: 0,
      width: 20,
      height: 40,
      face: 1,
      grounded: true,
      coyoteTimer: 0.14,
      jumpQueueTimer: 0,
      jumpsLeft: 2,
      dashTimer: 0,
      dashCooldown: 0,
      dashQueueTimer: 0,
      graceTimer: 2.0,
      wallSlide: false,
      wallDir: 0,
      animFrame: 0
    },
    camX: 0,
    furthestX: 80,
    keys: new Set(),
    time: 0,
    isRunning: true,
    seed: Date.now()
  });

  // Handle warping (e.g. from fast-travel in settings)
  useEffect(() => {
    if (warpMetersRef.current !== null) {
      const targetMeters = warpMetersRef.current;
      warpMetersRef.current = null;

      const targetX = targetMeters * METER_PX;
      const s = stateRef.current;
      s.player.x = targetX + 60;
      s.player.y = 350;
      s.player.vx = 0;
      s.player.vy = 0;
      s.player.graceTimer = 2.0;
      s.furthestX = Math.max(s.furthestX, targetX);
      s.camX = Math.max(0, targetX - 240);

      s.generator.nextX = Math.max(s.generator.nextX, targetX);
      s.generator.generateUpTo(
        targetX + 2400,
        s.platforms,
        s.monsters,
        s.objects,
        s.gates
      );
    }
  }, [warpMetersRef]);

  // Main game loop
  useEffect(() => {
    const s = stateRef.current;
    s.seed = (Date.now() ^ Math.floor(Math.random() * 0xffffff)) >>> 0;
    s.generator = new LevelGenerator(s.seed, difficulty);
    s.platforms = [];
    s.monsters = [];
    s.objects = [];
    s.gates = [];
    s.particles = [];
    s.camX = 0;
    s.furthestX = 80;
    s.time = 0;
    s.isRunning = true;

    // Reset player
    s.player = {
      x: 80,
      y: 380,
      vx: 0,
      vy: 0,
      width: 18,
      height: 40,
      face: 1,
      grounded: true,
      coyoteTimer: 0.12,
      jumpQueueTimer: 0,
      jumpsLeft: 2,
      dashTimer: 0,
      dashCooldown: 0,
      dashQueueTimer: 0,
      graceTimer: 2.0,
      wallSlide: false,
      wallDir: 0,
      animFrame: 0
    };

    // Pre-generate initial 2,800 pixels
    s.generator.generateUpTo(
      2800,
      s.platforms,
      s.monsters,
      s.objects,
      s.gates,
      s.shards
    );

    // Keyboard handlers
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) ||
        e.key === ' '
      ) {
        e.preventDefault();
      }
      s.keys.add(e.code);
      if (e.key) {
        s.keys.add(e.key);
        s.keys.add(e.key.toLowerCase());
      }
      if (
        ['Space', 'KeyW', 'ArrowUp', 'KeyZ'].includes(e.code) ||
        e.key === ' ' ||
        e.key === 'w' ||
        e.key === 'W' ||
        e.key === 'ArrowUp'
      ) {
        s.player.jumpQueueTimer = 0.20;
      }
      if (
        ['ShiftLeft', 'ShiftRight', 'KeyX', 'KeyC', 'KeyK'].includes(e.code) ||
        e.key === 'Shift' ||
        e.key === 'x' ||
        e.key === 'X' ||
        e.key === 'c' ||
        e.key === 'C'
      ) {
        s.player.dashQueueTimer = 0.20;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      s.keys.delete(e.code);
      if (e.key) {
        s.keys.delete(e.key);
        s.keys.delete(e.key.toLowerCase());
      }
    };

    const onBlur = () => {
      s.keys.clear();
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // Custom touch/virtual key dispatch listeners
    const onCustomKeyDown = (e: Event) => {
      const customE = e as CustomEvent<string>;
      onKeyDown({ code: customE.detail } as KeyboardEvent);
    };
    const onCustomKeyUp = (e: Event) => {
      const customE = e as CustomEvent<string>;
      onKeyUp({ code: customE.detail } as KeyboardEvent);
    };
    window.addEventListener('game:keydown', onCustomKeyDown);
    window.addEventListener('game:keyup', onCustomKeyUp);

    let animFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (!s.isRunning) return;

      const dt = Math.min(0.045, (now - lastTime) / 1000);
      lastTime = now;
      s.time += dt;

      // When answering a riddle, gameplay pauses physics
      if (!activeGateRef.current) {
        // Physics update
        updatePhysics(
          s,
          dt,
          difficultyRef.current,
          onDieRef.current,
          onAskRiddleRef.current,
          onReachGoalRef.current
        );
      }

      // Render frame
      if (canvasRef.current) {
        renderFrame(canvasRef.current, s, resolutionRef.current, reducedMotionRef.current);
      }

      // Report stats to parent HUD
      const currentMeters = Math.floor(s.furthestX / METER_PX);
      const currentCd = s.player.dashCooldown;
      if (
        currentMeters !== lastReportedMeterRef.current ||
        Math.abs(currentCd - lastReportedCdRef.current) > 0.06
      ) {
        lastReportedMeterRef.current = currentMeters;
        lastReportedCdRef.current = currentCd;
        const currentBiome = getBiomeForDistance(currentMeters);
        onUpdateStatsRef.current(currentMeters, currentBiome, currentCd);
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    // Initial autofocus to ensure keyboard events register immediately
    canvasRef.current?.focus();

    return () => {
      s.isRunning = false;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('game:keydown', onCustomKeyDown);
      window.removeEventListener('game:keyup', onCustomKeyUp);
    };
  }, [difficulty]);

  const handleVirtualDown = (code: string) => {
    stateRef.current.keys.add(code);
    setActiveVirtualKeys((prev) => ({ ...prev, [code]: true }));
    if (code === 'Space') {
      stateRef.current.player.jumpQueueTimer = 0.24;
    }
    if (code === 'ShiftLeft') {
      stateRef.current.player.dashQueueTimer = 0.24;
    }
  };

  const handleVirtualUp = (code: string) => {
    stateRef.current.keys.delete(code);
    setActiveVirtualKeys((prev) => ({ ...prev, [code]: false }));
  };

  return (
    <div
      tabIndex={0}
      onClick={() => canvasRef.current?.focus()}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#060504] outline-none"
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        width={Math.round(W * resolution)}
        height={Math.round(H * resolution)}
        className="w-full h-full object-contain block select-none cursor-crosshair outline-none"
        style={{ aspectRatio: '16/9' }}
      />

      {/* On-screen Controls Dock (Always accessible for touch and mouse) */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30 select-none">
        {/* Left / Right Movement Buttons */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            id="control-btn-left"
            aria-label="Move Left"
            onMouseDown={() => handleVirtualDown('KeyA')}
            onMouseUp={() => handleVirtualUp('KeyA')}
            onMouseLeave={() => handleVirtualUp('KeyA')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleVirtualDown('KeyA');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleVirtualUp('KeyA');
            }}
            className={`px-4 py-2.5 rounded border text-sm sm:text-base font-courier font-bold tracking-widest transition-colors shadow-lg active:scale-95 ${
              activeVirtualKeys['KeyA']
                ? 'bg-[#ebdcb9] text-[#15110d] border-[#ebdcb9]'
                : 'bg-[#18120d]/85 text-[#c7b38e] border-[#423425] hover:border-[#826b4e]'
            }`}
          >
            ← A
          </button>
          <button
            id="control-btn-right"
            aria-label="Move Right"
            onMouseDown={() => handleVirtualDown('KeyD')}
            onMouseUp={() => handleVirtualUp('KeyD')}
            onMouseLeave={() => handleVirtualUp('KeyD')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleVirtualDown('KeyD');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleVirtualUp('KeyD');
            }}
            className={`px-4 py-2.5 rounded border text-sm sm:text-base font-courier font-bold tracking-widest transition-colors shadow-lg active:scale-95 ${
              activeVirtualKeys['KeyD']
                ? 'bg-[#ebdcb9] text-[#15110d] border-[#ebdcb9]'
                : 'bg-[#18120d]/85 text-[#c7b38e] border-[#423425] hover:border-[#826b4e]'
            }`}
          >
            D →
          </button>
        </div>

        {/* Dash and Jump Action Buttons */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            id="control-btn-dash"
            aria-label="Dash"
            onMouseDown={() => handleVirtualDown('ShiftLeft')}
            onMouseUp={() => handleVirtualUp('ShiftLeft')}
            onMouseLeave={() => handleVirtualUp('ShiftLeft')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleVirtualDown('ShiftLeft');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleVirtualUp('ShiftLeft');
            }}
            className={`px-4 py-2.5 rounded border text-sm sm:text-base font-courier font-bold tracking-widest transition-colors shadow-lg active:scale-95 ${
              activeVirtualKeys['ShiftLeft']
                ? 'bg-[#d58936] text-[#0a0806] border-[#d58936]'
                : 'bg-[#18120d]/85 text-[#c7b38e] border-[#423425] hover:border-[#826b4e]'
            }`}
          >
            ⚡ DASH [X]
          </button>
          <button
            id="control-btn-jump"
            aria-label="Jump"
            onMouseDown={() => handleVirtualDown('Space')}
            onMouseUp={() => handleVirtualUp('Space')}
            onMouseLeave={() => handleVirtualUp('Space')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleVirtualDown('Space');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleVirtualUp('Space');
            }}
            className={`px-5 py-2.5 rounded border text-sm sm:text-base font-courier font-bold tracking-widest transition-colors shadow-lg active:scale-95 ${
              activeVirtualKeys['Space']
                ? 'bg-[#ebdcb9] text-[#15110d] border-[#ebdcb9]'
                : 'bg-[#18120d]/85 text-[#c7b38e] border-[#423425] hover:border-[#826b4e]'
            }`}
          >
            ↑ JUMP [W]
          </button>
        </div>
      </div>
    </div>
  );
};

// Physics and level interaction
function updatePhysics(
  s: {
    generator: LevelGenerator;
    platforms: Platform[];
    monsters: Monster[];
    objects: SurrealObject[];
    gates: RiddleGate[];
    shards: MemoryShard[];
    particles: Particle[];
    player: Player;
    camX: number;
    furthestX: number;
    keys: Set<string>;
    time: number;
    seed: number;
  },
  dt: number,
  difficulty: Difficulty,
  onDie: (reason: string, distance: number) => void,
  onAskRiddle: (gate: RiddleGate) => void,
  onReachGoal: () => void
) {
  const p = s.player;

  // Timers
  p.jumpQueueTimer = Math.max(0, p.jumpQueueTimer - dt);
  p.dashQueueTimer = Math.max(0, p.dashQueueTimer - dt);
  p.dashCooldown = Math.max(0, p.dashCooldown - dt);
  p.graceTimer = Math.max(0, p.graceTimer - dt);
  p.coyoteTimer = p.grounded ? 0.12 : Math.max(0, p.coyoteTimer - dt);

  // Speeds tuned to difficulty
  const baseSpeed = difficulty === 'dream' ? 270 : difficulty === 'nightmare' ? 290 : 310;

  // Input direction - full multi-layout and key support
  const moveLeft =
    s.keys.has('KeyA') ||
    s.keys.has('KeyQ') ||
    s.keys.has('ArrowLeft') ||
    s.keys.has('a') ||
    s.keys.has('A') ||
    s.keys.has('q') ||
    s.keys.has('Q') ||
    s.keys.has('Left');

  const moveRight =
    s.keys.has('KeyD') ||
    s.keys.has('ArrowRight') ||
    s.keys.has('d') ||
    s.keys.has('D') ||
    s.keys.has('Right');

  const dir = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);

  if (dir !== 0) {
    p.face = dir as 1 | -1;
  }

  // Jump input query
  const wantsJump =
    s.keys.has('Space') ||
    s.keys.has('KeyW') ||
    s.keys.has('ArrowUp') ||
    s.keys.has('KeyZ') ||
    s.keys.has(' ') ||
    s.keys.has('w') ||
    s.keys.has('W') ||
    s.keys.has('z') ||
    s.keys.has('Z') ||
    s.keys.has('Up');

  // Dash input query
  const wantsDash =
    s.keys.has('ShiftLeft') ||
    s.keys.has('ShiftRight') ||
    s.keys.has('Shift') ||
    s.keys.has('KeyX') ||
    s.keys.has('KeyC') ||
    s.keys.has('KeyK') ||
    s.keys.has('x') ||
    s.keys.has('X') ||
    s.keys.has('c') ||
    s.keys.has('C') ||
    s.keys.has('k') ||
    s.keys.has('K');

  if (wantsJump && p.jumpQueueTimer <= 0 && p.coyoteTimer > 0) {
    p.jumpQueueTimer = 0.16;
  }
  if (wantsDash && p.dashQueueTimer <= 0 && p.dashCooldown <= 0) {
    p.dashQueueTimer = 0.16;
  }

  // Jump execution (Super Mario variable jump + Hollow Knight double jump)
  if (p.jumpQueueTimer > 0 && (p.coyoteTimer > 0 || p.jumpsLeft > 0)) {
    p.dashTimer = 0;
    p.vy = -540; // Solid upward launch
    const isFirstJump = p.coyoteTimer > 0;
    p.jumpsLeft = isFirstJump ? 1 : p.jumpsLeft - 1;
    p.grounded = false;
    p.coyoteTimer = 0;
    p.jumpQueueTimer = 0;

    if (isFirstJump) {
      sounds.playJump();
    } else {
      sounds.playDoubleJump();
    }
  }

  // Dash execution
  if (p.dashQueueTimer > 0 && p.dashCooldown <= 0) {
    p.dashTimer = 0.20;
    p.dashCooldown = 0.75;
    p.dashQueueTimer = 0;
    sounds.playDash();

    // Spawn initial dash burst particles
    for (let i = 0; i < 6; i++) {
      s.particles.push({
        x: p.x - p.face * 10,
        y: p.y + p.height * 0.5 + (Math.random() - 0.5) * 20,
        vx: -p.face * (180 + Math.random() * 100),
        vy: (Math.random() - 0.5) * 60,
        size: Math.random() * 5 + 3,
        life: 0,
        maxLife: 0.45,
        color: '#2e1c12',
        type: 'smoke'
      });
    }
  }

  // Velocity update
  if (p.dashTimer > 0) {
    p.dashTimer -= dt;
    p.vx = p.face * 740;
    p.vy = 0;

    // Trail particles during dash for fluid motion feel
    if (Math.random() < dt * 45) {
      s.particles.push({
        x: p.x - p.face * 14,
        y: p.y + p.height * 0.5 + (Math.random() - 0.5) * 18,
        vx: -p.face * 80 + (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 40,
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: 0.35,
        color: '#1c1510',
        type: 'smoke'
      });
    }
  } else {
    // Horizontal acceleration & friction - ultra responsive
    const accel = p.grounded ? 28 : 16;
    p.vx += (dir * baseSpeed - p.vx) * Math.min(1, dt * accel);

    // Gravity
    p.vy = Math.min(800, p.vy + 1500 * dt);

    // Variable jump height: release jump button early to drop faster
    if (!wantsJump && p.vy < -160) {
      p.vy += 2000 * dt;
    }
  }

  // Footstep audio trigger
  if (p.grounded && Math.abs(p.vx) > 50 && Math.random() < dt * 4) {
    sounds.playFootstep();
  }

  // Movement integration
  const prevFeetY = p.y + p.height;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  const feetY = p.y + p.height;
  p.grounded = false;

  // Platform collision
  for (const plat of s.platforms) {
    // Check horizontal overlap with generous player bounds
    const halfW = p.width * 0.5;
    if (p.x + halfW > plat.x && p.x - halfW < plat.x + plat.w) {
      // Landing on top of platform
      if (p.vy >= 0) {
        const topThresh = plat.y + Math.max(28, p.vy * dt + 14);
        if (prevFeetY <= topThresh && feetY >= plat.y - 3 && p.y <= plat.y + plat.h) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.grounded = true;
          p.coyoteTimer = 0.14;
          p.jumpsLeft = 2;
          break;
        }
      }
    }

    // Side wall collision for solid barriers (e.g. starting back wall)
    if (!plat.oneWay && p.y + p.height > plat.y + 8 && p.y < plat.y + plat.h - 8) {
      if (p.vx > 0 && p.x + halfW >= plat.x && p.x < plat.x) {
        p.x = plat.x - halfW;
        p.vx = 0;
      } else if (p.vx < 0 && p.x - halfW <= plat.x + plat.w && p.x > plat.x + plat.w) {
        p.x = plat.x + plat.w + halfW;
        p.vx = 0;
      }
    }
  }

  // Left boundary clamp (permits running back to bedroom back wall at x = -80)
  const minX = Math.max(-80, s.camX - 60);
  if (p.x < minX) {
    p.x = minX;
    p.vx = Math.max(0, p.vx);
  }

  // Track max distance reached
  s.furthestX = Math.max(s.furthestX, p.x);
  const currentMeters = Math.floor(s.furthestX / METER_PX);

  // Check 50,000m victory
  if (currentMeters >= GOAL_METERS) {
    onReachGoal();
    return;
  }

  // Memory Shard pickup
  for (const shard of s.shards) {
    if (!shard.collected) {
      const dx = p.x - shard.x;
      const dy = p.y + p.height * 0.5 - shard.y;
      if (Math.hypot(dx, dy) < 32) {
        shard.collected = true;
        p.graceTimer = Math.max(p.graceTimer, 3.5);
        sounds.playGlassShatter();
        // Burst particles
        for (let i = 0; i < 8; i++) {
          s.particles.push({
            x: shard.x,
            y: shard.y,
            vx: (Math.random() - 0.5) * 120,
            vy: (Math.random() - 0.5) * 120 - 40,
            size: Math.random() * 3 + 2,
            life: 0,
            maxLife: 1.2,
            color: '#ffd700',
            type: 'shard'
          });
        }
      }
    }
  }

  // Bottom chasm pit death
  if (p.y > 640) {
    sounds.playDeath();
    onDie('The space beneath the floor was hungry.', currentMeters);
    return;
  }

  // Smooth camera tracking
  const targetCamX = Math.max(0, p.x - 260);
  s.camX += (targetCamX - s.camX) * Math.min(1, dt * 10);

  // Dynamic chunk generation ahead of camera
  s.generator.generateUpTo(
    s.camX + W + 1200,
    s.platforms,
    s.monsters,
    s.objects,
    s.gates,
    s.shards
  );

  // Memory cleanup of far behind chunks
  const cullX = s.camX - 800;
  s.platforms = s.platforms.filter((pl) => pl.x + pl.w >= cullX);
  s.monsters = s.monsters.filter((m) => m.baseX >= cullX);
  s.objects = s.objects.filter((obj) => obj.x >= cullX);
  s.gates = s.gates.filter((g) => g.x >= cullX);
  s.shards = s.shards.filter((sh) => sh.x >= cullX);

  // Riddle Gate interaction: approach within 85px stops player and triggers question
  for (const gate of s.gates) {
    if (!gate.solved && p.x >= gate.x - 90 && p.x <= gate.x + 40) {
      p.x = gate.x - 90;
      p.vx = 0;
      onAskRiddle(gate);
      return;
    }
  }

  // Monster movement and danger
  let closestMonsterDist = 9999;

  for (const m of s.monsters) {
    // Patrol & dynamic kinematic trajectories
    if (m.range > 0) {
      if (m.type === 'flying_leech') {
        // Undulating aerial trajectory
        m.x = m.baseX + Math.cos(s.time * 1.6 + m.phase) * m.range;
        m.y = m.baseY + Math.sin(s.time * 2.8 + m.phase) * 20;
      } else if (m.type === 'raven_swarm') {
        // Swooping aerial circles
        m.x = m.baseX + Math.cos(s.time * 2.2 + m.phase) * m.range;
        m.y = m.baseY + Math.sin(s.time * 3.4 + m.phase) * 16;
      } else if (m.type === 'thorn_leaper') {
        // Leaping parabolic hops
        const leapCycle = (s.time * 2.5 + m.phase) % (Math.PI * 2);
        const hopY = Math.abs(Math.sin(leapCycle)) * 28;
        m.x = m.baseX + Math.sin(s.time * 1.8 + m.phase) * m.range;
        m.y = m.baseY - hopY;
      } else if (m.type === 'spider_shadow') {
        // Rapid skitter
        m.x = m.baseX + Math.sin(s.time * 3.2 + m.phase) * m.range;
      } else if (m.type === 'pendulum_blade') {
        // Pendulum wide sweep
        m.x = m.baseX + Math.sin(s.time * 2.8 + m.phase) * m.range;
      } else {
        m.x = m.baseX + Math.sin(s.time * (m.type === 'nine_arms' ? 1.4 : 1.1) + m.phase) * m.range;
      }
    }

    if (!m.harmless) {
      const dx = p.x - m.x;
      const dy = p.y - m.y;
      const dist = Math.hypot(dx, dy);
      closestMonsterDist = Math.min(closestMonsterDist, dist);

      // Hitbox collision
      if (
        p.graceTimer <= 0 &&
        Math.abs(dx) < (m.width * 0.45 + p.width * 0.5) &&
        p.y + p.height > m.y - m.height &&
        p.y < m.y + 4
      ) {
        sounds.playDeath();
        const deathNotes: Record<string, string> = {
          hound: 'All three mouths remembered your name.',
          nine_arms: 'Too many hands. Nowhere to hold on.',
          stilt_walker: 'A long needle pierced through your shadow.',
          tree_mouth: 'The roots closed their teeth around your ankles.',
          eyeball_mass: 'The mass drank your reflection.',
          spider_shadow: 'Cold needle-sharp legs wrapped around your throat.',
          weeping_scarecrow: 'The straw filled with black tar and pinned you down.',
          clockwork_automaton: 'Steel gears ground your bones to powder.',
          flying_leech: 'The lamprey mouth drained the warmth from your veins.',
          bloody_mannequin: 'Its porcelain fingers snapped your wrists.',
          eyeball_spire: 'The petrifying gaze locked your blood in place.',
          thorn_leaper: 'Barbed spines ripped through your chest.',
          raven_swarm: 'A hundred beaks tore away your memories.',
          pendulum_blade: 'The rusted pendulum cleaved you in two.',
          crawling_hand: 'Pale fingers dug deep into your marrow.',
          weeping_watcher: 'The gaze stripped away what remained of your sanity.'
        };
        onDie(deathNotes[m.type] || 'The nightmare caught you.', currentMeters);
        return;
      }
    }
  }

  // Heartbeat intensity updates based on proximity to dangerous entity
  sounds.updateHeartbeat(closestMonsterDist);

  // Weather particles
  const biome = getBiomeForDistance(currentMeters);
  updateParticles(s, dt, biome);
}

function updateParticles(
  s: { particles: Particle[]; camX: number },
  dt: number,
  biome: BiomeConfig
) {
  // Spawn particles
  if (s.particles.length < 35 && Math.random() < 0.6) {
    s.particles.push({
      x: s.camX + Math.random() * W,
      y: Math.random() * H * 0.4,
      vx: (Math.random() - 0.5) * 30 - 20,
      vy: Math.random() * 40 + 20,
      size: Math.random() * 2.5 + 1,
      life: 0,
      maxLife: Math.random() * 6 + 4,
      color: biome.particleType === 'embers' ? '#e87c24' : '#d6c4a3',
      type: 'ash'
    });
  }

  for (let i = s.particles.length - 1; i >= 0; i--) {
    const pt = s.particles[i];
    pt.life += dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;

    if (pt.life >= pt.maxLife || pt.y > H + 20) {
      s.particles.splice(i, 1);
    }
  }
}

function renderFrame(
  canvas: HTMLCanvasElement,
  s: {
    platforms: Platform[];
    monsters: Monster[];
    objects: SurrealObject[];
    gates: RiddleGate[];
    shards: MemoryShard[];
    particles: Particle[];
    player: Player;
    camX: number;
    furthestX: number;
    time: number;
  },
  resolution: number,
  reducedMotion: boolean
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(resolution, 0, 0, resolution, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const currentMeters = Math.floor(s.furthestX / METER_PX);
  const biome = getBiomeForDistance(currentMeters);

  // 1. Scenery & Parallax
  drawScenery(ctx, s.camX, biome, s.time);

  // 2. Surreal Incongruous Objects
  for (const obj of s.objects) {
    drawSurrealObject(ctx, obj, s.camX, s.time);
  }

  // 3. Platforms (Seamless dark organic textures, zero white boxes)
  for (const plat of s.platforms) {
    drawSeamlessPlatform(ctx, plat, s.camX, s.time);
  }

  // 4. Memory Shards
  for (const shard of s.shards) {
    drawMemoryShard(ctx, shard, s.camX, s.time);
  }

  // 5. Riddle Gates
  for (const gate of s.gates) {
    drawRiddleGate(ctx, gate, s.camX, s.time);
  }

  // 6. Monsters (Transparent multi-frame animated sprites, zero white boxes)
  for (const monster of s.monsters) {
    drawAnimatedMonster(ctx, monster, s.camX, s.time);
  }

  // 7. Player (Runner) with 4-frame animation, coat flutter and dash trails
  drawAnimatedPlayer(ctx, s.player, s.camX, s.time);

  // 8. Atmospheric & action particles (Dash trails / shard sparkles / ash flakes)
  for (const pt of s.particles) {
    if (pt.type === 'smoke' || pt.type === 'shard') {
      const px = pt.x - s.camX;
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, 1 - pt.life / pt.maxLife) * (pt.type === 'smoke' ? 0.65 : 0.9);
      ctx.fillRect(px, pt.y, pt.size, pt.size);
    } else {
      const px = pt.x - s.camX * 0.4;
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.sin((pt.life / pt.maxLife) * Math.PI) * 0.5;
      ctx.fillRect(((px % W) + W) % W, pt.y, pt.size, pt.size);
    }
  }
  ctx.globalAlpha = 1.0;

  // 9. Dark Vignette & Aged Parchment Paper Texture
  const vignette = ctx.createRadialGradient(W / 2, H / 2, 140, W / 2, H / 2, 540);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(12, 9, 7, 0.78)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}
