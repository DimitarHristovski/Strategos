import type { BattlefieldSize, GameMode, TeamName } from "./types";

/**
 * Per-side budget for timed play: 8×8 → 5 min each, 10×10 → 6 min, 12×12 → 7 min, …
 * (+1 minute per +2 grid steps from 8).
 */
export function getPerTeamTimeBudgetMs(size: BattlefieldSize): number {
  const minutes = 5 + (size - 8) / 2;
  return minutes * 60 * 1000;
}

export function getPerTeamTimeBudgetMinutes(size: BattlefieldSize): number {
  return 5 + (size - 8) / 2;
}

export function formatMatchCountdown(remainingMs: number): string {
  const s = Math.max(0, Math.ceil(remainingMs / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** Winner when one faction's chess clock hits zero. */
export function resolveTimedForfeitMessage(
  units: { team: string; hp: number }[],
  loserTeam: string,
  _gameMode: GameMode | null,
  _multiplayerTeams: [TeamName, TeamName]
): string {
  const alive = units.filter((u) => u.hp > 0);
  const survivors = alive.filter((u) => u.team !== loserTeam);
  const survivorTeams = [...new Set(survivors.map((u) => u.team))];

  if (survivorTeams.length === 0) {
    return `Draw — ${loserTeam} ran out of time with no other forces left`;
  }
  if (survivorTeams.length === 1) {
    return `Winner: ${survivorTeams[0]} — ${loserTeam} ran out of time`;
  }

  const hpByTeam = new Map<string, number>();
  for (const u of survivors) {
    hpByTeam.set(u.team, (hpByTeam.get(u.team) ?? 0) + u.hp);
  }
  const ranked = [...hpByTeam.entries()].sort((a, b) => b[1] - a[1]);
  const best = ranked[0][1];
  const tied = ranked.filter(([, hp]) => hp === best);
  if (tied.length > 1) {
    return `Draw — ${loserTeam} ran out of time (survivors tied at ${best} HP)`;
  }
  return `Winner: ${ranked[0][0]} — ${loserTeam} ran out of time (most army HP among survivors)`;
}

/** Unique factions with at least one living unit. */
export function getTeamsWithLivingUnits(units: { team: string; hp: number }[]): string[] {
  return [...new Set(units.filter((u) => u.hp > 0).map((u) => String(u.team)))];
}
