import type { UnitWeight } from "./types";

/**
 * Core unit weight per role (design: light / medium / heavy / elite / unique for rulers).
 * Default in `getUnitWeight` is `"medium"` for unknown roles.
 */
export const UNIT_WEIGHT_BY_ROLE: Record<string, UnitWeight> = {
  // Romans
  "Roman King": "unique",
  Praetorian: "elite",
  Centurion: "heavy",
  Legionary: "medium",
  Auxiliary: "light",
  Triarii: "heavy",
  Archer: "light",
  Velites: "light",
  Cavalry: "medium",
  Ballista: "light",
  "Heavy Cavalry": "heavy",
  Onager: "heavy",

  // Barbarians
  "Barbarian Chief": "unique",
  "Barbarian Warlord": "heavy",
  "Barbarian Warrior": "medium",
  "Barbarian Berserker": "medium",
  "Barbarian Axeman": "medium",
  "Barbarian Spearman": "medium",
  "Barbarian Raider": "light",
  Oathsworn: "heavy",
  "Barbarian Scout": "light",
  "Barbarian Noble Rider": "elite",
  "Barbarian Archer": "light",
  "Barbarian Shaman": "light",

  // Greeks / Macedonians
  "Macedonian King": "unique",
  Agema: "elite",
  Hoplite: "heavy",
  Phalangite: "heavy",
  Hypaspist: "medium",
  Thureophoroi: "medium",
  Peltast: "light",
  "Cretan Archer": "light",
  "Companion Cavalry": "elite",
  "Thessalian Cavalry": "medium",
  "Greek Catapult": "heavy",
  Polybolos: "medium",
  "Seleucid Phalangite": "heavy",

  // Gauls
  "Gallic King": "unique",
  "Gallic Warrior": "medium",
  "Gallic Berserker": "medium",
  "Gallic Spearman": "medium",
  "Gallic Oathsworn": "heavy",
  Gaesatae: "medium",
  Fianna: "medium",
  "Gallic Cavalry": "medium",
  "Gallic Noble Horseman": "elite",
  "Gallic Chariot": "medium",
  "Gallic Archer": "light",
  "Gallic Skirmisher": "light",

  // Germanic
  "Germanic King": "unique",
  "Germanic Warrior": "medium",
  "Germanic Spearman": "medium",
  "Germanic Berserker": "medium",
  "Germanic Raider": "light",
  "Chosen Axeman": "heavy",
  Hearthguard: "heavy",
  "Germanic Wolf Rider": "light",
  "Suebi Rider": "medium",
  "Gothic Lancer": "elite",
  "Germanic Archer": "light",
  "Tribal Slinger": "light",

  // Carthage
  "Carthaginian General": "unique",
  "Libyan Infantry": "medium",
  "Sacred Band": "heavy",
  "Liby-Phoenician Infantry": "medium",
  "Iberian Swordsman": "medium",
  "African Pikeman": "heavy",
  "Punic Spearman": "heavy",
  "Numidian Cavalry": "light",
  "War Elephant": "elite",
  "Elephant Archer": "heavy",
  "Balearic Slinger": "light",
  "Carthaginian Archer": "light",

  // Egypt
  Pharaoh: "unique",
  "Egyptian Warrior": "medium",
  Medjay: "medium",
  "Khopesh Warrior": "medium",
  "Shield Bearer": "heavy",
  "Royal Guard": "elite",
  "Egyptian Archer": "light",
  "Nubian Archer": "light",
  "War Chariot": "medium",
  "Royal Chariot": "elite",
  "Desert Scout": "light",
  "Egyptian Catapult": "heavy",

  // Thracians
  "Thracian King": "unique",
  "Thracian Warrior": "medium",
  "Rhomphaia Fighter": "medium",
  "Falx Warrior": "medium",
  "Thracian Spearman": "medium",
  "Thracian Guard": "heavy",
  "Thracian Peltast": "light",
  "Thracian Archer": "light",
  "Thracian Rider": "medium",
  "Thracian Noble Rider": "elite",
  "War Drummer": "light",
  "Thracian Catapult": "heavy",

  // Dacians
  "Dacian King": "unique",
  "Dacian Warrior": "medium",
  Falxman: "medium",
  "Dacian Spearman": "medium",
  "Dacian Shield Bearer": "heavy",
  "Dacian Guard": "heavy",
  "Dacian Slinger": "light",
  "Dacian Archer": "light",
  "Dacian Rider": "medium",
  "Dacian Noble Rider": "elite",
  "War Horn": "light",
  "Dacian Catapult": "heavy",

  // Parthians
  "Parthian King": "unique",
  "Parthian Warrior": "medium",
  "Parthian Spearman": "medium",
  "Parthian Cataphract": "heavy",
  "Parthian Noble Rider": "elite",
  "Horse Archer": "light",
  "Elite Horse Archer": "medium",
  "Parthian Archer": "light",
  "Scout Rider": "light",
  "Camel Rider": "medium",
  "Camel Rider Archer": "medium",
  "Parthian Ballista": "heavy",

  // Seleucids
  "Seleucid King": "unique",
  "Eastern Spearman": "medium",
  "Silver Shield Infantry": "elite",
  Thorakitai: "medium",
  "Seleucid War Elephant": "elite",
  "Seleucid Cataphract": "heavy",
  "Seleucid Light Cavalry": "light",
  "Eastern Archer": "light",
  "Seleucid Slinger": "light",
  "Seleucid Elephant Archer": "heavy",
  "Seleucid Catapult": "heavy",

  // Vikings
  Jarl: "unique",
  Huscarl: "heavy",
  Hirdman: "medium",
  Ulfhednar: "medium",
  "Varangian Guard": "elite",
  Jomsviking: "heavy",
  "Viking Raider": "medium",
  Berserker: "medium",
  Shieldmaiden: "medium",
  "Bondi Spearman": "medium",
  Scout: "light",
  "Viking Archer": "light"
};

