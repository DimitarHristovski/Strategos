import type { TeamName, TerrainType, TroopMechanicType } from "./types";

/** Named formation lines: orthogonally linked units of these roles share a faction formation passive (mixed roles allowed). */
export const FORMATION_LINE_DEFINITIONS: ReadonlyArray<{
  id: string;
  name: string;
  team: TeamName;
  roles: readonly string[];
}> = [
  {
    id: "testudo",
    name: "Testudo",
    team: "Romans",
    roles: ["Legionary", "Praetorian", "Centurion"]
  },
  {
    id: "phalanx",
    name: "Phalanx",
    team: "Greeks",
    roles: ["Phalangite", "Hoplite", "Agema"]
  },
  {
    id: "blood_oath",
    name: "Blood Oath",
    team: "Barbarians",
    roles: ["Barbarian Warrior", "Barbarian Berserker", "Barbarian Axeman", "Oathsworn", "Barbarian Warlord"]
  },
  {
    id: "fury_charge",
    name: "Fury Charge",
    team: "Gauls",
    roles: ["Gallic Warrior", "Gaesatae", "Gallic Berserker", "Gallic Oathsworn"]
  },
  {
    id: "wild_ambush",
    name: "Wild Ambush",
    team: "Germanic",
    roles: ["Germanic Warrior", "Germanic Spearman", "Germanic Raider", "Chosen Axeman", "Hearthguard"]
  },
  {
    id: "battle_cohesion",
    name: "Battle Cohesion",
    team: "Carthage",
    roles: ["Libyan Infantry", "Sacred Band", "African Pikeman", "Numidian Cavalry", "Balearic Slinger", "War Elephant"]
  },
  {
    id: "sun_chariot",
    name: "Sun Chariot",
    team: "Egypt",
    roles: ["War Chariot", "Royal Chariot", "Nubian Archer", "Egyptian Archer", "Medjay"]
  },
  {
    id: "rhomphaia",
    name: "Rhomphaia Line",
    team: "Thracians",
    roles: ["Rhomphaia Fighter", "Falx Warrior", "Thracian Guard"]
  },
  {
    id: "falx_dominion",
    name: "Falx Dominion",
    team: "Dacians",
    roles: ["Falxman", "Dacian Warrior", "Dacian Guard"]
  },
  {
    id: "nomad_strike",
    name: "Nomad Strike",
    team: "Parthians",
    roles: ["Horse Archer", "Elite Horse Archer", "Camel Rider Archer"]
  },
  {
    id: "imperial_cohort",
    name: "Imperial Cohort",
    team: "Seleucids",
    roles: ["Seleucid Phalangite", "Silver Shield Infantry", "Thorakitai", "Seleucid Cataphract", "Seleucid War Elephant"]
  },
  {
    id: "iron_shield",
    name: "Iron Shield",
    team: "Vikings",
    roles: ["Huscarl", "Hirdman", "Shieldmaiden", "Jomsviking", "Varangian Guard"]
  }
];

export const ROLE_LINE_FORMATION_ID = "role_line";
export const ROLE_LINE_FORMATION_NAME = "Battle line";

/** Only Testudo (Romans) and the generic Battle line use scaling max HP; other named lines use combat/move passives. */
export const isHpFormationLine = (id: string | undefined): boolean =>
  id === ROLE_LINE_FORMATION_ID || id === "testudo";

const hasDefAbility = (keys: Set<string>, k: string) => keys.has(k);

export type FormationCombatContext = {
  attackerMovedThisTurn?: boolean;
};

export type FormationCombatBundle = {
  attackMultiplier: number;
  damageTakenMultiplier: number;
  attackerTags: string[];
  defenderTags: string[];
};

/**
 * Combat modifiers when `formationGroupActive`. Non-HP lines use attack/defense tables; Testudo adds
 * −10% damage taken from ranged in addition to its HP scaling (handled in `applyRoleHealthBuffs`).
 */
