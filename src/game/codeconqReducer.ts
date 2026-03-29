import type { SetStateAction } from "react";

/** Core battle loop state: units on the field, turn order, round counter, and combat log. */
export type BattleSessionState = {
  units: any[];
  turn: string;
  round: number;
  log: string[];
};

export type BattleSessionAction =
  | { type: "SET_UNITS"; payload: SetStateAction<any[]> }
  | { type: "SET_TURN"; payload: SetStateAction<string> }
  | { type: "SET_ROUND"; payload: SetStateAction<number> }
  | { type: "SET_LOG"; payload: SetStateAction<string[]> };

export function battleSessionReducer(state: BattleSessionState, action: BattleSessionAction): BattleSessionState {
  switch (action.type) {
    case "SET_UNITS": {
      const next =
        typeof action.payload === "function" ? (action.payload as (prev: any[]) => any[])(state.units) : action.payload;
      return { ...state, units: next };
    }
    case "SET_TURN": {
      const next =
        typeof action.payload === "function" ? (action.payload as (prev: string) => string)(state.turn) : action.payload;
      return { ...state, turn: next };
    }
    case "SET_ROUND": {
      const next =
        typeof action.payload === "function"
          ? (action.payload as (prev: number) => number)(state.round)
          : action.payload;
      return { ...state, round: next };
    }
    case "SET_LOG": {
      const next =
        typeof action.payload === "function" ? (action.payload as (prev: string[]) => string[])(state.log) : action.payload;
      return { ...state, log: next };
    }
    default:
      return state;
  }
}
