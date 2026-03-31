import type { UnitWeight } from "../game/types";
import { getUnitWeight } from "../game/unitWeight";

export type TroopStats = {
  hp: number;
  maxHp: number;
  attack: number;
  ammo: number;
  range: number;
  move: number;
  weight: UnitWeight;
};

type TroopStatTemplate = {
  hp: [number, number];
  attack: [number, number];
  ammo: number;
  range: number;
  move: number;
};

export type TroopReferenceStats = {
  hp: [number, number];
  attack: [number, number];
  ammo: number;
  range: number;
  move: number;
  weight: UnitWeight;
};

export type TroopAbilityKey =
  | "brace"
  | "charge"
  | "command"
  | "crush"
  | "deadeye"
  | "ferocity"
  | "guarded"
  | "harrier"
  | "resolve"
  | "shieldWall"
  | "shock"
  | "siegeMastery"
  | "skirmishStep";

export type TroopAbilityDefinition = {
  key: TroopAbilityKey;
  name: string;
  description: string;
};

const TROOP_ABILITY_DEFINITIONS: Record<TroopAbilityKey, TroopAbilityDefinition> = {
  brace: {
    key: "brace",
    name: "Brace",
    description: "+15% attack against mounted targets, and takes 15% less damage from mounted attackers."
  },
  shieldWall: {
    key: "shieldWall",
    name: "Shield Wall",
    description: "-10% incoming damage while adjacent to at least 1 allied unit."
  },
  shock: {
    key: "shock",
    name: "Shock Assault",
    description: "+20% attack against targets at or below 50% HP."
  },
  charge: {
    key: "charge",
    name: "Charge",
    description: "+15% attack on plains for mounted units, plus +10% attack against ranged or siege targets."
  },
  harrier: {
    key: "harrier",
    name: "Harrier",
    description: "+10% attack while ammo remains against targets with 1 or less move, and against siege units."
  },
  guarded: {
    key: "guarded",
    name: "Guarded",
    description: "-10% incoming damage while above 50% HP.-30% incoming damage while under 50% HP."
  },
  ferocity: {
    key: "ferocity",
    name: "Ferocity",
    description: "+10% attack while not adjacent to any allied unit."
  },
  deadeye: {
    key: "deadeye",
    name: "Deadeye",
    description: "+1 range on hills, and +10% attack against ranged or siege targets."
  },
  crush: {
    key: "crush",
    name: "Crush",
    description: "+15% attack against close-combat targets, plus +15% attack against Guarded or Shield Wall defenders."
  },
  command: {
    key: "command",
    name: "Command Aura",
    description: "Adjacent allies gain +5% HP. This stacks with the normal +10% leader aura when both apply."
  },
  siegeMastery: {
    key: "siegeMastery",
    name: "Siege Mastery",
    description: "+10% attack on plains or hills, and +1 range on hills."
  },
  skirmishStep: {
    key: "skirmishStep",
    name: "Skirmish Step",
    description: "+1 move while ammo remains, and +5% attack and +5% HP while ammo remains."
  },
  resolve: {
    key: "resolve",
    name: "Resolve",
    description: "+10% attack while adjacent to an allied unit."
  }
};

