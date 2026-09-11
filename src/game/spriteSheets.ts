/**
 * Transparent Multi-Frame Animated Sprites & Seamless Textures
 * Eliminates all white-box artifacts, floating frames, and seams.
 */
import { INK, roughLine, drawCrossHatch } from './renderers';
import { Player, Monster, Platform } from '../types';

/**
 * Renders the protagonist runner with smooth multi-frame animation
 */
export function drawAnimatedPlayer(
  ctx: CanvasRenderingContext2D,
  p: Player,
  camX: number,
  time: number
) {
  const x = p.x - camX;
  const y = p.y;

  ctx.save();
  ctx.translate(x, y + p.height); // pivot at feet

  if (p.face < 0) {
    ctx.scale(-1, 1);
  }

  // Grace timer invulnerability flicker
  if (p.graceTimer > 0 && Math.floor(time * 20) % 2 === 0) {
    ctx.globalAlpha = 0.55;
  }

  const isDashing = p.dashTimer > 0;
  const isJumping = !p.grounded && p.vy < 0;
  const isFalling = !p.grounded && p.vy >= 0;
  const isWallSlide = p.wallSlide;
  const isRunning = p.grounded && Math.abs(p.vx) > 15;

  // Dash ghost trails
  if (isDashing) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#6b5842';
    for (let t = 1; t <= 3; t++) {
      ctx.fillRect(-t * 18, -p.height, p.width, p.height);
    }
    ctx.restore();
  }

  // Multi-frame animation cycle calculation
  const runSpeed = 16;
  const runCycle = (time * runSpeed) % 4;
  const frame = Math.floor(runCycle);

  // Body palette
  const coatColor = '#241b14';
  const trousersColor = '#18130e';
  const skinColor = '#c9b893';
  const hairColor = '#15110d';

  if (isWallSlide) {
    // Wall cling pose
    // Torso angled
    ctx.fillStyle = coatColor;
    ctx.beginPath();
    ctx.moveTo(-6, -34);
    ctx.lineTo(6, -32);
    ctx.lineTo(8, -14);
    ctx.lineTo(-4, -14);
    ctx.closePath();
    ctx.fill();

    // Bracing arm against wall
    roughLine(ctx, 4, -30, 14, -28, coatColor, 3.5);
    roughLine(ctx, 14, -28, 16, -24, skinColor, 3);

    // Wall scrape sparks
    ctx.fillStyle = '#ffd269';
    ctx.fillRect(15 + (Math.random() - 0.5) * 4, -24 + (Math.random() * 12), 2.5, 2.5);

    // Legs bracing
    roughLine(ctx, -2, -14, 10, -2, trousersColor, 4);
    roughLine(ctx, -4, -14, 4, -4, trousersColor, 4);

    // Head tilted up
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -38, 6.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (isDashing) {
    // Horizontal streamlined sprint
    ctx.fillStyle = coatColor;
    ctx.beginPath();
    ctx.moveTo(-16, -26);
    ctx.lineTo(14, -28);
    ctx.lineTo(18, -18);
    ctx.lineTo(-12, -16);
    ctx.closePath();
    ctx.fill();

    // Speed lines
    ctx.strokeStyle = '#ebdcb9';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const ly = -32 + i * 10;
      ctx.beginPath();
      ctx.moveTo(-28, ly);
      ctx.lineTo(-14, ly);
      ctx.stroke();
    }

    // Tucked legs
    roughLine(ctx, -8, -16, -18, -8, trousersColor, 4);
    roughLine(ctx, 4, -16, -6, -6, trousersColor, 4);

    // Thrust forward head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(16, -28, 6.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (isJumping) {
    // Air ascent - legs drawn up, coat tails whipping downwards
    // Torso
    ctx.fillStyle = coatColor;
    ctx.beginPath();
    ctx.moveTo(-6, -34);
    ctx.lineTo(8, -34);
    ctx.lineTo(6, -16);
    ctx.lineTo(-8, -16);
    ctx.closePath();
    ctx.fill();

    // Coat tails flapping down
    ctx.beginPath();
    ctx.moveTo(-8, -16);
    ctx.lineTo(-14, -4);
    ctx.lineTo(-4, -16);
    ctx.closePath();
    ctx.fill();

    // Legs tucked up
    roughLine(ctx, -4, -16, -8, -6, trousersColor, 3.5);
    roughLine(ctx, -8, -6, -2, -4, trousersColor, 3.5);
    roughLine(ctx, 4, -16, 2, -8, trousersColor, 3.5);
    roughLine(ctx, 2, -8, 8, -6, trousersColor, 3.5);

    // Head looking up
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(1, -40, 6.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (isFalling) {
    // Air descent - coat billowing out, legs reaching down
    ctx.fillStyle = coatColor;
    ctx.beginPath();
    ctx.moveTo(-6, -34);
    ctx.lineTo(8, -34);
    ctx.lineTo(8, -16);
    ctx.lineTo(-6, -16);
    ctx.closePath();
    ctx.fill();

    // Coat billowing upward
    ctx.beginPath();
    ctx.moveTo(-6, -20);
    ctx.lineTo(-16, -26);
    ctx.lineTo(-6, -16);
    ctx.closePath();
    ctx.fill();

    // Reaching legs
    roughLine(ctx, -3, -16, -5, -2, trousersColor, 3.5);
    roughLine(ctx, 5, -16, 7, -4, trousersColor, 3.5);

    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(1, -38, 6.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (isRunning) {
    // 4-frame dynamic run cycle
    const legOffsets = [
      { l1: 10, l2: -8, k1: 6, k2: -4, bob: -2 },   // Frame 0: Right forward
      { l1: 4,  l2: -2, k1: 2, k2: -1, bob: 0 },    // Frame 1: Passing
      { l1: -8, l2: 10, k1: -4, k2: 6, bob: -2 },   // Frame 2: Left forward
      { l1: -2, l2: 4,  k1: -1, k2: 2, bob: 0 },    // Frame 3: Passing
    ];
    const cur = legOffsets[frame % 4];

    // Torso with forward lean & vertical bob
    const torsoY = -34 + cur.bob;
    ctx.fillStyle = coatColor;
    ctx.beginPath();
    ctx.moveTo(-6, torsoY);
    ctx.lineTo(8, torsoY);
    ctx.lineTo(6, -16 + cur.bob);
    ctx.lineTo(-8, -16 + cur.bob);
    ctx.closePath();
    ctx.fill();

    // Trailing coat tail flutter
    const coatFlutter = Math.sin(time * 24) * 6;
    ctx.beginPath();
    ctx.moveTo(-8, -16 + cur.bob);
    ctx.lineTo(-16 - coatFlutter, -14 + cur.bob);
    ctx.lineTo(-4, -14 + cur.bob);
    ctx.closePath();
    ctx.fill();

    // Back leg
    roughLine(ctx, -3, -16 + cur.bob, cur.k2, -8 + cur.bob, trousersColor, 3.5);
    roughLine(ctx, cur.k2, -8 + cur.bob, cur.l2, 0, trousersColor, 3.5);

    // Front leg
    roughLine(ctx, 3, -16 + cur.bob, cur.k1, -8 + cur.bob, trousersColor, 3.5);
    roughLine(ctx, cur.k1, -8 + cur.bob, cur.l1, 0, trousersColor, 3.5);

    // Arms swinging in opposition
    roughLine(ctx, 1, torsoY + 4, -cur.k1, torsoY + 12, coatColor, 3);
    roughLine(ctx, 1, torsoY + 4, cur.k1, torsoY + 12, coatColor, 3);

    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(2, torsoY - 6, 6.5, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // Idle breathing pose
    const breath = Math.sin(time * 3) * 1.5;
    const torsoY = -34 + breath;

    ctx.fillStyle = coatColor;
    ctx.fillRect(-6, torsoY, 13, 18);

    // Legs straight down
    roughLine(ctx, -3, -16, -3, 0, trousersColor, 3.5);
    roughLine(ctx, 4, -16, 4, 0, trousersColor, 3.5);

    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(1, torsoY - 6, 6.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head details: ruffled hair & wide frantic eye
  const headY = isRunning ? -40 + Math.sin(time * runSpeed) * 1.5 : isJumping ? -40 : -40;
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(0, headY, 7.5, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();

  // Wide staring pupil
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(3.5, headY + 1, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(4, headY + 1, 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Multi-frame animated monsters with clean cutout rendering (zero white boxes)
 */
export function drawAnimatedMonster(
  ctx: CanvasRenderingContext2D,
  m: Monster,
  camX: number,
  time: number
) {
  const x = m.x - camX;
  const y = m.y;

  // Culling
  if (x < -140 || x > 1100) return;

  ctx.save();
  ctx.translate(x, y);

  if (m.facing < 0) {
    ctx.scale(-1, 1);
  }

  const col = m.harmless ? '#6a5a45' : '#1e1711';
  const goreCol = '#5e1b14';

  switch (m.type) {
    case 'hound': {
      // 4-frame gallop animation with twitching snapping heads
      const gallop = Math.sin(time * 14 + m.phase);
      const bob = Math.abs(gallop) * 4;

      // Body torso
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(0, -18 + bob, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Four galloping paws
      const l1 = Math.sin(time * 14) * 12;
      const l2 = -Math.sin(time * 14) * 12;
      roughLine(ctx, -16, -14 + bob, -22 + l1, 0, col, 3.5);
      roughLine(ctx, -8, -14 + bob, -12 - l1, 0, col, 3.5);
      roughLine(ctx, 8, -14 + bob, 14 + l2, 0, col, 3.5);
      roughLine(ctx, 16, -14 + bob, 22 - l2, 0, col, 3.5);

      // Three twitching heads
      for (let i = 0; i < 3; i++) {
        const neckX = 14 + i * 6;
        const neckY = -24 - (i % 2) * 8 + Math.sin(time * 12 + i) * 3;
        roughLine(ctx, 8, -16 + bob, neckX, neckY, col, 5);

        // Head
        ctx.fillStyle = '#9e8c6c';
        ctx.beginPath();
        ctx.ellipse(neckX + 6, neckY - 2, 8, 7, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Snapping jaws with teeth
        const jawOpen = Math.abs(Math.sin(time * 16 + i * 2)) * 6;
        ctx.fillStyle = goreCol;
        ctx.beginPath();
        ctx.arc(neckX + 11, neckY, 3, 0, Math.PI);
        ctx.fill();
        roughLine(ctx, neckX + 6, neckY - jawOpen, neckX + 14, neckY - jawOpen, INK, 1.8);
        roughLine(ctx, neckX + 6, neckY + jawOpen, neckX + 14, neckY + jawOpen, INK, 1.8);

        // Piercing red pupil
        ctx.fillStyle = '#ff2b2b';
        ctx.beginPath();
        ctx.arc(neckX + 7, neckY - 4, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'nine_arms': {
      // 6-frame crawl animation with 9 spindly reaching arms
      const crawl = Math.sin(time * 7 + m.phase);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(0, -14, 24, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nine crawling arms
      for (let i = 0; i < 9; i++) {
        const armBaseX = -20 + i * 5;
        const phase = time * 9 + i * 0.9;
        const midY = -24 - Math.sin(phase) * 12;
        const tipX = armBaseX + Math.cos(phase) * 16;
        const tipY = 0;

        roughLine(ctx, armBaseX, -12, armBaseX + (i % 2 ? 6 : -6), midY, col, 2.5);
        roughLine(ctx, armBaseX + (i % 2 ? 6 : -6), midY, tipX, tipY, col, 2);
      }

      // Torso eye slit
      ctx.fillStyle = '#ffde6a';
      ctx.beginPath();
      ctx.ellipse(14, -14, 5, 2.5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.fillRect(13, -15, 2, 3);
      break;
    }

    case 'stilt_walker': {
      // Towering needle legs walking with swinging lantern
      const legHeight = 72;
      const step1 = Math.sin(time * 3.5) * 18;
      const step2 = -Math.sin(time * 3.5) * 18;

      // Needle legs
      roughLine(ctx, -6, -legHeight, -16 + step1, 0, col, 2.5);
      roughLine(ctx, 6, -legHeight, 16 + step2, 0, col, 2.5);

      // Shrouded body
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-10, -legHeight);
      ctx.lineTo(0, -legHeight - 26);
      ctx.lineTo(10, -legHeight);
      ctx.closePath();
      ctx.fill();

      // Swinging lantern with warm aura
      const lanternSwing = Math.sin(time * 4) * 10;
      roughLine(ctx, 0, -legHeight, lanternSwing, -legHeight + 26, INK, 1.5);
      ctx.fillStyle = '#f0bb48';
      ctx.shadowColor = '#f0bb48';
      ctx.shadowBlur = 12;
      ctx.fillRect(lanternSwing - 4, -legHeight + 26, 8, 11);
      ctx.shadowBlur = 0;
      break;
    }

    case 'tree_mouth': {
      // Carnivorous stump trap with biting jaw
      ctx.fillStyle = '#382b1d';
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-14, -58);
      ctx.lineTo(14, -58);
      ctx.lineTo(18, 0);
      ctx.closePath();
      ctx.fill();

      // Biting jaw opening and snapping shut
      const jawGap = Math.abs(Math.sin(time * 5.5)) * 14 + 3;
      ctx.fillStyle = '#140c08';
      ctx.beginPath();
      ctx.ellipse(0, -32, 12, jawGap, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fangs
      ctx.fillStyle = '#ebdcb9';
      for (let t = -9; t <= 9; t += 4.5) {
        ctx.beginPath();
        ctx.moveTo(t, -32 - jawGap);
        ctx.lineTo(t + 2, -32 - jawGap + 5);
        ctx.lineTo(t + 4, -32 - jawGap);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(t, -32 + jawGap);
        ctx.lineTo(t + 2, -32 + jawGap - 5);
        ctx.lineTo(t + 4, -32 + jawGap);
        ctx.fill();
      }
      break;
    }

    case 'eyeball_mass': {
      // Pulsing cluster of eyeballs floating in ink
      const floatY = -34 + Math.sin(time * 3 + m.phase) * 6;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(0, floatY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Squirming tentacles
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const wave = Math.sin(time * 8 + i) * 6;
        roughLine(
          ctx,
          Math.cos(ang) * 16,
          floatY + Math.sin(ang) * 16,
          Math.cos(ang) * 32 + wave,
          floatY + Math.sin(ang) * 32,
          col,
          2.5
        );
      }

      // Main staring eye in center
      ctx.fillStyle = '#ebdcb9';
      ctx.beginPath();
      ctx.ellipse(0, floatY, 10, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(0, floatY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Gleaming reflection
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-2, floatY - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'pendulum_blade': {
      // Oscillating razor blade from ceiling
      const swingAngle = Math.sin(time * 4.2 + m.phase) * 0.95;
      const rodLength = 68;
      const bx = Math.sin(swingAngle) * rodLength;
      const by = -rodLength + Math.cos(swingAngle) * rodLength;

      roughLine(ctx, 0, -rodLength, bx, by, '#362c21', 3);

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(swingAngle);
      ctx.fillStyle = '#8f8373';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();

      roughLine(ctx, -24, 0, 24, 0, '#ffffff', 2);
      ctx.restore();
      break;
    }

    case 'crawling_hand': {
      // Scurrying hand flexing knuckles
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(0, -12, 15, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let f = 0; f < 5; f++) {
        const fx = -12 + f * 6;
        const fy = Math.sin(time * 14 + f * 1.4) * 6;
        roughLine(ctx, fx, -8, fx + 4, fy, col, 2.5);
      }
      break;
    }

    case 'spider_shadow': {
      // Multi-legged spindly arachnid with 8 jointed legs
      const bob = Math.sin(time * 16) * 3;
      ctx.fillStyle = col;
      // Abdomen & thorax
      ctx.beginPath();
      ctx.ellipse(-8, -14 + bob, 14, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, -12 + bob, 9, 7, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // 8 Jointed legs with walking cycles
      for (let leg = 0; leg < 4; leg++) {
        const legPhase = time * 18 + leg * 1.5;
        const footX1 = -24 + leg * 8 + Math.cos(legPhase) * 8;
        const footY1 = 0;
        const kneeX1 = -16 + leg * 6;
        const kneeY1 = -26 + Math.sin(legPhase) * 6;
        roughLine(ctx, -6, -14 + bob, kneeX1, kneeY1, col, 2.2);
        roughLine(ctx, kneeX1, kneeY1, footX1, footY1, col, 2);

        const footX2 = 8 + leg * 7 + Math.sin(legPhase) * 8;
        const footY2 = 0;
        const kneeX2 = 12 + leg * 5;
        const kneeY2 = -26 - Math.sin(legPhase) * 6;
        roughLine(ctx, 8, -12 + bob, kneeX2, kneeY2, col, 2.2);
        roughLine(ctx, kneeX2, kneeY2, footX2, footY2, col, 2);
      }

      // Red cluster eyes
      ctx.fillStyle = '#ff2b2b';
      for (let e = 0; e < 4; e++) {
        ctx.beginPath();
        ctx.arc(12 + (e % 2) * 3, -14 + Math.floor(e / 2) * 3 + bob, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'weeping_scarecrow': {
      // Ragged wooden scarecrow with twitching straw arms
      const twitch = Math.sin(time * 24 + m.phase) * (Math.sin(time * 3) > 0.6 ? 4 : 0);
      roughLine(ctx, 0, 0, 0, -56, '#382a1d', 4);
      roughLine(ctx, -24, -42, 24, -42, '#382a1d', 3.5);

      // Burlap sack head
      ctx.fillStyle = '#614d35';
      ctx.beginPath();
      ctx.ellipse(0, -62 + twitch, 11, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hollow stitched face
      ctx.fillStyle = '#0f0b08';
      ctx.fillRect(-6, -65 + twitch, 4, 4);
      ctx.fillRect(2, -65 + twitch, 4, 4);
      roughLine(ctx, -6, -56 + twitch, 6, -56 + twitch, INK, 2);

      // Ragged coat shreds swaying
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-16, -42);
      ctx.lineTo(16, -42);
      ctx.lineTo(12 + Math.sin(time * 5) * 8, -12);
      ctx.lineTo(-12 + Math.sin(time * 5 + 1) * 8, -12);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'clockwork_automaton': {
      // Jerky brass mannequin with clicking scissor limbs
      const tickStep = Math.floor(time * 12) % 4;
      const armAngle = (tickStep - 1.5) * 0.4;
      
      // Brass body
      ctx.fillStyle = '#4a3f2b';
      ctx.fillRect(-10, -38, 20, 26);
      roughLine(ctx, -10, -38, 10, -38, '#9c814d', 2);
      roughLine(ctx, -10, -12, 10, -12, '#9c814d', 2);

      // Spinning chest cog
      ctx.fillStyle = '#9c814d';
      ctx.beginPath();
      ctx.arc(0, -25, 6, 0, Math.PI * 2);
      ctx.fill();

      // Scissor blade arm
      ctx.save();
      ctx.translate(10, -34);
      ctx.rotate(armAngle);
      roughLine(ctx, 0, 0, 18, 0, '#c7beaf', 3);
      roughLine(ctx, 0, 0, 16, 8, '#c7beaf', 2);
      ctx.restore();

      // Head with glowing slit
      ctx.fillStyle = '#31281c';
      ctx.fillRect(-7, -50, 14, 12);
      ctx.fillStyle = '#ffb338';
      ctx.fillRect(-4, -46, 8, 3);
      break;
    }

    case 'flying_leech': {
      // Undulating shadow parasite serpent in mid-air
      const floatY = -36 + Math.sin(time * 4 + m.phase) * 14;
      ctx.save();
      ctx.translate(0, floatY);

      // Segmented snake-like body
      for (let s = 0; s < 7; s++) {
        const segX = -s * 8;
        const segY = Math.sin(time * 10 - s * 0.8) * 8;
        const rad = 10 - s * 1.1;
        ctx.fillStyle = s % 2 === 0 ? col : '#2e120f';
        ctx.beginPath();
        ctx.arc(segX, segY, Math.max(3, rad), 0, Math.PI * 2);
        ctx.fill();
      }

      // Lamprey jaw with ring of razor fangs
      ctx.fillStyle = '#6e1d15';
      ctx.beginPath();
      ctx.arc(8, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5eedb';
      for (let tooth = 0; tooth < 6; tooth++) {
        const tang = (tooth / 6) * Math.PI * 2 + time * 3;
        ctx.fillRect(8 + Math.cos(tang) * 5, Math.sin(tang) * 5, 2, 2);
      }
      ctx.restore();
      break;
    }

    case 'bloody_mannequin': {
      // Faceless wooden dress dummy leaning forward
      const lean = Math.sin(time * 8) * 0.15 + 0.15;
      ctx.save();
      ctx.rotate(lean);

      // Torso
      ctx.fillStyle = '#5c4837';
      ctx.beginPath();
      ctx.moveTo(-11, -44);
      ctx.lineTo(11, -44);
      ctx.lineTo(8, -14);
      ctx.lineTo(-8, -14);
      ctx.closePath();
      ctx.fill();

      // Stained neck
      ctx.fillStyle = goreCol;
      ctx.fillRect(-4, -54, 8, 10);
      roughLine(ctx, -12, -30, 12, -26, goreCol, 3);

      // Wooden support stand
      roughLine(ctx, 0, -14, 0, 0, '#2e2116', 4);
      roughLine(ctx, -14, 0, 14, 0, '#2e2116', 3);
      ctx.restore();
      break;
    }

    case 'eyeball_spire': {
      // Tall fleshy pillar with stacking blinking slits
      ctx.fillStyle = '#261a15';
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-5, -64);
      ctx.lineTo(5, -64);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();

      // 4 Blinking eye slits
      for (let eye = 0; eye < 4; eye++) {
        const eyeY = -12 - eye * 14;
        const blink = Math.sin(time * 5 + eye * 1.7);
        if (blink > 0.2) {
          ctx.fillStyle = '#e8dcc4';
          ctx.beginPath();
          ctx.ellipse(0, eyeY, 6, 4 * blink, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ff2b2b';
          ctx.beginPath();
          ctx.arc(Math.sin(time * 2) * 2, eyeY, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          roughLine(ctx, -5, eyeY, 5, eyeY, '#0d0805', 1.8);
        }
      }
      break;
    }

    case 'thorn_leaper': {
      // Hunched spiny beast
      const leapBob = Math.sin(time * 9) * 4;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(0, -14 + leapBob, 18, 11, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Spines
      ctx.strokeStyle = '#c4b595';
      ctx.lineWidth = 2;
      for (let sp = -10; sp <= 10; sp += 5) {
        ctx.beginPath();
        ctx.moveTo(sp, -22 + leapBob);
        ctx.lineTo(sp - 4, -32 + leapBob);
        ctx.stroke();
      }
      break;
    }

    case 'raven_swarm': {
      // Swarm of black ravens flapping
      for (let r = 0; r < 4; r++) {
        const rx = Math.sin(time * 4 + r * 1.5) * 20 + r * 8;
        const ry = -40 + Math.cos(time * 3 + r * 2) * 16;
        const flap = Math.sin(time * 18 + r * 2.2) * 10;

        ctx.fillStyle = '#140f0c';
        ctx.beginPath();
        ctx.ellipse(rx, ry, 7, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        roughLine(ctx, rx - 3, ry, rx - 10, ry - flap, '#140f0c', 2);
        roughLine(ctx, rx + 3, ry, rx + 10, ry - flap, '#140f0c', 2);
      }
      break;
    }

    case 'weeping_watcher': {
      // Eerie background watcher weeping black tears
      ctx.fillStyle = '#19130e';
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-6, -60);
      ctx.lineTo(6, -60);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();

      // Hood
      ctx.beginPath();
      ctx.arc(0, -60, 11, 0, Math.PI * 2);
      ctx.fill();

      // Weeping black tear trails
      const tearLen = 14 + Math.sin(time * 4) * 6;
      roughLine(ctx, -3, -58, -3, -58 + tearLen, '#000000', 1.8);
      roughLine(ctx, 3, -58, 3, -58 + tearLen, '#000000', 1.8);
      break;
    }

    default: {
      // Fallback shadow hound
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(0, -16, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws seamless, clean-cut textured platforms with NO white borders or square seams
 */
export function drawSeamlessPlatform(
  ctx: CanvasRenderingContext2D,
  p: Platform,
  camX: number,
  time: number
) {
  const x = p.x - camX;
  const y = p.y;
  const w = p.w;
  const h = p.h;

  if (x > 1020 || x + w < -120) return;

  ctx.save();

  switch (p.kind) {
    case 'ground':
    case 'gnarled_roots': {
      // Deep loam earth body with natural dark gradient
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, '#4a3d2c');
      grad.addColorStop(0.3, '#35291b');
      grad.addColorStop(1, '#1b140d');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Fine cross-hatching
      drawCrossHatch(ctx, x, y, w, h, 14, 'rgba(10, 8, 6, 0.45)');

      // Top organic grass / gnarled root lip
      roughLine(ctx, x, y + 2, x + w, y + 2, '#d4c29b', 3);

      // Hanging roots dipping below into the abyss
      for (let rx = 12; rx < w; rx += 24) {
        const rootLen = 8 + (Math.sin(rx * 37) * 0.5 + 0.5) * 14;
        roughLine(ctx, x + rx, y + 2, x + rx - 4, y - 6, '#15110d', 1.8);
        roughLine(ctx, x + rx, y + h, x + rx + (Math.sin(rx) * 6), y + h + rootLen, '#2b2116', 2);
      }
      break;
    }

    case 'creaky_planks':
    case 'scaffolding': {
      // Weathered wood planks with wood grain
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, '#544331');
      grad.addColorStop(1, '#2c2217');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Horizontal grain lines
      ctx.strokeStyle = 'rgba(15, 11, 7, 0.4)';
      ctx.lineWidth = 1;
      for (let gy = 8; gy < h; gy += 10) {
        ctx.beginPath();
        ctx.moveTo(x, y + gy);
        ctx.lineTo(x + w, y + gy);
        ctx.stroke();
      }

      // Plank dividers & rusted nail heads
      for (let px = 28; px < w; px += 38) {
        roughLine(ctx, x + px, y, x + px, y + h, INK, 2);
        // Nails
        ctx.fillStyle = '#15110d';
        ctx.fillRect(x + px - 4, y + 4, 2, 2);
        ctx.fillRect(x + px - 4, y + h - 6, 2, 2);
      }

      // Top highlighted plank edge
      roughLine(ctx, x, y, x + w, y, '#b39d78', 2.5);
      break;
    }

    case 'rib_bones': {
      // Ivory bleached ribcage
      ctx.fillStyle = '#261f17';
      ctx.fillRect(x, y, w, h);

      // Arched rib structures
      for (let bx = 8; bx < w; bx += 20) {
        ctx.fillStyle = '#ded1b8';
        ctx.beginPath();
        ctx.moveTo(x + bx, y + h);
        ctx.quadraticCurveTo(x + bx + 8, y - 10, x + bx + 16, y + h);
        ctx.lineTo(x + bx + 12, y + h);
        ctx.quadraticCurveTo(x + bx + 8, y - 5, x + bx + 4, y + h);
        ctx.closePath();
        ctx.fill();
        roughLine(ctx, x + bx, y + h, x + bx + 8, y - 10, INK, 1.5);
      }
      roughLine(ctx, x, y, x + w, y, '#ebdcb9', 2.5);
      break;
    }

    case 'fractured_ice':
    case 'stone_slab': {
      // Hewn obsidian stone slab with chiselled cracks
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, '#423b32');
      grad.addColorStop(1, '#1e1a15');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Cracks and fractures
      for (let cx = 40; cx < w; cx += 70) {
        roughLine(ctx, x + cx, y, x + cx - 8, y + h * 0.5, INK, 1.5);
        roughLine(ctx, x + cx - 8, y + h * 0.5, x + cx + 6, y + h, INK, 1.5);
      }

      roughLine(ctx, x, y, x + w, y, '#e3d7be', 2.5);
      roughLine(ctx, x, y + h, x + w, y + h, INK, 2);
      break;
    }

    case 'brass_gears': {
      // Rotating clockwork gear platform
      ctx.fillStyle = '#4a381f';
      ctx.fillRect(x, y, w, h);

      // Interlocking rotating teeth
      const gearAngle = time * 2;
      for (let gx = 14; gx < w; gx += 26) {
        const toothH = 5 + Math.sin(gearAngle + gx) * 2;
        ctx.fillStyle = '#d4aa55';
        ctx.fillRect(x + gx - 4, y - toothH, 8, toothH);
      }

      roughLine(ctx, x, y, x + w, y, '#e5be67', 2.5);
      break;
    }

    case 'mirror_shards': {
      // Crystalline reflective mirror shard
      ctx.fillStyle = '#4f5b66';
      ctx.fillRect(x, y, w, h);

      // Reflective glint sweep
      const glintX = ((time * 140) % (w + 100)) - 50;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(x + glintX, y);
      ctx.lineTo(x + glintX + 30, y);
      ctx.lineTo(x + glintX + 15, y + h);
      ctx.lineTo(x + glintX - 15, y + h);
      ctx.closePath();
      ctx.fill();

      roughLine(ctx, x, y, x + w, y, '#ffffff', 2.5);
      break;
    }

    case 'floating_tomes': {
      // Ancient hovering grimoires
      ctx.fillStyle = '#3b1c18';
      ctx.fillRect(x, y, w, h);

      // Golden book corners and bookmark ribbon
      ctx.fillStyle = '#d4aa55';
      ctx.fillRect(x, y, 6, 6);
      ctx.fillRect(x + w - 6, y, 6, 6);
      ctx.fillRect(x + w * 0.5 - 2, y + h, 4, 12); // hanging ribbon

      roughLine(ctx, x, y, x + w, y, '#ebdcb9', 2.5);
      break;
    }
  }

  ctx.restore();
}
