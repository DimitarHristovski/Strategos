// CodeConq - Grid Strategy Game with Highlights and Expanded Features
// Now includes: Health Bars, Kill Counters, Special Ability Tooltips, and Custom Drag & Drop Setup

import { createElement, useState, useEffect, useRef } from "react";
import { levels } from "./Units/InitialUnits";
import { generateTroopStats } from "./Units/troopStats";

// Available troop types for custom setup - using existing definitions
const AVAILABLE_TROOPS = {
  Romans: [
    { role: "Roman King", name: "Roman King", Icon: "👑" },
    { role: "Legionary", name: "Legionary", Icon: "⚔️" },
    { role: "Centurion", name: "Centurion", Icon: "⚔️" },
    { role: "Praetorian", name: "Praetorian", Icon: "⚔️" },
    { role: "Auxiliary", name: "Auxiliary", Icon: "⚔️" },
    { role: "Triarii", name: "Triarii", Icon: "⚔️" },
    { role: "Hastati", name: "Hastati", Icon: "⚔️" },
    { role: "Principes", name: "Principes", Icon: "⚔️" },
    { role: "Cavalry", name: "Cavalry", Icon: "🐎" },
    { role: "Equites", name: "Equites", Icon: "🐎" },
    { role: "Archer", name: "Archer", Icon: "🏹" },
    { role: "Velites", name: "Velites", Icon: "🏹" },
    { role: "Ballista", name: "Ballista", Icon: "⚙️" },
    { role: "Scorpion", name: "Scorpion", Icon: "⚙️" },
    { role: "Onager", name: "Onager", Icon: "⚙️" }
  ],
  Barbarians: [
    { role: "Barbarian Chief", name: "Barbarian Chief", Icon: "👑" },
    { role: "Barbarian Warrior", name: "Barbarian Warrior", Icon: "⚔️" },
    { role: "Barbarian Berserker", name: "Barbarian Berserker", Icon: "⚔️" },
    { role: "Barbarian Axeman", name: "Barbarian Axeman", Icon: "⚔️" },
    { role: "Barbarian Spearman", name: "Barbarian Spearman", Icon: "⚔️" },
    { role: "Barbarian Raider", name: "Barbarian Raider", Icon: "⚔️" },
    { role: "Barbarian Warlord", name: "Barbarian Warlord", Icon: "⚔️" },
    { role: "Falxman", name: "Falxman", Icon: "⚔️" },
    { role: "Chosen Spearman", name: "Chosen Spearman", Icon: "⚔️" },
    { role: "Oathsworn", name: "Oathsworn", Icon: "⚔️" },
    { role: "Barbarian Scout", name: "Barbarian Scout", Icon: "🐎" },
    { role: "Barbarian Noble Rider", name: "Barbarian Noble Rider", Icon: "🐎" },
    { role: "Barbarian Archer", name: "Barbarian Archer", Icon: "🏹" },
    { role: "Barbarian Shaman", name: "Barbarian Shaman", Icon: "🏹" },
    { role: "Barbarian Slinger", name: "Barbarian Slinger", Icon: "🏹" }
  ],
  Greeks: [
    { role: "Macedonian King", name: "Macedonian King", Icon: "👑" },
    { role: "Hoplite", name: "Hoplite", Icon: "⚔️" },
    { role: "Phalangite", name: "Phalangite", Icon: "⚔️" },
    { role: "Hypaspist", name: "Hypaspist", Icon: "⚔️" },
    { role: "Thureophoroi", name: "Thureophoroi", Icon: "⚔️" },
    { role: "Agema", name: "Agema", Icon: "⚔️" },
    { role: "Companion Cavalry", name: "Companion Cavalry", Icon: "🐎" },
    { role: "Thessalian Cavalry", name: "Thessalian Cavalry", Icon: "🐎" },
    { role: "Xystophoroi", name: "Xystophoroi", Icon: "🐎" },
    { role: "Peltast", name: "Peltast", Icon: "🏹" },
    { role: "Cretan Archer", name: "Cretan Archer", Icon: "🏹" },
    { role: "Rhodian Slinger", name: "Rhodian Slinger", Icon: "🏹" },
    { role: "Psiloi", name: "Psiloi", Icon: "🏹" },
    { role: "Greek Catapult", name: "Greek Catapult", Icon: "⚙️" },
    { role: "Polybolos", name: "Polybolos", Icon: "⚙️" }
  ],
  Celts: [
    { role: "Celtic King", name: "Celtic King", Icon: "👑" },
    { role: "Celtic Warrior", name: "Celtic Warrior", Icon: "⚔️" },
    { role: "Celtic Berserker", name: "Celtic Berserker", Icon: "⚔️" },
    { role: "Celtic Spearman", name: "Celtic Spearman", Icon: "⚔️" },
    { role: "Celtic Oathsworn", name: "Celtic Oathsworn", Icon: "⚔️" },
    { role: "Gaesatae", name: "Gaesatae", Icon: "⚔️" },
    { role: "Fianna", name: "Fianna", Icon: "⚔️" },
    { role: "Noble Spearman", name: "Noble Spearman", Icon: "⚔️" },
    { role: "Celtic Cavalry", name: "Celtic Cavalry", Icon: "🐎" },
    { role: "Celtic Chariot", name: "Celtic Chariot", Icon: "🐎" },
    { role: "Celtic Noble Horseman", name: "Celtic Noble Horseman", Icon: "🐎" },
    { role: "Chariot Noble", name: "Chariot Noble", Icon: "🐎" },
    { role: "Celtic Archer", name: "Celtic Archer", Icon: "🏹" },
    { role: "Celtic Skirmisher", name: "Celtic Skirmisher", Icon: "🏹" },
    { role: "Celtic Slinger", name: "Celtic Slinger", Icon: "🏹" },
  ],
  Germanic: [
    { role: "Germanic King", name: "Germanic King", Icon: "👑" },
    { role: "Germanic Warrior", name: "Germanic Warrior", Icon: "⚔️" },
    { role: "Germanic Spearman", name: "Germanic Spearman", Icon: "⚔️" },
    { role: "Germanic Berserker", name: "Germanic Berserker", Icon: "⚔️" },
    { role: "Germanic Raider", name: "Germanic Raider", Icon: "⚔️" },
    { role: "Chosen Axeman", name: "Chosen Axeman", Icon: "⚔️" },
    { role: "Cherusci Spearman", name: "Cherusci Spearman", Icon: "⚔️" },
    { role: "Marcomanni Raider", name: "Marcomanni Raider", Icon: "⚔️" },
    { role: "Hearthguard", name: "Hearthguard", Icon: "⚔️" },
    { role: "Germanic Wolf Rider", name: "Germanic Wolf Rider", Icon: "🐎" },
    { role: "Suebi Rider", name: "Suebi Rider", Icon: "🐎" },
    { role: "Gothic Lancer", name: "Gothic Lancer", Icon: "🐎" },
    { role: "Germanic Archer", name: "Germanic Archer", Icon: "🏹" },
    { role: "Tribal Slinger", name: "Tribal Slinger", Icon: "🏹" },
    { role: "Lombard Archer", name: "Lombard Archer", Icon: "🏹" },
  ],
  Carthage: [
    { role: "Carthaginian General", name: "Carthaginian General", Icon: "👑" },
    { role: "Libyan Infantry", name: "Libyan Infantry", Icon: "⚔️" },
    { role: "Sacred Band", name: "Sacred Band", Icon: "⚔️" },
    { role: "Liby-Phoenician Infantry", name: "Liby-Phoenician Infantry", Icon: "⚔️" },
    { role: "Iberian Swordsman", name: "Iberian Swordsman", Icon: "⚔️" },
    { role: "African Pikeman", name: "African Pikeman", Icon: "⚔️" },
    { role: "Punic Spearman", name: "Punic Spearman", Icon: "⚔️" },
    { role: "Campanian Mercenary", name: "Campanian Mercenary", Icon: "⚔️" },
    { role: "Phoenician Militia", name: "Phoenician Militia", Icon: "⚔️" },
    { role: "Numidian Cavalry", name: "Numidian Cavalry", Icon: "🐎" },
    { role: "War Elephant", name: "War Elephant", Icon: "🐘" },
    { role: "Balearic Slinger", name: "Balearic Slinger", Icon: "🏹" },
    { role: "Carthaginian Archer", name: "Carthaginian Archer", Icon: "🏹" },
    { role: "Numidian Skirmisher", name: "Numidian Skirmisher", Icon: "🏹" },
    { role: "Elephant Archer", name: "Elephant Archer", Icon: "🐘🏹" }
  ],
  Vikings: [
    { role: "Jarl", name: "Jarl", Icon: "👑" },
    { role: "Viking Raider", name: "Viking Raider", Icon: "⚔️" },
    { role: "Berserker", name: "Berserker", Icon: "⚔️" },
    { role: "Shieldmaiden", name: "Shieldmaiden", Icon: "⚔️" },
    { role: "Huscarl", name: "Huscarl", Icon: "⚔️" },
    { role: "Bondi Spearman", name: "Bondi Spearman", Icon: "⚔️" },
    { role: "Hirdman", name: "Hirdman", Icon: "⚔️" },
    { role: "Ulfhednar", name: "Ulfhednar", Icon: "⚔️" },
    { role: "Varangian Guard", name: "Varangian Guard", Icon: "⚔️" },
    { role: "Jomsviking", name: "Jomsviking", Icon: "⚔️" },
    { role: "Viking Spearman", name: "Viking Spearman", Icon: "⚔️" },
    { role: "Karl Warrior", name: "Karl Warrior", Icon: "⚔️" },
    { role: "Scout", name: "Scout", Icon: "🐎" },
    { role: "Viking Archer", name: "Viking Archer", Icon: "🏹" },
    { role: "Viking Skirmisher", name: "Viking Skirmisher", Icon: "🏹" }
  ],
  Teutons: [
    { role: "King", name: "King", Icon: "👑" },
    { role: "Teutonic Marshal", name: "Teutonic Marshal", Icon: "👑" },
    { role: "Man-at-Arms", name: "Man-at-Arms", Icon: "⚔️" },
    { role: "Spearman", name: "Spearman", Icon: "⚔️" },
    { role: "Sergeant", name: "Sergeant", Icon: "⚔️" },
    { role: "Halberdier", name: "Halberdier", Icon: "⚔️" },
    { role: "Foot Sergeant", name: "Foot Sergeant", Icon: "⚔️" },
    { role: "Knight", name: "Knight", Icon: "🐎" },
    { role: "Ritterbruder", name: "Ritterbruder", Icon: "🐎" },
    { role: "Turcopole", name: "Turcopole", Icon: "🐎" },
    { role: "Longbowman", name: "Longbowman", Icon: "🏹" },
    { role: "Crossbowman", name: "Crossbowman", Icon: "🏹" },
    { role: "Pavise Crossbowman", name: "Pavise Crossbowman", Icon: "🏹" },
    { role: "Trebuchet", name: "Trebuchet", Icon: "⚙️" },
    { role: "Bombard", name: "Bombard", Icon: "⚙️" }
  ]
};

// Icon mapping
const ICON_MAP = {
  GiSwordman: "⚔️",
  GiArcher: "🏹",
  GiCavalry: "🐎",
  GiCrossedSwords: "⚔️",
  GiHelmet: "🪖",
  GiBo: "🏹",
  GiAce: "🪓",
  FaCrown: "👑"
};

const LEVEL_MATCHUP_LABELS: Record<keyof typeof levels, string> = {
  Level1: "Romans vs Barbarians",
  Level2: "Greeks vs Celts",
  Level3: "Carthage vs Vikings",
  Level4: "Germanic vs Teutons",
  Level5: "Romans vs Carthage",
  Level6: "Greeks vs Germanic",
  Level7: "Celts vs Vikings",
  Level8: "Barbarians vs Teutons"
};

const BACKGROUND_MUSIC_SRC = "/Crown%20of%20Ashes.mp3";
const ALL_TEAMS = ["Romans", "Barbarians", "Greeks", "Celts", "Germanic", "Carthage", "Vikings", "Teutons"] as const;
const GRID_ORIENTATIONS = ["north", "east", "south", "west"] as const;
const TEAM_SELECT_GROUPS = [
  { label: "Ancient Powers", teams: ["Romans", "Greeks", "Carthage"] as TeamName[] },
  { label: "Tribal Realms", teams: ["Barbarians", "Celts", "Germanic", "Vikings"] as TeamName[] },
  { label: "Medieval Orders", teams: ["Teutons"] as TeamName[] }
] as const;

type GameMode = "single-player" | "multiplayer" | "custom-scenario";
type TeamName = "Romans" | "Barbarians" | "Greeks" | "Celts" | "Germanic" | "Carthage" | "Vikings" | "Teutons";
type BattlefieldSize = 8 | 10 | 12 | 14 | 16 | 18 | 20;
type GridOrientation = typeof GRID_ORIENTATIONS[number];
type HoverScrollDirection = "up" | "down" | "left" | "right" | null;
type TroopMechanicType = "closecombat" | "mounted" | "ranged" | "sieged";
type TerrainType = "plain" | "forest" | "hill" | "river" | "desert";
type TerrainPreset = "mixed" | Exclude<TerrainType, "river">;
type TerrainGenerationSettings = Record<TerrainType, boolean>;
type TerrainPoint = { x: number; y: number };
type ScalarField = number[][];
type GameOptions = {
  musicEnabled: boolean;
  showMoveHighlights: boolean;
  showAttackHighlights: boolean;
  showBattleLog: boolean;
  showTurnBanner: boolean;
  showUnitPanel: boolean;
  terrainEffectsEnabled: boolean;
  battlefieldSize: BattlefieldSize;
};

const renderTeamSelectOptions = (
  allowedTeams: readonly TeamName[],
  getOptionLabel?: (team: TeamName) => string
) =>
  TEAM_SELECT_GROUPS.map((group) => {
    const groupedTeams = group.teams.filter((team) => allowedTeams.includes(team));
    if (groupedTeams.length === 0) return null;

    return (
      <optgroup key={group.label} label={group.label}>
        {groupedTeams.map((team) => (
          <option key={team} value={team}>
            {getOptionLabel ? getOptionLabel(team) : team}
          </option>
        ))}
      </optgroup>
    );
  });

const getLevelTeams = (levelKey: keyof typeof levels): TeamName[] =>
  Array.from(new Set(levels[levelKey].map((unit: any) => unit.team))) as TeamName[];

const getValidLevelPlayerTeam = (levelKey: keyof typeof levels, preferredTeam: TeamName): TeamName => {
  const levelTeams = getLevelTeams(levelKey);
  return levelTeams.includes(preferredTeam) ? preferredTeam : levelTeams[0] ?? "Romans";
};

const getAliveTeams = (battleUnits: any[]): TeamName[] =>
  ALL_TEAMS.filter((team) => battleUnits.some((unit: any) => unit.team === team && unit.hp > 0)) as TeamName[];

const TERRAIN_ASSETS: Record<TerrainType, string> = {
  plain: "/tiles/plain.png",
  forest: "/tiles/forrest.png",
  hill: "/tiles/hill.png",
  river: "/tiles/river.png",
  desert: "/tiles/dessert.png"
};

const TERRAIN_LABELS: Record<TerrainType, string> = {
  plain: "Plain",
  forest: "Forest",
  hill: "Hill",
  river: "River",
  desert: "Desert"
};

const TERRAIN_TYPES: TerrainType[] = ["plain", "forest", "hill", "river", "desert"];
const DEFAULT_TERRAIN_GENERATION_SETTINGS: TerrainGenerationSettings = {
  plain: true,
  forest: true,
  hill: true,
  river: true,
  desert: true
};

const CARDINAL_DIRECTIONS: TerrainPoint[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 }
];
const ALL_DIRECTIONS: TerrainPoint[] = [
  ...CARDINAL_DIRECTIONS,
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 }
];

const getEnabledTerrainTypes = (terrainSettings: TerrainGenerationSettings): TerrainType[] => {
  const enabledTypes = TERRAIN_TYPES.filter((terrainType) => terrainSettings[terrainType]);
  return enabledTypes.length > 0 ? enabledTypes : ["plain"];
};

const getMixedTerrainTypeLimit = (battlefieldSize: BattlefieldSize) => {
  if (battlefieldSize <= 10) return 2;
  if (battlefieldSize <= 16) return 3;
  return 4;
};

const getMixedTerrainTypes = (
  terrainSettings: TerrainGenerationSettings,
  battlefieldSize: BattlefieldSize
): TerrainType[] => {
  const enabledTypes = getEnabledTerrainTypes(terrainSettings);

  // Keep desert isolated so sand never appears blended into greener mixed maps.
  const desertFilteredTypes =
    enabledTypes.includes("desert") && enabledTypes.length > 1
      ? enabledTypes.filter((terrainType) => terrainType !== "desert")
      : enabledTypes;

  const terrainLimit = getMixedTerrainTypeLimit(battlefieldSize);
  if (desertFilteredTypes.length <= terrainLimit) {
    return desertFilteredTypes;
  }

  const priorityOrder: TerrainType[] = ["plain", "forest", "hill", "river", "desert"];
  return priorityOrder.filter((terrainType) => desertFilteredTypes.includes(terrainType)).slice(0, terrainLimit);
};

const createTerrainCounts = (): Record<TerrainType, number> => ({
  plain: 0,
  forest: 0,
  hill: 0,
  river: 0,
  desert: 0
});

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const createScalarField = (size: number, valueFactory: (x: number, y: number) => number): ScalarField =>
  Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => valueFactory(x, y)));

const createTerrainField = (size: number, valueFactory: (x: number, y: number) => TerrainType): TerrainType[][] =>
  Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => valueFactory(x, y)));

const normalizeScalarField = (field: ScalarField): ScalarField => {
  let minimum = Infinity;
  let maximum = -Infinity;

  field.forEach((row) => {
    row.forEach((value) => {
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    });
  });

  if (minimum === Infinity || maximum === -Infinity || Math.abs(maximum - minimum) < 0.0001) {
    return field.map((row) => row.map(() => 0.5));
  }

  return field.map((row) => row.map((value) => (value - minimum) / (maximum - minimum)));
};

const blurScalarField = (field: ScalarField, passes = 1): ScalarField => {
  let current = field.map((row) => [...row]);

  for (let pass = 0; pass < passes; pass += 1) {
    current = current.map((row, y) =>
      row.map((_, x) => {
        let total = 0;
        let weight = 0;

        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            const sampleX = x + offsetX;
            const sampleY = y + offsetY;
            if (sampleX < 0 || sampleY < 0 || sampleX >= row.length || sampleY >= current.length) continue;

            const sampleWeight = offsetX === 0 && offsetY === 0 ? 4 : offsetX === 0 || offsetY === 0 ? 2 : 1;
            total += current[sampleY][sampleX] * sampleWeight;
            weight += sampleWeight;
          }
        }

        return weight > 0 ? total / weight : current[y][x];
      })
    );
  }

  return current;
};

const getNeighbors = (x: number, y: number, size: number, includeDiagonals = true): TerrainPoint[] => {
  const offsets = includeDiagonals ? ALL_DIRECTIONS : CARDINAL_DIRECTIONS;
  const neighbors: TerrainPoint[] = [];

  offsets.forEach((offset) => {
    const nextX = x + offset.x;
    const nextY = y + offset.y;
    if (nextX < 0 || nextY < 0 || nextX >= size || nextY >= size) return;
    neighbors.push({ x: nextX, y: nextY });
  });

  return neighbors;
};

const getManhattanDistance = (left: TerrainPoint, right: TerrainPoint) =>
  Math.abs(left.x - right.x) + Math.abs(left.y - right.y);

const chooseEnabledTerrain = (terrainOptions: TerrainType[], enabledTerrainTypes: TerrainType[]): TerrainType => {
  for (const terrainType of terrainOptions) {
    if (enabledTerrainTypes.includes(terrainType)) return terrainType;
  }

  return enabledTerrainTypes[0] ?? "plain";
};