export const UNIT_WEIGHT_ORDER: readonly UnitWeight[] = ["light", "medium", "heavy", "elite", "unique"] as const;

/** Display title for UI badges and the troop details panel. */
export const UNIT_WEIGHT_LABELS: Record<UnitWeight, string> = {
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
  elite: "Elite",
  unique: "Unique"
};

/** One-line design intent (handbook + tooltips). */
export const UNIT_WEIGHT_SUMMARY: Record<UnitWeight, string> = {
  light: "Fast, lower HP — skirmishers, archers, scouts.",
  medium: "Standard line troops.",
  heavy: "Armored or slow shock — tanks and heavy infantry.",
  elite: "Rare, powerful — leaders, guards, elite cavalry.",
  unique: "Faction ruler — supreme commander; costs the most army tokens."
};

/** Tailwind classes for compact weight chips (match cyan troop-type badges). */
export const UNIT_WEIGHT_BADGE_CLASS: Record<UnitWeight, string> = {
  light: "border-violet-600/55 bg-violet-950/35 text-violet-100",
  medium: "border-slate-600/55 bg-slate-900/40 text-slate-200",
  heavy: "border-orange-700/55 bg-orange-950/35 text-orange-100",
  elite: "border-amber-500/55 bg-amber-950/45 text-amber-100",
  unique: "border-rose-500/60 bg-rose-950/50 text-rose-50"
};

export function getUnitWeight(role: string | undefined | null): UnitWeight {
  const key = String(role ?? "").trim();
  if (!key) return "medium";
  return UNIT_WEIGHT_BY_ROLE[key] ?? "medium";
}

/** Max total token cost per side when deploying in multiplayer or custom scenario (light=1 … unique=5). */
export const SETUP_ARMY_TOKEN_BUDGET = 40;

export const UNIT_WEIGHT_TOKEN_COST: Record<UnitWeight, number> = {
  light: 1,
  medium: 2,
  heavy: 3,
  elite: 4,
  unique: 5
};

export function getUnitWeightTokenCost(role: string | undefined | null): number {
  return UNIT_WEIGHT_TOKEN_COST[getUnitWeight(role)];
}

export function sumSetupTokensForTeam(
  units: ReadonlyArray<{ role: string; team: string }>,
  team: string
): number {
  let sum = 0;
  for (const u of units) {
    if (u.team === team) sum += getUnitWeightTokenCost(u.role);
  }
  return sum;
}
