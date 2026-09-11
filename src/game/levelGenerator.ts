import {
  Platform,
  Monster,
  SurrealObject,
  RiddleGate,
  PlatformKind,
  MonsterType,
  SurrealObjectKind,
  Difficulty,
  MemoryShard
} from '../types';
import { RIDDLES } from './riddles';

export interface ChunkGenerationState {
  seed: number;
  nextX: number;
  lastY: number;
  chunkIndex: number;
  difficulty: Difficulty;
}

// PRNG for deterministic, reproducible chunks
export function createRNG(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class LevelGenerator {
  private rng: () => number;
  public nextX: number = 0;
  public lastY: number = 440;
  public chunkIndex: number = 0;
  private difficulty: Difficulty;
  private lastMonsterX: number = -9999;
  private lastObjectX: number = -9999;

  constructor(seed: number, difficulty: Difficulty = 'nightmare') {
    this.rng = createRNG(seed);
    this.difficulty = difficulty;
  }

  /**
   * Generates world content up to a given X coordinate
   */
  public generateUpTo(
    targetX: number,
    existingPlatforms: Platform[],
    existingEntities: Monster[],
    existingObjects: SurrealObject[],
    existingGates: RiddleGate[],
    existingShards?: MemoryShard[]
  ) {
    const r = this.rng;

    while (this.nextX < targetX) {
      const idx = this.chunkIndex++;
      const isIntro = idx < 2;
      const isRiddleGate = !isIntro && idx % 7 === 0;

      // Distance in meters (10px per meter)
      const distanceMeters = Math.floor(this.nextX / 10);
      const biomeId = Math.floor(distanceMeters / 400) % 12;

      // Platform styles based on 12 atmospheric biomes
      let platformKind: PlatformKind = 'ground';
      if (biomeId === 0) platformKind = r() < 0.5 ? 'ground' : 'gnarled_roots';
      else if (biomeId === 1) platformKind = r() < 0.5 ? 'creaky_planks' : 'scaffolding';
      else if (biomeId === 2) platformKind = r() < 0.6 ? 'creaky_planks' : 'stone_slab';
      else if (biomeId === 3) platformKind = r() < 0.5 ? 'rib_bones' : 'stone_slab';
      else if (biomeId === 4) platformKind = r() < 0.5 ? 'brass_gears' : 'scaffolding';
      else if (biomeId === 5) platformKind = r() < 0.5 ? 'mirror_shards' : 'stone_slab';
      else if (biomeId === 6) platformKind = r() < 0.5 ? 'brass_gears' : 'creaky_planks';
      else if (biomeId === 7) platformKind = r() < 0.5 ? 'creaky_planks' : 'scaffolding';
      else if (biomeId === 8) platformKind = r() < 0.6 ? 'rib_bones' : 'gnarled_roots';
      else if (biomeId === 9) platformKind = r() < 0.6 ? 'floating_tomes' : 'creaky_planks';
      else if (biomeId === 10) platformKind = r() < 0.5 ? 'stone_slab' : 'brass_gears';
      else platformKind = r() < 0.5 ? 'fractured_ice' : 'stone_slab';

      if (isIntro) {
        // Safe starting runway with extended solid ground starting at x = -500
        const groundW = 1200;
        const groundY = 440;
        existingPlatforms.push({
          id: `plat_${idx}_base`,
          x: idx === 0 ? -500 : this.nextX,
          y: groundY,
          w: idx === 0 ? 1500 : groundW,
          h: 220,
          kind: platformKind
        });

        // Left solid boundary wall so the player can NEVER fall behind spawn into a pit!
        if (idx === 0) {
          existingPlatforms.push({
            id: `plat_${idx}_left_wall`,
            x: -160,
            y: groundY - 450,
            w: 80,
            h: 450,
            kind: 'stone_slab'
          });
        }

        // Add a gentle floating platform to teach jump
        existingPlatforms.push({
          id: `plat_${idx}_float`,
          x: (idx === 0 ? 280 : this.nextX + 380),
          y: groundY - 95,
          w: 160,
          h: 24,
          kind: 'scaffolding'
        });

        if (existingShards) {
          existingShards.push({
            id: `shard_${idx}`,
            x: (idx === 0 ? 360 : this.nextX + 460),
            y: groundY - 120,
            collected: false,
            pulsePhase: r() * Math.PI * 2
          });
        }

        // Add a strange object in starting area
        existingObjects.push({
          id: `obj_${idx}`,
          kind: 'split_tree_dagger',
          x: (idx === 0 ? 560 : this.nextX + 560),
          y: groundY,
          salt: r()
        });

        this.lastY = groundY;
        this.nextX = idx === 0 ? 1000 : this.nextX + groundW;
        continue;
      }

      if (isRiddleGate) {
        // Safe sanctuary around the Keeper's Gate
        const sanctuaryW = 720;
        const sanctuaryY = Math.max(340, Math.min(460, this.lastY + (r() - 0.5) * 40));

        existingPlatforms.push({
          id: `plat_${idx}_gate`,
          x: this.nextX,
          y: sanctuaryY,
          w: sanctuaryW,
          h: 180,
          kind: 'stone_slab'
        });

        // Place the Riddle Gate
        const riddleIdx = Math.floor(r() * RIDDLES.length);
        existingGates.push({
          id: `gate_${idx}`,
          x: this.nextX + sanctuaryW * 0.6,
          y: sanctuaryY,
          solved: false,
          riddleIndex: riddleIdx
        });

        // Strange sacred object nearby
        const gateObjKinds: SurrealObjectKind[] = ['snowglobe_shrine', 'grandfather_clock', 'static_tv'];
        existingObjects.push({
          id: `obj_gate_${idx}`,
          kind: gateObjKinds[Math.floor(r() * gateObjKinds.length)],
          x: this.nextX + sanctuaryW * 0.25,
          y: sanctuaryY,
          salt: r()
        });

        this.lastY = sanctuaryY;
        this.nextX += sanctuaryW + 40;
        continue;
      }

      // Mario / Hollow Knight level pattern selection
      const patternType = Math.floor(r() * 6);
      const gap = 38 + r() * 48; // gaps are strictly tuned so single jump or double jump can clear
      const startX = this.nextX + gap;

      switch (patternType) {
    case 0: {
          // Classic Mario: Stepped Ground with High Road
          const segW = 600 + r() * 180;
          const groundY = Math.max(340, Math.min(460, this.lastY + (r() - 0.5) * 60));

          existingPlatforms.push({
            id: `plat_${idx}_g`,
            x: startX,
            y: groundY,
            w: segW,
            h: 180,
            kind: platformKind
          });

          // High road floating platform (reward route)
          const floatW = 200 + r() * 90;
          const floatY = groundY - 105;
          existingPlatforms.push({
            id: `plat_${idx}_high`,
            x: startX + 140,
            y: floatY,
            w: floatW,
            h: 22,
            kind: 'scaffolding'
          });

          // Dense entities: ground patroller + overhead flyer + high road watcher
          this.maybeSpawnMonster(startX + segW * 0.3, groundY, existingEntities, r, segW * 0.15);
          this.maybeSpawnMonster(startX + segW * 0.75, groundY, existingEntities, r, segW * 0.18);
          this.maybeSpawnMonster(startX + 220, floatY, existingEntities, r, 30);
          this.maybeSpawnMonster(startX + segW * 0.5, groundY - 140, existingEntities, r, 40, 'flying_leech');

          // Dense surreal objects across the expanse
          this.maybeSpawnSurrealObject(startX + 60, groundY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + 200, floatY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + segW - 80, groundY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + segW * 0.45, groundY, existingObjects, r, biomeId);

          this.lastY = groundY;
          this.nextX = startX + segW;
          break;
        }

        case 1: {
          // Chasm with Twin Stepping Islands (Hollow Knight style)
          const island1W = 180 + r() * 70;
          const island2W = 200 + r() * 80;
          const island1Y = Math.max(340, Math.min(450, this.lastY + (r() - 0.5) * 50));
          const island2Y = Math.max(330, Math.min(450, island1Y + (r() - 0.5) * 70));

          existingPlatforms.push({
            id: `plat_${idx}_i1`,
            x: startX,
            y: island1Y,
            w: island1W,
            h: 180,
            kind: platformKind
          });

          const midGap = 45 + r() * 35;
          const island2X = startX + island1W + midGap;

          existingPlatforms.push({
            id: `plat_${idx}_i2`,
            x: island2X,
            y: island2Y,
            w: island2W,
            h: 180,
            kind: platformKind
          });

          // Floating overhead ledge above island 2
          existingPlatforms.push({
            id: `plat_${idx}_ledge`,
            x: island2X + 30,
            y: island2Y - 100,
            w: 130,
            h: 20,
            kind: 'scaffolding'
          });

          // Entities across both islands and overhead
          this.maybeSpawnMonster(startX + island1W * 0.45, island1Y, existingEntities, r, island1W * 0.2);
          this.maybeSpawnMonster(island2X + island2W * 0.5, island2Y, existingEntities, r, island2W * 0.2);
          this.maybeSpawnMonster(island2X + 80, island2Y - 100, existingEntities, r, 20);
          this.maybeSpawnMonster(startX + island1W + midGap * 0.5, island1Y - 90, existingEntities, r, 30, 'raven_swarm');

          // Multiple surreal objects
          this.maybeSpawnSurrealObject(startX + 40, island1Y, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(island2X + 50, island2Y, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(island2X + island2W - 40, island2Y, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(island2X + 70, island2Y - 100, existingObjects, r, biomeId);

          this.lastY = island2Y;
          this.nextX = island2X + island2W;
          break;
        }

        case 2: {
          // Mario Stairway / Pyramid Progression
          const totalW = 620;
          const baseY = Math.max(380, Math.min(460, this.lastY));

          // Base segment
          existingPlatforms.push({
            id: `plat_${idx}_base_stair`,
            x: startX,
            y: baseY,
            w: totalW,
            h: 180,
            kind: platformKind
          });

          // Ascending and descending step blocks
          const step1W = 110;
          const step2W = 130;
          const step3W = 110;

          existingPlatforms.push({
            id: `plat_${idx}_s1`,
            x: startX + 110,
            y: baseY - 60,
            w: step1W,
            h: 60,
            kind: 'stone_slab'
          });

          existingPlatforms.push({
            id: `plat_${idx}_s2`,
            x: startX + 230,
            y: baseY - 120,
            w: step2W,
            h: 120,
            kind: 'stone_slab'
          });

          existingPlatforms.push({
            id: `plat_${idx}_s3`,
            x: startX + 370,
            y: baseY - 60,
            w: step3W,
            h: 60,
            kind: 'stone_slab'
          });

          // Entities patrolling pyramid tiers
          this.maybeSpawnMonster(startX + 60, baseY, existingEntities, r, 30);
          this.maybeSpawnMonster(startX + 160, baseY - 60, existingEntities, r, 25);
          this.maybeSpawnMonster(startX + 290, baseY - 120, existingEntities, r, 30);
          this.maybeSpawnMonster(startX + 420, baseY - 60, existingEntities, r, 25);
          this.maybeSpawnMonster(startX + 520, baseY, existingEntities, r, 35);

          // Multiple surreal objects
          this.maybeSpawnSurrealObject(startX + 40, baseY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + 290, baseY - 120, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + totalW - 70, baseY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + 160, baseY - 60, existingObjects, r, biomeId);

          this.lastY = baseY;
          this.nextX = startX + totalW;
          break;
        }

        case 3: {
          // Hollow Knight Multi-Ledge Crypt / Chamber
          const cavernW = 660;
          const bottomY = 465;

          // Lower cavern floor
          existingPlatforms.push({
            id: `plat_${idx}_cave_floor`,
            x: startX,
            y: bottomY,
            w: cavernW,
            h: 160,
            kind: platformKind
          });

          // Tier 1 floating ledge
          existingPlatforms.push({
            id: `plat_${idx}_tier1`,
            x: startX + 80,
            y: bottomY - 90,
            w: 160,
            h: 22,
            kind: 'creaky_planks'
          });

          // Tier 2 floating ledge
          existingPlatforms.push({
            id: `plat_${idx}_tier2`,
            x: startX + 260,
            y: bottomY - 145,
            w: 180,
            h: 22,
            kind: 'creaky_planks'
          });

          // Tier 3 exit ledge
          existingPlatforms.push({
            id: `plat_${idx}_tier3`,
            x: startX + 470,
            y: bottomY - 80,
            w: 150,
            h: 22,
            kind: 'creaky_planks'
          });

          // Dense entities in crypt
          this.maybeSpawnMonster(startX + 160, bottomY, existingEntities, r, 50);
          this.maybeSpawnMonster(startX + 400, bottomY, existingEntities, r, 60);
          this.maybeSpawnMonster(startX + 150, bottomY - 90, existingEntities, r, 30);
          this.maybeSpawnMonster(startX + 340, bottomY - 145, existingEntities, r, 35);
          this.maybeSpawnMonster(startX + 530, bottomY - 80, existingEntities, r, 25);

          // Objects scattered across ledges
          this.maybeSpawnSurrealObject(startX + 60, bottomY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + 140, bottomY - 90, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + 340, bottomY - 145, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + 520, bottomY - 80, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + cavernW - 60, bottomY, existingObjects, r, biomeId);

          this.lastY = bottomY - 80;
          this.nextX = startX + cavernW;
          break;
        }

        case 4: {
          // Extended Undulating Terrain with Grotesque Monoliths
          const plateauW = 600 + r() * 160;
          const platY = Math.max(350, Math.min(450, this.lastY + (r() - 0.5) * 50));

          existingPlatforms.push({
            id: `plat_${idx}_plat`,
            x: startX,
            y: platY,
            w: plateauW,
            h: 180,
            kind: platformKind
          });

          // Add stepping stones overhead
          existingPlatforms.push({
            id: `plat_${idx}_stone1`,
            x: startX + plateauW * 0.25,
            y: platY - 95,
            w: 120,
            h: 24,
            kind: 'stone_slab'
          });

          existingPlatforms.push({
            id: `plat_${idx}_stone2`,
            x: startX + plateauW * 0.65,
            y: platY - 95,
            w: 120,
            h: 24,
            kind: 'stone_slab'
          });

          // Multiple entities patrolling
          this.maybeSpawnMonster(startX + plateauW * 0.2, platY, existingEntities, r, 40);
          this.maybeSpawnMonster(startX + plateauW * 0.55, platY, existingEntities, r, 50);
          this.maybeSpawnMonster(startX + plateauW * 0.82, platY, existingEntities, r, 40);
          this.maybeSpawnMonster(startX + plateauW * 0.3, platY - 95, existingEntities, r, 20);
          this.maybeSpawnMonster(startX + plateauW * 0.7, platY - 95, existingEntities, r, 20);

          // Multiple surreal objects
          this.maybeSpawnSurrealObject(startX + 70, platY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + plateauW * 0.45, platY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + plateauW - 70, platY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(startX + plateauW * 0.28, platY - 95, existingObjects, r, biomeId);

          this.lastY = platY;
          this.nextX = startX + plateauW;
          break;
        }

        default: {
          // Gap Crossing with Mid-Air Slabs (Precision Platforming)
          const spanW = 640;
          const leftPlatW = 190;
          const leftPlatY = Math.max(360, Math.min(450, this.lastY));

          existingPlatforms.push({
            id: `plat_${idx}_left`,
            x: startX,
            y: leftPlatY,
            w: leftPlatW,
            h: 180,
            kind: platformKind
          });

          // Floating stepping stones across the void
          existingPlatforms.push({
            id: `plat_${idx}_mid1`,
            x: startX + leftPlatW + 40,
            y: leftPlatY - 40,
            w: 95,
            h: 22,
            kind: 'scaffolding'
          });

          existingPlatforms.push({
            id: `plat_${idx}_mid2`,
            x: startX + leftPlatW + 165,
            y: leftPlatY - 65,
            w: 95,
            h: 22,
            kind: 'scaffolding'
          });

          const rightPlatW = 220;
          const rightPlatX = startX + spanW - rightPlatW;
          const rightPlatY = Math.max(340, Math.min(460, leftPlatY + (r() - 0.5) * 40));

          existingPlatforms.push({
            id: `plat_${idx}_right`,
            x: rightPlatX,
            y: rightPlatY,
            w: rightPlatW,
            h: 180,
            kind: platformKind
          });

          // Entities on left, right, and mid-air hazards
          this.maybeSpawnMonster(startX + leftPlatW * 0.45, leftPlatY, existingEntities, r, 30);
          this.maybeSpawnMonster(rightPlatX + rightPlatW * 0.5, rightPlatY, existingEntities, r, 45);
          this.maybeSpawnMonster(startX + leftPlatW + 90, leftPlatY - 40, existingEntities, r, 15);
          this.maybeSpawnMonster(startX + leftPlatW + 120, leftPlatY - 140, existingEntities, r, 30, 'flying_leech');

          // Surreal objects
          this.maybeSpawnSurrealObject(startX + 45, leftPlatY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(rightPlatX + 60, rightPlatY, existingObjects, r, biomeId);
          this.maybeSpawnSurrealObject(rightPlatX + rightPlatW - 40, rightPlatY, existingObjects, r, biomeId);

          this.lastY = rightPlatY;
          this.nextX = startX + spanW;
          break;
        }
      }
    }
  }

  private maybeSpawnMonster(
    x: number,
    y: number,
    entities: Monster[],
    r: () => number,
    range: number,
    forcedType?: MonsterType
  ) {
    // Spacing check: enforce minimum distance between consecutive monsters depending on difficulty to prevent clustering
    const minSpacing = this.difficulty === 'dream' ? 440 : this.difficulty === 'nightmare' ? 300 : 200;
    if (x - this.lastMonsterX < minSpacing) return;

    // Difficulty hazard frequency
    const spawnChance = this.difficulty === 'dream' ? 0.35 : this.difficulty === 'nightmare' ? 0.60 : 0.80;
    if (!forcedType && r() > spawnChance) return;

    this.lastMonsterX = x;

    const monsterTypes: MonsterType[] = [
      'hound',
      'nine_arms',
      'stilt_walker',
      'tree_mouth',
      'eyeball_mass',
      'raven_swarm',
      'thorn_leaper',
      'pendulum_blade',
      'crawling_hand',
      'spider_shadow',
      'weeping_scarecrow',
      'clockwork_automaton',
      'flying_leech',
      'bloody_mannequin',
      'eyeball_spire'
    ];
    const type = forcedType || monsterTypes[Math.floor(r() * monsterTypes.length)];

    let width = 45;
    let height = 45;
    let speed = 40 + r() * 35;

    if (type === 'hound') {
      width = 54;
      height = 36;
      speed = 55 + r() * 25;
    } else if (type === 'nine_arms') {
      width = 60;
      height = 30;
      speed = 40 + r() * 20;
    } else if (type === 'stilt_walker') {
      width = 32;
      height = 76;
      speed = 30 + r() * 15;
    } else if (type === 'tree_mouth') {
      width = 46;
      height = 68;
      speed = 0; // rooted stationary trap
      range = 0;
    } else if (type === 'eyeball_mass') {
      width = 44;
      height = 44;
      speed = 35 + r() * 30;
    } else if (type === 'raven_swarm') {
      width = 48;
      height = 36;
      speed = 60 + r() * 30;
    } else if (type === 'thorn_leaper') {
      width = 44;
      height = 32;
      speed = 70 + r() * 35;
    } else if (type === 'pendulum_blade') {
      width = 40;
      height = 70;
      speed = 85 + r() * 40;
    } else if (type === 'crawling_hand') {
      width = 42;
      height = 28;
      speed = 50 + r() * 30;
    } else if (type === 'spider_shadow') {
      width = 48;
      height = 32;
      speed = 65 + r() * 25;
    } else if (type === 'weeping_scarecrow') {
      width = 36;
      height = 64;
      speed = 0;
      range = 0;
    } else if (type === 'clockwork_automaton') {
      width = 40;
      height = 54;
      speed = 45 + r() * 20;
    } else if (type === 'flying_leech') {
      width = 50;
      height = 34;
      speed = 50 + r() * 35;
    } else if (type === 'bloody_mannequin') {
      width = 36;
      height = 58;
      speed = 55 + r() * 25;
    } else if (type === 'eyeball_spire') {
      width = 30;
      height = 66;
      speed = 0;
      range = 0;
    }

    // Some monsters are harmless illusions/watchers as requested in PDF
    const harmless = !forcedType && r() < 0.18;

    entities.push({
      id: `monster_${entities.length}_${Math.floor(x)}`,
      type,
      x,
      y,
      baseX: x,
      baseY: y,
      vx: speed,
      range: Math.max(20, range),
      width,
      height,
      phase: r() * Math.PI * 2,
      speed,
      harmless,
      facing: r() < 0.5 ? 1 : -1
    });
  }

  private maybeSpawnSurrealObject(
    x: number,
    y: number,
    objects: SurrealObject[],
    r: () => number,
    biomeId: number
  ) {
    if (x - this.lastObjectX < 140) return;
    if (r() > 0.70) return;
    this.lastObjectX = x;

    // 30 Incongruous objects spawning as requested in PDF
    const surrealPool: SurrealObjectKind[] = [
      'refrigerator',
      'campfire_mansion',
      'grandfather_clock',
      'clawfoot_bathtub',
      'static_tv',
      'hospital_gurney',
      'overturned_piano',
      'split_tree_dagger',
      'snowglobe_shrine',
      'lone_barn_facade',
      'hanging_birdcage',
      'gramophone_blood',
      'floating_chair',
      'telephone_pole_dolls',
      'antique_sewing_machine',
      'broken_iron_maiden',
      'mirror_pedestal',
      'chandelier_roots',
      'streetlamp_flicker',
      'guillotine_blade',
      'bookshelf_collapse',
      'porcelain_mannequin',
      'cradle_rocking',
      'church_pew_carved',
      'weeping_stone_angel',
      'gallows_silhouette',
      'antique_typewriter',
      'steamer_trunk',
      'cauldron_smoking',
      'tall_candelabra'
    ];

    // Pick a strange object
    const kind = surrealPool[Math.floor(r() * surrealPool.length)];

    objects.push({
      id: `surreal_${objects.length}_${Math.floor(x)}`,
      kind,
      x,
      y,
      salt: r()
    });
  }
}
