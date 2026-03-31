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

export type GameMode = "single-player" | "multiplayer" | "custom-scenario";
export type UnitsReferenceScope = TeamName | "All";
export type BattlefieldSize = 8 | 10 | 12 | 14 | 16 | 18 | 20;
export type GridOrientation = "north" | "east" | "south" | "west";
export type HoverScrollDirection = "up" | "down" | "left" | "right" | null;
export type TroopMechanicType = "closecombat" | "mounted" | "ranged" | "sieged";

/** Line weight for balance / UI: light (fast, low HP) … elite (rare, powerful). */
export type UnitWeight = "light" | "medium" | "heavy" | "elite";
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
  gameMode?: GameMode | null;
  multiplayerTeams?: [TeamName, TeamName];
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
