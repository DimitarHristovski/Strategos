import { levels } from "../Units/InitialUnits";
import { getAiTroopHpAttackMultiplier } from "./aiDifficulty";
import { getLevelTeams } from "./levelUtils";
import type { PrepareBattleOpts } from "./unitLifecycle";
import type { AiDifficulty, GameMode, TeamName } from "./types";

export function buildPrepareBattleOptsForGame(
  gameMode: GameMode | null,
  currentLevel: keyof typeof levels,
  playerTeam: TeamName,
  aiDifficulty: AiDifficulty,
  multiplayerTeams: TeamName[],
  customScenarioSpectator: boolean,
  customUnits: any[]
): PrepareBattleOpts | undefined {
  const mult = getAiTroopHpAttackMultiplier(aiDifficulty);
  if (mult === 1) return undefined;
  if (gameMode === "multiplayer") return undefined;

  if (gameMode === "single-player" || gameMode === "campaign" || gameMode === null) {
    const levelTeams = getLevelTeams(currentLevel);
    const aiTeams = levelTeams.filter((t) => t !== playerTeam);
    if (aiTeams.length === 0) return undefined;
    return { aiTeams, aiHpAttackMultiplier: mult };
  }
  if (gameMode === "ai-versus") {
    return { aiTeams: [...multiplayerTeams], aiHpAttackMultiplier: mult };
  }
  if (gameMode === "custom-scenario") {
    if (customScenarioSpectator) {
      const teams = [...new Set(customUnits.map((u: any) => u.team as TeamName))];
      if (teams.length === 0) return undefined;
      return { aiTeams: teams, aiHpAttackMultiplier: mult };
    }
    const teamsInPlay = [...new Set(customUnits.map((u: any) => u.team as TeamName))];
    const aiTeams = teamsInPlay.filter((t) => t !== playerTeam);
    if (aiTeams.length === 0) return undefined;
    return { aiTeams, aiHpAttackMultiplier: mult };
  }
  return undefined;
}

/** Per-team AI HP/attack multiplier for setup placement (e.g. spectator before battle start). */
export function getAiTroopScalingForTeamInGame(
  gameMode: GameMode | null,
  currentLevel: keyof typeof levels,
  playerTeam: TeamName,
  aiDifficulty: AiDifficulty,
  multiplayerTeams: TeamName[],
  customScenarioSpectator: boolean,
  team: TeamName
): number {
  const mult = getAiTroopHpAttackMultiplier(aiDifficulty);
  if (mult === 1) return 1;
  if (gameMode === "multiplayer") return 1;
  if (gameMode === "single-player" || gameMode === "campaign" || gameMode === null) {
    const levelTeams = getLevelTeams(currentLevel);
    if (!levelTeams.includes(team) || team === playerTeam) return 1;
    return mult;
  }
  if (gameMode === "ai-versus") {
    return multiplayerTeams.includes(team) ? mult : 1;
  }
  if (gameMode === "custom-scenario") {
    if (customScenarioSpectator) return mult;
    return team !== playerTeam ? mult : 1;
  }
  return 1;
}
