import { generateTroopStats } from "../Units/troopStats";
import { getAttackDamage, isLeaderRole } from "./battleEngine";
import { ALL_TEAMS } from "./constants";
import { AVAILABLE_TROOPS } from "./unitCatalog";
import type { TeamName, TerrainType } from "./types";

/** Max Manhattan distance from any living ally to a valid volley target. */
export const CIV_VOLLEY_RANGE = 5;

/**
 * Fallback if a civ def omits `cooldownBattleRounds`. Current data uses **battle rounds only** for every faction.
 */
export const CIV_ABILITY_COOLDOWN_OWN_TURNS = 10;

/** Full battle rounds a trap remains hidden on the field if never triggered. */
export const CIV_TRAP_FIELD_DURATION_BATTLE_ROUNDS = 100;

export type CivActiveTargeting = "enemy_volley" | "ally_reinforce" | "summon_unit" | "place_trap";

export type CivActiveDef = {
  name: string;
  icon: string;
  description: string;
  targeting: CivActiveTargeting;
  /** Cooldown in **full battle rounds** (turn order wraps to the first side). All factions use this in current balance. */
  cooldownBattleRounds?: number;
  /** Role key from `AVAILABLE_TROOPS[team]` for `summon_unit`. */
  summonRole?: string;
  /**
   * Volley: fixed attack stat for this strike (spotter supplies tile, troop type, and auras for `getAttackDamage`).
   * No % of target HP or % of spotter attack—only this number (before terrain / matchup / mitigation).
   */
  volleyAttackPower?: number;
  /** Reinforce: flat HP restored (capped at max HP). */
  reinforceHealFlat?: number;
  /** Reinforce: flat attack added after heal. */
  reinforceAttackFlat?: number;
  /** `place_trap`: flat HP when an enemy enters the tile (direct damage). */
  trapDamage?: number;
  /** `place_trap`: trap expires after this many full battle rounds if untriggered. */
  duration?: number;
  /** `place_trap`: debuff — victim deals less attack (%) for several rounds. */
  attackReductionPercent?: number;
  /** `place_trap`: debuff — victim takes more damage from attacks (%) for several rounds. */
  armorReductionPercent?: number;
  /** Reserved (not applied yet). */
  trapMoveReduction?: number;
};

/** Placed civ trap (persisted in save). */
export type CivBattleTrap = {
  id: string;
  x: number;
  y: number;
  ownerTeam: TeamName;
  damage: number;
  /** Remove when `battleRound > expiresAtRound`. */
  expiresAtRound: number;
  attackReductionPercent?: number;
  armorReductionPercent?: number;
};

/**
 * Faction actives: volley, ally reinforce, or summon (e.g. Roman Praetorian, Carthage War Elephant). Each entry uses `cooldownBattleRounds` (see `getCivActiveHandbookRows` for the handbook table).
 */
