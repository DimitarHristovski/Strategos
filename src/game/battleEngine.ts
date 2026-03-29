import { getTroopAbilities } from "../Units/troopStats";
import { GRID_ORIENTATIONS, TERRAIN_LABELS } from "./constants";
import { getTerrainAt } from "./terrainEngine";
import type { BattlefieldSize, GridOrientation, TeamName, TerrainType, TroopMechanicType } from "./types";

/** Factions adapted to arid climates—full desert package for all of these. */
const DESERT_HARDY_TEAMS = new Set<TeamName>(["Carthage", "Barbarians", "Egypt", "Parthians", "Seleucids"]);

/** One extra terrain affinity each (no stacking all non-desert buffs on every hardy faction). */
const HARDY_PLAIN_FACTIONS = new Set<TeamName>(["Parthians"]);
const HARDY_FOREST_FACTIONS = new Set<TeamName>(["Barbarians"]);
const HARDY_HILL_FACTIONS = new Set<TeamName>(["Egypt", "Seleucids"]);
const HARDY_RIVER_FACTIONS = new Set<TeamName>(["Carthage"]);

const isDesertHardyTeam = (team: unknown): boolean =>
  typeof team === "string" && DESERT_HARDY_TEAMS.has(team as TeamName);

const isHardyPlainTeam = (team: unknown): boolean =>
  typeof team === "string" && HARDY_PLAIN_FACTIONS.has(team as TeamName);

const isHardyForestTeam = (team: unknown): boolean =>
  typeof team === "string" && HARDY_FOREST_FACTIONS.has(team as TeamName);

const isHardyHillTeam = (team: unknown): boolean =>
  typeof team === "string" && HARDY_HILL_FACTIONS.has(team as TeamName);

const isHardyRiverTeam = (team: unknown): boolean =>
  typeof team === "string" && HARDY_RIVER_FACTIONS.has(team as TeamName);

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

export const hasNoAmmoPenalty = (unit: any) =>
  !getTroopAbilities(unit?.role ?? "").some((a) => a.key === "nomadStrike") &&
  usesAmmoRole(unit) &&
  (unit?.ammo ?? 0) <= 0;

export const ensureRangedAmmo = (unit: any) => {
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

  normalizedUnit.range = Math.max(minimumRange, normalizedUnit.range ?? 1);
  normalizedUnit.ammo = halveAmmo(Math.max(minimumAmmo, normalizedUnit.ammo ?? 0));

  return normalizedUnit;
};