const TROOP_ROLE_ABILITIES: Record<string, TroopAbilityKey[]> = {
  "Roman King": ["command"],
  Legionary: ["guarded"],
  Centurion: ["resolve"],
  Auxiliary: ["ferocity"],
  Triarii: ["brace"],
  Archer: ["deadeye"],
  Hoplite: ["brace"],
  Phalangite: ["brace"],
  "Seleucid Phalangite": ["brace"],
  "Eastern Spearman": ["brace"],
  "Parthian Spearman": ["guarded"],
  "Dacian Spearman": ["brace"],
  "Thracian Spearman": ["brace"],
  "Bondi Spearman": ["brace"],
  "African Pikeman": ["brace"],
  "Punic Spearman": ["brace"],
  Praetorian: ["shieldWall"],
  "Royal Guard": ["shieldWall"],
  "Shield Bearer": ["shieldWall"],
  "Dacian Shield Bearer": ["shieldWall"],
  "Sacred Band": ["shieldWall"],
  "Silver Shield Infantry": ["shieldWall"],
  Medjay: ["guarded"],
  Thorakitai: ["guarded"],
  Hirdman: ["guarded"],
  Shieldmaiden: ["guarded"],
  "Thracian Guard": ["guarded"],
  "Dacian Guard": ["guarded"],
  "Libyan Infantry": ["guarded"],
  "Liby-Phoenician Infantry": ["guarded"],
  Hypaspist: ["guarded"],
  Agema: ["resolve"],
  "Barbarian Spearman": ["guarded"],
  "Gallic Spearman": ["guarded"],
  "Germanic Spearman": ["guarded"],
  Hearthguard: ["guarded"],
  Huscarl: ["shieldWall"],
  "Varangian Guard": ["shieldWall"],
  "Barbarian Berserker": ["shock"],
  "Gallic Berserker": ["shock"],
  Berserker: ["shock"],
  Ulfhednar: ["shock"],
  "Falx Warrior": ["shock"],
  Falxman: ["shock"],
  "Rhomphaia Fighter": ["shock"],
  "Barbarian Warrior": ["ferocity"],
  "Barbarian Axeman": ["ferocity"],
  "Barbarian Raider": ["ferocity"],
  Oathsworn: ["resolve"],
  "Gallic Warrior": ["ferocity"],
  "Gallic Oathsworn": ["resolve"],
  Gaesatae: ["ferocity"],
  Fianna: ["resolve"],
  "Germanic Warrior": ["ferocity"],
  "Germanic Berserker": ["ferocity"],
  "Germanic Raider": ["ferocity"],
  "Chosen Axeman": ["ferocity"],
  "Iberian Swordsman": ["ferocity"],
  "Egyptian Warrior": ["ferocity"],
  "Khopesh Warrior": ["ferocity"],
  "Thracian Warrior": ["ferocity"],
  "Dacian Warrior": ["ferocity"],
  "Parthian Warrior": ["ferocity"],
  "Viking Raider": ["ferocity"],
  Jomsviking: ["resolve"],
  Cavalry: ["charge"],
  "Companion Cavalry": ["charge"],
  "Thessalian Cavalry": ["charge"],
  "Gallic Cavalry": ["charge"],
  "Gallic Chariot": ["skirmishStep"],
  "Barbarian Noble Rider": ["ferocity"],
  "Gallic Noble Horseman": ["ferocity"],
  "Germanic Wolf Rider": ["ferocity"],
  "Numidian Cavalry": ["charge"],
  "War Chariot": ["charge"],
  "Thracian Rider": ["charge"],
  "Thracian Noble Rider": ["charge"],
  "Dacian Rider": ["charge"],
  "Dacian Noble Rider": ["charge"],
  "Parthian Cataphract": ["charge"],
  "Parthian Noble Rider": ["ferocity"],
  "Seleucid Cataphract": ["charge"],
  "Seleucid Light Cavalry": ["skirmishStep"],
  "Gothic Lancer": ["charge"],
  "Suebi Rider": ["charge"],
  "Royal Chariot": ["skirmishStep"],
  "Scout Rider": ["skirmishStep"],
  "Camel Rider": ["ferocity"],
  Velites: ["harrier"],
  Peltast: ["harrier"],
  Thureophoroi: ["harrier"],
  "Gallic Skirmisher": ["harrier"],
  "Balearic Slinger": ["harrier"],
  "Tribal Slinger": ["skirmishStep"],
  "Seleucid Slinger": ["skirmishStep"],
  "Dacian Slinger": ["harrier"],
  "Thracian Peltast": ["harrier"],
  "Barbarian Scout": ["harrier"],
  Scout: ["harrier"],
  "Desert Scout": ["harrier"],
  "Horse Archer": ["harrier"],
  "Elite Horse Archer": ["harrier"],
  "Camel Rider Archer": ["harrier"],
  "Barbarian Archer": ["deadeye"],
  "Barbarian Shaman": ["skirmishStep"],
  "Cretan Archer": ["deadeye"],
  "Gallic Archer": ["deadeye"],
  "Germanic Archer": ["deadeye"],
  "Carthaginian Archer": ["deadeye"],
  "Egyptian Archer": ["deadeye"],
  "Nubian Archer": ["deadeye"],
  "Thracian Archer": ["deadeye"],
  "Dacian Archer": ["deadeye"],
  "Parthian Archer": ["deadeye"],
  "Eastern Archer": ["deadeye"],
  "Viking Archer": ["deadeye"],
  "Elephant Archer": ["crush"],
  "Seleucid Elephant Archer": ["crush"],
  Ballista: ["siegeMastery"],
  "Heavy Cavalry": ["charge"],
  Onager: ["siegeMastery"],
  "Greek Catapult": ["siegeMastery"],
  Polybolos: ["siegeMastery"],
  "Egyptian Catapult": ["siegeMastery"],
  "Thracian Catapult": ["siegeMastery"],
  "Dacian Catapult": ["siegeMastery"],
  "Parthian Ballista": ["siegeMastery"],
  "Seleucid Catapult": ["siegeMastery"],
  "War Elephant": ["crush"],
  "Seleucid War Elephant": ["crush"],
  "Barbarian Chief": ["command"],
  "Barbarian Warlord": ["command"],
  "Macedonian King": ["command"],
  "Gallic King": ["command"],
  "Germanic King": ["command"],
  "Carthaginian General": ["command"],
  Pharaoh: ["command"],
  "Thracian King": ["command"],
  "War Drummer": ["command"],
  "Dacian King": ["command"],
  "War Horn": ["command"],
  "Parthian King": ["command"],
  "Seleucid King": ["command"],
  Jarl: ["command"]
};

