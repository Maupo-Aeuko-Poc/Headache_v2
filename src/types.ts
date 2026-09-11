export type GameState =
  | 'menu'
  | 'settings'
  | 'intro'
  | 'play'
  | 'paused'
  | 'riddle'
  | 'gameover'
  | 'ending'
  | 'exited';

export type Difficulty = 'dream' | 'nightmare' | 'schizophrenia';

export interface GameSettings {
  resolution: number; // 0.75, 1, 1.5, 2
  difficulty: Difficulty;
  mute: boolean;
  reducedMotion: boolean;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  face: 1 | -1;
  grounded: boolean;
  coyoteTimer: number;
  jumpQueueTimer: number;
  jumpsLeft: number;
  dashTimer: number;
  dashCooldown: number;
  dashQueueTimer: number;
  graceTimer: number; // invulnerability
  wallSlide: boolean;
  wallDir: -1 | 1 | 0;
  animFrame: number;
}

export type PlatformKind =
  | 'ground'
  | 'gnarled_roots'
  | 'creaky_planks'
  | 'rib_bones'
  | 'fractured_ice'
  | 'scaffolding'
  | 'stone_slab'
  | 'brass_gears'
  | 'mirror_shards'
  | 'floating_tomes';

export interface Platform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: PlatformKind;
  oneWay?: boolean;
}

export type MonsterType =
  | 'hound'            // Three-headed dog with human eyes
  | 'nine_arms'        // Crawling man with nine arms and no body
  | 'stilt_walker'     // Towering skeletal needle legs stalking platforms
  | 'tree_mouth'       // Weeping face tree with gnashing jaws
  | 'eyeball_mass'     // Writhing tentacle mass with staring pupils
  | 'raven_swarm'      // Circling flock of shadowed black ravens
  | 'thorn_leaper'     // Scuttling shadow beast leaping from cracks
  | 'pendulum_blade'   // Swinging brass razor pendulum hazard
  | 'crawling_hand'    // Skittering shadow hands grabbing along ledges
  | 'weeping_watcher'  // Harmless eerie watcher crying ink in the background
  | 'spider_shadow'    // Multi-legged spindly arachnid skittering across ceilings/floors
  | 'weeping_scarecrow'// Ragged burlap scarecrow with twitching straw arms
  | 'clockwork_automaton' // Jerky brass mannequin with clicking gear limbs
  | 'flying_leech'     // Undulating airborne shadow serpent gliding through fog
  | 'bloody_mannequin' // Twitching wooden dressmaker dummy sliding on rails
  | 'eyeball_spire';   // Tall fleshy pillar studded with blinking slit eyes

export interface MemoryShard {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  pulsePhase: number;
}

export interface Monster {
  id: string;
  type: MonsterType;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  range: number;
  width: number;
  height: number;
  phase: number;
  speed: number;
  harmless: boolean;
  facing: 1 | -1;
}

export type SurrealObjectKind =
  | 'refrigerator'         // Rusted fridge in forest
  | 'campfire_mansion'     // Campfire inside decayed room
  | 'grandfather_clock'    // Spinning hands clock
  | 'clawfoot_bathtub'     // Tub filled with dark ink
  | 'static_tv'            // Vintage television with glowing eye
  | 'hospital_gurney'      // Gurney with stained cloth
  | 'overturned_piano'     // Briar-choked piano
  | 'split_tree_dagger'    // Dagger in split trunk from PDF
  | 'snowglobe_shrine'     // Tentacle snowglobe on table from PDF
  | 'lone_barn_facade'     // Distant dilapidated barn with lit window from PDF
  | 'hanging_birdcage'     // Victorian birdcage with pale skull
  | 'gramophone_blood'     // Brass horn gramophone playing static
  | 'floating_chair'       // High-backed parlor chair hovering slightly
  | 'telephone_pole_dolls' // Tangled wires with dangling ragdolls
  | 'antique_sewing_machine' // Iron pedal machine stitching dark hair
  | 'broken_iron_maiden'   // Spiked iron sarcophagus slightly ajar
  | 'mirror_pedestal'      // Solitary shattered tall mirror
  | 'chandelier_roots'     // Crystal chandelier entangled in roots
  | 'streetlamp_flicker'   // Wrought-iron gas lamp flickering
  | 'guillotine_blade'     // Weathered guillotine with steel blade
  | 'bookshelf_collapse'   // Slanted bookcase spilling burned tomes
  | 'porcelain_mannequin'  // Dressmaker dummy draped in barbed wire
  | 'cradle_rocking'       // Wooden cradle rocking in the breeze
  | 'church_pew_carved'    // Broken gothic church pew with claw marks
  | 'weeping_stone_angel'  // Stone monument weeping black oil
  | 'gallows_silhouette'   // Heavy timber gallows with dangling noose
  | 'antique_typewriter'   // Mechanical typewriter typing repeating text
  | 'steamer_trunk'        // Brass-riveted trunk wrapped in heavy chains
  | 'cauldron_smoking'     // Cast iron pot bubbling with pale mist
  | 'tall_candelabra';     // Seven-branch blackened brass candelabra

export interface SurrealObject {
  id: string;
  kind: SurrealObjectKind;
  x: number;
  y: number;
  salt: number;
}

export interface RiddleGate {
  id: string;
  x: number;
  y: number;
  solved: boolean;
  riddleIndex: number;
}

export interface Riddle {
  question: string;
  clue: string;
  options: string[];
  correctIndex: number;
  keeperReaction: string;
}

export interface BiomeConfig {
  id: number;
  name: string;
  description: string;
  skyColor: string;
  fogColor: string;
  groundColor: string;
  accentColor: string;
  particleType: 'ash' | 'spores' | 'rain_ink' | 'snow_ash' | 'embers';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'ash' | 'blood' | 'glass' | 'smoke' | 'spark' | 'shard';
}