const generateElevationField = (battlefieldSize: BattlefieldSize): ScalarField => {
  const size = battlefieldSize;
  const broadNoise = blurScalarField(createScalarField(size, () => Math.random()), 4 + Math.floor(size / 6));
  const detailNoise = blurScalarField(createScalarField(size, () => Math.random()), 2 + Math.floor(size / 10));
  const ridgeNoise = blurScalarField(createScalarField(size, () => Math.random()), 3);
  const ridgeIsVertical = Math.random() < 0.5;
  const ridgeCenter = 0.2 + Math.random() * 0.6;
  const ridgeWidth = 0.16 + Math.random() * 0.12;

  const elevation = createScalarField(size, (x, y) => {
    const normalizedX = size <= 1 ? 0 : x / (size - 1);
    const normalizedY = size <= 1 ? 0 : y / (size - 1);
    const axis = ridgeIsVertical ? normalizedX : normalizedY;
    const ridgeBand = clamp01(1 - Math.abs(axis - ridgeCenter) / ridgeWidth);
    const edgeDistance = Math.min(normalizedX, normalizedY, 1 - normalizedX, 1 - normalizedY);
    const inlandLift = clamp01(edgeDistance / 0.5);

    return (
      broadNoise[y][x] * 0.46 +
      detailNoise[y][x] * 0.18 +
      ridgeNoise[y][x] * ridgeBand * 0.26 +
      inlandLift * 0.1
    );
  });

  return normalizeScalarField(elevation);
};

const generateMoistureField = (battlefieldSize: BattlefieldSize, elevationField: ScalarField): ScalarField => {
  const size = battlefieldSize;
  const broadNoise = blurScalarField(createScalarField(size, () => Math.random()), 4 + Math.floor(size / 6));
  const detailNoise = blurScalarField(createScalarField(size, () => Math.random()), 2);
  const directionX = Math.random() * 2 - 1 || 0.65;
  const directionY = Math.random() * 2 - 1 || -0.45;

  const directionalField = normalizeScalarField(
    createScalarField(size, (x, y) => {
      const normalizedX = size <= 1 ? 0 : x / (size - 1);
      const normalizedY = size <= 1 ? 0 : y / (size - 1);
      return normalizedX * directionX + normalizedY * directionY;
    })
  );

  const moisture = createScalarField(size, (x, y) => {
    const elevationPenalty = elevationField[y][x] * 0.18;
    return broadNoise[y][x] * 0.5 + detailNoise[y][x] * 0.2 + directionalField[y][x] * 0.22 + (1 - elevationPenalty) * 0.08;
  });

  return normalizeScalarField(moisture);
};

const pickRiverSources = (elevationField: ScalarField, battlefieldSize: BattlefieldSize): TerrainPoint[] => {
  const size = battlefieldSize;
  const candidates: Array<TerrainPoint & { score: number }> = [];

  for (let y = 1; y < size - 1; y += 1) {
    for (let x = 1; x < size - 1; x += 1) {
      const elevation = elevationField[y][x];
      if (elevation < 0.6) continue;
      candidates.push({ x, y, score: elevation + Math.random() * 0.15 });
    }
  }

  candidates.sort((left, right) => right.score - left.score);

  const riverCount = Math.max(1, Math.min(3, Math.floor(size / 7)));
  const minimumSpacing = Math.max(3, Math.floor(size / 3));
  const sources: TerrainPoint[] = [];

  candidates.forEach(({ x, y }) => {
    if (sources.length >= riverCount) return;
    const point = { x, y };
    const overlapsExistingSource = sources.some((source) => getManhattanDistance(source, point) < minimumSpacing);
    if (!overlapsExistingSource) sources.push(point);
  });

  return sources;
};

const pickRiverExit = (source: TerrainPoint, battlefieldSize: BattlefieldSize): TerrainPoint => {
  const size = battlefieldSize;
  const exitOptions = [
    { x: 0, y: source.y, weight: Math.pow(Math.max(1, source.x), 1.1) },
    { x: size - 1, y: source.y, weight: Math.pow(Math.max(1, size - 1 - source.x), 1.1) },
    { x: source.x, y: 0, weight: Math.pow(Math.max(1, source.y), 1.1) },
    { x: source.x, y: size - 1, weight: Math.pow(Math.max(1, size - 1 - source.y), 1.1) }
  ];
  const totalWeight = exitOptions.reduce((sum, option) => sum + option.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const option of exitOptions) {
    roll -= option.weight;
    if (roll <= 0) return { x: option.x, y: option.y };
  }

  return { x: 0, y: source.y };
};

const traceRiverPath = (
  source: TerrainPoint,
  target: TerrainPoint,
  elevationField: ScalarField,
  moistureField: ScalarField,
  existingRiverField: boolean[][]
): TerrainPoint[] => {
  const size = elevationField.length;
  const minimumLength = Math.max(4, Math.floor(size * 0.45));
  const path: TerrainPoint[] = [];
  const visited = new Set<string>();
  let current = source;
  let previousDirection: TerrainPoint | null = null;

  for (let step = 0; step < size * size; step += 1) {
    const currentKey = `${current.x},${current.y}`;
    if (visited.has(currentKey)) break;

    visited.add(currentKey);
    path.push(current);

    const reachedExistingRiver = existingRiverField[current.y][current.x];
    const reachedEdge = current.x === 0 || current.y === 0 || current.x === size - 1 || current.y === size - 1;

    if ((reachedExistingRiver && path.length >= Math.max(3, Math.floor(minimumLength * 0.5))) || (reachedEdge && path.length >= minimumLength)) {
      return path;
    }

    let bestNextPoint: TerrainPoint = current;
    let foundNextPoint = false;
    let bestScore = Infinity;

    for (const neighbor of getNeighbors(current.x, current.y, size, false)) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (visited.has(neighborKey)) continue;

      const direction = { x: neighbor.x - current.x, y: neighbor.y - current.y };
      const uphillPenalty = Math.max(0, elevationField[neighbor.y][neighbor.x] - elevationField[current.y][current.x]) * 3.2;
      const targetDistance = getManhattanDistance(neighbor, target) / Math.max(1, size - 1);
      const turnPenalty =
        previousDirection && (previousDirection.x !== direction.x || previousDirection.y !== direction.y) ? 0.12 : 0;
      const mergeBonus = existingRiverField[neighbor.y][neighbor.x] ? -0.55 : 0;
      const edgeBonus =
        neighbor.x === 0 || neighbor.y === 0 || neighbor.x === size - 1 || neighbor.y === size - 1 ? -0.18 : 0;
      const score =
        elevationField[neighbor.y][neighbor.x] * 0.62 +
        targetDistance * 0.26 +
        uphillPenalty +
        turnPenalty +
        mergeBonus +
        edgeBonus -
        moistureField[neighbor.y][neighbor.x] * 0.08 +
        Math.random() * 0.04;

      if (score < bestScore) {
        bestScore = score;
        bestNextPoint = neighbor;
        foundNextPoint = true;
      }
    }

    if (!foundNextPoint) break;

    previousDirection = { x: bestNextPoint.x - current.x, y: bestNextPoint.y - current.y };
    current = bestNextPoint;
  }

  return path.length >= minimumLength ? path : [];
};

const generateRiverField = (
  battlefieldSize: BattlefieldSize,
  elevationField: ScalarField,
  moistureField: ScalarField
): boolean[][] => {
  const size = battlefieldSize;
  const riverField = Array.from({ length: size }, () => Array.from({ length: size }, () => false));

  pickRiverSources(elevationField, battlefieldSize).forEach((source) => {
    const riverPath = traceRiverPath(source, pickRiverExit(source, battlefieldSize), elevationField, moistureField, riverField);
    riverPath.forEach((point) => {
      riverField[point.y][point.x] = true;
    });
  });

  return riverField;
};

const buildRiverDistanceField = (riverField: boolean[][]): ScalarField => {
  const size = riverField.length;
  const distances = Array.from({ length: size }, () => Array.from({ length: size }, () => Number.POSITIVE_INFINITY));
  const queue: TerrainPoint[] = [];
  let pointer = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!riverField[y][x]) continue;
      distances[y][x] = 0;
      queue.push({ x, y });
    }
  }

  while (pointer < queue.length) {
    const current = queue[pointer];
    pointer += 1;

    getNeighbors(current.x, current.y, size, false).forEach((neighbor) => {
      const nextDistance = distances[current.y][current.x] + 1;
      if (nextDistance >= distances[neighbor.y][neighbor.x]) return;
      distances[neighbor.y][neighbor.x] = nextDistance;
      queue.push(neighbor);
    });
  }

  return distances;
};

const hydrateMoistureField = (
  moistureField: ScalarField,
  elevationField: ScalarField,
  riverDistanceField: ScalarField
): ScalarField => {
  const size = moistureField.length;

  const hydratedField = createScalarField(size, (x, y) => {
    const riverBonus = Math.max(0, 0.28 - riverDistanceField[y][x] * 0.08);
    const hillDryness = Math.max(0, elevationField[y][x] - 0.72) * 0.18;
    return clamp01(moistureField[y][x] + riverBonus - hillDryness);
  });

  return normalizeScalarField(hydratedField);
};

const chooseBaseTerrain = (
  elevation: number,
  moisture: number,
  nearRiver: boolean,
  enabledTerrainTypes: TerrainType[]
): TerrainType => {
  if (nearRiver) return chooseEnabledTerrain(["river", "plain", "forest", "hill", "desert"], enabledTerrainTypes);

  if (elevation >= 0.72) {
    return chooseEnabledTerrain(["hill", moisture >= 0.58 ? "forest" : "plain", "desert"], enabledTerrainTypes);
  }

  if (moisture <= 0.3) {
    return chooseEnabledTerrain(["desert", "plain", "hill", "forest"], enabledTerrainTypes);
  }

  if (moisture >= 0.62) {
    return chooseEnabledTerrain(["forest", "plain", "hill", "desert"], enabledTerrainTypes);
  }

  return chooseEnabledTerrain(["plain", "forest", "hill", "desert"], enabledTerrainTypes);
};

const getNeighborTerrainCounts = (
  terrainMap: TerrainType[][],
  x: number,
  y: number,
  includeDiagonals = true
): Record<TerrainType, number> => {
  const counts = createTerrainCounts();
  getNeighbors(x, y, terrainMap.length, includeDiagonals).forEach((neighbor) => {
    counts[terrainMap[neighbor.y][neighbor.x]] += 1;
  });
  return counts;
};

const getDominantNeighborTerrain = (
  terrainMap: TerrainType[][],
  x: number,
  y: number,
  enabledTerrainTypes: TerrainType[],
  excludedTerrainTypes: TerrainType[] = []
): TerrainType => {
  const counts = getNeighborTerrainCounts(terrainMap, x, y);
  const ranking: TerrainType[] = ["plain", "forest", "hill", "desert", "river"];
  let bestTerrain = terrainMap[y][x];
  let bestCount = -1;

  ranking.forEach((terrainType) => {
    if (!enabledTerrainTypes.includes(terrainType) || excludedTerrainTypes.includes(terrainType)) return;
    if (counts[terrainType] > bestCount) {
      bestTerrain = terrainType;
      bestCount = counts[terrainType];
    }
  });

  return bestTerrain;
};

const removeIsolatedTerrainTiles = (
  terrainMap: TerrainType[][],
  enabledTerrainTypes: TerrainType[],
  moistureField: ScalarField,
  riverDistanceField: ScalarField
): TerrainType[][] => {
  const nextMap = terrainMap.map((row) => [...row]);

  for (let y = 0; y < terrainMap.length; y += 1) {
    for (let x = 0; x < terrainMap.length; x += 1) {
      const currentTerrain = terrainMap[y][x];
      const counts = getNeighborTerrainCounts(terrainMap, x, y);
      const sameNeighbors = counts[currentTerrain];

      if (currentTerrain === "river") {
        if (sameNeighbors === 0) {
          nextMap[y][x] = chooseEnabledTerrain(["plain", "forest", "hill", "desert"], enabledTerrainTypes);
        }
        continue;
      }

      if (currentTerrain === "hill" && sameNeighbors === 0) {
        nextMap[y][x] = chooseEnabledTerrain(["plain", "forest", "desert"], enabledTerrainTypes);
        continue;
      }

      if (currentTerrain === "forest" && counts.desert >= 2) {
        nextMap[y][x] = chooseEnabledTerrain(["plain", "forest"], enabledTerrainTypes);
        continue;
      }

      if (currentTerrain === "desert" && (counts.forest >= 2 || riverDistanceField[y][x] <= 1 || moistureField[y][x] >= 0.46)) {
        nextMap[y][x] = chooseEnabledTerrain(["plain", "forest", "desert"], enabledTerrainTypes);
        continue;
      }

      if (sameNeighbors <= 1) {
        nextMap[y][x] = getDominantNeighborTerrain(terrainMap, x, y, enabledTerrainTypes, ["river"]);
      }
    }
  }

  return nextMap;
};

const mergeTinyTerrainRegions = (
  terrainMap: TerrainType[][],
  battlefieldSize: BattlefieldSize,
  enabledTerrainTypes: TerrainType[]
): TerrainType[][] => {
  const nextMap = terrainMap.map((row) => [...row]);
  const visited = new Set<string>();
  const size = terrainMap.length;
  const tinyRegionSize = Math.max(2, Math.floor(battlefieldSize / 3));
  const minimumRiverSize = Math.max(3, Math.floor(battlefieldSize * 0.45));

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const regionKey = `${x},${y}`;
      if (visited.has(regionKey)) continue;

      const terrainType = terrainMap[y][x];
      const queue: TerrainPoint[] = [{ x, y }];
      const region: TerrainPoint[] = [];
      visited.add(regionKey);

      while (queue.length > 0) {
        const current = queue.shift()!;
        region.push(current);

        getNeighbors(current.x, current.y, size, false).forEach((neighbor) => {
          const neighborKey = `${neighbor.x},${neighbor.y}`;
          if (terrainMap[neighbor.y][neighbor.x] !== terrainType || visited.has(neighborKey)) return;
          visited.add(neighborKey);
          queue.push(neighbor);
        });
      }

      const shouldMerge =
        terrainType === "river" ? region.length < minimumRiverSize : terrainType !== "plain" && region.length <= tinyRegionSize;

      if (!shouldMerge) continue;

      const replacement =
        terrainType === "river"
          ? chooseEnabledTerrain(["plain", "forest", "hill", "desert"], enabledTerrainTypes)
          : getDominantNeighborTerrain(nextMap, x, y, enabledTerrainTypes, ["river"]);

      region.forEach((point) => {
        nextMap[point.y][point.x] = replacement;
      });
    }
  }

  return nextMap;
};

const enforceBiomeTransitions = (
  terrainMap: TerrainType[][],
  enabledTerrainTypes: TerrainType[],
  moistureField: ScalarField,
  elevationField: ScalarField,
  riverDistanceField: ScalarField
): TerrainType[][] => {
  const nextMap = terrainMap.map((row) => [...row]);

  for (let y = 0; y < terrainMap.length; y += 1) {
    for (let x = 0; x < terrainMap.length; x += 1) {
      const currentTerrain = terrainMap[y][x];
      if (currentTerrain === "river") continue;

      const counts = getNeighborTerrainCounts(terrainMap, x, y);

      if (currentTerrain === "forest" && counts.desert >= 2) {
        nextMap[y][x] = chooseEnabledTerrain(["plain", "forest"], enabledTerrainTypes);
        continue;
      }

      if (currentTerrain === "desert") {
        if (counts.forest >= 1 || counts.hill >= 3 || riverDistanceField[y][x] <= 1 || moistureField[y][x] > 0.5) {
          nextMap[y][x] = chooseEnabledTerrain(["plain", "forest", "desert"], enabledTerrainTypes);
        }
        continue;
      }

      if (currentTerrain === "hill") {
        if (counts.hill === 0 || (counts.desert >= 2 && counts.plain + counts.forest >= 2)) {
          nextMap[y][x] = chooseEnabledTerrain(["plain", elevationField[y][x] > 0.66 ? "hill" : "forest"], enabledTerrainTypes);
        }
        continue;
      }

      if (currentTerrain === "plain") {
        if (moistureField[y][x] >= 0.7 && counts.forest >= 4) {
          nextMap[y][x] = chooseEnabledTerrain(["forest", "plain"], enabledTerrainTypes);
          continue;
        }

        if (moistureField[y][x] <= 0.22 && counts.desert >= 4 && riverDistanceField[y][x] > 1) {
          nextMap[y][x] = chooseEnabledTerrain(["desert", "plain"], enabledTerrainTypes);
        }
      }
    }
  }

  return nextMap;
};

const smoothTerrainEdges = (
  terrainMap: TerrainType[][],
  enabledTerrainTypes: TerrainType[],
  passes = 2
): TerrainType[][] => {
  let currentMap = terrainMap.map((row) => [...row]);

  for (let pass = 0; pass < passes; pass += 1) {
    const nextMap = currentMap.map((row) => [...row]);

    for (let y = 0; y < currentMap.length; y += 1) {
      for (let x = 0; x < currentMap.length; x += 1) {
        const currentTerrain = currentMap[y][x];
        if (currentTerrain === "river") continue;

        const counts = getNeighborTerrainCounts(currentMap, x, y);
        const dominantTerrain = getDominantNeighborTerrain(currentMap, x, y, enabledTerrainTypes, ["river"]);

        if (dominantTerrain === currentTerrain || counts[dominantTerrain] < 5) continue;

        const isHarshGreenDryBoundary =
          (currentTerrain === "forest" && dominantTerrain === "desert") ||
          (currentTerrain === "desert" && dominantTerrain === "forest");

        nextMap[y][x] = isHarshGreenDryBoundary
          ? chooseEnabledTerrain(["plain", dominantTerrain, currentTerrain], enabledTerrainTypes)
          : dominantTerrain;
      }
    }

    currentMap = nextMap;
  }

  return currentMap;
};

const generateBattlefieldTerrain = (battlefieldSize: BattlefieldSize, terrainSettings: TerrainGenerationSettings): TerrainType[][] => {
  const enabledTerrainTypes = getMixedTerrainTypes(terrainSettings, battlefieldSize);

  if (enabledTerrainTypes.length === 1) {
    return generatePureTerrain(battlefieldSize, enabledTerrainTypes[0]);
  }

  const elevationField = generateElevationField(battlefieldSize);
  const baseMoistureField = generateMoistureField(battlefieldSize, elevationField);
  const riverField: boolean[][] = terrainSettings.river
    ? generateRiverField(battlefieldSize, elevationField, baseMoistureField)
    : Array.from({ length: battlefieldSize }, () => Array.from({ length: battlefieldSize }, () => false));
  const riverDistanceField = terrainSettings.river
    ? buildRiverDistanceField(riverField)
    : createScalarField(battlefieldSize, () => Number.POSITIVE_INFINITY);
  const hydratedMoistureField = hydrateMoistureField(baseMoistureField, elevationField, riverDistanceField);

  let terrainMap = createTerrainField(battlefieldSize, (x, y) => {
    const nearRiver = terrainSettings.river && riverField[y]?.[x];
    return chooseBaseTerrain(elevationField[y][x], hydratedMoistureField[y][x], nearRiver, enabledTerrainTypes);
  });

  // Build macro geography first, then collapse tiny speckles so plains become the natural transition biome.
  terrainMap = removeIsolatedTerrainTiles(terrainMap, enabledTerrainTypes, hydratedMoistureField, riverDistanceField);
  terrainMap = mergeTinyTerrainRegions(terrainMap, battlefieldSize, enabledTerrainTypes);
  terrainMap = enforceBiomeTransitions(terrainMap, enabledTerrainTypes, hydratedMoistureField, elevationField, riverDistanceField);
  terrainMap = smoothTerrainEdges(terrainMap, enabledTerrainTypes, 2);
  terrainMap = mergeTinyTerrainRegions(terrainMap, battlefieldSize, enabledTerrainTypes);

  return terrainMap;
};

const generatePureTerrain = (battlefieldSize: BattlefieldSize, terrainType: TerrainType): TerrainType[][] =>
  Array.from({ length: battlefieldSize }, () => Array.from({ length: battlefieldSize }, () => terrainType));

const generateTerrainMap = (
  battlefieldSize: BattlefieldSize,
  terrainPreset: TerrainPreset,
  terrainSettings: TerrainGenerationSettings
): TerrainType[][] =>
  terrainPreset === "mixed"
    ? generateBattlefieldTerrain(battlefieldSize, terrainSettings)
    : generatePureTerrain(battlefieldSize, terrainPreset);