export const getTroopAbilities = (role: string): TroopAbilityDefinition[] =>
  (TROOP_ROLE_ABILITIES[role] ?? []).map((abilityKey) => TROOP_ABILITY_DEFINITIONS[abilityKey]);

const halveAmmo = (ammo: number) => {
  if (ammo <= 0) return 0;
  return Math.max(1, Math.ceil(ammo / 2));
};

// Normalize projectile troops so they always keep a sensible range/ammo floor.
const ensureRangedAmmo = (role: string, stats: TroopStats): TroopStats => {
  const normalizedRole = role.toLowerCase();
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
    return { ...stats, ammo: 0, range: 1 };
  }

  const isSiegeUnit = ["ballista", "catapult", "trebuchet", "polybolos", "onager", "bombard"].some((keyword) =>
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

  return {
    ...stats,
    ammo: halveAmmo(Math.max(minimumAmmo, stats.ammo)),
    range: Math.max(minimumRange, stats.range)
  };
};

const ensureRoleMoveRules = (role: string, stats: TroopStats): TroopStats => {
  const normalizedRole = role.toLowerCase();
  const siegeKeywords = ["ballista", "catapult", "trebuchet", "polybolos", "onager", "bombard"];
  const mountedKeywords = [
    "cavalry",
    "chariot",
    "rider",
    "scout",
    "knight",
    "elephant",
    "equites",
    "xystophoroi",
    "companion",
    "thessalian",
    "horseman",
    "lancer",
    "horse",
    "camel",
    "cataphract",
    "ritterbruder",
    "turcopole"
  ];

  const isSiegeUnit = siegeKeywords.some((keyword) => normalizedRole.includes(keyword));
  const isRangedUnit = (stats.ammo ?? 0) > 0 && (stats.range ?? 1) > 1;
  const isMountedUnit = mountedKeywords.some((keyword) => normalizedRole.includes(keyword));

  if (isSiegeUnit || (isMountedUnit && !isRangedUnit)) {
    return stats;
  }

  return {
    ...stats,
    move: 1
  };
};

/**
 * Per weight step (light→medium→heavy→elite): multiply each light-tier HP/attack endpoint by
 * `TROOP_WEIGHT_TIER_MULTIPLIER ** tier`, rounded. `unique` is one step above elite (same factor).
 * When retuning, update light bases or the multiplier, then recompute elite and unique per category.
 */
export const TROOP_WEIGHT_TIER_MULTIPLIER = 1.25;

