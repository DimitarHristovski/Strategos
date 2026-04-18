import { levels } from "../Units/InitialUnits";
import type {
  BattlefieldSize,
  GameMode,
  GameOptions,
  TeamName,
  TerrainGenerationSettings,
  TerrainPoint,
  TerrainPreset,
  TerrainType
} from "./types";

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

/** Human-readable matchup for every skirmish map (base + auto-generated missing faction pairs). */
export const LEVEL_MATCHUP_LABELS: Record<keyof typeof levels, string> = Object.fromEntries(
  (Object.keys(levels) as (keyof typeof levels)[]).map((k) => {
    const teams = Array.from(new Set(levels[k].map((u: { team: string }) => u.team)));
    const label = teams.length >= 2 ? `${teams[0]} vs ${teams[1]}` : String(k);
    return [k, label];
  })
) as Record<keyof typeof levels, string>;

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

export const GAME_STATE_STORAGE_KEY = "strategos-game-state";
/** Previous key; loaded once and migrated so existing players keep saves. */
export const LEGACY_GAME_STATE_STORAGE_KEY = "battlecry-game-state";
/** Injected at build from package.json (see vite.config `define`). */
export const GAME_VERSION = __APP_VERSION__;
export const GAME_BUILD_LABEL = "Battle Feedback Pass";
export const BATTLEFIELD_SIZE_OPTIONS: BattlefieldSize[] = [8, 10, 12, 14, 16, 18, 20];

/** Per-turn move clock when timed play is on (with chess clocks); turn auto-passes when this elapses. */
export const TURN_ACTION_BUDGET_MS = 15_000;

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  musicEnabled: true,
  sfxEnabled: true,
  showMoveHighlights: true,
  showAttackHighlights: true,
  showFloatingDamageNumbers: true,
  showAttackDamagePreview: true,
  showBattleLog: true,
  showTurnBanner: true,
  showBattlefieldMinimap: true,
  terrainEffectsEnabled: true,
  terrainTileVideosEnabled: true,
  timedPlayEnabled: false,
  battlefieldSize: 8
};

/** Persists music/SFX toggles so they survive refresh even if main game save is missing or stale. */
export const GAME_AUDIO_PREFS_STORAGE_KEY = "strategos-audio-prefs";
export const LEGACY_GAME_AUDIO_PREFS_STORAGE_KEY = "battlecry-audio-prefs";

export type StoredAudioPrefs = Pick<GameOptions, "musicEnabled" | "sfxEnabled">;

export function readGameAudioPrefs(): StoredAudioPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    let raw = window.localStorage.getItem(GAME_AUDIO_PREFS_STORAGE_KEY);
    if (!raw) {
      raw = window.localStorage.getItem(LEGACY_GAME_AUDIO_PREFS_STORAGE_KEY);
      if (raw) {
        try {
          window.localStorage.setItem(GAME_AUDIO_PREFS_STORAGE_KEY, raw);
          window.localStorage.removeItem(LEGACY_GAME_AUDIO_PREFS_STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
    }
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<StoredAudioPrefs>;
    return {
      musicEnabled: typeof p.musicEnabled === "boolean" ? p.musicEnabled : DEFAULT_GAME_OPTIONS.musicEnabled,
      sfxEnabled: typeof p.sfxEnabled === "boolean" ? p.sfxEnabled : DEFAULT_GAME_OPTIONS.sfxEnabled
    };
  } catch {
    return null;
  }
}

export function writeGameAudioPrefs(prefs: StoredAudioPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GAME_AUDIO_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    window.localStorage.removeItem(LEGACY_GAME_AUDIO_PREFS_STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

/** Full options + graphics defaults (terrain mode / mixed pool) for cold starts and explicit Save. */
export const GAME_USER_PREFS_STORAGE_KEY = "strategos-user-prefs";

export type StoredUserPrefs = {
  gameOptions: GameOptions;
  terrainPreset: TerrainPreset;
  terrainGenerationSettings: TerrainGenerationSettings;
};

export function readUserPrefs(): Partial<StoredUserPrefs> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GAME_USER_PREFS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<StoredUserPrefs>;
  } catch {
    return null;
  }
}

export function writeUserPrefs(prefs: StoredUserPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GAME_USER_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota / private mode */
  }
}

export type StartScreenState =
  | "menu"
  | "play"
  | "options"
  | "about"
  | "tutorial"
  | "campaign"
  | "single-player-setup";

/** About screen carousel panel count (must match slides in `CodeConq` About UI). */
export const ABOUT_SCREEN_SLIDE_COUNT = 5;

/** Sync read of mode + pre-game UI from the same save blob (avoids a main-menu flash on refresh). */
export function readPersistedSessionNavigation(): {
  gameMode: GameMode | null;
  startScreen: StartScreenState;
  aboutSlideIndex: number;
} {
  const defaults = {
    gameMode: null as GameMode | null,
    startScreen: "menu" as StartScreenState,
    aboutSlideIndex: 0
  };
  if (typeof window === "undefined") return defaults;
  try {
    let raw = window.localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (!raw) raw = window.localStorage.getItem(LEGACY_GAME_STATE_STORAGE_KEY);
    if (!raw) return defaults;
    const s = JSON.parse(raw) as Record<string, unknown>;
    const gm = s.gameMode;
    const gameMode =
      gm === "single-player" ||
      gm === "campaign" ||
      gm === "multiplayer" ||
      gm === "custom-scenario" ||
      gm === "ai-versus"
        ? gm
        : null;
    const ss = s.startScreen;
    const startScreen: StartScreenState =
      ss === "options" ||
      ss === "about" ||
      ss === "menu" ||
      ss === "play" ||
      ss === "tutorial" ||
      ss === "campaign" ||
      ss === "single-player-setup"
        ? ss
        : "menu";
    const idx = s.aboutSlideIndex;
    const aboutSlideIndex =
      typeof idx === "number" && Number.isFinite(idx) && idx >= 0 && idx < ABOUT_SCREEN_SLIDE_COUNT
        ? Math.floor(idx)
        : 0;
    return { gameMode, startScreen, aboutSlideIndex };
  } catch {
    return defaults;
  }
}
