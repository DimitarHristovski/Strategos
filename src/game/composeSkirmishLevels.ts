import type { TeamName } from "./types";

/** Must match ALL_TEAMS order in constants for consistent pair generation. */
const FACTIONS: TeamName[] = [
  "Romans",
  "Barbarians",
  "Greeks",
  "Gauls",
  "Germanic",
  "Carthage",
  "Egypt",
  "Thracians",
  "Dacians",
  "Parthians",
  "Seleucids",
  "Vikings"
];

function pairKey(a: TeamName, b: TeamName): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function teamsInLevel(units: any[]): TeamName[] {
  return Array.from(new Set(units.map((u) => u.team as TeamName)));
}

/**
 * Adds only **missing** two-faction matchups vs Level1–16, using Level1 geometry
 * (Romans’ tiles → first faction, Barbarians’ tiles → second).
 */
export function buildMissingPairLevels(baseLevels: Record<string, any[]>): Record<string, any[]> {
  const existing = new Set<string>();
  for (const key of Object.keys(baseLevels)) {
    const teams = teamsInLevel(baseLevels[key]!);
    if (teams.length === 2) existing.add(pairKey(teams[0]!, teams[1]!));
  }

  const template = baseLevels.Level1;
  if (!template) return {};

  const romanTpl = template.filter((u: any) => u.team === "Romans");
  const barbTpl = template.filter((u: any) => u.team === "Barbarians");

  function extractTeam(base: Record<string, any[]>, team: TeamName): any[] {
    for (const key of Object.keys(base)) {
      const found = base[key]!.filter((x: any) => x.team === team);
      if (found.length > 0) return found;
    }
    return [];
  }

  function mapToTemplate(tpl: any[], refs: any[], team: TeamName, idLevel: number): any[] {
    const sort = (a: any, b: any) => a.y - b.y || a.x - b.x;
    const tPos = [...tpl].sort(sort);
    const r = [...refs].sort(sort);
    const n = Math.min(tPos.length, r.length);
    return Array.from({ length: n }, (_, i) => ({
      ...r[i]!,
      id: `sk_L${idLevel}_${team}_${i}`,
      team,
      x: tPos[i]!.x,
      y: tPos[i]!.y
    }));
  }

  const out: Record<string, any[]> = {};
  let levelNum = 17;

  for (let i = 0; i < FACTIONS.length; i++) {
    for (let j = i + 1; j < FACTIONS.length; j++) {
      const a = FACTIONS[i]!;
      const b = FACTIONS[j]!;
      if (existing.has(pairKey(a, b))) continue;

      const unitsA = extractTeam(baseLevels, a);
      const unitsB = extractTeam(baseLevels, b);
      if (unitsA.length === 0 || unitsB.length === 0) continue;

      const idLv = levelNum;
      const combined = [...mapToTemplate(romanTpl, unitsA, a, idLv), ...mapToTemplate(barbTpl, unitsB, b, idLv)];
      out[`Level${levelNum}`] = combined;
      levelNum++;
    }
  }

  return out;
}
