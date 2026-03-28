// CodeConq - Grid Strategy Game with Highlights and Expanded Features
// Now includes: Health Bars, Kill Counters, Special Ability Tooltips, and Custom Drag & Drop Setup

import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { levels } from "./Units/InitialUnits";
import { generateTroopStats, getTroopAbilities, getTroopReferenceStats, type TroopReferenceStats } from "./Units/troopStats";
import { createBattleSfxController, getTurnCueForTeam, type BattleSfxKey } from "./audio/battleSfx";

// Available troop types for custom setup - using existing definitions
const AVAILABLE_TROOPS = {
  Romans: [
    { role: "Roman King", name: "Roman King", Icon: "👑" },
    { role: "Legionary", name: "Legionary", Icon: "⚔️" },
    { role: "Centurion", name: "Centurion", Icon: "⚔️" },
    { role: "Praetorian", name: "Praetorian", Icon: "⚔️" },
    { role: "Auxiliary", name: "Auxiliary", Icon: "⚔️" },
    { role: "Triarii", name: "Triarii", Icon: "⚔️" },
    { role: "Cavalry", name: "Cavalry", Icon: "🐎" },
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
    { role: "Oathsworn", name: "Oathsworn", Icon: "⚔️" },
    { role: "Barbarian Scout", name: "Barbarian Scout", Icon: "🐎🏹" },
    { role: "Barbarian Noble Rider", name: "Barbarian Noble Rider", Icon: "🐎" },
    { role: "Barbarian Archer", name: "Barbarian Archer", Icon: "🏹" },
    { role: "Barbarian Shaman", name: "Barbarian Shaman", Icon: "🏹" },
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
    { role: "Peltast", name: "Peltast", Icon: "🏹" },
    { role: "Cretan Archer", name: "Cretan Archer", Icon: "🏹" },
    { role: "Greek Catapult", name: "Greek Catapult", Icon: "⚙️" },
    { role: "Polybolos", name: "Polybolos", Icon: "⚙️" }
  ],
  Gauls: [
    { role: "Gallic King", name: "Gallic King", Icon: "👑" },
    { role: "Gallic Warrior", name: "Gallic Warrior", Icon: "⚔️" },
    { role: "Gallic Berserker", name: "Gallic Berserker", Icon: "⚔️" },
    { role: "Gallic Spearman", name: "Gallic Spearman", Icon: "⚔️" },
    { role: "Gallic Oathsworn", name: "Gallic Oathsworn", Icon: "⚔️" },
    { role: "Gaesatae", name: "Gaesatae", Icon: "⚔️" },
    { role: "Fianna", name: "Fianna", Icon: "⚔️" },
    { role: "Gallic Cavalry", name: "Gallic Cavalry", Icon: "🐎" },
    { role: "Gallic Chariot", name: "Gallic Chariot", Icon: "🐎🏹" },
    { role: "Gallic Noble Horseman", name: "Gallic Noble Horseman", Icon: "🐎" },
    { role: "Gallic Archer", name: "Gallic Archer", Icon: "🏹" },
    { role: "Gallic Skirmisher", name: "Gallic Skirmisher", Icon: "🏹" },
  ],
  Germanic: [
    { role: "Germanic King", name: "Germanic King", Icon: "👑" },
    { role: "Germanic Warrior", name: "Germanic Warrior", Icon: "⚔️" },
    { role: "Germanic Spearman", name: "Germanic Spearman", Icon: "⚔️" },
    { role: "Germanic Berserker", name: "Germanic Berserker", Icon: "⚔️" },
    { role: "Germanic Raider", name: "Germanic Raider", Icon: "⚔️" },
    { role: "Chosen Axeman", name: "Chosen Axeman", Icon: "⚔️" },
    { role: "Hearthguard", name: "Hearthguard", Icon: "⚔️" },
    { role: "Germanic Wolf Rider", name: "Germanic Wolf Rider", Icon: "🐎" },
    { role: "Suebi Rider", name: "Suebi Rider", Icon: "🐎" },
    { role: "Gothic Lancer", name: "Gothic Lancer", Icon: "🐎" },
    { role: "Germanic Archer", name: "Germanic Archer", Icon: "🏹" },
    { role: "Tribal Slinger", name: "Tribal Slinger", Icon: "🏹" },
  ],
  Carthage: [
    { role: "Carthaginian General", name: "Carthaginian General", Icon: "👑" },
    { role: "Libyan Infantry", name: "Libyan Infantry", Icon: "⚔️" },
    { role: "Sacred Band", name: "Sacred Band", Icon: "⚔️" },
    { role: "Liby-Phoenician Infantry", name: "Liby-Phoenician Infantry", Icon: "⚔️" },
    { role: "Iberian Swordsman", name: "Iberian Swordsman", Icon: "⚔️" },
    { role: "African Pikeman", name: "African Pikeman", Icon: "⚔️" },
    { role: "Punic Spearman", name: "Punic Spearman", Icon: "⚔️" },
    { role: "Numidian Cavalry", name: "Numidian Cavalry", Icon: "🐎" },
    { role: "War Elephant", name: "War Elephant", Icon: "🐘" },
    { role: "Balearic Slinger", name: "Balearic Slinger", Icon: "🏹" },
    { role: "Carthaginian Archer", name: "Carthaginian Archer", Icon: "🏹" },
    { role: "Elephant Archer", name: "Elephant Archer", Icon: "🐘🏹" }
  ],
  Egypt: [
    { role: "Pharaoh", name: "Pharaoh", Icon: "👑" },
    { role: "Egyptian Warrior", name: "Egyptian Warrior", Icon: "⚔️" },
    { role: "Medjay", name: "Medjay", Icon: "⚔️" },
    { role: "Khopesh Warrior", name: "Khopesh Warrior", Icon: "⚔️" },
    { role: "Shield Bearer", name: "Shield Bearer", Icon: "⚔️" },
    { role: "Royal Guard", name: "Royal Guard", Icon: "⚔️" },
    { role: "Egyptian Archer", name: "Egyptian Archer", Icon: "🏹" },
    { role: "Nubian Archer", name: "Nubian Archer", Icon: "🏹" },
    { role: "War Chariot", name: "War Chariot", Icon: "🐎" },
    { role: "Royal Chariot", name: "Royal Chariot", Icon: "🐎🏹" },
    { role: "Desert Scout", name: "Desert Scout", Icon: "🐎🏹" },
    { role: "Egyptian Catapult", name: "Egyptian Catapult", Icon: "⚙️" }
  ],
  Thracians: [
    { role: "Thracian King", name: "Thracian King", Icon: "👑" },
    { role: "Thracian Warrior", name: "Thracian Warrior", Icon: "⚔️" },
    { role: "Rhomphaia Fighter", name: "Rhomphaia Fighter", Icon: "⚔️" },
    { role: "Falx Warrior", name: "Falx Warrior", Icon: "⚔️" },
    { role: "Thracian Spearman", name: "Thracian Spearman", Icon: "⚔️" },
    { role: "Thracian Guard", name: "Thracian Guard", Icon: "⚔️" },
    { role: "Thracian Peltast", name: "Thracian Peltast", Icon: "🏹" },
    { role: "Thracian Archer", name: "Thracian Archer", Icon: "🏹" },
    { role: "Thracian Rider", name: "Thracian Rider", Icon: "🐎" },
    { role: "Thracian Noble Rider", name: "Thracian Noble Rider", Icon: "🐎" },
    { role: "War Drummer", name: "War Drummer", Icon: "🥁" },
    { role: "Thracian Catapult", name: "Thracian Catapult", Icon: "⚙️" }
  ],
  Dacians: [
    { role: "Dacian King", name: "Dacian King", Icon: "👑" },
    { role: "Dacian Warrior", name: "Dacian Warrior", Icon: "⚔️" },
    { role: "Falxman", name: "Falxman", Icon: "⚔️" },
    { role: "Dacian Spearman", name: "Dacian Spearman", Icon: "⚔️" },
    { role: "Dacian Shield Bearer", name: "Dacian Shield Bearer", Icon: "⚔️" },
    { role: "Dacian Guard", name: "Dacian Guard", Icon: "⚔️" },
    { role: "Dacian Slinger", name: "Dacian Slinger", Icon: "🏹" },
    { role: "Dacian Archer", name: "Dacian Archer", Icon: "🏹" },
    { role: "Dacian Rider", name: "Dacian Rider", Icon: "🐎" },
    { role: "Dacian Noble Rider", name: "Dacian Noble Rider", Icon: "🐎" },
    { role: "War Horn", name: "War Horn", Icon: "📯" },
    { role: "Dacian Catapult", name: "Dacian Catapult", Icon: "⚙️" }
  ],
  Parthians: [
    { role: "Parthian King", name: "Parthian King", Icon: "👑" },
    { role: "Parthian Warrior", name: "Parthian Warrior", Icon: "⚔️" },
    { role: "Parthian Spearman", name: "Parthian Spearman", Icon: "⚔️" },
    { role: "Parthian Cataphract", name: "Cataphract", Icon: "🐎" },
    { role: "Parthian Noble Rider", name: "Parthian Noble Rider", Icon: "🐎" },
    { role: "Horse Archer", name: "Horse Archer", Icon: "🏹🐎" },
    { role: "Elite Horse Archer", name: "Elite Horse Archer", Icon: "🏹🐎" },
    { role: "Parthian Archer", name: "Parthian Archer", Icon: "🏹" },
    { role: "Scout Rider", name: "Scout Rider", Icon: "🐎" },
    { role: "Camel Rider", name: "Camel Rider", Icon: "🐪" },
    { role: "Camel Rider Archer", name: "Camel Rider Archer", Icon: "🐪🏹" },
    { role: "Parthian Ballista", name: "Parthian Ballista", Icon: "⚙️" }
  ],
  Seleucids: [
    { role: "Seleucid King", name: "Seleucid King", Icon: "👑" },
    { role: "Seleucid Phalangite", name: "Phalangite", Icon: "⚔️" },
    { role: "Silver Shield Infantry", name: "Silver Shield Infantry", Icon: "⚔️" },
    { role: "Thorakitai", name: "Thorakitai", Icon: "⚔️" },
    { role: "Eastern Spearman", name: "Eastern Spearman", Icon: "⚔️" },
    { role: "Seleucid War Elephant", name: "War Elephant", Icon: "🐘" },
    { role: "Seleucid Cataphract", name: "Cataphract", Icon: "🐎" },
    { role: "Seleucid Light Cavalry", name: "Light Cavalry", Icon: "🐎" },
    { role: "Eastern Archer", name: "Eastern Archer", Icon: "🏹" },
    { role: "Seleucid Slinger", name: "Slinger", Icon: "🏹" },
    { role: "Seleucid Elephant Archer", name: "Seleucid Elephant Archer", Icon: "🐘🏹" },

    { role: "Seleucid Catapult", name: "Seleucid Catapult", Icon: "⚙️" }
  ],
  Vikings: [
    { role: "Jarl", name: "Viking Jarl", Icon: "👑" },
    { role: "Viking Raider", name: "Viking Raider", Icon: "⚔️" },
    { role: "Berserker", name: "Berserker", Icon: "⚔️" },
    { role: "Shieldmaiden", name: "Shieldmaiden", Icon: "⚔️" },
    { role: "Huscarl", name: "Huscarl", Icon: "⚔️" },
    { role: "Bondi Spearman", name: "Bondi Spearman", Icon: "⚔️" },
    { role: "Hirdman", name: "Hirdman", Icon: "⚔️" },
    { role: "Ulfhednar", name: "Ulfhednar", Icon: "⚔️" },
    { role: "Varangian Guard", name: "Varangian Guard", Icon: "⚔️" },
    { role: "Jomsviking", name: "Jomsviking", Icon: "⚔️" },
    { role: "Scout", name: "Scout", Icon: "🐎🏹" },
    { role: "Viking Archer", name: "Viking Archer", Icon: "🏹" }
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

const halveAmmo = (ammo: number) => {
  if (ammo <= 0) return 0;
  return Math.max(1, Math.ceil(ammo / 2));
};

const usesAmmoRole = (unit: any) => {
  const normalizedRole = String(unit?.role ?? unit?.name ?? "").toLowerCase();
  return [
    "archer",
    "longbow",
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
    "bombard",
    "barbarian scout",
    "gallic chariot",
    "royal chariot",
    "desert scout",
    "scout",
    "horse archer"
  ].some((keyword) => normalizedRole.includes(keyword));
};

const hasNoAmmoPenalty = (unit: any) => usesAmmoRole(unit) && (unit?.ammo ?? 0) <= 0;

const isHybridMountedRangedUnit = (unit: any) => {
  const normalizedRole = String(unit?.role ?? unit?.name ?? "").toLowerCase();
  const mountedKeywords = ["cavalry", "chariot", "rider", "scout", "knight", "elephant", "horse", "camel", "cataphract"];
  const hasMountedTrait = mountedKeywords.some((keyword) => normalizedRole.includes(keyword));
  return hasMountedTrait && (unit?.ammo ?? 0) > 0 && (unit?.range ?? 1) > 1;
};

const getTroopTypeDisplay = (unit: any) => {
  if (isHybridMountedRangedUnit(unit)) {
    return {
      icon: "🐎🏹",
      label: "Hybrid",
      type: "hybrid"
    } as const;
  }

  const troopType = getTroopMechanicType(unit);
  return {
    icon: TROOP_MECHANIC_ICONS[troopType],
    label: TROOP_MECHANIC_LABELS[troopType],
    type: troopType
  } as const;
};

const getTroopSearchKeywords = (unit: any, team?: TeamName) => {
  const troopTypeDisplay = getTroopTypeDisplay(unit);
  const abilityKeywords = getTroopAbilities(String(unit?.role ?? unit?.name ?? ""))
    .flatMap((ability) => [ability.name.toLowerCase(), ability.key.toLowerCase(), "skill", "skills", "ability", "abilities", "passive", "passives"]);
  const keywords = [
    String(unit?.name ?? "").toLowerCase(),
    String(unit?.role ?? "").toLowerCase(),
    String(team ?? unit?.team ?? "").toLowerCase(),
    troopTypeDisplay.label.toLowerCase(),
    troopTypeDisplay.type.toLowerCase(),
    ...abilityKeywords
  ];

  if (troopTypeDisplay.type === "hybrid") {
    keywords.push("mounted", "ranged", "mounted ranged", "mounted+ranged", "horse archer", "hybrid");
  }

  if (troopTypeDisplay.type === "ranged") {
    keywords.push("archer", "projectile", "missile");
  }

  if (troopTypeDisplay.type === "mounted") {
    keywords.push("cavalry", "horse", "mobile");
  }

  if (troopTypeDisplay.type === "closecombat") {
    keywords.push("melee", "close combat", "infantry");
  }

  if (troopTypeDisplay.type === "sieged") {
    keywords.push("siege", "artillery", "engine");
  }

  if (isLeaderRole(String(unit?.role ?? unit?.name ?? ""))) {
    keywords.push("leader", "commander", "king", "general");
  }

  return Array.from(new Set(keywords.filter(Boolean)));
};

const LEVEL_MATCHUP_LABELS: Record<keyof typeof levels, string> = {
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

const BACKGROUND_MUSIC_SRC = "/Crown%20of%20Ashes.mp3";
const ALL_TEAMS = ["Romans", "Barbarians", "Greeks", "Gauls", "Germanic", "Carthage", "Egypt", "Thracians", "Dacians", "Parthians", "Seleucids", "Vikings"] as const;
const GRID_ORIENTATIONS = ["north", "east", "south", "west"] as const;
const TEAM_SELECT_GROUPS = [
  { label: "Ancient Powers", teams: ["Romans", "Greeks", "Carthage", "Egypt", "Seleucids"] as TeamName[] },
  { label: "Border Kingdoms", teams: ["Thracians", "Dacians", "Parthians"] as TeamName[] },
  { label: "Tribal Realms", teams: ["Barbarians", "Gauls", "Germanic", "Vikings"] as TeamName[] }
] as const;

type GameMode = "single-player" | "multiplayer" | "custom-scenario";
type TeamName = "Romans" | "Barbarians" | "Greeks" | "Gauls" | "Germanic" | "Carthage" | "Egypt" | "Thracians" | "Dacians" | "Parthians" | "Seleucids" | "Vikings";
type UnitsReferenceScope = TeamName | "All";
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
  sfxEnabled: boolean;
  showMoveHighlights: boolean;
  showAttackHighlights: boolean;
  showBattleLog: boolean;
  showTurnBanner: boolean;
  terrainEffectsEnabled: boolean;
  battlefieldSize: BattlefieldSize;
};

type BattleFeedbackKind = "hit" | "death" | "charge" | "morale" | "ranged";

type ProjectileFeedback = {
  id: string;
  variant: "arrow" | "siege" | "charge";
  startX: number;
  startY: number;
  angle: number;
  distance: number;
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

const getBattleLogAppearance = (entry: string) => {
  const normalizedEntry = String(entry ?? "").toLowerCase();
  if (normalizedEntry.includes(" was killed")) {
    return {
      accent: "border-red-500/70",
      text: "text-red-100",
      bg: "bg-red-950/45"
    };
  }
  if (normalizedEntry.includes(" attacked ")) {
    return {
      accent: "border-orange-400/70",
      text: "text-orange-100",
      bg: "bg-orange-950/35"
    };
  }
  if (normalizedEntry.includes("charge") || normalizedEntry.includes("crashed into")) {
    return {
      accent: "border-amber-400/70",
      text: "text-amber-100",
      bg: "bg-amber-950/35"
    };
  }
  if (normalizedEntry.includes("shaken") || normalizedEntry.includes("morale")) {
    return {
      accent: "border-violet-400/70",
      text: "text-violet-100",
      bg: "bg-violet-950/35"
    };
  }
  if (normalizedEntry.includes("moved onto") || normalizedEntry.includes("repositioned") || normalizedEntry.includes("advanced")) {
    return {
      accent: "border-sky-400/70",
      text: "text-sky-100",
      bg: "bg-sky-950/35"
    };
  }
  if (normalizedEntry.includes("merge")) {
    return {
      accent: "border-fuchsia-400/70",
      text: "text-fuchsia-100",
      bg: "bg-fuchsia-950/35"
    };
  }
  return {
    accent: "border-yellow-500/60",
    text: "text-yellow-100",
    bg: "bg-black/25"
  };
};

const ensureRangedAmmo = (unit: any) => {
  if (!unit) return unit;

  const normalizedUnit = { ...unit };
  const normalizedRole = String(normalizedUnit.role ?? normalizedUnit.name ?? "").toLowerCase();
  const projectileKeywords = [
    "archer",
    "longbow",
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
    "bombard",
    "barbarian scout",
    "gallic chariot",
    "royal chariot",
    "desert scout",
    "scout",
    "horse archer",
    "elephant archer"
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
  const isHybridMountedRangedUnit = ["barbarian scout", "gallic chariot", "royal chariot", "desert scout", "scout", "horse archer", "camel rider archer", "elephant archer"].some((keyword) =>
    normalizedRole.includes(keyword)
  );

  let minimumRange = 4;
  let minimumAmmo = 12;

  if (isSiegeUnit) {
    minimumRange = 6;
    minimumAmmo = 8;
  } else if (isHybridMountedRangedUnit) {
    minimumRange = 3;
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
  normalizedUnit.ammo = halveAmmo(Math.max(minimumAmmo, normalizedUnit.ammo ?? 0));

  return normalizedUnit;
};

const getTroopMechanicType = (unit: any): TroopMechanicType => {
  if (!unit) return "closecombat";

  const role = String(unit.role ?? "").toLowerCase();
  const siegeKeywords = ["ballista", "scorpion", "catapult", "trebuchet", "polybolos", "siege tower", "onager", "bombard"];
  const mountedKeywords = ["cavalry", "chariot", "rider", "scout", "knight", "elephant", "horse", "camel", "cataphract"];

  if (siegeKeywords.some((keyword) => role.includes(keyword))) {
    return "sieged";
  }

  if (usesAmmoRole(unit) && (unit.ammo ?? 0) <= 0) {
    return "closecombat";
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
  return ["king", "jarl", "general", "leader", "marshal", "pharaoh"].some((keyword) => normalizedRole.includes(keyword));
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
  const defenderTerrain = getTerrainAt(terrainMap, defender?.x ?? 0, defender?.y ?? 0);
  const terrainModifiers = getTerrainModifiers(attacker, attackerTerrain);
  const hasTerrainModifier = terrainModifiers.attackMultiplier !== 1;
  let damage = attacker.attack;

  if (hasNoAmmoPenalty(attacker)) {
    damage = Math.round(damage * 0.5);
  }

  if (hasLeaderAura) {
    damage = Math.round(damage * LEADER_AURA_ATTACK_MULTIPLIER);
  }

  if (hasTerrainModifier) {
    damage = Math.round(damage * terrainModifiers.attackMultiplier);
  }

  const abilityEffects = getAbilityEffects(attacker, defender, allUnits, attackerTerrain, defenderTerrain);
  if (abilityEffects.attackMultiplier !== 1) {
    damage = Math.round(damage * abilityEffects.attackMultiplier);
  }

  if (hasAdvantage) {
    damage = Math.round(damage * TROOP_MECHANIC_ADVANTAGE_MULTIPLIER);
  }

  if (abilityEffects.damageTakenMultiplier !== 1) {
    damage = Math.round(damage * abilityEffects.damageTakenMultiplier);
  }

  return {
    damage,
    attackerType,
    defenderType,
    hasAdvantage,
    hasLeaderAura,
    hasTerrainModifier,
    terrainType: attackerTerrain,
    terrainLabel: terrainModifiers.terrainLabel,
    abilityTags: [...abilityEffects.attackerTags, ...abilityEffects.defenderTags]
  };
};

const getDisplayedAttack = (unit: any, allUnits: any[] = [], terrainMap: TerrainType[][] = []) => {
  if (!unit) return 0;

  let displayedAttack = unit.attack;
  const terrainModifiers = getTerrainModifiers(unit, getTerrainAt(terrainMap, unit.x, unit.y));

  if (hasNoAmmoPenalty(unit)) {
    displayedAttack = Math.round(displayedAttack * 0.5);
  }

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

  if (getAdjacentCommanders(unit, allUnits).length > 0) {
    notes.push("Command Aura: +5% attack from an adjacent commander");
  }

  if (unit.roleHealthBuffActive) {
    notes.push(`Formation Buff: +${Math.round(((unit.roleHealthBuffMultiplier ?? 1) - 1) * 100)}% max health`);
  }

  if (hasNoAmmoPenalty(unit)) {
    notes.push("Out of Ammo: -50% attack");
  }

  if (terrainEffectsEnabled) {
    const terrainNotes = getTerrainModifiers(unit, getTerrainAt(terrainMap, unit.x, unit.y)).notes;
    terrainNotes.forEach((note) => notes.push(`Terrain: ${note}`));
  }

  getTroopAbilities(unit.role).forEach((ability) => {
    switch (ability.key) {
      case "shieldWall":
        if (getAdjacentAllies(unit, allUnits).length > 0) {
          notes.push(`${ability.name}: active while holding formation next to an ally`);
        } else {
          notes.push(`${ability.name}: ${ability.description}`);
        }
        break;
      case "charge":
        if (getTerrainAt(terrainMap, unit.x, unit.y) === "plain") {
          notes.push(`${ability.name}: active on open ground`);
        } else {
          notes.push(`${ability.name}: ${ability.description}`);
        }
        break;
      case "guarded":
        if ((unit?.hp ?? 0) > Math.ceil((unit?.maxHp ?? 0) * 0.5)) {
          notes.push(`${ability.name}: active while above half health`);
        } else {
          notes.push(`${ability.name}: ${ability.description}`);
        }
        break;
      case "ferocity":
        if (getAdjacentAllies(unit, allUnits).length === 0) {
          notes.push(`${ability.name}: active while fighting away from allied support`);
        } else {
          notes.push(`${ability.name}: ${ability.description}`);
        }
        break;
      case "deadeye":
        if (getTerrainAt(terrainMap, unit.x, unit.y) === "hill") {
          notes.push(`${ability.name}: active high-ground range bonus`);
        } else {
          notes.push(`${ability.name}: ${ability.description}`);
        }
        break;
      case "crush":
        notes.push(`${ability.name}: extra damage against close-combat and defensive units`);
        break;
      case "command":
        notes.push(`${ability.name}: adjacent allies gain +5% attack`);
        break;
      case "siegeMastery":
        if (getTerrainAt(terrainMap, unit.x, unit.y) === "hill") {
          notes.push(`${ability.name}: active elevated range and damage bonus`);
        } else if (getTerrainAt(terrainMap, unit.x, unit.y) === "plain") {
          notes.push(`${ability.name}: active stable-ground damage bonus`);
        } else {
          notes.push(`${ability.name}: ${ability.description}`);
        }
        break;
      case "skirmishStep":
        if ((unit?.ammo ?? 0) > 0) {
          notes.push(`${ability.name}: active +1 move while ammunition lasts`);
        } else {
          notes.push(`${ability.name}: ${ability.description}`);
        }
        break;
      case "resolve":
        if (hasAdjacentWoundedAlly(unit, allUnits)) {
          notes.push(`${ability.name}: active near a wounded ally`);
        } else {
          notes.push(`${ability.name}: ${ability.description}`);
        }
        break;
      default:
        notes.push(`${ability.name}: ${ability.description}`);
        break;
    }
  });

  return notes;
};

const ROLE_HEALTH_BUFF_PER_EXTRA_UNIT = 0.05;
const ROLE_HEALTH_BUFF_MIN_GROUP_SIZE = 2;
const GAME_MECHANICS_INFO = [
  {
    icon: "⚔️",
    title: "Troop Type Matchups",
    description: "Only mounted troops get a type advantage. They deal +10% attack damage against ranged and sieged units."
  },
  {
    icon: "🧱",
    title: "Role Formation Buff",
    description: "Adjacent allied troops with the same role gain scaling max health: 2 units = +5%, 3 = +10%, 4 = +15%, and larger groups keep scaling while connected."
  },
  {
    icon: "👑",
    title: "Leader Aura",
    description: "Troops directly next to a King, Jarl, General, or Leader gain +10% attack."
  },
  {
    icon: "🏹",
    title: "Ranged Shots",
    description: "Ranged and sieged troops have limited shots. When they run dry, they can no longer fire effectively."
  },
  {
    icon: "🧬",
    title: "Merge Limit",
    description: "You can merge adjacent same-role troops into elite units a limited number of times each battle."
  },
  {
    icon: "🗺️",
    title: "Dynamic Terrain",
    description: "Every new battle generates fresh terrain. Forests add cover, hills extend firing lanes, rivers punish heavy crossings, plains favor charges, and deserts wear down non-native armies."
  }
] as const;

const ADDITIONAL_MECHANICS_INFO = [
  {
    icon: "🐎🏹",
    title: "Hybrid Troops",
    description: "Mounted-ranged units are shown as Hybrid in the UI. While they still have ammo, they fight as ranged attackers and keep their two-icon identity."
  },
  {
    icon: "🪫",
    title: "Ammo Exhaustion",
    description: "Every shot spends 1 ammo. At 0 ammo, the unit drops to range 1 and attacks at half power, turning ranged hybrids into close-combat fighters."
  },
  {
    icon: "🏴",
    title: "Civilization Passives",
    description: "Each faction applies a passive bonus before battle starts, which can change movement, health, range, or attack depending on the civilization."
  },
  {
    icon: "✨",
    title: "Signature Unit Abilities",
    description: "Selected roles now carry passive signature abilities like Brace, Shield Wall, Charge, Harrier, Shock Assault, Guarded, Deadeye, Crush, Command Aura, Siege Mastery, Skirmish Step, and Resolve that trigger automatically during combat."
  },
  {
    icon: "🎺",
    title: "Battle Sound Cues",
    description: "Music and battle SFX are now separated. Turn stingers, impact sounds, charge hits, projectile releases, and morale breaks help you read combat momentum by ear."
  },
  {
    icon: "💥",
    title: "Battlefield Feedback",
    description: "Temporary hit, death, ranged, charge, projectile, and morale effects pulse directly on the grid so critical events stand out without slowing the battle down."
  },
  {
    icon: "🔒",
    title: "Terrain Lock",
    description: "Terrain settings and regeneration are only available before combat starts. Once the battle begins, the battlefield is locked for the rest of the match."
  }
] as const;

const UNIT_ABILITY_MECHANICS_INFO = [
  {
    icon: "🛡️",
    title: "Brace",
    detail: "Spear and phalanx troops deal +15% damage into mounted enemies and take 15% less damage when receiving a mounted charge."
  },
  {
    icon: "🧱",
    title: "Shield Wall",
    detail: "Defensive infantry take 10% less damage while standing adjacent to at least 1 allied unit."
  },
  {
    icon: "🔥",
    title: "Shock Assault",
    detail: "Berserker and falx-style shock troops hit 20% harder against targets already at or below half health."
  },
  {
    icon: "🐎",
    title: "Charge",
    detail: "Mounted shock troops gain +15% damage on plains and gain another +10% when crashing into ranged or siege units."
  },
  {
    icon: "🏹",
    title: "Harrier",
    detail: "Skirmishers and horse archers deal +10% damage while they still have ammo against targets with 1 or less move, and against siege crews."
  },
  {
    icon: "🪖",
    title: "Guarded",
    detail: "Heavy line troops take 10% less damage while they stay above half health."
  },
  {
    icon: "🪓",
    title: "Ferocity",
    detail: "Aggressive fighters gain +10% attack when they are not standing next to an allied unit."
  },
  {
    icon: "🎯",
    title: "Deadeye",
    detail: "Precision archers gain +1 range on hills and deal +10% damage into unsupported ranged or siege targets."
  },
  {
    icon: "🐘",
    title: "Crush",
    detail: "Elephants and impact troops deal +15% damage into close-combat units and gain another +5% against Guarded or Shield Wall defenders."
  },
  {
    icon: "🏴",
    title: "Command Aura",
    detail: "Allies adjacent to a command unit gain +5% attack, stacking with the normal +10% leader aura when present."
  },
  {
    icon: "🏰",
    title: "Siege Mastery",
    detail: "Siege engines gain +10% attack from plains or hills and gain +1 extra range on hills."
  },
  {
    icon: "🪶",
    title: "Skirmish Step",
    detail: "Mobile skirmish troops gain +1 move while they still have ammunition."
  },
  {
    icon: "⚡",
    title: "Resolve",
    detail: "Elite troops gain +10% attack when an adjacent allied unit is at or below 50% HP."
  }
] as const;

const AI_MECHANICS_INFO = [
  "Front-line melee units now push harder and value moves that create an immediate attack on the next turn.",
  "The AI focuses wounded enemies, exposed ranged units, siege crews, and isolated leaders more aggressively.",
  "Ranged and siege troops still prefer safer firing ground, but they now step into pressure range sooner instead of drifting too far back.",
  "Mounted units prefer flank lanes, open ground, and fast collapses onto fragile back-line targets.",
  "Leaders stay more disciplined than other roles, but the army as a whole is less hesitant and avoids sideways stalling.",
  "If the advanced scorer cannot find a premium action, the AI still falls back to a nearest-target attack or direct advance."
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
      "Ranged troops gain +5% attack in forest cover.",
      "Mounted troops suffer -1 move and -15% attack in dense woods.",
      "Sieged troops suffer -1 move and -10% attack in forests.",
      "Non-mounted defenders take 8% less incoming damage in forest cover.",
      "Gauls and Germanic troops gain +10% attack and +1 move in forests."
    ]
  },
  {
    terrain: "hill",
    summary: "Elevated ground that improves firing positions and slows rapid troops.",
    effects: [
      "Ranged troops gain +15% attack and +1 range from high ground.",
      "Closecombat troops gain +5% attack on hills.",
      "Mounted troops lose 1 move climbing hills.",
      "Sieged troops gain +10% attack and +1 range from elevated positions.",
      "Greeks and Egypt gain +10% attack on hills."
    ]
  },
  {
    terrain: "river",
    summary: "Water lanes disrupt combat flow unless a faction is good at crossing.",
    effects: [
      "Closecombat troops suffer -10% attack while fighting through water.",
      "Mounted troops suffer -2 move and -10% attack in rivers.",
      "Sieged troops suffer -2 move and -15% attack in rivers.",
      "Romans and Carthage gain +5% attack and +1 move in rivers."
    ]
  },
  {
    terrain: "desert",
    summary: "Dry, punishing terrain that drains movement and weakens ranged fire.",
    effects: [
      "All non-mounted troops lose 1 move in desert terrain.",
      "Ranged troops suffer -15% attack from dust and heat.",
      "Sieged troops suffer -15% attack in desert sand.",
      "Carthage, Barbarians, Egypt, and Parthians gain +10% attack and +1 move in deserts."
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
  let damageTakenMultiplier = 1;
  let moveDelta = 0;
  let rangeBonus = 0;
  const notes: string[] = [];

  switch (terrainType) {
    case "forest":
      if (troopType === "ranged") {
        attackMultiplier *= 1.05;
        notes.push("+5% attack for ranged cover");
      }
      if (troopType === "mounted") {
        moveDelta -= 1;
        attackMultiplier *= 0.85;
        notes.push("-1 move and -15% attack for mounted troops in dense woods");
      }
      if (troopType === "sieged") {
        moveDelta -= 1;
        attackMultiplier *= 0.9;
        notes.push("-1 move and -10% attack for siege engines in forests");
      }
      if (troopType !== "mounted") {
        damageTakenMultiplier *= 0.92;
        notes.push("-8% incoming damage from forest cover");
      }
      if (unit.team === "Gauls" || unit.team === "Germanic") {
        attackMultiplier *= 1.1;
        moveDelta += 1;
        notes.push("+10% attack and +1 move for woodland factions");
      }
      break;
    case "hill":
      if (troopType === "ranged") {
        attackMultiplier *= 1.15;
        rangeBonus += 1;
        notes.push("+15% attack and +1 range from high ground");
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
        rangeBonus += 1;
        notes.push("+10% attack and +1 range from elevated siege positions");
      }
      if (unit.team === "Greeks" || unit.team === "Egypt") {
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
        moveDelta -= 2;
        attackMultiplier *= 0.9;
        notes.push("-2 move and -10% attack for mounted troops in rivers");
      }
      if (troopType === "sieged") {
        moveDelta -= 2;
        attackMultiplier *= 0.85;
        notes.push("-2 move and -15% attack for siege engines in rivers");
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
        attackMultiplier *= 0.85;
        notes.push("-15% attack from dust and heat");
      }
      if (troopType === "sieged") {
        attackMultiplier *= 0.85;
        notes.push("-15% attack for siege engines in shifting sand");
      }
      if (unit.team === "Carthage" || unit.team === "Barbarians" || unit.team === "Egypt" || unit.team === "Parthians") {
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
    damageTakenMultiplier,
    moveDelta,
    rangeBonus,
    notes
  };
};

const getEffectiveMove = (unit: any, terrainMap: TerrainType[][]) => {
  if (!unit) return 0;
  const terrainType = getTerrainAt(terrainMap, unit.x, unit.y);
  const modifiers = getTerrainModifiers(unit, terrainType);
  const skirmishStepBonus = getTroopAbilities(unit.role).some((ability) => ability.key === "skirmishStep") && (unit?.ammo ?? 0) > 0 ? 1 : 0;
  return Math.max(1, unit.move + modifiers.moveDelta + skirmishStepBonus);
};

const getEffectiveRange = (unit: any, terrainMap: TerrainType[][]) => {
  if (!unit) return 0;
  const terrainType = getTerrainAt(terrainMap, unit.x, unit.y);
  const modifiers = getTerrainModifiers(unit, terrainType);
  const abilities = getTroopAbilities(unit.role);
  let abilityRangeBonus = 0;
  if (terrainType === "hill" && abilities.some((ability) => ability.key === "deadeye")) {
    abilityRangeBonus += 1;
  }
  if (terrainType === "hill" && abilities.some((ability) => ability.key === "siegeMastery")) {
    abilityRangeBonus += 1;
  }
  return Math.max(1, unit.range + modifiers.rangeBonus + abilityRangeBonus);
};

const getAdjacentAllies = (unit: any, allUnits: any[] = []) =>
  allUnits.filter((candidate) => {
    if (!unit || !candidate || candidate.id === unit.id || candidate.hp <= 0) return false;
    if (candidate.team !== unit.team) return false;
    return Math.abs(candidate.x - unit.x) + Math.abs(candidate.y - unit.y) === 1;
  });

const unitHasAbility = (unit: any, abilityKey: string) =>
  getTroopAbilities(unit?.role ?? "").some((ability) => ability.key === abilityKey);

const getAdjacentCommanders = (unit: any, allUnits: any[] = []) =>
  getAdjacentAllies(unit, allUnits).filter((candidate) => unitHasAbility(candidate, "command"));

const hasAdjacentWoundedAlly = (unit: any, allUnits: any[] = []) =>
  getAdjacentAllies(unit, allUnits).some((candidate) => candidate.hp <= Math.ceil(candidate.maxHp * 0.5));

const getAbilityEffects = (
  attacker: any,
  defender: any,
  allUnits: any[] = [],
  attackerTerrain: TerrainType,
  defenderTerrain: TerrainType
) => {
  const attackerAbilities = getTroopAbilities(attacker?.role ?? "");
  const defenderAbilities = getTroopAbilities(defender?.role ?? "");
  const attackerType = getTroopMechanicType(attacker);
  const defenderType = getTroopMechanicType(defender);
  const attackerTags: string[] = [];
  const defenderTags: string[] = [];
  let attackMultiplier = 1;
  let damageTakenMultiplier = 1;

  attackerAbilities.forEach((ability) => {
    switch (ability.key) {
      case "brace":
        if (defenderType === "mounted") {
          attackMultiplier *= 1.15;
          attackerTags.push("Brace");
        }
        break;
      case "shieldWall":
        break;
      case "shock":
        if ((defender?.hp ?? 0) <= Math.ceil((defender?.maxHp ?? 0) * 0.5)) {
          attackMultiplier *= 1.2;
          attackerTags.push("Shock Assault");
        }
        break;
      case "charge":
        if (attackerTerrain === "plain" && attackerType === "mounted") {
          attackMultiplier *= 1.15;
          attackerTags.push("Charge");
        }
        if (defenderType === "ranged" || defenderType === "sieged") {
          attackMultiplier *= 1.1;
          if (!attackerTags.includes("Charge")) attackerTags.push("Charge");
        }
        break;
      case "harrier":
        if ((attacker?.ammo ?? 0) > 0 && ((defender?.move ?? 0) <= 1 || defenderType === "sieged")) {
          attackMultiplier *= 1.1;
          attackerTags.push("Harrier");
        }
        break;
      case "guarded":
        break;
      case "ferocity":
        if (getAdjacentAllies(attacker, allUnits).length === 0) {
          attackMultiplier *= 1.1;
          attackerTags.push("Ferocity");
        }
        break;
      case "deadeye":
        if (
          (defenderType === "ranged" || defenderType === "sieged") &&
          getAdjacentAllies(defender, allUnits).length === 0
        ) {
          attackMultiplier *= 1.1;
          attackerTags.push("Deadeye");
        }
        break;
      case "crush":
        if (defenderType === "closecombat") {
          attackMultiplier *= 1.15;
          attackerTags.push("Crush");
        }
        if (defenderAbilities.some((defenderAbility) => defenderAbility.key === "shieldWall" || defenderAbility.key === "guarded")) {
          attackMultiplier *= 1.05;
          if (!attackerTags.includes("Crush")) attackerTags.push("Crush");
        }
        break;
      case "command":
        break;
      case "siegeMastery":
        if (attackerType === "sieged" && (attackerTerrain === "plain" || attackerTerrain === "hill")) {
          attackMultiplier *= 1.1;
          attackerTags.push("Siege Mastery");
        }
        break;
      case "skirmishStep":
        break;
      case "resolve":
        if (hasAdjacentWoundedAlly(attacker, allUnits)) {
          attackMultiplier *= 1.1;
          attackerTags.push("Resolve");
        }
        break;
    }
  });

  if (getAdjacentCommanders(attacker, allUnits).length > 0) {
    attackMultiplier *= 1.05;
    attackerTags.push("Command Aura");
  }

  defenderAbilities.forEach((ability) => {
    switch (ability.key) {
      case "brace":
        if (attackerType === "mounted") {
          damageTakenMultiplier *= 0.85;
          defenderTags.push("Brace");
        }
        break;
      case "shieldWall":
        if (getAdjacentAllies(defender, allUnits).length > 0) {
          damageTakenMultiplier *= 0.9;
          defenderTags.push("Shield Wall");
        }
        break;
      case "guarded":
        if ((defender?.hp ?? 0) > Math.ceil((defender?.maxHp ?? 0) * 0.5)) {
          damageTakenMultiplier *= 0.9;
          defenderTags.push("Guarded");
        }
        break;
      default:
        break;
    }
  });

  const defenderTerrainModifiers = getTerrainModifiers(defender, defenderTerrain);
  if (defenderTerrainModifiers.damageTakenMultiplier !== 1) {
    damageTakenMultiplier *= defenderTerrainModifiers.damageTakenMultiplier;
    defenderTags.push(`${defenderTerrainModifiers.terrainLabel} Cover`);
  }

  return {
    attackMultiplier,
    damageTakenMultiplier,
    attackerTags,
    defenderTags
  };
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
  Greeks: { name: "Phalanx Mastery", effect: "+1 range (infantry), -1 move (infantry)" },
  Gauls: { name: "Swift Warriors", effect: "+1 move, -10% hp" },
  Germanic: { name: "Brutal Strength", effect: "+15% attack" },
  Carthage: { name: "Mercenary Tactics", effect: "+10% hp, +10% attack, -10% move" },
  Egypt: { name: "Chariot Kingdom", effect: "+1 move (mounted), +10% attack (ranged)" },
  Thracians: { name: "Hill Raiders", effect: "+10% attack (infantry), +1 move (ranged)" },
  Dacians: { name: "Falx Discipline", effect: "+10% hp, +10% attack" },
  Parthians: { name: "Parthian Shot", effect: "+1 move (mounted), +10% attack (ranged)" },
  Seleucids: { name: "Imperial Arms", effect: "+10% hp (infantry), +10% attack (siege and elephants)" },
  Vikings: { name: "Relentless Raiders", effect: "+1 move, +10% attack, -10% hp" }
};

const PASSIVE_ICONS: Record<TeamName, string> = {
  Romans: "🛡️",
  Barbarians: "🔥",
  Greeks: "🗡️",
  Gauls: "🍃",
  Germanic: "🪓",
  Carthage: "🐘",
  Egypt: "☀️",
  Thracians: "🗡️",
  Dacians: "🐺",
  Parthians: "🏹",
  Seleucids: "🏺",
  Vikings: "⛵"
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
const GAME_VERSION = "0.0.0";
const GAME_BUILD_LABEL = "Battle Feedback Pass";
const BATTLEFIELD_SIZE_OPTIONS: BattlefieldSize[] = [8, 10, 12, 14, 16, 18, 20];
const DEFAULT_GAME_OPTIONS: GameOptions = {
  musicEnabled: true,
  sfxEnabled: true,
  showMoveHighlights: true,
  showAttackHighlights: true,
  showBattleLog: true,
  showTurnBanner: true,
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

const getBattlefieldUnitLabel = (unit: any) => {
  const baseLabel = String(unit?.name ?? unit?.role ?? "").trim();
  if (!baseLabel) return "Unit";

  const compactLabel = baseLabel.split(" ").slice(0, 2).join(" ");
  return compactLabel.length > 14 ? `${compactLabel.slice(0, 13)}...` : compactLabel;
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
    "horse",
    "camel",
    "cataphract",
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
    case "Gauls":
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
    case "Egypt": {
      const troopType = getTroopMechanicType(normalizedUnit);
      if (troopType === "mounted") {
        normalizedUnit.move += 1;
      }
      if (troopType === "ranged") {
        normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      }
      break;
    }
    case "Thracians":
      if (isInfantryRole(normalizedUnit.role)) {
        normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      }
      if (getTroopMechanicType(normalizedUnit) === "ranged") {
        normalizedUnit.move += 1;
      }
      break;
    case "Dacians":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, 0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, 0.1);
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      break;
    case "Parthians": {
      const normalizedRole = String(normalizedUnit.role ?? "").toLowerCase();
      if (["cavalry", "rider", "horse", "camel", "cataphract", "scout"].some((keyword) => normalizedRole.includes(keyword))) {
        normalizedUnit.move += 1;
      }
      if (getTroopMechanicType(normalizedUnit) === "ranged") {
        normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      }
      break;
    }
    case "Seleucids": {
      const normalizedRole = String(normalizedUnit.role ?? "").toLowerCase();
      if (isInfantryRole(normalizedUnit.role)) {
        normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, 0.1);
        normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, 0.1);
      }
      if (normalizedRole.includes("elephant") || getTroopMechanicType(normalizedUnit) === "sieged") {
        normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      }
      break;
    }
    case "Vikings":
      normalizedUnit.hp = adjustStatPercent(normalizedUnit.hp, -0.1);
      normalizedUnit.maxHp = adjustStatPercent(normalizedUnit.maxHp, -0.1);
      normalizedUnit.attack = adjustStatPercent(normalizedUnit.attack, 0.1);
      normalizedUnit.move += 1;
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
  const battlefieldGridRef = useRef<HTMLDivElement | null>(null);
  const battlefieldCellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const battlefieldPanStateRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number; moved: boolean } | null>(null);
  const battlefieldPanCleanupRef = useRef<(() => void) | null>(null);
  const skipNextGridClickRef = useRef(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const battleSfxRef = useRef<ReturnType<typeof createBattleSfxController> | null>(null);
  const lastTurnCueRef = useRef<string | null>(null);
  const feedbackTimeoutsRef = useRef<number[]>([]);
  const isRestoringSavedGameRef = useRef(false);
  const hasLoadedSavedGameRef = useRef(false);
  const [startScreen, setStartScreen] = useState<"menu" | "options" | "about">("menu");
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isInGameOptionsOpen, setIsInGameOptionsOpen] = useState(false);
  const [isInGameMechanicsOpen, setIsInGameMechanicsOpen] = useState(false);
  const [activeMechanicsSlide, setActiveMechanicsSlide] = useState(0);
  const [isInGameGraphicsOpen, setIsInGameGraphicsOpen] = useState(false);
  const [isInGameUnitsOpen, setIsInGameUnitsOpen] = useState(false);
  const [unitsReferenceTeam, setUnitsReferenceTeam] = useState<UnitsReferenceScope>("All");
  const [unitsReferenceQuery, setUnitsReferenceQuery] = useState("");
  const [isBattleLogPanelOpen, setIsBattleLogPanelOpen] = useState(false);
  const [isUnitPanelOpen, setIsUnitPanelOpen] = useState(false);
  const [gameOptions, setGameOptions] = useState<GameOptions>(DEFAULT_GAME_OPTIONS);
  const [isPanningGrid, setIsPanningGrid] = useState(false);
  const [hoverScrollDirection, setHoverScrollDirection] = useState<HoverScrollDirection>(null);
  const [cellFeedback, setCellFeedback] = useState<Record<string, BattleFeedbackKind[]>>({});
  const [projectileFeedback, setProjectileFeedback] = useState<ProjectileFeedback[]>([]);

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
    const controller = createBattleSfxController(0.55);
    controller.preload();
    battleSfxRef.current = controller;

    return () => {
      controller.dispose();
      battleSfxRef.current = null;
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
    return () => {
      feedbackTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      feedbackTimeoutsRef.current = [];
    };
  }, []);

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

  useEffect(() => {
    if (!gameStarted || isSetupMode || !gameMode) {
      lastTurnCueRef.current = null;
      return;
    }

    if (lastTurnCueRef.current === turn) return;
    lastTurnCueRef.current = turn;

    playBattleSfx(getTurnCueForTeam(turn), { cooldownMs: 350, volumeMultiplier: turn === playerTeam ? 1.08 : 0.82 });
  }, [gameMode, gameStarted, isSetupMode, playerTeam, turn]);

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
  const registerFeedbackTimeout = (callback: () => void, delayMs: number) => {
    const timeoutId = window.setTimeout(() => {
      feedbackTimeoutsRef.current = feedbackTimeoutsRef.current.filter((trackedId) => trackedId !== timeoutId);
      callback();
    }, delayMs);
    feedbackTimeoutsRef.current.push(timeoutId);
  };
  const triggerCellFeedback = (cellKey: string, kind: BattleFeedbackKind, durationMs: number) => {
    setCellFeedback((prev) => {
      const existingKinds = prev[cellKey] ?? [];
      if (existingKinds.includes(kind)) return prev;
      return {
        ...prev,
        [cellKey]: [...existingKinds, kind]
      };
    });

    registerFeedbackTimeout(() => {
      setCellFeedback((prev) => {
        const nextKinds = (prev[cellKey] ?? []).filter((currentKind) => currentKind !== kind);
        if (nextKinds.length === 0) {
          const { [cellKey]: _removed, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [cellKey]: nextKinds
        };
      });
    }, durationMs);
  };
  const triggerProjectileFeedback = (
    from: TerrainPoint,
    to: TerrainPoint,
    variant: ProjectileFeedback["variant"],
    durationMs = 420
  ) => {
    const gridRect = battlefieldGridRef.current?.getBoundingClientRect();
    const fromRect = battlefieldCellRefs.current[`${from.x},${from.y}`]?.getBoundingClientRect();
    const toRect = battlefieldCellRefs.current[`${to.x},${to.y}`]?.getBoundingClientRect();
    if (!gridRect || !fromRect || !toRect) return;

    const startX = fromRect.left - gridRect.left + fromRect.width / 2;
    const startY = fromRect.top - gridRect.top + fromRect.height / 2;
    const endX = toRect.left - gridRect.left + toRect.width / 2;
    const endY = toRect.top - gridRect.top + toRect.height / 2;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const projectileId = `${variant}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setProjectileFeedback((prev) => [
      ...prev,
      {
        id: projectileId,
        variant,
        startX,
        startY,
        angle: Math.atan2(deltaY, deltaX),
        distance: Math.hypot(deltaX, deltaY)
      }
    ]);

    registerFeedbackTimeout(() => {
      setProjectileFeedback((prev) => prev.filter((projectile) => projectile.id !== projectileId));
    }, durationMs);
  };
  const playBattleSfx = (
    key: BattleSfxKey,
    options?: { cooldownMs?: number; playbackRate?: number; volumeMultiplier?: number }
  ) => {
    if (!gameOptions.sfxEnabled) return;
    battleSfxRef.current?.play(key, options);
  };
  const triggerAttackFeedback = (
    attacker: any,
    defender: any,
    attackOutcome: ReturnType<typeof getAttackDamage>,
    options: {
      attackerPosition?: TerrainPoint | null;
      updatedTargetHp: number;
      isProjectile: boolean;
      moraleThreshold?: number;
    }
  ) => {
    const attackerPoint = options.attackerPosition ?? { x: attacker.x, y: attacker.y };
    const defenderKey = `${defender.x},${defender.y}`;
    const attackerKey = `${attackerPoint.x},${attackerPoint.y}`;
    const moraleThreshold = options.moraleThreshold ?? 0.35;

    triggerCellFeedback(defenderKey, "hit", 360);
    if (attackOutcome.abilityTags.includes("Charge")) {
      triggerCellFeedback(attackerKey, "charge", 520);
      playBattleSfx("charge-impact", { cooldownMs: 100, volumeMultiplier: 1.15 });
    } else if (options.isProjectile) {
      playBattleSfx("arrow-shot", { cooldownMs: 60, playbackRate: getTroopMechanicType(attacker) === "sieged" ? 0.84 : 1 });
    } else {
      playBattleSfx("melee-hit", { cooldownMs: 70, playbackRate: attackOutcome.hasAdvantage ? 0.96 : 1 });
    }

    if (options.isProjectile) {
      triggerProjectileFeedback(attackerPoint, { x: defender.x, y: defender.y }, getTroopMechanicType(attacker) === "sieged" ? "siege" : "arrow");
      triggerCellFeedback(attackerKey, "ranged", 260);
    } else if (attackOutcome.abilityTags.includes("Charge")) {
      triggerProjectileFeedback(attackerPoint, { x: defender.x, y: defender.y }, "charge", 300);
    }

    if (options.updatedTargetHp <= 0) {
      triggerCellFeedback(defenderKey, "death", 720);
      playBattleSfx("death-fall", { cooldownMs: 100, volumeMultiplier: 1.1 });
      return;
    }

    if (options.updatedTargetHp <= Math.ceil(defender.maxHp * moraleThreshold)) {
      triggerCellFeedback(defenderKey, "morale", 900);
      playBattleSfx("morale-break", { cooldownMs: 200, volumeMultiplier: 0.95 });
    }
  };
  const getRangeForBattle = (unit: any) => (gameOptions.terrainEffectsEnabled ? getEffectiveRange(unit, battlefieldTerrain) : unit.range);
  const getMoveForBattle = (unit: any) => (gameOptions.terrainEffectsEnabled ? getEffectiveMove(unit, battlefieldTerrain) : unit.move);
  const getTileOccupant = (battleUnits: any[], x: number, y: number, ignoredUnitId?: string) =>
    battleUnits.find((candidate) => candidate.id !== ignoredUnitId && candidate.hp > 0 && candidate.x === x && candidate.y === y);
  const getReachableTiles = (unit: any, battleUnits: any[]) => {
    const maxSteps = getMoveForBattle(unit);
    const queue = [{ x: unit.x, y: unit.y, steps: 0 }];
    const visited = new Set<string>([`${unit.x},${unit.y}`]);
    const reachable = [{ x: unit.x, y: unit.y, steps: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || current.steps >= maxSteps) continue;

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      neighbors.forEach((neighbor) => {
        const key = `${neighbor.x},${neighbor.y}`;
        if (visited.has(key) || !isWithinBattlefield(neighbor.x, neighbor.y)) return;
        if (getTileOccupant(battleUnits, neighbor.x, neighbor.y, unit.id)) return;

        visited.add(key);
        const nextNode = { ...neighbor, steps: current.steps + 1 };
        reachable.push(nextNode);
        queue.push(nextNode);
      });
    }

    return reachable;
  };
  const getAiFormationRole = (unit: any) => {
    if (isLeaderRole(unit?.role)) return "leader";
    const troopType = getTroopMechanicType(unit);
    if (troopType === "mounted") return "flank";
    if (troopType === "ranged" || troopType === "sieged") return "support";
    return "frontline";
  };
  const getEnemyCentroid = (battleUnits: any[]) => {
    if (battleUnits.length === 0) return { x: battlefieldSize / 2, y: battlefieldSize / 2 };
    const totals = battleUnits.reduce(
      (acc, unit) => ({ x: acc.x + unit.x, y: acc.y + unit.y }),
      { x: 0, y: 0 }
    );
    return {
      x: totals.x / battleUnits.length,
      y: totals.y / battleUnits.length
    };
  };
  const getNearestDistanceToEnemies = (position: { x: number; y: number }, enemyUnits: any[]) =>
    enemyUnits.reduce((best, enemyUnit) => Math.min(best, Math.abs(enemyUnit.x - position.x) + Math.abs(enemyUnit.y - position.y)), Infinity);
  const getAiPressureDistance = (unit: any) => {
    const range = getRangeForBattle(unit);
    if (range <= 1) return getMoveForBattle(unit) + 1;
    return range + 1;
  };
  const getAdjacentFriendlyCountAt = (unit: any, position: { x: number; y: number }, battleUnits: any[]) =>
    battleUnits.filter((candidate) => {
      if (!candidate || candidate.id === unit.id || candidate.team !== unit.team || candidate.hp <= 0) return false;
      return Math.abs(candidate.x - position.x) + Math.abs(candidate.y - position.y) === 1;
    }).length;
  const getEnemyThreatOnTile = (position: { x: number; y: number }, enemyUnits: any[]) =>
    enemyUnits.reduce((threat, enemyUnit) => {
      const enemyRange = getRangeForBattle(enemyUnit);
      const distance = Math.abs(enemyUnit.x - position.x) + Math.abs(enemyUnit.y - position.y);
      if (distance <= enemyRange) return threat + 2;
      if (enemyRange === 1 && distance <= getMoveForBattle(enemyUnit) + 1) return threat + 1;
      return threat;
    }, 0);
  const getAiTargetCandidates = (unit: any, enemyUnits: any[], battleUnits: any[]) =>
    enemyUnits
      .map((enemyUnit) => {
      const distance = Math.abs(enemyUnit.x - unit.x) + Math.abs(enemyUnit.y - unit.y);
      const enemyType = getTroopMechanicType(enemyUnit);
      const friendlySupportNearby = battleUnits.some((candidate) => {
        if (!candidate || candidate.team !== unit.team || candidate.hp <= 0) return false;
        const troopType = getTroopMechanicType(candidate);
        if (troopType !== "ranged" && troopType !== "sieged") return false;
        return Math.abs(candidate.x - enemyUnit.x) + Math.abs(candidate.y - enemyUnit.y) <= 2;
      });

      let score = 150 - distance * 4;
      score += Math.round((1 - (enemyUnit.hp / Math.max(1, enemyUnit.maxHp))) * 70);
      if (enemyUnit.hp <= Math.ceil(enemyUnit.maxHp * 0.4)) score += 24;
      if (isLeaderRole(enemyUnit.role)) score += 24;
      if (enemyType === "ranged" || enemyType === "sieged") score += 24;
      if (distance <= getAiPressureDistance(unit)) score += 20;
      if (distance <= 3) score += 12;
      if (friendlySupportNearby && (enemyType === "mounted" || enemyUnit.attack >= 150)) score += 20;
      if (getTroopMechanicType(unit) === "mounted" && (enemyType === "ranged" || enemyType === "sieged")) score += 32;
      if (getTroopMechanicType(unit) === "closecombat" && enemyType === "ranged") score += 16;
      if (getAiFormationRole(unit) === "leader" && distance <= 2) score -= 28;

      return { target: enemyUnit, score, distance };
    })
      .sort((candidateA, candidateB) => {
        if (candidateB.score !== candidateA.score) return candidateB.score - candidateA.score;
        return candidateA.distance - candidateB.distance;
      });
  const getFallbackAiAction = (currentTeam: TeamName, battleUnits: any[]) => {
    const aiUnits = battleUnits.filter((unit) => unit.team === currentTeam && unit.hp > 0);
    const enemyUnits = battleUnits.filter((unit) => unit.team !== currentTeam && unit.hp > 0);
    if (aiUnits.length === 0 || enemyUnits.length === 0) return null;

    let chosenUnit = aiUnits[0] ?? null;
    let chosenTarget = enemyUnits[0] ?? null;
    let closestDistance = Infinity;

    aiUnits.forEach((unit) => {
      enemyUnits.forEach((enemyUnit) => {
        const distance = Math.abs(unit.x - enemyUnit.x) + Math.abs(unit.y - enemyUnit.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          chosenUnit = unit;
          chosenTarget = enemyUnit;
        }
      });
    });

    if (!chosenUnit || !chosenTarget) return null;

    const effectiveRange = getRangeForBattle(chosenUnit);
    if (isInRange(chosenUnit, chosenTarget, effectiveRange)) {
      return {
        type: "attack",
        score: 0,
        unitId: chosenUnit.id,
        targetId: chosenTarget.id,
        moveTo: null,
        reason: "pressed the nearest target"
      };
    }

    const closeCombatDestination = effectiveRange === 1 ? getCloseCombatAttackDestination(chosenUnit, chosenTarget) : null;
    if (closeCombatDestination) {
      return {
        type: "attack",
        score: 0,
        unitId: chosenUnit.id,
        targetId: chosenTarget.id,
        moveTo: closeCombatDestination,
        reason: "forced a close attack"
      };
    }

    const fallbackTile = getReachableTiles(chosenUnit, battleUnits)
      .filter((tile) => tile.x !== chosenUnit.x || tile.y !== chosenUnit.y)
      .sort((tileA, tileB) => {
        const distanceA = Math.abs(tileA.x - chosenTarget.x) + Math.abs(tileA.y - chosenTarget.y);
        const distanceB = Math.abs(tileB.x - chosenTarget.x) + Math.abs(tileB.y - chosenTarget.y);
        if (distanceA !== distanceB) return distanceA - distanceB;

        const terrainA = getTerrainModifiers({ ...chosenUnit, x: tileA.x, y: tileA.y }, getTerrainAt(battlefieldTerrain, tileA.x, tileA.y));
        const terrainB = getTerrainModifiers({ ...chosenUnit, x: tileB.x, y: tileB.y }, getTerrainAt(battlefieldTerrain, tileB.x, tileB.y));
        return (terrainB.attackMultiplier + terrainB.moveDelta * 0.1) - (terrainA.attackMultiplier + terrainA.moveDelta * 0.1);
      })[0];

    if (!fallbackTile) return null;

    return {
      type: "move",
      score: 0,
      unitId: chosenUnit.id,
      targetId: chosenTarget.id,
      moveTo: { x: fallbackTile.x, y: fallbackTile.y },
      reason: "advanced on the nearest target"
    };
  };
  const decideAiAction = (currentTeam: TeamName, battleUnits: any[]) => {
    const aiUnits = battleUnits.filter((unit) => unit.team === currentTeam && unit.hp > 0);
    const enemyUnits = battleUnits.filter((unit) => unit.team !== currentTeam && unit.hp > 0);
    if (aiUnits.length === 0 || enemyUnits.length === 0) return null;

    const enemyCentroid = getEnemyCentroid(enemyUnits);
    let bestDecision: any = null;

    aiUnits.forEach((unit) => {
      const targetCandidates = getAiTargetCandidates(unit, enemyUnits, battleUnits).slice(0, Math.min(4, enemyUnits.length));
      if (targetCandidates.length === 0) return;

      const reachableTiles = getReachableTiles(unit, battleUnits);

      targetCandidates.forEach(({ target, score: targetPriority }) => {
        const effectiveRange = getRangeForBattle(unit);
        const canAttackAtRange = isInRange(unit, target, effectiveRange);
        const closeCombatDestination = effectiveRange === 1 && !canAttackAtRange
          ? getCloseCombatAttackDestination(unit, target)
          : null;

        if (canAttackAtRange || closeCombatDestination) {
          const simulatedAttacker = closeCombatDestination ? { ...unit, ...closeCombatDestination } : unit;
          const attackOutcome = getAttackDamage(simulatedAttacker, target, battleUnits, terrainEffectMap);
          let attackScore = targetPriority + attackOutcome.damage / 3;
          if (attackOutcome.damage >= target.hp) attackScore += 180;
          if (attackOutcome.hasAdvantage) attackScore += 28;
          if (attackOutcome.abilityTags.length > 0) attackScore += attackOutcome.abilityTags.length * 10;
          if (closeCombatDestination) attackScore += 26;
          if (isLeaderRole(target.role)) attackScore += 20;

          if (!bestDecision || attackScore > bestDecision.score) {
            bestDecision = {
              type: "attack",
              score: attackScore,
              unitId: unit.id,
              targetId: target.id,
              moveTo: closeCombatDestination,
              reason: closeCombatDestination ? "closed in for a melee strike" : "pressed an attack window"
            };
          }
        }

        reachableTiles.forEach((tile) => {
          if (tile.x === unit.x && tile.y === unit.y) return;

          const simulatedUnit = { ...unit, x: tile.x, y: tile.y };
          const tileTerrain = getTerrainAt(battlefieldTerrain, tile.x, tile.y);
          const tileModifiers = getTerrainModifiers(simulatedUnit, tileTerrain);
          const currentTargetDistance = Math.abs(unit.x - target.x) + Math.abs(unit.y - target.y);
          const targetDistance = Math.abs(tile.x - target.x) + Math.abs(tile.y - target.y);
          const currentNearestEnemyDistance = getNearestDistanceToEnemies(unit, enemyUnits);
          const nearestEnemyDistance = getNearestDistanceToEnemies(tile, enemyUnits);
          const adjacentFriendlyCount = getAdjacentFriendlyCountAt(unit, tile, battleUnits);
          const threat = getEnemyThreatOnTile(tile, enemyUnits);
          const flankOffset = Math.abs(tile.x - enemyCentroid.x);
          const pressureDistance = getAiPressureDistance(simulatedUnit);
          const closesDistance = currentTargetDistance - targetDistance;
          const createsAttackPressure = targetDistance <= pressureDistance;
          const pressuresEnemyLine = nearestEnemyDistance <= pressureDistance;
          const nearbyEnemyCount = enemyUnits.filter((enemyUnit) => Math.abs(enemyUnit.x - tile.x) + Math.abs(enemyUnit.y - tile.y) <= pressureDistance).length;
          const role = getAiFormationRole(unit);
          let moveScore = targetPriority * 0.2;
          moveScore += (tileModifiers.attackMultiplier - 1) * 90;
          moveScore += tileModifiers.moveDelta * 8;
          moveScore += closesDistance * 32;
          moveScore += (currentNearestEnemyDistance - nearestEnemyDistance) * 14;
          moveScore += nearbyEnemyCount * 6;
          if (createsAttackPressure) moveScore += role === "support" ? 24 : 44;
          if (pressuresEnemyLine && role !== "leader") moveScore += 18;

          if (role === "frontline") {
            moveScore += 58 - targetDistance * 9;
            moveScore += adjacentFriendlyCount * 8;
            if (nearestEnemyDistance <= 2) moveScore += 18;
            if (tileTerrain === "forest" || tileTerrain === "hill") moveScore += 14;
          } else if (role === "support") {
            const desiredDistance = Math.min(Math.max(2, getRangeForBattle(simulatedUnit) - 1), 3);
            moveScore += 42 - Math.abs(targetDistance - desiredDistance) * 9;
            moveScore += adjacentFriendlyCount * 6;
            if (tileTerrain === "hill") moveScore += 28;
            if (tileTerrain === "forest") moveScore += 10;
            moveScore -= threat * 8;
          } else if (role === "flank") {
            moveScore += 52 - targetDistance * 8;
            moveScore += flankOffset * 7;
            if (tileTerrain === "plain") moveScore += 24;
            if (tileTerrain === "forest" || tileTerrain === "river") moveScore -= 18;
            moveScore -= Math.max(0, adjacentFriendlyCount - 1) * 6;
          } else if (role === "leader") {
            moveScore += 34 - Math.abs(targetDistance - 2) * 9;
            moveScore += adjacentFriendlyCount * 8;
            moveScore -= threat * 14;
            if (nearestEnemyDistance <= 1) moveScore -= 40;
          }

          if (targetDistance >= currentTargetDistance && role !== "leader") {
            moveScore -= 42;
          }

          if (closesDistance <= 0 && role !== "leader") {
            moveScore -= 18;
          }

          if (!bestDecision || moveScore > bestDecision.score) {
            bestDecision = {
              type: "move",
              score: moveScore,
              unitId: unit.id,
              moveTo: { x: tile.x, y: tile.y },
              targetId: target.id,
              reason:
                role === "support"
                  ? "repositioned to support the line"
                  : role === "flank"
                    ? "shifted toward the flank"
                    : role === "leader"
                      ? "tightened the command position"
                      : "advanced to pressure the enemy line"
            };
          }
        });
      });
    });

    return bestDecision ?? getFallbackAiAction(currentTeam, battleUnits);
  };
  const buildAttackLogLine = (
    attacker: any,
    defender: any,
    attackOutcome: ReturnType<typeof getAttackDamage>,
    options: { closedIn?: boolean; remainingAmmo?: number } = {}
  ) => {
    const tags = [
      attackOutcome.hasTerrainModifier ? attackOutcome.terrainLabel : null,
      attackOutcome.hasLeaderAura ? "Leader Aura" : null,
      attackOutcome.hasAdvantage ? `${TROOP_MECHANIC_LABELS[attackOutcome.attackerType]} > ${TROOP_MECHANIC_LABELS[attackOutcome.defenderType]}` : null,
      ...(attackOutcome.abilityTags ?? [])
    ].filter(Boolean);

    return `${attacker.name} (${attacker.team})${options.closedIn ? " closed in and" : ""} attacked ${defender.name} (${defender.team}) for ${attackOutcome.damage}${
      tags.length > 0 ? ` [${tags.join(" | ")}]` : ""
    }${typeof options.remainingAmmo === "number" ? ` (${options.remainingAmmo} shots remaining)` : ""}`;
  };
  const selected = getUnitById(selectedId);
  const inspectedUnit = getUnitById(inspectedUnitId);
  const currentBattleUnits = isSetupMode ? customUnits : units;
  const battlefieldSize = gameOptions.battlefieldSize;
  const visibleBattleLog = Array.isArray(log) ? log.slice(0, 80) : [];
  const terrainEffectMap = gameOptions.terrainEffectsEnabled ? battlefieldTerrain : [];
  const inspectedTerrainType = inspectedUnit ? getTerrainAt(battlefieldTerrain, inspectedUnit.x, inspectedUnit.y) : null;
  const inspectedTileTerrainType = inspectedTile ? getTerrainAt(battlefieldTerrain, inspectedTile.x, inspectedTile.y) : null;
  const inspectedTileInfo = inspectedTileTerrainType
    ? TERRAIN_MECHANICS_INFO.find((terrainInfo) => terrainInfo.terrain === inspectedTileTerrainType) ?? null
    : null;
  const inspectedEffectiveAttack = inspectedUnit ? getDisplayedAttack(inspectedUnit, currentBattleUnits, terrainEffectMap) : 0;
  const inspectedEffectiveRange = inspectedUnit
    ? (gameOptions.terrainEffectsEnabled ? getEffectiveRange(inspectedUnit, battlefieldTerrain) : inspectedUnit.range)
    : 0;
  const inspectedUnitAbilities = inspectedUnit ? getTroopAbilities(inspectedUnit.role) : [];
  const selectedEffectiveMove = selected ? (gameOptions.terrainEffectsEnabled ? getEffectiveMove(selected, battlefieldTerrain) : selected.move) : 0;
  const selectedEffectiveRange = selected ? getRangeForBattle(selected) : 0;
  const inspectedEffectNotes = inspectedUnit
    ? getUnitEffectNotes(inspectedUnit, currentBattleUnits, battlefieldTerrain, gameOptions.terrainEffectsEnabled)
    : [];
  const focusedBattleUnit = inspectedUnit ?? selected ?? null;
  const focusedUnitAbilities = focusedBattleUnit ? getTroopAbilities(focusedBattleUnit.role) : [];
  const focusedTerrainType = focusedBattleUnit ? getTerrainAt(battlefieldTerrain, focusedBattleUnit.x, focusedBattleUnit.y) : null;
  const focusedEffectNotes = focusedBattleUnit
    ? getUnitEffectNotes(focusedBattleUnit, currentBattleUnits, battlefieldTerrain, gameOptions.terrainEffectsEnabled)
    : [];
  const focusedFeedbackKinds = focusedBattleUnit ? (cellFeedback[`${focusedBattleUnit.x},${focusedBattleUnit.y}`] ?? []) : [];
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
  const iconActionButtonClass = "battle-button flex h-10 w-10 items-center justify-center p-0 text-lg font-semibold";
  const troopReferenceStats = useMemo(() => {
    const references: Record<string, TroopReferenceStats> = {};

    Object.values(AVAILABLE_TROOPS).flat().forEach((troop) => {
      if (!references[troop.role]) {
        references[troop.role] = getTroopReferenceStats(troop.role);
      }
    });

    return references;
  }, []);
  const allReferenceTroops = useMemo(() => (
    ALL_TEAMS.flatMap((team) =>
      AVAILABLE_TROOPS[team].map((troop) => {
        const referenceStats = troopReferenceStats[troop.role];
        const troopTypeDisplay = getTroopTypeDisplay({
          role: troop.role,
          name: troop.name,
          ammo: referenceStats.ammo,
          range: referenceStats.range,
          move: referenceStats.move
        });

        return {
          ...troop,
          team,
          referenceStats,
          troopTypeDisplay,
          searchKeywords: getTroopSearchKeywords(
            {
              role: troop.role,
              name: troop.name,
              ammo: referenceStats.ammo,
              range: referenceStats.range,
              move: referenceStats.move
            },
            team
          )
        };
      })
    )
  ), [troopReferenceStats]);
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
      const canAttackFromRange = target && target.team !== selected.team && distance <= selectedEffectiveRange;
      const canCloseForAttack =
        target && target.team !== selected.team && selectedEffectiveRange === 1 && Boolean(getCloseCombatAttackDestination(selected, target));
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
      const meleeAttackDestination = clicked && clicked.team !== selected.team && selectedEffectiveRange === 1 && !isInRange(selected, clicked, selectedEffectiveRange)
        ? getCloseCombatAttackDestination(selected, clicked)
        : null;

      if (clicked && clicked.team !== selected.team && (isInRange(selected, clicked, selectedEffectiveRange) || meleeAttackDestination)) {
        // Check if target is alive
        if (clicked.hp <= 0) {
          setLog((prevLog) => [`${clicked.name} is already dead!`, ...prevLog]);
          return;
        }

        const attackerPosition = meleeAttackDestination ? { x: meleeAttackDestination.x, y: meleeAttackDestination.y } : null;
        const attackingUnit = attackerPosition ? { ...selected, ...attackerPosition } : selected;
        const nextClickedHp = clicked.hp;
        if (meleeAttackDestination) {
          attackingUnit.x = meleeAttackDestination.x;
          attackingUnit.y = meleeAttackDestination.y;
        }
        
        // Attack enemy with troop-mechanic matchup bonus
        const attackOutcome = getAttackDamage(attackingUnit, clicked, units, terrainEffectMap);
        const dmg = attackOutcome.damage;
        const updatedTargetHp = nextClickedHp - dmg;
        const nextAmmo = selected.ammo && selected.ammo > 0 ? selected.ammo - 1 : selected.ammo;
        const runsOutOfAmmo = Boolean(selected.ammo && selected.ammo > 0 && nextAmmo === 0);
        const usedProjectileAttack = Boolean(selected.ammo && selected.ammo > 0);
        
        // If this is a ranged attack, reduce ammunition
        if (selected.ammo && selected.ammo > 0) {
          setLog((prevLog) => [
            buildAttackLogLine(attackingUnit, clicked, attackOutcome, { remainingAmmo: nextAmmo ?? 0 }),
            ...prevLog
          ]);
          
          // If out of ammo, switch to melee
          if (runsOutOfAmmo) {
            setLog((prevLog) => [`${selected.name} is out of ammo! Switching to melee combat at half attack.`, ...prevLog]);
          }
        } else {
          setLog((prevLog) => [
            buildAttackLogLine(attackingUnit, clicked, attackOutcome, { closedIn: Boolean(meleeAttackDestination) }),
            ...prevLog
          ]);
        }

        if (attackOutcome.abilityTags.includes("Charge")) {
          setLog((prevLog) => [`${attackingUnit.name} (${attackingUnit.team}) crashed into the line with a charge!`, ...prevLog]);
        }

        if (updatedTargetHp > 0 && updatedTargetHp <= Math.ceil(clicked.maxHp * 0.35)) {
          setLog((prevLog) => [`${clicked.name} (${clicked.team}) is shaken and losing morale!`, ...prevLog]);
        }

        setUnits((prev) =>
          prev
            .map((unit: any) => {
              if (unit.id === selected.id) {
                return {
                  ...unit,
                  ...(attackerPosition ?? {}),
                  ammo: nextAmmo,
                  range: runsOutOfAmmo ? 1 : unit.range
                };
              }

              if (unit.id === clicked.id) {
                return {
                  ...unit,
                  hp: updatedTargetHp
                };
              }

              return unit;
            })
            .filter((unit: any) => unit.hp > 0)
        );

        triggerAttackFeedback(attackingUnit, clicked, attackOutcome, {
          attackerPosition,
          updatedTargetHp,
          isProjectile: usedProjectileAttack
        });
        
        // Check if target was killed
        if (updatedTargetHp <= 0) {
          setLog((prevLog) => [`${clicked.name} (${clicked.team}) was killed!`, ...prevLog]);
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
    setIsInGameUnitsOpen(false);
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
    setIsInGameUnitsOpen(false);
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
    setIsInGameUnitsOpen(false);
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
    setIsInGameUnitsOpen(false);
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
      setIsInGameUnitsOpen(false);
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
      setIsInGameUnitsOpen(false);
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
      setIsInGameUnitsOpen(false);
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

  const getAutoDeployUnitRange = (size: BattlefieldSize): [number, number] => {
    if (size <= 8) return [12, 13];
    if (size <= 10) return [13, 15];
    return [14, 16];
  };

  const getRandomAutoDeployUnitCount = (size: BattlefieldSize) => {
    const [minimumUnits, maximumUnits] = getAutoDeployUnitRange(size);
    return minimumUnits + Math.floor(Math.random() * (maximumUnits - minimumUnits + 1));
  };

  const getCustomAutoDeployOpponent = () =>
    selectedTeam !== playerTeam
      ? selectedTeam
      : ALL_TEAMS.find((team) => team !== playerTeam) ?? "Barbarians";

  const shuffleArray = <T,>(items: T[]) => {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  };

  const buildAutoDeployRoleCounts = (team: TeamName, totalUnits: number) => {
    const availableTroops = AVAILABLE_TROOPS[team];
    const leaderTroop = availableTroops.find((troop) => troop.Icon === "👑") ?? availableTroops[0];
    const nonLeaderTroops = availableTroops.filter((troop) => troop.role !== leaderTroop.role);
    const groupedCandidates = nonLeaderTroops
      .map((troop) => {
        const referenceStats = getTroopReferenceStats(troop.role);
        const troopType = getTroopMechanicType({
          role: troop.role,
          name: troop.name,
          ammo: referenceStats.ammo,
          range: referenceStats.range,
          move: referenceStats.move
        });

        return {
          troop,
          troopType
        };
      });

    const desiredGroupCount = Math.max(2, Math.min(groupedCandidates.length, Math.round((totalUnits - 1) / 4)));
    const candidatesByType = groupedCandidates.reduce<Record<TroopMechanicType, typeof groupedCandidates>>(
      (groups, candidate) => {
        groups[candidate.troopType].push(candidate);
        return groups;
      },
      {
        closecombat: [],
        mounted: [],
        ranged: [],
        sieged: []
      }
    );
    const randomTypeOrder = shuffleArray(["closecombat", "mounted", "ranged", "sieged"] as TroopMechanicType[]);
    const roleGroups: typeof availableTroops = [];

    while (roleGroups.length < desiredGroupCount) {
      let addedGroupThisRound = false;

      for (const troopType of randomTypeOrder) {
        const nextCandidate = candidatesByType[troopType].shift();
        if (!nextCandidate) continue;
        roleGroups.push(nextCandidate.troop);
        addedGroupThisRound = true;

        if (roleGroups.length >= desiredGroupCount) break;
      }

      if (!addedGroupThisRound) break;
    }

    if (roleGroups.length < desiredGroupCount) {
      const leftovers = shuffleArray(
        Object.values(candidatesByType).flat().map(({ troop }) => troop)
      );
      roleGroups.push(...leftovers.slice(0, desiredGroupCount - roleGroups.length));
    }

    const counts = Array(roleGroups.length).fill(3);
    let remaining = Math.max(0, totalUnits - 1 - counts.reduce((sum, current) => sum + current, 0));

    while (remaining > 0 && roleGroups.length > 0) {
      const eligibleIndexes = counts
        .map((count, index) => (count < 7 ? index : -1))
        .filter((index) => index >= 0);

      if (eligibleIndexes.length === 0) break;

      const chosenIndex = eligibleIndexes[Math.floor(Math.random() * eligibleIndexes.length)];
      counts[chosenIndex] += 1;
      remaining -= 1;
    }

    const roleCounts = roleGroups.flatMap((troop, index) =>
      Array.from({ length: counts[index] }, () => troop)
    );

    return [leaderTroop, ...roleCounts].slice(0, totalUnits);
  };

  const getFormationColumns = (size: BattlefieldSize) => {
    const flankWidth = size >= 10 ? 2 : 1;
    const laneWidth = size >= 8 ? 1 : 0;
    const leftFlankColumns = Array.from({ length: flankWidth }, (_, index) => index);
    const rightFlankColumns = Array.from({ length: flankWidth }, (_, index) => size - flankWidth + index);
    const leftLaneBoundary = flankWidth + laneWidth;
    const rightLaneBoundary = size - flankWidth - laneWidth;
    const centerColumns = Array.from(
      { length: Math.max(0, rightLaneBoundary - leftLaneBoundary) },
      (_, index) => leftLaneBoundary + index
    );
    const sortCentered = (columns: number[]) =>
      [...columns].sort((a, b) => {
        const center = (size - 1) / 2;
        const distanceDifference = Math.abs(a - center) - Math.abs(b - center);
        if (distanceDifference !== 0) return distanceDifference;
        return a - b;
      });

    return {
      frontCenterColumns: sortCentered(centerColumns),
      backCenterColumns: sortCentered(centerColumns),
      flankColumns: [...leftFlankColumns, ...rightFlankColumns]
    };
  };

  const buildSlotPool = (rows: number[], columns: number[]) =>
    rows.flatMap((row) => columns.map((column) => ({ x: column, y: row })));

  const getAutoDeploySlots = (
    troops: Array<{ role: string; name: string }>,
    size: BattlefieldSize,
    side: "top" | "bottom"
  ) => {
    const minimumFrontlineGap = 2;
    const maxRowsPerArmy = Math.max(1, Math.floor((size - minimumFrontlineGap) / 2));
    const frontRows =
      side === "top"
        ? Array.from({ length: maxRowsPerArmy }, (_, index) => maxRowsPerArmy - 1 - index)
        : Array.from({ length: maxRowsPerArmy }, (_, index) => size - maxRowsPerArmy + index);
    const backRows = [...frontRows].reverse();
    const { frontCenterColumns, backCenterColumns, flankColumns } = getFormationColumns(size);
    const frontCenterSlots = buildSlotPool(frontRows, frontCenterColumns);
    const frontFlankSlots = buildSlotPool(frontRows, flankColumns);
    const backCenterSlots = buildSlotPool(backRows, backCenterColumns);
    const backFlankSlots = buildSlotPool(backRows, flankColumns);
    const fallbackSlots = buildSlotPool(frontRows, Array.from({ length: size }, (_, index) => index));
    const usedSlots = new Set<string>();
    const takeNextSlot = (pools: TerrainPoint[][]) => {
      for (const pool of pools) {
        const nextSlot = pool.find((slot) => !usedSlots.has(`${slot.x},${slot.y}`));
        if (!nextSlot) continue;
        usedSlots.add(`${nextSlot.x},${nextSlot.y}`);
        return nextSlot;
      }

      return { x: 0, y: frontRows[0] ?? 0 };
    };

    const decoratedTroops = troops.map((troop, index) => {
      const referenceStats = getTroopReferenceStats(troop.role);
      const troopType = getTroopMechanicType({
        role: troop.role,
        name: troop.name,
        ammo: referenceStats.ammo,
        range: referenceStats.range,
        move: referenceStats.move
      });

      return {
        troop,
        index,
        troopType,
        isLeader: isLeaderRole(troop.role)
      };
    });

    const slots = Array.from({ length: troops.length }, () => ({ x: 0, y: 0 }));
    const assignTroops = (
      troopFilter: (troop: (typeof decoratedTroops)[number]) => boolean,
      preferredPools: TerrainPoint[][]
    ) => {
      decoratedTroops.filter(troopFilter).forEach((entry) => {
        slots[entry.index] = takeNextSlot(preferredPools);
      });
    };

    assignTroops(
      (entry) => entry.isLeader,
      [backCenterSlots, backFlankSlots, frontCenterSlots, fallbackSlots]
    );
    assignTroops(
      (entry) => !entry.isLeader && entry.troopType === "closecombat",
      [frontCenterSlots, frontFlankSlots, backCenterSlots, fallbackSlots]
    );
    assignTroops(
      (entry) => !entry.isLeader && entry.troopType === "mounted",
      [frontFlankSlots, backFlankSlots, frontCenterSlots, fallbackSlots]
    );
    assignTroops(
      (entry) => !entry.isLeader && entry.troopType === "ranged",
      [backCenterSlots, backFlankSlots, frontCenterSlots, fallbackSlots]
    );
    assignTroops(
      (entry) => !entry.isLeader && entry.troopType === "sieged",
      [backCenterSlots, backFlankSlots, fallbackSlots]
    );

    return slots;
  };

  const createAutoDeployedArmy = (
    team: TeamName,
    side: "top" | "bottom",
    size: BattlefieldSize,
    unitCount: number
  ) => {
    const chosenTroops = buildAutoDeployRoleCounts(team, unitCount);
    const slots = getAutoDeploySlots(chosenTroops, size, side);

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
    const unitCount = getRandomAutoDeployUnitCount(battlefieldSize);
    const deployedPlayerArmy = createAutoDeployedArmy(playerTeam, "bottom", battlefieldSize, unitCount);
    const deployedEnemyArmy = createAutoDeployedArmy(enemyTeam, "top", battlefieldSize, unitCount);

    setCustomUnits([...deployedEnemyArmy, ...deployedPlayerArmy]);
    setSelectedTeam(playerTeam);
    setDraggedTroop(null);
    setSelectedId(null);
    setLog((prev) => [
      `Auto deployed ${playerTeam} versus ${enemyTeam} with ${unitCount} troops per side, grouped formations, and a two-tile battle line gap.`,
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
      const aiDecision = decideAiAction(currentTeam as TeamName, units);
      
      if (!aiDecision) {
        advanceAiTurn(currentTeam as TeamName);
        return;
      }

      if (aiDecision.type === "attack") {
        const actingUnit = units.find((unit: any) => unit.id === aiDecision.unitId);
        const targetUnit = units.find((unit: any) => unit.id === aiDecision.targetId);

        if (!actingUnit || !targetUnit) {
          advanceAiTurn(currentTeam as TeamName);
          return;
        }

        const movedAttacker = aiDecision.moveTo ? { ...actingUnit, ...aiDecision.moveTo } : actingUnit;
        const attackOutcome = getAttackDamage(movedAttacker, targetUnit, units, terrainEffectMap);
        const remainingAmmo = actingUnit.ammo && actingUnit.ammo > 0 ? actingUnit.ammo - 1 : actingUnit.ammo;
        const updatedTargetHp = targetUnit.hp - attackOutcome.damage;
        const runsOutOfAmmo = Boolean(actingUnit.ammo && actingUnit.ammo > 0 && remainingAmmo === 0);
        const usedProjectileAttack = Boolean(actingUnit.ammo && actingUnit.ammo > 0);

        setUnits((prev) =>
          prev
            .map((unit: any) => {
              if (unit.id === actingUnit.id) {
                return {
                  ...unit,
                  ...(aiDecision.moveTo ?? {}),
                  ammo: remainingAmmo,
                  range: runsOutOfAmmo ? 1 : unit.range
                };
              }

              if (unit.id === targetUnit.id) {
                return {
                  ...unit,
                  hp: updatedTargetHp
                };
              }

              return unit;
            })
            .filter((unit: any) => unit.hp > 0)
        );

        triggerAttackFeedback(movedAttacker, targetUnit, attackOutcome, {
          attackerPosition: aiDecision.moveTo ?? null,
          updatedTargetHp,
          isProjectile: usedProjectileAttack
        });

        setLog((existingLog) => {
          const nextLog = [
            buildAttackLogLine(movedAttacker, targetUnit, attackOutcome, {
              closedIn: Boolean(aiDecision.moveTo),
              remainingAmmo: actingUnit.ammo && actingUnit.ammo > 0 ? remainingAmmo ?? 0 : undefined
            }),
            `${actingUnit.name} (${currentTeam}) ${aiDecision.reason}.`,
            ...existingLog
          ];

          if (runsOutOfAmmo) {
            nextLog.unshift(`${actingUnit.name} is out of ammo! Switching to melee combat.`);
          }

          if (updatedTargetHp <= 0) {
            nextLog.unshift(`${targetUnit.name} (${targetUnit.team}) was killed!`);
          }

          return nextLog;
        });

        if (attackOutcome.abilityTags.includes("Charge")) {
          setLog((existingLog) => [`${actingUnit.name} (${currentTeam}) crashed into the line with a charge!`, ...existingLog]);
        }

        if (updatedTargetHp > 0 && updatedTargetHp <= Math.ceil(targetUnit.maxHp * 0.35)) {
          setLog((existingLog) => [`${targetUnit.name} (${targetUnit.team}) is shaken and losing morale!`, ...existingLog]);
        }
      } else if (aiDecision.type === "move" && aiDecision.moveTo) {
        const actingUnit = units.find((unit: any) => unit.id === aiDecision.unitId);
        if (actingUnit) {
          const terrainLabel = TERRAIN_LABELS[getTerrainAt(battlefieldTerrain, aiDecision.moveTo.x, aiDecision.moveTo.y)];
          setUnits((prev) =>
            prev.map((unit: any) =>
              unit.id === actingUnit.id ? { ...unit, x: aiDecision.moveTo.x, y: aiDecision.moveTo.y } : unit
            )
          );
          setLog((existingLog) => [
            `${actingUnit.name} (${currentTeam}) ${aiDecision.reason}.`,
            `${actingUnit.name} (${currentTeam}) moved onto ${terrainLabel}`,
            ...existingLog
          ]);
        }
      }

      advanceAiTurn(currentTeam as TeamName);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [turn, units, isSetupMode, gameMode, aiTeams, playerTeam, battlefieldTerrain, terrainEffectMap]);

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
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setIsInGameUnitsOpen(false);
  };

  const openInGameMechanics = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setActiveMechanicsSlide(0);
    setIsInGameMechanicsOpen(true);
    setIsInGameGraphicsOpen(false);
    setIsInGameUnitsOpen(false);
  };

  const openInGameGraphics = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(true);
    setIsInGameUnitsOpen(false);
  };

  const openInGameUnits = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setUnitsReferenceTeam(activeTeam as TeamName);
    setUnitsReferenceQuery("");
    setIsInGameUnitsOpen(true);
  };

  const backToInGameMenu = () => {
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setIsInGameUnitsOpen(false);
    setIsGameMenuOpen(true);
  };

  const dismissFocusedBattlePanel = () => {
    setSelectedId(null);
    setInspectedUnitId(null);
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
            onClick={() => toggleOption("sfxEnabled")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.sfxEnabled ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.sfxEnabled ? "Battle SFX: On" : "Battle SFX: Off"}
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

  const mechanicsSections = [
    {
      key: "core",
      title: "Core Battle Rules",
      subtitle: "The systems you should expect to matter every round.",
      badge: "Always active",
      badgeClass: "border-yellow-700/60 bg-yellow-500/10 text-yellow-100",
      tabClass: "border-yellow-700/45 bg-yellow-500/10 text-yellow-100",
      panel: (
        <div className="space-y-3">
          {GAME_MECHANICS_INFO.map((mechanic, index) => (
            <div key={mechanic.title} className="rounded-2xl border border-yellow-700/45 bg-gradient-to-r from-black/25 to-yellow-950/10 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-yellow-700/50 bg-black/35 text-xl">
                  {mechanic.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-yellow-700/40 bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-300/85">
                      Rule {index + 1}
                    </span>
                    <div className="text-sm font-semibold text-yellow-200 sm:text-base">{mechanic.title}</div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-yellow-100/80">{mechanic.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      key: "ai",
      title: "AI Doctrine",
      subtitle: "How the computer now chooses movement, targets, and battlefield posture.",
      badge: "Smarter flow",
      badgeClass: "border-indigo-700/50 bg-indigo-500/10 text-indigo-100",
      tabClass: "border-indigo-700/40 bg-indigo-950/20 text-indigo-100",
      panel: (
        <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-indigo-700/35 bg-indigo-950/15 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200/80">Behavior Priorities</div>
            <div className="mt-3 space-y-2">
              {AI_MECHANICS_INFO.map((detail) => (
                <div key={detail} className="rounded-xl border border-indigo-700/25 bg-black/20 px-3 py-3 text-sm leading-relaxed text-indigo-50/85">
                  {detail}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-yellow-700/35 bg-black/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300/80">What This Means</div>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-yellow-700/25 bg-yellow-950/10 px-3 py-3">
                <div className="text-sm font-semibold text-yellow-100">Protect wounded and exposed units</div>
                <p className="mt-1 text-xs leading-relaxed text-yellow-100/75">
                  The AI now hunts soft targets faster, especially damaged troops, archers, siege engines, and isolated leaders.
                </p>
              </div>
              <div className="rounded-xl border border-yellow-700/25 bg-yellow-950/10 px-3 py-3">
                <div className="text-sm font-semibold text-yellow-100">Terrain still matters to both sides</div>
                <p className="mt-1 text-xs leading-relaxed text-yellow-100/75">
                  Hills, forests, rivers, and plains still shape pathing and combat, but the AI now accepts more risk to keep momentum.
                </p>
              </div>
              <div className="rounded-xl border border-yellow-700/25 bg-yellow-950/10 px-3 py-3">
                <div className="text-sm font-semibold text-yellow-100">Formations are more coherent and aggressive</div>
                <p className="mt-1 text-xs leading-relaxed text-yellow-100/75">
                  Expect tighter lines, safer leaders, earlier contact, and more decisive cavalry flanks instead of passive shuffling.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: "special",
      title: "Special Systems",
      subtitle: "Modern additions that reshape ammo, setup, faction identity, role passives, and battle feedback.",
      badge: "Expanded",
      badgeClass: "border-cyan-700/50 bg-cyan-500/10 text-cyan-100",
      tabClass: "border-cyan-700/40 bg-cyan-950/20 text-cyan-100",
      panel: (
        <div className="space-y-4">
          <div className="grid gap-3">
            {ADDITIONAL_MECHANICS_INFO.map((mechanic) => (
              <div key={mechanic.title} className="rounded-2xl border border-cyan-700/35 bg-black/20 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-700/40 bg-cyan-950/25 text-xl">
                    {mechanic.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-cyan-100 sm:text-base">{mechanic.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-cyan-50/78">{mechanic.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-cyan-700/35 bg-cyan-950/12 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/80">Ability Reference</div>
                <div className="mt-1 text-lg font-bold text-cyan-100">Signature passives trigger automatically</div>
              </div>
              <div className="rounded-full border border-cyan-700/45 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-100">
                {UNIT_ABILITY_MECHANICS_INFO.length} abilities
              </div>
            </div>
            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {UNIT_ABILITY_MECHANICS_INFO.map((ability) => (
                <div key={ability.title} className="rounded-2xl border border-cyan-700/25 bg-black/20 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-700/35 bg-cyan-950/20 text-xl">
                      {ability.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-cyan-100 sm:text-base">{ability.title}</div>
                      <p className="mt-2 text-sm leading-relaxed text-cyan-50/78">{ability.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "roles",
      title: "Combat Roles",
      subtitle: "Each unit category solves a different battlefield problem.",
      badge: "Role guide",
      badgeClass: "border-yellow-700/60 bg-black/25 text-yellow-100",
      tabClass: "border-yellow-700/45 bg-black/25 text-yellow-100",
      panel: (
        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-2xl border border-cyan-700/35 bg-cyan-950/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-semibold text-cyan-100">
                <span className="mr-2 text-cyan-300">🐎🏹</span>
                Hybrid
              </div>
              <span className="rounded-full border border-cyan-700/50 bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                special
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-cyan-50/80">
              Hybrid troops count as ranged units while they still have ammo. Once they run dry, they immediately shift into close combat behavior.
            </p>
          </div>
          {TROOP_MECHANICS_INFO.map((troopInfo) => (
            <div key={troopInfo.type} className="rounded-2xl border border-yellow-700/40 bg-gradient-to-br from-black/20 to-yellow-950/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-yellow-200">
                  <span className="mr-2 text-cyan-300">{TROOP_MECHANIC_ICONS[troopInfo.type]}</span>
                  {TROOP_MECHANIC_LABELS[troopInfo.type]}
                </div>
                <span className="rounded-full border border-yellow-700/45 bg-black/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-yellow-100">
                  {troopInfo.type}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-yellow-100/80">{troopInfo.summary}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-700/25 bg-emerald-950/10 px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">Strengths</div>
                  <div className="mt-2 space-y-2">
                    {troopInfo.pros.map((pro) => (
                      <p key={pro} className="text-xs leading-relaxed text-lime-100/90">{pro}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-rose-700/25 bg-rose-950/10 px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200">Weaknesses</div>
                  <div className="mt-2 space-y-2">
                    {troopInfo.cons.map((con) => (
                      <p key={con} className="text-xs leading-relaxed text-yellow-100/85">{con}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      key: "terrain",
      title: "Terrain Atlas",
      subtitle: "Terrain effects apply when terrain modifiers are enabled in Graphics.",
      badge: "Optional layer",
      badgeClass: "border-emerald-700/45 bg-emerald-500/10 text-emerald-100",
      tabClass: "border-emerald-700/40 bg-emerald-950/20 text-emerald-100",
      panel: (
        <div className="grid gap-3 xl:grid-cols-2">
          {TERRAIN_MECHANICS_INFO.map((terrainInfo) => (
            <div key={terrainInfo.terrain} className="rounded-2xl border border-emerald-700/35 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-emerald-100">{TERRAIN_LABELS[terrainInfo.terrain]}</div>
                <span className="rounded-full border border-emerald-700/35 bg-black/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-100">
                  {terrainInfo.terrain}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50/78">{terrainInfo.summary}</p>
              <div className="mt-4 space-y-2 rounded-2xl border border-emerald-700/20 bg-emerald-950/10 px-3 py-3">
                {terrainInfo.effects.map((effect) => (
                  <p key={effect} className="text-xs leading-relaxed text-lime-100/90">
                    {effect}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }
  ] as const;

  const activeMechanicsSection = mechanicsSections[activeMechanicsSlide] ?? mechanicsSections[0];
  const cycleMechanicsSlide = (direction: number) => {
    setActiveMechanicsSlide((current) => (current + direction + mechanicsSections.length) % mechanicsSections.length);
  };

  const renderMechanicsContent = () => (
    <div className="space-y-5 text-left">
      <div className="overflow-hidden rounded-3xl border border-yellow-700/70 bg-black/20 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="border-b border-yellow-700/35 px-5 py-5 sm:px-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-yellow-300/75">Battle Handbook</div>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold text-yellow-100 sm:text-3xl">Mechanics at a Glance</h3>
              <p className="mt-2 text-sm leading-relaxed text-yellow-100/80 sm:text-[15px]">
                Use this handbook to read the battle flow quickly: what wins matchups, how AI formations behave,
                which passives trigger automatically, and which terrain changes the fight before you commit.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-yellow-700/50 bg-black/20 px-3 py-3 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-yellow-300/80">Core</div>
                <div className="mt-1 text-2xl font-bold text-yellow-100">{GAME_MECHANICS_INFO.length}</div>
              </div>
              <div className="rounded-2xl border border-cyan-700/45 bg-cyan-950/15 px-3 py-3 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/85">Systems</div>
                <div className="mt-1 text-2xl font-bold text-cyan-100">{ADDITIONAL_MECHANICS_INFO.length + UNIT_ABILITY_MECHANICS_INFO.length}</div>
              </div>
              <div className="rounded-2xl border border-emerald-700/45 bg-emerald-950/15 px-3 py-3 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/85">Terrain</div>
                <div className="mt-1 text-2xl font-bold text-emerald-100">{TERRAIN_MECHANICS_INFO.length}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 px-5 py-4 sm:px-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-yellow-700/40 bg-black/20 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300/75">Read First</div>
            <div className="mt-2 text-sm font-semibold text-yellow-100">Front lines decide tempo.</div>
            <p className="mt-1 text-sm leading-relaxed text-yellow-100/75">
              Protect ranged and siege units, keep cavalry lanes open, and avoid letting hybrid troops waste their ammo into poor targets.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-700/35 bg-cyan-950/15 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Ability Reminder</div>
            <div className="mt-2 text-sm font-semibold text-cyan-100">Passives are live from the first attack.</div>
            <p className="mt-1 text-sm leading-relaxed text-cyan-50/75">
              Brace, Shield Wall, Charge, Harrier, Shock Assault, Guarded, Ferocity, Deadeye, Crush, Command Aura, Siege Mastery, Skirmish Step, and Resolve all trigger automatically when their conditions are met.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-700/35 bg-emerald-950/15 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80">AI Reminder</div>
            <div className="mt-2 text-sm font-semibold text-emerald-100">The computer now plays for shape, not just distance.</div>
            <p className="mt-1 text-sm leading-relaxed text-emerald-50/75">
              Expect stronger front lines, safer support units, and more deliberate flank pressure in longer fights.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-yellow-700/60 bg-black/20 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="text-lg font-bold text-yellow-200">{activeMechanicsSection.title}</div>
            <p className="mt-1 text-sm text-yellow-100/75">{activeMechanicsSection.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => cycleMechanicsSlide(-1)}
              className="battle-button flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 text-lg font-bold hover:bg-gray-700"
              aria-label="Previous mechanics section"
              title="Previous section"
            >
              ←
            </button>
            <div className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${activeMechanicsSection.badgeClass}`}>
              {activeMechanicsSection.badge}
            </div>
            <button
              type="button"
              onClick={() => cycleMechanicsSlide(1)}
              className="battle-button flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 text-lg font-bold hover:bg-gray-700"
              aria-label="Next mechanics section"
              title="Next section"
            >
              →
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {mechanicsSections.map((section, index) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveMechanicsSlide(index)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                index === activeMechanicsSlide
                  ? section.tabClass
                  : "border-white/10 bg-black/20 text-yellow-100/70 hover:border-yellow-700/40 hover:text-yellow-100"
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300/70">
            Section {activeMechanicsSlide + 1} of {mechanicsSections.length}
          </div>
          <div className="flex items-center gap-2">
            {mechanicsSections.map((section, index) => (
              <button
                key={`${section.key}-dot`}
                type="button"
                onClick={() => setActiveMechanicsSlide(index)}
                aria-label={`Open ${section.title}`}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeMechanicsSlide ? "w-8 bg-yellow-300" : "w-2.5 bg-yellow-300/35 hover:bg-yellow-300/60"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-5">
          {activeMechanicsSection.panel}
        </div>
      </div>
    </div>
  );

  const renderUnitsContent = () => {
    const unitsReferenceTeams = ALL_TEAMS.filter((team) => AVAILABLE_TROOPS[team].length > 0);
    const normalizedUnitsQuery = unitsReferenceQuery.trim().toLowerCase();
    const activeUnitsScope: UnitsReferenceScope =
      normalizedUnitsQuery.length > 0
        ? "All"
        : unitsReferenceTeam === "All" || unitsReferenceTeams.includes(unitsReferenceTeam)
          ? unitsReferenceTeam
          : unitsReferenceTeams[0];
    const visibleTroops = allReferenceTroops.filter((troop) => {
      if (activeUnitsScope !== "All" && troop.team !== activeUnitsScope) {
        return false;
      }

      if (!normalizedUnitsQuery) {
        return true;
      }

      return troop.searchKeywords.some((keyword) => keyword.includes(normalizedUnitsQuery));
    });
    const unitsScopeButtons: UnitsReferenceScope[] = ["All", ...unitsReferenceTeams];
    const unitsHeading = activeUnitsScope === "All" ? "All Units" : activeUnitsScope;
    const unitsSubheading =
      normalizedUnitsQuery.length > 0
        ? `Search results for "${unitsReferenceQuery.trim()}"`
        : activeUnitsScope === "All"
          ? "Full roster across every faction"
          : "Compact faction roster";

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-yellow-700/70 bg-black/20 px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-yellow-300/80">Unit Reference</div>
              </div>
              <div className="rounded-full border border-yellow-700/70 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-100">
                {visibleTroops.length} units
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={unitsReferenceQuery}
                onChange={(event) => setUnitsReferenceQuery(event.target.value)}
                placeholder="Search units, factions, or keywords like ranged, mounted, hybrid, siege..."
                className="w-full rounded-lg border border-yellow-700/60 bg-black/30 px-3 py-2 text-sm text-yellow-100 placeholder:text-yellow-100/45 focus:border-yellow-400 focus:outline-none"
              />
              {unitsReferenceQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setUnitsReferenceQuery("")}
                  className="rounded-lg border border-yellow-700/60 bg-black/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-yellow-100 hover:border-yellow-500 hover:text-yellow-50"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {unitsScopeButtons.map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => setUnitsReferenceTeam(team)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    team === activeUnitsScope
                      ? "border-yellow-400 bg-yellow-500/15 text-yellow-100"
                      : "border-yellow-700/60 bg-black/20 text-yellow-200 hover:border-yellow-500 hover:text-yellow-100"
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-yellow-700/70 bg-black/20">
          <div className="flex items-center justify-between gap-3 border-b border-yellow-700/40 px-3 py-3 sm:px-4">
            <div className="min-w-0">
              <div className="text-lg font-bold text-yellow-200 sm:text-xl">{unitsHeading}</div>
              <div className="text-[11px] uppercase tracking-wide text-yellow-100/70">{unitsSubheading}</div>
            </div>
            <div className="hidden rounded-full border border-yellow-700/60 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-100 sm:block">
              Template stats
            </div>
          </div>

          <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
            {visibleTroops.map((troop) => {
              const referenceStats = troop.referenceStats;
              const troopTypeDisplay = troop.troopTypeDisplay;
              const troopAbilities = getTroopAbilities(troop.role);
              const troopIcon =
                typeof troop.Icon === "string" && troop.Icon.length <= 3
                  ? troop.Icon
                  : ICON_MAP[troop.Icon as keyof typeof ICON_MAP] || troop.Icon || "⚔️";

              return (
                <div key={`${troop.team}-${troop.role}`} className="rounded-lg border border-yellow-700/50 bg-black/25 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-yellow-700/50 bg-black/30 text-2xl leading-none">
                      {troopIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-yellow-200">{troop.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {(activeUnitsScope === "All" || normalizedUnitsQuery.length > 0) && (
                          <span className="rounded-full border border-amber-700/60 bg-amber-950/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                            {troop.team}
                          </span>
                        )}
                        <span className="rounded-full border border-yellow-700/60 bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-yellow-100">
                          {troop.role}
                        </span>
                        <span className="rounded-full border border-cyan-700/60 bg-cyan-950/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cyan-200">
                          {troopTypeDisplay.icon} {troopTypeDisplay.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-yellow-100">
                    <span className="rounded-md border border-yellow-700/40 bg-black/20 px-2 py-1">
                      HP {referenceStats.hp[0]}-{referenceStats.hp[1]}
                    </span>
                    <span className="rounded-md border border-yellow-700/40 bg-black/20 px-2 py-1">
                      ATK {referenceStats.attack[0]}-{referenceStats.attack[1]}
                    </span>
                    <span className="rounded-md border border-yellow-700/40 bg-black/20 px-2 py-1">RNG {referenceStats.range}</span>
                    <span className="rounded-md border border-yellow-700/40 bg-black/20 px-2 py-1">MOV {referenceStats.move}</span>
                    <span className="rounded-md border border-yellow-700/40 bg-black/20 px-2 py-1">AMMO {referenceStats.ammo}</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/78">Signature Skills</div>
                    {troopAbilities.length > 0 ? (
                      <div className="mt-1.5 space-y-1.5">
                        {troopAbilities.map((ability) => (
                          <div
                            key={ability.key}
                            className="rounded-lg border border-cyan-700/35 bg-cyan-950/20 px-2.5 py-2 text-[11px] leading-relaxed text-cyan-50"
                          >
                            <span className="font-semibold text-cyan-200">{ability.name}:</span> {ability.description}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1.5 text-[11px] text-yellow-100/68">No signature skills.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {visibleTroops.length === 0 && (
            <div className="border-t border-yellow-700/40 px-4 py-6 text-center text-sm text-yellow-100/80">
              No units matched that search. Try a faction, role, or keywords like `ranged`, `mounted`, `hybrid`, or `siege`.
            </div>
          )}
        </div>
      </div>
    );
  };

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
    if ((e.target as HTMLElement | null)?.closest(".terrain-cell")) return;

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

    if (startScreen === "about") {
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-6 min-h-screen" style={appBackgroundStyle}>
          <div className="game-ui p-8 max-w-4xl w-full">
            <div className="flex items-center justify-between gap-4 mb-6">
              <button
                onClick={() => setStartScreen("menu")}
                className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
              >
                Back
              </button>
              <h1 className="text-4xl font-bold text-yellow-200 drop-shadow-lg">About Battlecry</h1>
              <div className="rounded-full border border-yellow-500/35 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-100">
                v{GAME_VERSION}
              </div>
            </div>

            <div className="rounded-[28px] border border-yellow-700/40 bg-black/20 px-5 py-5 shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-yellow-300/75">Game Overview</div>
              <h2 className="mt-2 text-2xl font-bold text-yellow-100">Tactical battles across living battlefields</h2>
              <p className="mt-3 text-sm leading-7 text-yellow-50/80">
                Battlecry is a tactical grid war game where historical-inspired factions clash across changing terrain.
                Each battle is shaped by troop roles, formation buffs, civilization passives, signature unit abilities,
                and battlefield feedback that helps you read momentum in real time.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">Single Player</div>
                  <div className="mt-1 text-sm leading-6 text-yellow-50/82">
                    Fight campaign battles against the AI and adapt to terrain, faction buffs, and battlefield momentum.
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">Multiplayer</div>
                  <div className="mt-1 text-sm leading-6 text-yellow-50/82">
                    Build two armies and play local pass-and-play battles on the same machine.
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">Custom Scenario</div>
                  <div className="mt-1 text-sm leading-6 text-yellow-50/82">
                    Place troops manually, set up your own encounters, and test faction matchups however you want.
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">Current Build</div>
                  <div className="mt-1 text-sm leading-6 text-yellow-50/82">
                    {GAME_BUILD_LABEL} with smarter AI, new passive abilities, terrain depth, and battle feedback effects.
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">Factions</div>
                  <div className="mt-1 text-base font-semibold text-yellow-50">{ALL_TEAMS.length}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">Campaign Maps</div>
                  <div className="mt-1 text-base font-semibold text-yellow-50">{Object.keys(levels).length}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">Battle Sizes</div>
                  <div className="mt-1 text-base font-semibold text-yellow-50">{BATTLEFIELD_SIZE_OPTIONS[0]}-{BATTLEFIELD_SIZE_OPTIONS[BATTLEFIELD_SIZE_OPTIONS.length - 1]}</div>
                </div>
              </div>
            </div>
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
              className="battle-button w-full px-6 py-4 text-lg font-semibold bg-gray-700 hover:bg-gray-800"
            >
              Single Player
            </button>
            <button
              onClick={startMultiplayerMode}
              className="battle-button w-full px-6 py-4 text-lg font-semibold bg-gray-700 hover:bg-gray-800"
            >
              Multiplayer
            </button>
            <button
              onClick={startCustomScenarioMode}
              className="battle-button w-full px-6 py-4 text-lg font-semibold bg-gray-700 hover:bg-gray-800"
            >
              Custom Scenario
            </button>
            <button
              onClick={() => setStartScreen("about")}
              className="battle-button w-full px-6 py-4 text-lg font-semibold bg-gray-700 hover:bg-gray-800"
            >
              About
            </button>
          </div>

          <div className="mt-6 max-w-md mx-auto">
            <button
              onClick={() => setStartScreen("options")}
              className="battle-button w-full px-6 py-3 text-lg font-semibold bg-gray-700 hover:bg-gray-800"
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
                  {(Object.entries(LEVEL_MATCHUP_LABELS) as [keyof typeof levels, string][]).map(([levelKey, label], index) => (
                    <option key={levelKey} value={levelKey}>
                      {`Level ${index + 1}: ${label}`}
                    </option>
                  ))}
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

          <div>
            <button
              onClick={() => setIsGameMenuOpen((open) => !open)}
              className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-gray-700 hover:bg-gray-800"
            >
              Game Menu
            </button>
          </div>
        </div>

        <div className="pointer-events-none fixed right-3 top-28 z-20 flex max-h-[calc(100vh-8rem)] flex-col items-end gap-2 sm:right-4">
          {isBattlefieldFullscreen && !isSetupMode && (
            <div className="pointer-events-auto text-yellow-100 border border-yellow-700 rounded bg-gray-900/80 px-2.5 py-1.5 text-xs sm:text-sm font-semibold backdrop-blur-sm">
              {checkEnd() || `${turn.toUpperCase()} TURN`}
            </div>
          )}

          {!isSetupMode && gameStarted && (
            <div
              className="pointer-events-auto text-blue-200 font-semibold bg-blue-900/70 px-2.5 py-1.5 rounded border border-blue-600 text-center backdrop-blur-sm"
              title={`${mergeCount}/2 merges used`}
            >
              <span className="block text-[11px] uppercase tracking-wide">Merges</span>
              <span className="block text-xs sm:text-sm">{mergeCount}/2</span>
            </div>
          )}

          {!isSetupMode && focusedBattleUnit && (
            <div
              className={`game-ui pointer-events-auto absolute right-0 w-[18rem] rounded-2xl border border-amber-700/70 bg-black/20 p-3 text-left text-yellow-100 shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-sm ${
                isBattlefieldFullscreen ? "top-[4.75rem]" : "top-[3.4rem]"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-2xl">
                  {(() => {
                    const FocusedUnitIcon = getUnitDisplayIcon(focusedBattleUnit);
                    return typeof FocusedUnitIcon === "string" ? FocusedUnitIcon : (FocusedUnitIcon ? createElement(FocusedUnitIcon) : "⚔️");
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-amber-300/80">
                    {selected ? "Selected Unit" : "Focused Unit"}
                  </div>
                  <div className="truncate text-base font-semibold text-yellow-50">{focusedBattleUnit.name}</div>
                  <div className="truncate text-xs text-amber-200/85">{focusedBattleUnit.team} · {focusedBattleUnit.role}</div>
                </div>
                </div>
                <button
                  type="button"
                  onClick={dismissFocusedBattlePanel}
                  className="battle-button flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 p-0 text-sm font-bold leading-none hover:bg-gray-800"
                  aria-label="Close selected unit"
                  title="Close"
                >
                  X
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">HP {focusedBattleUnit.hp}/{focusedBattleUnit.maxHp}</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">ATK {getDisplayedAttack(focusedBattleUnit, currentBattleUnits, terrainEffectMap)}</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">RNG {getRangeForBattle(focusedBattleUnit)}</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">MOV {getMoveForBattle(focusedBattleUnit)}</div>
              </div>
              <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-950/20 px-2.5 py-2 text-xs text-emerald-100/90">
                <span className="font-semibold text-emerald-200">Terrain:</span>{" "}
                {TERRAIN_LABELS[focusedTerrainType ?? "plain"]}
              </div>
              <div className="mt-3 rounded-xl border border-cyan-500/15 bg-cyan-950/20 px-2.5 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/85">Signature Skills</div>
                {focusedUnitAbilities.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {focusedUnitAbilities.map((ability) => (
                      <div key={ability.key} className="rounded-lg border border-cyan-500/20 bg-black/20 px-2.5 py-2 text-[11px] leading-5 text-cyan-50/92">
                        <span className="font-semibold text-cyan-200">{ability.name}:</span> {ability.description}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg border border-white/8 bg-black/20 px-2.5 py-2 text-[11px] leading-5 text-yellow-100/72">
                    This unit has no signature passive skill.
                  </div>
                )}
              </div>
              {focusedFeedbackKinds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {focusedFeedbackKinds.map((kind) => (
                    <div
                      key={kind}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                        kind === "hit"
                          ? "border-orange-400/50 bg-orange-500/10 text-orange-100"
                          : kind === "death"
                            ? "border-red-400/50 bg-red-500/10 text-red-100"
                            : kind === "charge"
                              ? "border-amber-400/50 bg-amber-500/10 text-amber-100"
                              : kind === "morale"
                                ? "border-violet-400/50 bg-violet-500/10 text-violet-100"
                                : "border-cyan-400/50 bg-cyan-500/10 text-cyan-100"
                      }`}
                    >
                      {kind === "hit"
                        ? "Under Fire"
                        : kind === "death"
                          ? "Breaking"
                          : kind === "charge"
                            ? "Charging"
                            : kind === "morale"
                              ? "Shaken"
                              : "Volley"}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 space-y-1.5">
                {focusedEffectNotes.slice(0, 3).map((note) => (
                  <div key={note} className="rounded-xl border border-white/8 bg-black/25 px-2.5 py-2 text-[11px] leading-5 text-yellow-100/88">
                    {note}
                  </div>
                ))}
                {focusedEffectNotes.length === 0 && (
                  <div className="rounded-xl border border-white/8 bg-black/25 px-2.5 py-2 text-[11px] leading-5 text-yellow-100/72">
                    No special effects active on this unit right now.
                  </div>
                )}
              </div>
            </div>
          )}

          {canRotateTroops && (
            <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-2xl border border-yellow-700 bg-gray-900/80 px-1.5 py-1.5 backdrop-blur-sm">
              {GRID_ORIENTATIONS.map((orientation) => (
                <button
                  key={orientation}
                  type="button"
                  onClick={() => rotateTroopsTo(orientation)}
                  title={`Face ${orientation}`}
                  aria-label={`Face ${orientation}`}
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
          )}

          {(!isSetupMode || gameMode === "multiplayer" || gameMode === "custom-scenario") && (
            <button
              type="button"
              onClick={toggleBattlefieldFullscreen}
              className={`pointer-events-auto ${iconActionButtonClass} bg-indigo-600 hover:bg-indigo-700`}
              aria-label={isBattlefieldFullscreen ? "Exit fullscreen battlefield" : "Enter fullscreen battlefield"}
              title={isBattlefieldFullscreen ? "Exit fullscreen battlefield" : "Enter fullscreen battlefield"}
            >
              {isBattlefieldFullscreen ? "🗗" : "🗖"}
            </button>
          )}

          {gameMode && (
            <button
              type="button"
              onClick={restartCurrentGame}
              className={`pointer-events-auto ${iconActionButtonClass} bg-red-700 hover:bg-red-800`}
              aria-label="Restart game"
              title="Restart game"
            >
              ↺
            </button>
          )}

          {!isSetupMode && (gameOptions.showTurnBanner || gameOptions.showBattleLog) && (
            <button
              type="button"
              onClick={() => setIsBattleLogPanelOpen(true)}
              className={`pointer-events-auto ${iconActionButtonClass} bg-amber-700 hover:bg-amber-800`}
              aria-label="Open battle log"
              title="Open battle log"
            >
              📜
            </button>
          )}

          {isSetupMode && (
            <button
              type="button"
              onClick={() => setIsUnitPanelOpen(true)}
              className={`pointer-events-auto ${iconActionButtonClass} bg-purple-700 hover:bg-purple-800`}
              aria-label={`Open ${selectedTeam} troops`}
              title={`Open ${selectedTeam} troops`}
            >
              🪖
            </button>
          )}

          {gameMode === "single-player" && !isSetupMode && !gameStarted && (
            <button
              type="button"
              onClick={startSinglePlayerBattle}
              className={`pointer-events-auto ${iconActionButtonClass} bg-green-600 hover:bg-green-700`}
              aria-label="Start battle"
              title="Start battle"
            >
              ▶
            </button>
          )}

          {gameMode === "custom-scenario" && isSetupMode && (
            <>
              <button
                type="button"
                onClick={autoDeployCustomBattle}
                className={`pointer-events-auto ${iconActionButtonClass} bg-blue-600 hover:bg-blue-700`}
                aria-label="Auto deploy troops"
                title="Auto deploy troops"
              >
                ✨
              </button>

              <button
                type="button"
                onClick={startCustomGame}
                disabled={customUnits.length === 0}
                className={`pointer-events-auto ${iconActionButtonClass} bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Start custom game"
                title="Start custom game"
              >
                ▶
              </button>

              <button
                type="button"
                onClick={resetCustomSetup}
                className={`pointer-events-auto ${iconActionButtonClass} bg-red-600 hover:bg-red-700`}
                aria-label="Reset setup"
                title="Reset setup"
              >
                🗑
              </button>
            </>
          )}

          {gameMode === "multiplayer" && isSetupMode && (
            <>
              <button
                type="button"
                onClick={startMultiplayerGame}
                disabled={customUnits.length === 0}
                className={`pointer-events-auto ${iconActionButtonClass} bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Start multiplayer game"
                title="Start multiplayer game"
              >
                ▶
              </button>

              <button
                type="button"
                onClick={resetCustomSetup}
                className={`pointer-events-auto ${iconActionButtonClass} bg-red-600 hover:bg-red-700`}
                aria-label="Reset setup"
                title="Reset setup"
              >
                🗑
              </button>
            </>
          )}

          {!isSetupMode && ((gameMode === "multiplayer" && gameStarted) || (gameMode !== "multiplayer" && turn === playerTeam && gameStarted)) && (
            <button
              type="button"
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
              className={`pointer-events-auto ${iconActionButtonClass} ${mergeMode ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={mergeMode ? "Cancel merge mode" : "Enable merge mode"}
              title={mergeMode ? "Cancel merge mode" : "Enable merge mode"}
            >
              🔗
            </button>
          )}

          <button
            type="button"
            onClick={regenerateTerrain}
            className={`pointer-events-auto ${iconActionButtonClass} bg-emerald-700 hover:bg-emerald-800`}
            aria-label="Regenerate terrain"
            title="Regenerate terrain"
          >
            🗺
          </button>
        </div>
      </div>

      {isInGameOptionsOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto mt-8 sm:mt-12 mb-6">
            <div className="game-ui p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Options</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={backToInGameMenu}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setIsInGameOptionsOpen(false)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
              {renderGameOptionsContent()}
            </div>
          </div>
        </div>
      )}

      {isInGameMechanicsOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto mt-8 sm:mt-12 mb-6">
            <div className="game-ui p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Mechanics</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={backToInGameMenu}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setIsInGameMechanicsOpen(false)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
              {renderMechanicsContent()}
            </div>
          </div>
        </div>
      )}

      {isGameMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center">
            <div className="game-ui w-full max-w-md overflow-hidden rounded-[28px] border border-yellow-700/80 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
              <div className="border-b border-yellow-700/40 px-5 py-5 sm:px-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-yellow-300/75">Pause Menu</div>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-yellow-200 sm:text-3xl">Game Menu</h2>
                    <p className="mt-1 text-sm text-yellow-100/75">Open battle references, settings, and quick navigation.</p>
                  </div>
                  <button
                    onClick={() => setIsGameMenuOpen(false)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="grid gap-3 p-5 sm:p-6">
                <button
                  onClick={openInGameOptions}
                  className="rounded-2xl border border-yellow-700/50 bg-black/20 px-4 py-4 text-left transition-colors hover:bg-yellow-700/15"
                >
                  <div className="text-base font-semibold text-yellow-100">Options</div>
                  <div className="mt-1 text-sm text-yellow-100/70">Gameplay toggles, sound, and battlefield size.</div>
                </button>
                <button
                  onClick={openInGameMechanics}
                  className="rounded-2xl border border-cyan-700/40 bg-cyan-950/15 px-4 py-4 text-left transition-colors hover:bg-cyan-800/20"
                >
                  <div className="text-base font-semibold text-cyan-100">Mechanics</div>
                  <div className="mt-1 text-sm text-cyan-50/75">Battle rules, troop types, hybrids, and terrain effects.</div>
                </button>
                <button
                  onClick={openInGameUnits}
                  className="rounded-2xl border border-yellow-700/50 bg-black/20 px-4 py-4 text-left transition-colors hover:bg-yellow-700/15"
                >
                  <div className="text-base font-semibold text-yellow-100">Units</div>
                  <div className="mt-1 text-sm text-yellow-100/70">Browse faction rosters and troop reference stats.</div>
                </button>
                <button
                  onClick={openInGameGraphics}
                  className="rounded-2xl border border-emerald-700/40 bg-emerald-950/15 px-4 py-4 text-left transition-colors hover:bg-emerald-800/20"
                >
                  <div className="text-base font-semibold text-emerald-100">Graphics</div>
                  <div className="mt-1 text-sm text-emerald-50/75">Terrain visuals, overlays, and battlefield presentation.</div>
                </button>
                <button
                  onClick={backToMainMenu}
                  className="rounded-2xl border border-rose-700/40 bg-rose-950/15 px-4 py-4 text-left transition-colors hover:bg-rose-800/20"
                >
                  <div className="text-base font-semibold text-rose-100">Back to Menu</div>
                  <div className="mt-1 text-sm text-rose-50/75">Leave the current battle and return to the main screen.</div>
                </button>
              </div>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={backToInGameMenu}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setIsInGameGraphicsOpen(false)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
              {renderGraphicsContent()}
            </div>
          </div>
        </div>
      )}

      {isInGameUnitsOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="mx-auto mt-6 mb-6 w-full max-w-5xl sm:mt-10">
            <div className="game-ui p-3 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-yellow-200 sm:text-2xl">Units</h2>
                  <div className="text-xs uppercase tracking-wide text-yellow-100/70">Compact roster browser</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={backToInGameMenu}
                    className="battle-button bg-gray-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-gray-800 sm:text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setIsInGameUnitsOpen(false)}
                    className="battle-button bg-gray-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-gray-800 sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
              {renderUnitsContent()}
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

      <div className="flex w-full justify-center">
        {false && !isSetupMode && (gameOptions.showTurnBanner || gameOptions.showBattleLog) && (
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
                        : turn === "Gauls" ? "Gauls are thinking..."
                        : turn === "Germanic" ? "Germanic tribes are thinking..."
                        : turn === "Carthage" ? "Carthage is thinking..."
                        : turn === "Egypt" ? "Egypt is thinking..."
                        : turn === "Thracians" ? "Thracians are thinking..."
                        : turn === "Dacians" ? "Dacians are thinking..."
                        : turn === "Parthians" ? "Parthians are thinking..."
                        : turn === "Seleucids" ? "Seleucids are thinking..."
                        : turn === "Vikings" ? "Vikings are thinking..." : ""}
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
        
        <div className={`battlefield-container relative mx-auto flex w-full justify-center ${isBattlefieldFullscreen ? "min-w-0 items-center" : "mt-3 sm:mt-4"}`}>
          <div
            className={
              `relative mx-auto max-w-full ${
                useEightByEightViewport
                  ? "battlefield-shell-8x8"
                  : useFullscreenNavigationViewport
                    ? "battlefield-shell-fullscreen-large"
                    : "w-fit"
              }`
            }
          >
            <div className="relative mx-auto w-fit max-w-full">
                {showGridNavigation && (
                  <>
                    <div
                      className="pointer-events-none absolute left-2 right-2 top-2 z-10 flex h-10 items-start justify-center"
                    >
                      <div
                        className="pointer-events-auto battlefield-nav-rail battlefield-nav-rail-horizontal"
                        aria-hidden="true"
                        onMouseEnter={() => setHoverScrollDirection("up")}
                        onMouseLeave={() => setHoverScrollDirection(null)}
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute bottom-2 left-2 right-2 z-10 flex h-10 items-end justify-center"
                    >
                      <div
                        className="pointer-events-auto battlefield-nav-rail battlefield-nav-rail-horizontal"
                        aria-hidden="true"
                        onMouseEnter={() => setHoverScrollDirection("down")}
                        onMouseLeave={() => setHoverScrollDirection(null)}
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute bottom-2 left-2 top-2 z-10 flex w-10 items-center justify-start"
                    >
                      <div
                        className="pointer-events-auto battlefield-nav-rail battlefield-nav-rail-vertical"
                        aria-hidden="true"
                        onMouseEnter={() => setHoverScrollDirection("left")}
                        onMouseLeave={() => setHoverScrollDirection(null)}
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute bottom-2 right-2 top-2 z-10 flex w-10 items-center justify-end"
                    >
                      <div
                        className="pointer-events-auto battlefield-nav-rail battlefield-nav-rail-vertical"
                        aria-hidden="true"
                        onMouseEnter={() => setHoverScrollDirection("right")}
                        onMouseLeave={() => setHoverScrollDirection(null)}
                      />
                    </div>
                  </>
                )}
                <div className="flex w-max mx-auto items-start">
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
                    <div className="w-max mx-auto">
                    <div
                      ref={battlefieldGridRef}
                      className={`battlefield-grid grid mx-auto gap-0 ${passiveTeams.length > 0 ? "rounded-r-none border-r-0" : "rounded-lg"}`}
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
                const feedbackKinds = cellFeedback[key] ?? [];
                const hasHitFeedback = feedbackKinds.includes("hit");
                const hasDeathFeedback = feedbackKinds.includes("death");
                const hasChargeFeedback = feedbackKinds.includes("charge");
                const hasMoraleFeedback = feedbackKinds.includes("morale");
                const hasRangedFeedback = feedbackKinds.includes("ranged");
                const terrainStyle = {
                  backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12)), url(${TERRAIN_ASSETS[terrainType]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                };
                
                return (
                  <div
                    key={key}
                    ref={(node) => {
                      battlefieldCellRefs.current[key] = node;
                    }}
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
                    className={`${isBattlefieldFullscreen ? "w-[76px] h-[84px] sm:w-[84px] sm:h-[100px]" : "w-[84px] h-[100px] sm:w-[100px] sm:h-[116px]"} terrain-cell flex flex-col items-center justify-center text-xs sm:text-sm cursor-pointer transition-all duration-200 relative
                    ${isSelected ? "unit-selected" : ""}
                    ${isMove ? "movement-highlight" : ""}
                    ${isAttack ? "attack-highlight" : ""}
                    ${u ? (u.team === "Romans" ? "unit-roman" : u.team === "Greeks" ? "unit-greek" : u.team === "Gauls" ? "unit-celtic" : u.team === "Germanic" ? "unit-germanic" : u.team === "Carthage" ? "unit-carthage" : u.team === "Egypt" ? "unit-egypt" : u.team === "Thracians" ? "unit-thracian" : u.team === "Dacians" ? "unit-dacian" : u.team === "Parthians" ? "unit-parthian" : u.team === "Seleucids" ? "unit-seleucid" : u.team === "Vikings" ? "unit-viking" : "unit-barbarian") : ""}
                    ${isSetupMode && draggedTroop && !u ? "drag-over" : ""}
                    ${mergeMode && u && u.team === turn && selectedForMerge && u.role === selectedForMerge.role ? "merge-highlight" : ""}
                    ${mergeMode && u && u.team === turn && selectedForMerge && u.id === selectedForMerge.id ? "merge-selected" : ""}
                    ${hasHitFeedback ? "battle-feedback-hit" : ""}
                    ${hasDeathFeedback ? "battle-feedback-death" : ""}
                    ${hasChargeFeedback ? "battle-feedback-charge" : ""}
                    ${hasMoraleFeedback ? "battle-feedback-morale" : ""}
                    ${hasRangedFeedback ? "battle-feedback-ranged" : ""}
                    ${!isSetupMode && mergeMode && u && ALL_TEAMS.includes(u.team) ? "cursor-grab active:cursor-grabbing" : ""}`}
                    style={terrainStyle}
                    title={TERRAIN_LABELS[terrainType]}
                  >
                    {u ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                          {/* Unit Icon */}
                          <div className="text-2xl mb-0.5">
                            {typeof UnitDisplayIcon === "string" ? UnitDisplayIcon : (UnitDisplayIcon ? createElement(UnitDisplayIcon) : "⚔️")}
                          </div>
                          
                          {/* Unit Name */}
                          <div className="rounded-full bg-black/35 px-2 py-0.5 text-[10px] text-center font-semibold text-yellow-100 leading-tight shadow-sm">
                            {getBattlefieldUnitLabel(u)}
                          </div>
                          
                          {/* Health + Range State */}
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-white/95">
                            <span>{u.hp} HP</span>
                            {u.ammo && u.ammo > 0 && <span className="text-cyan-300">| 🏹{u.ammo}</span>}
                            {hasNoAmmoPenalty(u) && <span className="text-red-300">| ⚔️</span>}
                          </div>
                          
                          {/* Health Bar */}
                          <div className="w-full bg-gray-800 rounded-full h-1 mt-1 border border-gray-600">
                            <div 
                              className="health-bar rounded-full h-full" 
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          
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
                      {projectileFeedback.map((projectile) => (
                        <div
                          key={projectile.id}
                          className={`battle-projectile-trace battle-projectile-${projectile.variant}`}
                          style={{
                            left: `${projectile.startX}px`,
                            top: `${projectile.startY}px`,
                            width: `${projectile.distance}px`,
                            transform: `translateY(-50%) rotate(${projectile.angle}rad)`
                          }}
                        />
                      ))}
                    </div>
                    </div>
                  </div>
                  {passiveTeams.length > 0 && (
                    <div className="game-ui flex flex-col items-center gap-3 rounded-l-none border-l-0 px-2 py-3">
                      {passiveTeams.map((team) => {
                        const passive = CIV_PASSIVES[team];
                        return (
                          <div
                            key={team}
                            className="relative group"
                            aria-label={`${team} passive: ${passive.name}. ${passive.effect}`}
                            title={`${team} - ${passive.name}: ${passive.effect}`}
                          >
                            <div className="game-ui flex h-11 w-11 shrink-0 items-center justify-center border border-yellow-600 bg-gray-950 text-lg shadow-lg transition-colors group-hover:border-yellow-400">
                              {PASSIVE_ICONS[team]}
                            </div>
                            <div className="game-ui pointer-events-none absolute left-1/2 top-full z-20 mt-4 hidden w-[21rem] -translate-x-1/2 overflow-hidden rounded-[22px] border border-yellow-500/80 bg-slate-950/95 text-left shadow-[0_24px_70px_rgba(0,0,0,0.55)] ring-1 ring-amber-200/10 backdrop-blur-md group-hover:block">
                              <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.3),_transparent_70%)]" />
                              <div className="absolute right-[-18px] top-[-22px] h-24 w-24 rounded-full bg-amber-300/8 blur-2xl" />
                              <div className="absolute left-1/2 top-[-8px] h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-yellow-500/80 bg-slate-900" />
                              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/85 to-transparent" />
                              <div className="relative p-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/65 bg-gradient-to-br from-amber-300/20 via-amber-200/10 to-transparent text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_10px_24px_rgba(0,0,0,0.3)]">
                                    {PASSIVE_ICONS[team]}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="text-[15px] font-bold tracking-[0.08em] text-yellow-50">
                                        {team}
                                      </div>
                                      <div className="h-px flex-1 bg-gradient-to-r from-yellow-400/35 to-transparent" />
                                    </div>
                                    <div className="mt-2 inline-flex rounded-full border border-yellow-500/35 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-300/95">
                                      Passive
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300/80">
                                    Faction Bonus
                                  </div>
                                  <div className="mt-2 text-base font-semibold leading-tight text-yellow-100">
                                    {passive.name}
                                  </div>
                                  <div className="mt-3 rounded-xl border border-yellow-500/15 bg-slate-950/45 px-3 py-2.5 text-[13px] leading-6 text-yellow-50/95">
                                    {passive.effect}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>

        {inspectedUnit && (
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
                  <p>
                    <span className="text-blue-400">🎯</span> Range: {inspectedEffectiveRange}
                    {inspectedEffectiveRange !== inspectedUnit.range ? ` (base ${inspectedUnit.range})` : ""}
                  </p>
                  <p><span className="text-green-400">🚶‍♂️</span> Move: {getEffectiveMove(inspectedUnit, battlefieldTerrain)} {getEffectiveMove(inspectedUnit, battlefieldTerrain) !== inspectedUnit.move ? `(base ${inspectedUnit.move})` : ""}</p>
                  <p>
                    <span className="text-cyan-300">{getTroopTypeDisplay(inspectedUnit).icon}</span>{" "}
                    Troop Type: {getTroopTypeDisplay(inspectedUnit).label}
                  </p>
                  <p><span className="text-lime-300">🗺️</span> Terrain: <strong>{TERRAIN_LABELS[inspectedTerrainType ?? "plain"]}</strong></p>
                  <div className="rounded-lg border border-cyan-700 bg-black/20 px-3 py-2">
                    <div className="text-cyan-300 text-sm font-semibold mb-1">Signature Skills</div>
                    {inspectedUnitAbilities.length > 0 ? (
                      <div className="space-y-1.5">
                        {inspectedUnitAbilities.map((ability) => (
                          <p key={ability.key} className="text-xs text-yellow-100 leading-relaxed">
                            <span className="font-semibold text-cyan-200">{ability.name}:</span> {ability.description}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-yellow-100/75">No signature skills.</p>
                    )}
                  </div>
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
                  {hasNoAmmoPenalty(inspectedUnit) && (
                    <p><span className="text-red-400">⚔️</span> <strong>No shots left - fights in close combat at half attack</strong></p>
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

        {isBattleLogPanelOpen && !isSetupMode && (gameOptions.showTurnBanner || gameOptions.showBattleLog) && (
          <div className="fixed left-3 right-3 top-24 z-40 sm:left-4 sm:right-auto sm:w-[30rem]">
            <div className="game-ui p-4 sm:p-6 relative max-h-[calc(100vh-7rem)] overflow-y-auto">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Battle Log</h2>
                  <button
                    onClick={() => setIsBattleLogPanelOpen(false)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>

                {gameOptions.showTurnBanner && (
                  <div className="text-center relative mb-4">
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
                          : turn === "Gauls" ? "Gauls are thinking..."
                          : turn === "Germanic" ? "Germanic tribes are thinking..."
                          : turn === "Carthage" ? "Carthage is thinking..."
                          : turn === "Egypt" ? "Egypt is thinking..."
                          : turn === "Thracians" ? "Thracians are thinking..."
                          : turn === "Dacians" ? "Dacians are thinking..."
                          : turn === "Parthians" ? "Parthians are thinking..."
                          : turn === "Seleucids" ? "Seleucids are thinking..."
                          : turn === "Vikings" ? "Vikings are thinking..." : ""}
                    </div>
                  </div>
                )}

                {gameOptions.showTurnBanner && gameOptions.showBattleLog && (
                  <div className="my-3 border-t border-yellow-600/50" />
                )}

                {gameOptions.showBattleLog && (
                  <div className="relative">
                    <h3 className="text-yellow-200 font-bold mb-1 text-lg border-b border-yellow-600 pb-2">Battle Timeline</h3>
                    <p className="mb-3 text-xs text-yellow-100/70">Attacks, kills, movement, AI intent, merges, and state changes appear here in order.</p>
                    <div className="max-h-[60vh] overflow-y-auto space-y-2">
                      {visibleBattleLog.map((line, i) => {
                        const appearance = getBattleLogAppearance(line);
                        return (
                        <div
                          key={i}
                          className={`rounded-xl border-l-2 p-2.5 text-sm ${appearance.accent} ${appearance.text} ${appearance.bg}`}
                        >
                          {line}
                        </div>
                      )})}
                      {visibleBattleLog.length === 0 && (
                        <p className="text-sm text-yellow-100/75">No battle actions yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
          </div>
        )}

        {isUnitPanelOpen && isSetupMode && (
          <div className="fixed left-3 right-3 top-24 z-40 sm:left-auto sm:right-4 sm:w-[28rem]">
            <div className="game-ui p-4 sm:p-6 relative max-h-[calc(100vh-7rem)] overflow-y-auto">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">{selectedTeam} Troops</h2>
                  <button
                    onClick={() => setIsUnitPanelOpen(false)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto space-y-2">
                  {AVAILABLE_TROOPS[selectedTeam].map((troop, index) => {
                    const troopAbilities = getTroopAbilities(troop.role);
                    return (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => setDraggedTroop(troop)}
                        onDragEnd={() => setDraggedTroop(null)}
                        className="bg-gray-700 p-3 rounded cursor-move hover:bg-gray-600 transition-colors border border-gray-600 relative"
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">
                            {typeof troop.Icon === "string" && troop.Icon.length <= 2
                              ? troop.Icon
                              : ICON_MAP[troop.Icon as keyof typeof ICON_MAP] || troop.Icon || "⚔️"}
                          </div>
                          <div className="flex-1">
                            <div className="text-yellow-200 font-semibold">{troop.name}</div>
                            <div className="text-xs text-gray-300">{troop.role}</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/78">Signature Skills</div>
                          {troopAbilities.length > 0 ? (
                            <div className="mt-1.5 space-y-1.5">
                              {troopAbilities.map((ability) => (
                                <div
                                  key={ability.key}
                                  className="rounded-lg border border-cyan-700/35 bg-cyan-950/20 px-2.5 py-2 text-[11px] leading-relaxed text-cyan-50"
                                >
                                  <span className="font-semibold text-cyan-200">{ability.name}:</span> {ability.description}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-1.5 text-[11px] text-yellow-100/68">No signature skills.</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-600">
                  <div className="text-yellow-200 font-semibold mb-2">Team Counts:</div>
                  <div className="text-sm text-gray-300">
                    {setupTeams.map((team) => (
                      <div key={team}>{team}: {getTeamCount(team)}/16</div>
                    ))}
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default CodeConq;