export const getFormationLineCombatModifiers = (
  attacker: { formationGroupActive?: boolean; formationLineId?: string; hp?: number; maxHp?: number; role?: string },
  defender: { formationGroupActive?: boolean; formationLineId?: string; role?: string },
  attackerType: TroopMechanicType,
  defenderType: TroopMechanicType,
  attackerTerrain: TerrainType,
  defenderTerrain: TerrainType,
  defenderAbilityKeys: Set<string>,
  ctx: FormationCombatContext = {}
): FormationCombatBundle => {
  let attackMultiplier = 1;
  let damageTakenMultiplier = 1;
  const attackerTags: string[] = [];
  const defenderTags: string[] = [];
  const moved = Boolean(ctx.attackerMovedThisTurn);
  const atkLine = attacker.formationGroupActive ? attacker.formationLineId : undefined;
  const defLine = defender.formationGroupActive ? defender.formationLineId : undefined;

  if (atkLine && !isHpFormationLine(atkLine)) {
    switch (atkLine) {
      case "phalanx":
        if (defenderType === "mounted") {
          attackMultiplier *= 1.12;
          attackerTags.push("Phalanx (vs mounted)");
        }
        break;
      case "blood_oath": {
        const maxHp = attacker.maxHp ?? 1;
        if ((attacker.hp ?? 0) <= Math.ceil(maxHp * 0.5)) {
          attackMultiplier *= 1.12;
          attackerTags.push("Blood Oath (low HP)");
        }
        break;
      }
      case "fury_charge":
        attackMultiplier *= 1.08;
        attackerTags.push("Fury Charge");
        break;
      case "wild_ambush":
        if (attackerTerrain === "forest") {
          attackMultiplier *= 1.1;
          attackerTags.push("Wild Ambush");
        }
        break;
      case "battle_cohesion":
        attackMultiplier *= 1.06;
        attackerTags.push("Battle Cohesion");
        break;
      case "sun_chariot":
        if (moved && String(attacker.role ?? "").toLowerCase().includes("chariot")) {
          attackMultiplier *= 1.08;
          attackerTags.push("Sun Chariot");
        }
        break;
      case "rhomphaia":
        if (hasDefAbility(defenderAbilityKeys, "shieldWall") || hasDefAbility(defenderAbilityKeys, "guarded")) {
          attackMultiplier *= 1.12;
          attackerTags.push("Rhomphaia Line");
        }
        break;
      case "falx_dominion":
        if (defenderType === "closecombat") {
          attackMultiplier *= 1.12;
          attackerTags.push("Falx Dominion");
        }
        break;
      case "nomad_strike":
        if (moved) {
          attackMultiplier *= 1.1;
          attackerTags.push("Nomad Strike");
        }
        break;
      case "imperial_cohort":
        attackMultiplier *= 1.06;
        attackerTags.push("Imperial Cohort");
        break;
      case "iron_shield":
        attackMultiplier *= 1.06;
        attackerTags.push("Iron Shield");
        break;
      default:
        break;
    }
  }

  if (defLine && !isHpFormationLine(defLine)) {
    switch (defLine) {
      case "phalanx":
        if (attackerType === "closecombat") {
          damageTakenMultiplier *= 0.88;
          defenderTags.push("Phalanx (hold)");
        }
        break;
      case "wild_ambush":
        if ((defenderTerrain === "forest" || defenderTerrain === "hill") && attackerType === "ranged") {
          damageTakenMultiplier *= 0.88;
          defenderTags.push("Wild Ambush Cover");
        }
        break;
      case "sun_chariot":
        if (attackerType === "ranged") {
          damageTakenMultiplier *= 0.85;
          defenderTags.push("Sun Chariot Cover");
        }
        break;
      case "iron_shield":
        if (attackerType === "closecombat") {
          damageTakenMultiplier *= 0.82;
          defenderTags.push("Iron Shield");
        }
        break;
      case "imperial_cohort":
        damageTakenMultiplier *= 0.92;
        defenderTags.push("Imperial Cohort");
        break;
      case "battle_cohesion":
        damageTakenMultiplier *= 0.94;
        defenderTags.push("Battle Cohesion");
        break;
      default:
        break;
    }
  }

  if (defender.formationGroupActive && defender.formationLineId === "testudo" && attackerType === "ranged") {
    damageTakenMultiplier *= 0.9;
    defenderTags.push("Testudo (ranged)");
  }

  return { attackMultiplier, damageTakenMultiplier, attackerTags, defenderTags };
};