export const CIV_ACTIVES: Record<TeamName, CivActiveDef> = {
 // 🏛️ SUMMON (3)
 Romans: {
  name: "Legion Reinforcement",
  icon: "🏛️",
  description:
    "Summon a Praetorian on an empty tile within 5 range of any ally. Elite bodyguard reinforcement.",
  targeting: "summon_unit",
  summonRole: "Praetorian",
  cooldownBattleRounds: 30
},

Carthage: {
  name: "Beast of the Line",
  icon: "🐘",
  description:
    "Summon a War Elephant within 5 range of any ally. High HP shock unit.",
  targeting: "summon_unit",
  summonRole: "War Elephant",
  cooldownBattleRounds: 40
},

Seleucids: {
  name: "Imperial Reserves",
  icon: "🏺",
  description:
    "Summon Silver Shield Infantry within 5 range of any ally. Elite defensive unit.",
  targeting: "summon_unit",
  summonRole: "Silver Shield Infantry",
  cooldownBattleRounds: 35
},

// 🏹 VOLLEY (3)
Barbarians: {
  name: "Axe Volley",
  icon: "📣",
  description:
    "Target an enemy within 5 range of any ally. Deals 50 damage (affected by terrain and defense).",
  targeting: "enemy_volley",
  volleyAttackPower: 50,
  cooldownBattleRounds: 5
},

Parthians: {
  name: "Parthian Volley",
  icon: "🏹",
  description:
    "Target an enemy within 5 range. Deals 130 damage. Highly effective hit-and-run strike.",
  targeting: "enemy_volley",
  volleyAttackPower: 130,
  cooldownBattleRounds: 13
},

Germanic: {
  name: "Blood Feud Shot",
  icon: "⚒️",
  description:
    "Target an enemy within 5 range. Deals 150 damage. Powerful single-target strike.",
  targeting: "enemy_volley",
  volleyAttackPower: 150,
  cooldownBattleRounds: 15
},

// 💪 BUFF (3)
Greeks: {
  name: "Shielded Resupply",
  icon: "🛡️",
  description:
    "Restore 250 HP and grant +10 attack to a selected ally.",
  targeting: "ally_reinforce",
  reinforceHealFlat: 250,
  reinforceAttackFlat: 10,
  cooldownBattleRounds: 26
},

Egypt: {
  name: "Solar Blessing",
  icon: "☀️",
  description:
    "Restore 250 HP to a selected ally. Reliable sustain ability.",
  targeting: "ally_reinforce",
  reinforceHealFlat: 250,
  cooldownBattleRounds: 25
},

Vikings: {
  name: "War Frenzy",
  icon: "🪓",
  description:
    "Grant +40 attack to a selected ally for increased damage output.",
  targeting: "ally_reinforce",
  reinforceAttackFlat: 40,
  cooldownBattleRounds: 20
},

Gauls: {
  name: "Hidden Snares",
  icon: "🌿",
  description:
    "Place a concealed trap on an empty tile within 5 range of any ally. The first enemy entering it takes 120 damage.",
  targeting: "place_trap",
  trapDamage: 120,
  trapMoveReduction: 2,
  duration: CIV_TRAP_FIELD_DURATION_BATTLE_ROUNDS,
  cooldownBattleRounds: 10
},

Dacians: {
  name: "Falx Trap",
  icon: "🐺",
  description:
    "Place a brutal trap on an empty tile within 5 range of any ally. The first enemy entering it takes 180 damage.",
  targeting: "place_trap",
  trapDamage: 180,
  armorReductionPercent: 25,
  duration: CIV_TRAP_FIELD_DURATION_BATTLE_ROUNDS,
  cooldownBattleRounds: 18
},

Thracians: {
  name: "Terror Trap",
  icon: "⛰️",
  description:
    "Place a fear trap on an empty tile within 5 range of any ally. The first enemy entering it takes 140 damage and suffers -20% attack.",
  targeting: "place_trap",
  trapDamage: 140,
  attackReductionPercent: 20,
  duration: CIV_TRAP_FIELD_DURATION_BATTLE_ROUNDS,
  cooldownBattleRounds: 14
}
};

/** Rows for Mechanics → Special Systems (stays in sync with `CIV_ACTIVES`). */
export type CivActiveHandbookRow = {
  team: TeamName;
  icon: string;
  summary: string;
  cooldownBattleRounds: number;
};

export function getCivActiveHandbookRows(): CivActiveHandbookRow[] {
  return ALL_TEAMS.map((team) => {
    const d = CIV_ACTIVES[team];
    const br = d.cooldownBattleRounds ?? CIV_ABILITY_COOLDOWN_OWN_TURNS;
    if (d.targeting === "enemy_volley") {
      return {
        team,
        icon: d.icon,
        cooldownBattleRounds: br,
        summary: `Volley — fixed attack ${d.volleyAttackPower ?? 48} · ${br} battle rounds`
      };
    }
    if (d.targeting === "ally_reinforce") {
      const heal = d.reinforceHealFlat ?? 0;
      const atk =
        d.reinforceAttackFlat != null && d.reinforceAttackFlat !== 0
          ? `, +${d.reinforceAttackFlat} attack`
          : "";
      return {
        team,
        icon: d.icon,
        cooldownBattleRounds: br,
        summary: `Reinforce — ${heal} HP${atk} · ${br} battle rounds`
      };
    }
    if (d.targeting === "place_trap") {
      const dmg = d.trapDamage ?? 0;
      const fieldDur = Math.max(1, d.duration ?? CIV_TRAP_FIELD_DURATION_BATTLE_ROUNDS);
      const bits: string[] = [];
      if (d.attackReductionPercent) bits.push(`−${d.attackReductionPercent}% victim atk`);
      if (d.armorReductionPercent) bits.push(`+${d.armorReductionPercent}% victim dmg taken`);
      const extra = bits.length ? ` · ${bits.join(", ")}` : "";
      return {
        team,
        icon: d.icon,
        cooldownBattleRounds: br,
        summary: `Trap — ${dmg} HP if stepped on${extra} · ${fieldDur} rounds on field if unused · ability CD ${br} battle rounds`
      };
    }
    return {
      team,
      icon: d.icon,
      cooldownBattleRounds: br,
      summary: `Summon ${d.summonRole ?? "unit"} · ${br} battle rounds`
    };
  });
}

