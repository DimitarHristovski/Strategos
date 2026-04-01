import { ALL_TEAMS } from "./constants";
import type { TeamName } from "./types";

const DEFAULT_PAIR: TeamName[] = ["Romans", "Barbarians"];

function isTeamName(s: string): s is TeamName {
  return (ALL_TEAMS as readonly string[]).includes(s);
}

/** Restore saved roster: unique factions, length ≥ 2. */
export function normalizeMultiplayerTeams(raw: unknown): TeamName[] {
  if (!Array.isArray(raw) || raw.length < 2) return [...DEFAULT_PAIR];
  const seen = new Set<TeamName>();
  const out: TeamName[] = [];
  for (const t of raw) {
    if (typeof t === "string" && isTeamName(t) && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out.length >= 2 ? out : [...DEFAULT_PAIR];
}

/** Grow by assigning unused factions; shrink trims from the end. */
export function resizeMultiplayerTeamList(prev: TeamName[], newCount: number): TeamName[] {
  if (!Number.isFinite(newCount)) return prev;
  const n = Math.min(ALL_TEAMS.length, Math.max(2, Math.floor(newCount)));
  if (n === prev.length) return prev;
  if (n < prev.length) return prev.slice(0, n);
  const seen = new Set(prev);
  const next = [...prev];
  for (const t of ALL_TEAMS) {
    if (next.length >= n) break;
    if (!seen.has(t)) {
      next.push(t);
      seen.add(t);
    }
  }
  return next;
}