const isValidTerrainMap = (terrainMap: any, battlefieldSize: BattlefieldSize): terrainMap is TerrainType[][] => {
  return (
    Array.isArray(terrainMap) &&
    terrainMap.length === battlefieldSize &&
    terrainMap.every(
      (row: any) =>
        Array.isArray(row) &&
        row.length === battlefieldSize &&
        row.every((tile: any) => ["plain", "forest", "hill", "river", "desert"].includes(tile))
    )
  );
};

const getTerrainAt = (terrainMap: TerrainType[][], x: number, y: number): TerrainType => {
  return terrainMap?.[y]?.[x] ?? "plain";
};

const isCombatLogEntry = (entry: string) => {
  const normalizedEntry = String(entry ?? "").toLowerCase();
  return normalizedEntry.includes(" attacked ") || normalizedEntry.includes(" was killed");
};

const ensureRangedAmmo = (unit: any) => {
  if (!unit) return unit;

  const normalizedUnit = { ...unit };
  const normalizedRole = String(normalizedUnit.role ?? normalizedUnit.name ?? "").toLowerCase();
  const projectileKeywords = [
    "archer",
    "slinger",
    "crossbow",
    "velites",
    "shaman",
    "skirmisher",
    "peltast",
    "psiloi",
    "turcopole",
    "thureophoroi",
    "ballista",
    "scorpion",
    "catapult",
    "trebuchet",
    "polybolos",
    "onager",
    "bombard"
  ];
  const isProjectileUnit = projectileKeywords.some((keyword) => normalizedRole.includes(keyword));

  if (!isProjectileUnit) {
    normalizedUnit.ammo = 0;
    normalizedUnit.range = 1;
    return normalizedUnit;
  }

  const isSiegeUnit = ["ballista", "scorpion", "catapult", "trebuchet", "polybolos", "onager", "bombard"].some((keyword) =>
    normalizedRole.includes(keyword)
  );
  const isLongbowUnit = normalizedRole.includes("longbow");
  const isCrossbowUnit = normalizedRole.includes("crossbow");
  const isSlingerUnit = normalizedRole.includes("slinger");

  let minimumRange = 4;
  let minimumAmmo = 12;

  if (isSiegeUnit) {
    minimumRange = 6;
    minimumAmmo = 8;
  } else if (isLongbowUnit) {
    minimumRange = 6;
    minimumAmmo = 14;
  } else if (isCrossbowUnit) {
    minimumRange = 5;
    minimumAmmo = 12;
  } else if (isSlingerUnit) {
    minimumRange = 5;
    minimumAmmo = 14;
  }

  normalizedUnit.range = Math.max(minimumRange, normalizedUnit.range ?? 1);
  normalizedUnit.ammo = Math.max(minimumAmmo, normalizedUnit.ammo ?? 0);

  return normalizedUnit;
};

const getTroopMechanicType = (unit: any): TroopMechanicType => {
  if (!unit) return "closecombat";

  const role = String(unit.role ?? "").toLowerCase();
  const siegeKeywords = ["ballista", "scorpion", "catapult", "trebuchet", "polybolos", "siege tower", "onager", "bombard"];
  const mountedKeywords = ["cavalry", "chariot", "rider", "scout", "knight", "elephant"];

  if (siegeKeywords.some((keyword) => role.includes(keyword))) {
    return "sieged";
  }

  if ((unit.ammo ?? 0) > 0 && (unit.range ?? 1) > 1) {
    return "ranged";
  }

  if (mountedKeywords.some((keyword) => role.includes(keyword)) || ((unit.move ?? 0) >= 3 && (unit.range ?? 1) <= 1)) {
    return "mounted";
  }

  return "closecombat";
};

const LEADER_AURA_ATTACK_MULTIPLIER = 1.1;

const isLeaderRole = (role: string) => {
  const normalizedRole = String(role ?? "").toLowerCase();
  return ["king", "jarl", "general", "leader", "marshal"].some((keyword) => normalizedRole.includes(keyword));
};

const isNearKing = (unit: any, allUnits: any[]) => {
  if (!unit || !Array.isArray(allUnits)) return false;

  return allUnits.some((candidate) => {
    if (!candidate || candidate.id === unit.id || candidate.hp <= 0) return false;
    if (candidate.team !== unit.team || !isLeaderRole(candidate.role)) return false;

    const distance = Math.abs(candidate.x - unit.x) + Math.abs(candidate.y - unit.y);
    return distance === 1;
  });
};

const getAttackDamage = (attacker: any, defender: any, allUnits: any[] = [], terrainMap: TerrainType[][] = []) => {
  const attackerType = getTroopMechanicType(attacker);
  const defenderType = getTroopMechanicType(defender);
  const hasAdvantage = TROOP_MECHANIC_ADVANTAGE[attackerType].includes(defenderType);
  const hasLeaderAura = isNearKing(attacker, allUnits);
  const attackerTerrain = getTerrainAt(terrainMap, attacker?.x ?? 0, attacker?.y ?? 0);
  const terrainModifiers = getTerrainModifiers(attacker, attackerTerrain);
  const hasTerrainModifier = terrainModifiers.attackMultiplier !== 1;
  let damage = attacker.attack;

  if (hasLeaderAura) {
    damage = Math.round(damage * LEADER_AURA_ATTACK_MULTIPLIER);
  }

  if (hasTerrainModifier) {
    damage = Math.round(damage * terrainModifiers.attackMultiplier);
  }

  if (hasAdvantage) {
    damage = Math.round(damage * TROOP_MECHANIC_ADVANTAGE_MULTIPLIER);
  }

  return {
    damage,
    attackerType,
    defenderType,
    hasAdvantage,
    hasLeaderAura,
    hasTerrainModifier,
    terrainType: attackerTerrain,
    terrainLabel: terrainModifiers.terrainLabel
  };
};

const getDisplayedAttack = (unit: any, allUnits: any[] = [], terrainMap: TerrainType[][] = []) => {
  if (!unit) return 0;

  let displayedAttack = unit.attack;
  const terrainModifiers = getTerrainModifiers(unit, getTerrainAt(terrainMap, unit.x, unit.y));

  if (isNearKing(unit, allUnits)) {
    displayedAttack = Math.round(displayedAttack * LEADER_AURA_ATTACK_MULTIPLIER);
  }

  if (terrainModifiers.attackMultiplier !== 1) {
    displayedAttack = Math.round(displayedAttack * terrainModifiers.attackMultiplier);
  }

  return displayedAttack;
};

const getUnitEffectNotes = (
  unit: any,
  allUnits: any[] = [],
  terrainMap: TerrainType[][] = [],
  terrainEffectsEnabled = true
) => {
  if (!unit) return [] as string[];

  const notes: string[] = [];

  if (unit.civPassiveName && unit.civPassiveEffect) {
    notes.push(`${unit.civPassiveName}: ${unit.civPassiveEffect}`);
  } else if (unit.civPassiveEffect) {
    notes.push(unit.civPassiveEffect);
  }

  if (isNearKing(unit, allUnits)) {
    notes.push("Leader Aura: +10% attack");
  }

  if (unit.roleHealthBuffActive) {
    notes.push(`Formation Buff: +${Math.round(((unit.roleHealthBuffMultiplier ?? 1) - 1) * 100)}% max health`);
  }

  if (terrainEffectsEnabled) {
    const terrainNotes = getTerrainModifiers(unit, getTerrainAt(terrainMap, unit.x, unit.y)).notes;
    terrainNotes.forEach((note) => notes.push(`Terrain: ${note}`));
  }

  return notes;
};

const ROLE_HEALTH_BUFF_PER_EXTRA_UNIT = 0.05;
const ROLE_HEALTH_BUFF_MIN_GROUP_SIZE = 2;
const GAME_MECHANICS_INFO = [
  {
    title: "Troop Type Matchups",
    description: "Only mounted troops get a type advantage. They deal +10% attack damage against ranged and sieged units."
  },
  {
    title: "Role Formation Buff",
    description: "Adjacent allied troops with the same role gain scaling max health: 2 units = +5%, 3 = +10%, 4 = +15%, and larger groups keep scaling while connected."
  },
  {
    title: "Leader Aura",
    description: "Troops directly next to a King, Jarl, General, or Leader gain +10% attack."
  },
  {
    title: "Ranged Shots",
    description: "Ranged and sieged troops have limited shots. When they run dry, they can no longer fire effectively."
  },
  {
    title: "Merge Limit",
    description: "You can merge adjacent same-role troops into elite units a limited number of times each battle."
  },
  {
    title: "Dynamic Terrain",
    description: "Every new battle generates fresh terrain. Forests, hills, rivers, plains, and deserts can buff or weaken troops depending on their type and faction."
  }
] as const;

const TROOP_MECHANICS_INFO: Array<{ type: TroopMechanicType; summary: string; pros: string[]; cons: string[] }> = [
  {
    type: "closecombat",
    summary: "Front-line fighters built to hold ground and finish broken enemies up close.",
    pros: ["Gets a hill bonus from elevated footing.", "Reliable front-line presence in direct combat."],
    cons: ["Usually slower than mounted troops.", "Loses attack power while fighting in rivers."]
  },
  {
    type: "mounted",
    summary: "Fast flankers that exploit open ground and pressure fragile back lines.",
    pros: ["Strong against ranged and sieged units.", "Gain +1 move on plains."],
    cons: ["Lose power and speed in forests and rivers.", "Climbing hills slows them down."]
  },
  {
    type: "ranged",
    summary: "Flexible missile troops that chip away at enemies before they can close in.",
    pros: ["Gain attack bonuses in forests and on hills.", "Useful for softening enemies before contact."],
    cons: ["Vulnerable to mounted flanks.", "Dusty desert terrain weakens their attacks."]
  },
  {
    type: "sieged",
    summary: "Heavy engines that hit hard from distance but hate rough terrain and close pressure.",
    pros: ["Benefit from stable firing positions, especially hills.", "Can hit hard from long range."],
    cons: ["Weak to mounted flanks.", "Forests, rivers, and deserts slow or weaken them."]
  }
] as const;

const TERRAIN_MECHANICS_INFO: Array<{ terrain: TerrainType; summary: string; effects: string[] }> = [
  {
    terrain: "plain",
    summary: "Open ground that connects the other biomes and favors mobility.",
    effects: [
      "Mounted troops gain +1 move on open ground.",
      "Sieged troops gain +5% attack from stable firing lanes.",
      "Romans and Vikings gain +5% attack on plains."
    ]
  },
  {
    terrain: "forest",
    summary: "Wet, dense terrain that rewards cover and punishes fast movement.",
    effects: [
      "Ranged troops gain +10% attack in forest cover.",
      "Mounted troops suffer -1 move and -10% attack in dense woods.",
      "Sieged troops suffer -1 move and -10% attack in forests.",
      "Celts and Germanic troops gain +10% attack and +1 move in forests."
    ]
  },
  {
    terrain: "hill",
    summary: "Elevated ground that improves firing positions and slows rapid troops.",
    effects: [
      "Ranged troops gain +15% attack from high ground.",
      "Closecombat troops gain +5% attack on hills.",
      "Mounted troops lose 1 move climbing hills.",
      "Sieged troops gain +10% attack from elevated positions.",
      "Greeks and Teutons gain +10% attack on hills."
    ]
  },
  {
    terrain: "river",
    summary: "Water lanes disrupt combat flow unless a faction is good at crossing.",
    effects: [
      "Closecombat troops suffer -10% attack while fighting through water.",
      "Mounted troops suffer -1 move and -10% attack in rivers.",
      "Sieged troops suffer -1 move and -15% attack in rivers.",
      "Romans and Carthage gain +5% attack and +1 move in rivers."
    ]
  },
  {
    terrain: "desert",
    summary: "Dry, punishing terrain that drains movement and weakens ranged fire.",
    effects: [
      "All non-mounted troops lose 1 move in desert terrain.",
      "Ranged troops suffer -10% attack from dust and heat.",
      "Sieged troops suffer an extra -10% attack in desert sand.",
      "Carthage and Barbarians gain +10% attack and +1 move in deserts."
    ]
  }
] as const;

const getOrientationRotationSteps = (from: GridOrientation, to: GridOrientation) => {
  const fromIndex = GRID_ORIENTATIONS.indexOf(from);
  const toIndex = GRID_ORIENTATIONS.indexOf(to);
  return (toIndex - fromIndex + GRID_ORIENTATIONS.length) % GRID_ORIENTATIONS.length;
};

const rotateUnitCoordinates = (units: any[], steps: number, battlefieldSize: BattlefieldSize) => {
  if (steps === 0) return units;

  return units.map((unit) => {
    if (!unit) return unit;

    let nextX = unit.x;
    let nextY = unit.y;

    for (let step = 0; step < steps; step += 1) {
      const rotatedX = battlefieldSize - 1 - nextY;
      const rotatedY = nextX;
      nextX = rotatedX;
      nextY = rotatedY;
    }

    return {
      ...unit,
      x: nextX,
      y: nextY
    };
  });
};

const getTerrainModifiers = (unit: any, terrainType: TerrainType) => {
  const troopType = getTroopMechanicType(unit);
  let attackMultiplier = 1;
  let moveDelta = 0;
  const notes: string[] = [];

  switch (terrainType) {
    case "forest":
      if (troopType === "ranged") {
        attackMultiplier *= 1.1;
        notes.push("+10% attack for ranged cover");
      }
      if (troopType === "mounted") {
        moveDelta -= 1;
        attackMultiplier *= 0.9;
        notes.push("-1 move and -10% attack for mounted troops in dense woods");
      }
      if (troopType === "sieged") {
        moveDelta -= 1;
        attackMultiplier *= 0.9;
        notes.push("-1 move and -10% attack for siege engines in forests");
      }
      if (unit.team === "Celts" || unit.team === "Germanic") {
        attackMultiplier *= 1.1;
        moveDelta += 1;
        notes.push("+10% attack and +1 move for woodland factions");
      }
      break;
    case "hill":
      if (troopType === "ranged") {
        attackMultiplier *= 1.15;
        notes.push("+15% attack from high ground");
      } else if (troopType === "closecombat") {
        attackMultiplier *= 1.05;
        notes.push("+5% attack from elevated footing");
      }
      if (troopType === "mounted") {
        moveDelta -= 1;
        notes.push("-1 move climbing hills");
      }
      if (troopType === "sieged") {
        attackMultiplier *= 1.1;
        notes.push("+10% attack from elevated siege positions");
      }
      if (unit.team === "Greeks" || unit.team === "Teutons") {
        attackMultiplier *= 1.1;
        notes.push("+10% attack for disciplined hill fighters");
      }
      break;
    case "river":
      if (troopType === "closecombat") {
        attackMultiplier *= 0.9;
        notes.push("-10% attack while fighting through water");
      }
      if (troopType === "mounted") {
        moveDelta -= 1;
        attackMultiplier *= 0.9;
        notes.push("-1 move and -10% attack for mounted troops in rivers");
      }
      if (troopType === "sieged") {
        moveDelta -= 1;
        attackMultiplier *= 0.85;
        notes.push("-1 move and -15% attack for siege engines in rivers");
      }
      if (unit.team === "Romans" || unit.team === "Carthage") {
        attackMultiplier *= 1.05;
        moveDelta += 1;
        notes.push("+5% attack and +1 move from organized river crossing");
      }
      break;
    case "desert":
      if (troopType !== "mounted") {
        moveDelta -= 1;
        notes.push("-1 move in harsh desert terrain");
      }
      if (troopType === "ranged") {
        attackMultiplier *= 0.9;
        notes.push("-10% attack from dust and heat");
      }
      if (troopType === "sieged") {
        attackMultiplier *= 0.9;
        notes.push("-10% attack for siege engines in shifting sand");
      }
      if (unit.team === "Carthage" || unit.team === "Barbarians") {
        attackMultiplier *= 1.1;
        moveDelta += 1;
        notes.push("+10% attack and +1 move for desert-adapted factions");
      }
      break;
    case "plain":
    default:
      if (troopType === "mounted") {
        moveDelta += 1;
        notes.push("+1 move on open ground");
      }
      if (troopType === "sieged") {
        attackMultiplier *= 1.05;
        notes.push("+5% attack from stable firing lanes");
      }
      if (unit.team === "Romans" || unit.team === "Vikings") {
        attackMultiplier *= 1.05;
        notes.push("+5% attack on open terrain");
      }
      break;
  }

  return {
    terrainType,
    terrainLabel: TERRAIN_LABELS[terrainType],
    attackMultiplier,
    moveDelta,
    notes
  };
};

const getEffectiveMove = (unit: any, terrainMap: TerrainType[][]) => {
  if (!unit) return 0;
  const terrainType = getTerrainAt(terrainMap, unit.x, unit.y);
  const modifiers = getTerrainModifiers(unit, terrainType);
  return Math.max(1, unit.move + modifiers.moveDelta);
};

const applyRoleHealthBuffs = (units: any[]) => {
  if (!Array.isArray(units) || units.length === 0) return units;

  const aliveUnits = units.filter((unit) => unit && unit.hp > 0);
  const qualifyingBuffs = new Map<string, number>();
  const visited = new Set<string>();

  aliveUnits.forEach((unit) => {
    if (visited.has(unit.id)) return;

    const component: any[] = [];
    const stack = [unit];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current.id)) continue;

      visited.add(current.id);
      component.push(current);

      aliveUnits.forEach((candidate) => {
        if (visited.has(candidate.id)) return;
        if (candidate.team !== current.team || candidate.role !== current.role) return;

        const distance = Math.abs(candidate.x - current.x) + Math.abs(candidate.y - current.y);
        if (distance === 1) stack.push(candidate);
      });
    }

    if (component.length >= ROLE_HEALTH_BUFF_MIN_GROUP_SIZE) {
      const multiplier = 1 + ROLE_HEALTH_BUFF_PER_EXTRA_UNIT * (component.length - 1);
      component.forEach((member) => qualifyingBuffs.set(member.id, multiplier));
    }
  });

  return units.map((unit) => {
    if (!unit) return unit;

    const baseMaxHp = unit.baseMaxHp ?? unit.maxHp;
    const roleHealthBuffMultiplier = qualifyingBuffs.get(unit.id) ?? 1;
    const desiredBuff = unit.hp > 0 && roleHealthBuffMultiplier > 1;
    const desiredMaxHp = desiredBuff ? Math.round(baseMaxHp * roleHealthBuffMultiplier) : baseMaxHp;
    const currentMaxHp = unit.maxHp ?? baseMaxHp;
    const stateChanged =
      currentMaxHp !== desiredMaxHp ||
      Boolean(unit.roleHealthBuffActive) !== desiredBuff ||
      unit.baseMaxHp !== baseMaxHp;

    let nextHp = unit.hp;
    if (unit.hp > 0 && stateChanged) {
      const hpRatio = currentMaxHp > 0 ? unit.hp / currentMaxHp : 1;
      nextHp = Math.max(1, Math.min(desiredMaxHp, Math.round(desiredMaxHp * hpRatio)));
    }

    return {
      ...unit,
      baseMaxHp,
      roleHealthBuffMultiplier,
      maxHp: desiredMaxHp,
      hp: unit.hp <= 0 ? unit.hp : nextHp,
      roleHealthBuffActive: desiredBuff
    };
  });
};

const didRoleHealthBuffStateChange = (currentUnits: any[], updatedUnits: any[]) => {
  if (currentUnits.length !== updatedUnits.length) return true;

  return updatedUnits.some((unit, index) => {
    const current = currentUnits[index];
    return (
      current?.hp !== unit?.hp ||
      current?.maxHp !== unit?.maxHp ||
      current?.baseMaxHp !== unit?.baseMaxHp ||
      current?.roleHealthBuffMultiplier !== unit?.roleHealthBuffMultiplier ||
      current?.roleHealthBuffActive !== unit?.roleHealthBuffActive
    );
  });
};

const CIV_PASSIVES: Record<TeamName, { name: string; effect: string }> = {
  Romans: { name: "Roman Discipline", effect: "+10% hp, +10% attack" },
  Barbarians: { name: "Barbarian Fury", effect: "+20% attack, -10% hp" },
  Greeks: { name: "Phalanx Mastery", effect: "+1 range (infantry), -1 move" },
  Celts: { name: "Swift Warriors", effect: "+1 move, -10% hp" },
  Germanic: { name: "Brutal Strength", effect: "+15% attack" },
  Carthage: { name: "Mercenary Tactics", effect: "+10% hp, +10% attack, -1 move" },
  Vikings: { name: "Relentless Raiders", effect: "+1 move, +10% attack, -10% hp" },
  Teutons: { name: "Heavy Armor", effect: "+25% hp, -1 move" }
};