function manhattan(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function isEnemyInCivVolleyRange(units: any[], team: TeamName, target: any): boolean {
  if (!target || target.hp <= 0 || target.team === team) return false;
  return units.some((u) => u.team === team && u.hp > 0 && manhattan(u, target) <= CIV_VOLLEY_RANGE);
}

export function pickVolleySpotter(units: any[], team: TeamName, target: any): any | null {
  const allies = units.filter((u) => u.team === team && u.hp > 0 && manhattan(u, target) <= CIV_VOLLEY_RANGE);
  if (allies.length === 0) return null;
  return allies.reduce((best, u) => (manhattan(u, target) < manhattan(best, target) ? u : best));
}

/** Empty tile in reinforcement range of a living ally (for summon abilities). */
export function isSummonReinforcementTileValid(units: any[], team: TeamName, x: number, y: number): boolean {
  if (units.some((u) => u.hp > 0 && u.x === x && u.y === y)) return false;
  return units.some((u) => u.team === team && u.hp > 0 && manhattan(u, { x, y }) <= CIV_VOLLEY_RANGE);
}

export function clearExpiredCivTraps(traps: CivBattleTrap[], battleRound: number): CivBattleTrap[] {
  return traps.filter((t) => battleRound <= t.expiresAtRound);
}

export function makeCivTrapForTeam(team: TeamName, x: number, y: number, placedRound: number): CivBattleTrap | null {
  const def = CIV_ACTIVES[team];
  if (!def || def.targeting !== "place_trap" || def.trapDamage == null || def.trapDamage <= 0) return null;
  const dur = Math.max(1, def.duration ?? 3);
  return {
    id: `civ_trap_${team}_${placedRound}_${x}_${y}_${Date.now()}`,
    x,
    y,
    ownerTeam: team,
    damage: def.trapDamage,
    expiresAtRound: placedRound + dur,
    attackReductionPercent: def.attackReductionPercent,
    armorReductionPercent: def.armorReductionPercent
  };
}

/**
 * When a unit moves onto (destX, destY), hostile traps deal direct damage once and apply optional debuffs.
 */
export function applyCivTrapOnEntry(
  traps: CivBattleTrap[],
  units: any[],
  mover: any,
  destX: number,
  destY: number,
  battleRound: number
): { traps: CivBattleTrap[]; units: any[]; logLines: string[] } {
  if (!mover || mover.hp <= 0) return { traps, units, logLines: [] };
  const idx = traps.findIndex((t) => t.x === destX && t.y === destY && t.ownerTeam !== mover.team);
  if (idx < 0) return { traps, units, logLines: [] };

  const tr = traps[idx]!;
  const def = CIV_ACTIVES[tr.ownerTeam];
  const nextTraps = traps.filter((_, i) => i !== idx);
  const dmg = Math.max(0, Math.round(tr.damage));
  const debuffHorizon = 4;
  const logLines: string[] = [];

  const extras: string[] = [];
  if (tr.attackReductionPercent) extras.push(`−${tr.attackReductionPercent}% attack (${debuffHorizon} rounds)`);
  if (tr.armorReductionPercent) extras.push(`+${tr.armorReductionPercent}% damage taken (${debuffHorizon} rounds)`);
  const extraStr = extras.length ? ` ${extras.join("; ")}` : "";

  let killed = false;
  const nextUnits = units
    .map((u) => {
      if (u.id !== mover.id) return u;
      const hp = Math.max(0, u.hp - dmg);
      let next: any = { ...u, hp };
      if (hp <= 0) killed = true;
      if (tr.attackReductionPercent && tr.attackReductionPercent > 0) {
        next = {
          ...next,
          civTrapAttackDebuffPct: tr.attackReductionPercent,
          civTrapAttackDebuffUntilRound: battleRound + debuffHorizon
        };
      }
      if (tr.armorReductionPercent && tr.armorReductionPercent > 0) {
        next = {
          ...next,
          civTrapVulnPct: tr.armorReductionPercent,
          civTrapVulnUntilRound: battleRound + debuffHorizon
        };
      }
      return next;
    })
    .filter((u) => u.hp > 0);

  const title = def?.name ? `${def.icon} ${def.name}` : "Trap";
  logLines.push(
    `[Trap] ${title} — ${mover.name} (${mover.team}) steps on a hidden snare for ${dmg} damage.${extraStr ? ` ${extraStr}.` : ""}`
  );
  if (killed) {
    logLines.push(`${mover.name} (${mover.team}) is eliminated by the trap!`);
  }
  return { traps: nextTraps, units: nextUnits, logLines };
}

/** Preview volley damage for AI scoring (same resolution as `applyCivAbilityOnTarget` volley). */
export function previewVolleyAttack(
  units: any[],
  team: TeamName,
  target: any,
  terrainMap: TerrainType[][],
  battleRound: number
): ReturnType<typeof getAttackDamage> | null {
  if (!target || target.hp <= 0 || target.team === team) return null;
  const def = CIV_ACTIVES[team];
  if (!def || def.targeting !== "enemy_volley") return null;
  const spotter = pickVolleySpotter(units, team, target);
  if (!spotter) return null;
  const power = def.volleyAttackPower ?? 48;
  const synthetic = { ...spotter, attack: Math.max(1, Math.round(power)) };
  return getAttackDamage(synthetic, target, units, terrainMap, { round: battleRound });
}

/** Best enemy to volley for AI; null if none in range. */
export function pickAiCivVolleyTarget(
  units: any[],
  team: TeamName,
  terrainMap: TerrainType[][],
  battleRound: number
): { target: any; score: number } | null {
  const enemies = units.filter((u) => u.team !== team && u.hp > 0);
  let best: { target: any; score: number } | null = null;
  for (const e of enemies) {
    if (!isEnemyInCivVolleyRange(units, team, e)) continue;
    const out = previewVolleyAttack(units, team, e, terrainMap, battleRound);
    if (!out) continue;
    const kill = out.damage >= e.hp ? 95 : 0;
    const leader = isLeaderRole(String(e.role ?? "")) ? 42 : 0;
    const wound = ((e.maxHp - e.hp) / Math.max(1, e.maxHp)) * 24;
    const score = out.damage * 1.35 + kill + leader + wound + (out.hasAdvantage ? 22 : 0);
    if (!best || score > best.score) best = { target: e, score };
  }
  return best;
}

/** Ally to reinforce: injured first, else leader or hardest hitter (for pure buffs). */
export function pickAiCivReinforceTarget(units: any[], team: TeamName): any | null {
  const allies = units.filter((u) => u.team === team && u.hp > 0);
  if (allies.length === 0) return null;
  const hurt = allies.filter((u) => u.hp < u.maxHp);
  if (hurt.length > 0) {
    return hurt.slice().sort((a, b) => {
      const da = (a.maxHp - a.hp) / Math.max(1, a.maxHp);
      const db = (b.maxHp - b.hp) / Math.max(1, b.maxHp);
      if (Math.abs(da - db) > 0.03) return db - da;
      if (isLeaderRole(String(a.role ?? "")) !== isLeaderRole(String(b.role ?? ""))) {
        return isLeaderRole(String(b.role ?? "")) ? 1 : -1;
      }
      return (b.maxHp ?? 0) - (a.maxHp ?? 0);
    })[0];
  }
  return allies.slice().sort((a, b) => {
    if (isLeaderRole(String(a.role ?? "")) !== isLeaderRole(String(b.role ?? ""))) {
      return isLeaderRole(String(b.role ?? "")) ? 1 : -1;
    }
    return (b.attack ?? 0) - (a.attack ?? 0);
  })[0];
}

/** Empty summon tile: prefer spots closer to enemies (pressure). */
export function pickAiCivSummonTile(units: any[], team: TeamName, gridW: number, gridH: number): { x: number; y: number } | null {
  const enemies = units.filter((u) => u.team !== team && u.hp > 0);
  const candidates: { x: number; y: number; d: number }[] = [];
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      if (!isSummonReinforcementTileValid(units, team, x, y)) continue;
      let d = Infinity;
      for (const e of enemies) {
        d = Math.min(d, manhattan({ x, y }, e));
      }
      candidates.push({ x, y, d: Number.isFinite(d) ? d : 99 });
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.d - b.d);
  const bestD = candidates[0].d;
  const top = candidates.filter((c) => c.d <= bestD + 1);
  return top[Math.floor(Math.random() * top.length)] ?? candidates[0];
}