/** HP/attack bands by line weight, keyed like troop UI categories (siege / ranged / melee / mounted). */
export const SCALED_WEIGHT_RANGES = {
  siege: {
    light: { hp: [50, 100], attack: [60, 100] },
    medium: { hp: [63, 125], attack: [75, 125] },
    heavy: { hp: [78, 156], attack: [94, 156] },
    elite: { hp: [98, 195], attack: [117, 195] },
    unique: { hp: [123, 244], attack: [146, 244] }
  },
  ranged: {
    light: { hp: [80, 130], attack: [50, 90] },
    medium: { hp: [100, 163], attack: [63, 113] },
    heavy: { hp: [125, 203], attack: [78, 141] },
    elite: { hp: [156, 254], attack: [98, 176] },
    unique: { hp: [195, 318], attack: [123, 220] }
  },
  closeCombat: {
    light: { hp: [130, 170], attack: [90, 140] },
    medium: { hp: [163, 213], attack: [113, 175] },
    heavy: { hp: [203, 266], attack: [141, 219] },
    elite: { hp: [254, 332], attack: [176, 273] },
    unique: { hp: [318, 415], attack: [220, 341] }
  },
  mounted: {
    light: { hp: [160, 200], attack: [110, 160] },
    medium: { hp: [200, 250], attack: [138, 200] },
    heavy: { hp: [250, 313], attack: [172, 250] },
    elite: { hp: [313, 391], attack: [215, 313] },
    unique: { hp: [391, 489], attack: [269, 391] }
  }
} as const;

type TroopRoleProfile = { ammo: number; range: number; move: number };
type StatScaleCategory = keyof typeof SCALED_WEIGHT_RANGES;

/** Aligns with `getTroopMechanicType` classification using role + profile (no rolled stats). */
const getStatScaleCategory = (role: string, profile: TroopRoleProfile): StatScaleCategory => {
  const roleLower = role.toLowerCase();
  const siegeKeywords = ["ballista", "catapult", "trebuchet", "polybolos", "siege tower", "onager", "bombard"];
  if (siegeKeywords.some((keyword) => roleLower.includes(keyword))) {
    return "siege";
  }
  if (profile.ammo > 0 && profile.range > 1) {
    return "ranged";
  }
  const mountedKeywords = ["cavalry", "chariot", "rider", "scout", "knight", "elephant", "horse", "camel", "cataphract"];
  if (mountedKeywords.some((keyword) => roleLower.includes(keyword)) || (profile.move >= 3 && profile.range <= 1)) {
    return "mounted";
  }
  return "closeCombat";
};

