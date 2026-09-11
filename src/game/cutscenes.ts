import {
  drawScaredMan,
  drawSmugMan,
  roughLine,
  roughRect,
  drawCrossHatch,
  INK,
  BLOOD_INK
} from './renderers';
import { sounds } from '../audio/soundEngine';

export interface CutsceneState {
  type: 'intro' | 'ending';
  time: number;
  duration: number;
  caption: string;
  onComplete: () => void;
}

export function updateIntroCutscene(
  scene: CutsceneState,
  dt: number,
  reducedMotion: boolean
) {
  const prevTime = scene.time;
  scene.time += dt;

  // Sound cue triggers based on timing
  if (prevTime < 4.8 && scene.time >= 4.8) {
    sounds.playGlassShatter();
    sounds.playPunch();
  }
  if (prevTime < 11.5 && scene.time >= 11.5) {
    sounds.playCigarPuff();
  }
  if (prevTime < 19.5 && scene.time >= 19.5) {
    sounds.playDeath();
  }

  // Captions & narrative timing
  if (scene.time < 3.0) {
    scene.caption = "A dark room. Cold air through the floorboards.";
  } else if (scene.time < 5.0) {
    scene.caption = "“Leave me alone!”";
  } else if (scene.time < 8.0) {
    scene.caption = "The glass shatters. He does not stay on his side.";
  } else if (scene.time < 13.0) {
    scene.caption = "“This is the hell you created for yourself.”";
  } else if (scene.time < 17.5) {
    scene.caption = "“Time to Run.”";
  } else if (scene.time < 20.5) {
    scene.caption = "A blink. He vanishes into the shattered frame.";
  } else {
    scene.caption = "Into the mirror.";
  }

  if (scene.time >= scene.duration) {
    scene.onComplete();
  }
}