/** Base troop object before `applyCivilizationPassive` / AI scaling (caller finalizes). */
export function createSummonedTroopFromRole(team: TeamName, role: string, x: number, y: number): any | null {
  const catalog = AVAILABLE_TROOPS[team];
  const entry = catalog?.find((t) => t.role === role);
  if (!entry) return null;
  const stats = generateTroopStats(role);
  return {
    ...entry,
    ...stats,
    id: `${team}_${role}_summon_${Date.now()}`,
    team,
    x,
    y,
    Icon: entry.Icon
  };
}

function healAllyFlat(unit: any, amount: number): any {
  if (!unit || unit.hp <= 0) return unit;
  const maxHp = unit.maxHp ?? 0;
  const gain = Math.max(0, Math.round(amount));
  if (gain <= 0) return unit;
  return { ...unit, hp: Math.min(maxHp, unit.hp + gain) };
}

/**
 * Apply faction ability to a chosen target. Returns null if invalid.
 */
export function applyCivAbilityOnTarget(
  units: any[],
  team: TeamName,
  target: any,
  terrainMap: TerrainType[][],
  battleRound: number
): { units: any[]; logLine: string } | null {
  const def = CIV_ACTIVES[team];
  if (!def || !target) return null;

  if (def.targeting === "ally_reinforce") {
    if (target.team !== team || target.hp <= 0) return null;
    const logParts: string[] = [];
    const next = units.map((u) => {
      if (u.id !== target.id) return u;
      let x = u;
      if (def.reinforceHealFlat != null && def.reinforceHealFlat > 0) {
        const before = x.hp;
        x = healAllyFlat(x, def.reinforceHealFlat);
        const gained = x.hp - before;
        if (gained > 0) logParts.push(`+${gained} HP`);
      }
      if (def.reinforceAttackFlat != null && def.reinforceAttackFlat !== 0) {
        x = { ...x, attack: Math.max(0, x.attack + def.reinforceAttackFlat) };
        logParts.push(`+${def.reinforceAttackFlat} atk`);
      }
      return x;
    });
    return {
      units: next,
      logLine: `[Civilization Ability] ${def.icon} ${team} — ${def.name} on ${target.name}! (${logParts.join(", ")})`
    };
  }

  // enemy volley
  if (target.team === team || target.hp <= 0) return null;
  const spotter = pickVolleySpotter(units, team, target);
  if (!spotter) return null;

  const power = def.volleyAttackPower ?? 48;
  const synthetic = { ...spotter, attack: Math.max(1, Math.round(power)) };
  const { damage, mitigatedDamage } = getAttackDamage(synthetic, target, units, terrainMap, { round: battleRound });
  const dealt = damage;
  const newHp = Math.max(0, target.hp - dealt);
  const killed = newHp <= 0;

  const next = units
    .map((u) => {
      if (u.id !== target.id) return u;
      return { ...u, hp: newHp };
    })
    .filter((u) => u.hp > 0);

  const mitigStr = mitigatedDamage > 0 ? ` (${mitigatedDamage} blocked)` : "";
  const killStr = killed ? " — destroyed!" : "";
  return {
    units: next,
    logLine: `[Civilization Ability] ${def.icon} ${team} — ${def.name} hits ${target.name} for ${dealt}${mitigStr}${killStr}`
  };
}

