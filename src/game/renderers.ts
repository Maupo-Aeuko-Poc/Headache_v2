import {
  Player,
  Platform,
  Monster,
  SurrealObject,
  RiddleGate,
  BiomeConfig,
  MemoryShard
} from '../types';
import { assetLoader } from './imageAssets';

export const INK = '#15110d';
export const PAPER = '#c7b38e';
export const HIGHLIGHT = '#ebdcb9';
export const BLOOD_INK = '#4f1a14';

// Simple deterministic pseudo-random for rendering textures
function prng(seed: number) {
  let s = Math.sin(seed) * 10000;
  return s - Math.floor(s);
}

/**
 * Draws a jittery rough line mimicking hand-scratched ink
 */
export function roughLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = INK,
  width = 2,
  jitterAmount = 1.2
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const segments = Math.max(2, Math.floor(dist / 14));

  ctx.moveTo(x1, y1);
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const nx = -dy / dist;
    const ny = dx / dist;
    const offset = (Math.random() - 0.5) * jitterAmount * 2;
    ctx.lineTo(x1 + dx * t + nx * offset, y1 + dy * t + ny * offset);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a cross-hatched rectangle (woodcut/etching style)
 */
export function drawCrossHatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  spacing = 9,
  color = 'rgba(21, 17, 13, 0.45)'
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Diagonal hatch 1
  for (let d = -h; d < w + h; d += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + d, y);
    ctx.lineTo(x + d + h, y + h);
    ctx.stroke();
  }

  // Diagonal hatch 2 (cross)
  for (let d = -h; d < w + h; d += spacing * 1.4) {
    ctx.beginPath();
    ctx.moveTo(x + d, y + h);
    ctx.lineTo(x + d + h, y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws a rugged box with uneven inked borders
 */
export function roughRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill = '#5a4c38',
  stroke = INK
) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);

  roughLine(ctx, x - 2, y, x + w + 2, y, stroke, 2);
  roughLine(ctx, x + w, y - 2, x + w, y + h + 2, stroke, 2);
  roughLine(ctx, x + w + 2, y + h, x - 2, y + h, stroke, 2);
  roughLine(ctx, x, y + h + 2, x, y - 2, stroke, 2);
  ctx.restore();
}

/**
 * Draws the Scared Man portrait (wild eyes, gasping mouth, disheveled, ragged collar)
 */