/** Per-role mobility & weapon profile; HP/attack min/max come from `SCALED_WEIGHT_RANGES` for unit weight + category. */
const TROOP_ROLE_PROFILES: Record<string, TroopRoleProfile> = {
  // Romans
  "Roman King": { ammo: 0, range: 1, move: 1 },
  Praetorian: { ammo: 0, range: 1, move: 1 },
  Centurion: { ammo: 0, range: 1, move: 1 },
  Legionary: { ammo: 0, range: 1, move: 1 },
  Auxiliary: { ammo: 0, range: 1, move: 1 },
  Triarii: { ammo: 0, range: 1, move: 1 },
  Archer: { ammo: 10, range: 3, move: 1 },
  Velites: { ammo: 10, range: 3, move: 1 },
  Cavalry: { ammo: 0, range: 1, move: 3 },
  Ballista: { ammo: 10, range: 6, move: 1 },
  "Heavy Cavalry": { ammo: 0, range: 1, move: 3 },
  Onager: { ammo: 6, range: 6, move: 1 },

  // Barbarians
  "Barbarian Chief": { ammo: 0, range: 1, move: 1 },
  "Barbarian Warlord": { ammo: 0, range: 1, move: 1 },
  "Barbarian Warrior": { ammo: 0, range: 1, move: 1 },
  "Barbarian Berserker": { ammo: 0, range: 1, move: 1 },
  "Barbarian Axeman": { ammo: 0, range: 1, move: 1 },
  "Barbarian Spearman": { ammo: 0, range: 1, move: 1 },
  "Barbarian Raider": { ammo: 0, range: 1, move: 1 },
  Oathsworn: { ammo: 0, range: 1, move: 1 },
  "Barbarian Scout": { ammo: 4, range: 3, move: 3 },
  "Barbarian Noble Rider": { ammo: 0, range: 1, move: 3 },
  "Barbarian Archer": { ammo: 10, range: 2, move: 1 },
  "Barbarian Shaman": { ammo: 10, range: 2, move: 1 },

  // Greeks / Macedonians
  "Macedonian King": { ammo: 0, range: 1, move: 1 },
  Agema: { ammo: 0, range: 1, move: 1 },
  Hoplite: { ammo: 0, range: 1, move: 1 },
  Phalangite: { ammo: 0, range: 1, move: 1 },
  Hypaspist: { ammo: 0, range: 1, move: 1 },
  Thureophoroi: { ammo: 6, range: 2, move: 1 },
  Peltast: { ammo: 12, range: 3, move: 1 },
  "Cretan Archer": { ammo: 12, range: 4, move: 1 },
  "Companion Cavalry": { ammo: 0, range: 1, move: 3 },
  "Thessalian Cavalry": { ammo: 0, range: 1, move: 3 },
  "Greek Catapult": { ammo: 8, range: 6, move: 1 },
  Polybolos: { ammo: 16, range: 5, move: 1 },

  // Gauls
  "Gallic King": { ammo: 0, range: 1, move: 1 },
  "Gallic Warrior": { ammo: 0, range: 1, move: 1 },
  "Gallic Berserker": { ammo: 0, range: 1, move: 1 },
  "Gallic Spearman": { ammo: 0, range: 1, move: 1 },
  "Gallic Oathsworn": { ammo: 0, range: 1, move: 1 },
  Gaesatae: { ammo: 0, range: 1, move: 1 },
  Fianna: { ammo: 0, range: 1, move: 1 },
  "Gallic Cavalry": { ammo: 0, range: 1, move: 4 },
  "Gallic Noble Horseman": { ammo: 0, range: 1, move: 3 },
  "Gallic Chariot": { ammo: 4, range: 3, move: 4 },
  "Gallic Archer": { ammo: 10, range: 3, move: 1 },
  "Gallic Skirmisher": { ammo: 12, range: 3, move: 1 },

  // Germanic
  "Germanic King": { ammo: 0, range: 1, move: 1 },
  "Germanic Warrior": { ammo: 0, range: 1, move: 1 },
  "Germanic Spearman": { ammo: 0, range: 1, move: 1 },
  "Germanic Berserker": { ammo: 0, range: 1, move: 1 },
  "Germanic Raider": { ammo: 0, range: 1, move: 1 },
  "Chosen Axeman": { ammo: 0, range: 1, move: 1 },
  Hearthguard: { ammo: 0, range: 1, move: 1 },
  "Germanic Wolf Rider": { ammo: 0, range: 1, move: 2 },
  "Suebi Rider": { ammo: 0, range: 1, move: 3 },
  "Gothic Lancer": { ammo: 0, range: 1, move: 3 },
  "Germanic Archer": { ammo: 10, range: 2, move: 1 },
  "Tribal Slinger": { ammo: 10, range: 3, move: 1 },

  // Carthage
  "Carthaginian General": { ammo: 0, range: 1, move: 1 },
  "Libyan Infantry": { ammo: 0, range: 1, move: 1 },
  "Sacred Band": { ammo: 0, range: 1, move: 1 },
  "Liby-Phoenician Infantry": { ammo: 0, range: 1, move: 1 },
  "Iberian Swordsman": { ammo: 0, range: 1, move: 1 },
  "African Pikeman": { ammo: 0, range: 1, move: 1 },
  "Punic Spearman": { ammo: 0, range: 1, move: 1 },
  "Punic Marine": { ammo: 0, range: 1, move: 1 },
  "Numidian Cavalry": { ammo: 0, range: 1, move: 3 },
  "War Elephant": { ammo: 0, range: 1, move: 3 },
  "Elephant Archer": { ammo: 4, range: 3, move: 2 },
  "Balearic Slinger": { ammo: 12, range: 4, move: 1 },
  "Carthaginian Archer": { ammo: 10, range: 3, move: 1 },

  // Egypt
  Pharaoh: { ammo: 0, range: 1, move: 1 },
  "Egyptian Warrior": { ammo: 0, range: 1, move: 1 },
  Medjay: { ammo: 0, range: 1, move: 1 },
  "Khopesh Warrior": { ammo: 0, range: 1, move: 1 },
  "Shield Bearer": { ammo: 0, range: 1, move: 1 },
  "Royal Guard": { ammo: 0, range: 1, move: 1 },
  "Egyptian Archer": { ammo: 10, range: 3, move: 1 },
  "Nubian Archer": { ammo: 12, range: 4, move: 1 },
  "War Chariot": { ammo: 0, range: 1, move: 4 },
  "Royal Chariot": { ammo: 4, range: 4, move: 4 },
  "Desert Scout": { ammo: 4, range: 3, move: 4 },
  "Egyptian Catapult": { ammo: 8, range: 6, move: 1 },

  // Thracians
  "Thracian King": { ammo: 0, range: 1, move: 1 },
  "Thracian Warrior": { ammo: 0, range: 1, move: 1 },
  "Rhomphaia Fighter": { ammo: 0, range: 1, move: 1 },
  "Falx Warrior": { ammo: 0, range: 1, move: 1 },
  "Thracian Spearman": { ammo: 0, range: 1, move: 1 },
  "Thracian Guard": { ammo: 0, range: 1, move: 1 },
  "Thracian Peltast": { ammo: 12, range: 3, move: 1 },
  "Thracian Archer": { ammo: 10, range: 3, move: 1 },
  "Thracian Rider": { ammo: 0, range: 1, move: 3 },
  "Thracian Noble Rider": { ammo: 0, range: 1, move: 3 },
  "War Drummer": { ammo: 0, range: 1, move: 1 },
  "Thracian Catapult": { ammo: 8, range: 6, move: 1 },

  // Dacians
  "Dacian King": { ammo: 0, range: 1, move: 1 },
  "Dacian Warrior": { ammo: 0, range: 1, move: 1 },
  Falxman: { ammo: 0, range: 1, move: 1 },
  "Dacian Spearman": { ammo: 0, range: 1, move: 1 },
  "Dacian Shield Bearer": { ammo: 0, range: 1, move: 1 },
  "Dacian Guard": { ammo: 0, range: 1, move: 1 },
  "Dacian Slinger": { ammo: 12, range: 4, move: 1 },
  "Dacian Archer": { ammo: 10, range: 3, move: 1 },
  "Dacian Rider": { ammo: 0, range: 1, move: 3 },
  "Dacian Noble Rider": { ammo: 0, range: 1, move: 3 },
  "War Horn": { ammo: 0, range: 1, move: 1 },
  "Dacian Catapult": { ammo: 8, range: 6, move: 1 },

  // Parthians
  "Parthian King": { ammo: 0, range: 1, move: 1 },
  "Parthian Warrior": { ammo: 0, range: 1, move: 1 },
  "Parthian Spearman": { ammo: 0, range: 1, move: 1 },
  "Parthian Cataphract": { ammo: 0, range: 1, move: 3 },
  "Parthian Noble Rider": { ammo: 0, range: 1, move: 3 },
  "Horse Archer": { ammo: 4, range: 4, move: 3 },
  "Elite Horse Archer": { ammo: 4, range: 4, move: 3 },
  "Parthian Archer": { ammo: 10, range: 3, move: 1 },
  "Scout Rider": { ammo: 0, range: 1, move: 4 },
  "Zoroastrian Priest": { ammo: 0, range: 1, move: 1 },
  "Camel Rider": { ammo: 0, range: 1, move: 3 },
  "Camel Rider Archer": { ammo: 4, range: 3, move: 3 },
  "Parthian Ballista": { ammo: 8, range: 6, move: 1 },

  // Seleucids
  "Seleucid King": { ammo: 0, range: 1, move: 1 },
  "Seleucid Phalangite": { ammo: 0, range: 1, move: 1 },
  "Silver Shield Infantry": { ammo: 0, range: 1, move: 1 },
  Thorakitai: { ammo: 0, range: 1, move: 1 },
  "Eastern Spearman": { ammo: 0, range: 1, move: 1 },
  "Seleucid War Elephant": { ammo: 0, range: 1, move: 3 },
  "Seleucid Cataphract": { ammo: 0, range: 1, move: 3 },
  "Seleucid Light Cavalry": { ammo: 0, range: 1, move: 3 },
  "Eastern Archer": { ammo: 10, range: 3, move: 1 },
  "Seleucid Slinger": { ammo: 12, range: 4, move: 1 },
  "Seleucid Elephant Archer": { ammo: 4, range: 3, move: 2 },
  "Standard Bearer": { ammo: 0, range: 1, move: 1 },
  "Seleucid Catapult": { ammo: 8, range: 6, move: 1 },

  // Vikings
  Jarl: { ammo: 0, range: 1, move: 1 },
  Huscarl: { ammo: 0, range: 1, move: 1 },
  Hirdman: { ammo: 0, range: 1, move: 1 },
  Ulfhednar: { ammo: 0, range: 1, move: 1 },
  "Varangian Guard": { ammo: 0, range: 1, move: 1 },
  Jomsviking: { ammo: 0, range: 1, move: 1 },
  "Viking Raider": { ammo: 0, range: 1, move: 1 },
  Berserker: { ammo: 0, range: 1, move: 1 },
  Shieldmaiden: { ammo: 0, range: 1, move: 1 },
  "Bondi Spearman": { ammo: 0, range: 1, move: 1 },
  Scout: { ammo: 4, range: 3, move: 3 },
  "Viking Archer": { ammo: 10, range: 3, move: 1 }
};