export function isCivAbilityReady(
  team: TeamName,
  ownTurnOrdinal: Partial<Record<TeamName, number>>,
  unlockAtOwnOrdinal: Partial<Record<TeamName, number>>,
  battleRound: number,
  unlockAtBattleRound: Partial<Record<TeamName, number>>
): boolean {
  const def = CIV_ACTIVES[team];
  const br = def?.cooldownBattleRounds;
  if (br != null && br > 0) {
    const u = unlockAtBattleRound[team];
    return u == null || battleRound >= u;
  }
  const u = unlockAtOwnOrdinal[team];
  if (u == null) return true;
  const o = ownTurnOrdinal[team] ?? 0;
  return o >= u;
}

/** Integer steps until the civ active can be armed again (battle rounds or own-turn ordinals, matching `isCivAbilityReady`). */
export function getCivAbilityCooldownRemaining(
  team: TeamName,
  ownTurnOrdinal: Partial<Record<TeamName, number>>,
  unlockAtOwnOrdinal: Partial<Record<TeamName, number>>,
  battleRound: number,
  unlockAtBattleRound: Partial<Record<TeamName, number>>
): number {
  const def = CIV_ACTIVES[team];
  const br = def?.cooldownBattleRounds;
  if (br != null && br > 0) {
    const u = unlockAtBattleRound[team];
    if (u == null) return 0;
    return Math.max(0, u - battleRound);
  }
  const u = unlockAtOwnOrdinal[team];
  if (u == null) return 0;
  const o = ownTurnOrdinal[team] ?? 0;
  return Math.max(0, u - o);
}

