import { levels } from "../Units/InitialUnits";
import { ALL_TEAMS } from "./constants";
import type { TeamName } from "./types";

export const getLevelTeams = (levelKey: keyof typeof levels): TeamName[] =>
  Array.from(new Set(levels[levelKey].map((unit: any) => unit.team))) as TeamName[];

export const getValidLevelPlayerTeam = (levelKey: keyof typeof levels, preferredTeam: TeamName): TeamName => {
  const levelTeams = getLevelTeams(levelKey);
  return levelTeams.includes(preferredTeam) ? preferredTeam : levelTeams[0] ?? "Romans";
};

export const getAliveTeams = (battleUnits: any[]): TeamName[] =>
  ALL_TEAMS.filter((team) => battleUnits.some((unit: any) => unit.team === team && unit.hp > 0)) as TeamName[];