const PASSIVE_ICONS: Record<TeamName, string> = {
  Romans: "🛡️",
  Barbarians: "🔥",
  Greeks: "🗡️",
  Celts: "🍃",
  Germanic: "🪓",
  Carthage: "🐘",
  Vikings: "⛵",
  Teutons: "🏰"
};

const TROOP_MECHANIC_ADVANTAGE: Record<TroopMechanicType, TroopMechanicType[]> = {
  closecombat: [],
  mounted: ["ranged", "sieged"],
  ranged: [],
  sieged: []
};

const TROOP_MECHANIC_LABELS: Record<TroopMechanicType, string> = {
  closecombat: "Close Combat",
  mounted: "Mounted",
  ranged: "Ranged",
  sieged: "Sieged"
};

const TROOP_MECHANIC_ICONS: Record<TroopMechanicType, string> = {
  closecombat: "⚔️",
  mounted: "🐎",
  ranged: "🏹",
  sieged: "⚙️"
};

const TROOP_MECHANIC_ADVANTAGE_MULTIPLIER = 1.1;

const GAME_STATE_STORAGE_KEY = "battlecry-game-state";
const BATTLEFIELD_SIZE_OPTIONS: BattlefieldSize[] = [8, 10, 12, 14, 16, 18, 20];
const DEFAULT_GAME_OPTIONS: GameOptions = {
  musicEnabled: true,
  showMoveHighlights: true,
  showAttackHighlights: true,
  showBattleLog: true,
  showTurnBanner: true,
  showUnitPanel: true,
  terrainEffectsEnabled: true,
  battlefieldSize: 8
};

const ROLE_ICON_LOOKUP = Object.values(AVAILABLE_TROOPS).flat().reduce((lookup, troop) => {
  lookup[troop.role] = troop.Icon;
  return lookup;
}, {} as Record<string, string>);

const getUnitDisplayIcon = (unit: any) => {
  if (!unit) return "⚔️";
  return ROLE_ICON_LOOKUP[unit.role] ?? unit.Icon ?? "⚔️";
};

const adjustStatPercent = (value: number, percent: number) => Math.max(0, Math.round(value * (1 + percent)));
const adjustMovePercent = (value: number, percent: number) => {
  if (value <= 0) return 0;
  return Math.max(1, Math.floor(value * (1 + percent)));
};

const isInfantryRole = (role: string) => {
  const lowerRole = role.toLowerCase();
  const nonInfantryKeywords = [
    "archer",
    "slinger",
    "ballista",
    "scorpion",
    "catapult",
    "polybolos",
    "trebuchet",
    "onager",
    "bombard",
    "cavalry",
    "chariot",
    "elephant",
    "rider",
    "horseman",
    "lancer",
    "equites",
    "xystophoroi",
    "turcopole",
    "scout",
    "knight",
    "king",
    "jarl",
    "general",
    "marshal"
  ];

  return !nonInfantryKeywords.some((keyword) => lowerRole.includes(keyword));
};

const stripUnitForStorage = (unit: any) => {
  if (!unit) return null;
  const { Icon, ...serializableUnit } = unit;
  return serializableUnit;
};

const restoreUnitFromStorage = (unit: any) => {
  if (!unit) return null;
  return {
    ...unit,
    Icon: getUnitDisplayIcon(unit)
  };
};

const applyCivilizationPassive = (unit: any) => {
  if (!unit) return null;

  const normalizedUnit = ensureRangedAmmo(unit);
  if (normalizedUnit.civPassiveApplied) return normalizedUnit;

  const team = normalizedUnit.team as TeamName;
  const passive = CIV_PASSIVES[team];
  if (!passive) return normalizedUnit;

  switch (team) {
    case "Romans":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, 0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, 0.1);
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      break;
    case "Barbarians":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, -0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, -0.1);
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.2);
      break;
    case "Greeks":
      if (isInfantryRole(normalizedUnit.role)) {
        normalizedUnit.range += 1;
        normalizedUnit.move = Math.max(0, normalizedUnit.move - 1);
      }
      break;
    case "Celts":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, -0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, -0.1);
      normalizedUnit.move += 1;
      break;
    case "Germanic":
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.15);
      break;
    case "Carthage":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, 0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, 0.1);
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      normalizedUnit.move = adjustMovePercent(normalizedUnit.move, -0.1);
      break;
    case "Vikings":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, -0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, -0.1);
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      normalizedUnit.move += 1;
      break;
    case "Teutons":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, 0.25);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, 0.25);
      normalizedUnit.move = Math.max(0, normalizedUnit.move - 1);
      break;
  }

  normalizedUnit.civPassiveApplied = true;
  normalizedUnit.civPassiveName = passive.name;
  normalizedUnit.civPassiveEffect = passive.effect;

  return ensureRangedAmmo(normalizedUnit);
};

const prepareUnitsForBattle = (units: any[]) =>
  units.map((unit) =>
    applyCivilizationPassive({
      ...unit,
      Icon: getUnitDisplayIcon(unit)
    })
  );

const rerollUnitStats = (unit: any) => {
  const rerolledStats = generateTroopStats(unit.role);

  return applyCivilizationPassive({
    ...unit,
    ...rerolledStats,
    Icon: getUnitDisplayIcon(unit),
    civPassiveApplied: false,
    civPassiveName: undefined,
    civPassiveEffect: undefined
  });
};

const rerollUnits = (units: any[]) => units.map((unit) => rerollUnitStats(unit));

