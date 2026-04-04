export type TeamName =
  | "Romans"
  | "Barbarians"
  | "Greeks"
  | "Gauls"
  | "Germanic"
  | "Carthage"
  | "Egypt"
  | "Thracians"
  | "Dacians"
  | "Parthians"
  | "Seleucids"
  | "Vikings";

export type GameMode = "single-player" | "campaign" | "multiplayer" | "custom-scenario" | "ai-versus";

/** AI quality for single-player opponents and AI vs AI spectator mode. */
export type AiDifficulty = "easy" | "normal" | "hard" | "very-hard" | "nightmare" | "impossible";
export type UnitsReferenceScope = TeamName | "All";
export type BattlefieldSize = 8 | 10 | 12 | 14 | 16 | 18 | 20;
export type GridOrientation = "north" | "east" | "south" | "west";
export type HoverScrollDirection = "up" | "down" | "left" | "right" | null;
export type TroopMechanicType = "closecombat" | "mounted" | "ranged" | "sieged";

/** Line weight for balance / UI: light … elite; `unique` is reserved for faction rulers (kings, pharaoh, jarl, etc.). */
export type UnitWeight = "light" | "medium" | "heavy" | "elite" | "unique";
export type TerrainType = "plain" | "forest" | "hill" | "river" | "desert";
export type TerrainPreset = "mixed" | Exclude<TerrainType, "river">;
export type TerrainGenerationSettings = Record<TerrainType, boolean>;

export type TerrainPoint = {
  x: number;
  y: number;
};

export type ScalarField = number[][];

export type GameOptions = {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  showMoveHighlights: boolean;
  showAttackHighlights: boolean;
  /** Red −HP (and emerald −blocked) popups on the defender when a hit resolves. */
  showFloatingDamageNumbers: boolean;
  /** Preview damage / blocked when your unit is selected and you hover a valid enemy target. */
  showAttackDamagePreview: boolean;
  showBattleLog: boolean;
  showTurnBanner: boolean;
  /** Corner minimap of all living units by faction during battle / setup. */
  showBattlefieldMinimap: boolean;
  terrainEffectsEnabled: boolean;
  /** When true (and motion is not reduced), terrain uses animated tiles ("Shader: On" in Graphics). */
  terrainTileVideosEnabled: boolean;
  /** Per-faction chess clocks in battle (budget scales with map size). Off = no time pressure. */
  timedPlayEnabled: boolean;
  battlefieldSize: BattlefieldSize;
};

export type BattleFeedbackKind =
  | "hit"
  | "meleeHit"
  | "meleeWindup"
  | "death"
  | "charge"
  | "morale"
  | "ranged"
  | "move"
  | "siegeFog";

export type ProjectileFeedback = {
  id: string;
  variant: "arrow" | "siege" | "charge";
  startX: number;
  startY: number;
  angle: number;
  distance: number;
};

export type TroopCatalogEntry = {
  role: string;
  name: string;
  Icon: string;
};

export type BattleUnit = {
  id: string;
  team: TeamName | string;
  name: string;
  role: string;
  hp: number;
  maxHp: number;
  attack: number;
  ammo: number;
  range: number;
  move: number;
  x: number;
  y: number;
  Icon: string;
  [key: string]: any;
};

export type StoredBattleUnit = Omit<BattleUnit, "Icon">;

export type SavedGameState = {
  currentLevel?: string;
  currentFormation?: string;
  units?: StoredBattleUnit[];
  selectedId?: string | null;
  turn?: string;
  log?: string[];
  round?: number;
  isSetupMode?: boolean;
  customUnits?: StoredBattleUnit[];
  selectedTeam?: TeamName;
  playerTeam?: TeamName;
  gameStarted?: boolean;
  mergeMode?: boolean;
  mergeCount?: number;
  selectedForMerge?: StoredBattleUnit | null;
  spyMode?: boolean;
  spyCount?: number;
  /** Unit ids that received a spy report this battle (full intel for the rest of the match). */
  spiedEnemyIds?: string[];
  /** @deprecated migrated away; ignored on load. */
  civActiveUsedByTeam?: Partial<Record<TeamName, boolean>>;
  /** Per faction: own-turn starts counted (legacy path if a civ omits `cooldownBattleRounds`). */
  civOwnTurnOrdinalForAbility?: Partial<Record<TeamName, number>>;
  /** Per faction: own-turn unlock ordinal for civ ability (legacy cooldown path). */
  civAbilityUnlockAtOwnOrdinal?: Partial<Record<TeamName, number>>;
  /** Per faction: battle round index when the civ ability becomes available (`round >=` this value). Matches `cooldownBattleRounds` in `CIV_ACTIVES`. */
  civAbilityUnlockAtBattleRound?: Partial<Record<TeamName, number>>;
  /** Hidden civ traps on the field (Gauls / Dacians / Thracians). */
  civBattleTraps?: Array<{
    id: string;
    x: number;
    y: number;
    ownerTeam: TeamName;
    damage: number;
    expiresAtRound: number;
    attackReductionPercent?: number;
    armorReductionPercent?: number;
  }>;
  gameMode?: GameMode | null;
  /** Hot-seat / AI vs AI roster: 2–12 unique factions. */
  multiplayerTeams?: TeamName[];
  aiDifficulty?: AiDifficulty;
  /** Custom scenario: watch only — every faction is AI-controlled. */
  customScenarioSpectator?: boolean;
  gridOrientation?: GridOrientation;
  terrainPreset?: TerrainPreset;
  terrainGenerationSettings?: Partial<TerrainGenerationSettings>;
  battlefieldTerrain?: TerrainType[][];
  gameOptions?: Partial<GameOptions>;
  /** Remaining ms per team (committed at end of each turn); only when timed play is on. */
  timedPlayCommittedMs?: Record<string, number>;
  /** Faction that ran out of time — ends the battle. */
  timedPlayLoserTeam?: string | null;
};
