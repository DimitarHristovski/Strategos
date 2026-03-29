export type TroopStats = {
  hp: number;
  maxHp: number;
  attack: number;
  ammo: number;
  range: number;
  move: number;
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
};

export type TroopAbilityKey =
  | "brace"
  | "shieldWall"
  | "shock"
  | "charge"
  | "harrier"
  | "guarded"
  | "ferocity"
  | "deadeye"
  | "crush"
  | "command"
  | "siegeMastery"
  | "skirmishStep"
  | "resolve";

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
    description: "-10% incoming damage while above 50% HP."
  },
  ferocity: {
    key: "ferocity",
    name: "Ferocity",
    description: "+10% attack while not adjacent to any allied unit."
  },
  deadeye: {
    key: "deadeye",
    name: "Deadeye",
    description: "+1 range on hills, and +10% attack against unsupported ranged or siege targets."
  },
  crush: {
    key: "crush",
    name: "Crush",
    description: "+15% attack against close-combat targets, plus +5% attack against Guarded or Shield Wall defenders."
  },
  command: {
    key: "command",
    name: "Command Aura",
    description: "Adjacent allies gain +5% attack. This stacks with the normal +10% leader aura when both apply."
  },
  siegeMastery: {
    key: "siegeMastery",
    name: "Siege Mastery",
    description: "+10% attack on plains or hills, and +1 range on hills."
  },
  skirmishStep: {
    key: "skirmishStep",
    name: "Skirmish Step",
    description: "+1 move while ammo remains."
  },
  resolve: {
    key: "resolve",
    name: "Resolve",
    description: "+10% attack while adjacent to an allied unit at or below 50% HP."
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
  Scorpion: ["siegeMastery"],
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
    return { ...stats, ammo: 0, range: 1 };
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

  return {
    ...stats,
    ammo: halveAmmo(Math.max(minimumAmmo, stats.ammo)),
    range: Math.max(minimumRange, stats.range)
  };
};

