import { levels } from "../Units/InitialUnits";
import type { BattlefieldSize, GameOptions, TeamName, TerrainGenerationSettings, TerrainPoint, TerrainType } from "./types";

export const BACKGROUND_MUSIC_SRC = "/Crown%20of%20Ashes.mp3";

export const ALL_TEAMS = [
  "Romans",
  "Barbarians",
  "Greeks",
  "Gauls",
  "Germanic",
  "Carthage",
  "Egypt",
  "Thracians",
  "Dacians",
  "Parthians",
  "Seleucids",
  "Vikings"
] as const satisfies readonly TeamName[];

export const GRID_ORIENTATIONS = ["north", "east", "south", "west"] as const;

export const TEAM_SELECT_GROUPS = [
  { label: "Ancient Powers", teams: ["Romans", "Greeks", "Carthage", "Egypt", "Seleucids"] as TeamName[] },
  { label: "Border Kingdoms", teams: ["Thracians", "Dacians", "Parthians"] as TeamName[] },
  { label: "Tribal Realms", teams: ["Barbarians", "Gauls", "Germanic", "Vikings"] as TeamName[] }
] as const;

export const LEVEL_MATCHUP_LABELS: Record<keyof typeof levels, string> = {
  Level1: "Romans vs Barbarians",
  Level2: "Greeks vs Gauls",
  Level3: "Carthage vs Vikings",
  Level4: "Germanic vs Egypt",
  Level5: "Romans vs Carthage",
  Level6: "Greeks vs Germanic",
  Level7: "Gauls vs Vikings",
  Level8: "Barbarians vs Egypt",
  Level9: "Egypt vs Romans",
  Level10: "Egypt vs Greeks",
  Level11: "Gauls vs Carthage",
  Level12: "Vikings vs Egypt",
  Level13: "Thracians vs Dacians",
  Level14: "Parthians vs Seleucids",
  Level15: "Thracians vs Parthians",
  Level16: "Dacians vs Seleucids"
};

export const TERRAIN_ASSETS: Record<TerrainType, string> = {
  plain: "/tiles/plain.png",
  forest: "/tiles/forest.jpeg",
  hill: "/tiles/hill.png",
  river: "/tiles/river.png",
  desert: "/tiles/desert.png"
};

/** Looped forest tile video (`muted` + `playsInline` for autoplay). Falls back to `TERRAIN_ASSETS.forest` when videos off or reduced motion. */
export const FOREST_TILE_VIDEO_SRC = "/tiles/forest.mp4";

/** Looped plain tile video. Falls back to `TERRAIN_ASSETS.plain` when reduced motion. */
export const PLAIN_TILE_VIDEO_SRC = "/tiles/plain.mp4";

/** Looped hill tile video. Falls back to `TERRAIN_ASSETS.hill` when reduced motion. */
export const HILL_TILE_VIDEO_SRC = "/tiles/hill.mp4";

/** Looped river tile video (straights and bends use the same clip + autotile transform). Falls back to PNG autotile / `TERRAIN_ASSETS.river` when videos off or reduced motion. */
export const RIVER_TILE_VIDEO_SRC = "/tiles/river.mp4";

/** Looped desert tile video. Falls back to `TERRAIN_ASSETS.desert` when videos off or reduced motion. */
export const DESERT_TILE_VIDEO_SRC = "/tiles/desert.mp4";

export const TERRAIN_LABELS: Record<TerrainType, string> = {
  plain: "Plain",
  forest: "Forest",
  hill: "Hill",
  river: "River",
  desert: "Desert"
};

export const TERRAIN_TYPES: TerrainType[] = ["plain", "forest", "hill", "river", "desert"];

export const DEFAULT_TERRAIN_GENERATION_SETTINGS: TerrainGenerationSettings = {
  plain: true,
  forest: true,
  hill: true,
  river: true,
  desert: true
};

export const CARDINAL_DIRECTIONS: TerrainPoint[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 }
];

export const ALL_DIRECTIONS: TerrainPoint[] = [
  ...CARDINAL_DIRECTIONS,
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 }
];

export const GAME_STATE_STORAGE_KEY = "battlecry-game-state";
export const GAME_VERSION = "0.0.0";
export const GAME_BUILD_LABEL = "Battle Feedback Pass";
export const BATTLEFIELD_SIZE_OPTIONS: BattlefieldSize[] = [8, 10, 12, 14, 16, 18, 20];

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  musicEnabled: true,
  sfxEnabled: true,
  showMoveHighlights: true,
  showAttackHighlights: true,
  showBattleLog: true,
  showTurnBanner: true,
  terrainEffectsEnabled: true,
  terrainTileVideosEnabled: true,
  battlefieldSize: 8
};
