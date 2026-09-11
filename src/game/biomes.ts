import { BiomeConfig } from '../types';

export const BIOMES: BiomeConfig[] = [
  {
    id: 0,
    name: "The Weeping Woods",
    description: "Trees carved with screaming faces whose roots thirst for marrow.",
    skyColor: "#8e8062",
    fogColor: "#4f4937",
    groundColor: "#695940",
    accentColor: "#bfae8a",
    particleType: "ash"
  },
  {
    id: 1,
    name: "A House With No Outside",
    description: "Endless corridors of peeling damask and floorboards that breathe.",
    skyColor: "#7a6750",
    fogColor: "#43362a",
    groundColor: "#574635",
    accentColor: "#a38c6b",
    particleType: "embers"
  },
  {
    id: 2,
    name: "The Drowned Orchard",
    description: "Submerged rotting branches under an oppressive, suffocating miasma.",
    skyColor: "#757c70",
    fogColor: "#39443e",
    groundColor: "#4e574f",
    accentColor: "#93a08f",
    particleType: "rain_ink"
  },
  {
    id: 3,
    name: "The Cathedral of Teeth",
    description: "Towering bone arches and ribcage walkways echoing with whispers.",
    skyColor: "#8f8274",
    fogColor: "#4e413a",
    groundColor: "#67554b",
    accentColor: "#c2b4a3",
    particleType: "spores"
  },
  {
    id: 4,
    name: "The Clockwork Abyss",
    description: "Massive rotating bronze gears, pendulum scythes, and ticking iron vaults.",
    skyColor: "#73644f",
    fogColor: "#3e3223",
    groundColor: "#5c4d3b",
    accentColor: "#d5a560",
    particleType: "embers"
  },
  {
    id: 5,
    name: "The Hall of Fractured Mirrors",
    description: "Distorted silvered reflections that turn around when your back is faced.",
    skyColor: "#6a737d",
    fogColor: "#353d45",
    groundColor: "#4a535b",
    accentColor: "#adc1d4",
    particleType: "ash"
  },
  {
    id: 6,
    name: "The Iron Graveyard of Clocks",
    description: "Shattered grandfather clocks half-buried in rust and forgotten appointments.",
    skyColor: "#7d6255",
    fogColor: "#423028",
    groundColor: "#5c4338",
    accentColor: "#bfa395",
    particleType: "embers"
  },
  {
    id: 7,
    name: "The Liminal Bedroom",
    description: "Crooked doorways leading into identical rooms, empty beds, and static televisions.",
    skyColor: "#6c665d",
    fogColor: "#3b3630",
    groundColor: "#524d45",
    accentColor: "#a8a296",
    particleType: "rain_ink"
  },
  {
    id: 8,
    name: "The Chasm of Screaming Ribs",
    description: "Suspended skeletal bridges swinging wildly over a bottomless pitch chasm.",
    skyColor: "#6e5d59",
    fogColor: "#3b2f2d",
    groundColor: "#544440",
    accentColor: "#c2a9a4",
    particleType: "spores"
  },
  {
    id: 9,
    name: "The Sanguine Library",
    description: "Towering bookshelves of blackened ink where the words crawl off the parchment.",
    skyColor: "#7d5555",
    fogColor: "#422828",
    groundColor: "#5e3939",
    accentColor: "#c48f8f",
    particleType: "embers"
  },
  {
    id: 10,
    name: "The Observatory of Blind Eyes",
    description: "Giant brass telescopes aimed at a starless void that gazes directly back.",
    skyColor: "#545b6e",
    fogColor: "#292e3d",
    groundColor: "#3f4659",
    accentColor: "#8e9aaf",
    particleType: "ash"
  },
  {
    id: 11,
    name: "Where the Snow is Ash",
    description: "The frozen core of the fractured glass sphere where all memory finally ceases.",
    skyColor: "#a29780",
    fogColor: "#565149",
    groundColor: "#736b5d",
    accentColor: "#dfd5be",
    particleType: "snow_ash"
  }
];

export function getBiomeForDistance(distanceMeters: number): BiomeConfig {
  const index = Math.floor(distanceMeters / 400) % BIOMES.length;
  return BIOMES[index];
}