const ensureRoleMoveRules = (role: string, stats: TroopStats): TroopStats => {
  const normalizedRole = role.toLowerCase();
  const siegeKeywords = ["ballista", "scorpion", "catapult", "trebuchet", "polybolos", "onager", "bombard"];
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

// Unified troop templates. Every unit now lives in one faction-grouped source of truth.
const TROOP_STAT_TEMPLATES: Record<string, TroopStatTemplate> = {
  // Romans
  "Roman King": { hp: [420, 450], attack: [240, 270], ammo: 0, range: 1, move: 1 },
  Praetorian: { hp: [440, 520], attack: [180, 220], ammo: 0, range: 1, move: 1 },
  Centurion: { hp: [340, 420], attack: [150, 180], ammo: 0, range: 1, move: 1 },
  Legionary: { hp: [280, 340], attack: [110, 140], ammo: 0, range: 1, move: 1 },
  Auxiliary: { hp: [170, 220], attack: [90, 120], ammo: 0, range: 1, move: 1 },
  Triarii: { hp: [320, 380], attack: [120, 150], ammo: 0, range: 1, move: 1 },
  Archer: { hp: [150, 200], attack: [65, 90], ammo: 10, range: 3, move: 1 },
  Velites: { hp: [90, 130], attack: [50, 75], ammo: 10, range: 3, move: 1 },
  Cavalry: { hp: [220, 260], attack: [120, 150], ammo: 0, range: 1, move: 3 },
  Ballista: { hp: [10, 50], attack: [50, 100], ammo: 10, range: 6, move: 1 },
  Scorpion: { hp: [10, 20], attack: [30, 80], ammo: 10, range: 3, move: 1 },
  Onager: { hp: [60, 90], attack: [150, 190], ammo: 6, range: 6, move: 1 },

  // Barbarians
  "Barbarian Chief": { hp: [360, 420], attack: [250, 290], ammo: 0, range: 1, move: 1 },
  "Barbarian Warlord": { hp: [420, 520], attack: [240, 290], ammo: 0, range: 1, move: 1 },
  "Barbarian Warrior": { hp: [220, 270], attack: [130, 170], ammo: 0, range: 1, move: 1 },
  "Barbarian Berserker": { hp: [240, 310], attack: [220, 260], ammo: 0, range: 1, move: 1 },
  "Barbarian Axeman": { hp: [260, 340], attack: [170, 210], ammo: 0, range: 1, move: 1 },
  "Barbarian Spearman": { hp: [180, 230], attack: [90, 120], ammo: 0, range: 1, move: 1 },
  "Barbarian Raider": { hp: [140, 190], attack: [130, 165], ammo: 0, range: 1, move: 1 },
  Oathsworn: { hp: [300, 360], attack: [190, 230], ammo: 0, range: 1, move: 1 },
  "Barbarian Scout": { hp: [170, 220], attack: [120, 150], ammo: 4, range: 3, move: 3 },
  "Barbarian Noble Rider": { hp: [230, 280], attack: [145, 175], ammo: 0, range: 1, move: 3 },
  "Barbarian Archer": { hp: [90, 140], attack: [60, 85], ammo: 10, range: 2, move: 1 },
  "Barbarian Shaman": { hp: [120, 170], attack: [110, 150], ammo: 10, range: 2, move: 1 },

  // Greeks / Macedonians
  "Macedonian King": { hp: [400, 440], attack: [250, 285], ammo: 0, range: 1, move: 1 },
  Agema: { hp: [320, 380], attack: [160, 200], ammo: 0, range: 1, move: 1 },
  Hoplite: { hp: [300, 360], attack: [110, 140], ammo: 0, range: 1, move: 1 },
  Phalangite: { hp: [340, 400], attack: [125, 155], ammo: 0, range: 1, move: 1 },
  Hypaspist: { hp: [280, 340], attack: [140, 175], ammo: 0, range: 1, move: 1 },
  Thureophoroi: { hp: [200, 250], attack: [95, 125], ammo: 6, range: 2, move: 1 },
  Peltast: { hp: [140, 180], attack: [75, 100], ammo: 12, range: 3, move: 1 },
  "Cretan Archer": { hp: [130, 170], attack: [90, 120], ammo: 12, range: 4, move: 1 },
  "Companion Cavalry": { hp: [240, 300], attack: [170, 210], ammo: 0, range: 1, move: 3 },
  "Thessalian Cavalry": { hp: [230, 280], attack: [145, 175], ammo: 0, range: 1, move: 3 },
  "Greek Catapult": { hp: [30, 60], attack: [110, 160], ammo: 8, range: 6, move: 1 },
  Polybolos: { hp: [40, 70], attack: [90, 140], ammo: 16, range: 5, move: 1 },

  // Gauls
  "Gallic King": { hp: [340, 390], attack: [220, 255], ammo: 0, range: 1, move: 1 },
  "Gallic Warrior": { hp: [200, 250], attack: [115, 145], ammo: 0, range: 1, move: 1 },
  "Gallic Berserker": { hp: [220, 280], attack: [180, 220], ammo: 0, range: 1, move: 1 },
  "Gallic Spearman": { hp: [180, 230], attack: [95, 125], ammo: 0, range: 1, move: 1 },
  "Gallic Oathsworn": { hp: [300, 360], attack: [185, 225], ammo: 0, range: 1, move: 1 },
  Gaesatae: { hp: [270, 330], attack: [200, 240], ammo: 0, range: 1, move: 1 },
  Fianna: { hp: [240, 290], attack: [155, 185], ammo: 0, range: 1, move: 1 },
  "Gallic Cavalry": { hp: [180, 230], attack: [120, 150], ammo: 0, range: 1, move: 4 },
  "Gallic Noble Horseman": { hp: [220, 280], attack: [150, 180], ammo: 0, range: 1, move: 3 },
  "Gallic Chariot": { hp: [170, 220], attack: [130, 160], ammo: 4, range: 3, move: 4 },
  "Gallic Archer": { hp: [120, 160], attack: [75, 100], ammo: 10, range: 3, move: 1 },
  "Gallic Skirmisher": { hp: [110, 150], attack: [65, 90], ammo: 12, range: 3, move: 1 },

  // Germanic
  "Germanic King": { hp: [400, 440], attack: [270, 305], ammo: 0, range: 1, move: 1 },
  "Germanic Warrior": { hp: [260, 320], attack: [135, 170], ammo: 0, range: 1, move: 1 },
  "Germanic Spearman": { hp: [240, 290], attack: [100, 130], ammo: 0, range: 1, move: 1 },
  "Germanic Berserker": { hp: [270, 330], attack: [205, 245], ammo: 0, range: 1, move: 1 },
  "Germanic Raider": { hp: [180, 230], attack: [135, 170], ammo: 0, range: 1, move: 1 },
  "Chosen Axeman": { hp: [300, 350], attack: [180, 220], ammo: 0, range: 1, move: 1 },
  Hearthguard: { hp: [320, 380], attack: [170, 210], ammo: 0, range: 1, move: 1 },
  "Germanic Wolf Rider": { hp: [220, 260], attack: [140, 175], ammo: 0, range: 1, move: 2 },
  "Suebi Rider": { hp: [220, 270], attack: [150, 180], ammo: 0, range: 1, move: 3 },
  "Gothic Lancer": { hp: [250, 300], attack: [165, 195], ammo: 0, range: 1, move: 3 },
  "Germanic Archer": { hp: [150, 190], attack: [70, 95], ammo: 10, range: 2, move: 1 },
  "Tribal Slinger": { hp: [140, 180], attack: [70, 95], ammo: 10, range: 3, move: 1 },

  // Carthage
  "Carthaginian General": { hp: [390, 430], attack: [230, 265], ammo: 0, range: 1, move: 1 },
  "Libyan Infantry": { hp: [240, 290], attack: [110, 140], ammo: 0, range: 1, move: 1 },
  "Sacred Band": { hp: [340, 400], attack: [170, 205], ammo: 0, range: 1, move: 1 },
  "Liby-Phoenician Infantry": { hp: [260, 320], attack: [125, 155], ammo: 0, range: 1, move: 1 },
  "Iberian Swordsman": { hp: [230, 290], attack: [145, 180], ammo: 0, range: 1, move: 1 },
  "African Pikeman": { hp: [260, 320], attack: [120, 145], ammo: 0, range: 1, move: 1 },
  "Punic Spearman": { hp: [250, 300], attack: [120, 145], ammo: 0, range: 1, move: 1 },
  "Punic Marine": { hp: [230, 280], attack: [130, 160], ammo: 0, range: 1, move: 1 },
  "Numidian Cavalry": { hp: [180, 230], attack: [110, 140], ammo: 0, range: 1, move: 3 },
  "War Elephant": { hp: [480, 560], attack: [220, 270], ammo: 0, range: 1, move: 3 },
  "Elephant Archer": { hp: [320, 380], attack: [120, 150], ammo: 4, range: 3, move: 2 },
  "Balearic Slinger": { hp: [130, 170], attack: [75, 100], ammo: 12, range: 4, move: 1 },
  "Carthaginian Archer": { hp: [130, 170], attack: [75, 100], ammo: 10, range: 3, move: 1 },

  // Egypt
  Pharaoh: { hp: [410, 450], attack: [230, 260], ammo: 0, range: 1, move: 1 },
  "Egyptian Warrior": { hp: [240, 290], attack: [110, 140], ammo: 0, range: 1, move: 1 },
  Medjay: { hp: [280, 330], attack: [140, 175], ammo: 0, range: 1, move: 1 },
  "Khopesh Warrior": { hp: [260, 320], attack: [160, 195], ammo: 0, range: 1, move: 1 },
  "Shield Bearer": { hp: [300, 360], attack: [90, 120], ammo: 0, range: 1, move: 1 },
  "Royal Guard": { hp: [340, 400], attack: [175, 210], ammo: 0, range: 1, move: 1 },
  "Egyptian Archer": { hp: [140, 180], attack: [75, 100], ammo: 10, range: 3, move: 1 },
  "Nubian Archer": { hp: [150, 190], attack: [90, 120], ammo: 12, range: 4, move: 1 },
  "War Chariot": { hp: [220, 270], attack: [145, 175], ammo: 0, range: 1, move: 4 },
  "Royal Chariot": { hp: [260, 320], attack: [170, 205], ammo: 4, range: 4, move: 4 },
  "Desert Scout": { hp: [170, 220], attack: [110, 140], ammo: 4, range: 3, move: 4 },
  "Egyptian Catapult": { hp: [40, 70], attack: [120, 170], ammo: 8, range: 6, move: 1 },

  // Thracians
  "Thracian King": { hp: [360, 410], attack: [220, 255], ammo: 0, range: 1, move: 1 },
  "Thracian Warrior": { hp: [220, 270], attack: [125, 155], ammo: 0, range: 1, move: 1 },
  "Rhomphaia Fighter": { hp: [230, 280], attack: [180, 220], ammo: 0, range: 1, move: 1 },
  "Falx Warrior": { hp: [220, 270], attack: [185, 225], ammo: 0, range: 1, move: 1 },
  "Thracian Spearman": { hp: [210, 260], attack: [100, 125], ammo: 0, range: 1, move: 1 },
  "Thracian Guard": { hp: [320, 380], attack: [155, 190], ammo: 0, range: 1, move: 1 },
  "Thracian Peltast": { hp: [140, 180], attack: [75, 100], ammo: 12, range: 3, move: 1 },
  "Thracian Archer": { hp: [130, 170], attack: [80, 105], ammo: 10, range: 3, move: 1 },
  "Thracian Rider": { hp: [190, 240], attack: [120, 150], ammo: 0, range: 1, move: 3 },
  "Thracian Noble Rider": { hp: [240, 300], attack: [155, 190], ammo: 0, range: 1, move: 3 },
  "War Drummer": { hp: [200, 250], attack: [95, 120], ammo: 0, range: 1, move: 1 },
  "Thracian Catapult": { hp: [40, 70], attack: [120, 165], ammo: 8, range: 6, move: 1 },

  // Dacians
  "Dacian King": { hp: [370, 420], attack: [225, 260], ammo: 0, range: 1, move: 1 },
  "Dacian Warrior": { hp: [230, 280], attack: [130, 160], ammo: 0, range: 1, move: 1 },
  Falxman: { hp: [220, 270], attack: [190, 230], ammo: 0, range: 1, move: 1 },
  "Dacian Spearman": { hp: [220, 270], attack: [95, 120], ammo: 0, range: 1, move: 1 },
  "Dacian Shield Bearer": { hp: [300, 360], attack: [95, 120], ammo: 0, range: 1, move: 1 },
  "Dacian Guard": { hp: [330, 390], attack: [160, 195], ammo: 0, range: 1, move: 1 },
  "Dacian Slinger": { hp: [130, 170], attack: [70, 95], ammo: 12, range: 4, move: 1 },
  "Dacian Archer": { hp: [130, 170], attack: [75, 100], ammo: 10, range: 3, move: 1 },
  "Dacian Rider": { hp: [190, 240], attack: [120, 150], ammo: 0, range: 1, move: 3 },
  "Dacian Noble Rider": { hp: [240, 300], attack: [160, 195], ammo: 0, range: 1, move: 3 },
  "War Horn": { hp: [190, 240], attack: [90, 115], ammo: 0, range: 1, move: 1 },
  "Dacian Catapult": { hp: [40, 70], attack: [120, 165], ammo: 8, range: 6, move: 1 },

  // Parthians
  "Parthian King": { hp: [380, 430], attack: [215, 250], ammo: 0, range: 1, move: 1 },
  "Parthian Warrior": { hp: [220, 270], attack: [120, 150], ammo: 0, range: 1, move: 1 },
  "Parthian Spearman": { hp: [220, 270], attack: [95, 120], ammo: 0, range: 1, move: 1 },
  "Parthian Cataphract": { hp: [300, 360], attack: [180, 220], ammo: 0, range: 1, move: 3 },
  "Parthian Noble Rider": { hp: [250, 310], attack: [160, 195], ammo: 0, range: 1, move: 3 },
  "Horse Archer": { hp: [170, 220], attack: [110, 140], ammo: 4, range: 4, move: 3 },
  "Elite Horse Archer": { hp: [200, 250], attack: [135, 165], ammo: 4, range: 4, move: 3 },
  "Parthian Archer": { hp: [130, 170], attack: [75, 100], ammo: 10, range: 3, move: 1 },
  "Scout Rider": { hp: [170, 220], attack: [110, 140], ammo: 0, range: 1, move: 4 },
  "Zoroastrian Priest": { hp: [190, 240], attack: [105, 130], ammo: 0, range: 1, move: 1 },
  "Camel Rider": { hp: [220, 270], attack: [130, 160], ammo: 0, range: 1, move: 3 },
  "Camel Rider Archer": { hp: [200, 250], attack: [115, 145], ammo: 4, range: 3, move: 3 },
  "Parthian Ballista": { hp: [40, 70], attack: [115, 160], ammo: 8, range: 6, move: 1 },

  // Seleucids
  "Seleucid King": { hp: [390, 440], attack: [220, 255], ammo: 0, range: 1, move: 1 },
  "Seleucid Phalangite": { hp: [320, 380], attack: [120, 150], ammo: 0, range: 1, move: 1 },
  "Silver Shield Infantry": { hp: [340, 400], attack: [165, 200], ammo: 0, range: 1, move: 1 },
  Thorakitai: { hp: [260, 320], attack: [130, 160], ammo: 0, range: 1, move: 1 },
  "Eastern Spearman": { hp: [240, 290], attack: [95, 120], ammo: 0, range: 1, move: 1 },
  "Seleucid War Elephant": { hp: [500, 580], attack: [225, 275], ammo: 0, range: 1, move: 3 },
  "Seleucid Cataphract": { hp: [300, 360], attack: [180, 220], ammo: 0, range: 1, move: 3 },
  "Seleucid Light Cavalry": { hp: [200, 250], attack: [120, 150], ammo: 0, range: 1, move: 3 },
  "Eastern Archer": { hp: [130, 170], attack: [75, 100], ammo: 10, range: 3, move: 1 },
  "Seleucid Slinger": { hp: [130, 170], attack: [70, 95], ammo: 12, range: 4, move: 1 },
  "Seleucid Elephant Archer": { hp: [340, 400], attack: [125, 155], ammo: 4, range: 3, move: 2 },
  "Standard Bearer": { hp: [210, 260], attack: [105, 130], ammo: 0, range: 1, move: 1 },
  "Seleucid Catapult": { hp: [40, 70], attack: [120, 170], ammo: 8, range: 6, move: 1 },

  // Vikings
  Jarl: { hp: [360, 410], attack: [250, 290], ammo: 0, range: 1, move: 1 },
  Huscarl: { hp: [320, 380], attack: [170, 205], ammo: 0, range: 1, move: 1 },
  Hirdman: { hp: [280, 340], attack: [145, 175], ammo: 0, range: 1, move: 1 },
  Ulfhednar: { hp: [260, 320], attack: [210, 250], ammo: 0, range: 1, move: 1 },
  "Varangian Guard": { hp: [340, 400], attack: [175, 215], ammo: 0, range: 1, move: 1 },
  Jomsviking: { hp: [300, 360], attack: [160, 195], ammo: 0, range: 1, move: 1 },
  "Viking Raider": { hp: [190, 240], attack: [150, 185], ammo: 0, range: 1, move: 1 },
  Berserker: { hp: [220, 280], attack: [210, 250], ammo: 0, range: 1, move: 1 },
  Shieldmaiden: { hp: [210, 260], attack: [125, 155], ammo: 0, range: 1, move: 1 },
  "Bondi Spearman": { hp: [220, 270], attack: [110, 135], ammo: 0, range: 1, move: 1 },
  Scout: { hp: [150, 200], attack: [110, 140], ammo: 4, range: 3, move: 3 },
  "Viking Archer": { hp: [120, 160], attack: [70, 95], ammo: 10, range: 3, move: 1 },

};

const DEFAULT_TROOP_TEMPLATE: TroopStatTemplate = {
  hp: [1, 1],
  attack: [1, 1],
  ammo: 0,
  range: 1,
  move: 1
};

// Roll a concrete stat line from a reusable min/max template.
const generateTemplateStats = (template: TroopStatTemplate) => ({
  hp: Math.floor(Math.random() * (template.hp[1] - template.hp[0]) + template.hp[0]),
  attack: Math.floor(Math.random() * (template.attack[1] - template.attack[0]) + template.attack[0]),
  ammo: template.ammo,
  range: template.range,
  move: template.move
});

const normalizeTemplateRules = (role: string, template: TroopStatTemplate): TroopReferenceStats => {
  const normalized = ensureRoleMoveRules(
    role,
    ensureRangedAmmo(role, {
      hp: template.hp[0],
      maxHp: template.hp[0],
      attack: template.attack[0],
      ammo: template.ammo,
      range: template.range,
      move: template.move
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
  const template = TROOP_STAT_TEMPLATES[role] ?? DEFAULT_TROOP_TEMPLATE;
  return normalizeTemplateRules(role, template);
};

// Main troop stat lookup from the unified template roster above.
export const generateTroopStats = (role: string): TroopStats => {
  const template = TROOP_STAT_TEMPLATES[role] ?? DEFAULT_TROOP_TEMPLATE;
  const templateStats = generateTemplateStats(template);
  const hp = templateStats.hp;
  const maxHp = hp;
  const attack = templateStats.attack;
  const ammo = templateStats.ammo;
  const range = templateStats.range;
  const move = templateStats.move;

  return ensureRoleMoveRules(role, ensureRangedAmmo(role, { hp, maxHp, attack, ammo, range, move }));
};
