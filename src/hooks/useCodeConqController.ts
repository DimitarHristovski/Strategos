import { useCallback, useReducer, type Dispatch, type SetStateAction } from "react";
import { battleSessionReducer, type BattleSessionAction, type BattleSessionState } from "../game/codeconqReducer";

export type BattleSessionApi = BattleSessionState & {
  setUnits: (value: SetStateAction<any[]>) => void;
  setTurn: (value: SetStateAction<string>) => void;
  setRound: (value: SetStateAction<number>) => void;
  setLog: (value: SetStateAction<string[]>) => void;
  dispatchBattleSession: Dispatch<BattleSessionAction>;
};

/**
 * Centralizes units / turn / round / log updates through a single reducer so transitions stay traceable
 * and can be extended with combined actions later.
 */
/** Battle session slice: units, turn, round, log (see `useCodeConqController` alias). */
export function useBattleSession(initializer: () => BattleSessionState): BattleSessionApi {
  const [state, dispatch] = useReducer(battleSessionReducer, null, () => initializer());

  const setUnits = useCallback((payload: SetStateAction<any[]>) => {
    dispatch({ type: "SET_UNITS", payload });
  }, []);

  const setTurn = useCallback((payload: SetStateAction<string>) => {
    dispatch({ type: "SET_TURN", payload });
  }, []);

  const setRound = useCallback((payload: SetStateAction<number>) => {
    dispatch({ type: "SET_ROUND", payload });
  }, []);

  const setLog = useCallback((payload: SetStateAction<string[]>) => {
    dispatch({ type: "SET_LOG", payload });
  }, []);

  return {
    ...state,
    setUnits,
    setTurn,
    setRound,
    setLog,
    dispatchBattleSession: dispatch
  };
}

export const useCodeConqController = useBattleSession;
