import { generateTroopStats } from "../Units/troopStats";
import { ensureRangedAmmo, getTroopMechanicType } from "./battleEngine";
import { getUnitDisplayIcon } from "./unitCatalog";
import type { TeamName } from "./types";

/** When set, AI-listed teams get HP/attack scaled after civilization passives. */
export type PrepareBattleOpts = {
  aiTeams: TeamName[];
  aiHpAttackMultiplier: number;
};

export const applyAiTroopStatMultiplier = (unit: any, multiplier: number) => {
  if (!unit || multiplier === 1) return unit;
  const m = multiplier;
  const next = { ...unit };
  next.hp = Math.max(1, Math.round((next.hp ?? 0) * m));
  next.maxHp = Math.max(1, Math.round((next.maxHp ?? 0) * m));
  if (typeof next.baseMaxHp === "number") {
    next.baseMaxHp = Math.max(1, Math.round(next.baseMaxHp * m));
  }
  next.attack = Math.max(0, Math.round((next.attack ?? 0) * m));
  return next;
};

export const adjustStatPercent = (value: number, percent: number) => Math.max(0, Math.round(value * (1 + percent)));

export const adjustMovePercent = (value: number, percent: number) => {
  if (value <= 0) return 0;
  return Math.max(1, Math.floor(value * (1 + percent)));
};

export const stripUnitForStorage = (unit: any) => {
  if (!unit) return null;
  const { Icon, ...serializableUnit } = unit;
  return serializableUnit;
};

export const restoreUnitFromStorage = (unit: any) => {
  if (!unit) return null;
  const role = unit.role === "Scorpion" ? "Heavy Cavalry" : unit.role;
  const migrated = { ...unit, role };
  return {
    ...migrated,
    Icon: getUnitDisplayIcon(migrated)
  };
};

export const CIV_PASSIVES: Record<TeamName, { name: string; effect: string }> = {
  Romans: { name: "Roman Discipline", effect: "+10% hp, +10% attack" },
  Barbarians: { name: "Barbarian Fury", effect: "+20% attack, -10% damage taken" },
  Greeks: { name: "Phalanx Mastery", effect: "-10% damage taken (close combat) +30% attack (close combat)" },
  Gauls: { name: "Swift Warriors", effect: "+1 move, +10% hp" },
  Germanic: { name: "Brutal Strength", effect: "+15% attack" },
  Carthage: { name: "Mercenary Tactics", effect: "+10% hp, +10% attack" },
  Egypt: { name: "Chariot Kingdom", effect: "+1 move (mounted), +10% attack (ranged)" },
  Thracians: { name: "Hill Raiders", effect: "+10% attack (close combat), +1 move (ranged)" },
  Dacians: { name: "Falx Discipline", effect: "+10% hp, +10% attack" },
  Parthians: { name: "Parthian Shot", effect: "+1 move (mounted), +10% attack (ranged)" },
  Seleucids: { name: "Imperial Arms", effect: "+10% hp (close combat), +10% attack (siege and mounted)" },
  Vikings: { name: "Relentless Raiders", effect: "+1 move, +10% attack, +10% hp" }
};

export const PASSIVE_ICONS: Record<TeamName, string> = {
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

export const applyCivilizationPassive = (unit: any) => {
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
      if (getTroopMechanicType(normalizedUnit) === "closecombat") {
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
      if (getTroopMechanicType(normalizedUnit) === "closecombat") {
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
      if (getTroopMechanicType(normalizedUnit) === "closecombat") {
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

/**
 * Single-player skirmish: each faction keeps the same number of troops (the minimum count among teams on the map).
 * Extras are dropped in stable grid order (y, x, id) so layouts stay predictable.
 */
export const balanceSkirmishUnitsEqualPerTeam = (units: any[]): any[] => {
  if (!units.length) return units;
  const byTeam = new Map<string, any[]>();
  for (const u of units) {
    const t = String((u as { team?: string }).team ?? "");
    if (!t) continue;
    if (!byTeam.has(t)) byTeam.set(t, []);
    byTeam.get(t)!.push(u);
  }
  const teamKeys = [...byTeam.keys()];
  if (teamKeys.length < 2) return units;
  let minCount = Infinity;
  for (const arr of byTeam.values()) minCount = Math.min(minCount, arr.length);
  if (!Number.isFinite(minCount) || minCount <= 0) return units;

  const rank = (u: any) => [Number(u.y) || 0, Number(u.x) || 0, String(u.id ?? "")];
  const cmp = (a: any, b: any) => {
    const ra = rank(a);
    const rb = rank(b);
    for (let i = 0; i < ra.length; i++) {
      const va = ra[i]!;
      const vb = rb[i]!;
      if (va < vb) return -1;
      if (va > vb) return 1;
    }
    return 0;
  };

  const out: any[] = [];
  for (const t of teamKeys) {
    const kept = byTeam.get(t)!.slice().sort(cmp).slice(0, minCount);
    out.push(...kept);
  }
  return out;
};

export const prepareUnitsForBattle = (units: any[], opts?: PrepareBattleOpts) =>
  units.map((unit) => {
    let u = applyCivilizationPassive({
      ...unit,
      Icon: getUnitDisplayIcon(unit)
    });
    if (
      opts &&
      opts.aiHpAttackMultiplier !== 1 &&
      opts.aiTeams.includes(unit.team as TeamName)
    ) {
      u = applyAiTroopStatMultiplier(u, opts.aiHpAttackMultiplier);
    }
    return u;
  });

export const rerollUnitStats = (unit: any, opts?: PrepareBattleOpts) => {
  const rerolledStats = generateTroopStats(unit.role);

  let u = applyCivilizationPassive({
    ...unit,
    ...rerolledStats,
    Icon: getUnitDisplayIcon(unit),
    civPassiveApplied: false,
    civPassiveName: undefined,
    civPassiveEffect: undefined
  });
  if (
    opts &&
    opts.aiHpAttackMultiplier !== 1 &&
    opts.aiTeams.includes(unit.team as TeamName)
  ) {
    u = applyAiTroopStatMultiplier(u, opts.aiHpAttackMultiplier);
  }
  return u;
};

export const rerollUnits = (units: any[], opts?: PrepareBattleOpts) => units.map((unit) => rerollUnitStats(unit, opts));