function CodeConq() {
  const [currentLevel, setCurrentLevel] = useState<keyof typeof levels>("Level1");
  const [terrainPreset, setTerrainPreset] = useState<TerrainPreset>("mixed");
  const [terrainGenerationSettings, setTerrainGenerationSettings] = useState<TerrainGenerationSettings>(DEFAULT_TERRAIN_GENERATION_SETTINGS);
  const [units, setUnits] = useState(() => prepareUnitsForBattle(levels["Level1"]));
  const [battlefieldTerrain, setBattlefieldTerrain] = useState<TerrainType[][]>(() => generateTerrainMap(DEFAULT_GAME_OPTIONS.battlefieldSize, "mixed", DEFAULT_TERRAIN_GENERATION_SETTINGS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectedUnitId, setInspectedUnitId] = useState<string | null>(null);
  const [inspectedTile, setInspectedTile] = useState<TerrainPoint | null>(null);
  const [turn, setTurn] = useState("Romans");
  const [log, setLog] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  
  // Custom setup mode states
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [customUnits, setCustomUnits] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamName>("Romans");
  const [playerTeam, setPlayerTeam] = useState<TeamName>("Romans");
  const [draggedTroop, setDraggedTroop] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeCount, setMergeCount] = useState(0);
  const [selectedForMerge, setSelectedForMerge] = useState<any>(null);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [multiplayerTeams, setMultiplayerTeams] = useState<[TeamName, TeamName]>(["Romans", "Barbarians"]);
  const [gridOrientation, setGridOrientation] = useState<GridOrientation>("north");
  const [isBattlefieldFullscreen, setIsBattlefieldFullscreen] = useState(false);
  const battlefieldRef = useRef<HTMLDivElement | null>(null);
  const battlefieldViewportRef = useRef<HTMLDivElement | null>(null);
  const battlefieldPanStateRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number; moved: boolean } | null>(null);
  const battlefieldPanCleanupRef = useRef<(() => void) | null>(null);
  const skipNextGridClickRef = useRef(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const isRestoringSavedGameRef = useRef(false);
  const hasLoadedSavedGameRef = useRef(false);
  const [startScreen, setStartScreen] = useState<"menu" | "options">("menu");
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isInGameOptionsOpen, setIsInGameOptionsOpen] = useState(false);
  const [isInGameMechanicsOpen, setIsInGameMechanicsOpen] = useState(false);
  const [isInGameGraphicsOpen, setIsInGameGraphicsOpen] = useState(false);
  const [gameOptions, setGameOptions] = useState<GameOptions>(DEFAULT_GAME_OPTIONS);
  const [isPanningGrid, setIsPanningGrid] = useState(false);
  const [hoverScrollDirection, setHoverScrollDirection] = useState<HoverScrollDirection>(null);

  // Update units when level changes
  useEffect(() => {
    if (isRestoringSavedGameRef.current) {
      isRestoringSavedGameRef.current = false;
      return;
    }

    if (levels[currentLevel]) {
      const nextPlayerTeam = getValidLevelPlayerTeam(currentLevel, playerTeam);
      setUnits(prepareUnitsForBattle(levels[currentLevel]));
      setSelectedId(null);
      setPlayerTeam(nextPlayerTeam);
      setTurn(nextPlayerTeam);
      setRound(1);
      setLog([]);
      setGameStarted(false);
      setIsSetupMode(false);
      setCustomUnits([]);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
      setGridOrientation("north");
      setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
    }
  }, [currentLevel]);

  useEffect(() => {
    if (!units.length) return;

    const updatedUnits = applyRoleHealthBuffs(units);
    if (didRoleHealthBuffStateChange(units, updatedUnits)) {
      setUnits(updatedUnits);
    }
  }, [units]);

  useEffect(() => {
    if (!customUnits.length) return;

    const updatedUnits = applyRoleHealthBuffs(customUnits);
    if (didRoleHealthBuffStateChange(customUnits, updatedUnits)) {
      setCustomUnits(updatedUnits);
    }
  }, [customUnits]);

  useEffect(() => {
    if (!inspectedUnitId) return;
    if (!getUnitById(inspectedUnitId)) {
      setInspectedUnitId(null);
    }
  }, [inspectedUnitId, units, customUnits, isSetupMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      hasLoadedSavedGameRef.current = true;
      return;
    }

    try {
      const savedStateRaw = window.localStorage.getItem(GAME_STATE_STORAGE_KEY);
      if (!savedStateRaw) {
        hasLoadedSavedGameRef.current = true;
        return;
      }

      const savedState = JSON.parse(savedStateRaw);
      const savedLevel = savedState.currentLevel ?? savedState.currentFormation;
      const mergedOptions = savedState.gameOptions ? { ...DEFAULT_GAME_OPTIONS, ...savedState.gameOptions } : DEFAULT_GAME_OPTIONS;
      const restoredBattlefieldSize = BATTLEFIELD_SIZE_OPTIONS.includes(mergedOptions.battlefieldSize)
        ? mergedOptions.battlefieldSize
        : DEFAULT_GAME_OPTIONS.battlefieldSize;

      if (savedLevel && savedLevel in levels) {
        isRestoringSavedGameRef.current = true;
        setCurrentLevel(savedLevel as keyof typeof levels);
      }

      setUnits(
        Array.isArray(savedState.units)
          ? savedState.units.map(restoreUnitFromStorage).map(applyCivilizationPassive)
          : prepareUnitsForBattle(levels["Level1"])
      );
      setSelectedId(savedState.selectedId ?? null);
      setTurn(savedState.turn ?? "Romans");
      setLog(Array.isArray(savedState.log) ? savedState.log : []);
      setRound(typeof savedState.round === "number" ? savedState.round : 1);
      setIsSetupMode(Boolean(savedState.isSetupMode));
      setCustomUnits(
        Array.isArray(savedState.customUnits)
          ? savedState.customUnits.map(restoreUnitFromStorage).map(applyCivilizationPassive)
          : []
      );
      setSelectedTeam(savedState.selectedTeam ?? "Romans");
      setPlayerTeam(savedState.playerTeam ?? "Romans");
      setDraggedTroop(null);
      setGameStarted(Boolean(savedState.gameStarted));
      setMergeMode(Boolean(savedState.mergeMode));
      setMergeCount(typeof savedState.mergeCount === "number" ? savedState.mergeCount : 0);
      setSelectedForMerge(savedState.selectedForMerge ? applyCivilizationPassive(restoreUnitFromStorage(savedState.selectedForMerge)) : null);
      setGameMode(savedState.gameMode ?? null);
      setMultiplayerTeams(Array.isArray(savedState.multiplayerTeams) ? savedState.multiplayerTeams : ["Romans", "Barbarians"]);
      setGridOrientation(GRID_ORIENTATIONS.includes(savedState.gridOrientation) ? savedState.gridOrientation : "north");
      const restoredTerrainPreset: TerrainPreset = ["mixed", "plain", "forest", "hill", "desert"].includes(savedState.terrainPreset)
        ? savedState.terrainPreset
        : "mixed";
      const restoredTerrainGenerationSettings: TerrainGenerationSettings =
        TERRAIN_TYPES.reduce((settings, terrainType) => {
          settings[terrainType] =
            typeof savedState.terrainGenerationSettings?.[terrainType] === "boolean"
              ? savedState.terrainGenerationSettings[terrainType]
              : DEFAULT_TERRAIN_GENERATION_SETTINGS[terrainType];
          return settings;
        }, {} as TerrainGenerationSettings);
      setTerrainPreset(restoredTerrainPreset);
      setTerrainGenerationSettings(restoredTerrainGenerationSettings);
      setGameOptions({
        ...mergedOptions,
        battlefieldSize: restoredBattlefieldSize
      });
      setBattlefieldTerrain(
        isValidTerrainMap(savedState.battlefieldTerrain, restoredBattlefieldSize)
          ? savedState.battlefieldTerrain
          : generateTerrainMap(restoredBattlefieldSize, restoredTerrainPreset, restoredTerrainGenerationSettings)
      );
    } catch {
      // Ignore invalid saved state and fall back to a fresh session.
    } finally {
      hasLoadedSavedGameRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedGameRef.current || typeof window === "undefined") return;

    const savedState = {
      currentLevel,
      units: units.map(stripUnitForStorage),
      selectedId,
      turn,
      log,
      round,
      isSetupMode,
      customUnits: customUnits.map(stripUnitForStorage),
      selectedTeam,
      playerTeam,
      gameStarted,
      mergeMode,
      mergeCount,
      selectedForMerge: stripUnitForStorage(selectedForMerge),
      gameMode,
      multiplayerTeams,
      gridOrientation,
      terrainPreset,
      terrainGenerationSettings,
      battlefieldTerrain,
      gameOptions
    };

    window.localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(savedState));
  }, [
    currentLevel,
    units,
    selectedId,
    turn,
    log,
    round,
    isSetupMode,
    customUnits,
    selectedTeam,
    playerTeam,
    gameStarted,
    mergeMode,
    mergeCount,
    selectedForMerge,
    gameMode,
    multiplayerTeams,
    gridOrientation,
    terrainPreset,
    terrainGenerationSettings,
    battlefieldTerrain,
    gameOptions
  ]);

  useEffect(() => {
    const audio = new Audio(BACKGROUND_MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0.35;
    backgroundMusicRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      backgroundMusicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    if (!gameMode || !gameOptions.musicEnabled) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    void audio.play().catch(() => {
      // Ignore autoplay rejections; the user can start music with the toggle.
    });
  }, [gameMode, gameOptions.musicEnabled]);

  useEffect(() => {
    if (gameMode !== "single-player") return;

    const validPlayerTeam = getValidLevelPlayerTeam(currentLevel, playerTeam);
    if (validPlayerTeam === playerTeam) return;

    setPlayerTeam(validPlayerTeam);
    setTurn(validPlayerTeam);
    setSelectedId(null);
  }, [currentLevel, gameMode, playerTeam]);

  useEffect(() => {
    if (isSetupMode || gameMode === "multiplayer" || !gameStarted) return;

    const aliveTeams = getAliveTeams(units);
    if (aliveTeams.length <= 1 || aliveTeams.includes(turn as TeamName)) return;

    if (aliveTeams.includes(playerTeam)) {
      setTurn(playerTeam);
      return;
    }

    const nextAiTeam = aliveTeams.find((team) => team !== playerTeam);
    if (nextAiTeam) setTurn(nextAiTeam);
  }, [gameMode, gameStarted, isSetupMode, playerTeam, turn, units]);

  const getUnit = (x: number, y: number) => {
    const currentUnits = isSetupMode ? customUnits : units;
    return currentUnits?.find((u: any) => u.x === x && u.y === y);
  };
  
  const getUnitById = (id: string | null) => {
    const currentUnits = isSetupMode ? customUnits : units;
    return currentUnits?.find((u: any) => u.id === id);
  };
  
  const isWithinBattlefield = (x: number, y: number) => x >= 0 && x < battlefieldSize && y >= 0 && y < battlefieldSize;
  const isInRange = (a: any, b: any, range: number) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= range;
  const getCloseCombatAttackDestination = (attacker: any, target: any) => {
    if (!attacker || !target || attacker.range !== 1) return null;

    const attackerMove = getEffectiveMove(attacker, battlefieldTerrain);

    const candidates = [
      { x: target.x + 1, y: target.y },
      { x: target.x - 1, y: target.y },
      { x: target.x, y: target.y + 1 },
      { x: target.x, y: target.y - 1 }
    ]
      .filter(({ x, y }) => isWithinBattlefield(x, y))
      .filter(({ x, y }) => !getUnit(x, y))
      .filter(({ x, y }) => Math.abs(attacker.x - x) + Math.abs(attacker.y - y) <= attackerMove)
      .sort((a, b) => {
        const distanceA = Math.abs(attacker.x - a.x) + Math.abs(attacker.y - a.y);
        const distanceB = Math.abs(attacker.x - b.x) + Math.abs(attacker.y - b.y);
        return distanceA - distanceB;
      });

    return candidates[0] ?? null;
  };
  const selected = getUnitById(selectedId);
  const inspectedUnit = getUnitById(inspectedUnitId);
  const currentBattleUnits = isSetupMode ? customUnits : units;
  const battlefieldSize = gameOptions.battlefieldSize;
  const visibleBattleLog = Array.isArray(log) ? log.filter(isCombatLogEntry) : [];
  const terrainEffectMap = gameOptions.terrainEffectsEnabled ? battlefieldTerrain : [];
  const inspectedTerrainType = inspectedUnit ? getTerrainAt(battlefieldTerrain, inspectedUnit.x, inspectedUnit.y) : null;
  const inspectedTileTerrainType = inspectedTile ? getTerrainAt(battlefieldTerrain, inspectedTile.x, inspectedTile.y) : null;
  const inspectedTileInfo = inspectedTileTerrainType
    ? TERRAIN_MECHANICS_INFO.find((terrainInfo) => terrainInfo.terrain === inspectedTileTerrainType) ?? null
    : null;
  const inspectedEffectiveAttack = inspectedUnit ? getDisplayedAttack(inspectedUnit, currentBattleUnits, terrainEffectMap) : 0;
  const selectedEffectiveAttack = selected ? getDisplayedAttack(selected, currentBattleUnits, terrainEffectMap) : 0;
  const selectedTerrainType = selected ? getTerrainAt(battlefieldTerrain, selected.x, selected.y) : null;
  const selectedEffectiveMove = selected ? (gameOptions.terrainEffectsEnabled ? getEffectiveMove(selected, battlefieldTerrain) : selected.move) : 0;
  const inspectedEffectNotes = inspectedUnit
    ? getUnitEffectNotes(inspectedUnit, currentBattleUnits, battlefieldTerrain, gameOptions.terrainEffectsEnabled)
    : [];
  const selectedEffectNotes = selected
    ? getUnitEffectNotes(selected, currentBattleUnits, battlefieldTerrain, gameOptions.terrainEffectsEnabled)
    : [];
  const useEightByEightViewport = !isBattlefieldFullscreen;
  const useFullscreenNavigationViewport = isBattlefieldFullscreen && battlefieldSize > 14;
  const showGridNavigation = (!isBattlefieldFullscreen && battlefieldSize > 8) || useFullscreenNavigationViewport;
  const levelTeams = getLevelTeams(currentLevel);
  const aliveBattleTeams = getAliveTeams(units);
  const aiTeams = aliveBattleTeams.filter((team) => team !== playerTeam) as TeamName[];
  const activeTeam = gameMode === "multiplayer" ? turn : playerTeam;
  const setupTeamsInPlay = (() => {
    if (gameMode === "multiplayer") return multiplayerTeams;
    if (gameMode === "single-player") return levelTeams;

    const customScenarioTeams = getAliveTeams(customUnits);
    return customScenarioTeams.length > 0 ? customScenarioTeams : [playerTeam];
  })();
  const passiveTeams = (isSetupMode ? setupTeamsInPlay : aliveBattleTeams).filter((team, index, arr) => arr.indexOf(team) === index);
  const setupTeams: TeamName[] = gameMode === "multiplayer" ? [multiplayerTeams[0], multiplayerTeams[1]] : [...ALL_TEAMS];
  const isTeamAllowedInSetup = (team: TeamName) => setupTeams.includes(team);
  const advanceAiTurn = (currentTeam: TeamName) => {
    const nextAiIndex = aiTeams.indexOf(currentTeam);
    if (nextAiIndex >= 0 && nextAiIndex < aiTeams.length - 1) {
      setTurn(aiTeams[nextAiIndex + 1]);
      return;
    }

    setTurn(playerTeam);
    setRound((r) => r + 1);
  };

  const advanceTurn = () => {
    if (gameMode === "multiplayer") {
      if (turn === multiplayerTeams[0]) {
        setTurn(multiplayerTeams[1]);
      } else {
        setTurn(multiplayerTeams[0]);
        setRound((r) => r + 1);
      }
      return;
    }

    setTurn(aiTeams[0] ?? playerTeam);
  };

  // Safety check - don't render if units is not properly initialized
  if (!units || units.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(20, 15, 10, 0.55), rgba(20, 15, 10, 0.68)), url("/gamebkg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="text-white text-xl">Loading formation...</div>
      </div>
    );
  }

  const highlightMove = selected && gameOptions.showMoveHighlights && (isSetupMode ? customUnits : units) ? [...Array(battlefieldSize)].flatMap((_, y) =>
    [...Array(battlefieldSize)].map((_, x) => {
      const distance = Math.abs(x - selected.x) + Math.abs(y - selected.y);
      return (distance <= selectedEffectiveMove && !getUnit(x, y)) ? `${x},${y}` : null;
    }).filter(Boolean)
  ) : [];

  const highlightAttack = selected && gameOptions.showAttackHighlights && (isSetupMode ? customUnits : units) ? [...Array(battlefieldSize)].flatMap((_, y) =>
    [...Array(battlefieldSize)].map((_, x) => {
      const target = getUnit(x, y);
      const distance = Math.abs(x - selected.x) + Math.abs(y - selected.y);
      const canAttackFromRange = target && target.team !== selected.team && distance <= selected.range;
      const canCloseForAttack =
        target && target.team !== selected.team && selected.range === 1 && Boolean(getCloseCombatAttackDestination(selected, target));
      return (canAttackFromRange || canCloseForAttack) ? `${x},${y}` : null;
    }).filter(Boolean)
  ) : [];

  const handleClick = (x: number, y: number) => {
    if (skipNextGridClickRef.current) {
      skipNextGridClickRef.current = false;
      return;
    }

    if (isSetupMode) {
      handleSetupClick(x, y);
      return;
    }
    
    if (!gameStarted || turn !== activeTeam || !units) return;
    
    const clicked = getUnit(x, y);

    if (clicked && clicked.id === selectedId && !mergeMode) {
      setInspectedTile(null);
      setInspectedUnitId(clicked.id);
      return;
    }

    if (clicked && clicked.team === activeTeam) {
      if (mergeMode) {
        // In merge mode, select first troop for merging
        if (!selectedForMerge) {
          setSelectedForMerge(clicked);
          setLog((prevLog) => [`Selected ${clicked.name} for merging. Click on another ${clicked.role} to merge.`, ...prevLog]);
        } else if (selectedForMerge.id !== clicked.id && selectedForMerge.role === clicked.role) {
          // Check if troops are adjacent
          if (!areAdjacent(selectedForMerge, clicked)) {
            setLog((prevLog) => [`Troops must be adjacent to merge! Move them next to each other first.`, ...prevLog]);
            setSelectedForMerge(null);
            setMergeMode(false);
            setSelectedId(null);
            return;
          }
          
          // Second troop selected, perform merge
          if (mergeCount < 3) {
            const mergedTroop = {
              ...selectedForMerge,
              hp: Math.min(selectedForMerge.hp + clicked.hp, selectedForMerge.maxHp + clicked.maxHp),
              maxHp: selectedForMerge.maxHp + clicked.maxHp,
              attack: Math.floor((selectedForMerge.attack + clicked.attack) * 1),
              range: Math.max(selectedForMerge.range, clicked.range),
              move: Math.max(selectedForMerge.move, clicked.move),
              ammo: Math.max(selectedForMerge.ammo || 0, clicked.ammo || 0),
              id: `merged_${selectedForMerge.role}_${Date.now()}`,
              name: `Elite ${selectedForMerge.role}`
            };
            
            // Remove both original troops and add merged troop
            setUnits((prev) => {
              const filtered = prev.filter((u: any) => u.id !== selectedForMerge.id && u.id !== clicked.id);
              return [...filtered, mergedTroop];
            });
            
            setMergeCount(prev => prev + 1);
            setLog((prevLog) => [`Merged ${selectedForMerge.name} and ${clicked.name} into Elite ${mergedTroop.role}! (${3 - mergeCount - 1} merges remaining)`, ...prevLog]);
            
            // Reset merge state
            setSelectedForMerge(null);
            setMergeMode(false);
            setSelectedId(null);
          } else {
            setLog((prevLog) => [`No more merges allowed this game!`, ...prevLog]);
            setSelectedForMerge(null);
            setMergeMode(false);
            setSelectedId(null);
          }
        } else if (selectedForMerge.role !== clicked.role) {
          setLog((prevLog) => [`Can only merge troops of the same role! Selected: ${selectedForMerge.role}, Clicked: ${clicked.role}`, ...prevLog]);
          setSelectedForMerge(null);
          setMergeMode(false);
          setSelectedId(null);
        } else {
          setLog((prevLog) => [`Cannot merge the same troop with itself!`, ...prevLog]);
          setSelectedForMerge(null);
          setMergeMode(false);
          setSelectedId(null);
        }
      } else {
        // Normal selection mode
        setInspectedTile(null);
        setSelectedId(clicked.id);
      }
    } else if (selected) {
      const meleeAttackDestination = clicked && clicked.team !== selected.team && selected.range === 1 && !isInRange(selected, clicked, selected.range)
        ? getCloseCombatAttackDestination(selected, clicked)
        : null;

      if (clicked && clicked.team !== selected.team && (isInRange(selected, clicked, selected.range) || meleeAttackDestination)) {
        // Check if target is alive
        if (clicked.hp <= 0) {
          setLog((prevLog) => [`${clicked.name} is already dead!`, ...prevLog]);
          return;
        }

        if (meleeAttackDestination) {
          selected.x = meleeAttackDestination.x;
          selected.y = meleeAttackDestination.y;
        }
        
        // Attack enemy with troop-mechanic matchup bonus
        const attackOutcome = getAttackDamage(selected, clicked, units, terrainEffectMap);
        const dmg = attackOutcome.damage;
        clicked.hp -= dmg;
        
        // If this is a ranged attack, reduce ammunition
        if (selected.ammo && selected.ammo > 0) {
          selected.ammo -= 1;
          setLog((prevLog) => [
            `${selected.name} (${selected.team}) attacked ${clicked.name} (${clicked.team}) for ${dmg}${attackOutcome.hasTerrainModifier ? ` [${attackOutcome.terrainLabel}]` : ""}${attackOutcome.hasLeaderAura ? " [Leader Aura]" : ""}${attackOutcome.hasAdvantage ? ` [${TROOP_MECHANIC_LABELS[attackOutcome.attackerType]} > ${TROOP_MECHANIC_LABELS[attackOutcome.defenderType]}]` : ""} (${selected.ammo} shots remaining)`,
            ...prevLog
          ]);
          
          // If out of ammo, switch to melee
          if (selected.ammo === 0) {
            selected.range = 1; // Switch to melee range
            setLog((prevLog) => [`${selected.name} is out of ammo! Switching to melee combat.`, ...prevLog]);
          }
        } else {
          setLog((prevLog) => [
            `${selected.name} (${selected.team})${meleeAttackDestination ? " closed in and" : ""} attacked ${clicked.name} (${clicked.team}) for ${dmg}${attackOutcome.hasTerrainModifier ? ` [${attackOutcome.terrainLabel}]` : ""}${attackOutcome.hasLeaderAura ? " [Leader Aura]" : ""}${attackOutcome.hasAdvantage ? ` [${TROOP_MECHANIC_LABELS[attackOutcome.attackerType]} > ${TROOP_MECHANIC_LABELS[attackOutcome.defenderType]}]` : ""}`,
            ...prevLog
          ]);
        }
        
        // Check if target was killed
        if (clicked.hp <= 0) {
          setLog((prevLog) => [`${clicked.name} (${clicked.team}) was killed!`, ...prevLog]);
          // Immediately remove dead unit
          setUnits((prev) => prev.filter((u: any) => u.hp > 0));
        }
        
        setSelectedId(null);
        advanceTurn();
      } else if (!clicked && isInRange(selected, { x, y }, selectedEffectiveMove)) {
        // Move to empty space
        setUnits((prev) => prev.map((u: any) => u.id === selected.id ? { ...u, x, y } : u));
        setLog((prevLog) => [`${selected.name} (${selected.team}) moved onto ${TERRAIN_LABELS[getTerrainAt(battlefieldTerrain, x, y)]}`, ...prevLog]);
        setInspectedTile(null);
        setSelectedId(null);
        advanceTurn();
      } else if (!clicked) {
        setInspectedUnitId(null);
        setInspectedTile({ x, y });
      }
    } else if (!clicked) {
      setInspectedUnitId(null);
      setInspectedTile({ x, y });
    }
  };

  const handleSetupClick = (x: number, y: number) => {
    if (draggedTroop) {
      if (!isTeamAllowedInSetup(selectedTeam)) return;
      // Check if position is valid (not occupied)
      if (!getUnit(x, y)) {
        // Check team limits
        const teamCount = customUnits.filter(u => u.team === selectedTeam).length;
        if (teamCount < 16) {
          const stats = generateTroopStats(draggedTroop.role);
          const newTroop = {
            ...draggedTroop,
            ...stats,
            id: `${selectedTeam}_${draggedTroop.role}_${Date.now()}`,
            team: selectedTeam,
            x,
            y,
            Icon: draggedTroop.Icon
          };
          
          setCustomUnits(prev => [...prev, applyCivilizationPassive(newTroop)]);
          setDraggedTroop(null);
          setInspectedTile(null);
        }
      }
    } else {
      // Select existing unit for removal
      const existingUnit = getUnit(x, y);
      if (existingUnit) {
        setCustomUnits(prev => prev.filter(u => u.id !== existingUnit.id));
      } else {
        setInspectedUnitId(null);
        setInspectedTile({ x, y });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    if (draggedTroop) {
      if (!isTeamAllowedInSetup(selectedTeam)) return;
      // Check if position is valid (not occupied)
      if (!getUnit(x, y)) {
        // Check team limits
        const teamCount = customUnits.filter(u => u.team === selectedTeam).length;
        if (teamCount < 16) {
          const stats = generateTroopStats(draggedTroop.role);
          const newTroop = {
            ...draggedTroop,
            ...stats,
            id: `${selectedTeam}_${draggedTroop.role}_${Date.now()}`,
            team: selectedTeam,
            x,
            y,
            Icon: draggedTroop.Icon
          };
          
          setCustomUnits(prev => [...prev, applyCivilizationPassive(newTroop)]);
          setDraggedTroop(null);
        }
      }
    } else if (isSetupMode) {
      // Handle troop removal in setup mode
      const existingUnit = getUnit(x, y);
      if (existingUnit) {
        setCustomUnits(prev => prev.filter(u => u.id !== existingUnit.id));
      }
    } else if (!isSetupMode && mergeMode) {
      // Handle troop merging only in formation mode
      const existingUnit = getUnit(x, y);
      const draggedUnit = units?.find(u => u.id === selectedId);
      
      if (draggedUnit && ALL_TEAMS.includes(draggedUnit.team as TeamName)) {
        if (!existingUnit) {
          // Select first troop for merging
          setSelectedForMerge(draggedUnit);
          setLog((prevLog) => [`Selected ${draggedUnit.name} for merging. Now drag another ${draggedUnit.role} onto it to merge.`, ...prevLog]);
        } else if (existingUnit.team === draggedUnit.team && existingUnit.role === draggedUnit.role && existingUnit.id !== draggedUnit.id) {
          // Check if troops are adjacent
          const dx = Math.abs(draggedUnit.x - existingUnit.x);
          const dy = Math.abs(draggedUnit.y - existingUnit.y);
          const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
          
          if (isAdjacent && mergeCount < 2) {
            const mergedTroop = {
              ...draggedUnit,
              hp: Math.min(draggedUnit.hp + existingUnit.hp, draggedUnit.maxHp + existingUnit.maxHp),
              maxHp: draggedUnit.maxHp + existingUnit.maxHp,
              attack: Math.floor((draggedUnit.attack + existingUnit.attack) * 1.2),
              range: Math.max(draggedUnit.range, existingUnit.range),
              move: Math.max(draggedUnit.move, existingUnit.move),
              ammo: Math.max(draggedUnit.ammo || 0, existingUnit.ammo || 0),
              id: `merged_${draggedUnit.role}_${Date.now()}`,
              name: `Elite ${draggedUnit.role}`,
              x,
              y
            };
            
            // Remove both original troops and add merged troop
            setUnits((prev) => {
              const filtered = prev.filter((u: any) => u.id !== draggedUnit.id && u.id !== existingUnit.id);
              return [...filtered, mergedTroop];
            });
            
            setMergeCount(prev => prev + 1);
            setLog((prevLog) => [`Merged ${draggedUnit.name} and ${existingUnit.name} into Elite ${draggedUnit.role}! (${2 - mergeCount - 1} merges remaining)`, ...prevLog]);
            
            setSelectedId(null);
            setSelectedForMerge(null);
            setMergeMode(false);
          } else if (!isAdjacent) {
            setLog((prevLog) => [`Troops must be adjacent to merge!`, ...prevLog]);
          } else {
            setLog((prevLog) => [`No more merges allowed this game!`, ...prevLog]);
          }
        } else if (existingUnit.team === draggedUnit.team && existingUnit.role === draggedUnit.role && existingUnit.id === draggedUnit.id) {
          setLog((prevLog) => [`Cannot merge a troop with itself!`, ...prevLog]);
        } else if (existingUnit.team === draggedUnit.team && existingUnit.role !== draggedUnit.role) {
          setLog((prevLog) => [`Can only merge troops of the same role!`, ...prevLog]);
        } else if (existingUnit.team !== draggedUnit.team) {
          setLog((prevLog) => [`Cannot merge with enemy troops!`, ...prevLog]);
        }
      }
    }
  };

  const startCustomGame = () => {
    if (customUnits.length === 0) return;
    const playerUnits = customUnits.filter((u: any) => u.team === playerTeam).length;
    const enemyUnits = customUnits.filter((u: any) => u.team !== playerTeam).length;
    if (playerUnits === 0 || enemyUnits === 0) {
      setLog((prev) => [`${playerTeam} needs at least 1 troop and there must be at least 1 enemy troop before starting.`, ...prev]);
      return;
    }
    
    setIsSetupMode(false);
    setUnits(prepareUnitsForBattle(customUnits));
    setTurn(playerTeam);
    setRound(1);
    setSelectedId(null);
    setGameStarted(true);
    setMergeCount(0); // Reset merge count for new game
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const startSinglePlayerBattle = () => {
    const nextPlayerTeam = getValidLevelPlayerTeam(currentLevel, playerTeam);
    setPlayerTeam(nextPlayerTeam);
    setTurn(nextPlayerTeam);
    setRound(1);
    setSelectedId(null);
    setLog([]);
    setGameStarted(true);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const resetCustomSetup = () => {
    setCustomUnits([]);
    setDraggedTroop(null);
    setSelectedTeam(gameMode === "multiplayer" ? multiplayerTeams[0] : playerTeam);
    setGridOrientation("north");
  };

  const startSinglePlayerMode = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setGridOrientation("north");
    setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
    const nextPlayerTeam = getValidLevelPlayerTeam(currentLevel, playerTeam);
    setGameMode("single-player");
    setIsSetupMode(false);
    setUnits(prepareUnitsForBattle(levels[currentLevel]));
    setPlayerTeam(nextPlayerTeam);
    setTurn(nextPlayerTeam);
    setRound(1);
    setSelectedId(null);
    setLog([]);
    setGameStarted(false);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const startMultiplayerMode = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setGridOrientation("north");
    setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
    setGameMode("multiplayer");
    setIsSetupMode(true);
    setUnits(prepareUnitsForBattle(levels[currentLevel]));
    setCustomUnits([]);
    setSelectedTeam(multiplayerTeams[0]);
    setTurn(multiplayerTeams[0]);
    setRound(1);
    setSelectedId(null);
    setLog(["Multiplayer setup: choose 2 teams, place troops, then start."]);
    setGameStarted(false);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const startMultiplayerGame = () => {
    if (customUnits.length === 0) return;
    const teamAUnits = customUnits.filter((u: any) => u.team === multiplayerTeams[0]).length;
    const teamBUnits = customUnits.filter((u: any) => u.team === multiplayerTeams[1]).length;
    if (teamAUnits === 0 || teamBUnits === 0) {
      setLog((prev) => [`Both selected teams need at least 1 troop before starting.`, ...prev]);
      return;
    }

    setIsSetupMode(false);
    setUnits(prepareUnitsForBattle(customUnits));
    setTurn(multiplayerTeams[0]);
    setRound(1);
    setGameStarted(true);
    setMergeCount(0);
  };

  const startCustomScenarioMode = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setGridOrientation("north");
    setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
    setGameMode("custom-scenario");
    setIsSetupMode(true);
    setTurn(playerTeam);
    setRound(1);
    setSelectedId(null);
    setLog([]);
    setGameStarted(false);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
    resetCustomSetup();
  };

  const backToMainMenu = () => {
    setStartScreen("menu");
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setGameMode(null);
    setIsSetupMode(false);
    setCurrentLevel("Level1");
    setUnits(prepareUnitsForBattle(levels["Level1"]));
    setCustomUnits([]);
    setDraggedTroop(null);
    setSelectedTeam("Romans");
    setPlayerTeam("Romans");
    setSelectedId(null);
    setTurn("Romans");
    setRound(1);
    setLog([]);
    setGameStarted(false);
    setMergeMode(false);
    setMergeCount(0);
    setSelectedForMerge(null);
    setMultiplayerTeams(["Romans", "Barbarians"]);
    setGridOrientation("north");
    setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const restartCurrentGame = () => {
    if (gameMode === "single-player") {
      const nextPlayerTeam = getValidLevelPlayerTeam(currentLevel, playerTeam);
      setIsGameMenuOpen(false);
      setIsInGameOptionsOpen(false);
      setIsInGameMechanicsOpen(false);
      setIsInGameGraphicsOpen(false);
      setGridOrientation("north");
      setGameMode("single-player");
      setIsSetupMode(false);
      setUnits(rerollUnits(levels[currentLevel]));
      setPlayerTeam(nextPlayerTeam);
      setTurn(nextPlayerTeam);
      setRound(1);
      setSelectedId(null);
      setLog([]);
      setGameStarted(false);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
      return;
    }

    if (gameMode === "multiplayer") {
      const rerolledCustomUnits = rerollUnits(customUnits);
      setIsGameMenuOpen(false);
      setIsInGameOptionsOpen(false);
      setIsInGameMechanicsOpen(false);
      setIsInGameGraphicsOpen(false);
      setGridOrientation("north");
      setGameMode("multiplayer");
      setIsSetupMode(true);
      setUnits(rerollUnits(levels[currentLevel]));
      setCustomUnits(rerolledCustomUnits);
      setSelectedTeam(multiplayerTeams[0]);
      setTurn(multiplayerTeams[0]);
      setRound(1);
      setSelectedId(null);
      setLog(["Multiplayer setup: choose 2 teams, place troops, then start."]);
      setGameStarted(false);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
      return;
    }

    if (gameMode === "custom-scenario") {
      setIsGameMenuOpen(false);
      setIsInGameOptionsOpen(false);
      setIsInGameMechanicsOpen(false);
      setIsInGameGraphicsOpen(false);
      setGridOrientation("north");
      setGameMode("custom-scenario");
      setIsSetupMode(true);
      setCustomUnits(rerollUnits(customUnits));
      setTurn(playerTeam);
      setRound(1);
      setSelectedId(null);
      setLog([]);
      setGameStarted(false);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
    }
  };

  const toggleBattlefieldFullscreen = async () => {
    if (!battlefieldRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await battlefieldRef.current.requestFullscreen();
    }
  };

  const getTeamCount = (team: string) => {
    return customUnits.filter(u => u.team === team).length;
  };

  const getAutoDeployUnitCount = (size: BattlefieldSize) => {
    if (size <= 8) return 12;
    if (size <= 10) return 14;
    if (size <= 14) return 16;
    return 18;
  };

  const getCompactDeploymentSlots = (
    count: number,
    size: BattlefieldSize,
    side: "top" | "bottom"
  ) => {
    const columns = Math.min(6, Math.max(2, Math.ceil(Math.sqrt(count))));
    const rows = Math.ceil(count / columns);
    const startX = Math.max(0, Math.floor((size - columns) / 5));
    const startY = side === "top" ? 0 : Math.max(0, size - rows - 0);

    return Array.from({ length: count }, (_, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      return {
        x: startX + column,
        y: startY + row
      };
    });
  };

  const getCustomAutoDeployOpponent = () =>
    selectedTeam !== playerTeam
      ? selectedTeam
      : ALL_TEAMS.find((team) => team !== playerTeam) ?? "Barbarians";

  const createAutoDeployedArmy = (
    team: TeamName,
    side: "top" | "bottom",
    size: BattlefieldSize
  ) => {
    const availableTroops = AVAILABLE_TROOPS[team];
    const unitCount = Math.min(getAutoDeployUnitCount(size), availableTroops.length, 16);
    const chosenTroops = availableTroops.slice(0, unitCount);
    const slots = getCompactDeploymentSlots(chosenTroops.length, size, side);

    return chosenTroops.map((troop, index) => {
      const stats = generateTroopStats(troop.role);
      const slot = slots[index];

      return applyCivilizationPassive({
        ...troop,
        ...stats,
        id: `${team}_${troop.role}_${side}_${index}_${Date.now()}`,
        team,
        x: slot.x,
        y: slot.y,
        Icon: troop.Icon
      });
    });
  };

  const autoDeployCustomBattle = () => {
    const enemyTeam = getCustomAutoDeployOpponent();
    const deployedPlayerArmy = createAutoDeployedArmy(playerTeam, "bottom", battlefieldSize);
    const deployedEnemyArmy = createAutoDeployedArmy(enemyTeam, "top", battlefieldSize);

    setCustomUnits([...deployedEnemyArmy, ...deployedPlayerArmy]);
    setSelectedTeam(playerTeam);
    setDraggedTroop(null);
    setSelectedId(null);
    setLog((prev) => [
      `Auto deployed ${playerTeam} versus ${enemyTeam} in tight formations on opposite sides.`,
      ...prev
    ]);
  };

  // Check if two troops are adjacent
  const areAdjacent = (troop1: any, troop2: any) => {
    const dx = Math.abs(troop1.x - troop2.x);
    const dy = Math.abs(troop1.y - troop2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  // Automatic movement for AI teams - one unit at a time
  useEffect(() => {
    if (isSetupMode || gameMode === "multiplayer" || !aiTeams.includes(turn as TeamName) || !units) return;
    
    const timeout = setTimeout(() => {
      const currentTeam = turn;
      const enemies = units.filter((u: any) => u.team === currentTeam);
      const players = units.filter((u: any) => u.team !== currentTeam);
      
      if (enemies.length === 0 || players.length === 0) {
        advanceAiTurn(currentTeam as TeamName);
        return;
      }

      // Find the current team's unit that's closest to any enemy
      let bestEnemy = enemies[0];
      let bestDistance = Infinity;
      
      enemies.forEach((enemy) => {
        const closestPlayer = players.reduce((prev, curr) => {
          const prevDist = Math.abs(enemy.x - prev.x) + Math.abs(enemy.y - prev.y);
          const currDist = Math.abs(enemy.x - curr.x) + Math.abs(enemy.y - curr.y);
          return currDist < prevDist ? curr : prev;
        });
        
        const distance = Math.abs(enemy.x - closestPlayer.x) + Math.abs(enemy.y - closestPlayer.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestEnemy = enemy;
        }
      });
      
      // Move or attack with the best unit
      const target = players.reduce((prev, curr) => {
        const prevDist = Math.abs(bestEnemy.x - prev.x) + Math.abs(bestEnemy.y - prev.y);
        const currDist = Math.abs(bestEnemy.x - curr.x) + Math.abs(bestEnemy.y - curr.y);
        return currDist < prevDist ? curr : prev;
      });
      
      // Check if target is alive
      if (target.hp <= 0) {
        advanceAiTurn(currentTeam as TeamName);
        return;
      }
      
      const distX = target.x - bestEnemy.x;
      const distY = target.y - bestEnemy.y;
      
      if (Math.abs(distX) + Math.abs(distY) <= bestEnemy.range) {
        // Attack if in range
        const attackOutcome = getAttackDamage(bestEnemy, target, units, terrainEffectMap);
        target.hp -= attackOutcome.damage;
        
        // Check if target was killed
        if (target.hp <= 0) {
          setLog((log) => [`${target.name} (${target.team}) was killed by ${bestEnemy.name} (${currentTeam})!`, ...log]);
          // Immediately remove dead unit
          setUnits((prev) => prev.filter((u: any) => u.hp > 0));
        }
        
        // If this is a ranged attack, reduce ammunition
        if (bestEnemy.ammo && bestEnemy.ammo > 0) {
          bestEnemy.ammo -= 1;
          setLog((log) => [
            `${bestEnemy.name} (${currentTeam}) attacked ${target.name} (${target.team}) for ${attackOutcome.damage}${attackOutcome.hasTerrainModifier ? ` [${attackOutcome.terrainLabel}]` : ""}${attackOutcome.hasLeaderAura ? " [Leader Aura]" : ""}${attackOutcome.hasAdvantage ? ` [${TROOP_MECHANIC_LABELS[attackOutcome.attackerType]} > ${TROOP_MECHANIC_LABELS[attackOutcome.defenderType]}]` : ""} (${bestEnemy.ammo} shots remaining)`,
            ...log
          ]);
          
          // If out of ammo, switch to melee
          if (bestEnemy.ammo === 0) {
            bestEnemy.range = 1; // Switch to melee range
            setLog((log) => [`${bestEnemy.name} is out of ammo! Switching to melee combat.`, ...log]);
          }
        } else {
          setLog((log) => [
            `${bestEnemy.name} (${currentTeam}) attacked ${target.name} (${target.team}) for ${attackOutcome.damage}${attackOutcome.hasTerrainModifier ? ` [${attackOutcome.terrainLabel}]` : ""}${attackOutcome.hasLeaderAura ? " [Leader Aura]" : ""}${attackOutcome.hasAdvantage ? ` [${TROOP_MECHANIC_LABELS[attackOutcome.attackerType]} > ${TROOP_MECHANIC_LABELS[attackOutcome.defenderType]}]` : ""}`,
            ...log
          ]);
        }
      } else {
        // Move towards enemy
        const effectiveMove = gameOptions.terrainEffectsEnabled ? getEffectiveMove(bestEnemy, battlefieldTerrain) : bestEnemy.move;
        let newX = bestEnemy.x;
        let newY = bestEnemy.y;

        for (let step = 0; step < effectiveMove; step += 1) {
          const remainingDistX = target.x - newX;
          const remainingDistY = target.y - newY;
          let moveX = 0;
          let moveY = 0;

          if (Math.abs(remainingDistX) > Math.abs(remainingDistY)) {
            moveX = Math.sign(remainingDistX);
          } else {
            moveY = Math.sign(remainingDistY);
          }

          const candidateX = newX + moveX;
          const candidateY = newY + moveY;
          const alreadyOccupied = units.some((u: any) => u.id !== bestEnemy.id && u.x === candidateX && u.y === candidateY);

          if (!isWithinBattlefield(candidateX, candidateY) || alreadyOccupied) break;

          newX = candidateX;
          newY = candidateY;
        }

        if (newX !== bestEnemy.x || newY !== bestEnemy.y) {
          bestEnemy.x = newX;
          bestEnemy.y = newY;
          const terrainLabel = TERRAIN_LABELS[getTerrainAt(battlefieldTerrain, newX, newY)];
          setLog((log) => [`${bestEnemy.name} (${currentTeam}) moved onto ${terrainLabel}`, ...log]);
        }
      }
      
      setUnits([...units].filter((u: any) => u.hp > 0));
      
      advanceAiTurn(currentTeam as TeamName);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [turn, units, isSetupMode, gameMode, aiTeams, playerTeam, battlefieldTerrain]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsBattlefieldFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      battlefieldPanCleanupRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!showGridNavigation || !hoverScrollDirection || isPanningGrid) return;

    const viewport = battlefieldViewportRef.current;
    if (!viewport) return;

    const interval = window.setInterval(() => {
      const verticalAmount = 24;
      const horizontalAmount = 40;
      if (hoverScrollDirection === "up") viewport.scrollBy({ top: -verticalAmount });
      if (hoverScrollDirection === "down") viewport.scrollBy({ top: verticalAmount });
      if (hoverScrollDirection === "left") viewport.scrollBy({ left: -horizontalAmount });
      if (hoverScrollDirection === "right") viewport.scrollBy({ left: horizontalAmount });
    }, 30);

    return () => window.clearInterval(interval);
  }, [hoverScrollDirection, isPanningGrid, showGridNavigation]);

  const checkEnd = () => {
    const currentUnits = isSetupMode ? customUnits : units;
    if (!currentUnits || currentUnits.length === 0) return null;

    if (gameMode === "multiplayer") {
      const teamA = multiplayerTeams[0];
      const teamB = multiplayerTeams[1];
      const teamALeft = currentUnits.some((u: any) => u.team === teamA);
      const teamBLeft = currentUnits.some((u: any) => u.team === teamB);
      if (!teamALeft && !teamBLeft) return "Game Over - Both teams eliminated!";
      if (!teamALeft) return `Victory - ${teamB} Win!`;
      if (!teamBLeft) return `Victory - ${teamA} Win!`;
      return null;
    }
    
    const teamsStillAlive = ALL_TEAMS.filter((team) => currentUnits.some((u: any) => u.team === team));

    if (teamsStillAlive.length === 0) return "Game Over - All teams eliminated!";
    if (teamsStillAlive.length === 1) return `Victory - ${teamsStillAlive[0]} Win!`;

    return null;
  };

  const toggleOption = (option: keyof GameOptions) => {
    setGameOptions((prev) => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const isTerrainLocked = gameStarted && !isSetupMode;

  const setBattlefieldSize = (size: BattlefieldSize) => {
    setGameOptions((prev) => ({
      ...prev,
      battlefieldSize: size
    }));
    setBattlefieldTerrain(generateTerrainMap(size, terrainPreset, terrainGenerationSettings));
  };

  const regenerateTerrain = () => {
    if (isTerrainLocked) {
      setLog((prev) => ["Terrain cannot be changed after the battle starts.", ...prev]);
      return;
    }

    setBattlefieldTerrain(generateTerrainMap(battlefieldSize, terrainPreset, terrainGenerationSettings));
    setLog((prev) => [
      terrainPreset === "mixed"
        ? "Battlefield terrain regenerated."
        : `Battlefield terrain set to pure ${TERRAIN_LABELS[terrainPreset]}.`,
      ...prev
    ]);
  };

  const changeTerrainPreset = (nextPreset: TerrainPreset) => {
    if (isTerrainLocked) {
      setLog((prev) => ["Terrain cannot be changed after the battle starts.", ...prev]);
      return;
    }

    setTerrainPreset(nextPreset);
    setBattlefieldTerrain(generateTerrainMap(battlefieldSize, nextPreset, terrainGenerationSettings));
    setLog((prev) => [
      nextPreset === "mixed"
        ? "Terrain mode changed to mixed terrain."
        : `Terrain mode changed to pure ${TERRAIN_LABELS[nextPreset]}.`,
      ...prev
    ]);
  };

  const toggleGeneratedTerrainType = (terrainType: TerrainType) => {
    if (isTerrainLocked) {
      setLog((prev) => ["Terrain cannot be changed after the battle starts.", ...prev]);
      return;
    }

    const enabledTypes = getEnabledTerrainTypes(terrainGenerationSettings);
    const willDisable = terrainGenerationSettings[terrainType];

    if (willDisable && enabledTypes.length === 1) {
      setLog((prev) => ["At least one terrain type must stay enabled for mixed generation.", ...prev]);
      return;
    }

    const nextSettings = {
      ...terrainGenerationSettings,
      [terrainType]: !terrainGenerationSettings[terrainType]
    };

    setTerrainGenerationSettings(nextSettings);

    if (terrainPreset === "mixed") {
      setBattlefieldTerrain(generateTerrainMap(battlefieldSize, "mixed", nextSettings));
    }

    const desertIsIsolated = terrainType === "desert" && nextSettings.desert && getEnabledTerrainTypes(nextSettings).length > 1;

    setLog((prev) => [
      desertIsIsolated
        ? "Desert stays isolated and will only generate if it is the only mixed biome enabled."
        : `${TERRAIN_LABELS[terrainType]} ${nextSettings[terrainType] ? "enabled" : "disabled"} for mixed terrain generation.`,
      ...prev
    ]);
  };

  const canRotateTroops = isSetupMode || (!isSetupMode && !gameStarted);

  const rotateTroopsTo = (targetOrientation: GridOrientation) => {
    const rotationSteps = getOrientationRotationSteps(gridOrientation, targetOrientation);
    if (rotationSteps === 0) return;

    if (isSetupMode) {
      setCustomUnits((prev) => rotateUnitCoordinates(prev, rotationSteps, battlefieldSize));
      setLog((prev) => [`Setup troops rotated to face ${targetOrientation}.`, ...prev]);
    } else if (!gameStarted) {
      setUnits((prev) => rotateUnitCoordinates(prev, rotationSteps, battlefieldSize));
      setLog((prev) => [`Battlefield troops rotated to face ${targetOrientation}.`, ...prev]);
    }

    setGridOrientation(targetOrientation);
  };

  const openInGameOptions = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(true);
  };

  const openInGameMechanics = () => {
    setIsGameMenuOpen(false);
    setIsInGameMechanicsOpen(true);
  };

  const openInGameGraphics = () => {
    setIsGameMenuOpen(false);
    setIsInGameGraphicsOpen(true);
  };

  const renderGameOptionsContent = () => (
    <div className="space-y-4">
      <div className="text-left bg-black bg-opacity-20 rounded-lg border border-yellow-700 p-4">
        <h3 className="text-yellow-200 font-bold mb-3 text-lg border-b border-yellow-600 pb-2">Game Options</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => toggleOption("musicEnabled")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.musicEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.musicEnabled ? "Music: On" : "Music: Off"}
          </button>
          <button
            onClick={() => toggleOption("showMoveHighlights")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showMoveHighlights ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showMoveHighlights ? "Move Highlights: On" : "Move Highlights: Off"}
          </button>
          <button
            onClick={() => toggleOption("showAttackHighlights")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showAttackHighlights ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showAttackHighlights ? "Attack Highlights: On" : "Attack Highlights: Off"}
          </button>
          <button
            onClick={() => toggleOption("showBattleLog")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showBattleLog ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showBattleLog ? "Battle Log: On" : "Battle Log: Off"}
          </button>
          <button
            onClick={() => toggleOption("showTurnBanner")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showTurnBanner ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showTurnBanner ? "Turn Banner: On" : "Turn Banner: Off"}
          </button>
          <button
            onClick={() => toggleOption("showUnitPanel")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showUnitPanel ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showUnitPanel ? "Unit Panel: On" : "Unit Panel: Off"}
          </button>
          <div className="bg-black bg-opacity-20 border border-yellow-700 rounded-lg px-4 py-3">
            <label htmlFor="battlefield-size" className="block text-yellow-200 text-sm font-semibold mb-2">
              Battlefield Size
            </label>
            <select
              id="battlefield-size"
              value={gameOptions.battlefieldSize}
              onChange={(e) => setBattlefieldSize(Number(e.target.value) as BattlefieldSize)}
              className="w-full bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
            >
              {BATTLEFIELD_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size} x {size}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGraphicsContent = () => (
    <div className="space-y-4">
      <div className="text-left bg-black bg-opacity-20 rounded-lg border border-yellow-700 p-4">
        <h3 className="text-yellow-200 font-bold mb-3 text-lg border-b border-yellow-600 pb-2">Graphics</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => toggleOption("terrainEffectsEnabled")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.terrainEffectsEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.terrainEffectsEnabled ? "Terrain Effects: On" : "Terrain Effects: Off"}
          </button>
          <div className="bg-black bg-opacity-20 border border-yellow-700 rounded-lg px-4 py-3">
            <label htmlFor="terrain-preset" className="block text-yellow-200 text-sm font-semibold mb-2">
              Terrain Mode
            </label>
            <select
              id="terrain-preset"
              value={terrainPreset}
              onChange={(e) => changeTerrainPreset(e.target.value as TerrainPreset)}
              disabled={isTerrainLocked}
              className="w-full bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="mixed">Mixed Terrain</option>
              <option value="plain">Pure Plain</option>
              <option value="forest">Pure Forest</option>
              <option value="hill">Pure Hill</option>
              <option value="desert">Pure Desert</option>
            </select>
          </div>
          <div className="bg-black bg-opacity-20 border border-yellow-700 rounded-lg px-4 py-3">
            <div className="block text-yellow-200 text-sm font-semibold mb-2">
              Mixed Terrain Pool
            </div>
            <div className="grid gap-2">
              {TERRAIN_TYPES.map((terrainType) => (
                <button
                  key={terrainType}
                  type="button"
                  onClick={() => toggleGeneratedTerrainType(terrainType)}
                  disabled={isTerrainLocked}
                  aria-pressed={terrainGenerationSettings[terrainType]}
                  className={`battle-button flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold ${
                    terrainGenerationSettings[terrainType]
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-gray-700 hover:bg-gray-800"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span>{TERRAIN_LABELS[terrainType]}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${
                      terrainGenerationSettings[terrainType]
                        ? "border-emerald-300 bg-emerald-200/20 text-emerald-100"
                        : "border-gray-400 bg-black/20 text-gray-200"
                    }`}
                  >
                    {terrainGenerationSettings[terrainType] ? "On" : "Off"}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-yellow-100 mt-2 opacity-80">
              Choose which biomes mixed generation can use. Mixed maps use up to 2 terrains on 8x8-10x10, up to 3 on 12x12-16x16, and up to 4 on larger battlefields. Desert stays isolated and only appears when it is the only enabled mixed biome.
            </p>
          </div>
          <button
            onClick={regenerateTerrain}
            disabled={isTerrainLocked}
            className="battle-button w-full px-4 py-3 text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Regenerate Terrain
          </button>
          {isTerrainLocked && (
            <p className="text-xs text-yellow-100 opacity-80">
              Terrain is locked once the battle has started.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderMechanicsContent = () => (
    <div className="text-left bg-black bg-opacity-20 rounded-lg border border-yellow-700 p-4">
      <h3 className="text-yellow-200 font-bold mb-3 text-lg border-b border-yellow-600 pb-2">Mechanics of the Game</h3>
      <div className="grid gap-3">
        {GAME_MECHANICS_INFO.map((mechanic) => (
          <div key={mechanic.title} className="rounded-lg border border-yellow-700 bg-black bg-opacity-20 px-4 py-3">
            <div className="text-yellow-200 font-semibold text-sm sm:text-base">{mechanic.title}</div>
            <p className="text-yellow-100 text-sm mt-1 leading-relaxed">{mechanic.description}</p>
          </div>
        ))}
        <div className="rounded-lg border border-yellow-700 bg-black bg-opacity-20 px-4 py-3">
          <div className="text-yellow-200 font-semibold text-sm sm:text-base">Troop Type Reference</div>
          <p className="text-yellow-100 text-sm mt-1 leading-relaxed">
            Every unit belongs to one battlefield type. Matchups and terrain bonuses are built around these roles.
          </p>
          <div className="grid gap-3 mt-3">
            {TROOP_MECHANICS_INFO.map((troopInfo) => (
              <div key={troopInfo.type} className="rounded-lg border border-yellow-700/60 bg-black/20 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-yellow-200 font-semibold">
                    <span className="text-cyan-300 mr-2">{TROOP_MECHANIC_ICONS[troopInfo.type]}</span>
                    {TROOP_MECHANIC_LABELS[troopInfo.type]}
                  </div>
                  <span className="rounded-full border border-yellow-700 bg-black/20 px-2 py-0.5 text-[11px] uppercase tracking-wide text-yellow-100">
                    {troopInfo.type}
                  </span>
                </div>
                <p className="text-yellow-100 text-sm mt-1">{troopInfo.summary}</p>
                <div className="mt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Pros</div>
                  <div className="mt-1 space-y-1">
                    {troopInfo.pros.map((pro) => (
                      <p key={pro} className="text-xs text-lime-200 leading-relaxed">{pro}</p>
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-rose-200">Cons</div>
                  <div className="mt-1 space-y-1">
                    {troopInfo.cons.map((con) => (
                      <p key={con} className="text-xs text-yellow-100 leading-relaxed">{con}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-yellow-700 bg-black bg-opacity-20 px-4 py-3">
          <div className="text-yellow-200 font-semibold text-sm sm:text-base">Terrain Effects Reference</div>
          <p className="text-yellow-100 text-sm mt-1 leading-relaxed">
            These bonuses and penalties apply when terrain effects are enabled in Graphics.
          </p>
          <div className="grid gap-3 mt-3">
            {TERRAIN_MECHANICS_INFO.map((terrainInfo) => (
              <div key={terrainInfo.terrain} className="rounded-lg border border-yellow-700/60 bg-black/20 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-yellow-200 font-semibold">{TERRAIN_LABELS[terrainInfo.terrain]}</div>
                  <span className="rounded-full border border-yellow-700 bg-black/20 px-2 py-0.5 text-[11px] uppercase tracking-wide text-yellow-100">
                    {terrainInfo.terrain}
                  </span>
                </div>
                <p className="text-yellow-100 text-sm mt-1">{terrainInfo.summary}</p>
                <div className="mt-2 space-y-1">
                  {terrainInfo.effects.map((effect) => (
                    <p key={effect} className="text-xs text-lime-200 leading-relaxed">
                      {effect}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const beginGridPan = (clientX: number, clientY: number) => {
    const viewport = battlefieldViewportRef.current;
    if (!viewport || !showGridNavigation) return;

    battlefieldPanStateRef.current = {
      startX: clientX,
      startY: clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      moved: false
    };
    setIsPanningGrid(true);
  };

  const updateGridPan = (clientX: number, clientY: number) => {
    const viewport = battlefieldViewportRef.current;
    const panState = battlefieldPanStateRef.current;
    if (!viewport || !panState) return;

    const deltaX = clientX - panState.startX;
    const deltaY = clientY - panState.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      panState.moved = true;
      skipNextGridClickRef.current = true;
    }

    viewport.scrollLeft = panState.scrollLeft - deltaX;
    viewport.scrollTop = panState.scrollTop - deltaY;
  };

  const endGridPan = () => {
    battlefieldPanStateRef.current = null;
    setIsPanningGrid(false);
  };

  const handleViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!showGridNavigation) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    battlefieldPanCleanupRef.current?.();
    e.currentTarget.setPointerCapture(e.pointerId);
    beginGridPan(e.clientX, e.clientY);

    const pointerId = e.pointerId;
    const pointerTarget = e.currentTarget;

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      updateGridPan(event.clientX, event.clientY);
    };

    const stopPointerPan = (event?: PointerEvent) => {
      if (event && event.pointerId !== pointerId) return;

      if (pointerTarget.hasPointerCapture(pointerId)) {
        pointerTarget.releasePointerCapture(pointerId);
      }

      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", stopPointerPan);
      window.removeEventListener("pointercancel", stopPointerPan);
      battlefieldPanCleanupRef.current = null;
      endGridPan();
    };

    window.addEventListener("pointermove", handleWindowPointerMove, { passive: false });
    window.addEventListener("pointerup", stopPointerPan);
    window.addEventListener("pointercancel", stopPointerPan);
    battlefieldPanCleanupRef.current = () => stopPointerPan();
  };

  const appBackgroundStyle = {
    backgroundImage: 'linear-gradient(rgba(20, 15, 10, 0.55), rgba(20, 15, 10, 0.68)), url("/gamebkg.png")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed"
  } as const;

  if (!gameMode) {
    if (startScreen === "options") {
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-6 min-h-screen" style={appBackgroundStyle}>
          <div className="game-ui p-8 text-center max-w-2xl w-full">
            <div className="flex items-center justify-between gap-4 mb-6">
              <button
                onClick={() => setStartScreen("menu")}
                className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
              >
                Back
              </button>
              <h1 className="text-4xl font-bold text-yellow-200 drop-shadow-lg">Options</h1>
              <div className="w-16" />
            </div>
            {renderGameOptionsContent()}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-6 min-h-screen" style={appBackgroundStyle}>
        <div className="game-ui p-8 text-center max-w-2xl w-full">
          <h1 className="text-5xl font-bold text-yellow-200 mb-4 drop-shadow-lg">Battlecry</h1>
          <p className="text-yellow-100 text-lg mb-8">Choose your mode to enter the battlefield</p>

          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <button
              onClick={startSinglePlayerMode}
              className="battle-button w-full px-6 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            >
              Single Player
            </button>
            <button
              onClick={startMultiplayerMode}
              className="battle-button w-full px-6 py-4 text-lg font-semibold bg-red-600 hover:bg-red-700"
            >
              Multiplayer
            </button>
            <button
              onClick={startCustomScenarioMode}
              className="battle-button w-full px-6 py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700"
            >
              Custom Scenario
            </button>
          </div>

          <div className="mt-6 max-w-md mx-auto">
            <button
              onClick={() => setStartScreen("options")}
              className="battle-button w-full px-6 py-3 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700"
            >
              Options
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen" style={appBackgroundStyle}>
      <div
        ref={battlefieldRef}
        className={`fullscreen-battlefield-shell w-full flex flex-col items-center ${isBattlefieldFullscreen ? "h-full justify-start" : ""}`}
      >
      {/* Top Header */}
      <div className="sticky top-0 z-30 w-full">
        <div className="game-ui w-full rounded-none border-x-0 px-2 sm:px-3 py-2 flex flex-wrap items-center gap-2 justify-between relative">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-yellow-200 drop-shadow-lg">Battlecry</h1>
              <span className="rounded-full border border-yellow-700 bg-black bg-opacity-20 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-yellow-100">
                {gameMode === "multiplayer" ? "Local Multiplayer" : "Player vs AI"}
              </span>
            </div>
            <p className="text-green-200 text-[10px] sm:text-[11px] mt-0.5 max-w-lg truncate">
              {isSetupMode
                ? gameMode === "custom-scenario"
                  ? `Build the battlefield and choose who you control as ${playerTeam}.`
                  : "Drag troops to place them on the field."
                : gameMode === "multiplayer"
                  ? "Pass-and-play mode on one device."
                  : gameStarted
                    ? `You control ${playerTeam}.`
                    : `You control ${playerTeam}. Press Start Battle when ready.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-yellow-200 text-xs sm:text-sm font-semibold">
            <span className="rounded-full border border-yellow-700 bg-black bg-opacity-20 px-3 py-1">
              {gameMode === "custom-scenario"
                ? (isSetupMode ? `Custom Setup (${playerTeam})` : `Mode: Custom Scenario (${playerTeam} vs AI)`)
                : gameMode === "multiplayer"
                  ? `Mode: Multiplayer (${multiplayerTeams[0]} vs ${multiplayerTeams[1]})`
                  : `Level: ${LEVEL_MATCHUP_LABELS[currentLevel]} (${playerTeam})`}
            </span>
            {!isSetupMode && <span className="rounded-full border border-yellow-700 bg-black bg-opacity-20 px-3 py-1">Round {round}</span>}

            {!isSetupMode && gameMode !== "custom-scenario" && (
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="level-select" className="text-xs uppercase tracking-wide text-yellow-100">
                  Level
                </label>
                <select
                  id="level-select"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value as keyof typeof levels)}
                  className="bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:border-yellow-400"
                >
                  <option value="Level1">Level 1: Romans vs Barbarians</option>
                  <option value="Level2">Level 2: Greeks vs Celts</option>
                  <option value="Level3">Level 3: Carthage vs Vikings</option>
                  <option value="Level4">Level 4: Germanic vs Teutons</option>
                  <option value="Level5">Level 5: Romans vs Carthage</option>
                  <option value="Level6">Level 6: Greeks vs Germanic</option>
                  <option value="Level7">Level 7: Celts vs Vikings</option>
                  <option value="Level8">Level 8: Barbarians vs Teutons</option>
                </select>
                {gameMode === "single-player" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="single-player-team" className="text-xs uppercase tracking-wide text-yellow-100">
                      Faction
                    </label>
                    <select
                      id="single-player-team"
                      value={playerTeam}
                      onChange={(e) => {
                        const nextTeam = e.target.value as TeamName;
                        setPlayerTeam(nextTeam);
                        setUnits(prepareUnitsForBattle(levels[currentLevel]));
                        setTurn(nextTeam);
                        setRound(1);
                        setSelectedId(null);
                        setLog([]);
                        setGameStarted(false);
                        setMergeCount(0);
                        setMergeMode(false);
                        setSelectedForMerge(null);
                        setGridOrientation("north");
                      }}
                      className="bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:border-yellow-400"
                    >
                      {levelTeams.map((team) => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsGameMenuOpen((open) => !open)}
              className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-gray-700 hover:bg-gray-800"
            >
              Game Menu
            </button>

            {isGameMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-yellow-700 bg-gray-900/95 shadow-2xl backdrop-blur-sm overflow-hidden">
                <button
                  onClick={openInGameOptions}
                  className="w-full text-left px-4 py-3 text-sm text-yellow-100 hover:bg-yellow-700/20 border-b border-yellow-700/50"
                >
                  Options
                </button>
                <button
                  onClick={openInGameMechanics}
                  className="w-full text-left px-4 py-3 text-sm text-yellow-100 hover:bg-yellow-700/20 border-b border-yellow-700/50"
                >
                  Mechanics
                </button>
                <button
                  onClick={openInGameGraphics}
                  className="w-full text-left px-4 py-3 text-sm text-yellow-100 hover:bg-yellow-700/20 border-b border-yellow-700/50"
                >
                  Graphics
                </button>
                <button
                  onClick={backToMainMenu}
                  className="w-full text-left px-4 py-3 text-sm text-yellow-100 hover:bg-red-700/20"
                >
                  Back to Menu
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="game-ui w-full rounded-none border-x-0 border-t border-yellow-800/50 px-2 sm:px-3 py-2 flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(!isSetupMode || gameMode === "multiplayer" || gameMode === "custom-scenario") && (
              <button
                onClick={toggleBattlefieldFullscreen}
                className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 relative"
              >
                <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {isBattlefieldFullscreen ? "🗗 Exit Fullscreen" : "🗖 Fullscreen"}
              </button>
            )}

            {gameMode && (
              <button
                onClick={restartCurrentGame}
                className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-red-700 hover:bg-red-800"
              >
                Restart Game
              </button>
            )}

            {gameMode === "single-player" && !isSetupMode && !gameStarted && (
              <button
                onClick={startSinglePlayerBattle}
                className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-green-600 hover:bg-green-700 relative"
              >
                <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                🚀 Start Battle
              </button>
            )}

            {gameMode === "custom-scenario" && isSetupMode && (
              <>
                <button
                  onClick={autoDeployCustomBattle}
                  className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 relative"
                >
                  <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Auto Deploy
                </button>

                <button
                  onClick={startCustomGame}
                  disabled={customUnits.length === 0}
                  className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  🚀 Start Custom Game
                </button>

                <button
                  onClick={resetCustomSetup}
                  className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 relative"
                >
                  <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  🔄 Reset Setup
                </button>

              </>
            )}

            {gameMode === "multiplayer" && isSetupMode && (
              <>
                <button
                  onClick={startMultiplayerGame}
                  disabled={customUnits.length === 0}
                  className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  🚀 Start Multiplayer Game
                </button>

                <button
                  onClick={resetCustomSetup}
                  className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 relative"
                >
                  <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  🔄 Reset Setup
                </button>
              </>
            )}

            {!isSetupMode && ((gameMode === "multiplayer" && gameStarted) || (gameMode !== "multiplayer" && turn === playerTeam && gameStarted)) && (
              <>
                {!isSetupMode && gameStarted && (
                  <div className="text-blue-200 font-semibold bg-blue-900 bg-opacity-50 px-2.5 py-1.5 rounded border border-blue-600 text-center">
                    <span className="block text-[11px] uppercase tracking-wide">Merges</span>
                    <span className="block text-xs sm:text-sm">{mergeCount}/2</span>
                  </div>
                )}

                {!isSetupMode && gameStarted && (
                  <button
                    onClick={() => {
                      if (mergeCount < 2) {
                        setMergeMode(!mergeMode);
                        setSelectedForMerge(null);
                        setSelectedId(null);
                        if (!mergeMode) {
                          setLog((prevLog) => [`Merge mode activated! All teams can now merge their troops. Click on two adjacent troops of the same role to merge them. (${2 - mergeCount} merges remaining)`, ...prevLog]);
                        } else {
                          setLog((prevLog) => [`Merge mode deactivated.`, ...prevLog]);
                        }
                      } else {
                        setLog((prevLog) => [`No more merges allowed this game!`, ...prevLog]);
                      }
                    }}
                    disabled={mergeCount >= 2}
                    className={`battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold relative ${
                      mergeMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <svg className="absolute -left-1 -top-1 w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {mergeMode ? '🔄 Cancel Merge' : '🔗 Merge Troops'}
                  </button>
                )}
              </>
            )}

            {isBattlefieldFullscreen && !isSetupMode && (
              <div className="text-yellow-100 border border-yellow-700 rounded px-2.5 py-1.5 text-xs sm:text-sm font-semibold">
                {checkEnd() || `${turn.toUpperCase()} TURN`}
              </div>
            )}
          </div>

          {!isSetupMode && passiveTeams.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {passiveTeams.map((team) => {
                const passive = CIV_PASSIVES[team];
                return (
                  <div key={team} className="relative group">
                    <button
                      type="button"
                      className="game-ui flex items-center justify-center border border-yellow-600 text-xl"
                      style={{ width: "42px", height: "42px" }}
                      aria-label={`${team} passive: ${passive.name}. ${passive.effect}`}
                      title={`${team} - ${passive.name}: ${passive.effect}`}
                    >
                      {PASSIVE_ICONS[team]}
                    </button>
                    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-lg border border-yellow-700 bg-gray-900 px-3 py-2 text-center shadow-lg group-hover:block">
                      <div className="text-yellow-200 text-sm font-bold">{team}</div>
                      <div className="text-amber-300 text-xs font-semibold mt-1">{passive.name}</div>
                      <div className="text-yellow-100 text-xs mt-1">{passive.effect}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-yellow-200 text-xs sm:text-sm font-semibold">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={regenerateTerrain}
                className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-emerald-700 hover:bg-emerald-800"
              >
                Regenerate Terrain
              </button>
            </div>

            {canRotateTroops && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-yellow-700 bg-black bg-opacity-20 px-3 py-1 uppercase tracking-wide text-yellow-100">
                  Facing
                </span>
                <div className="flex items-center gap-1 rounded-full border border-yellow-700 bg-black bg-opacity-20 px-1 py-1">
                  {GRID_ORIENTATIONS.map((orientation) => (
                    <button
                      key={orientation}
                      type="button"
                      onClick={() => rotateTroopsTo(orientation)}
                      className={`rounded-full px-2 py-1 text-[10px] sm:text-xs font-bold uppercase transition-colors ${
                        gridOrientation === orientation
                          ? "bg-yellow-500 text-gray-900"
                          : "text-yellow-100 hover:bg-yellow-700/30"
                      }`}
                    >
                      {orientation.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isInGameOptionsOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto mt-8 sm:mt-12 mb-6">
            <div className="game-ui p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Options</h2>
                <button
                  onClick={() => setIsInGameOptionsOpen(false)}
                  className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
              {renderGameOptionsContent()}
            </div>
          </div>
        </div>
      )}

      {isInGameMechanicsOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto mt-8 sm:mt-12 mb-6">
            <div className="game-ui p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Mechanics</h2>
                <button
                  onClick={() => setIsInGameMechanicsOpen(false)}
                  className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
              {renderMechanicsContent()}
            </div>
          </div>
        </div>
      )}

      {isInGameGraphicsOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto mt-8 sm:mt-12 mb-6">
            <div className="game-ui p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Graphics</h2>
                <button
                  onClick={() => setIsInGameGraphicsOpen(false)}
                  className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
              {renderGraphicsContent()}
            </div>
          </div>
        </div>
      )}

      {/* Setup Mode Controls */}
      {isSetupMode && (
        <div className="game-ui w-full max-w-none px-3 py-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
            <div className="rounded-lg border border-yellow-700/60 bg-black/20 px-3 py-3 xl:w-64 xl:flex-shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-bold uppercase tracking-wide text-yellow-200">Setup Controls</div>
                <div className="rounded-full border border-yellow-700 bg-black/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-100">
                  {gameMode === "multiplayer" ? "Multiplayer" : "Custom Scenario"}
                </div>
              </div>
            </div>

            {(gameMode === "multiplayer" || gameMode === "custom-scenario") && (
              <div className={`grid gap-2 xl:flex-1 ${gameMode === "custom-scenario" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                {gameMode === "custom-scenario" ? (
                  <div className="rounded-lg border border-yellow-700/60 bg-black/20 px-3 py-3">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-yellow-200">Your Team</label>
                    <select
                      value={playerTeam}
                      onChange={(e) => {
                        const next = e.target.value as TeamName;
                        setPlayerTeam(next);
                        if (selectedTeam === playerTeam) setSelectedTeam(next);
                      }}
                      className="w-full rounded border border-yellow-600 bg-gray-800 px-3 py-2 text-sm text-yellow-200 focus:outline-none focus:border-yellow-400"
                    >
                      {renderTeamSelectOptions(ALL_TEAMS)}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border border-yellow-700/60 bg-black/20 px-3 py-3">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-yellow-200">Player 1 Team</label>
                      <select
                        value={multiplayerTeams[0]}
                        onChange={(e) => {
                          const next = e.target.value as TeamName;
                          if (next === multiplayerTeams[1]) return;
                          setMultiplayerTeams([next, multiplayerTeams[1]]);
                          setCustomUnits((prev) => prev.filter((u: any) => u.team === next || u.team === multiplayerTeams[1]));
                          if (selectedTeam !== next && selectedTeam !== multiplayerTeams[1]) setSelectedTeam(next);
                        }}
                        className="w-full rounded border border-yellow-600 bg-gray-800 px-3 py-2 text-sm text-yellow-200 focus:outline-none focus:border-yellow-400"
                      >
                        {renderTeamSelectOptions(ALL_TEAMS)}
                      </select>
                    </div>
                    <div className="rounded-lg border border-yellow-700/60 bg-black/20 px-3 py-3">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-yellow-200">Player 2 Team</label>
                      <select
                        value={multiplayerTeams[1]}
                        onChange={(e) => {
                          const next = e.target.value as TeamName;
                          if (next === multiplayerTeams[0]) return;
                          setMultiplayerTeams([multiplayerTeams[0], next]);
                          setCustomUnits((prev) => prev.filter((u: any) => u.team === multiplayerTeams[0] || u.team === next));
                          if (selectedTeam !== next && selectedTeam !== multiplayerTeams[0]) setSelectedTeam(multiplayerTeams[0]);
                        }}
                        className="w-full rounded border border-yellow-600 bg-gray-800 px-3 py-2 text-sm text-yellow-200 focus:outline-none focus:border-yellow-400"
                      >
                        {renderTeamSelectOptions(ALL_TEAMS)}
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="rounded-lg border border-yellow-700/60 bg-black/20 px-3 py-3 xl:w-[30rem] xl:flex-shrink-0">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-yellow-200">Team Selection</div>
                <div className="text-[11px] text-yellow-100/80">
                  Active: <span className="font-semibold text-yellow-200">{selectedTeam}</span>
                </div>
              </div>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value as TeamName)}
                className="w-full rounded border border-yellow-600 bg-gray-800 px-3 py-2 text-sm text-yellow-200 focus:outline-none focus:border-yellow-400"
              >
                {renderTeamSelectOptions(setupTeams, (team) => `${team} (${getTeamCount(team)}/16)`)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Three-Column Layout: Battle Log (Left) | Battlefield Grid (Center) | Selected Unit/Troop Panel (Right) */}
      <div className={`flex gap-3 w-full ${isBattlefieldFullscreen ? "flex-row max-w-none items-stretch" : "flex-col xl:flex-row max-w-8xl"}`}>
        {/* Left Side: Turn Info + Battle Log */}
        {!isSetupMode && (gameOptions.showTurnBanner || gameOptions.showBattleLog) && (
          <div className={`flex-shrink-0 ${isBattlefieldFullscreen ? "w-56" : "xl:w-80"}`}>
            <div className={`game-ui p-4 relative ${isBattlefieldFullscreen ? "max-h-[72vh] overflow-y-auto" : ""}`}>
              {gameOptions.showTurnBanner && (
                <div className="text-center relative">
                {/* Decorative crown for turn display */}
                  <svg className="absolute -top-2 left-4 w-8 h-8 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8l3 4h2l-3 4-3-4H9l3-4z"/>
                  </svg>
                  
                  <div className="text-2xl font-bold text-yellow-200">
                    {checkEnd() || `${turn.toUpperCase()} TURN`}
                  </div>
                  <div className="text-sm text-yellow-100 mt-1">
                    {gameMode === "multiplayer"
                      ? `${turn} player's turn`
                      : turn === playerTeam ? "Your turn - Click to select and move/attack"
                        : turn === "Barbarians" ? "Barbarians are thinking..."
                        : turn === "Greeks" ? "Greeks are thinking..."
                        : turn === "Celts" ? "Celts are thinking..."
                        : turn === "Germanic" ? "Germanic tribes are thinking..."
                        : turn === "Carthage" ? "Carthage is thinking..."
                        : turn === "Vikings" ? "Vikings are thinking..."
                        : turn === "Teutons" ? "Teutons are thinking..." : ""}
                  </div>
                  
                  {/* Decorative sword */}
                  <svg className="absolute -bottom-2 right-4 w-8 h-8 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.92 5H5.14c-.47 0-.92.21-1.18.56L3.04 7H2v1h1.04l.92 1.44c.26.35.71.56 1.18.56h1.78c.47 0 .92-.21 1.18-.56L9.96 7H11V6H9.96L8.1 4.56C7.84 4.21 7.39 4 6.92 4z"/>
                  </svg>
                </div>
              )}

              {gameOptions.showTurnBanner && gameOptions.showBattleLog && (
                <div className="my-3 border-t border-yellow-600/50" />
              )}

              {gameOptions.showBattleLog && (
                <div className="relative">
                {/* Decorative scroll */}
                  <svg className="absolute -top-2 left-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                  </svg>
                  
                  <h3 className="text-yellow-200 font-bold mb-3 text-lg border-b border-yellow-600 pb-2">Battle Log</h3>
                  <div className={`${isBattlefieldFullscreen ? "max-h-[58vh]" : "max-h-96"} overflow-y-auto space-y-1`}>
                    {visibleBattleLog.map((line, i) => (
                      <div key={i} className="text-green-200 text-sm bg-black bg-opacity-30 p-2 rounded border-l-2 border-yellow-600">
                        {line}
                      </div>
                    ))}
                  </div>
                  
                  {/* Decorative quill */}
                  <svg className="absolute -bottom-2 right-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Battlefield Grid - Center */}
        <div className={`battlefield-container relative flex-1 ${isBattlefieldFullscreen ? "min-w-0 flex items-center justify-center" : "mt-3 sm:mt-4"}`}>
          <div className="relative mx-auto w-fit max-w-full">
            {showGridNavigation && (
              <>
                <div
                  className="absolute left-12 right-12 top-0 z-10 flex h-12 items-start justify-center pt-2"
                  onMouseEnter={() => setHoverScrollDirection("up")}
                  onMouseLeave={() => setHoverScrollDirection(null)}
                >
                  <div className="battlefield-nav-rail battlefield-nav-rail-horizontal" aria-hidden="true" />
                </div>
                <div
                  className="absolute bottom-0 left-12 right-12 z-10 flex h-12 items-end justify-center pb-2"
                  onMouseEnter={() => setHoverScrollDirection("down")}
                  onMouseLeave={() => setHoverScrollDirection(null)}
                >
                  <div className="battlefield-nav-rail battlefield-nav-rail-horizontal" aria-hidden="true" />
                </div>
                <div
                  className="absolute bottom-12 left-0 top-12 z-10 flex w-12 items-center justify-start pl-2"
                  onMouseEnter={() => setHoverScrollDirection("left")}
                  onMouseLeave={() => setHoverScrollDirection(null)}
                >
                  <div className="battlefield-nav-rail battlefield-nav-rail-vertical" aria-hidden="true" />
                </div>
                <div
                  className="absolute bottom-12 right-0 top-12 z-10 flex w-12 items-center justify-end pr-2"
                  onMouseEnter={() => setHoverScrollDirection("right")}
                  onMouseLeave={() => setHoverScrollDirection(null)}
                >
                  <div className="battlefield-nav-rail battlefield-nav-rail-vertical" aria-hidden="true" />
                </div>
              </>
            )}

            <div
              ref={battlefieldViewportRef}
              className={
                useEightByEightViewport
                  ? "battlefield-scroll-viewport battlefield-scroll-viewport-8x8"
                  : useFullscreenNavigationViewport
                    ? "battlefield-scroll-viewport battlefield-scroll-viewport-fullscreen-large"
                    : ""
              }
              onPointerDownCapture={handleViewportPointerDown}
              style={showGridNavigation ? { cursor: isPanningGrid ? "grabbing" : "grab" } : undefined}
            >
              <div
                className="battlefield-grid inline-grid gap-1 rounded-lg"
                style={{
                  width: "max-content",
                  gridTemplateColumns: `repeat(${battlefieldSize}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${battlefieldSize}, minmax(0, 1fr))`
                }}
              >
                {[...Array(battlefieldSize)].flatMap((_, y) =>
                  [...Array(battlefieldSize)].map((_, x) => {
                const u = getUnit(x, y);
                const isSelected = u?.id === selectedId;
                const key = `${x},${y}`;
                const isMove = highlightMove && highlightMove.includes(key);
                const isAttack = highlightAttack && highlightAttack.includes(key);
                const percent = u ? (u.hp / u.maxHp) * 100 : 0;
                const terrainType = getTerrainAt(battlefieldTerrain, x, y);
                const UnitDisplayIcon = u ? getUnitDisplayIcon(u) : null;
                const terrainStyle = {
                  backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12)), url(${TERRAIN_ASSETS[terrainType]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                };
                
                return (
                  <div
                    key={key}
                    onClick={() => handleClick(x, y)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, x, y)}
                    draggable={!isSetupMode && mergeMode && u && ALL_TEAMS.includes(u.team)}
                    onDragStart={(e: React.DragEvent) => {
                      if (!isSetupMode && mergeMode && u && ALL_TEAMS.includes(u.team)) {
                        setSelectedId(u.id);
                        e.dataTransfer.setData('text/plain', u.id);
                      }
                    }}
                    className={`${isBattlefieldFullscreen ? "w-[68px] h-[76px] sm:w-[76px] sm:h-[92px]" : "w-[76px] h-[92px] sm:w-[92px] sm:h-[108px]"} terrain-cell flex flex-col items-center justify-center text-xs sm:text-sm cursor-pointer transition-all duration-200 relative
                    ${isSelected ? "unit-selected" : ""}
                    ${isMove ? "movement-highlight" : ""}
                    ${isAttack ? "attack-highlight" : ""}
                    ${u ? (u.team === "Romans" ? "unit-roman" : u.team === "Greeks" ? "unit-greek" : u.team === "Celts" ? "unit-celtic" : u.team === "Germanic" ? "unit-germanic" : u.team === "Carthage" ? "unit-carthage" : u.team === "Vikings" ? "unit-viking" : u.team === "Teutons" ? "unit-teuton" : "unit-barbarian") : ""}
                    ${isSetupMode && draggedTroop && !u ? "drag-over" : ""}
                    ${mergeMode && u && u.team === turn && selectedForMerge && u.role === selectedForMerge.role ? "merge-highlight" : ""}
                    ${mergeMode && u && u.team === turn && selectedForMerge && u.id === selectedForMerge.id ? "merge-selected" : ""}
                    ${!isSetupMode && mergeMode && u && ALL_TEAMS.includes(u.team) ? "cursor-grab active:cursor-grabbing" : ""}`}
                    style={terrainStyle}
                    title={TERRAIN_LABELS[terrainType]}
                  >
                    {u ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                          {/* Unit Icon */}
                          <div className="text-2xl mb-1">
                            {typeof UnitDisplayIcon === "string" ? UnitDisplayIcon : (UnitDisplayIcon ? createElement(UnitDisplayIcon) : "⚔️")}
                          </div>
                          
                          {/* Unit Name */}
                          <div className="text-xs text-center font-semibold text-yellow-200 leading-tight">
                            {u.name}
                          </div>
                          
                          {/* Health Display */}
                          <div className="text-xs text-white font-bold">
                            {u.hp} HP
                          </div>
                          
                          {/* Health Bar */}
                          <div className="w-full bg-gray-800 rounded-full h-1 mt-1 border border-gray-600">
                            <div 
                              className="health-bar rounded-full h-full" 
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          
                          {/* Ammo Display for Ranged Units */}
                          {u.ammo && u.ammo > 0 && (
                            <div className="text-xs text-cyan-400 mt-1">
                              🏹{u.ammo}
                            </div>
                          )}
                          
                          {/* Out of Ammo Indicator */}
                          {u.ammo === 0 && (u.range ?? 1) > 1 && (
                            <div className="text-xs text-red-400 mt-1">
                              ⚔️
                            </div>
                          )}
                          
                          {/* Movement and Attack Indicators */}
                          {isMove && <div className="text-green-400 text-lg">🚶‍♂️</div>}
                          {isAttack && <div className="text-red-400 text-lg">⚔️</div>}
                        </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-gray-600 text-xs"></div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
              </div>
            </div>
          </div>
        </div>

        {inspectedUnit && !isSetupMode && (
          <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-lg mx-auto mt-8 sm:mt-12 mb-6">
              <div className="game-ui p-4 sm:p-6 relative">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Troop Details</h2>
                  <button
                    onClick={() => setInspectedUnitId(null)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3 text-sm sm:text-base text-yellow-200">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const InspectedUnitIcon = getUnitDisplayIcon(inspectedUnit);
                      return (
                    <div className="text-3xl">
                      {typeof InspectedUnitIcon === "string" ? InspectedUnitIcon : (InspectedUnitIcon ? createElement(InspectedUnitIcon) : "⚔️")}
                    </div>
                      );
                    })()}
                    <div>
                      <div className="text-lg font-bold text-yellow-100">{inspectedUnit.name}</div>
                      <div className="text-xs sm:text-sm text-yellow-300">{inspectedUnit.role}</div>
                    </div>
                  </div>

                  <p><span className="text-sky-300">🏴</span> Team: {inspectedUnit.team}</p>
                  <p>
                    <span className="text-red-400">❤️</span> HP: {inspectedUnit.hp}/{inspectedUnit.maxHp}
                    {inspectedUnit.baseMaxHp && inspectedUnit.baseMaxHp !== inspectedUnit.maxHp ? ` (base ${inspectedUnit.baseMaxHp})` : ""}
                  </p>
                  <p>
                    <span className="text-orange-400">⚔️</span> Attack: {inspectedEffectiveAttack}
                    {inspectedEffectiveAttack !== inspectedUnit.attack ? ` (base ${inspectedUnit.attack})` : ""}
                  </p>
                  <p><span className="text-blue-400">🎯</span> Range: {inspectedUnit.range}</p>
                  <p><span className="text-green-400">🚶‍♂️</span> Move: {getEffectiveMove(inspectedUnit, battlefieldTerrain)} {getEffectiveMove(inspectedUnit, battlefieldTerrain) !== inspectedUnit.move ? `(base ${inspectedUnit.move})` : ""}</p>
                  <p>
                    <span className="text-cyan-300">{TROOP_MECHANIC_ICONS[getTroopMechanicType(inspectedUnit)]}</span>{" "}
                    Troop Type: {TROOP_MECHANIC_LABELS[getTroopMechanicType(inspectedUnit)]}
                  </p>
                  <p><span className="text-lime-300">🗺️</span> Terrain: <strong>{TERRAIN_LABELS[inspectedTerrainType ?? "plain"]}</strong></p>
                  {!gameOptions.terrainEffectsEnabled && (
                    <p className="text-xs text-yellow-100 opacity-90">Terrain effects are disabled in Graphics.</p>
                  )}
                  {inspectedEffectNotes.length > 0 && (
                    <div className="rounded-lg border border-lime-700 bg-black/20 px-3 py-2">
                      <div className="text-lime-300 text-sm font-semibold mb-1">Active Effects</div>
                      <div className="space-y-1">
                        {inspectedEffectNotes.map((note) => (
                          <p key={note} className="text-xs text-yellow-100">{note}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {inspectedUnit.ammo && inspectedUnit.ammo > 0 && (
                    <p><span className="text-cyan-400">🏹</span> Shots: {inspectedUnit.ammo}</p>
                  )}
                  {inspectedUnit.ammo === 0 && (inspectedUnit.range ?? 1) > 1 && (
                    <p><span className="text-red-400">⚔️</span> <strong>No shots left - fights in close combat</strong></p>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-xs text-yellow-200 mb-1">Health</div>
                  <div className="w-full bg-gray-700 rounded-full h-3 border border-gray-600">
                    <div
                      className="health-bar rounded-full h-full"
                      style={{ width: `${(inspectedUnit.hp / inspectedUnit.maxHp) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {inspectedTile && inspectedTileTerrainType && inspectedTileInfo && (
          <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-lg mx-auto mt-8 sm:mt-12 mb-6">
              <div className="game-ui p-4 sm:p-6 relative">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Terrain Details</h2>
                  <button
                    onClick={() => setInspectedTile(null)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3 text-sm sm:text-base text-yellow-200">
                  <p>
                    <span className="text-lime-300">🗺️</span> Terrain: <strong>{TERRAIN_LABELS[inspectedTileTerrainType]}</strong>
                  </p>
                  <p>
                    <span className="text-sky-300">📍</span> Tile: {inspectedTile.x + 1}, {inspectedTile.y + 1}
                  </p>
                  <p className="text-yellow-100 leading-relaxed">{inspectedTileInfo.summary}</p>
                  {!gameOptions.terrainEffectsEnabled && (
                    <p className="text-xs text-yellow-100 opacity-90">Terrain effects are currently disabled in Graphics.</p>
                  )}
                  <div className="rounded-lg border border-lime-700 bg-black/20 px-3 py-3">
                    <div className="text-lime-300 text-sm font-semibold mb-2">Terrain Effects</div>
                    <div className="space-y-1">
                      {inspectedTileInfo.effects.map((effect) => (
                        <p key={effect} className="text-xs text-yellow-100 leading-relaxed">{effect}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side Panel */}
        {gameOptions.showUnitPanel && (
        <div className={`game-ui p-4 flex-shrink-0 relative ${isBattlefieldFullscreen ? "w-56 max-h-[72vh] overflow-y-auto" : "xl:w-60"}`}>
          {/* Decorative shield */}
          <svg className="absolute -top-2 left-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4z"/>
          </svg>
          
          {isSetupMode ? (
            // Troop Selection Panel
            <>
              <h2 className="text-yellow-200 font-bold mb-3 text-xl border-b border-yellow-600 pb-2">
                {selectedTeam} Troops
              </h2>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {AVAILABLE_TROOPS[selectedTeam].map((troop, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => setDraggedTroop(troop)}
                    onDragEnd={() => setDraggedTroop(null)}
                    className="bg-gray-700 p-3 rounded cursor-move hover:bg-gray-600 transition-colors border border-gray-600 relative"
                  >
                    {/* Decorative star for draggable troops */}
                    <svg className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">
                        {typeof troop.Icon === "string" && troop.Icon.length <= 2
                          ? troop.Icon
                          : ICON_MAP[troop.Icon as keyof typeof ICON_MAP] || troop.Icon || "⚔️"}
                      </div>
                      <div className="flex-1">
                        <div className="text-yellow-200 font-semibold">{troop.name}</div>
                        <div className="text-xs text-gray-300">
                          {troop.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-600">
                <div className="text-yellow-200 font-semibold mb-2">Team Counts:</div>
                <div className="text-sm text-gray-300">
                  {setupTeams.map((team) => (
                    <div key={team}>{team}: {getTeamCount(team)}/16</div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Selected Unit Display
            selected ? (
              <>
                <h2 className="text-yellow-200 font-bold mb-3 text-xl border-b border-yellow-600 pb-2">Selected Unit</h2>
                <div className="space-y-2 text-sm text-yellow-200">
                  <p><span className="text-yellow-300">🧱</span> <strong>{selected.name}</strong></p>
                  <p><span className="text-sky-300">🏴</span> Team: {selected.team}</p>
                  <p>
                    <span className="text-red-400">❤️</span> HP: {selected.hp}/{selected.maxHp}
                    {selected.baseMaxHp && selected.baseMaxHp !== selected.maxHp ? ` (base ${selected.baseMaxHp})` : ""}
                  </p>
                  <p>
                    <span className="text-orange-400">⚔️</span> Attack: {selectedEffectiveAttack}
                    {selectedEffectiveAttack !== selected.attack ? ` (base ${selected.attack})` : ""}
                  </p>
                  <p><span className="text-blue-400">🎯</span> Range: {selected.range}</p>
                  <p><span className="text-green-400">🚶‍♂️</span> Move: {selectedEffectiveMove}{selectedEffectiveMove !== selected.move ? ` (base ${selected.move})` : ""}</p>
                  <p><span className="text-purple-400">🏷️</span> Role: {selected.role}</p>
                  <p>
                    <span className="text-cyan-300">{TROOP_MECHANIC_ICONS[getTroopMechanicType(selected)]}</span>{" "}
                    Troop Type: {TROOP_MECHANIC_LABELS[getTroopMechanicType(selected)]}
                  </p>
                  {selectedTerrainType && (
                    <p><span className="text-lime-300">🗺️</span> Terrain: {TERRAIN_LABELS[selectedTerrainType]}</p>
                  )}
                  {!gameOptions.terrainEffectsEnabled && selectedTerrainType && (
                    <p className="text-xs text-yellow-100 opacity-90">Terrain effects are disabled in Graphics.</p>
                  )}
                  {selectedEffectNotes.length > 0 && (
                    <div className="rounded-lg border border-lime-700 bg-black/20 px-3 py-2">
                      <div className="text-lime-300 text-xs font-semibold mb-1">Active Effects</div>
                      <div className="space-y-1">
                        {selectedEffectNotes.map((note) => (
                          <p key={note} className="text-xs text-yellow-100">{note}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Ammunition display for ranged units */}
                  {selected.ammo && selected.ammo > 0 && (
                    <p><span className="text-cyan-400">🏹</span> Shots: {selected.ammo}</p>
                  )}
                  
                  {/* Out of ammo indicator */}
                  {selected.ammo === 0 && (selected.range ?? 1) > 1 && (
                    <p><span className="text-red-400">⚔️</span> <strong>No shots left - fights in close combat</strong></p>
                  )}
                </div>
                
                {/* Health Bar */}
                <div className="mt-3">
                  <div className="text-xs text-yellow-200 mb-1">Health</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 border border-gray-600">
                    <div 
                      className="health-bar rounded-full h-full" 
                      style={{ width: `${(selected.hp / selected.maxHp) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-yellow-200 font-bold mb-3 text-xl border-b border-yellow-600 pb-2">No Unit Selected</h2>
                <p className="text-green-200 text-sm opacity-70">Click on a unit to select it. Click the same troop again to inspect full stats. Click an empty tile to inspect terrain effects.</p>
              </>
            )
          )}
          
          {/* Decorative helmet */}
          <svg className="absolute -bottom-2 right-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default CodeConq;