export function drawScaredMan(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  time = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const jitter = Math.sin(time * 30) * 1.5;

  // Ragged Torso / Rolled up sleeves
  ctx.fillStyle = '#8f7e5f';
  ctx.beginPath();
  ctx.moveTo(-45 + jitter, 110);
  ctx.lineTo(-40, 45);
  ctx.lineTo(-18, 26);
  ctx.lineTo(18, 26);
  ctx.lineTo(40, 45);
  ctx.lineTo(45 - jitter, 110);
  ctx.closePath();
  ctx.fill();

  drawCrossHatch(ctx, -42, 38, 84, 72, 7, 'rgba(21, 17, 13, 0.4)');
  roughLine(ctx, -16, 26, -6, 60, INK, 2);
  roughLine(ctx, 16, 26, 6, 60, INK, 2);
  roughLine(ctx, 0, 48, 0, 110, INK, 2);

  // Arms / trembling hands clutching chest
  ctx.fillStyle = '#b7a27d';
  ctx.beginPath();
  ctx.ellipse(-25, 78 + jitter, 14, 18, 0.4, 0, Math.PI * 2);
  ctx.fill();
  roughLine(ctx, -38, 70, -20, 88, INK, 2);
  roughLine(ctx, -34, 76, -18, 92, INK, 1.5);

  ctx.beginPath();
  ctx.ellipse(25, 78 - jitter, 14, 18, -0.4, 0, Math.PI * 2);
  ctx.fill();
  roughLine(ctx, 38, 70, 20, 88, INK, 2);
  roughLine(ctx, 34, 76, 18, 92, INK, 1.5);

  // Neck
  ctx.fillStyle = '#b7a27d';
  ctx.fillRect(-12, 16, 24, 20);
  roughLine(ctx, -12, 16, -12, 34, INK, 2);
  roughLine(ctx, 12, 16, 12, 34, INK, 2);

  // Head (sunken cheeks, terrified oval)
  ctx.fillStyle = '#c5b18b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  roughLine(ctx, -24, 0, -20, 24, INK, 2);
  roughLine(ctx, 24, 0, 20, 24, INK, 2);
  roughLine(ctx, -20, 24, 0, 32, INK, 2);
  roughLine(ctx, 20, 24, 0, 32, INK, 2);

  // Wild, disheveled, ragged hair
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(-24, -8);
  ctx.lineTo(-32 + jitter, -26);
  ctx.lineTo(-20, -22);
  ctx.lineTo(-14, -38 + jitter);
  ctx.lineTo(-2, -26);
  ctx.lineTo(8, -40 - jitter);
  ctx.lineTo(16, -26);
  ctx.lineTo(28 + jitter, -30);
  ctx.lineTo(24, -8);
  ctx.lineTo(20, -18);
  ctx.lineTo(-18, -18);
  ctx.closePath();
  ctx.fill();

  // Wide, bloodshot, terrified eyes
  // Left eye
  ctx.fillStyle = '#ebdcb9';
  ctx.beginPath();
  ctx.ellipse(-10, -3, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  roughLine(ctx, -16, -3, -4, -3, INK, 2);
  // Dilated trembling pupil
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-10 + jitter * 0.3, -3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.fillStyle = '#ebdcb9';
  ctx.beginPath();
  ctx.ellipse(10, -3, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  roughLine(ctx, 4, -3, 16, -3, INK, 2);
  // Pupil
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(10 + jitter * 0.3, -3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows raised in extreme distress
  roughLine(ctx, -17, -14, -6, -18, INK, 2.5);
  roughLine(ctx, 17, -14, 6, -18, INK, 2.5);

  // Nose (sharp jagged bone)
  roughLine(ctx, 0, -5, -3, 8, INK, 2);
  roughLine(ctx, -3, 8, 3, 9, INK, 2);

  // Gasping, screaming open mouth
  ctx.fillStyle = '#1c130d';
  ctx.beginPath();
  ctx.ellipse(0, 19, 7, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  roughLine(ctx, -7, 17, 7, 17, INK, 2);
  roughLine(ctx, -5, 23, 5, 23, INK, 2);

  // Sweat / tear droplets
  ctx.strokeStyle = '#ebdcb9';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-16, 12);
  ctx.lineTo(-18, 22 + jitter);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws the Smug Alter Ego portrait (top hat, smirking grin, cigar with smoke, glowing dim eyes)
 */
export function drawSmugMan(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  time = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Crisp, confident tailored jacket
  ctx.fillStyle = '#221a14';
  ctx.beginPath();
  ctx.moveTo(-45, 110);
  ctx.lineTo(-42, 45);
  ctx.lineTo(-18, 24);
  ctx.lineTo(18, 24);
  ctx.lineTo(42, 45);
  ctx.lineTo(45, 110);
  ctx.closePath();
  ctx.fill();

  drawCrossHatch(ctx, -40, 36, 80, 74, 8, 'rgba(189, 168, 127, 0.25)');
  roughLine(ctx, -18, 24, 0, 48, '#705b41', 2);
  roughLine(ctx, 18, 24, 0, 48, '#705b41', 2);
  roughLine(ctx, 0, 48, 0, 110, INK, 2);

  // Sharp collar & tie
  ctx.fillStyle = '#b7a27d';
  ctx.beginPath();
  ctx.moveTo(-10, 24);
  ctx.lineTo(0, 38);
  ctx.lineTo(10, 24);
  ctx.closePath();
  ctx.fill();
  roughLine(ctx, -10, 24, 0, 38, INK, 1.5);
  roughLine(ctx, 10, 24, 0, 38, INK, 1.5);

  // Head
  ctx.fillStyle = '#bfae8b';
  ctx.beginPath();
  ctx.ellipse(0, 2, 23, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  roughLine(ctx, -23, 2, -18, 26, INK, 2);
  roughLine(ctx, 23, 2, 18, 26, INK, 2);
  roughLine(ctx, -18, 26, 0, 32, INK, 2);
  roughLine(ctx, 18, 26, 0, 32, INK, 2);

  // Smug alter ego eyes: narrow, dim glowing white
  ctx.fillStyle = '#1c140e';
  ctx.beginPath();
  ctx.ellipse(-10, -1, 7, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, -1, 7, 3, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Dim glowing white pupils (piercing into player's soul)
  ctx.fillStyle = '#fff9eb';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(-10, -1, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(10, -1, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Arrogant slanted eyebrows
  roughLine(ctx, -18, -8, -6, -5, INK, 2.5);
  roughLine(ctx, 18, -6, 6, -9, INK, 2.5);

  // Nose
  roughLine(ctx, 0, -4, -3, 8, INK, 2);
  roughLine(ctx, -3, 8, 3, 9, INK, 2);

  // Asymmetrical smirking grin
  roughLine(ctx, -12, 17, 0, 21, INK, 2.5);
  roughLine(ctx, 0, 21, 14, 15, INK, 3);
  roughLine(ctx, 12, 14, 17, 12, INK, 2);

  // Cigar in mouth
  ctx.fillStyle = '#4a3321';
  ctx.save();
  ctx.translate(11, 19);
  ctx.rotate(0.25);
  ctx.fillRect(0, -3, 24, 6);
  roughLine(ctx, 0, -3, 24, -3, INK, 1.5);
  roughLine(ctx, 24, -3, 24, 3, INK, 1.5);
  roughLine(ctx, 24, 3, 0, 3, INK, 1.5);

  // Red/orange glowing ember at tip
  ctx.fillStyle = '#e86a24';
  ctx.shadowColor = '#e86a24';
  ctx.shadowBlur = 8;
  ctx.fillRect(23, -3, 3, 6);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Drifting curls of cigar smoke
  for (let i = 0; i < 4; i++) {
    const smokeY = -i * 14 - (time * 15) % 30;
    const smokeX = 34 + Math.sin(time * 3 + i) * (8 + i * 4);
    ctx.strokeStyle = `rgba(224, 214, 189, ${Math.max(0, 0.45 - i * 0.1)})`;
    ctx.lineWidth = 1.5 + i;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, 6 + i * 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Tilted Victorian top hat
  ctx.save();
  ctx.translate(0, -28);
  ctx.rotate(-0.06);

  // Brim
  ctx.fillStyle = '#1c1510';
  ctx.beginPath();
  ctx.ellipse(0, 0, 38, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  roughLine(ctx, -38, 0, 38, 0, INK, 2);

  // Crown
  ctx.fillStyle = '#1c1510';
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-23, -52);
  ctx.lineTo(23, -52);
  ctx.lineTo(25, 0);
  ctx.closePath();
  ctx.fill();

  drawCrossHatch(ctx, -23, -50, 46, 50, 8, 'rgba(189, 168, 127, 0.2)');

  // Hat ribbon band
  ctx.fillStyle = '#5c4832';
  ctx.fillRect(-25, -12, 50, 10);
  roughLine(ctx, -25, -12, 25, -12, INK, 1.5);
  roughLine(ctx, -25, -2, 25, -2, INK, 1.5);

  roughLine(ctx, -23, -52, 23, -52, INK, 2);
  roughLine(ctx, -25, 0, -23, -52, INK, 2);
  roughLine(ctx, 25, 0, 23, -52, INK, 2);

  ctx.restore();
  ctx.restore();
}

/**
 * Renders the Runner character during gameplay
 */
export function drawRunner(
  ctx: CanvasRenderingContext2D,
  p: Player,
  camX: number,
  time: number
) {
  ctx.save();
  const screenX = p.x - camX;
  const screenY = p.y;
  ctx.translate(screenX, screenY);

  if (p.face < 0) {
    ctx.scale(-1, 1);
  }

  // Invulnerability flicker
  if (p.graceTimer > 0 && Math.floor(time * 25) % 2 === 0) {
    ctx.globalAlpha = 0.35;
  }

  // Dash afterimages
  if (p.dashTimer > 0) {
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 12;
  }

  const isMoving = Math.abs(p.vx) > 15;
  const legCycle = isMoving && p.grounded ? Math.sin(time * 18) * 10 : 4;

  // Legs (running strides)
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  // Left leg
  ctx.beginPath();
  ctx.moveTo(-4, 26);
  ctx.lineTo(-6 - legCycle, 42);
  ctx.stroke();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(4, 26);
  ctx.lineTo(6 + legCycle, 42);
  ctx.stroke();

  // Torso / Ragged shirt
  ctx.fillStyle = '#9e8c6b';
  ctx.fillRect(-9, 8, 18, 20);
  roughLine(ctx, -9, 8, 9, 8, INK, 1.5);
  roughLine(ctx, -9, 28, 9, 28, INK, 1.5);
  drawCrossHatch(ctx, -8, 9, 16, 18, 5, 'rgba(21, 17, 13, 0.35)');

  // Arms
  const armCycle = isMoving && p.grounded ? Math.sin(time * 18) * 8 : 0;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-6, 12);
  ctx.lineTo(-12 - armCycle, 24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, 12);
  ctx.lineTo(12 + armCycle, 24);
  ctx.stroke();

  // Head (Scared, looking forward in terror)
  ctx.fillStyle = '#c5b18b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  roughLine(ctx, -9, 0, -6, 10, INK, 1.5);
  roughLine(ctx, 9, 0, 6, 10, INK, 1.5);

  // Wild hair flying back
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(-8, -2);
  ctx.lineTo(-13, -8);
  ctx.lineTo(-6, -10);
  ctx.lineTo(-1, -12);
  ctx.lineTo(8, -6);
  ctx.lineTo(7, -1);
  ctx.closePath();
  ctx.fill();

  // Big terrified eye
  ctx.fillStyle = '#ebdcb9';
  ctx.beginPath();
  ctx.arc(3, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(4, 0, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the grotesque monsters
 */
export function drawMonster(
  ctx: CanvasRenderingContext2D,
  m: Monster,
  camX: number,
  time: number
) {
  const x = m.x - camX;
  const y = m.y;

  // Culling
  if (x < -120 || x > 1100) return;

  ctx.save();
  ctx.translate(x, y);

  if (m.facing < 0) {
    ctx.scale(-1, 1);
  }

  const col = m.harmless ? '#61533f' : '#231b14';

  switch (m.type) {
    case 'hound': {
      // Three-headed cerberus hound with human eyes
      const houndImg = assetLoader.getImage('threeHeadHound');
      if (houndImg) {
        ctx.save();
        ctx.drawImage(houndImg, -34, -48, 68, 52);
        ctx.restore();
      } else {
        // Body
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(0, -16, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Four twitching paws
        for (let i = 0; i < 4; i++) {
          const legX = -20 + i * 13;
          const legY = Math.sin(time * 12 + i) * 4;
          roughLine(ctx, legX, -12, legX + 3, legY, col, 4);
        }

        // Three human-visage heads
        for (let i = 0; i < 3; i++) {
          const headOffset = (i - 1) * 12;
          const neckX = 14 + headOffset * 0.4;
          const neckY = -24 - (i % 2) * 8;
          roughLine(ctx, 8, -16, neckX, neckY, col, 6);

          // Head
          ctx.fillStyle = '#a69476';
          ctx.beginPath();
          ctx.ellipse(neckX + 8, neckY - 4, 9, 8, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Gnashing jaws
          roughLine(ctx, neckX + 6, neckY - 2, neckX + 16, neckY - 1, INK, 2);
          roughLine(ctx, neckX + 8, neckY + 2, neckX + 15, neckY + 2, INK, 2);

          // Weeping eye
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(neckX + 9, neckY - 6, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = INK;
          ctx.beginPath();
          ctx.arc(neckX + 9.5, neckY - 6, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'nine_arms': {
      // Crawling pale torso with nine reaching arms and no body
      const nineArmsImg = assetLoader.getImage('monsterNineArms');
      if (nineArmsImg) {
        ctx.save();
        ctx.drawImage(nineArmsImg, -38, -36, 76, 38);
        ctx.restore();
      } else {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(0, -12, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nine spindly clawed arms
        for (let i = 0; i < 9; i++) {
          const armBaseX = -22 + i * 5.5;
          const phase = time * 8 + i * 0.8;
          const midY = -22 - Math.sin(phase) * 10;
          const tipX = armBaseX + (i % 2 ? 14 : -14);
          const tipY = 0;

          roughLine(ctx, armBaseX, -10, armBaseX + (i % 2 ? 8 : -8), midY, col, 2.5);
          roughLine(ctx, armBaseX + (i % 2 ? 8 : -8), midY, tipX, tipY, col, 2);
        }

        // Torso face / mouth
        ctx.fillStyle = '#9e8c6b';
        ctx.beginPath();
        ctx.ellipse(22, -14, 8, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        roughLine(ctx, 22, -12, 28, -12, INK, 2);
      }
      break;
    }

    case 'stilt_walker': {
      // Towering needle-legged entity stepping along platforms
      const legHeight = 70;
      const step1 = Math.sin(time * 3) * 16;
      const step2 = -Math.sin(time * 3) * 16;

      // Needle legs
      roughLine(ctx, -6, -legHeight, -14 + step1, 0, col, 2.5);
      roughLine(ctx, 6, -legHeight, 14 + step2, 0, col, 2.5);

      // Torso / Shroud
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-10, -legHeight);
      ctx.lineTo(0, -legHeight - 24);
      ctx.lineTo(10, -legHeight);
      ctx.closePath();
      ctx.fill();

      // Hanging swinging lantern
      const lanternSwing = Math.sin(time * 4) * 8;
      roughLine(ctx, 0, -legHeight, lanternSwing, -legHeight + 24, INK, 1.5);
      ctx.fillStyle = '#d4aa55';
      ctx.shadowColor = '#d4aa55';
      ctx.shadowBlur = 10;
      ctx.fillRect(lanternSwing - 4, -legHeight + 24, 8, 10);
      ctx.shadowBlur = 0;
      break;
    }

    case 'tree_mouth': {
      // Gnarled carnivorous stump with biting jaw
      ctx.fillStyle = '#453827';
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-14, -58);
      ctx.lineTo(14, -58);
      ctx.lineTo(18, 0);
      ctx.closePath();
      ctx.fill();

      drawCrossHatch(ctx, -14, -56, 28, 56, 6, 'rgba(21, 17, 13, 0.4)');

      // Gaping mouth in center with razor teeth
      const jawGap = Math.abs(Math.sin(time * 5)) * 12 + 4;
      ctx.fillStyle = '#1c130d';
      ctx.beginPath();
      ctx.ellipse(0, -32, 11, jawGap, 0, 0, Math.PI * 2);
      ctx.fill();

      // Teeth
      for (let i = -8; i <= 8; i += 4) {
        roughLine(ctx, i, -32 - jawGap * 0.8, i, -32, '#fff', 1.5);
        roughLine(ctx, i, -32 + jawGap * 0.8, i, -32, '#fff', 1.5);
      }
      break;
    }

    case 'eyeball_mass': {
      // Floating/writhing sphere with squirming tentacles and eyes
      const floatY = Math.sin(time * 2.5 + m.phase) * 12 - 28;

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(0, floatY, 20, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Waving black tentacles
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const wave = Math.sin(time * 6 + i) * 8;
        const tx = Math.cos(angle) * 34 + wave;
        const ty = floatY + Math.sin(angle) * 34;
        roughLine(ctx, Math.cos(angle) * 16, floatY + Math.sin(angle) * 16, tx, ty, col, 2.5);
      }

      // Staring wet eye in center
      ctx.fillStyle = '#ebdcb9';
      ctx.beginPath();
      ctx.ellipse(0, floatY, 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(0, floatY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'weeping_watcher': {
      // Harmless weeping robed figure
      ctx.fillStyle = '#4a3e2e';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-8, -44);
      ctx.lineTo(8, -44);
      ctx.lineTo(12, 0);
      ctx.closePath();
      ctx.fill();

      // Kneeling posture
      ctx.fillStyle = '#9e8c6b';
      ctx.beginPath();
      ctx.ellipse(0, -42, 7, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Weeping black tears trailing down
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-3, -40);
      ctx.lineTo(-3, -24);
      ctx.moveTo(3, -40);
      ctx.lineTo(3, -24);
      ctx.stroke();
      break;
    }

    case 'raven_swarm': {
      // Swarm of black ink ravens swooping in arcs
      for (let i = 0; i < 4; i++) {
        const rx = -18 + i * 12 + Math.sin(time * 6 + i) * 6;
        const ry = -24 + Math.cos(time * 8 + i * 2) * 10 - i * 4;
        const wingFlap = Math.sin(time * 18 + i * 3) * 7;

        ctx.fillStyle = INK;
        // Body
        ctx.beginPath();
        ctx.ellipse(rx, ry, 5, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        roughLine(ctx, rx, ry, rx - 6, ry - wingFlap, INK, 2);
        roughLine(ctx, rx, ry, rx + 6, ry - wingFlap, INK, 2);
        // Beak
        roughLine(ctx, rx + 4, ry, rx + 7, ry + 1, '#ebdcb9', 1.5);
      }
      break;
    }

    case 'thorn_leaper': {
      // Low-slung shadow beast with thorn spines
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(0, -14, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Jagged back thorns
      for (let i = -14; i <= 14; i += 7) {
        roughLine(ctx, i, -22, i - 2, -32, INK, 2.5);
      }

      // Spring-loaded bent limbs
      const jumpCycle = Math.abs(Math.sin(time * 5));
      roughLine(ctx, -14, -10, -18, -jumpCycle * 8, col, 3);
      roughLine(ctx, 14, -10, 18, -jumpCycle * 8, col, 3);

      // Glowing crimson eye
      ctx.fillStyle = '#ff4433';
      ctx.beginPath();
      ctx.arc(14, -16, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'pendulum_blade': {
      // Menacing oscillating pendulum blade suspended from ceiling
      const swingAngle = Math.sin(time * 4.5) * 0.9;
      const rodLength = 65;
      const bx = Math.sin(swingAngle) * rodLength;
      const by = -rodLength + Math.cos(swingAngle) * rodLength;

      // Iron suspension rod
      roughLine(ctx, 0, -rodLength, bx, by, '#3a3127', 3);

      // Crescent razor blade at end
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(swingAngle);
      ctx.fillStyle = '#8f8373';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();
      roughLine(ctx, -24, 0, 24, 0, '#fff', 2);
      roughLine(ctx, 0, -6, 0, 16, INK, 2);
      ctx.restore();
      break;
    }

    case 'crawling_hand': {
      // Disembodied pale withered hand crawling along platforms
      const crawlPhase = Math.sin(time * 8);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(0, -12, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Scrabbling fingers
      for (let f = 0; f < 5; f++) {
        const fx = -12 + f * 6;
        const fy = Math.sin(time * 12 + f * 1.2) * 5;
        roughLine(ctx, fx, -8, fx + 4, fy, col, 2.5);
      }
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws the surreal, incongruous objects placed in unexpected areas
 */
export function drawSurrealObject(
  ctx: CanvasRenderingContext2D,
  obj: SurrealObject,
  camX: number,
  time: number
) {
  const x = obj.x - camX;
  const y = obj.y;

  // Culling
  if (x < -140 || x > 1100) return;

  ctx.save();
  ctx.translate(x, y);

  switch (obj.kind) {
    case 'refrigerator': {
      // 1950s vintage rounded refrigerator sitting in the eerie woods
      roughRect(ctx, -20, -75, 40, 75, '#b1a892');
      drawCrossHatch(ctx, -19, -74, 38, 73, 11, 'rgba(21, 17, 13, 0.35)');

      // Door seam
      roughLine(ctx, -20, -50, 20, -50, INK, 2);
      // Chrome handle
      roughLine(ctx, 12, -66, 12, -56, INK, 3);
      roughLine(ctx, 12, -44, 12, -30, INK, 3);

      // Light leaking from cracked door
      ctx.fillStyle = 'rgba(235, 200, 120, 0.2)';
      ctx.fillRect(-22, -75, 5, 75);
      break;
    }

    case 'campfire_mansion': {
      // Crackling campfire burning inside a mansion corridor
      roughLine(ctx, -22, 0, 20, -10, '#382a1b', 6);
      roughLine(ctx, 22, 0, -20, -10, '#382a1b', 6);

      // Dancing flames
      for (let i = 0; i < 5; i++) {
        const flameH = 22 + Math.sin(time * 12 + i * 1.5) * 10;
        const fx = -12 + i * 6;
        ctx.fillStyle = i % 2 === 0 ? '#e87c24' : '#f0b848';
        ctx.beginPath();
        ctx.moveTo(fx - 4, -4);
        ctx.lineTo(fx, -flameH);
        ctx.lineTo(fx + 4, -4);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'grandfather_clock': {
      // Tall mahogany clock with frantic hands
      roughRect(ctx, -14, -85, 28, 85, '#402e1f');
      // Clock face
      ctx.fillStyle = '#ebdcb9';
      ctx.beginPath();
      ctx.arc(0, -68, 10, 0, Math.PI * 2);
      ctx.fill();
      roughLine(ctx, -10, -68, 10, -68, INK, 1);

      // Spinning hands
      const angle1 = time * 6;
      const angle2 = time * 24;
      roughLine(ctx, 0, -68, Math.cos(angle1) * 7, -68 + Math.sin(angle1) * 7, INK, 1.5);
      roughLine(ctx, 0, -68, Math.cos(angle2) * 8, -68 + Math.sin(angle2) * 8, INK, 1.5);

      // Pendulum swinging through glass window
      const swing = Math.sin(time * 4) * 6;
      roughLine(ctx, 0, -48, swing, -26, '#a88a44', 2);
      ctx.fillStyle = '#a88a44';
      ctx.beginPath();
      ctx.arc(swing, -26, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'clawfoot_bathtub': {
      // Cast iron tub filled with dark ink
      ctx.fillStyle = '#9e9788';
      ctx.beginPath();
      ctx.ellipse(0, -16, 28, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      roughLine(ctx, -28, -16, 28, -16, INK, 2);

      // Claw feet
      roughLine(ctx, -20, 0, -20, -12, INK, 3);
      roughLine(ctx, 20, 0, 20, -12, INK, 3);

      // Ink overflowing
      ctx.fillStyle = INK;
      ctx.fillRect(-22, -18, 44, 6);
      roughLine(ctx, -10, -12, -10, -2, INK, 2);
      break;
    }

    case 'static_tv': {
      // Retro box television on antenna
      roughRect(ctx, -18, -48, 36, 44, '#382e24');
      // Screen with static and blinking eye
      ctx.fillStyle = '#8f8877';
      ctx.fillRect(-14, -44, 24, 30);
      drawCrossHatch(ctx, -14, -44, 24, 30, 4, 'rgba(0,0,0,0.4)');

      // Big eyeball on the screen
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(-2, -29, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(-2, -29, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Antennas
      roughLine(ctx, -4, -48, -14, -64, INK, 2);
      roughLine(ctx, 4, -48, 14, -64, INK, 2);
      break;
    }

    case 'hospital_gurney': {
      // Wheeled gurney with stained cover
      roughLine(ctx, -26, -26, 26, -26, INK, 4);
      // Legs with wheels
      roughLine(ctx, -22, 0, -22, -26, INK, 2);
      roughLine(ctx, 22, 0, 22, -26, INK, 2);
      roughLine(ctx, -24, 0, -20, 0, INK, 4);
      roughLine(ctx, 20, 0, 24, 0, INK, 4);

      // Stained body outline under cloth
      ctx.fillStyle = '#9e9178';
      ctx.beginPath();
      ctx.ellipse(0, -32, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark stain
      ctx.fillStyle = BLOOD_INK;
      ctx.beginPath();
      ctx.ellipse(4, -33, 7, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'overturned_piano': {
      // Cracked piano with thorn briars
      ctx.fillStyle = '#2b2219';
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(-24, -42);
      ctx.lineTo(20, -34);
      ctx.lineTo(26, 0);
      ctx.closePath();
      ctx.fill();

      // Exposed keys
      ctx.fillStyle = '#ebdcb9';
      ctx.fillRect(-18, -20, 32, 6);
      roughLine(ctx, -18, -20, 14, -20, INK, 1.5);
      for (let k = -16; k < 12; k += 4) {
        roughLine(ctx, k, -20, k, -14, INK, 1);
      }
      break;
    }

    case 'split_tree_dagger': {
      // The iconic sacrificial dagger in split tree from PDF page 6
      ctx.fillStyle = '#423321';
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-14, -75);
      ctx.lineTo(0, -45);
      ctx.lineTo(14, -75);
      ctx.lineTo(18, 0);
      ctx.closePath();
      ctx.fill();

      drawCrossHatch(ctx, -16, -70, 32, 70, 7, 'rgba(21, 17, 13, 0.45)');

      // Giant jagged dagger thrust downwards
      ctx.fillStyle = '#a6a192';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(-7, -48);
      ctx.lineTo(7, -48);
      ctx.closePath();
      ctx.fill();
      roughLine(ctx, 0, -18, -7, -48, INK, 2);
      roughLine(ctx, 0, -18, 7, -48, INK, 2);

      // Dagger hilt
      roughLine(ctx, -12, -48, 12, -48, INK, 3);
      roughLine(ctx, 0, -48, 0, -62, INK, 4);
      break;
    }

    case 'snowglobe_shrine': {
      // Wooden nightstand
      roughRect(ctx, -20, -34, 40, 34, '#382a1d');
      // Globe pedestal
      roughRect(ctx, -12, -42, 24, 8, '#59442e');

      // Glowing eldritch glass sphere - circular clip prevents any square borders
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, -64, 22, 0, Math.PI * 2);
      ctx.clip();

      const orbImg = assetLoader.getImage('eldritchOrb');
      if (orbImg) {
        ctx.drawImage(orbImg, -22, -86, 44, 44);
      } else {
        ctx.fillStyle = '#1c1611';
        ctx.fillRect(-22, -86, 44, 44);
      }
      ctx.restore();

      // Glass rim highlight & shadow
      ctx.strokeStyle = '#ebdcb9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -64, 22, 0, Math.PI * 2);
      ctx.stroke();

      // Inner glowing pupil
      ctx.fillStyle = '#ff3322';
      ctx.beginPath();
      ctx.arc(0, -64, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'lone_barn_facade': {
      // Distant barn with illuminated solitary window from PDF page 4
      roughRect(ctx, -26, -56, 52, 56, '#382d23');
      // Roof pitch
      ctx.fillStyle = '#261e16';
      ctx.beginPath();
      ctx.moveTo(-30, -56);
      ctx.lineTo(0, -78);
      ctx.lineTo(30, -56);
      ctx.closePath();
      ctx.fill();

      // Solitary lit golden window
      ctx.fillStyle = '#ffde6a';
      ctx.shadowColor = '#ffde6a';
      ctx.shadowBlur = 12;
      ctx.fillRect(-5, -42, 10, 12);
      ctx.shadowBlur = 0;
      roughLine(ctx, -5, -36, 5, -36, INK, 1);
      roughLine(ctx, 0, -42, 0, -30, INK, 1);
      break;
    }

    case 'hanging_birdcage': {
      // Victorian rusted birdcage hanging from wire with skull inside
      roughLine(ctx, 0, -90, 0, -56, INK, 1.5);
      // Cage dome & bars
      ctx.strokeStyle = '#473a2b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-12, -56, 24, 30);
      for (let b = -9; b <= 9; b += 4.5) {
        roughLine(ctx, b, -56, b, -26, INK, 1.2);
      }
      // Skull inside
      ctx.fillStyle = '#ebdcb9';
      ctx.beginPath();
      ctx.ellipse(0, -38, 5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#140f0c';
      ctx.fillRect(-2.5, -39, 1.8, 1.8);
      ctx.fillRect(1, -39, 1.8, 1.8);
      break;
    }

    case 'gramophone_blood': {
      // Antique gramophone on wooden crate
      roughRect(ctx, -14, -20, 28, 20, '#36281a');
      // Brass horn flaring up
      ctx.fillStyle = '#9e814d';
      ctx.beginPath();
      ctx.moveTo(2, -20);
      ctx.quadraticCurveTo(12, -38, 24, -48);
      ctx.quadraticCurveTo(10, -56, -4, -42);
      ctx.quadraticCurveTo(-2, -30, 2, -20);
      ctx.closePath();
      ctx.fill();
      // Phonograph needle
      roughLine(ctx, -4, -20, 4, -20, INK, 2);
      // Black record disc
      ctx.fillStyle = '#110d0a';
      ctx.beginPath();
      ctx.ellipse(0, -22, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'floating_chair': {
      // High-backed Victorian parlor chair hovering with slight tilt
      const hoverY = Math.sin(time * 2.5 + obj.salt) * 6;
      ctx.save();
      ctx.translate(0, hoverY);
      ctx.rotate(0.08);
      // Velvet back
      ctx.fillStyle = '#4a1e1b';
      roughRect(ctx, -10, -56, 20, 36, '#4a1e1b');
      // Seat
      ctx.fillStyle = '#331513';
      ctx.fillRect(-12, -20, 24, 6);
      // Wooden legs
      roughLine(ctx, -10, -14, -12, 0, '#2e2016', 2.5);
      roughLine(ctx, 10, -14, 12, 0, '#2e2016', 2.5);
      ctx.restore();
      break;
    }

    case 'telephone_pole_dolls': {
      // Weathered wooden telegraph pole with dangling dolls
      roughLine(ctx, 0, 0, 0, -84, '#382a1d', 5);
      roughLine(ctx, -18, -74, 18, -74, '#382a1d', 3.5);
      // Tangled sagging wires
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-24, -74);
      ctx.quadraticCurveTo(0, -66, 24, -74);
      ctx.stroke();
      // Dangling ragdoll
      roughLine(ctx, -10, -74, -10, -58, INK, 1);
      ctx.fillStyle = '#9e8d72';
      ctx.fillRect(-12, -58, 4, 8);
      ctx.beginPath();
      ctx.arc(-10, -60, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'antique_sewing_machine': {
      // Cast iron pedal sewing machine
      roughLine(ctx, -14, 0, -14, -24, '#241b14', 3);
      roughLine(ctx, 14, 0, 14, -24, '#241b14', 3);
      roughLine(ctx, -18, -24, 18, -24, '#3b2a1a', 4);
      // Iron arm
      ctx.fillStyle = '#1c1712';
      ctx.fillRect(-10, -38, 20, 14);
      // Needle & spool
      roughLine(ctx, 8, -38, 8, -26, '#c2baad', 2);
      ctx.fillStyle = '#5c1b14';
      ctx.fillRect(-8, -44, 4, 6);
      break;
    }

    case 'broken_iron_maiden': {
      // Spiked iron sarcophagus slightly ajar
      ctx.fillStyle = '#2b231d';
      roughRect(ctx, -14, -62, 28, 62, '#2b231d');
      // Spikes inside open doorway
      ctx.fillStyle = '#8f8373';
      for (let s = -52; s <= -16; s += 8) {
        roughLine(ctx, -8, s, -2, s, '#8f8373', 2);
        roughLine(ctx, 8, s, 2, s, '#8f8373', 2);
      }
      // Blood dripping
      ctx.fillStyle = BLOOD_INK;
      ctx.fillRect(-3, -12, 6, 12);
      break;
    }

    case 'mirror_pedestal': {
      // Solitary shattered tall mirror in stone frame
      ctx.fillStyle = '#3b3226';
      ctx.fillRect(-14, -64, 28, 64);
      // Silvered glass surface
      ctx.fillStyle = '#7a7b80';
      ctx.fillRect(-10, -60, 20, 52);
      // Jagged fracture lines
      roughLine(ctx, -10, -40, 10, -32, '#ffffff', 1.8);
      roughLine(ctx, 0, -60, -4, -20, '#ffffff', 1.5);
      roughLine(ctx, 4, -45, 10, -56, '#ffffff', 1.5);
      break;
    }

    case 'chandelier_roots': {
      // Hanging crystal chandelier entangled in roots
      roughLine(ctx, 0, -88, 0, -50, '#261a12', 3);
      ctx.strokeStyle = '#63533c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -48, 16, 0, Math.PI);
      ctx.stroke();
      // Glowing purple candle flames
      for (let c = -14; c <= 14; c += 7) {
        roughLine(ctx, c, -48, c, -56, '#ebdcb9', 1.5);
        ctx.fillStyle = '#a84be8';
        ctx.beginPath();
        ctx.arc(c, -58, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'streetlamp_flicker': {
      // Victorian gas lamp flickering green
      roughLine(ctx, 0, 0, 0, -72, '#211a14', 4);
      // Lantern housing
      ctx.strokeStyle = '#211a14';
      ctx.lineWidth = 2;
      ctx.strokeRect(-8, -88, 16, 16);
      // Flickering green flame
      const fl = Math.sin(time * 20 + obj.salt) > 0.1 ? 1 : 0.4;
      ctx.fillStyle = `rgba(75, 230, 130, ${fl * 0.9})`;
      ctx.shadowColor = '#4be682';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -80, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }

    case 'guillotine_blade': {
      // Wooden guillotine with rusted steel blade
      roughLine(ctx, -12, 0, -12, -72, '#382a1d', 4);
      roughLine(ctx, 12, 0, 12, -72, '#382a1d', 4);
      roughLine(ctx, -14, -72, 14, -72, '#382a1d', 3);
      // Angled heavy blade suspended
      ctx.fillStyle = '#7a7469';
      ctx.beginPath();
      ctx.moveTo(-10, -54);
      ctx.lineTo(10, -62);
      ctx.lineTo(10, -48);
      ctx.closePath();
      ctx.fill();
      // Blood on bottom stock
      ctx.fillStyle = BLOOD_INK;
      ctx.fillRect(-10, -14, 20, 14);
      break;
    }

    case 'bookshelf_collapse': {
      // Slanted bookcase with scattered tomes
      ctx.save();
      ctx.rotate(-0.1);
      roughRect(ctx, -14, -60, 28, 60, '#36281b');
      // Shelves with books
      for (let s = -50; s <= -14; s += 16) {
        roughLine(ctx, -12, s, 12, s, '#4d3927', 2);
        ctx.fillStyle = s % 2 === 0 ? '#63251e' : '#2b3b47';
        ctx.fillRect(-10, s - 10, 8, 10);
        ctx.fillRect(0, s - 12, 10, 12);
      }
      ctx.restore();
      break;
    }

    case 'porcelain_mannequin': {
      // Dummy draped in barbed wire
      ctx.fillStyle = '#d4c8b2';
      ctx.beginPath();
      ctx.ellipse(0, -42, 9, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      roughLine(ctx, 0, -28, 0, 0, '#2e2216', 3.5);
      roughLine(ctx, -8, 0, 8, 0, '#2e2216', 3);
      // Barbed wire spirals
      ctx.strokeStyle = '#382b1e';
      ctx.lineWidth = 1.5;
      for (let w = -52; w <= -32; w += 6) {
        roughLine(ctx, -11, w, 11, w + 3, '#382b1e', 1.5);
      }
      break;
    }

    case 'cradle_rocking': {
      // Victorian wooden baby cradle rocking in breeze
      const rock = Math.sin(time * 3 + obj.salt) * 0.12;
      ctx.save();
      ctx.rotate(rock);
      ctx.fillStyle = '#3b2a1a';
      ctx.beginPath();
      ctx.ellipse(0, -10, 18, 9, 0, 0, Math.PI);
      ctx.fill();
      // Rockers
      roughLine(ctx, -20, 0, 20, 0, '#241a10', 3);
      roughLine(ctx, -16, -10, -18, 0, '#241a10', 2);
      roughLine(ctx, 16, -10, 18, 0, '#241a10', 2);
      ctx.restore();
      break;
    }

    case 'church_pew_carved': {
      // Broken gothic church pew with deep claw marks
      roughRect(ctx, -22, -26, 44, 26, '#312316');
      roughLine(ctx, -22, -26, 22, -26, '#473422', 3);
      // Claw scratch marks
      ctx.strokeStyle = '#0a0705';
      ctx.lineWidth = 2;
      roughLine(ctx, -8, -22, -2, -6, '#0a0705', 2);
      roughLine(ctx, -4, -24, 2, -8, '#0a0705', 2);
      roughLine(ctx, 0, -22, 6, -6, '#0a0705', 2);
      break;
    }

    case 'weeping_stone_angel': {
      // Winged stone monument weeping black oil
      ctx.fillStyle = '#47433c';
      // Stone plinth
      ctx.fillRect(-14, -14, 28, 14);
      // Robed figure
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(-6, -58);
      ctx.lineTo(6, -58);
      ctx.lineTo(10, -14);
      ctx.closePath();
      ctx.fill();
      // Stone wings
      ctx.fillStyle = '#38352f';
      ctx.beginPath();
      ctx.moveTo(-6, -48);
      ctx.lineTo(-24, -68);
      ctx.lineTo(-12, -36);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(6, -48);
      ctx.lineTo(24, -68);
      ctx.lineTo(12, -36);
      ctx.closePath();
      ctx.fill();
      // Black tears
      roughLine(ctx, -3, -56, -3, -40, '#000000', 2);
      roughLine(ctx, 3, -56, 3, -40, '#000000', 2);
      break;
    }

    case 'gallows_silhouette': {
      // Heavy timber gallows with dangling noose
      roughLine(ctx, -14, 0, -14, -80, '#2e2115', 5);
      roughLine(ctx, -16, -80, 16, -80, '#2e2115', 4);
      roughLine(ctx, -14, -60, 0, -80, '#2e2115', 3);
      // Dangling hemp noose
      const nooseSwing = Math.sin(time * 2.8) * 4;
      roughLine(ctx, 10, -80, 10 + nooseSwing, -48, '#8c7653', 2);
      ctx.strokeStyle = '#8c7653';
      ctx.lineWidth = 2;
      ctx.strokeRect(8 + nooseSwing, -48, 5, 8);
      break;
    }

    case 'antique_typewriter': {
      // Mechanical typewriter typing repeating text
      roughRect(ctx, -14, -16, 28, 16, '#261f18');
      // Paper sheet sticking up
      ctx.fillStyle = '#ebdcb9';
      ctx.fillRect(-8, -32, 16, 16);
      roughLine(ctx, -6, -26, 6, -26, INK, 1);
      roughLine(ctx, -6, -22, 6, -22, INK, 1);
      // Type bars
      roughLine(ctx, -10, -16, 10, -16, '#998d78', 2);
      break;
    }

    case 'steamer_trunk': {
      // Brass-riveted leather trunk wrapped in heavy chains
      roughRect(ctx, -18, -24, 36, 24, '#3d2816');
      ctx.strokeStyle = '#8a6e3d';
      ctx.lineWidth = 2;
      ctx.strokeRect(-18, -24, 36, 24);
      // Wrap chains
      roughLine(ctx, -6, -24, -6, 0, '#59554e', 3);
      roughLine(ctx, 6, -24, 6, 0, '#59554e', 3);
      break;
    }

    case 'cauldron_smoking': {
      // Cast iron cauldron bubbling with pale mist
      ctx.fillStyle = '#1c1712';
      ctx.beginPath();
      ctx.arc(0, -16, 16, 0, Math.PI);
      ctx.fill();
      // Rim
      roughLine(ctx, -18, -16, 18, -16, '#2e261f', 3.5);
      // Three iron feet
      roughLine(ctx, -12, 0, -12, -8, '#1c1712', 3);
      roughLine(ctx, 12, 0, 12, -8, '#1c1712', 3);
      // Rising mist
      const mistY = Math.sin(time * 4) * 5;
      ctx.fillStyle = 'rgba(235, 220, 185, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, -22 + mistY, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'tall_candelabra': {
      // Seven-branch blackened brass candelabra
      roughLine(ctx, 0, 0, 0, -48, '#3b3121', 3.5);
      roughLine(ctx, -16, -38, 16, -38, '#3b3121', 2.5);
      // 5 Candles with violet flames
      for (let c = -16; c <= 16; c += 8) {
        roughLine(ctx, c, -38, c, -46, '#ebdcb9', 1.8);
        ctx.fillStyle = '#b842ff';
        ctx.beginPath();
        ctx.arc(c, -49 + Math.sin(time * 12 + c) * 1.5, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws the Riddle Gate / The Keeper of What You Left Behind
 */
export function drawRiddleGate(
  ctx: CanvasRenderingContext2D,
  gate: RiddleGate,
  camX: number,
  time: number
) {
  const x = gate.x - camX;
  const y = gate.y;

  if (x < -140 || x > 1100) return;

  ctx.save();
  ctx.translate(x, y);

  if (gate.solved) {
    ctx.globalAlpha = 0.22;
  }

  // Ancient archway of bone and obsidian
  roughLine(ctx, -32, 0, -24, -110, INK, 8);
  roughLine(ctx, -24, -110, 0, -132, INK, 8);
  roughLine(ctx, 24, -110, 0, -132, INK, 8);
  roughLine(ctx, 32, 0, 24, -110, INK, 8);

  // The Keeper entity standing in the arch
  // Hooded shroud
  ctx.fillStyle = '#1c1611';
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(-12, -90);
  ctx.lineTo(0, -108);
  ctx.lineTo(12, -90);
  ctx.lineTo(16, 0);
  ctx.closePath();
  ctx.fill();

  // Faceless cowl with glowing glyph
  ctx.fillStyle = '#ebdcb9';
  ctx.beginPath();
  ctx.ellipse(0, -88, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Carved runic eyes
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-5, -92);
  ctx.lineTo(0, -88);
  ctx.lineTo(-5, -84);
  ctx.moveTo(5, -92);
  ctx.lineTo(0, -88);
  ctx.lineTo(5, -84);
  ctx.stroke();

  // Glowing lantern on staff
  const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
  ctx.fillStyle = `rgba(235, 200, 110, ${glowPulse})`;
  ctx.shadowColor = '#e8ba4d';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(-22, -75, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

/**
 * Draws platforms according to biome and kind
 */
export function drawPlatform(
  ctx: CanvasRenderingContext2D,
  p: Platform,
  camX: number
) {
  const x = p.x - camX;
  const y = p.y;
  const w = p.w;
  const h = p.h;

  if (x > 1000 || x + w < -100) return;

  ctx.save();

  switch (p.kind) {
    case 'ground':
    case 'gnarled_roots': {
      const rootImg = assetLoader.getImage('platformRoots');
      if (rootImg) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        // Tile or stretch the root texture
        for (let rx = 0; rx < w; rx += 256) {
          ctx.drawImage(rootImg, x + rx, y, 256, Math.max(h, 128));
        }
        ctx.restore();
        roughLine(ctx, x, y + 2, x + w, y + 2, '#d4c29b', 2.5);
      } else {
        // Earth & intertwined dark roots
        ctx.fillStyle = '#615139';
        ctx.fillRect(x, y, w, h);
        drawCrossHatch(ctx, x, y, w, h, 14, 'rgba(21, 17, 13, 0.45)');

        // Upper grass / tangled root lip
        roughLine(ctx, x, y + 2, x + w, y + 2, '#d4c29b', 2.5);
        for (let rx = 10; rx < w; rx += 28) {
          roughLine(ctx, x + rx, y + 2, x + rx - 5, y - 8, INK, 1.5);
          roughLine(ctx, x + rx, y + 2, x + rx + 6, y - 6, INK, 1.5);
        }
      }
      break;
    }

    case 'creaky_planks':
    case 'scaffolding': {
      // Weathered wood planks
      ctx.fillStyle = '#47392a';
      ctx.fillRect(x, y, w, h);
      roughLine(ctx, x, y, x + w, y, '#b39d78', 2);
      roughLine(ctx, x, y + h, x + w, y + h, INK, 2);

      // Plank dividers
      for (let px = 24; px < w; px += 36) {
        roughLine(ctx, x + px, y, x + px, y + h, INK, 1.5);
      }
      break;
    }

    case 'rib_bones': {
      // Arching bone walkway
      ctx.fillStyle = '#8f8170';
      ctx.fillRect(x, y, w, h);
      roughLine(ctx, x, y, x + w, y, '#e3d6be', 2.5);
      for (let bx = 12; bx < w; bx += 22) {
        roughLine(ctx, x + bx, y, x + bx + 4, y - 10, '#c7ba9f', 3);
      }
      break;
    }

    case 'fractured_ice':
    case 'stone_slab': {
      const stoneImg = assetLoader.getImage('platformStone');
      if (stoneImg) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        for (let sx = 0; sx < w; sx += 256) {
          ctx.drawImage(stoneImg, x + sx, y, 256, Math.max(h, 128));
        }
        ctx.restore();
        roughLine(ctx, x, y, x + w, y, '#ebdcb9', 2);
        roughLine(ctx, x, y + h, x + w, y + h, INK, 2);
      } else {
        // Cracked stone/ice
        ctx.fillStyle = '#544c41';
        ctx.fillRect(x, y, w, h);
        drawCrossHatch(ctx, x, y, w, h, 12, 'rgba(21, 17, 13, 0.4)');
        roughLine(ctx, x, y, x + w, y, '#ebdcb9', 2);
        roughLine(ctx, x, y + h, x + w, y + h, INK, 2);
        roughLine(ctx, x + w * 0.3, y, x + w * 0.35, y + h, INK, 1);
        roughLine(ctx, x + w * 0.7, y, x + w * 0.65, y + h, INK, 1);
      }
      break;
    }

    case 'brass_gears': {
      // Clockwork brass cog platform
      ctx.fillStyle = '#6e5630';
      ctx.fillRect(x, y, w, h);
      roughLine(ctx, x, y, x + w, y, '#d4aa55', 2.5);
      for (let gx = 16; gx < w; gx += 28) {
        roughLine(ctx, x + gx, y, x + gx, y - 6, '#d4aa55', 3);
      }
      break;
    }

    case 'mirror_shards': {
      // Crystalline reflective mirror shard
      ctx.fillStyle = '#8a949e';
      ctx.fillRect(x, y, w, h);
      roughLine(ctx, x, y, x + w, y, '#ffffff', 2.5);
      drawCrossHatch(ctx, x, y, w, h, 8, 'rgba(255, 255, 255, 0.25)');
      break;
    }

    case 'floating_tomes': {
      // Ancient hovering grimoire
      ctx.fillStyle = '#4a251f';
      ctx.fillRect(x, y, w, h);
      roughLine(ctx, x, y, x + w, y, '#ebdcb9', 2.5);
      roughLine(ctx, x + 6, y + h * 0.5, x + w - 6, y + h * 0.5, '#d4aa55', 1.5);
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws a glowing Memory Shard (sanity relic)
 */
export function drawMemoryShard(
  ctx: CanvasRenderingContext2D,
  shard: MemoryShard,
  camX: number,
  time: number
) {
  if (shard.collected) return;
  const x = shard.x - camX;
  const y = shard.y;

  if (x < -60 || x > 1020) return;

  ctx.save();
  const pulse = Math.sin(time * 4 + shard.pulsePhase) * 4;
  const bobY = y + pulse;
  ctx.translate(x, bobY);

  // Outer golden-amber halo
  ctx.shadowColor = '#e8ba4d';
  ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(232, 186, 77, 0.35)';
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  // Glass/Ink droplet core
  ctx.fillStyle = '#ebdcb9';
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.bezierCurveTo(8, -4, 9, 8, 0, 12);
  ctx.bezierCurveTo(-9, 8, -8, -4, 0, -12);
  ctx.fill();

  // Inner black pupil/rune
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(0, 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Highlight glint
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-2, -1, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the atmospheric parallax background for the current biome
 */
export function drawScenery(
  ctx: CanvasRenderingContext2D,
  camX: number,
  biome: BiomeConfig,
  time: number
) {
  const W = 960;
  const H = 540;

  // Sky base
  ctx.fillStyle = biome.skyColor;
  ctx.fillRect(0, 0, W, H);

  // Distant glowing pale sun/moon
  ctx.fillStyle = '#d4c5a3';
  ctx.beginPath();
  const moonX = ((780 - camX * 0.02) % 1100 + 1100) % 1100 - 100;
  ctx.arc(moonX, 90, 48, 0, Math.PI * 2);
  ctx.fill();

  // Draw authentic generated photographic/art backdrops based on PDF references
  let bgImg: HTMLImageElement | null = null;
  if (biome.id === 0 || biome.id === 2 || biome.id === 11) {
    bgImg = assetLoader.getImage('weepingWoods');
  } else if (biome.id === 1 || biome.id === 9) {
    bgImg = assetLoader.getImage('nightBarn');
  } else if (biome.id === 3 || biome.id === 8 || biome.id === 10) {
    bgImg = assetLoader.getImage('cathedralTeeth');
  } else if (biome.id === 4 || biome.id === 6) {
    bgImg = assetLoader.getImage('clockworkGear');
  } else if (biome.id === 5 || biome.id === 7) {
    bgImg = assetLoader.getImage('liminalDoors');
  } else {
    bgImg = assetLoader.getImage('weepingWoods');
  }

  if (bgImg) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    const bgSpeed = 0.08;
    const imgW = 960;
    const imgH = 540;
    const offset = (-camX * bgSpeed) % imgW;
    ctx.drawImage(bgImg, offset, 0, imgW, imgH);
    if (offset < 0) {
      ctx.drawImage(bgImg, offset + imgW, 0, imgW, imgH);
    } else if (offset > 0) {
      ctx.drawImage(bgImg, offset - imgW, 0, imgW, imgH);
    }
    ctx.restore();
  }

  // Distant fog gradient
  const fogGrad = ctx.createLinearGradient(0, 220, 0, 540);
  fogGrad.addColorStop(0, 'rgba(0,0,0,0)');
  fogGrad.addColorStop(1, biome.fogColor);
  ctx.fillStyle = fogGrad;
  ctx.fillRect(0, 220, W, 320);

  // Parallax layer 1: Far background silhouettes
  const speedFar = 0.14;
  const spacingFar = 260;
  const startFar = Math.floor((camX * speedFar) / spacingFar);

  ctx.fillStyle = biome.fogColor;
  ctx.globalAlpha = 0.35;
  for (let i = startFar - 1; i < startFar + 7; i++) {
    const x = i * spacingFar - camX * speedFar;
    const rand = prng(i * 127 + biome.id * 53);
    const treeY = 160 + rand * 80;

    // Gnarled trees or dilapidated barns in distance
    roughLine(ctx, x, 480, x + 10, treeY, biome.fogColor, 12);
    roughLine(ctx, x + 10, treeY + 30, x - 40, treeY - 20, biome.fogColor, 6);
    roughLine(ctx, x + 10, treeY + 40, x + 50, treeY - 30, biome.fogColor, 6);
  }

  // Parallax layer 2: Mid-ground silhouettes
  const speedMid = 0.32;
  const spacingMid = 180;
  const startMid = Math.floor((camX * speedMid) / spacingMid);

  ctx.globalAlpha = 0.65;
  for (let i = startMid - 1; i < startMid + 8; i++) {
    const x = i * spacingMid - camX * speedMid;
    const rand = prng(i * 313 + biome.id * 97);
    const y = 180 + rand * 70;

    if (biome.id === 1) {
      // Decaying barns / mansion roofs
      roughRect(ctx, x, y + 40, 110, 220, '#382b20');
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.moveTo(x - 6, y + 40);
      ctx.lineTo(x + 55, y);
      ctx.lineTo(x + 116, y + 40);
      ctx.closePath();
      ctx.fill();
    } else {
      // Twisted screaming trees
      roughLine(ctx, x, 490, x + 14, y, '#2e261d', 16);
      roughLine(ctx, x + 14, y + 40, x - 55, y - 20, '#2e261d', 7);
      roughLine(ctx, x + 14, y + 50, x + 65, y - 30, '#2e261d', 7);

      // Weeping eye-socket on tree trunk
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(x + 10, y + 80, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1.0;
}
