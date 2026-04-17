import { isSummonReinforcementTileValid, CIV_SUMMON_ALLY_RANGE } from "./civActives";
import { isLeaderRole } from "./battleEngine";
import { AVAILABLE_TROOPS } from "./unitCatalog";
import type { BattlefieldSize, TeamName, TroopCatalogEntry } from "./types";
import { getUnitWeightTokenCost } from "./unitWeight";

/** Multiplier on army token cost → gold price for recruiting. */
export const RESOURCE_WAR_PRICE_MULT = 5;
/** No starting purse — gold comes only from mining minigames. */
export const RESOURCE_WAR_STARTING_GOLD = 0;
/**
 * When you finish a mining session, the opponent receives this fraction of your minigame bonus gold
 * (abstracts their own dig) so they can keep recruiting.
 */
export const RESOURCE_WAR_AI_MINIGAME_GOLD_MULT = 0.68;

/** Number of enemy attack waves in Resource war (wave 1 starts when battle begins). */
export const RESOURCE_WAR_TOTAL_WAVES = 5;

/** Player begins with this many units (includes one King). */
export const RESOURCE_WAR_PLAYER_START_COUNT = 5;

/** Opponent waves use the Barbarian roster (fixed for this mode). */
export const RESOURCE_WAR_WAVE_ENEMY_TEAM: TeamName = "Barbarians";

/** Extra recruit budget for the AI when spawning a wave (added to war chest for that spawn only). */
export function getResourceWarWaveRecruitBonus(waveIndex: number): number {
  if (waveIndex <= 0) return 0;
  return 42 + waveIndex * 36;
}

export function getResourceWarTroopGoldPrice(role: string): number {
  return Math.max(1, Math.round(getUnitWeightTokenCost(role) * RESOURCE_WAR_PRICE_MULT));
}

/** First row index (0-based) belonging to the player’s deployment half (inclusive). */
export function getResourceWarPlayerHalfStartY(size: BattlefieldSize): number {
  return Math.floor(size / 2);
}

/** Player uses the bottom half of the map, enemy the top half — no neutral “mine” band. */
export function isResourceWarDeploymentTile(
  size: BattlefieldSize,
  y: number,
  forTeam: TeamName,
  playerTeam: TeamName,
  enemyTeam: TeamName
): boolean {
  const mid = getResourceWarPlayerHalfStartY(size);
  if (forTeam === playerTeam) return y >= mid;
  if (forTeam === enemyTeam) return y < mid;
  return false;
}

/** Rally point for the enemy king / summon hub (center of the enemy’s front row). */
export function getResourceWarEnemyRallyCell(
  size: BattlefieldSize,
  playerTeam: TeamName,
  enemyTeam: TeamName
): { x: number; y: number } {
  const mid = getResourceWarPlayerHalfStartY(size);
  const y = Math.max(0, mid - 1);
  const x = Math.floor(size / 2);
  return { x, y };
}

/** Empty enemy-half tile closest to rally (for placing a chief when no ally exists yet). */
export function findEmptyEnemyTileNearRally(
  units: ReadonlyArray<{ x: number; y: number; hp?: number }>,
  size: BattlefieldSize,
  playerTeam: TeamName,
  enemyTeam: TeamName,
  rally: { x: number; y: number }
): { x: number; y: number } | null {
  const mid = getResourceWarPlayerHalfStartY(size);
  const occ = (x: number, y: number) => units.some((u) => (u.hp == null || u.hp > 0) && u.x === x && u.y === y);
  let best: { x: number; y: number; d: number } | null = null;
  for (let y = 0; y < mid; y++) {
    for (let x = 0; x < size; x++) {
      if (occ(x, y)) continue;
      if (!isResourceWarDeploymentTile(size, y, enemyTeam, playerTeam, enemyTeam)) continue;
      const d = Math.abs(x - rally.x) + Math.abs(y - rally.y);
      if (!best || d < best.d) best = { x, y, d };
    }
  }
  return best ? { x: best.x, y: best.y } : null;
}

/**
 * Empty enemy-half cells within summon range (Manhattan ≤1) of any living enemy,
 * same rule as civ reinforcement summons.
 */
export function collectResourceWarSummonSlots(
  units: ReadonlyArray<{ team: TeamName; hp: number; x: number; y: number }>,
  enemyTeam: TeamName,
  size: BattlefieldSize,
  playerTeam: TeamName,
  enemyTeamForHalf: TeamName
): { x: number; y: number }[] {
  const mid = getResourceWarPlayerHalfStartY(size);
  const out: { x: number; y: number }[] = [];
  for (let y = 0; y < mid; y++) {
    for (let x = 0; x < size; x++) {
      if (units.some((u) => u.hp > 0 && u.x === x && u.y === y)) continue;
      if (!isResourceWarDeploymentTile(size, y, enemyTeam, playerTeam, enemyTeamForHalf)) continue;
      if (!isSummonReinforcementTileValid(units as any[], enemyTeam, x, y, CIV_SUMMON_ALLY_RANGE)) continue;
      out.push({ x, y });
    }
  }
  return out;
}

/**
 * Layout for the player’s starting 5 (king + 4 basic troops) on the bottom half.
 */
export function getResourceWarPlayerStartLayout(
  playerTeam: TeamName,
  size: BattlefieldSize,
  enemyTeam: TeamName
): Array<{ entry: TroopCatalogEntry; x: number; y: number }> | null {
  const mid = getResourceWarPlayerHalfStartY(size);
  const catalog = AVAILABLE_TROOPS[playerTeam];
  const leader = catalog.find((t) => isLeaderRole(t.role));
  if (!leader) return null;
  const followers = catalog.filter((t) => !isLeaderRole(t.role));
  const picks: TroopCatalogEntry[] = [leader, ...followers.slice(0, RESOURCE_WAR_PLAYER_START_COUNT - 1)];
  if (picks.length < RESOURCE_WAR_PLAYER_START_COUNT) return null;

  const cx = Math.floor(size / 2);
  const baseY = size - 1;
  const coords: { x: number; y: number }[] = [
    { x: cx, y: baseY },
    { x: cx - 1, y: baseY },
    { x: cx + 1, y: baseY },
    { x: cx, y: baseY - 1 },
    { x: cx + 1, y: baseY - 1 }
  ];

  const out: Array<{ entry: TroopCatalogEntry; x: number; y: number }> = [];
  const seen = new Set<string>();
  for (let i = 0; i < RESOURCE_WAR_PLAYER_START_COUNT; i++) {
    let { x, y } = coords[i]!;
    x = Math.max(0, Math.min(size - 1, x));
    if (y < mid) y = mid;
    if (y > size - 1) y = size - 1;
    if (!isResourceWarDeploymentTile(size, y, playerTeam, playerTeam, enemyTeam)) return null;
    const k = `${x},${y}`;
    if (seen.has(k)) return null;
    seen.add(k);
    out.push({ entry: picks[i]!, x, y });
  }
  return out;
}