export const getTroopMechanicType = (unit: any): TroopMechanicType => {
  if (!unit) return "closecombat";

  const role = String(unit.role ?? "").toLowerCase();
  const siegeKeywords = ["ballista", "catapult", "trebuchet", "polybolos", "siege tower", "onager", "bombard"];
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

export const LEADER_AURA_ATTACK_MULTIPLIER = 1.1;
const ROLE_HEALTH_BUFF_PER_EXTRA_UNIT = 0.05;
const ROLE_HEALTH_BUFF_MIN_GROUP_SIZE = 2;

export const TROOP_MECHANIC_ADVANTAGE: Record<TroopMechanicType, TroopMechanicType[]> = {
  closecombat: [],
  mounted: ["ranged", "sieged"],
  ranged: [],
  sieged: []
};

export const TROOP_MECHANIC_LABELS: Record<TroopMechanicType, string> = {
  closecombat: "Close Combat",
  mounted: "Mounted",
  ranged: "Ranged",
  sieged: "Sieged"
};

export const TROOP_MECHANIC_ICONS: Record<TroopMechanicType, string> = {
  closecombat: "⚔️",
  mounted: "🐎",
  ranged: "🏹",
  sieged: "⚙️"
};

export const TROOP_MECHANIC_ADVANTAGE_MULTIPLIER = 1.1;

export const isLeaderRole = (role: string) => {
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

export const getTerrainModifiers = (unit: any, terrainType: TerrainType) => {
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
      if (isHardyForestTeam(unit.team)) {
        attackMultiplier *= 1.05;
        moveDelta += 1;
        notes.push("+5% attack and +1 move for Barbarians in rough woods and scrub");
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
      if (unit.team === "Greeks" || isHardyHillTeam(unit.team)) {
        attackMultiplier *= 1.1;
        notes.push("+10% attack for Greeks, Egypt, and Seleucids on high ground");
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
      if (unit.team === "Romans" || isHardyRiverTeam(unit.team)) {
        attackMultiplier *= 1.05;
        moveDelta += 1;
        notes.push("+5% attack and +1 move from organized river crossing (Romans, Carthage)");
      }
      break;
    case "desert": {
      const hardy = isDesertHardyTeam(unit.team);
      if (hardy) {
        attackMultiplier *= 1.12;
        moveDelta += 1;
        notes.push("+12% attack and +1 move for desert-hardy factions (no heat or dust penalties)");
        break;
      }
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
      break;
    }
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
      if (unit.team === "Romans" || unit.team === "Vikings" || isHardyPlainTeam(unit.team)) {
        attackMultiplier *= 1.05;
        notes.push("+5% attack on open terrain (Romans, Vikings, Parthians)");
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

export const getAdjacentAllies = (unit: any, allUnits: any[] = []) =>
  allUnits.filter((candidate) => {
    if (!unit || !candidate || candidate.id === unit.id || candidate.hp <= 0) return false;
    if (candidate.team !== unit.team) return false;
    return Math.abs(candidate.x - unit.x) + Math.abs(candidate.y - unit.y) === 1;
  });

export const unitHasAbility = (unit: any, abilityKey: string) =>
  getTroopAbilities(unit?.role ?? "").some((ability) => ability.key === abilityKey);

const IMPERIAL_COHORT_ROLES = new Set([
  "Seleucid Phalangite",
  "Silver Shield Infantry",
  "Thorakitai",
  "Seleucid Cataphract",
  "Seleucid War Elephant"
]);

const hasAdjacentAllyWithAbility = (unit: any, allUnits: any[], abilityKey: string) =>
  getAdjacentAllies(unit, allUnits).some((ally) => unitHasAbility(ally, abilityKey));

const hasAdjacentAllyWithDifferentRole = (unit: any, allUnits: any[]) =>
  getAdjacentAllies(unit, allUnits).some((ally) => ally.role !== unit.role);

const isSkirmisherAttacker = (attacker: any) => {
  if (unitHasAbility(attacker, "harrier")) return true;
  const r = String(attacker?.role ?? "").toLowerCase();
  return ["skirmisher", "peltast", "velites", "slinger", "scout"].some((k) => r.includes(k));
};

const isFalxEliteInfantryTarget = (defender: any) => {
  if (getTroopMechanicType(defender) !== "closecombat") return false;
  const r = String(defender?.role ?? "");
  return /legionary|praetorian|hoplite|phalangite|shield|guard|heavy|elite|infantry|spearman|pikeman|centurion|triarii/i.test(r);
};

export type AbilityEffectContext = {
  round?: number;
  attackerMovedThisTurn?: boolean;
};

export const getAdjacentCommanders = (unit: any, allUnits: any[] = []) =>
  getAdjacentAllies(unit, allUnits).filter((candidate) => unitHasAbility(candidate, "command"));

export const hasAdjacentWoundedAlly = (unit: any, allUnits: any[] = []) =>
  getAdjacentAllies(unit, allUnits).some((candidate) => candidate.hp <= Math.ceil(candidate.maxHp * 0.5));

export const getAbilityEffects = (
  attacker: any,
  defender: any,
  allUnits: any[] = [],
  attackerTerrain: TerrainType,
  defenderTerrain: TerrainType,
  ctx: AbilityEffectContext = {}
) => {
  const attackerAbilities = getTroopAbilities(attacker?.role ?? "");
  const defenderAbilities = getTroopAbilities(defender?.role ?? "");
  const attackerType = getTroopMechanicType(attacker);
  const defenderType = getTroopMechanicType(defender);
  const attackerTags: string[] = [];
  const defenderTags: string[] = [];
  let attackMultiplier = 1;
  let damageTakenMultiplier = 1;
  const round = ctx.round ?? 1;
  const attackerMoved = Boolean(ctx.attackerMovedThisTurn);

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
      case "phalanx":
        if (defenderType === "mounted") {
          attackMultiplier *= 1.2;
          attackerTags.push("Phalanx");
        }
        if (hasAdjacentAllyWithAbility(attacker, allUnits, "phalanx")) {
          attackMultiplier *= 1.1;
          attackerTags.push("Phalanx Line");
        }
        break;
      case "bloodOath":
        if (round === 1) {
          attackMultiplier *= 1.2;
          attackerTags.push("Blood Oath (opening)");
        }
        if ((attacker?.hp ?? 0) <= Math.ceil((attacker?.maxHp ?? 0) * 0.5)) {
          attackMultiplier *= 1.1;
          attackerTags.push("Blood Oath");
        }
        break;
      case "furyCharge":
        attackMultiplier *= 1.15;
        attackerTags.push("Fury Charge");
        if (getAdjacentAllies(defender, allUnits).length === 0) {
          attackMultiplier *= 1.1;
          attackerTags.push("Fury Charge (unsupported)");
        }
        break;
      case "wildAmbush":
        if (attackerTerrain === "forest") {
          attackMultiplier *= 1.15;
          attackerTags.push("Wild Ambush");
        }
        break;
      case "battleCohesion":
        if (hasAdjacentAllyWithDifferentRole(attacker, allUnits)) {
          attackMultiplier *= 1.1;
          attackerTags.push("Battle Cohesion");
        }
        if (
          String(attacker?.role ?? "").toLowerCase().includes("elephant") &&
          getAdjacentAllies(attacker, allUnits).length > 0
        ) {
          attackMultiplier *= 1.1;
          attackerTags.push("Battle Cohesion (elephant)");
        }
        break;
      case "sunChariot":
        if (attackerMoved && String(attacker?.role ?? "").toLowerCase().includes("chariot")) {
          attackMultiplier *= 1.15;
          attackerTags.push("Sun Chariot");
        }
        break;
      case "rhomphaiaFury":
        if (defenderAbilities.some((d) => d.key === "shieldWall" || d.key === "guarded")) {
          attackMultiplier *= 1.2;
          attackerTags.push("Rhomphaia Fury");
        }
        if (attackerType === "closecombat") {
          attackMultiplier *= 1.1;
          attackerTags.push("Rhomphaia Fury (melee)");
        }
        break;
      case "falxDominion":
        if (isFalxEliteInfantryTarget(defender)) {
          attackMultiplier *= 1.25;
          attackerTags.push("Falx Dominion");
        }
        if (hasAdjacentAllyWithAbility(attacker, allUnits, "falxDominion")) {
          attackMultiplier *= 1.1;
          attackerTags.push("Falx Dominion (line)");
        }
        break;
      case "nomadStrike":
        if (attackerMoved) {
          attackMultiplier *= 1.1;
          attackerTags.push("Nomad Strike");
        }
        break;
      case "imperialCohort":
        if (getAdjacentAllies(attacker, allUnits).some((a) => IMPERIAL_COHORT_ROLES.has(String(a.role)))) {
          attackMultiplier *= 1.1;
          attackerTags.push("Imperial Cohort");
        }
        if (
          (String(attacker?.role ?? "").toLowerCase().includes("cataphract") ||
            String(attacker?.role ?? "").toLowerCase().includes("elephant")) &&
          getAdjacentAllies(attacker, allUnits).length > 0
        ) {
          attackMultiplier *= 1.1;
          attackerTags.push("Imperial Cohort (armored)");
        }
        break;
      case "ironShield":
        if (hasAdjacentAllyWithAbility(attacker, allUnits, "ironShield")) {
          attackMultiplier *= 1.1;
          attackerTags.push("Iron Shield");
        }
        break;
      case "testudo":
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
      case "testudo":
        if (attackerType === "ranged") {
          damageTakenMultiplier *= 0.65;
          defenderTags.push("Testudo");
        }
        if (isSkirmisherAttacker(attacker)) {
          damageTakenMultiplier *= 0.85;
          defenderTags.push("Testudo (skirmishers)");
        }
        if (hasAdjacentAllyWithAbility(defender, allUnits, "testudo")) {
          damageTakenMultiplier *= 0.9;
          defenderTags.push("Testudo (linked)");
        }
        break;
      case "phalanx":
        if (attackerType === "closecombat") {
          damageTakenMultiplier *= 0.8;
          defenderTags.push("Phalanx");
        }
        break;
      case "wildAmbush":
        if ((defenderTerrain === "forest" || defenderTerrain === "hill") && attackerType === "ranged") {
          damageTakenMultiplier *= 0.85;
          defenderTags.push("Wild Ambush Cover");
        }
        break;
      case "battleCohesion":
        if (hasAdjacentAllyWithDifferentRole(defender, allUnits)) {
          damageTakenMultiplier *= 0.9;
          defenderTags.push("Battle Cohesion");
        }
        break;
      case "imperialCohort":
        if (
          getAdjacentAllies(defender, allUnits).some(
            (a) => IMPERIAL_COHORT_ROLES.has(String(a.role)) && getTroopMechanicType(a) !== getTroopMechanicType(defender)
          )
        ) {
          damageTakenMultiplier *= 0.9;
          defenderTags.push("Imperial Cohort");
        }
        break;
      case "ironShield":
        if (attackerType === "closecombat") {
          damageTakenMultiplier *= 0.8;
          defenderTags.push("Iron Shield");
        }
        if (
          attackerType === "ranged" &&
          getAdjacentAllies(defender, allUnits).some((a) => unitHasAbility(a, "ironShield"))
        ) {
          damageTakenMultiplier *= 0.85;
          defenderTags.push("Iron Shield (ranged)");
        }
        break;
      default:
        break;
    }
  });

  if (
    defenderType === "ranged" &&
    getAdjacentAllies(defender, allUnits).some((a) => unitHasAbility(a, "sunChariot"))
  ) {
    damageTakenMultiplier *= 0.8;
    defenderTags.push("Sun Chariot Cover");
  }

  if (unitHasAbility(attacker, "rhomphaiaFury")) {
    const guardedActive =
      defenderAbilities.some((d) => d.key === "guarded") &&
      (defender?.hp ?? 0) > Math.ceil((defender?.maxHp ?? 0) * 0.5);
    const shieldWallActive =
      defenderAbilities.some((d) => d.key === "shieldWall") && getAdjacentAllies(defender, allUnits).length > 0;
    if (guardedActive || shieldWallActive) {
      damageTakenMultiplier *= 1.15;
      attackerTags.push("Rhomphaia Pierce");
    }
  }

  if (unitHasAbility(attacker, "falxDominion")) {
    const guardedActive =
      defenderAbilities.some((d) => d.key === "guarded") &&
      (defender?.hp ?? 0) > Math.ceil((defender?.maxHp ?? 0) * 0.5);
    const shieldWallActive =
      defenderAbilities.some((d) => d.key === "shieldWall") && getAdjacentAllies(defender, allUnits).length > 0;
    const braceActive =
      defenderAbilities.some((d) => d.key === "brace") && attackerType === "mounted";
    if (guardedActive || shieldWallActive || braceActive) {
      damageTakenMultiplier *= 1.2;
      attackerTags.push("Falx Pierce");
    }
  }

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

export const getAttackDamage = (
  attacker: any,
  defender: any,
  allUnits: any[] = [],
  terrainMap: TerrainType[][] = [],
  effectContext: AbilityEffectContext = {}
) => {
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

  const abilityEffects = getAbilityEffects(attacker, defender, allUnits, attackerTerrain, defenderTerrain, effectContext);
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

export const getDisplayedAttack = (
  unit: any,
  allUnits: any[] = [],
  terrainMap: TerrainType[][] = [],
  opts?: { round?: number }
) => {
  if (!unit) return 0;

  let displayedAttack = unit.attack;
  const terrainAt = getTerrainAt(terrainMap, unit.x, unit.y);
  const terrainModifiers = getTerrainModifiers(unit, terrainAt);
  const round = opts?.round ?? 1;
  const abilities = getTroopAbilities(unit.role);

  if (hasNoAmmoPenalty(unit)) {
    displayedAttack = Math.round(displayedAttack * 0.5);
  }

  if (isNearKing(unit, allUnits)) {
    displayedAttack = Math.round(displayedAttack * LEADER_AURA_ATTACK_MULTIPLIER);
  }

  if (terrainModifiers.attackMultiplier !== 1) {
    displayedAttack = Math.round(displayedAttack * terrainModifiers.attackMultiplier);
  }

  let offensiveStanceMult = 1;
  if (abilities.some((a) => a.key === "bloodOath")) {
    if (round === 1) offensiveStanceMult *= 1.2;
    if ((unit?.hp ?? 0) <= Math.ceil((unit?.maxHp ?? 0) * 0.5)) offensiveStanceMult *= 1.1;
  }
  if (abilities.some((a) => a.key === "wildAmbush") && terrainAt === "forest") {
    offensiveStanceMult *= 1.15;
  }
  if (offensiveStanceMult !== 1) {
    displayedAttack = Math.round(displayedAttack * offensiveStanceMult);
  }

  return displayedAttack;
};

export const getUnitEffectNotes = (
  unit: any,
  allUnits: any[] = [],
  terrainMap: TerrainType[][] = [],
  terrainEffectsEnabled = true,
  opts?: { round?: number }
) => {
  if (!unit) return [] as string[];

  const notes: string[] = [];
  const round = opts?.round ?? 1;
  const terrainAt = getTerrainAt(terrainMap, unit.x, unit.y);

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
    const terrainNotes = getTerrainModifiers(unit, terrainAt).notes;
    terrainNotes.forEach((note) => notes.push(`Terrain: ${note}`));
  }

  getTroopAbilities(unit.role).forEach((ability) => {
    switch (ability.key) {
      case "brace":
        notes.push(`${ability.name}: +15% attack vs mounted (×1.15); −15% damage taken from mounted (×0.85)`);
        break;
      case "shieldWall":
        if (getAdjacentAllies(unit, allUnits).length > 0) {
          notes.push(`${ability.name}: −10% damage taken (×0.9) — adjacent ally`);
        } else {
          notes.push(`${ability.name}: −10% damage taken (×0.9) when adjacent to an ally`);
        }
        break;
      case "shock":
        notes.push(`${ability.name}: +20% attack (×1.2) vs targets at ≤50% HP`);
        break;
      case "charge":
        if (terrainAt === "plain") {
          notes.push(`${ability.name}: mounted — +15% attack (×1.15) on plains; +10% (×1.1) vs ranged/siege`);
        } else {
          notes.push(`${ability.name}: mounted — +15% (×1.15) on plains; +10% (×1.1) vs ranged or siege`);
        }
        break;
      case "harrier":
        notes.push(`${ability.name}: with ammo — +10% (×1.1) vs move ≤1 or siege`);
        break;
      case "guarded":
        if ((unit?.hp ?? 0) > Math.ceil((unit?.maxHp ?? 0) * 0.5)) {
          notes.push(`${ability.name}: −10% damage taken (×0.9) while above 50% HP`);
        } else {
          notes.push(`${ability.name}: −10% damage taken (×0.9) while above 50% HP (inactive now)`);
        }
        break;
      case "ferocity":
        if (getAdjacentAllies(unit, allUnits).length === 0) {
          notes.push(`${ability.name}: +10% attack (×1.1) — no adjacent allies`);
        } else {
          notes.push(`${ability.name}: +10% attack (×1.1) when not adjacent to allies`);
        }
        break;
      case "deadeye":
        notes.push(`${ability.name}: +1 range on hills; +10% attack (×1.1) vs unsupported ranged/siege`);
        break;
      case "crush":
        notes.push(`${ability.name}: +15% (×1.15) vs close combat; +5% (×1.05) vs Guarded or Shield Wall`);
        break;
      case "command":
        notes.push(`${ability.name}: adjacent allies +5% attack (×1.05)`);
        break;
      case "siegeMastery":
        if (terrainAt === "hill") {
          notes.push(`${ability.name}: siege — +10% (×1.1) attack; +1 range on hills`);
        } else if (terrainAt === "plain") {
          notes.push(`${ability.name}: siege — +10% (×1.1) on plains or hills; +1 range on hills`);
        } else {
          notes.push(`${ability.name}: siege — +10% (×1.1) on plains/hills; +1 range on hills`);
        }
        break;
      case "skirmishStep":
        if ((unit?.ammo ?? 0) > 0) {
          notes.push(`${ability.name}: +1 move while ammo remains`);
        } else {
          notes.push(`${ability.name}: +1 move while ammo > 0 (inactive — no ammo)`);
        }
        break;
      case "resolve":
        if (hasAdjacentWoundedAlly(unit, allUnits)) {
          notes.push(`${ability.name}: +10% attack (×1.1) — adjacent ally at ≤50% HP`);
        } else {
          notes.push(`${ability.name}: +10% attack (×1.1) when adjacent ally at ≤50% HP`);
        }
        break;
      case "testudo":
        notes.push(
          `${ability.name}: vs ranged −35% taken (×0.65); vs skirmishers −15% more (×0.85); adjacent Testudo ally −10% (×0.9) — multiplicative`
        );
        break;
      case "phalanx":
        notes.push(
          `${ability.name}: +20% (×1.2) vs mounted; +10% (×1.1) with adjacent Phalanx ally; vs melee −20% taken (×0.8)`
        );
        break;
      case "bloodOath":
        if (round === 1) {
          notes.push(`${ability.name}: round 1 — +20% attack (×1.2), +1 move`);
        } else {
          notes.push(`${ability.name}: round 1 — +20% (×1.2) attack & +1 move (expired)`);
        }
        if ((unit?.hp ?? 0) <= Math.ceil((unit?.maxHp ?? 0) * 0.5)) {
          notes.push(`${ability.name}: ≤50% HP — +10% attack (×1.1)`);
        }
        break;
      case "furyCharge":
        notes.push(
          `${ability.name}: when attacking +15% (×1.15); vs target with no adjacent allies +10% (×1.1); on plains tile +1 move`
        );
        break;
      case "wildAmbush":
        if (terrainAt === "forest") {
          notes.push(`${ability.name}: forest — +15% attack (×1.15), +1 move`);
        }
        notes.push(`${ability.name}: on forest/hill vs ranged −15% taken (×0.85)`);
        break;
      case "battleCohesion":
        if (hasAdjacentAllyWithDifferentRole(unit, allUnits)) {
          notes.push(`${ability.name}: adjacent different role — +10% attack (×1.1), −10% taken (×0.9)`);
        } else {
          notes.push(`${ability.name}: adjacent different role — +10% (×1.1) atk, −10% (×0.9) taken`);
        }
        if (String(unit?.role ?? "").toLowerCase().includes("elephant")) {
          notes.push(`${ability.name}: elephant with adjacent ally — +10% attack (×1.1)`);
        }
        break;
      case "sunChariot":
        notes.push(
          `${ability.name}: ranged ally touching Sun Chariot — −20% taken (×0.8); chariot after move +15% (×1.15); desert +1 move`
        );
        break;
      case "rhomphaiaFury":
        notes.push(
          `${ability.name}: vs Guarded/Shield Wall abilities +20% (×1.2); close combat +10% (×1.1); pierce active Guard/Shield +15% damage through (×1.15)`
        );
        break;
      case "falxDominion":
        notes.push(
          `${ability.name}: vs elite infantry +25% (×1.25); adjacent Falx ally +10% (×1.1); pierce Guard/Shield/Brace(mounted) +20% through (×1.2)`
        );
        break;
      case "nomadStrike":
        if ((unit?.ammo ?? 0) > 0) {
          notes.push(`${ability.name}: +1 move with ammo (if Skirmish Step not already +1); after move +10% (×1.1)`);
        }
        notes.push(`${ability.name}: at 0 ammo — no −50% melee penalty (full attack)`);
        break;
      case "imperialCohort":
        notes.push(
          `${ability.name}: adjacent Seleucid cohort unit — +10% attack (×1.1); cataphract/elephant with any adjacent ally — +10% (×1.1); cohort ally of different troop class — −10% taken (×0.9)`
        );
        break;
      case "ironShield":
        notes.push(`${ability.name}: vs close combat −20% taken (×0.8); vs ranged with Iron ally adjacent −15% (×0.85)`);
        if (hasAdjacentAllyWithAbility(unit, allUnits, "ironShield")) {
          notes.push(`${ability.name}: adjacent Iron Shield ally — +10% attack (×1.1)`);
        }
        break;
      default:
        notes.push(`${ability.name}: ${ability.description}`);
        break;
    }
  });

  return notes;
};

export const getOrientationRotationSteps = (from: GridOrientation, to: GridOrientation) => {
  const fromIndex = GRID_ORIENTATIONS.indexOf(from);
  const toIndex = GRID_ORIENTATIONS.indexOf(to);
  return (toIndex - fromIndex + GRID_ORIENTATIONS.length) % GRID_ORIENTATIONS.length;
};

export const rotateUnitCoordinates = (units: any[], steps: number, battlefieldSize: BattlefieldSize) => {
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

export const getEffectiveMove = (
  unit: any,
  terrainMap: TerrainType[][],
  opts?: { round?: number }
) => {
  if (!unit) return 0;
  const terrainType = getTerrainAt(terrainMap, unit.x, unit.y);
  const modifiers = getTerrainModifiers(unit, terrainType);
  const abilities = getTroopAbilities(unit.role);
  const round = opts?.round ?? 1;
  const skirmishStepBonus = abilities.some((a) => a.key === "skirmishStep") && (unit?.ammo ?? 0) > 0 ? 1 : 0;
  const nomadAmmoBonus =
    abilities.some((a) => a.key === "nomadStrike") && (unit?.ammo ?? 0) > 0 && skirmishStepBonus === 0 ? 1 : 0;
  let extra = skirmishStepBonus + nomadAmmoBonus;
  if (abilities.some((a) => a.key === "bloodOath") && round === 1) extra += 1;
  if (abilities.some((a) => a.key === "furyCharge") && terrainType === "plain") extra += 1;
  if (abilities.some((a) => a.key === "wildAmbush") && terrainType === "forest") extra += 1;
  if (abilities.some((a) => a.key === "sunChariot") && terrainType === "desert") extra += 1;
  return Math.max(1, unit.move + modifiers.moveDelta + extra);
};

export const getEffectiveRange = (unit: any, terrainMap: TerrainType[][]) => {
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

export const applyRoleHealthBuffs = (units: any[]) => {
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

export const didRoleHealthBuffStateChange = (currentUnits: any[], updatedUnits: any[]) => {
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
