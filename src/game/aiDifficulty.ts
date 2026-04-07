import type { AiDifficulty } from "./types";

export const AI_DIFFICULTY_LABELS: Record<AiDifficulty, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  "very-hard": "Very Hard",
  nightmare: "Nightmare",
  impossible: "Impossible"
};

export const AI_DIFFICULTY_ORDER: AiDifficulty[] = [
  "easy",
  "normal",
  "hard",
  "very-hard",
  "nightmare",
  "impossible"
];

export function parseAiDifficulty(raw: unknown): AiDifficulty {
  if (typeof raw === "string" && raw in AI_DIFFICULTY_LABELS) return raw as AiDifficulty;
  return "normal";
}

/** HP and attack multiplier for AI troops: Easy = 1, each step up multiplies by 1.1 (through Impossible). */
export function getAiTroopHpAttackMultiplier(d: AiDifficulty): number {
  const idx = AI_DIFFICULTY_ORDER.indexOf(d);
  const i = idx >= 0 ? idx : AI_DIFFICULTY_ORDER.indexOf("normal");
  return Math.pow(1.1, Math.max(0, i));
}

/** Tunables: how deep the AI searches targets / tiles and how much it values lethal attacks. */
export type AiDifficultyProfile = {
  targetCandidateLimit: number;
  reachableTileCap: number;
  lethalAttackBonus: number;
};

export function getAiDifficultyProfile(d: AiDifficulty): AiDifficultyProfile {
  switch (d) {
    case "easy":
      return { targetCandidateLimit: 2, reachableTileCap: 14, lethalAttackBonus: 125 };
    case "normal":
      return { targetCandidateLimit: 3, reachableTileCap: 26, lethalAttackBonus: 165 };
    case "hard":
      return { targetCandidateLimit: 4, reachableTileCap: 40, lethalAttackBonus: 178 };
    case "very-hard":
      return { targetCandidateLimit: 4, reachableTileCap: 55, lethalAttackBonus: 188 };
    case "nightmare":
      return { targetCandidateLimit: 5, reachableTileCap: 75, lethalAttackBonus: 205 };
    case "impossible":
      return { targetCandidateLimit: 6, reachableTileCap: 999, lethalAttackBonus: 235 };
    default:
      return getAiDifficultyProfile("normal");
  }
}