export function drawIntroCutscene(
  ctx: CanvasRenderingContext2D,
  scene: CutsceneState,
  reducedMotion: boolean
) {
  const W = 960;
  const H = 540;
  const t = scene.time;

  // Background room: Dark weathered walls
  ctx.fillStyle = '#453928';
  ctx.fillRect(0, 0, W, H);
  drawCrossHatch(ctx, 0, 0, W, 400, 30, 'rgba(21, 17, 13, 0.3)');

  // Floor
  ctx.fillStyle = '#2b2116';
  ctx.fillRect(0, 400, W, 140);
  for (let fx = 0; fx < W; fx += 80) {
    roughLine(ctx, fx, 400, fx, 540, INK, 2);
  }

  // Phase 1: Face-to-Face with Mirror (0s - 4.8s)
  if (t < 4.8) {
    // Standing mirror in center
    const mirrorX = 480;
    const mirrorY = 220;

    roughRect(ctx, mirrorX - 110, mirrorY - 140, 220, 280, '#1c1510');
    // Mirror glass
    const isSmugReflection = t >= 2.8;
    const isTransitionFlash = t >= 2.6 && t < 2.8;

    ctx.fillStyle = isTransitionFlash ? '#fff8eb' : '#7d745e';
    ctx.fillRect(mirrorX - 95, mirrorY - 125, 190, 250);
    drawCrossHatch(ctx, mirrorX - 95, mirrorY - 125, 190, 250, 18, 'rgba(21, 17, 13, 0.25)');

    // Scared man standing on left looking at mirror
    drawScaredMan(ctx, mirrorX - 180, mirrorY + 50, 1.25, t);

    // Reflection inside mirror
    ctx.save();
    ctx.beginPath();
    ctx.rect(mirrorX - 95, mirrorY - 125, 190, 250);
    ctx.clip();

    if (isSmugReflection) {
      // Smug alter ego in mirror with glowing eyes
      drawSmugMan(ctx, mirrorX, mirrorY + 30, 1.2, t);
    } else {
      // Normal reflection of scared man
      ctx.scale(-1, 1);
      drawScaredMan(ctx, -mirrorX, mirrorY + 30, 1.2, t);
    }
    ctx.restore();

    // Initial fade in from darkness
    if (t < 1.5) {
      ctx.fillStyle = `rgba(8, 7, 6, ${1 - t / 1.5})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // Phase 2: Smug man punches glass & scared man falls (4.8s - 8.0s)
  else if (t < 8.0) {
    const punchProgress = (t - 4.8) / 3.2;
    const mirrorX = 480;
    const mirrorY = 220;

    // Broken mirror frame
    roughRect(ctx, mirrorX - 110, mirrorY - 140, 220, 280, '#1c1510');
    ctx.fillStyle = '#1c1712';
    ctx.fillRect(mirrorX - 95, mirrorY - 125, 190, 250);

    // Shattered glass shards flying
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const dist = punchProgress * (90 + (i % 5) * 35);
      const sx = mirrorX + Math.cos(angle) * dist;
      const sy = mirrorY + Math.sin(angle) * dist;

      ctx.fillStyle = '#ebdcb9';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 10, sy - 6);
      ctx.lineTo(sx + 6, sy + 12);
      ctx.closePath();
      ctx.fill();
      roughLine(ctx, sx, sy, sx + 10, sy - 6, INK, 1);
    }

    // Fist breaking forward
    roughLine(ctx, mirrorX, mirrorY, mirrorX - 60, mirrorY + 50, INK, 18);

    // Scared man falling backward onto ground
    const fallAngle = Math.min(1.3, punchProgress * 3);
    ctx.save();
    ctx.translate(mirrorX - 220, mirrorY + 120);
    ctx.rotate(-fallAngle);
    drawScaredMan(ctx, 0, 0, 1.2, t);
    ctx.restore();
  }

  // Phase 3: Ground POV looking up at Smug Man (8.0s - 13.0s)
  else if (t < 13.0) {
    // Camera tilted looking up from floor
    // Shattered window frame towering above
    roughRect(ctx, 360, 40, 240, 320, '#18120d');
    ctx.fillStyle = '#0f0c08';
    ctx.fillRect(380, 60, 200, 280);

    // Smug man stepping through frame sleekly, taking puff of cigar, looking down
    drawSmugMan(ctx, 480, 210, 1.55, t);

    // Scared man's hands trembling in foreground
    roughLine(ctx, 220, 520, 280, 470, INK, 14);
    roughLine(ctx, 740, 520, 680, 470, INK, 14);
  }

  // Phase 4: Smug man crouches down close to camera: "Time to Run" (13.0s - 17.5s)
  else if (t < 17.5) {
    // Extreme close up of Smug Alter Ego crouching right in front of player
    drawSmugMan(ctx, 480, 280, 2.6, t);

    // Dim glowing eyes intensifying
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(454, 277, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(506, 277, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Phase 5: Blink, Smug Man vanishes, jump into mirror (17.5s - 22.0s)
  else {
    const blinkProgress = (t - 17.5) / 4.5;

    // Shattered mirror portal open in wall
    roughRect(ctx, 360, 60, 240, 340, '#221910');
    ctx.fillStyle = '#080706';
    ctx.fillRect(380, 80, 200, 300);

    // Eldritch darkness inside the mirror
    drawCrossHatch(ctx, 380, 80, 200, 300, 12, 'rgba(189, 168, 127, 0.25)');

    // Scared runner leaping into the portal
    const leapX = 260 + blinkProgress * 240;
    const leapY = 440 - Math.sin(blinkProgress * Math.PI) * 160;
    drawScaredMan(ctx, leapX, leapY, 1.1, t);

    // Eye blink transition effect
    if (t < 18.2) {
      const eyeLid = Math.sin((t - 17.5) * Math.PI * 2) * (H / 2);
      ctx.fillStyle = '#080706';
      ctx.fillRect(0, 0, W, eyeLid);
      ctx.fillRect(0, H - eyeLid, W, eyeLid);
    }
  }

  // Vignette
  const vignette = ctx.createRadialGradient(W / 2, H / 2, 160, W / 2, H / 2, 520);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(10, 8, 6, 0.85)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

export function drawEndingCutscene(
  ctx: CanvasRenderingContext2D,
  scene: CutsceneState,
  reducedMotion: boolean
) {
  const W = 960;
  const H = 540;
  const t = scene.time;

  // Background: Desolate frozen plains with black ash
  ctx.fillStyle = '#5a5142';
  ctx.fillRect(0, 0, W, H);
  drawCrossHatch(ctx, 0, 0, W, 420, 24, 'rgba(21, 17, 13, 0.35)');

  // Ground
  ctx.fillStyle = '#2f271d';
  ctx.fillRect(0, 420, W, 120);

  // The Smug Alter Ego standing cold and motionless
  drawSmugMan(ctx, 600, 310, 1.45, t);

  // Scared protagonist on knees
  const fallX = 400;
  const fallY = 370;
  drawScaredMan(ctx, fallX, fallY, 1.25, t);

  // Gnarled tree branch in Smug man's hands thrust toward protagonist
  if (t > 4.0) {
    roughLine(ctx, 620, 360, 440, 380, '#2e1c12', 9);
    roughLine(ctx, 480, 375, 450, 350, '#2e1c12', 4);

    // Dark ink/blood pools
    ctx.fillStyle = BLOOD_INK;
    ctx.beginPath();
    ctx.ellipse(420, 425, Math.min(65, (t - 4.0) * 18), 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Captions
  if (t < 3.5) {
    scene.caption = "50,000 metres. The glass has no edge.";
  } else if (t < 7.0) {
    scene.caption = "“You thought distance could change the ending.”";
  } else if (t < 10.0) {
    scene.caption = "A branch from a tree you once climbed as a child.";
  } else {
    scene.caption = "The snow settles. The glass remembers.";
  }

  // Fade into blackness
  if (t > 8.0) {
    const fadeAlpha = Math.min(1, (t - 8.0) / 3.5);
    ctx.fillStyle = `rgba(8, 7, 6, ${fadeAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (scene.time >= scene.duration) {
    scene.onComplete();
  }
}