/** Approximate attack multiplier for UI when the unit is attacking (no defender context for situational lines). */
export const getFormationAttackDisplayMultiplier = (
  unit: { formationGroupActive?: boolean; formationLineId?: string; hp?: number; maxHp?: number; role?: string },
  terrainAt: TerrainType
): number => {
  if (!unit?.formationGroupActive || !unit.formationLineId || isHpFormationLine(unit.formationLineId)) {
    return 1;
  }
  const id = unit.formationLineId;
  const maxHp = unit.maxHp ?? 1;
  switch (id) {
    case "blood_oath":
      return (unit.hp ?? 0) <= Math.ceil(maxHp * 0.5) ? 1.12 : 1;
    case "fury_charge":
      return 1.08;
    case "wild_ambush":
      return terrainAt === "forest" ? 1.1 : 1;
    case "battle_cohesion":
      return 1.06;
    case "imperial_cohort":
      return 1.06;
    case "iron_shield":
      return 1.06;
    default:
      return 1;
  }
};

/** +1 move on desert for linked Sun Chariot line. */
export const getFormationMoveBonus = (
  unit: { formationGroupActive?: boolean; formationLineId?: string },
  terrainAt: TerrainType
): number => {
  if (!unit?.formationGroupActive || unit.formationLineId !== "sun_chariot") return 0;
  return terrainAt === "desert" ? 1 : 0;
};

export const FORMATION_PASSIVE_SUMMARY: Record<string, string> = {
  testudo: "scaling max HP; −10% damage taken from ranged (linked)",
  phalanx: "+12% attack vs mounted; −12% damage taken from close combat (linked)",
  blood_oath: "+12% attack while at ≤50% HP (linked)",
  fury_charge: "+8% attack (linked)",
  wild_ambush: "+10% attack on forest; −12% taken from ranged on forest/hill (linked)",
  battle_cohesion: "+6% attack; −6% damage taken (linked)",
  sun_chariot: "+8% attack after move on chariots; −15% taken from ranged; +1 move on desert (linked)",
  rhomphaia: "+12% attack vs Guarded/Shield Wall (linked)",
  falx_dominion: "+12% attack vs close combat (linked)",
  nomad_strike: "+10% attack after moving this turn (linked)",
  imperial_cohort: "+6% attack; −8% damage taken (linked)",
  iron_shield: "+6% attack; −18% damage taken from close combat (linked)"
};

export const getFormationLineMeta = (unit: { team?: string; role?: string }): { id: string; name: string } => {
  const team = unit.team as TeamName | undefined;
  const role = unit.role ?? "";
  if (!team) return { id: ROLE_LINE_FORMATION_ID, name: ROLE_LINE_FORMATION_NAME };

  for (const def of FORMATION_LINE_DEFINITIONS) {
    if (def.team === team && def.roles.includes(role)) {
      return { id: def.id, name: def.name };
    }
  }
  return { id: ROLE_LINE_FORMATION_ID, name: ROLE_LINE_FORMATION_NAME };
};

/** Two units can link in the same formation graph (orthogonal adjacency elsewhere). */
export const canFormationLink = (
  a: { team?: string; role?: string },
  b: { team?: string; role?: string }
): boolean => {
  if (!a.team || !b.team || a.team !== b.team) return false;
  const fa = getFormationLineMeta(a);
  const fb = getFormationLineMeta(b);
  if (fa.id !== fb.id) return false;
  if (fa.id === ROLE_LINE_FORMATION_ID) return (a.role ?? "") === (b.role ?? "");
  return true;
};
