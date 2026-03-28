import { getTroopAbilities } from "../Units/troopStats";
import { GRID_ORIENTATIONS, TERRAIN_LABELS } from "./constants";
import { getTerrainAt } from "./terrainEngine";
import type { BattlefieldSize, GridOrientation, TerrainType, TroopMechanicType } from "./types";

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

export const hasNoAmmoPenalty = (unit: any) => usesAmmoRole(unit) && (unit?.ammo ?? 0) <= 0;

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

export const getTroopMechanicType = (unit: any): TroopMechanicType => {
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

export const getAdjacentAllies = (unit: any, allUnits: any[] = []) =>
  allUnits.filter((candidate) => {
    if (!unit || !candidate || candidate.id === unit.id || candidate.hp <= 0) return false;
    if (candidate.team !== unit.team) return false;
    return Math.abs(candidate.x - unit.x) + Math.abs(candidate.y - unit.y) === 1;
  });

export const unitHasAbility = (unit: any, abilityKey: string) =>
  getTroopAbilities(unit?.role ?? "").some((ability) => ability.key === abilityKey);

export const getAdjacentCommanders = (unit: any, allUnits: any[] = []) =>
  getAdjacentAllies(unit, allUnits).filter((candidate) => unitHasAbility(candidate, "command"));

export const hasAdjacentWoundedAlly = (unit: any, allUnits: any[] = []) =>
  getAdjacentAllies(unit, allUnits).some((candidate) => candidate.hp <= Math.ceil(candidate.maxHp * 0.5));

export const getAbilityEffects = (
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

export const getAttackDamage = (attacker: any, defender: any, allUnits: any[] = [], terrainMap: TerrainType[][] = []) => {
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

export const getDisplayedAttack = (unit: any, allUnits: any[] = [], terrainMap: TerrainType[][] = []) => {
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

export const getUnitEffectNotes = (
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

export const getEffectiveMove = (unit: any, terrainMap: TerrainType[][]) => {
  if (!unit) return 0;
  const terrainType = getTerrainAt(terrainMap, unit.x, unit.y);
  const modifiers = getTerrainModifiers(unit, terrainType);
  const skirmishStepBonus = getTroopAbilities(unit.role).some((ability) => ability.key === "skirmishStep") && (unit?.ammo ?? 0) > 0 ? 1 : 0;
  return Math.max(1, unit.move + modifiers.moveDelta + skirmishStepBonus);
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