export function formatCivAbilityCooldownRemaining(team: TeamName, remaining: number): string | null {
  if (remaining <= 0) return null;
  const def = CIV_ACTIVES[team];
  const br = def?.cooldownBattleRounds;
  if (br != null && br > 0) {
    return `${remaining} battle round${remaining === 1 ? "" : "s"} left`;
  }
  return `${remaining} faction turn${remaining === 1 ? "" : "s"} left`;
}

/** Player-facing cooldown line for tooltips and UI. */
export function getCivActiveCooldownSummary(team: TeamName): string {
  const def = CIV_ACTIVES[team];
  const br = def?.cooldownBattleRounds;
  if (br != null && br > 0) {
    return `Cooldown: ${br} full battle rounds (each time the turn order wraps to the first side again).`;
  }
  return `Cooldown: ${CIV_ABILITY_COOLDOWN_OWN_TURNS} of this faction’s turns before you can arm it again.`;
}

export function getCivActiveHowItWorks(targeting: CivActiveTargeting): string {
  switch (targeting) {
    case "enemy_volley":
      return "Tap the cyan button to arm, then click an enemy within 5 tiles of any living ally. Uses this civ’s fixed volley attack (see card), then normal terrain, matchup, and mitigation. Ends your turn.";
    case "ally_reinforce":
      return "Tap the cyan button to arm, then click one of your living troops. Heal and attack bonuses follow the card (most civs restore 250 HP capped at max; some are attack-only). Ends your turn.";
    case "summon_unit":
      return "Tap the cyan button to arm, then click an empty tile within 5 tiles of a living ally to deploy one recruit. Ends your turn.";
    case "place_trap":
      return `Tap the cyan button to arm, then click an empty tile within 5 tiles of a living ally to lay a trap. The first enemy that moves onto it takes direct damage (and debuffs on the card, if any). Traps expire after ${CIV_TRAP_FIELD_DURATION_BATTLE_ROUNDS} full battle rounds if unused. Ends your turn.`;
    default:
      return "";
  }
}

/** Tooltip-only flavor for flying projectiles on volley actives (left-rail hover). */
export type VolleyTooltipFx = "arrows" | "siege_stones" | "thrown_axes" | "javelins";

const VOLLEY_TOOLTIP_FX_BY_TEAM: Partial<Record<TeamName, VolleyTooltipFx>> = {
  Seleucids: "siege_stones",
  Barbarians: "thrown_axes",
  Germanic: "thrown_axes",
  Gauls: "javelins",
  Thracians: "javelins"
};

export function getVolleyTooltipFx(team: TeamName): VolleyTooltipFx | null {
  if (CIV_ACTIVES[team]?.targeting !== "enemy_volley") return null;
  return VOLLEY_TOOLTIP_FX_BY_TEAM[team] ?? "arrows";
}

export function getVolleyTooltipGlyphs(team: TeamName): string[] {
  const fx = getVolleyTooltipFx(team);
  if (!fx) return [];
  switch (fx) {
    case "siege_stones":
      return ["🪨", "⚙️", "🪨"];
    case "thrown_axes":
      return ["🪓", "🪓", "🪓"];
    case "javelins":
      return ["🗡️", "🗡️", "➷"];
    case "arrows":
    default:
      return ["🏹", "➶", "🏹"];
  }
}