const DEFAULT_ROLE_PROFILE: TroopRoleProfile = { ammo: 0, range: 1, move: 1 };

const getTroopStatTemplate = (role: string): TroopStatTemplate => {
  const profile = TROOP_ROLE_PROFILES[role] ?? DEFAULT_ROLE_PROFILE;
  const weight = getUnitWeight(role);
  const category = getStatScaleCategory(role, profile);
  const band = SCALED_WEIGHT_RANGES[category][weight];
  return {
    hp: [band.hp[0], band.hp[1]],
    attack: [band.attack[0], band.attack[1]],
    ammo: profile.ammo,
    range: profile.range,
    move: profile.move
  };
};

const rollInRange = (min: number, max: number) =>
  max > min ? Math.floor(Math.random() * (max - min) + min) : min;

// Roll a concrete stat line from a reusable min/max template.
const generateTemplateStats = (template: TroopStatTemplate) => ({
  hp: rollInRange(template.hp[0], template.hp[1]),
  attack: rollInRange(template.attack[0], template.attack[1]),
  ammo: template.ammo,
  range: template.range,
  move: template.move
});

const normalizeTemplateRules = (role: string, template: TroopStatTemplate): Omit<TroopReferenceStats, "weight"> => {
  const normalized = ensureRoleMoveRules(
    role,
    ensureRangedAmmo(role, {
      hp: template.hp[0],
      maxHp: template.hp[0],
      attack: template.attack[0],
      ammo: template.ammo,
      range: template.range,
      move: template.move,
      weight: getUnitWeight(role)
    })
  );

  return {
    hp: template.hp,
    attack: template.attack,
    ammo: normalized.ammo,
    range: normalized.range,
    move: normalized.move
  };
};

export const getTroopReferenceStats = (role: string): TroopReferenceStats => {
  const template = getTroopStatTemplate(role);
  return {
    ...normalizeTemplateRules(role, template),
    weight: getUnitWeight(role)
  };
};

// Main troop stat lookup: HP/attack rolls from `SCALED_WEIGHT_RANGES`, plus per-role profile.
export const generateTroopStats = (role: string): TroopStats => {
  const template = getTroopStatTemplate(role);
  const templateStats = generateTemplateStats(template);
  const hp = templateStats.hp;
  const maxHp = hp;
  const attack = templateStats.attack;
  const ammo = templateStats.ammo;
  const range = templateStats.range;
  const move = templateStats.move;

  return ensureRoleMoveRules(
    role,
    ensureRangedAmmo(role, { hp, maxHp, attack, ammo, range, move, weight: getUnitWeight(role) })
  );
};
