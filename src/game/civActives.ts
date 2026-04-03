import { generateTroopStats } from "../Units/troopStats";
import { getAttackDamage, isLeaderRole } from "./battleEngine";
import { AVAILABLE_TROOPS } from "./unitCatalog";
import type { TeamName, TerrainType } from "./types";

/** Max Manhattan distance from any living ally to a valid volley target. */
export const CIV_VOLLEY_RANGE = 5;

/** After using an ability, that faction must wait this many of its own turns before it can use again (not counting the turn you fired on). */
export const CIV_ABILITY_COOLDOWN_OWN_TURNS = 10;

export type CivActiveTargeting = "enemy_volley" | "ally_reinforce" | "summon_unit";

export type CivActiveDef = {
  name: string;
  icon: string;
  description: string;
  targeting: CivActiveTargeting;
  /**
   * If set, ability cooldown uses **battle rounds** (full turn-table cycles) instead of own-turn ordinals.
   * Romans: reinforcement summon uses this (20 rounds).
   */
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
};

/**
 * Faction actives: volley, ally reinforce, or **summon** (Romans). Cooldown is own-turn (default) or battle rounds if set.
 */
export const CIV_ACTIVES: Record<TeamName, CivActiveDef> = {
  Romans: {
    name: "Legion Reinforcement",
    icon: "🏛️",
    description:
      "Deploy 1 fresh Legionary: arm the ability, then click an empty tile within 5 steps of any living ally. 20 battle rounds cooldown.",
    targeting: "summon_unit",
    summonRole: "Legionary",
    cooldownBattleRounds: 20
  },
  Barbarians: {
    name: "Axe Volley",
    icon: "📣",
    description:
      "Click an enemy in volley range (≤5 from any ally): coordinated strike—volley attack 48 (terrain and mitigation apply).",
    targeting: "enemy_volley",
    volleyAttackPower: 48
  },
  Greeks: {
    name: "Shielded Resupply",
    icon: "🛡️",
    description: "Click a living ally: restore 28 HP and +8 attack.",
    targeting: "ally_reinforce",
    reinforceHealFlat: 28,
    reinforceAttackFlat: 8
  },
  Gauls: {
    name: "Hunter's Volley",
    icon: "🌿",
    description: "Click an enemy in volley range: javelin storm—volley attack 46.",
    targeting: "enemy_volley",
    volleyAttackPower: 46
  },
  Germanic: {
    name: "Blood Feud Shot",
    icon: "⚒️",
    description: "Click an enemy in volley range: heavy volley—volley attack 52.",
    targeting: "enemy_volley",
    volleyAttackPower: 52
  },
  Carthage: {
    name: "Mercenary Relief",
    icon: "🐘",
    description: "Click a living ally: restore 32 HP and +10 attack.",
    targeting: "ally_reinforce",
    reinforceHealFlat: 32,
    reinforceAttackFlat: 10
  },
  Egypt: {
    name: "Solar Blessing",
    icon: "☀️",
    description: "Click a living ally: restore 40 HP.",
    targeting: "ally_reinforce",
    reinforceHealFlat: 40
  },
  Thracians: {
    name: "Highland Volley",
    icon: "⛰️",
    description: "Click an enemy in volley range: arrow storm—volley attack 50.",
    targeting: "enemy_volley",
    volleyAttackPower: 50
  },
  Dacians: {
    name: "Wolfpack Aid",
    icon: "🐺",
    description: "Click a living ally: restore 22 HP and +12 attack.",
    targeting: "ally_reinforce",
    reinforceHealFlat: 22,
    reinforceAttackFlat: 12
  },
  Parthians: {
    name: "Parthian Volley",
    icon: "🏹",
    description: "Click an enemy in volley range: mounted archery—volley attack 51.",
    targeting: "enemy_volley",
    volleyAttackPower: 51
  },
  Seleucids: {
    name: "Silver Bolt",
    icon: "🏺",
    description: "Click an enemy in volley range: bolt strike—volley attack 58.",
    targeting: "enemy_volley",
    volleyAttackPower: 58
  },
  Vikings: {
    name: "Ship's Booster",
    icon: "⛵",
    description: "Click a living ally: restore 20 HP and +8 attack.",
    targeting: "ally_reinforce",
    reinforceHealFlat: 20,
    reinforceAttackFlat: 8
  }
};

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

export function civAbilityUnlockOrdinal(useOrdinal: number): number {
  return useOrdinal + 1 + CIV_ABILITY_COOLDOWN_OWN_TURNS;
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
      return "Tap the cyan button to arm, then click an enemy within 5 tiles of any living ally. Uses normal combat mitigation. Ends your turn.";
    case "ally_reinforce":
      return "Tap the cyan button to arm, then click one of your living troops to heal and buff as described. Ends your turn.";
    case "summon_unit":
      return "Tap the cyan button to arm, then click an empty tile within 5 tiles of a living ally to deploy one recruit. Ends your turn.";
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
