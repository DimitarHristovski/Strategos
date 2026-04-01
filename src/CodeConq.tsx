// CodeConq - Grid Strategy Game with Highlights and Expanded Features
// Now includes: Health Bars, Kill Counters, Special Ability Tooltips, and Custom Drag & Drop Setup

import { createElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { BattlefieldSkyLayer } from "./components/codeconq/BattlefieldSkyLayer";
import { FormationLoadingScreen } from "./components/codeconq/FormationLoadingScreen";
import { useBattlefieldDayNightOverlay } from "./hooks/useBattlefieldDayNight";
import { useBattlefieldViewport } from "./hooks/useBattlefieldViewport";
import { useBattleSession } from "./hooks/useCodeConqController";
import { levels } from "./Units/InitialUnits";
import { generateTroopStats, getTroopAbilities, getTroopReferenceStats, type TroopReferenceStats } from "./Units/troopStats";
import { createAttackSfxController, type AttackSfxKind } from "./audio/attackSfx";
import { createBattleSfxController, getTurnCueForTeam, type BattleSfxKey } from "./audio/battleSfx";
import { createTroopSelectionSfxController } from "./audio/troopSelectionSfx";
import {
  applyRoleHealthBuffs,
  didRoleHealthBuffStateChange,
  getAttackDamage,
  getBattlefieldBuffStrip,
  getDisplayedAttack,
  getEffectiveMove,
  getEffectiveRange,
  getOrientationRotationSteps,
  getTerrainModifiers,
  getTroopMechanicType,
  getUnitEffectNotes,
  hasNoAmmoPenalty,
  isLeaderRole,
  rotateUnitCoordinates,
  TROOP_MECHANIC_ICONS,
  TROOP_MECHANIC_LABELS
} from "./game/battleEngine";
import {
  ALL_TEAMS,
  BACKGROUND_MUSIC_SRC,
  BATTLEFIELD_SIZE_OPTIONS,
  DEFAULT_GAME_OPTIONS,
  DEFAULT_TERRAIN_GENERATION_SETTINGS,
  GAME_BUILD_LABEL,
  readGameAudioPrefs,
  readPersistedSessionNavigation,
  readUserPrefs,
  writeGameAudioPrefs,
  writeUserPrefs,
  GAME_STATE_STORAGE_KEY,
  LEGACY_GAME_STATE_STORAGE_KEY,
  GAME_VERSION,
  GRID_ORIENTATIONS,
  LEVEL_MATCHUP_LABELS,
  TEAM_SELECT_GROUPS,
  TURN_ACTION_BUDGET_MS,
  DESERT_TILE_VIDEO_SRC,
  FOREST_TILE_VIDEO_SRC,
  HILL_TILE_VIDEO_SRC,
  PLAIN_TILE_VIDEO_SRC,
  RIVER_TILE_VIDEO_SRC,
  TERRAIN_ASSETS,
  TERRAIN_LABELS,
  TERRAIN_TYPES
} from "./game/constants";
import { getAliveTeams, getLevelTeams, getValidLevelPlayerTeam } from "./game/levelUtils";
import {
  ADDITIONAL_MECHANICS_INFO,
  AI_MECHANICS_INFO,
  FORMATION_BUFF_MECHANICS_INFO,
  GAME_MECHANICS_INFO,
  getBattleLogAppearance,
  SIGNATURE_ABILITY_MECHANICS_INFO,
  TERRAIN_MECHANICS_INFO,
  TROOP_MECHANICS_INFO
} from "./game/mechanicsInfo";
import { buildPrepareBattleOptsForGame, getAiTroopScalingForTeamInGame } from "./game/aiTroopScaling";
import {
  AI_DIFFICULTY_LABELS,
  AI_DIFFICULTY_ORDER,
  getAiDifficultyProfile,
  parseAiDifficulty
} from "./game/aiDifficulty";
import {
  formatMatchCountdown,
  getPerTeamTimeBudgetMinutes,
  getPerTeamTimeBudgetMs,
  getTeamsWithLivingUnits,
  resolveTimedForfeitMessage
} from "./game/matchTimer";
import { normalizeMultiplayerTeams, resizeMultiplayerTeamList } from "./game/multiplayerTeams";
import { getTerrainAutotileVisual, RIVER_CORNER_ASSET } from "./game/terrainAutotile";
import { generateTerrainMap, getEnabledTerrainTypes, getTerrainAt, isValidTerrainMap } from "./game/terrainEngine";
import {
  AVAILABLE_TROOPS,
  getBattlefieldUnitLabel,
  getTroopSearchKeywords,
  getTroopTypeDisplay,
  getTroopWeightDisplay,
  getUnitDisplayIcon,
  ICON_MAP
} from "./game/unitCatalog";
import { SETUP_ARMY_TOKEN_BUDGET, getUnitWeightTokenCost, sumSetupTokensForTeam } from "./game/unitWeight";
import {
  applyAiTroopStatMultiplier,
  applyCivilizationPassive,
  CIV_PASSIVES,
  PASSIVE_ICONS,
  prepareUnitsForBattle,
  restoreUnitFromStorage,
  rerollUnits,
  stripUnitForStorage
} from "./game/unitLifecycle";
import {
  ATTACK_RESOLVE_MELEE_MS,
  ATTACK_RESOLVE_RANGED_MS,
  battlefieldMotionCssVars,
  DEATH_CELL_FEEDBACK_MS,
  DEATH_EXIT_ANIMATION_S,
  getAttackResolutionDelayMs,
  HIT_FLASH_MS,
  MELEE_WINDUP_MS,
  RANGED_ATTACKER_PULSE_MS,
  SIEGE_FOG_DURATION_MS,
  SIEGE_IMPACT_DELAY_MS
} from "./game/battleAnimation";
import type {
  AiDifficulty,
  BattlefieldSize,
  BattleFeedbackKind,
  GameMode,
  GameOptions,
  GridOrientation,
  HoverScrollDirection,
  ProjectileFeedback,
  TeamName,
  TerrainGenerationSettings,
  TerrainPoint,
  TerrainPreset,
  TerrainType,
  TroopCatalogEntry,
  UnitsReferenceScope
} from "./game/types";

/** Stable when terrain combat modifiers are off — a fresh `[]` each render was resetting the AI `useEffect` timer every frame. */
const EMPTY_TERRAIN_EFFECT_MAP: TerrainType[][] = [];

/** Floating red −HP after a hit lands (synced with `.battle-damage-popup` animation). */
const DAMAGE_POPUP_LIFESPAN_MS = 3000;
const DAMAGE_POPUP_LIFESPAN_REDUCED_MS = 1500;

/** About screen carousel: four panels (indices 0–3). */
const ABOUT_SCREEN_SLIDE_LAST = 3;

const INITIAL_SESSION_NAV = readPersistedSessionNavigation();

/** One localStorage read on first mount: merged user prefs + legacy audio prefs. */
let initialSessionDefaultsCache: {
  gameOptions: GameOptions;
  terrainPreset: TerrainPreset;
  terrainGenerationSettings: TerrainGenerationSettings;
} | null = null;

function readInitialSessionDefaults(): {
  gameOptions: GameOptions;
  terrainPreset: TerrainPreset;
  terrainGenerationSettings: TerrainGenerationSettings;
} {
  if (initialSessionDefaultsCache) return initialSessionDefaultsCache;
  if (typeof window === "undefined") {
    initialSessionDefaultsCache = {
      gameOptions: DEFAULT_GAME_OPTIONS,
      terrainPreset: "mixed",
      terrainGenerationSettings: DEFAULT_TERRAIN_GENERATION_SETTINGS
    };
    return initialSessionDefaultsCache;
  }
  const user = readUserPrefs();
  const audio = readGameAudioPrefs();
  const gameOptions: GameOptions = {
    ...DEFAULT_GAME_OPTIONS,
    ...(user?.gameOptions ?? {}),
    ...(audio ?? {})
  };
  if (!BATTLEFIELD_SIZE_OPTIONS.includes(gameOptions.battlefieldSize)) {
    gameOptions.battlefieldSize = DEFAULT_GAME_OPTIONS.battlefieldSize;
  }
  const terrainPreset: TerrainPreset =
    user?.terrainPreset && ["mixed", "plain", "forest", "hill", "desert"].includes(user.terrainPreset)
      ? user.terrainPreset
      : "mixed";
  const terrainGenerationSettings: TerrainGenerationSettings = {
    ...DEFAULT_TERRAIN_GENERATION_SETTINGS,
    ...(user?.terrainGenerationSettings ?? {})
  };
  initialSessionDefaultsCache = { gameOptions, terrainPreset, terrainGenerationSettings };
  return initialSessionDefaultsCache;
}

const renderTeamSelectOptions = (
  allowedTeams: readonly TeamName[],
  getOptionLabel?: (team: TeamName) => string
) =>
  TEAM_SELECT_GROUPS.map((group) => {
    const groupedTeams = group.teams.filter((team) => allowedTeams.includes(team));
    if (groupedTeams.length === 0) return null;

    return (
      <optgroup key={group.label} label={group.label}>
        {groupedTeams.map((team) => (
          <option key={team} value={team}>
            {getOptionLabel ? getOptionLabel(team) : team}
          </option>
        ))}
      </optgroup>
    );
  });

const SETUP_ROSTER_TIP_CLOSE_MS = 140;

/**
 * Combine two same-role units for merge: sum current HP (capped to combined max) and combine max/base max
 * so formation HP buffs (`baseMaxHp` in battle engine) stay consistent.
 */
function mergeTroopHpFields(a: { hp?: number; maxHp?: number; baseMaxHp?: number }, b: { hp?: number; maxHp?: number; baseMaxHp?: number }) {
  const baseA = a.baseMaxHp ?? a.maxHp ?? 0;
  const baseB = b.baseMaxHp ?? b.maxHp ?? 0;
  const baseMaxHp = Math.max(0, Math.round(baseA + baseB));
  const maxHp = Math.max(0, Math.round((a.maxHp ?? 0) + (b.maxHp ?? 0)));
  const hp = Math.min(maxHp, Math.round((a.hp ?? 0) + (b.hp ?? 0)));
  return { hp, maxHp, baseMaxHp };
}

/** Portal tooltip so setup roster previews are not clipped by the unit panel overflow. */
function SetupTroopPaletteCell({
  troop,
  onDragStart,
  onDragEnd,
  deploymentBudgetApplies,
  selectedTeamTokenSpend,
  paletteSize = "default"
}: {
  troop: TroopCatalogEntry;
  onDragStart: () => void;
  onDragEnd: () => void;
  deploymentBudgetApplies: boolean;
  selectedTeamTokenSpend: number;
  /** Larger touch targets in custom scenario deployment panel */
  paletteSize?: "default" | "comfortable";
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const syncTipPos = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTipPos({ x: r.left + r.width / 2, y: r.bottom - 6 });
  }, []);

  const openTip = useCallback(() => {
    cancelClose();
    syncTipPos();
    setTipOpen(true);
  }, [cancelClose, syncTipPos]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setTipOpen(false), SETUP_ROSTER_TIP_CLOSE_MS);
  }, [cancelClose]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  useEffect(() => {
    if (!tipOpen) return;
    syncTipPos();
    const handle = () => syncTipPos();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [tipOpen, syncTipPos]);

  const referenceStats = getTroopReferenceStats(troop.role);
  const troopAbilities = getTroopAbilities(troop.role);
  const weightDisplay = getTroopWeightDisplay({ role: troop.role });
  const troopTypeDisplay = getTroopTypeDisplay({
    role: troop.role,
    name: troop.name,
    ammo: referenceStats.ammo,
    range: referenceStats.range,
    move: referenceStats.move
  });
  const paletteIcon =
    typeof troop.Icon === "string" && troop.Icon.length <= 2
      ? troop.Icon
      : ICON_MAP[troop.Icon as keyof typeof ICON_MAP] || troop.Icon || "⚔️";
  const leaderUnit = isLeaderRole(troop.role);
  const tokenCost = getUnitWeightTokenCost(troop.role);
  const canAffordPlacement =
    !deploymentBudgetApplies || selectedTeamTokenSpend + tokenCost <= SETUP_ARMY_TOKEN_BUDGET;

  const tooltip =
    tipOpen &&
    createPortal(
      <div
        role="tooltip"
        className="pointer-events-auto fixed z-[300] w-[min(18.5rem,calc(100vw-2rem))] rounded-2xl border border-yellow-600/65 bg-slate-950/98 p-3 pt-3.5 text-left shadow-[0_16px_48px_rgba(0,0,0,0.5)] ring-1 ring-amber-900/25 backdrop-blur-md sm:w-[19rem]"
        style={{
          left: tipPos.x,
          top: tipPos.y,
          transform: "translate(-50%, 0)"
        }}
        onMouseEnter={openTip}
        onMouseLeave={scheduleClose}
      >
        <div className="max-h-[min(22rem,55vh)] overflow-y-auto overscroll-contain pr-0.5">
          <div className="flex items-start gap-2 border-b border-yellow-700/35 pb-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-600/40 bg-black/30 text-2xl">
              {paletteIcon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold leading-tight text-yellow-50">{troop.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-yellow-700/50 bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-yellow-200/90">
                  {troop.role}
                </span>
                <span className="rounded-full border border-cyan-700/45 bg-cyan-950/35 px-2 py-0.5 text-[10px] font-semibold text-cyan-100">
                  {troopTypeDisplay.icon} {troopTypeDisplay.label}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${weightDisplay.badgeClassName}`}
                  title={weightDisplay.summary}
                >
                  {weightDisplay.label}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] text-yellow-100/90">
            <span className="rounded-md border border-yellow-800/40 bg-black/20 px-2 py-1">
              HP {referenceStats.hp[0]}–{referenceStats.hp[1]}
            </span>
            <span className="rounded-md border border-yellow-800/40 bg-black/20 px-2 py-1">
              ATK {referenceStats.attack[0]}–{referenceStats.attack[1]}
            </span>
            <span className="rounded-md border border-yellow-800/40 bg-black/20 px-2 py-1">RNG {referenceStats.range}</span>
            <span className="rounded-md border border-yellow-800/40 bg-black/20 px-2 py-1">MOV {referenceStats.move}</span>
            <span className="rounded-md border border-yellow-800/40 bg-black/20 px-2 py-1">AMMO {referenceStats.ammo}</span>
            <span
              className={`rounded-md border px-2 py-1 font-semibold uppercase tracking-wide ${weightDisplay.badgeClassName}`}
              title={weightDisplay.summary}
            >
              {weightDisplay.label}
            </span>
          </div>
          <p className="mt-2 text-[10px] leading-snug text-yellow-100/75">{weightDisplay.summary}</p>
          {deploymentBudgetApplies && (
            <p className="mt-2 text-[10px] text-amber-100/90">
              Army tokens: <span className="font-semibold text-amber-200">{tokenCost}</span> (budget{" "}
              {SETUP_ARMY_TOKEN_BUDGET} per side)
              {!canAffordPlacement && (
                <span className="block text-red-300/95">Not enough tokens left for this unit.</span>
              )}
            </p>
          )}

          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/85">Signature skills</div>
            {troopAbilities.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {troopAbilities.map((ability) => (
                  <li
                    key={ability.key}
                    className="rounded-xl border border-cyan-700/30 bg-cyan-950/20 px-2.5 py-2 text-[11px] leading-relaxed text-cyan-50/95"
                  >
                    <span className="font-semibold text-cyan-200">{ability.name}:</span> {ability.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[11px] text-yellow-100/65">No signature skills on this role.</p>
            )}
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <div
        ref={anchorRef}
        className="relative z-10 flex flex-col items-center"
        onMouseEnter={openTip}
        onMouseLeave={scheduleClose}
      >
        <div
          draggable={canAffordPlacement}
          onDragStart={() => {
            if (!canAffordPlacement) return;
            setTipOpen(false);
            cancelClose();
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          title={`${troop.name} (${troop.role}) · ${weightDisplay.label}${deploymentBudgetApplies ? ` · ${tokenCost} tokens` : ""}`}
          className={`flex shrink-0 touch-manipulation items-center justify-center rounded-xl border border-yellow-700/50 bg-gradient-to-br from-slate-800/95 to-slate-950/95 shadow-md transition-[transform,box-shadow,border-color] ${
            paletteSize === "comfortable"
              ? "h-12 w-12 text-xl sm:h-14 sm:w-14 sm:text-2xl"
              : "h-11 w-11 text-lg sm:h-[52px] sm:w-[52px] sm:text-2xl"
          } ${
            canAffordPlacement
              ? "cursor-grab active:cursor-grabbing hover:z-[25] hover:scale-105 hover:border-amber-400/55 hover:shadow-lg"
              : "cursor-not-allowed opacity-45"
          } ${leaderUnit ? "ring-2 ring-amber-500/40 ring-offset-2 ring-offset-slate-900/80" : ""}`}
        >
          <span className="select-none leading-none" aria-hidden>
            {paletteIcon}
          </span>
        </div>
      </div>
      {tooltip}
    </>
  );
}

const FACTION_PASSIVE_RAIL_TIP_MS = 140;

/** Left-rail faction passive: portal tooltip avoids overflow clip; rail stays scrollable and clickable. */
function FactionPassiveRailCell({ team }: { team: TeamName }) {
  const passive = CIV_PASSIVES[team];
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipPos, setTipPos] = useState({ left: 0, top: 0 });
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const syncTipPos = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const cardW = Math.min(21 * 16, vw - 24);
    const gap = 10;
    let left = r.right + gap;
    if (left + cardW > vw - 12) {
      left = r.left - gap - cardW;
    }
    left = Math.max(10, Math.min(left, vw - cardW - 10));
    setTipPos({ left, top: r.top + r.height / 2 });
  }, []);

  const openTip = useCallback(() => {
    cancelClose();
    syncTipPos();
    setTipOpen(true);
  }, [cancelClose, syncTipPos]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setTipOpen(false), FACTION_PASSIVE_RAIL_TIP_MS);
  }, [cancelClose]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  useEffect(() => {
    if (!tipOpen) return;
    syncTipPos();
    const handle = () => syncTipPos();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [tipOpen, syncTipPos]);

  if (!passive) return null;

  const tooltip =
    tipOpen &&
    createPortal(
      <div
        role="tooltip"
        className="pointer-events-auto fixed z-[280] w-[min(21rem,calc(100vw-1.5rem))] -translate-y-1/2 overflow-hidden rounded-[22px] border border-yellow-500/80 bg-slate-950/95 text-left shadow-[0_24px_70px_rgba(0,0,0,0.55)] ring-1 ring-amber-200/10 backdrop-blur-md"
        style={{ left: tipPos.left, top: tipPos.top }}
        onMouseEnter={openTip}
        onMouseLeave={scheduleClose}
      >
        <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.3),_transparent_70%)]" />
        <div className="absolute right-[-18px] top-[-22px] h-24 w-24 rounded-full bg-amber-300/8 blur-2xl" />
        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/85 to-transparent" />
        <div className="relative max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/65 bg-gradient-to-br from-amber-300/20 via-amber-200/10 to-transparent text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_10px_24px_rgba(0,0,0,0.3)]">
              {PASSIVE_ICONS[team]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-[15px] font-bold tracking-[0.08em] text-yellow-50">{team}</div>
                <div className="h-px flex-1 bg-gradient-to-r from-yellow-400/35 to-transparent" />
              </div>
              <div className="mt-2 inline-flex rounded-full border border-yellow-500/35 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-300/95">
                Passive
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300/80">Faction Bonus</div>
            <div className="mt-2 text-base font-semibold leading-tight text-yellow-100">{passive.name}</div>
            <div className="mt-3 rounded-xl border border-yellow-500/15 bg-slate-950/45 px-3 py-2.5 text-[13px] leading-6 text-yellow-50/95">
              {passive.effect}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <button
        type="button"
        ref={anchorRef}
        className="cc-cursor-faction-info game-ui flex h-11 w-11 shrink-0 items-center justify-center border border-yellow-600 bg-gray-950 text-lg shadow-lg transition-colors hover:border-yellow-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        aria-label={`${team} passive: ${passive.name}. ${passive.effect}`}
        title={`${team} — ${passive.name}`}
        onMouseEnter={openTip}
        onMouseLeave={scheduleClose}
      >
        {PASSIVE_ICONS[team]}
      </button>
      {tooltip}
    </>
  );
}

function AppVersionCorner() {
  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-[200] select-none sm:bottom-4 sm:right-4"
      aria-hidden
    >
      <span
        className="inline-block rounded-md border border-yellow-600/45 bg-black/55 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-yellow-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-sm"
        title={`Strategos v${GAME_VERSION}`}
      >
        v{GAME_VERSION}
      </span>
    </div>
  );
}

type GameControlsReferenceBodyProps = {
  /** Tighter typography for the pause menu panel */
  dense?: boolean;
};

function GameControlsReferenceBody({ dense }: GameControlsReferenceBodyProps) {
  const li = dense
    ? "text-xs leading-relaxed text-yellow-100/85"
    : "text-sm leading-relaxed text-yellow-50/85";
  const gap = dense ? "space-y-2" : "space-y-2.5";
  return (
    <ul className={`${gap} list-disc pl-5 marker:text-yellow-500/80`}>
      <li className={li}>
        <span className="font-semibold text-yellow-100/95">Battle:</span> Click your unit&apos;s tile to select it. Move and attack highlights show legal tiles; click a highlight to move or attack. End your turn from the header when you are done.
      </li>
      <li className={li}>
        <span className="font-semibold text-yellow-100/95">Setup:</span> Drag troops from the roster onto the grid and drag placed units to reposition. Follow on-screen hints for merge or deploy rules in each mode.
      </li>
      <li className={li}>
        <span className="font-semibold text-yellow-100/95">Large maps:</span> Edge scroll rails and drag-pan on the map appear from 14×14 in a normal window, or from 9×9 in fullscreen. Scroll with the mouse wheel or trackpad when the grid overflows. With that chrome,{" "}
        <strong className="font-semibold text-yellow-50">arrow keys</strong> and <strong className="font-semibold text-yellow-50">WASD</strong> pan the battlefield (disabled while focus is in a text field).
      </li>
      <li className={li}>
        <span className="font-semibold text-yellow-100/95">Menu:</span> Open <strong className="font-semibold text-yellow-50">Game Menu</strong> in the header for pause, Options, Mechanics, Units, Graphics, and controls.
      </li>
      <li className={li}>
        <span className="font-semibold text-yellow-100/95">Audio:</span> Toggle music and sound effects under Options.
      </li>
    </ul>
  );
}

function CodeConq() {
  const [currentLevel, setCurrentLevel] = useState<keyof typeof levels>("Level1");
  const [terrainPreset, setTerrainPreset] = useState<TerrainPreset>(() => readInitialSessionDefaults().terrainPreset);
  const [terrainGenerationSettings, setTerrainGenerationSettings] = useState<TerrainGenerationSettings>(
    () => readInitialSessionDefaults().terrainGenerationSettings
  );
  const { units, setUnits, turn, setTurn, log, setLog, round, setRound } = useBattleSession(() => ({
    units: prepareUnitsForBattle(
      levels["Level1"],
      buildPrepareBattleOptsForGame(null, "Level1", "Romans", "normal", ["Romans", "Barbarians"], false, [])
    ),
    turn: "Romans",
    log: [] as string[],
    round: 1
  }));
  const setLogRef = useRef(setLog);
  setLogRef.current = setLog;
  const [battlefieldTerrain, setBattlefieldTerrain] = useState<TerrainType[][]>(() => {
    const s = readInitialSessionDefaults();
    return generateTerrainMap(s.gameOptions.battlefieldSize, s.terrainPreset, s.terrainGenerationSettings);
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** After clicking an enemy with multiple valid melee approach tiles, player picks an empty adjacent cell. */
  const [meleeApproachPendingTargetId, setMeleeApproachPendingTargetId] = useState<string | null>(null);
  const [inspectedUnitId, setInspectedUnitId] = useState<string | null>(null);
  const [inspectedTile, setInspectedTile] = useState<TerrainPoint | null>(null);
  
  // Custom setup mode states
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [customUnits, setCustomUnits] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamName>("Romans");
  const [playerTeam, setPlayerTeam] = useState<TeamName>("Romans");
  const [draggedTroop, setDraggedTroop] = useState<any>(null);
  /** HTML5 DnD from battlefield in setup: ref is reliable when drop runs before React state updates. */
  const setupFieldDragUnitIdRef = useRef<string | null>(null);
  const [setupFieldDragActive, setSetupFieldDragActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  /** Chess-clock: committed ms per team at end of their last turn; current slice uses ref start time. */
  const [timedPlayCommittedMs, setTimedPlayCommittedMs] = useState<Record<string, number>>({});
  const [timedPlayLoserTeam, setTimedPlayLoserTeam] = useState<string | null>(null);
  const timedPlayTurnStartedAtRef = useRef(Date.now());
  /** Start of current faction's move-clock slice (timed play only; separate from bank deduction anchor). */
  const turnSliceStartedAtRef = useRef(Date.now());
  /** Drives live countdown re-renders while timed play is on (bank + move clock). */
  const [matchNowMs, setMatchNowMs] = useState(() => Date.now());
  /** Prevents duplicate battle-end lines in the log (elimination or time). */
  const battleOutcomeLoggedRef = useRef(false);
  const checkEndRef = useRef<() => string | null>(() => null);
  const advanceTurnRef = useRef<() => void>(() => {});
  const advanceAiTurnRef = useRef<(t: TeamName) => void>(() => {});
  const gameModeForTimerRef = useRef<GameMode | null>(null);
  const aiTeamsForTimerRef = useRef<TeamName[]>([]);
  const turnAutoAdvancePendingRef = useRef(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeCount, setMergeCount] = useState(0);
  const [selectedForMerge, setSelectedForMerge] = useState<any>(null);
  const [gameMode, setGameMode] = useState<GameMode | null>(() => INITIAL_SESSION_NAV.gameMode);
  const [multiplayerTeams, setMultiplayerTeams] = useState<TeamName[]>(["Romans", "Barbarians"]);
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>("normal");
  /** Custom scenario only: all factions AI — player does not issue orders. */
  const [customScenarioSpectator, setCustomScenarioSpectator] = useState(false);
  /** Hot-seat two factions (multiplayer) or AI vs AI — shared roster/setup rules. */
  const isDualTeamBattle = gameMode === "multiplayer" || gameMode === "ai-versus";
  const [gridOrientation, setGridOrientation] = useState<GridOrientation>("north");
  const [isBattlefieldFullscreen, setIsBattlefieldFullscreen] = useState(false);
  const battlefieldRef = useRef<HTMLDivElement | null>(null);
  const battlefieldViewportRef = useRef<HTMLDivElement | null>(null);
  const battlefieldGridRef = useRef<HTMLDivElement | null>(null);
  const battlefieldCellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const battlefieldPanCleanupRef = useRef<(() => void) | null>(null);
  const skipNextGridClickRef = useRef(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const battleSfxRef = useRef<ReturnType<typeof createBattleSfxController> | null>(null);
  const attackSfxRef = useRef<ReturnType<typeof createAttackSfxController> | null>(null);
  const troopSelectSfxRef = useRef<ReturnType<typeof createTroopSelectionSfxController> | null>(null);
  const lastTurnCueRef = useRef<string | null>(null);
  const feedbackTimeoutsRef = useRef<number[]>([]);
  const isRestoringSavedGameRef = useRef(false);
  const hasLoadedSavedGameRef = useRef(false);
  const [startScreen, setStartScreen] = useState<"menu" | "options" | "about">(
    () => INITIAL_SESSION_NAV.startScreen
  );
  const [aboutSlideIndex, setAboutSlideIndex] = useState(() => INITIAL_SESSION_NAV.aboutSlideIndex);
  /** False until the first full `localStorage` restore finishes (avoids wrong battle UI before units hydrate). */
  const [sessionRestored, setSessionRestored] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const raw =
        window.localStorage.getItem(GAME_STATE_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_GAME_STATE_STORAGE_KEY);
      return !raw;
    } catch {
      return true;
    }
  });
  const aboutSwipeStartXRef = useRef<number | null>(null);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [gameMenuControlsOpen, setGameMenuControlsOpen] = useState(false);
  const [isInGameOptionsOpen, setIsInGameOptionsOpen] = useState(false);
  const [isInGameMechanicsOpen, setIsInGameMechanicsOpen] = useState(false);
  const [activeMechanicsSlide, setActiveMechanicsSlide] = useState(0);
  const [isInGameGraphicsOpen, setIsInGameGraphicsOpen] = useState(false);
  const [isInGameUnitsOpen, setIsInGameUnitsOpen] = useState(false);
  const [unitsReferenceTeam, setUnitsReferenceTeam] = useState<UnitsReferenceScope>("All");
  const [unitsReferenceQuery, setUnitsReferenceQuery] = useState("");
  const [isBattleLogPanelOpen, setIsBattleLogPanelOpen] = useState(false);
  const [isUnitPanelOpen, setIsUnitPanelOpen] = useState(false);
  const [gameOptions, setGameOptions] = useState<GameOptions>(() => readInitialSessionDefaults().gameOptions);
  const [settingsSaveNotice, setSettingsSaveNotice] = useState<string | null>(null);
  const [isPanningGrid, setIsPanningGrid] = useState(false);
  const [hoverScrollDirection, setHoverScrollDirection] = useState<HoverScrollDirection>(null);
  const [cellFeedback, setCellFeedback] = useState<Record<string, BattleFeedbackKind[]>>({});
  const [projectileFeedback, setProjectileFeedback] = useState<ProjectileFeedback[]>([]);
  const [damagePopups, setDamagePopups] = useState<
    { id: string; x: number; y: number; value: number; kind: "dealt" | "mitigated" }[]
  >([]);
  const [attackPreviewHover, setAttackPreviewHover] = useState<{
    key: string;
    damage: number;
    mitigated: number;
  } | null>(null);
  const turnRef = useRef(turn);
  const timedPlayCommittedMsRef = useRef(timedPlayCommittedMs);
  turnRef.current = turn;
  timedPlayCommittedMsRef.current = timedPlayCommittedMs;

  const commitTurnTimeForTeam = useCallback(
    (outgoingTeam: string) => {
      if (!gameOptions.timedPlayEnabled || timedPlayLoserTeam) return;
      const elapsed = Date.now() - timedPlayTurnStartedAtRef.current;
      setTimedPlayCommittedMs((prev) => {
        if (Object.keys(prev).length === 0) return prev;
        if (prev[outgoingTeam] === undefined) return prev;
        return { ...prev, [outgoingTeam]: Math.max(0, (prev[outgoingTeam] ?? 0) - elapsed) };
      });
      timedPlayTurnStartedAtRef.current = Date.now();
    },
    [gameOptions.timedPlayEnabled, timedPlayLoserTeam]
  );

  /** Must run inside a click/tap handler — browsers block `Audio.play()` from async effects after the gesture ends. */
  const playBackgroundMusicFromUserGesture = useCallback(() => {
    if (!gameOptions.musicEnabled) return;
    const el = backgroundMusicRef.current;
    if (!el) return;
    void el.play().catch(() => {});
  }, [gameOptions.musicEnabled]);

  /** Previous commit’s grid positions — used to scale layout move duration by tiles moved (Manhattan). */
  const unitPreviousGridRef = useRef<Record<string, { x: number; y: number }>>({});
  /** Blocks player actions while an attack animation is playing and results are not yet applied. */
  const battleResolutionPendingRef = useRef(false);
  /** Prevents the AI effect from scheduling a second decision when units update mid–attack animation. */
  const aiAttackAnimatingRef = useRef(false);
  const reduceUiMotion = useReducedMotion();
  const terrainVideoAllowed = gameOptions.terrainTileVideosEnabled && !reduceUiMotion;
  const { overlayRef: dayNightOverlayRef, dayNightClock } = useBattlefieldDayNightOverlay(reduceUiMotion);

  useLayoutEffect(() => {
    const list = isSetupMode ? customUnits : units;
    const next: Record<string, { x: number; y: number }> = {};
    for (const unit of list) {
      if (unit && unit.hp > 0) {
        next[unit.id] = { x: unit.x, y: unit.y };
      }
    }
    unitPreviousGridRef.current = next;
  }, [units, customUnits, isSetupMode]);

  useEffect(() => {
    setMeleeApproachPendingTargetId(null);
  }, [selectedId, turn]);

  useEffect(() => {
    if (!isSetupMode || !draggedTroop) {
      document.body.classList.remove("cc-cursor-setup-deploy");
      return;
    }
    document.body.classList.add("cc-cursor-setup-deploy");
    return () => document.body.classList.remove("cc-cursor-setup-deploy");
  }, [isSetupMode, draggedTroop]);

  useEffect(() => {
    if (isSetupMode) return;
    setupFieldDragUnitIdRef.current = null;
    setSetupFieldDragActive(false);
  }, [isSetupMode]);

  useEffect(() => {
    if (!isGameMenuOpen) setGameMenuControlsOpen(false);
  }, [isGameMenuOpen]);

  const prevStartScreenRef = useRef<typeof startScreen | null>(null);
  useEffect(() => {
    const prev = prevStartScreenRef.current;
    prevStartScreenRef.current = startScreen;
    if (startScreen === "about" && prev !== null && prev !== "about") {
      setAboutSlideIndex(0);
    }
  }, [startScreen]);

  useEffect(() => {
    if (startScreen !== "about") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setAboutSlideIndex((i) => Math.min(ABOUT_SCREEN_SLIDE_LAST, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setAboutSlideIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startScreen]);

  useEffect(() => {
    if (gameStarted) return;
    setTimedPlayCommittedMs({});
    setTimedPlayLoserTeam(null);
    battleOutcomeLoggedRef.current = false;
  }, [gameStarted]);

  useEffect(() => {
    if (!gameOptions.timedPlayEnabled || !gameStarted || isSetupMode || timedPlayLoserTeam) return;
    const id = window.setInterval(() => {
      const now = Date.now();
      setMatchNowMs(now);
      const t = turnRef.current;
      const bank = timedPlayCommittedMsRef.current[t];
      if (bank !== undefined && bank - (now - timedPlayTurnStartedAtRef.current) <= 0) {
        setTimedPlayLoserTeam(t);
        return;
      }
      if (turnAutoAdvancePendingRef.current) return;
      if (battleResolutionPendingRef.current || aiAttackAnimatingRef.current) return;
      if (checkEndRef.current()) return;
      const elapsed = now - turnSliceStartedAtRef.current;
      if (elapsed < TURN_ACTION_BUDGET_MS) return;
      const mode = gameModeForTimerRef.current;
      const team = turnRef.current as TeamName;
      const sideName = String(team);
      turnAutoAdvancePendingRef.current = true;
      setLogRef.current((prev) => [
        `⏱ Move clock (${TURN_ACTION_BUDGET_MS / 1000}s) expired for ${sideName} — advancing.`,
        ...prev
      ]);
      if (mode === "multiplayer") {
        advanceTurnRef.current();
      } else if (aiTeamsForTimerRef.current.includes(team)) {
        advanceAiTurnRef.current(team);
      } else {
        advanceTurnRef.current();
      }
      window.setTimeout(() => {
        turnAutoAdvancePendingRef.current = false;
      }, 500);
    }, 250);
    return () => window.clearInterval(id);
  }, [gameOptions.timedPlayEnabled, gameStarted, isSetupMode, timedPlayLoserTeam]);

  useEffect(() => {
    if (!gameStarted || isSetupMode || !gameOptions.timedPlayEnabled) return;
    turnAutoAdvancePendingRef.current = false;
    turnSliceStartedAtRef.current = Date.now();
  }, [turn, gameStarted, isSetupMode, gameOptions.timedPlayEnabled]);

  // Update units when level changes
  useEffect(() => {
    if (isRestoringSavedGameRef.current) {
      isRestoringSavedGameRef.current = false;
      return;
    }

    if (levels[currentLevel]) {
      const nextPlayerTeam = getValidLevelPlayerTeam(currentLevel, playerTeam);
      setUnits(
        prepareUnitsForBattle(
          levels[currentLevel],
          buildPrepareBattleOptsForGame(
            gameMode,
            currentLevel,
            nextPlayerTeam,
            aiDifficulty,
            multiplayerTeams,
            customScenarioSpectator,
            customUnits
          )
        )
      );
      setSelectedId(null);
      setPlayerTeam(nextPlayerTeam);
      setTurn(nextPlayerTeam);
      setRound(1);
      setLog([]);
      setGameStarted(false);
      setIsSetupMode(false);
      setCustomUnits([]);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
      setGridOrientation("north");
      setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
    }
  }, [currentLevel]);

  useEffect(() => {
    if (!units.length) return;

    const updatedUnits = applyRoleHealthBuffs(units);
    if (didRoleHealthBuffStateChange(units, updatedUnits)) {
      setUnits(updatedUnits);
    }
  }, [units]);

  useEffect(() => {
    if (!customUnits.length) return;

    const updatedUnits = applyRoleHealthBuffs(customUnits);
    if (didRoleHealthBuffStateChange(customUnits, updatedUnits)) {
      setCustomUnits(updatedUnits);
    }
  }, [customUnits]);

  useEffect(() => {
    if (!inspectedUnitId) return;
    if (!getUnitById(inspectedUnitId)) {
      setInspectedUnitId(null);
    }
  }, [inspectedUnitId, units, customUnits, isSetupMode]);

  useEffect(() => {
    setAttackPreviewHover(null);
  }, [selectedId, turn, playerTeam, mergeMode, isSetupMode, gameStarted, timedPlayLoserTeam]);

  useEffect(() => {
    if (!gameOptions.showAttackDamagePreview) setAttackPreviewHover(null);
  }, [gameOptions.showAttackDamagePreview]);

  useEffect(() => {
    if (!gameOptions.showFloatingDamageNumbers) setDamagePopups([]);
  }, [gameOptions.showFloatingDamageNumbers]);

  useEffect(() => {
    if (typeof window === "undefined") {
      hasLoadedSavedGameRef.current = true;
      setSessionRestored(true);
      return;
    }

    try {
      let savedStateRaw = window.localStorage.getItem(GAME_STATE_STORAGE_KEY);
      if (!savedStateRaw) {
        const legacyRaw = window.localStorage.getItem(LEGACY_GAME_STATE_STORAGE_KEY);
        if (legacyRaw) {
          savedStateRaw = legacyRaw;
          try {
            window.localStorage.setItem(GAME_STATE_STORAGE_KEY, legacyRaw);
            window.localStorage.removeItem(LEGACY_GAME_STATE_STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }
      }
      if (!savedStateRaw) {
        hasLoadedSavedGameRef.current = true;
        return;
      }

      const savedState = JSON.parse(savedStateRaw);
      const restoredAiDifficulty = parseAiDifficulty(savedState.aiDifficulty);
      const savedLevel = savedState.currentLevel ?? savedState.currentFormation;
      const mergedOptions = savedState.gameOptions ? { ...DEFAULT_GAME_OPTIONS, ...savedState.gameOptions } : DEFAULT_GAME_OPTIONS;
      const restoredBattlefieldSize = BATTLEFIELD_SIZE_OPTIONS.includes(mergedOptions.battlefieldSize)
        ? mergedOptions.battlefieldSize
        : DEFAULT_GAME_OPTIONS.battlefieldSize;
      const audioPrefs = readGameAudioPrefs();
      const optionsBase = { ...mergedOptions, battlefieldSize: restoredBattlefieldSize };

      if (savedLevel && savedLevel in levels) {
        isRestoringSavedGameRef.current = true;
        setCurrentLevel(savedLevel as keyof typeof levels);
      }

      setUnits(
        Array.isArray(savedState.units)
          ? savedState.units.map(restoreUnitFromStorage).map(applyCivilizationPassive)
          : prepareUnitsForBattle(
              levels["Level1"],
              buildPrepareBattleOptsForGame(null, "Level1", "Romans", restoredAiDifficulty, ["Romans", "Barbarians"], false, [])
            )
      );
      setSelectedId(savedState.selectedId ?? null);
      setTurn(savedState.turn ?? "Romans");
      setLog(Array.isArray(savedState.log) ? savedState.log : []);
      setRound(typeof savedState.round === "number" ? savedState.round : 1);
      setIsSetupMode(Boolean(savedState.isSetupMode));
      setCustomUnits(
        Array.isArray(savedState.customUnits)
          ? savedState.customUnits.map(restoreUnitFromStorage).map(applyCivilizationPassive)
          : []
      );
      setSelectedTeam(savedState.selectedTeam ?? "Romans");
      setPlayerTeam(savedState.playerTeam ?? "Romans");
      setDraggedTroop(null);
      setGameStarted(Boolean(savedState.gameStarted));
      setMergeMode(Boolean(savedState.mergeMode));
      setMergeCount(typeof savedState.mergeCount === "number" ? savedState.mergeCount : 0);
      setSelectedForMerge(savedState.selectedForMerge ? applyCivilizationPassive(restoreUnitFromStorage(savedState.selectedForMerge)) : null);
      const restoredGameMode = (savedState.gameMode ?? null) as GameMode | null;
      setGameMode(restoredGameMode);
      {
        const ss = savedState.startScreen;
        if (ss === "menu" || ss === "options" || ss === "about") {
          setStartScreen(ss);
        }
        const asi = savedState.aboutSlideIndex;
        if (typeof asi === "number" && Number.isFinite(asi) && asi >= 0 && asi <= ABOUT_SCREEN_SLIDE_LAST) {
          setAboutSlideIndex(Math.floor(asi));
        }
      }
      setMultiplayerTeams(normalizeMultiplayerTeams(savedState.multiplayerTeams));
      setAiDifficulty(parseAiDifficulty(savedState.aiDifficulty));
      setCustomScenarioSpectator(
        restoredGameMode === "custom-scenario" ? false : Boolean(savedState.customScenarioSpectator)
      );
      setGridOrientation(GRID_ORIENTATIONS.includes(savedState.gridOrientation) ? savedState.gridOrientation : "north");
      const restoredTerrainPreset: TerrainPreset = ["mixed", "plain", "forest", "hill", "desert"].includes(savedState.terrainPreset)
        ? savedState.terrainPreset
        : "mixed";
      const restoredTerrainGenerationSettings: TerrainGenerationSettings =
        TERRAIN_TYPES.reduce((settings, terrainType) => {
          settings[terrainType] =
            typeof savedState.terrainGenerationSettings?.[terrainType] === "boolean"
              ? savedState.terrainGenerationSettings[terrainType]
              : DEFAULT_TERRAIN_GENERATION_SETTINGS[terrainType];
          return settings;
        }, {} as TerrainGenerationSettings);
      setTerrainPreset(restoredTerrainPreset);
      setTerrainGenerationSettings(restoredTerrainGenerationSettings);
      setGameOptions(
        audioPrefs
          ? { ...optionsBase, musicEnabled: audioPrefs.musicEnabled, sfxEnabled: audioPrefs.sfxEnabled }
          : optionsBase
      );
      if (!audioPrefs) {
        writeGameAudioPrefs({
          musicEnabled: optionsBase.musicEnabled,
          sfxEnabled: optionsBase.sfxEnabled
        });
      }
      setBattlefieldTerrain(
        isValidTerrainMap(savedState.battlefieldTerrain, restoredBattlefieldSize)
          ? savedState.battlefieldTerrain
          : generateTerrainMap(restoredBattlefieldSize, restoredTerrainPreset, restoredTerrainGenerationSettings)
      );

      const effectiveGameOptions = audioPrefs
        ? { ...optionsBase, musicEnabled: audioPrefs.musicEnabled, sfxEnabled: audioPrefs.sfxEnabled }
        : optionsBase;
      if (!effectiveGameOptions.timedPlayEnabled) {
        setTimedPlayCommittedMs({});
        setTimedPlayLoserTeam(null);
      } else if (
        savedState.timedPlayCommittedMs &&
        typeof savedState.timedPlayCommittedMs === "object" &&
        !Array.isArray(savedState.timedPlayCommittedMs)
      ) {
        setTimedPlayCommittedMs(savedState.timedPlayCommittedMs as Record<string, number>);
        setTimedPlayLoserTeam(typeof savedState.timedPlayLoserTeam === "string" ? savedState.timedPlayLoserTeam : null);
      } else {
        setTimedPlayCommittedMs({});
        setTimedPlayLoserTeam(null);
      }
      timedPlayTurnStartedAtRef.current = Date.now();
      battleOutcomeLoggedRef.current = false;
    } catch {
      // Ignore invalid saved state and fall back to a fresh session.
    } finally {
      hasLoadedSavedGameRef.current = true;
      setSessionRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedGameRef.current || typeof window === "undefined") return;

    const savedState = {
      currentLevel,
      units: units.map(stripUnitForStorage),
      selectedId,
      turn,
      log,
      round,
      isSetupMode,
      customUnits: customUnits.map(stripUnitForStorage),
      selectedTeam,
      playerTeam,
      gameStarted,
      mergeMode,
      mergeCount,
      selectedForMerge: stripUnitForStorage(selectedForMerge),
      gameMode,
      startScreen,
      aboutSlideIndex,
      multiplayerTeams,
      aiDifficulty,
      customScenarioSpectator,
      gridOrientation,
      terrainPreset,
      terrainGenerationSettings,
      battlefieldTerrain,
      gameOptions,
      timedPlayCommittedMs,
      timedPlayLoserTeam
    };

    window.localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(savedState));
    writeGameAudioPrefs({
      musicEnabled: gameOptions.musicEnabled,
      sfxEnabled: gameOptions.sfxEnabled
    });
  }, [
    currentLevel,
    units,
    selectedId,
    turn,
    log,
    round,
    isSetupMode,
    customUnits,
    selectedTeam,
    playerTeam,
    gameStarted,
    mergeMode,
    mergeCount,
    selectedForMerge,
    gameMode,
    startScreen,
    aboutSlideIndex,
    multiplayerTeams,
    aiDifficulty,
    customScenarioSpectator,
    gridOrientation,
    terrainPreset,
      terrainGenerationSettings,
      battlefieldTerrain,
      gameOptions,
      timedPlayCommittedMs,
      timedPlayLoserTeam
    ]);

  useEffect(() => {
    const audio = new Audio(BACKGROUND_MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0.35;
    backgroundMusicRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      backgroundMusicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const battle = createBattleSfxController(0.55);
    const attack = createAttackSfxController(0.52);
    const select = createTroopSelectionSfxController(0.52);
    battle.preload();
    attack.preload();
    select.preload();
    battleSfxRef.current = battle;
    attackSfxRef.current = attack;
    troopSelectSfxRef.current = select;

    return () => {
      battle.dispose();
      attack.dispose();
      select.dispose();
      battleSfxRef.current = null;
      attackSfxRef.current = null;
      troopSelectSfxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    if (!gameOptions.musicEnabled) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    void audio.play().catch(() => {
      // Ignore autoplay rejections; the user can start music with the Music toggle (counts as a gesture).
    });
  }, [gameOptions.musicEnabled]);

  /** Browsers often block autoplay until a gesture; keep listening until `play()` actually succeeds. */
  useEffect(() => {
    if (!gameOptions.musicEnabled) return;
    const onGesture = () => {
      const a = backgroundMusicRef.current;
      if (!a || !a.paused) {
        window.removeEventListener("pointerdown", onGesture);
        window.removeEventListener("keydown", onGesture);
        return;
      }
      void a
        .play()
        .then(() => {
          window.removeEventListener("pointerdown", onGesture);
          window.removeEventListener("keydown", onGesture);
        })
        .catch(() => {});
    };
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [gameOptions.musicEnabled]);

  useEffect(() => {
    return () => {
      feedbackTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      feedbackTimeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (gameMode !== "single-player") return;

    const validPlayerTeam = getValidLevelPlayerTeam(currentLevel, playerTeam);
    if (validPlayerTeam === playerTeam) return;

    setPlayerTeam(validPlayerTeam);
    setTurn(validPlayerTeam);
    setSelectedId(null);
  }, [currentLevel, gameMode, playerTeam]);

  useEffect(() => {
    if (
      isSetupMode ||
      gameMode === "multiplayer" ||
      gameMode === "ai-versus" ||
      (gameMode === "custom-scenario" && customScenarioSpectator) ||
      !gameStarted
    )
      return;

    const aliveTeams = getAliveTeams(units);
    if (aliveTeams.length <= 1 || aliveTeams.includes(turn as TeamName)) return;

    commitTurnTimeForTeam(String(turn));

    if (aliveTeams.includes(playerTeam)) {
      setTurn(playerTeam);
      return;
    }

    const nextAiTeam = aliveTeams.find((team) => team !== playerTeam);
    if (nextAiTeam) setTurn(nextAiTeam);
  }, [gameMode, gameStarted, isSetupMode, playerTeam, turn, units, commitTurnTimeForTeam, customScenarioSpectator]);

  /** When a battle begins, always open on the same side (player / custom pick / multiplayer team A), not a leftover AI turn. */
  const prevGameStartedRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevGameStartedRef.current === null) {
      prevGameStartedRef.current = gameStarted;
      return;
    }
    const justOpened = gameStarted && !prevGameStartedRef.current;
    prevGameStartedRef.current = gameStarted;
    if (!justOpened || isSetupMode || !gameMode) return;

    const alive = getAliveTeams(units);
    let correct: TeamName | null = null;
    if (gameMode === "multiplayer" || gameMode === "ai-versus") correct = multiplayerTeams[0];
    else if (gameMode === "single-player") correct = getValidLevelPlayerTeam(currentLevel, playerTeam);
    else if (gameMode === "custom-scenario") {
      if (customScenarioSpectator) {
        const present = new Set(units.filter((u) => u.hp > 0).map((u) => u.team));
        correct = ALL_TEAMS.find((t) => present.has(t)) ?? null;
      } else {
        correct = playerTeam;
      }
    }

    if (!correct || !alive.includes(correct)) return;
    setTurn((t) => (t === correct ? t : correct));
  }, [
    gameStarted,
    isSetupMode,
    gameMode,
    units,
    currentLevel,
    playerTeam,
    multiplayerTeams,
    customScenarioSpectator,
    setTurn
  ]);

  useEffect(() => {
    if (!gameStarted || isSetupMode || !gameMode) {
      lastTurnCueRef.current = null;
      return;
    }

    if (lastTurnCueRef.current === turn) return;
    lastTurnCueRef.current = turn;

    playBattleSfx(getTurnCueForTeam(turn), { cooldownMs: 350, volumeMultiplier: turn === playerTeam ? 1.08 : 0.82 });
  }, [gameMode, gameStarted, isSetupMode, playerTeam, turn]);

  const getUnit = (x: number, y: number) => {
    const currentUnits = isSetupMode ? customUnits : units;
    return currentUnits?.find((u: any) => u.x === x && u.y === y);
  };
  
  const getUnitById = (id: string | null) => {
    const currentUnits = isSetupMode ? customUnits : units;
    return currentUnits?.find((u: any) => u.id === id);
  };
  
  const isWithinBattlefield = (x: number, y: number) => x >= 0 && x < battlefieldSize && y >= 0 && y < battlefieldSize;
  const isInRange = (a: any, b: any, range: number) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= range;
  const registerFeedbackTimeout = (callback: () => void, delayMs: number) => {
    const timeoutId = window.setTimeout(() => {
      feedbackTimeoutsRef.current = feedbackTimeoutsRef.current.filter((trackedId) => trackedId !== timeoutId);
      callback();
    }, delayMs);
    feedbackTimeoutsRef.current.push(timeoutId);
  };
  const triggerCellFeedback = (cellKey: string, kind: BattleFeedbackKind, durationMs: number) => {
    setCellFeedback((prev) => {
      const existingKinds = prev[cellKey] ?? [];
      if (existingKinds.includes(kind)) return prev;
      return {
        ...prev,
        [cellKey]: [...existingKinds, kind]
      };
    });

    registerFeedbackTimeout(() => {
      setCellFeedback((prev) => {
        const nextKinds = (prev[cellKey] ?? []).filter((currentKind) => currentKind !== kind);
        if (nextKinds.length === 0) {
          const { [cellKey]: _removed, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [cellKey]: nextKinds
        };
      });
    }, durationMs);
  };
  const triggerProjectileFeedback = (
    from: TerrainPoint,
    to: TerrainPoint,
    variant: ProjectileFeedback["variant"],
    durationMs = ATTACK_RESOLVE_RANGED_MS
  ) => {
    const gridRect = battlefieldGridRef.current?.getBoundingClientRect();
    const fromRect = battlefieldCellRefs.current[`${from.x},${from.y}`]?.getBoundingClientRect();
    const toRect = battlefieldCellRefs.current[`${to.x},${to.y}`]?.getBoundingClientRect();
    if (!gridRect || !fromRect || !toRect) return;

    const startX = fromRect.left - gridRect.left + fromRect.width / 2;
    const startY = fromRect.top - gridRect.top + fromRect.height / 2;
    const endX = toRect.left - gridRect.left + toRect.width / 2;
    const endY = toRect.top - gridRect.top + toRect.height / 2;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const projectileId = `${variant}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setProjectileFeedback((prev) => [
      ...prev,
      {
        id: projectileId,
        variant,
        startX,
        startY,
        angle: Math.atan2(deltaY, deltaX),
        distance: Math.hypot(deltaX, deltaY)
      }
    ]);

    registerFeedbackTimeout(() => {
      setProjectileFeedback((prev) => prev.filter((projectile) => projectile.id !== projectileId));
    }, durationMs);
  };
  const playBattleSfx = (
    key: BattleSfxKey,
    options?: { cooldownMs?: number; playbackRate?: number; volumeMultiplier?: number }
  ) => {
    if (!gameOptions.sfxEnabled) return;
    battleSfxRef.current?.play(key, options);
  };

  const playTroopSelectSfx = (unit: any) => {
    if (!gameOptions.sfxEnabled) return;
    troopSelectSfxRef.current?.playForUnit(unit, { cooldownMs: 120, volumeMultiplier: 0.92 });
  };

  const playAttackSfx = (
    kind: AttackSfxKind,
    options?: { cooldownMs?: number; playbackRate?: number; volumeMultiplier?: number }
  ) => {
    if (!gameOptions.sfxEnabled) return;
    attackSfxRef.current?.play(kind, options);
  };
  const applyAttackOutcomeFeedback = (defender: any, updatedTargetHp: number, moraleThreshold: number) => {
    const defenderKey = `${defender.x},${defender.y}`;
    if (updatedTargetHp <= 0) {
      triggerCellFeedback(defenderKey, "death", DEATH_CELL_FEEDBACK_MS);
      playBattleSfx("death-fall", { cooldownMs: 100, volumeMultiplier: 1.1 });
      return;
    }
    if (updatedTargetHp <= Math.ceil(defender.maxHp * moraleThreshold)) {
      triggerCellFeedback(defenderKey, "morale", 1350);
      playBattleSfx("morale-break", { cooldownMs: 200, volumeMultiplier: 0.95 });
    }
  };

  /** Red −HP dealt + emerald −blocked under the defender; ranged uses same delay as hit feedback. */
  const showDamagePopupAt = (
    gridX: number,
    gridY: number,
    damageDealt: number,
    mitigated: number,
    delayMs: number
  ) => {
    if (!gameOptions.showFloatingDamageNumbers) return;
    const lifespanMs = reduceUiMotion ? DAMAGE_POPUP_LIFESPAN_REDUCED_MS : DAMAGE_POPUP_LIFESPAN_MS;
    const push = () => {
      const additions: { id: string; x: number; y: number; value: number; kind: "dealt" | "mitigated" }[] = [];
      if (damageDealt > 0) {
        additions.push({
          id: `dmg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          x: gridX,
          y: gridY,
          value: damageDealt,
          kind: "dealt"
        });
      }
      if (mitigated > 0) {
        additions.push({
          id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          x: gridX,
          y: gridY,
          value: mitigated,
          kind: "mitigated"
        });
      }
      if (additions.length === 0) return;
      setDamagePopups((prev) => [...prev, ...additions]);
      additions.forEach((a) => {
        registerFeedbackTimeout(() => {
          setDamagePopups((prev) => prev.filter((p) => p.id !== a.id));
        }, lifespanMs);
      });
    };
    if (delayMs > 0) registerFeedbackTimeout(push, delayMs);
    else push();
  };

  const triggerAttackFeedback = (
    attacker: any,
    defender: any,
    attackOutcome: ReturnType<typeof getAttackDamage>,
    options: {
      attackerPosition?: TerrainPoint | null;
      updatedTargetHp: number;
      isProjectile: boolean;
      moraleThreshold?: number;
      /** When true, HP/log are applied later; skip death & morale here; defer ranged impact flash to projectile arrival. */
      suppressOutcome?: boolean;
    }
  ) => {
    const attackerPoint = options.attackerPosition ?? { x: attacker.x, y: attacker.y };
    const defenderKey = `${defender.x},${defender.y}`;
    const attackerKey = `${attackerPoint.x},${attackerPoint.y}`;
    const moraleThreshold = options.moraleThreshold ?? 0.35;
    const suppressOutcome = options.suppressOutcome ?? false;

    const meleeFightMs = ATTACK_RESOLVE_MELEE_MS;
    if (options.isProjectile) {
      if (suppressOutcome) {
        registerFeedbackTimeout(() => {
          triggerCellFeedback(defenderKey, "hit", HIT_FLASH_MS);
        }, ATTACK_RESOLVE_RANGED_MS);
      } else {
        triggerCellFeedback(defenderKey, "hit", HIT_FLASH_MS);
      }
    } else {
      if (!attackOutcome.abilityTags.includes("Charge")) {
        triggerCellFeedback(attackerKey, "meleeWindup", MELEE_WINDUP_MS);
      }
      triggerCellFeedback(defenderKey, "meleeHit", meleeFightMs);
    }
    if (attackOutcome.abilityTags.includes("Charge")) {
      triggerCellFeedback(attackerKey, "charge", options.isProjectile ? 780 : meleeFightMs);
      playAttackSfx("closecombat", { cooldownMs: 100, volumeMultiplier: 1.12 });
    } else if (options.isProjectile) {
      const siegeStrike = getTroopMechanicType(attacker) === "sieged";
      playAttackSfx(siegeStrike ? "siege" : "ranged", {
        cooldownMs: 60,
        playbackRate: siegeStrike ? 0.9 : 1,
        volumeMultiplier: siegeStrike ? 1.05 : 1
      });
    } else {
      playAttackSfx("closecombat", {
        cooldownMs: 70,
        playbackRate: attackOutcome.hasAdvantage ? 0.96 : 1
      });
    }

    if (options.isProjectile) {
      const projectileVariant = getTroopMechanicType(attacker) === "sieged" ? "siege" : "arrow";
      triggerProjectileFeedback(attackerPoint, { x: defender.x, y: defender.y }, projectileVariant);
      triggerCellFeedback(attackerKey, "ranged", RANGED_ATTACKER_PULSE_MS);
      if (projectileVariant === "siege") {
        registerFeedbackTimeout(() => {
          triggerCellFeedback(defenderKey, "siegeFog", SIEGE_FOG_DURATION_MS);
        }, SIEGE_IMPACT_DELAY_MS);
      }
    } else if (attackOutcome.abilityTags.includes("Charge")) {
      triggerProjectileFeedback(attackerPoint, { x: defender.x, y: defender.y }, "charge", meleeFightMs);
    }

    const damagePopupDelayMs = options.isProjectile && suppressOutcome ? ATTACK_RESOLVE_RANGED_MS : 0;
    if (attackOutcome.damage > 0 || attackOutcome.mitigatedDamage > 0) {
      showDamagePopupAt(defender.x, defender.y, attackOutcome.damage, attackOutcome.mitigatedDamage, damagePopupDelayMs);
    }

    if (suppressOutcome) return;

    if (options.updatedTargetHp <= 0) {
      triggerCellFeedback(defenderKey, "death", DEATH_CELL_FEEDBACK_MS);
      playBattleSfx("death-fall", { cooldownMs: 100, volumeMultiplier: 1.1 });
      return;
    }

    if (options.updatedTargetHp <= Math.ceil(defender.maxHp * moraleThreshold)) {
      triggerCellFeedback(defenderKey, "morale", 1350);
      playBattleSfx("morale-break", { cooldownMs: 200, volumeMultiplier: 0.95 });
    }
  };
  const getRangeForBattle = (unit: any) => (gameOptions.terrainEffectsEnabled ? getEffectiveRange(unit, battlefieldTerrain) : unit.range);
  const getMoveForBattle = (unit: any) =>
    gameOptions.terrainEffectsEnabled ? getEffectiveMove(unit, battlefieldTerrain, { round }) : unit.move;
  const getTileOccupant = (battleUnits: any[], x: number, y: number, ignoredUnitId?: string) =>
    battleUnits.find((candidate) => candidate.id !== ignoredUnitId && candidate.hp > 0 && candidate.x === x && candidate.y === y);
  const getReachableTiles = (unit: any, battleUnits: any[]) => {
    const maxSteps = getMoveForBattle(unit);
    const queue = [{ x: unit.x, y: unit.y, steps: 0 }];
    const visited = new Set<string>([`${unit.x},${unit.y}`]);
    const reachable = [{ x: unit.x, y: unit.y, steps: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || current.steps >= maxSteps) continue;

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      neighbors.forEach((neighbor) => {
        const key = `${neighbor.x},${neighbor.y}`;
        if (visited.has(key) || !isWithinBattlefield(neighbor.x, neighbor.y)) return;
        if (getTileOccupant(battleUnits, neighbor.x, neighbor.y, unit.id)) return;

        visited.add(key);
        const nextNode = { ...neighbor, steps: current.steps + 1 };
        reachable.push(nextNode);
        queue.push(nextNode);
      });
    }

    return reachable;
  };

  /** Empty cardinals next to target that the attacker can step onto this turn (sorted: closest to attacker first). */
  const getMeleeApproachTiles = (attacker: any, target: any, battleUnits: any[], effectiveRange: number) => {
    if (!attacker || !target || effectiveRange !== 1) return [];

    const reachableKeys = new Set(
      getReachableTiles(attacker, battleUnits).map((t) => `${t.x},${t.y}`)
    );

    return [
      { x: target.x + 1, y: target.y },
      { x: target.x - 1, y: target.y },
      { x: target.x, y: target.y + 1 },
      { x: target.x, y: target.y - 1 }
    ]
      .filter(({ x, y }) => isWithinBattlefield(x, y))
      .filter(({ x, y }) => !getUnit(x, y))
      .filter(({ x, y }) => reachableKeys.has(`${x},${y}`))
      .sort((a, b) => {
        const distanceA = Math.abs(attacker.x - a.x) + Math.abs(attacker.y - a.y);
        const distanceB = Math.abs(attacker.x - b.x) + Math.abs(attacker.y - b.y);
        return distanceA - distanceB;
      });
  };

  /** AI and single-option melee: closest approach tile. */
  const getCloseCombatAttackDestination = (attacker: any, target: any, battleUnits: any[] = units) => {
    const er = getRangeForBattle(attacker);
    return getMeleeApproachTiles(attacker, target, battleUnits, er)[0] ?? null;
  };

  const getAiFormationRole = (unit: any) => {
    if (isLeaderRole(unit?.role)) return "leader";
    const troopType = getTroopMechanicType(unit);
    if (troopType === "mounted") return "flank";
    if (troopType === "ranged" || troopType === "sieged") return "support";
    return "frontline";
  };
  const getEnemyCentroid = (battleUnits: any[]) => {
    if (battleUnits.length === 0) return { x: battlefieldSize / 2, y: battlefieldSize / 2 };
    const totals = battleUnits.reduce(
      (acc, unit) => ({ x: acc.x + unit.x, y: acc.y + unit.y }),
      { x: 0, y: 0 }
    );
    return {
      x: totals.x / battleUnits.length,
      y: totals.y / battleUnits.length
    };
  };
  const getNearestDistanceToEnemies = (position: { x: number; y: number }, enemyUnits: any[]) =>
    enemyUnits.reduce((best, enemyUnit) => Math.min(best, Math.abs(enemyUnit.x - position.x) + Math.abs(enemyUnit.y - position.y)), Infinity);
  const getAiPressureDistance = (unit: any) => {
    const range = getRangeForBattle(unit);
    if (range <= 1) return getMoveForBattle(unit) + 1;
    return range + 1;
  };
  const getAdjacentFriendlyCountAt = (unit: any, position: { x: number; y: number }, battleUnits: any[]) =>
    battleUnits.filter((candidate) => {
      if (!candidate || candidate.id === unit.id || candidate.team !== unit.team || candidate.hp <= 0) return false;
      return Math.abs(candidate.x - position.x) + Math.abs(candidate.y - position.y) === 1;
    }).length;
  const getEnemyThreatOnTile = (position: { x: number; y: number }, enemyUnits: any[]) =>
    enemyUnits.reduce((threat, enemyUnit) => {
      const enemyRange = getRangeForBattle(enemyUnit);
      const distance = Math.abs(enemyUnit.x - position.x) + Math.abs(enemyUnit.y - position.y);
      if (distance <= enemyRange) return threat + 2;
      if (enemyRange === 1 && distance <= getMoveForBattle(enemyUnit) + 1) return threat + 1;
      return threat;
    }, 0);
  const getAiTargetCandidates = (unit: any, enemyUnits: any[], battleUnits: any[]) =>
    enemyUnits
      .map((enemyUnit) => {
      const distance = Math.abs(enemyUnit.x - unit.x) + Math.abs(enemyUnit.y - unit.y);
      const enemyType = getTroopMechanicType(enemyUnit);
      const friendlySupportNearby = battleUnits.some((candidate) => {
        if (!candidate || candidate.team !== unit.team || candidate.hp <= 0) return false;
        const troopType = getTroopMechanicType(candidate);
        if (troopType !== "ranged" && troopType !== "sieged") return false;
        return Math.abs(candidate.x - enemyUnit.x) + Math.abs(candidate.y - enemyUnit.y) <= 2;
      });

      let score = 150 - distance * 4;
      score += Math.round((1 - (enemyUnit.hp / Math.max(1, enemyUnit.maxHp))) * 70);
      if (enemyUnit.hp <= Math.ceil(enemyUnit.maxHp * 0.4)) score += 24;
      if (isLeaderRole(enemyUnit.role)) score += 24;
      if (enemyType === "ranged" || enemyType === "sieged") score += 24;
      if (distance <= getAiPressureDistance(unit)) score += 20;
      if (distance <= 3) score += 12;
      if (friendlySupportNearby && (enemyType === "mounted" || enemyUnit.attack >= 150)) score += 20;
      if (getTroopMechanicType(unit) === "mounted" && (enemyType === "ranged" || enemyType === "sieged")) score += 32;
      if (getTroopMechanicType(unit) === "closecombat" && enemyType === "ranged") score += 16;
      if (getAiFormationRole(unit) === "leader" && distance <= 2) score -= 28;

      return { target: enemyUnit, score, distance };
    })
      .sort((candidateA, candidateB) => {
        if (candidateB.score !== candidateA.score) return candidateB.score - candidateA.score;
        return candidateA.distance - candidateB.distance;
      });
  const getFallbackAiAction = (currentTeam: TeamName, battleUnits: any[]) => {
    const aiUnits = battleUnits.filter((unit) => unit.team === currentTeam && unit.hp > 0);
    const enemyUnits = battleUnits.filter((unit) => unit.team !== currentTeam && unit.hp > 0);
    if (aiUnits.length === 0 || enemyUnits.length === 0) return null;

    let chosenUnit = aiUnits[0] ?? null;
    let chosenTarget = enemyUnits[0] ?? null;
    let closestDistance = Infinity;

    aiUnits.forEach((unit) => {
      enemyUnits.forEach((enemyUnit) => {
        const distance = Math.abs(unit.x - enemyUnit.x) + Math.abs(unit.y - enemyUnit.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          chosenUnit = unit;
          chosenTarget = enemyUnit;
        }
      });
    });

    if (!chosenUnit || !chosenTarget) return null;

    const effectiveRange = getRangeForBattle(chosenUnit);
    if (isInRange(chosenUnit, chosenTarget, effectiveRange)) {
      return {
        type: "attack",
        score: 0,
        unitId: chosenUnit.id,
        targetId: chosenTarget.id,
        moveTo: null,
        reason: "pressed the nearest target"
      };
    }

    const closeCombatDestination = effectiveRange === 1 ? getCloseCombatAttackDestination(chosenUnit, chosenTarget) : null;
    if (closeCombatDestination) {
      return {
        type: "attack",
        score: 0,
        unitId: chosenUnit.id,
        targetId: chosenTarget.id,
        moveTo: closeCombatDestination,
        reason: "forced a close attack"
      };
    }

    const fallbackTile = getReachableTiles(chosenUnit, battleUnits)
      .filter((tile) => tile.x !== chosenUnit.x || tile.y !== chosenUnit.y)
      .sort((tileA, tileB) => {
        const distanceA = Math.abs(tileA.x - chosenTarget.x) + Math.abs(tileA.y - chosenTarget.y);
        const distanceB = Math.abs(tileB.x - chosenTarget.x) + Math.abs(tileB.y - chosenTarget.y);
        if (distanceA !== distanceB) return distanceA - distanceB;

        const terrainA = getTerrainModifiers({ ...chosenUnit, x: tileA.x, y: tileA.y }, getTerrainAt(battlefieldTerrain, tileA.x, tileA.y));
        const terrainB = getTerrainModifiers({ ...chosenUnit, x: tileB.x, y: tileB.y }, getTerrainAt(battlefieldTerrain, tileB.x, tileB.y));
        return (terrainB.attackMultiplier + terrainB.moveDelta * 0.1) - (terrainA.attackMultiplier + terrainA.moveDelta * 0.1);
      })[0];

    if (!fallbackTile) return null;

    return {
      type: "move",
      score: 0,
      unitId: chosenUnit.id,
      targetId: chosenTarget.id,
      moveTo: { x: fallbackTile.x, y: fallbackTile.y },
      reason: "advanced on the nearest target"
    };
  };
  const decideAiAction = (currentTeam: TeamName, battleUnits: any[]) => {
    const aiProf = getAiDifficultyProfile(aiDifficulty);
    const aiUnits = battleUnits.filter((unit) => unit.team === currentTeam && unit.hp > 0);
    const enemyUnits = battleUnits.filter((unit) => unit.team !== currentTeam && unit.hp > 0);
    if (aiUnits.length === 0 || enemyUnits.length === 0) return null;

    const enemyCentroid = getEnemyCentroid(enemyUnits);
    let bestDecision: any = null;

    aiUnits.forEach((unit) => {
      const targetCandidates = getAiTargetCandidates(unit, enemyUnits, battleUnits).slice(
        0,
        Math.min(aiProf.targetCandidateLimit, enemyUnits.length)
      );
      if (targetCandidates.length === 0) return;

      const reachableTilesRaw = getReachableTiles(unit, battleUnits);
      const reachableTiles =
        reachableTilesRaw.length > aiProf.reachableTileCap
          ? reachableTilesRaw.slice(0, aiProf.reachableTileCap)
          : reachableTilesRaw;

      targetCandidates.forEach(({ target, score: targetPriority }) => {
        const effectiveRange = getRangeForBattle(unit);
        const canAttackAtRange = isInRange(unit, target, effectiveRange);
        const closeCombatDestination = effectiveRange === 1 && !canAttackAtRange
          ? getCloseCombatAttackDestination(unit, target)
          : null;

        if (canAttackAtRange || closeCombatDestination) {
          const simulatedAttacker = closeCombatDestination ? { ...unit, ...closeCombatDestination } : unit;
          const attackOutcome = getAttackDamage(simulatedAttacker, target, battleUnits, terrainEffectMap, {
            round,
            attackerMovedThisTurn: Boolean(closeCombatDestination)
          });
          let attackScore = targetPriority + attackOutcome.damage / 3;
          if (attackOutcome.damage >= target.hp) attackScore += aiProf.lethalAttackBonus;
          if (attackOutcome.hasAdvantage) attackScore += 28;
          if (attackOutcome.abilityTags.length > 0) attackScore += attackOutcome.abilityTags.length * 10;
          if (closeCombatDestination) attackScore += 26;
          if (isLeaderRole(target.role)) attackScore += 20;

          if (!bestDecision || attackScore > bestDecision.score) {
            bestDecision = {
              type: "attack",
              score: attackScore,
              unitId: unit.id,
              targetId: target.id,
              moveTo: closeCombatDestination,
              reason: closeCombatDestination ? "closed in for a melee strike" : "pressed an attack window"
            };
          }
        }

        reachableTiles.forEach((tile) => {
          if (tile.x === unit.x && tile.y === unit.y) return;

          const simulatedUnit = { ...unit, x: tile.x, y: tile.y };
          const tileTerrain = getTerrainAt(battlefieldTerrain, tile.x, tile.y);
          const tileModifiers = getTerrainModifiers(simulatedUnit, tileTerrain);
          const currentTargetDistance = Math.abs(unit.x - target.x) + Math.abs(unit.y - target.y);
          const targetDistance = Math.abs(tile.x - target.x) + Math.abs(tile.y - target.y);
          const currentNearestEnemyDistance = getNearestDistanceToEnemies(unit, enemyUnits);
          const nearestEnemyDistance = getNearestDistanceToEnemies(tile, enemyUnits);
          const adjacentFriendlyCount = getAdjacentFriendlyCountAt(unit, tile, battleUnits);
          const threat = getEnemyThreatOnTile(tile, enemyUnits);
          const flankOffset = Math.abs(tile.x - enemyCentroid.x);
          const pressureDistance = getAiPressureDistance(simulatedUnit);
          const closesDistance = currentTargetDistance - targetDistance;
          const createsAttackPressure = targetDistance <= pressureDistance;
          const pressuresEnemyLine = nearestEnemyDistance <= pressureDistance;
          const nearbyEnemyCount = enemyUnits.filter((enemyUnit) => Math.abs(enemyUnit.x - tile.x) + Math.abs(enemyUnit.y - tile.y) <= pressureDistance).length;
          const role = getAiFormationRole(unit);
          let moveScore = targetPriority * 0.2;
          moveScore += (tileModifiers.attackMultiplier - 1) * 90;
          moveScore += tileModifiers.moveDelta * 8;
          moveScore += closesDistance * 32;
          moveScore += (currentNearestEnemyDistance - nearestEnemyDistance) * 14;
          moveScore += nearbyEnemyCount * 6;
          if (createsAttackPressure) moveScore += role === "support" ? 24 : 44;
          if (pressuresEnemyLine && role !== "leader") moveScore += 18;

          if (role === "frontline") {
            moveScore += 58 - targetDistance * 9;
            moveScore += adjacentFriendlyCount * 8;
            if (nearestEnemyDistance <= 2) moveScore += 18;
            if (tileTerrain === "forest" || tileTerrain === "hill") moveScore += 14;
          } else if (role === "support") {
            const desiredDistance = Math.min(Math.max(2, getRangeForBattle(simulatedUnit) - 1), 3);
            moveScore += 42 - Math.abs(targetDistance - desiredDistance) * 9;
            moveScore += adjacentFriendlyCount * 6;
            if (tileTerrain === "hill") moveScore += 28;
            if (tileTerrain === "forest") moveScore += 10;
            moveScore -= threat * 8;
          } else if (role === "flank") {
            moveScore += 52 - targetDistance * 8;
            moveScore += flankOffset * 7;
            if (tileTerrain === "plain") moveScore += 24;
            if (tileTerrain === "forest" || tileTerrain === "river") moveScore -= 18;
            moveScore -= Math.max(0, adjacentFriendlyCount - 1) * 6;
          } else if (role === "leader") {
            moveScore += 34 - Math.abs(targetDistance - 2) * 9;
            moveScore += adjacentFriendlyCount * 8;
            moveScore -= threat * 14;
            if (nearestEnemyDistance <= 1) moveScore -= 40;
          }

          if (targetDistance >= currentTargetDistance && role !== "leader") {
            moveScore -= 42;
          }

          if (closesDistance <= 0 && role !== "leader") {
            moveScore -= 18;
          }

          if (!bestDecision || moveScore > bestDecision.score) {
            bestDecision = {
              type: "move",
              score: moveScore,
              unitId: unit.id,
              moveTo: { x: tile.x, y: tile.y },
              targetId: target.id,
              reason:
                role === "support"
                  ? "repositioned to support the line"
                  : role === "flank"
                    ? "shifted toward the flank"
                    : role === "leader"
                      ? "tightened the command position"
                      : "advanced to pressure the enemy line"
            };
          }
        });
      });
    });

    return bestDecision ?? getFallbackAiAction(currentTeam, battleUnits);
  };
  const buildAttackLogLine = (
    attacker: any,
    defender: any,
    attackOutcome: ReturnType<typeof getAttackDamage>,
    options: { closedIn?: boolean; remainingAmmo?: number } = {}
  ) => {
    const tags = [
      attackOutcome.hasTerrainModifier ? attackOutcome.terrainLabel : null,
      attackOutcome.hasLeaderAura ? "Leader Aura" : null,
      attackOutcome.hasAdvantage ? `${TROOP_MECHANIC_LABELS[attackOutcome.attackerType]} > ${TROOP_MECHANIC_LABELS[attackOutcome.defenderType]}` : null,
      ...(attackOutcome.abilityTags ?? [])
    ].filter(Boolean);

    return `${attacker.name} (${attacker.team})${options.closedIn ? " closed in and" : ""} attacked ${defender.name} (${defender.team}) for ${attackOutcome.damage}${
      tags.length > 0 ? ` [${tags.join(" | ")}]` : ""
    }${typeof options.remainingAmmo === "number" ? ` (${options.remainingAmmo} shots remaining)` : ""}`;
  };
  const selected = getUnitById(selectedId);
  const inspectedUnit = getUnitById(inspectedUnitId);
  const currentBattleUnits = isSetupMode ? customUnits : units;
  const battlefieldSize = gameOptions.battlefieldSize;
  const timedPlayTeamKeys = useMemo(
    () => Object.keys(timedPlayCommittedMs).sort(),
    [timedPlayCommittedMs]
  );
  const turnActionRemainingMs =
    gameStarted && !isSetupMode && !timedPlayLoserTeam && gameOptions.timedPlayEnabled
      ? Math.max(0, TURN_ACTION_BUDGET_MS - (matchNowMs - turnSliceStartedAtRef.current))
      : 0;
  const turnActionSecsLeft = Math.max(0, Math.ceil(turnActionRemainingMs / 1000));
  const visibleBattleLog = Array.isArray(log) ? log.slice(0, 80) : [];
  const terrainEffectMap = useMemo(
    () => (gameOptions.terrainEffectsEnabled ? battlefieldTerrain : EMPTY_TERRAIN_EFFECT_MAP),
    [gameOptions.terrainEffectsEnabled, battlefieldTerrain]
  );
  const inspectedTerrainType = inspectedUnit ? getTerrainAt(battlefieldTerrain, inspectedUnit.x, inspectedUnit.y) : null;
  const inspectedTileTerrainType = inspectedTile ? getTerrainAt(battlefieldTerrain, inspectedTile.x, inspectedTile.y) : null;
  const inspectedTileInfo = inspectedTileTerrainType
    ? TERRAIN_MECHANICS_INFO.find((terrainInfo) => terrainInfo.terrain === inspectedTileTerrainType) ?? null
    : null;
  const inspectedEffectiveAttack = inspectedUnit
    ? getDisplayedAttack(inspectedUnit, currentBattleUnits, terrainEffectMap, { round })
    : 0;
  const inspectedEffectiveRange = inspectedUnit
    ? (gameOptions.terrainEffectsEnabled ? getEffectiveRange(inspectedUnit, battlefieldTerrain) : inspectedUnit.range)
    : 0;
  const inspectedUnitAbilities = inspectedUnit ? getTroopAbilities(inspectedUnit.role) : [];
  const inspectedWeightDisplay = inspectedUnit ? getTroopWeightDisplay(inspectedUnit) : null;
  const selectedEffectiveMove = selected
    ? gameOptions.terrainEffectsEnabled
      ? getEffectiveMove(selected, battlefieldTerrain, { round })
      : selected.move
    : 0;
  const selectedEffectiveRange = selected ? getRangeForBattle(selected) : 0;
  const inspectedEffectNotes = inspectedUnit
    ? getUnitEffectNotes(inspectedUnit, currentBattleUnits, battlefieldTerrain, gameOptions.terrainEffectsEnabled, {
        round
      })
    : [];
  const focusedBattleUnit = inspectedUnit ?? selected ?? null;
  const focusedUnitAbilities = focusedBattleUnit ? getTroopAbilities(focusedBattleUnit.role) : [];
  const focusedTroopTypeDisplay = focusedBattleUnit ? getTroopTypeDisplay(focusedBattleUnit) : null;
  const focusedWeightDisplay = focusedBattleUnit ? getTroopWeightDisplay(focusedBattleUnit) : null;
  const focusedTerrainType = focusedBattleUnit ? getTerrainAt(battlefieldTerrain, focusedBattleUnit.x, focusedBattleUnit.y) : null;
  const focusedEffectNotes = focusedBattleUnit
    ? getUnitEffectNotes(focusedBattleUnit, currentBattleUnits, battlefieldTerrain, gameOptions.terrainEffectsEnabled, {
        round
      })
    : [];
  const focusedFeedbackKinds = focusedBattleUnit ? (cellFeedback[`${focusedBattleUnit.x},${focusedBattleUnit.y}`] ?? []) : [];
  const useEightByEightViewport = !isBattlefieldFullscreen;
  /** Normal window: pan + edge rails from 14×14 up. Fullscreen: from 9×9 (map still fits the big surface). */
  const needsBattlefieldScrollChrome = isBattlefieldFullscreen ? battlefieldSize > 8 : battlefieldSize >= 14;
  const showGridNavigation = needsBattlefieldScrollChrome;
  /** Fullscreen: bounded shell + scroll viewport when chrome is active. */
  const useFullscreenBoundedBattlefield = isBattlefieldFullscreen && needsBattlefieldScrollChrome;
  const levelTeams = getLevelTeams(currentLevel);
  const aliveBattleTeams = useMemo(() => getAliveTeams(units), [units]);
  const aiTeams = useMemo(() => {
    if (gameMode === "ai-versus") {
      return multiplayerTeams.filter((t) => aliveBattleTeams.includes(t)) as TeamName[];
    }
    if (gameMode === "custom-scenario" && customScenarioSpectator) {
      return ALL_TEAMS.filter((t) => aliveBattleTeams.includes(t)) as TeamName[];
    }
    return aliveBattleTeams.filter((team) => team !== playerTeam) as TeamName[];
  }, [aliveBattleTeams, playerTeam, gameMode, multiplayerTeams, customScenarioSpectator]);
  const activeTeam =
    isDualTeamBattle || (gameMode === "custom-scenario" && customScenarioSpectator) ? turn : playerTeam;
  const setupTeamsInPlay = (() => {
    if (isDualTeamBattle) return multiplayerTeams;
    if (gameMode === "single-player") return levelTeams;

    const customScenarioTeams = getAliveTeams(customUnits);
    return customScenarioTeams.length > 0 ? customScenarioTeams : [playerTeam];
  })();
  const passiveTeams = (isSetupMode ? setupTeamsInPlay : aliveBattleTeams).filter((team, index, arr) => arr.indexOf(team) === index);
  const setupTeams: TeamName[] = isDualTeamBattle ? [...multiplayerTeams] : [...ALL_TEAMS];
  const iconActionButtonClass = "battle-button flex h-10 w-10 items-center justify-center p-0 text-lg font-semibold";
  const troopReferenceStats = useMemo(() => {
    const references: Record<string, TroopReferenceStats> = {};

    Object.values(AVAILABLE_TROOPS).flat().forEach((troop) => {
      if (!references[troop.role]) {
        references[troop.role] = getTroopReferenceStats(troop.role);
      }
    });

    return references;
  }, []);
  const allReferenceTroops = useMemo(() => (
    ALL_TEAMS.flatMap((team) =>
      AVAILABLE_TROOPS[team].map((troop) => {
        const referenceStats = troopReferenceStats[troop.role];
        const troopTypeDisplay = getTroopTypeDisplay({
          role: troop.role,
          name: troop.name,
          ammo: referenceStats.ammo,
          range: referenceStats.range,
          move: referenceStats.move
        });

        return {
          ...troop,
          team,
          referenceStats,
          troopTypeDisplay,
          searchKeywords: getTroopSearchKeywords(
            {
              role: troop.role,
              name: troop.name,
              ammo: referenceStats.ammo,
              range: referenceStats.range,
              move: referenceStats.move
            },
            team
          )
        };
      })
    )
  ), [troopReferenceStats]);
  const isTeamAllowedInSetup = (team: TeamName) => setupTeams.includes(team);

  const checkEnd = () => {
    const currentUnits = isSetupMode ? customUnits : units;
    if (!currentUnits || currentUnits.length === 0) return null;

    if (timedPlayLoserTeam) {
      return resolveTimedForfeitMessage(units, timedPlayLoserTeam, gameMode, multiplayerTeams);
    }

    if (gameMode === "multiplayer" || gameMode === "ai-versus") {
      const aliveInMatch = multiplayerTeams.filter((team) =>
        currentUnits.some((u: any) => u.team === team && u.hp > 0)
      );
      if (aliveInMatch.length === 0) return "Draw — all factions in this match eliminated.";
      if (aliveInMatch.length === 1) return `Winner: ${aliveInMatch[0]}`;
      return null;
    }

    const teamsStillAlive = ALL_TEAMS.filter((team) => currentUnits.some((u: any) => u.team === team && u.hp > 0));

    if (teamsStillAlive.length === 0) return "Draw — all teams eliminated.";
    if (teamsStillAlive.length === 1) return `Winner: ${teamsStillAlive[0]}`;

    return null;
  };

  useEffect(() => {
    if (!gameStarted || isSetupMode) return;
    const outcome = checkEnd();
    if (!outcome) return;
    if (battleOutcomeLoggedRef.current) return;
    battleOutcomeLoggedRef.current = true;
    setLog((prev) => [outcome, ...prev]);
  }, [gameStarted, isSetupMode, units, customUnits, timedPlayLoserTeam, gameMode, multiplayerTeams]);

  const initTimedPlayFromUnitList = (battleUnits: { team: string; hp: number }[]) => {
    if (!gameOptions.timedPlayEnabled) {
      setTimedPlayCommittedMs({});
      setTimedPlayLoserTeam(null);
      return;
    }
    const budget = getPerTeamTimeBudgetMs(gameOptions.battlefieldSize);
    const teams = getTeamsWithLivingUnits(battleUnits);
    setTimedPlayCommittedMs(Object.fromEntries(teams.map((team) => [team, budget])));
    setTimedPlayLoserTeam(null);
    timedPlayTurnStartedAtRef.current = Date.now();
  };

  /** Full session reset when gameplay rules change (difficulty, spectator, match type, etc.). */
  const restartSessionForGameplaySettings = useCallback(
    (overrides?: {
      aiDifficulty?: AiDifficulty;
      customScenarioSpectator?: boolean;
      gameMode?: GameMode;
      playerTeam?: TeamName;
      /** Use when `customUnits` state has not flushed yet (e.g. faction count changed). */
      customUnitsForReroll?: any[];
    }) => {
      const mode = overrides?.gameMode ?? gameMode;
      if (!mode) return;

      const aiD = overrides?.aiDifficulty ?? aiDifficulty;
      const spec = overrides?.customScenarioSpectator ?? customScenarioSpectator;
      const pt = overrides?.playerTeam ?? playerTeam;
      const cu = overrides?.customUnitsForReroll ?? customUnits;

      setTimedPlayCommittedMs({});
      setTimedPlayLoserTeam(null);
      timedPlayTurnStartedAtRef.current = Date.now();
      battleOutcomeLoggedRef.current = false;
      setSelectedId(null);
      setInspectedUnitId(null);
      setInspectedTile(null);
      setMeleeApproachPendingTargetId(null);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
      setDraggedTroop(null);
      setGameStarted(false);
      setRound(1);
      setGridOrientation("north");

      if (mode === "single-player") {
        const nextPlayerTeam = getValidLevelPlayerTeam(currentLevel, pt);
        setUnits(
          prepareUnitsForBattle(
            levels[currentLevel],
            buildPrepareBattleOptsForGame("single-player", currentLevel, nextPlayerTeam, aiD, multiplayerTeams, false, [])
          )
        );
        setPlayerTeam(nextPlayerTeam);
        setTurn(nextPlayerTeam);
        setLog([]);
        setIsSetupMode(false);
        setCustomUnits([]);
        setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
        return;
      }

      if (mode === "custom-scenario") {
        setPlayerTeam(pt);
        setUnits(
          prepareUnitsForBattle(
            levels[currentLevel],
            buildPrepareBattleOptsForGame("custom-scenario", currentLevel, pt, aiD, multiplayerTeams, spec, [])
          )
        );
        setCustomUnits([]);
        setIsSetupMode(true);
        setTurn(pt);
        setSelectedTeam(pt);
        setLog([]);
        setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
        return;
      }

      if (mode === "multiplayer" || mode === "ai-versus") {
        const opts =
          mode === "ai-versus"
            ? buildPrepareBattleOptsForGame("ai-versus", currentLevel, playerTeam, aiD, multiplayerTeams, false, cu)
            : undefined;
        setUnits(rerollUnits(levels[currentLevel], opts));
        setCustomUnits(rerollUnits(cu, opts));
        setIsSetupMode(true);
        setTurn(multiplayerTeams[0]);
        setSelectedTeam(multiplayerTeams[0]);
        setLog([
          mode === "ai-versus"
            ? `AI vs AI: assign ${multiplayerTeams.length} factions and deploy (max 16 per faction, ${SETUP_ARMY_TOKEN_BUDGET} army tokens each), then start. Fully automated — you watch only. Difficulty: ${AI_DIFFICULTY_LABELS[aiD]}.`
            : `Multiplayer setup: pick factions (${multiplayerTeams.length} in this match), place troops (max 16 per faction, ${SETUP_ARMY_TOKEN_BUDGET} army tokens each), then start.`
        ]);
        setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
      }
    },
    [
      gameMode,
      aiDifficulty,
      customScenarioSpectator,
      playerTeam,
      currentLevel,
      multiplayerTeams,
      customUnits,
      gameOptions.battlefieldSize,
      terrainPreset,
      terrainGenerationSettings
    ]
  );

  const advanceAiTurn = (currentTeam: TeamName) => {
    if (timedPlayLoserTeam) return;
    commitTurnTimeForTeam(String(currentTeam));
    if ((gameMode === "ai-versus" || (gameMode === "custom-scenario" && customScenarioSpectator)) && aiTeams.length > 0) {
      const idx = aiTeams.indexOf(currentTeam);
      if (idx >= 0) {
        const next = aiTeams[(idx + 1) % aiTeams.length];
        if (next === aiTeams[0]) setRound((r) => r + 1);
        setTurn(next);
      }
      return;
    }
    const nextAiIndex = aiTeams.indexOf(currentTeam);
    if (nextAiIndex >= 0 && nextAiIndex < aiTeams.length - 1) {
      setTurn(aiTeams[nextAiIndex + 1]);
      return;
    }

    setTurn(playerTeam);
    setRound((r) => r + 1);
  };

  const advanceTurn = () => {
    if (timedPlayLoserTeam) return;
    commitTurnTimeForTeam(String(turn));
    if (gameMode === "multiplayer" || gameMode === "ai-versus") {
      const teams = multiplayerTeams;
      if (teams.length === 0) return;
      const idx = teams.indexOf(turn as TeamName);
      const i = idx >= 0 ? idx : 0;
      const nextIdx = (i + 1) % teams.length;
      if (nextIdx === 0) setRound((r) => r + 1);
      setTurn(teams[nextIdx]);
      return;
    }

    if (gameMode === "custom-scenario" && customScenarioSpectator && units) {
      const present = new Set(units.filter((u) => u.hp > 0).map((u) => u.team));
      const teams = ALL_TEAMS.filter((t) => present.has(t));
      if (teams.length === 0) return;
      const idx = teams.indexOf(turn as TeamName);
      const i = idx >= 0 ? idx : 0;
      const nextIdx = (i + 1) % teams.length;
      if (nextIdx === 0) setRound((r) => r + 1);
      setTurn(teams[nextIdx]);
      return;
    }

    setTurn(aiTeams[0] ?? playerTeam);
  };

  checkEndRef.current = checkEnd;
  advanceTurnRef.current = advanceTurn;
  advanceAiTurnRef.current = advanceAiTurn;
  gameModeForTimerRef.current = gameMode;
  aiTeamsForTimerRef.current = aiTeams;

  // Automatic movement for AI teams - one unit at a time
  useEffect(() => {
    if (
      !gameStarted ||
      isSetupMode ||
      timedPlayLoserTeam ||
      gameMode === "multiplayer" ||
      !aiTeams.includes(turn as TeamName) ||
      !units
    ) {
      return;
    }
    if (aiAttackAnimatingRef.current) return;

    const timeout = setTimeout(() => {
      const currentTeam = turn;
      const aiDecision = decideAiAction(currentTeam as TeamName, units);

      if (!aiDecision) {
        advanceAiTurn(currentTeam as TeamName);
        return;
      }

      if (aiDecision.type === "attack") {
        const actingUnit = units.find((unit: any) => unit.id === aiDecision.unitId);
        const targetUnit = units.find((unit: any) => unit.id === aiDecision.targetId);

        if (!actingUnit || !targetUnit) {
          advanceAiTurn(currentTeam as TeamName);
          return;
        }

        const movedAttacker = aiDecision.moveTo ? { ...actingUnit, ...aiDecision.moveTo } : actingUnit;
        const attackOutcome = getAttackDamage(movedAttacker, targetUnit, units, terrainEffectMap, {
          round,
          attackerMovedThisTurn: Boolean(aiDecision.moveTo)
        });
        const remainingAmmo = actingUnit.ammo && actingUnit.ammo > 0 ? actingUnit.ammo - 1 : actingUnit.ammo;
        const updatedTargetHp = targetUnit.hp - attackOutcome.damage;
        const runsOutOfAmmo = Boolean(actingUnit.ammo && actingUnit.ammo > 0 && remainingAmmo === 0);
        const usedProjectileAttack = Boolean(actingUnit.ammo && actingUnit.ammo > 0);
        const resolveDelayMs = getAttackResolutionDelayMs(usedProjectileAttack);

        aiAttackAnimatingRef.current = true;
        setUnits((prev) =>
          prev.map((unit: any) => {
            if (unit.id === actingUnit.id) {
              return {
                ...unit,
                ...(aiDecision.moveTo ?? {}),
                ammo: remainingAmmo,
                range: runsOutOfAmmo ? 1 : unit.range
              };
            }
            return unit;
          })
        );

        if (aiDecision.moveTo) {
          triggerCellFeedback(`${aiDecision.moveTo.x},${aiDecision.moveTo.y}`, "move", 2000);
        }

        triggerAttackFeedback(movedAttacker, targetUnit, attackOutcome, {
          attackerPosition: aiDecision.moveTo ?? null,
          updatedTargetHp,
          isProjectile: usedProjectileAttack,
          suppressOutcome: true
        });

        registerFeedbackTimeout(() => {
          setUnits((prev) =>
            prev
              .map((unit: any) => {
                if (unit.id === targetUnit.id) {
                  return {
                    ...unit,
                    hp: updatedTargetHp
                  };
                }
                return unit;
              })
              .filter((unit: any) => unit.hp > 0)
          );

          setLog((existingLog) => {
            const nextLog = [
              buildAttackLogLine(movedAttacker, targetUnit, attackOutcome, {
                closedIn: Boolean(aiDecision.moveTo),
                remainingAmmo: actingUnit.ammo && actingUnit.ammo > 0 ? remainingAmmo ?? 0 : undefined
              }),
              `${actingUnit.name} (${currentTeam}) ${aiDecision.reason}.`,
              ...existingLog
            ];

            if (runsOutOfAmmo) {
              nextLog.unshift(`${actingUnit.name} is out of ammo! Switching to melee combat.`);
            }

            if (updatedTargetHp <= 0) {
              nextLog.unshift(`${targetUnit.name} (${targetUnit.team}) was killed!`);
            }

            return nextLog;
          });

          if (attackOutcome.abilityTags.includes("Charge")) {
            setLog((existingLog) => [`${actingUnit.name} (${currentTeam}) crashed into the line with a charge!`, ...existingLog]);
          }

          if (updatedTargetHp > 0 && updatedTargetHp <= Math.ceil(targetUnit.maxHp * 0.35)) {
            setLog((existingLog) => [`${targetUnit.name} (${targetUnit.team}) is shaken and losing morale!`, ...existingLog]);
          }

          applyAttackOutcomeFeedback(targetUnit, updatedTargetHp, 0.35);
          advanceAiTurn(currentTeam as TeamName);
          aiAttackAnimatingRef.current = false;
        }, resolveDelayMs);

        return;
      } else if (aiDecision.type === "move" && aiDecision.moveTo) {
        const actingUnit = units.find((unit: any) => unit.id === aiDecision.unitId);
        if (actingUnit) {
          const terrainLabel = TERRAIN_LABELS[getTerrainAt(battlefieldTerrain, aiDecision.moveTo.x, aiDecision.moveTo.y)];
          setUnits((prev) =>
            prev.map((unit: any) =>
              unit.id === actingUnit.id ? { ...unit, x: aiDecision.moveTo.x, y: aiDecision.moveTo.y } : unit
            )
          );
          setLog((existingLog) => [
            `${actingUnit.name} (${currentTeam}) ${aiDecision.reason}.`,
            `${actingUnit.name} (${currentTeam}) moved onto ${terrainLabel}`,
            ...existingLog
          ]);
          triggerCellFeedback(`${aiDecision.moveTo.x},${aiDecision.moveTo.y}`, "move", 2000);
        }
      }

      advanceAiTurn(currentTeam as TeamName);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [turn, units, isSetupMode, gameMode, gameStarted, timedPlayLoserTeam, aiTeams, terrainEffectMap, aiDifficulty]);

  useBattlefieldViewport({
    battlefieldViewportRef,
    battlefieldPanCleanupRef,
    showGridNavigation,
    hoverScrollDirection,
    isPanningGrid,
    setIsBattlefieldFullscreen
  });

  const persistUserSettings = useCallback(() => {
    writeUserPrefs({
      gameOptions,
      terrainPreset,
      terrainGenerationSettings
    });
    writeGameAudioPrefs({
      musicEnabled: gameOptions.musicEnabled,
      sfxEnabled: gameOptions.sfxEnabled
    });
    setSettingsSaveNotice("Settings saved for this browser.");
    window.setTimeout(() => setSettingsSaveNotice(null), 2800);
    if (gameStarted) {
      setLog((prev) => ["Settings saved to browser storage.", ...prev]);
    }
  }, [gameOptions, terrainPreset, terrainGenerationSettings, gameStarted, setLog]);

  if (gameMode && !sessionRestored) {
    return <FormationLoadingScreen />;
  }

  // Safety check - don't render if units is not properly initialized
  if (!units || units.length === 0) {
    return <FormationLoadingScreen />;
  }

  /** BFS reachability in battle — occupied tiles block movement for all units (no passing through). */
  const battleMoveDestinationKeys =
    selected && !isSetupMode
      ? new Set(getReachableTiles(selected, units).map((t) => `${t.x},${t.y}`))
      : null;

  const highlightMove =
    selected && gameOptions.showMoveHighlights && (isSetupMode ? customUnits : units)
      ? [...Array(battlefieldSize)].flatMap((_, y) =>
          [...Array(battlefieldSize)].map((_, x) => {
            if (isSetupMode) {
              const distance = Math.abs(x - selected.x) + Math.abs(y - selected.y);
              return distance <= selectedEffectiveMove && !getUnit(x, y) ? `${x},${y}` : null;
            }
            const key = `${x},${y}`;
            if (key === `${selected.x},${selected.y}`) return null;
            return battleMoveDestinationKeys?.has(key) ? `${x},${y}` : null;
          }).filter(Boolean)
        )
      : [];

  const highlightAttack = selected && gameOptions.showAttackHighlights && (isSetupMode ? customUnits : units) ? [...Array(battlefieldSize)].flatMap((_, y) =>
    [...Array(battlefieldSize)].map((_, x) => {
      const target = getUnit(x, y);
      const distance = Math.abs(x - selected.x) + Math.abs(y - selected.y);
      const canAttackFromRange = target && target.team !== selected.team && distance <= selectedEffectiveRange;
      const canCloseForAttack =
        target && target.team !== selected.team && selectedEffectiveRange === 1 && Boolean(getCloseCombatAttackDestination(selected, target));
      return (canAttackFromRange || canCloseForAttack) ? `${x},${y}` : null;
    }).filter(Boolean)
  ) : [];

  const highlightMeleeApproach =
    selected &&
    meleeApproachPendingTargetId &&
    gameOptions.showAttackHighlights &&
    !isSetupMode &&
    units
      ? (() => {
          const t = units.find((u: any) => u.id === meleeApproachPendingTargetId);
          if (!t || t.team === selected.team || t.hp <= 0) return [] as string[];
          return getMeleeApproachTiles(selected, t, units, selectedEffectiveRange).map((p) => `${p.x},${p.y}`);
        })()
      : [];

  const executeAttackOnEnemy = (clicked: any, meleeAttackDestination: { x: number; y: number } | null) => {
    if (!selected) return;
    setMeleeApproachPendingTargetId(null);
    if (clicked.hp <= 0) {
      setLog((prevLog) => [`${clicked.name} is already dead!`, ...prevLog]);
      return;
    }

    const attackerPosition = meleeAttackDestination ? { x: meleeAttackDestination.x, y: meleeAttackDestination.y } : null;
    const attackingUnit = attackerPosition ? { ...selected, ...attackerPosition } : selected;
    const nextClickedHp = clicked.hp;
    if (meleeAttackDestination) {
      attackingUnit.x = meleeAttackDestination.x;
      attackingUnit.y = meleeAttackDestination.y;
    }

    const attackOutcome = getAttackDamage(attackingUnit, clicked, units, terrainEffectMap, {
      round,
      attackerMovedThisTurn: Boolean(attackerPosition)
    });
    const dmg = attackOutcome.damage;
    const updatedTargetHp = nextClickedHp - dmg;
    const nextAmmo = selected.ammo && selected.ammo > 0 ? selected.ammo - 1 : selected.ammo;
    const runsOutOfAmmo = Boolean(selected.ammo && selected.ammo > 0 && nextAmmo === 0);
    const usedProjectileAttack = Boolean(selected.ammo && selected.ammo > 0);
    const resolveDelayMs = getAttackResolutionDelayMs(usedProjectileAttack);

    battleResolutionPendingRef.current = true;
    setUnits((prev) =>
      prev.map((unit: any) => {
        if (unit.id === selected.id) {
          return {
            ...unit,
            ...(attackerPosition ?? {}),
            ammo: nextAmmo,
            range: runsOutOfAmmo ? 1 : unit.range
          };
        }
        return unit;
      })
    );

    if (meleeAttackDestination) {
      triggerCellFeedback(`${meleeAttackDestination.x},${meleeAttackDestination.y}`, "move", 2000);
    }

    triggerAttackFeedback(attackingUnit, clicked, attackOutcome, {
      attackerPosition,
      updatedTargetHp,
      isProjectile: usedProjectileAttack,
      suppressOutcome: true
    });

    registerFeedbackTimeout(() => {
      setUnits((prev) =>
        prev
          .map((unit: any) => {
            if (unit.id === clicked.id) {
              return {
                ...unit,
                hp: updatedTargetHp
              };
            }
            return unit;
          })
          .filter((unit: any) => unit.hp > 0)
      );

      if (usedProjectileAttack) {
        setLog((prevLog) => [
          buildAttackLogLine(attackingUnit, clicked, attackOutcome, { remainingAmmo: nextAmmo ?? 0 }),
          ...prevLog
        ]);

        if (runsOutOfAmmo) {
          setLog((prevLog) => [`${selected.name} is out of ammo! Switching to melee combat at half attack.`, ...prevLog]);
        }
      } else {
        setLog((prevLog) => [
          buildAttackLogLine(attackingUnit, clicked, attackOutcome, { closedIn: Boolean(meleeAttackDestination) }),
          ...prevLog
        ]);
      }

      if (attackOutcome.abilityTags.includes("Charge")) {
        setLog((prevLog) => [`${attackingUnit.name} (${attackingUnit.team}) crashed into the line with a charge!`, ...prevLog]);
      }

      if (updatedTargetHp > 0 && updatedTargetHp <= Math.ceil(clicked.maxHp * 0.35)) {
        setLog((prevLog) => [`${clicked.name} (${clicked.team}) is shaken and losing morale!`, ...prevLog]);
      }

      if (updatedTargetHp <= 0) {
        setLog((prevLog) => [`${clicked.name} (${clicked.team}) was killed!`, ...prevLog]);
      }

      applyAttackOutcomeFeedback(clicked, updatedTargetHp, 0.35);
      setSelectedId(null);
      advanceTurn();
      battleResolutionPendingRef.current = false;
    }, resolveDelayMs);
  };

  const handleClick = (x: number, y: number) => {
    if (skipNextGridClickRef.current) {
      skipNextGridClickRef.current = false;
      return;
    }

    if (isSetupMode) {
      handleSetupClick(x, y);
      return;
    }

    if (
      (gameMode === "ai-versus" || (gameMode === "custom-scenario" && customScenarioSpectator)) &&
      gameStarted
    )
      return;
    
    if (!gameStarted || turn !== activeTeam || !units) return;
    if (timedPlayLoserTeam) return;
    if (battleResolutionPendingRef.current) return;

    const clicked = getUnit(x, y);

    if (clicked && clicked.id === selectedId && !mergeMode) {
      setInspectedTile(null);
      setInspectedUnitId(clicked.id);
      return;
    }

    if (clicked && clicked.team === activeTeam) {
      if (mergeMode) {
        // In merge mode, select first troop for merging
        if (!selectedForMerge) {
          setSelectedForMerge(clicked);
          playTroopSelectSfx(clicked);
          setLog((prevLog) => [`Selected ${clicked.name} for merging. Click on another ${clicked.role} to merge.`, ...prevLog]);
        } else if (selectedForMerge.id !== clicked.id && selectedForMerge.role === clicked.role) {
          // Check if troops are adjacent
          if (!areAdjacent(selectedForMerge, clicked)) {
            setLog((prevLog) => [`Troops must be adjacent to merge! Move them next to each other first.`, ...prevLog]);
            setSelectedForMerge(null);
            setMergeMode(false);
            setSelectedId(null);
            return;
          }
          
          // Second troop selected, perform merge
          if (mergeCount < 3) {
            const mergedHp = mergeTroopHpFields(selectedForMerge, clicked);
            const mergedTroop = {
              ...selectedForMerge,
              ...mergedHp,
              attack: Math.floor((selectedForMerge.attack + clicked.attack) * 1),
              range: Math.max(selectedForMerge.range, clicked.range),
              move: Math.max(selectedForMerge.move, clicked.move),
              ammo: (selectedForMerge.ammo ?? 0) + (clicked.ammo ?? 0),
              id: `merged_${selectedForMerge.role}_${Date.now()}`,
              name: selectedForMerge.role
            };
            
            // Remove both original troops and add merged troop
            setUnits((prev) => {
              const filtered = prev.filter((u: any) => u.id !== selectedForMerge.id && u.id !== clicked.id);
              return [...filtered, mergedTroop];
            });
            
            setMergeCount(prev => prev + 1);
            setLog((prevLog) => [`Merged ${selectedForMerge.name} and ${clicked.name} into one ${mergedTroop.role}. (${3 - mergeCount - 1} merges remaining)`, ...prevLog]);
            
            // Reset merge state
            setSelectedForMerge(null);
            setMergeMode(false);
            setSelectedId(null);
          } else {
            setLog((prevLog) => [`No more merges allowed this game!`, ...prevLog]);
            setSelectedForMerge(null);
            setMergeMode(false);
            setSelectedId(null);
          }
        } else if (selectedForMerge.role !== clicked.role) {
          setLog((prevLog) => [`Can only merge troops of the same role! Selected: ${selectedForMerge.role}, Clicked: ${clicked.role}`, ...prevLog]);
          setSelectedForMerge(null);
          setMergeMode(false);
          setSelectedId(null);
        } else {
          setLog((prevLog) => [`Cannot merge the same troop with itself!`, ...prevLog]);
          setSelectedForMerge(null);
          setMergeMode(false);
          setSelectedId(null);
        }
      } else {
        // Normal selection mode
        setInspectedTile(null);
        setSelectedId(clicked.id);
        playTroopSelectSfx(clicked);
      }
    } else if (selected) {
      if (!clicked) {
        const key = `${x},${y}`;
        if (meleeApproachPendingTargetId) {
          const pendingTarget = units.find((u: any) => u.id === meleeApproachPendingTargetId);
          if (pendingTarget && pendingTarget.hp > 0 && pendingTarget.team !== selected.team) {
            const approaches = getMeleeApproachTiles(selected, pendingTarget, units, selectedEffectiveRange);
            const picked = approaches.find((p) => p.x === x && p.y === y);
            if (picked) {
              executeAttackOnEnemy(pendingTarget, picked);
              return;
            }
          }
          setMeleeApproachPendingTargetId(null);
        }
        if (battleMoveDestinationKeys?.has(key) && !getUnit(x, y)) {
          setUnits((prev) => prev.map((u: any) => u.id === selected.id ? { ...u, x, y } : u));
          triggerCellFeedback(`${x},${y}`, "move", 2000);
          setLog((prevLog) => [`${selected.name} (${selected.team}) moved onto ${TERRAIN_LABELS[getTerrainAt(battlefieldTerrain, x, y)]}`, ...prevLog]);
          setInspectedTile(null);
          setSelectedId(null);
          advanceTurn();
          return;
        }
        setInspectedUnitId(null);
        setInspectedTile({ x, y });
        return;
      }

      if (
        clicked.team !== selected.team &&
        selectedEffectiveRange === 1 &&
        !isInRange(selected, clicked, selectedEffectiveRange)
      ) {
        const approaches = getMeleeApproachTiles(selected, clicked, units, selectedEffectiveRange);
        if (approaches.length > 1) {
          setMeleeApproachPendingTargetId(clicked.id);
          setLog((prevLog) => [
            `Choose which side to attack from — click a highlighted tile next to ${clicked.name}.`,
            ...prevLog
          ]);
          return;
        }
      }

      const meleeAttackDestination =
        clicked.team !== selected.team && selectedEffectiveRange === 1 && !isInRange(selected, clicked, selectedEffectiveRange)
          ? getCloseCombatAttackDestination(selected, clicked)
          : null;

      if (clicked.team !== selected.team && (isInRange(selected, clicked, selectedEffectiveRange) || meleeAttackDestination)) {
        executeAttackOnEnemy(clicked, meleeAttackDestination);
      }
    } else if (!clicked) {
      setInspectedUnitId(null);
      setInspectedTile({ x, y });
    }
  };

  const finalizeSetupPlacedTroop = (troop: any) => {
    let u = applyCivilizationPassive(troop);
    const scale = getAiTroopScalingForTeamInGame(
      gameMode,
      currentLevel,
      playerTeam,
      aiDifficulty,
      multiplayerTeams,
      customScenarioSpectator,
      troop.team as TeamName
    );
    if (scale !== 1) u = applyAiTroopStatMultiplier(u, scale);
    return u;
  };

  const handleSetupClick = (x: number, y: number) => {
    if (draggedTroop) {
      if (!isTeamAllowedInSetup(selectedTeam)) return;
      // Check if position is valid (not occupied)
      if (!getUnit(x, y)) {
        // Check team limits
        const teamCount = customUnits.filter(u => u.team === selectedTeam).length;
        const placeCost = getUnitWeightTokenCost(draggedTroop.role);
        const teamSpend = sumSetupTokensForTeam(customUnits, selectedTeam);
        const overBudget =
          deploymentBudgetApplies && teamSpend + placeCost > SETUP_ARMY_TOKEN_BUDGET;
        if (overBudget) {
          setLog((prev) => [
            `Army token limit (${SETUP_ARMY_TOKEN_BUDGET}): cannot place ${draggedTroop.role} (${placeCost} tokens). Remove units or pick a cheaper role.`,
            ...prev
          ]);
          return;
        }
        if (teamCount < 16) {
          const stats = generateTroopStats(draggedTroop.role);
          const newTroop = {
            ...draggedTroop,
            ...stats,
            id: `${selectedTeam}_${draggedTroop.role}_${Date.now()}`,
            team: selectedTeam,
            x,
            y,
            Icon: draggedTroop.Icon
          };
          
          setCustomUnits((prev) => [...prev, finalizeSetupPlacedTroop(newTroop)]);
          setDraggedTroop(null);
          setInspectedTile(null);
        }
      }
    } else {
      // Select existing unit for removal
      const existingUnit = getUnit(x, y);
      if (existingUnit) {
        setCustomUnits(prev => prev.filter(u => u.id !== existingUnit.id));
      } else {
        setInspectedUnitId(null);
        setInspectedTile({ x, y });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    if (draggedTroop) {
      if (!isTeamAllowedInSetup(selectedTeam)) return;
      // Check if position is valid (not occupied)
      if (!getUnit(x, y)) {
        // Check team limits
        const teamCount = customUnits.filter(u => u.team === selectedTeam).length;
        const placeCost = getUnitWeightTokenCost(draggedTroop.role);
        const teamSpend = sumSetupTokensForTeam(customUnits, selectedTeam);
        const overBudget =
          deploymentBudgetApplies && teamSpend + placeCost > SETUP_ARMY_TOKEN_BUDGET;
        if (overBudget) {
          setLog((prev) => [
            `Army token limit (${SETUP_ARMY_TOKEN_BUDGET}): cannot place ${draggedTroop.role} (${placeCost} tokens).`,
            ...prev
          ]);
          return;
        }
        if (teamCount < 16) {
          const stats = generateTroopStats(draggedTroop.role);
          const newTroop = {
            ...draggedTroop,
            ...stats,
            id: `${selectedTeam}_${draggedTroop.role}_${Date.now()}`,
            team: selectedTeam,
            x,
            y,
            Icon: draggedTroop.Icon
          };
          
          setCustomUnits((prev) => [...prev, finalizeSetupPlacedTroop(newTroop)]);
          setDraggedTroop(null);
        }
      }
    } else if (isSetupMode) {
      const movingId =
        setupFieldDragUnitIdRef.current || e.dataTransfer.getData("application/x-codeconq-setup-unit");
      if (movingId) {
        const moving = customUnits.find((c: any) => c.id === movingId);
        setupFieldDragUnitIdRef.current = null;
        setSetupFieldDragActive(false);
        if (!moving || !isTeamAllowedInSetup(moving.team as TeamName)) {
          return;
        }
        const targetUnit = getUnit(x, y);
        if (targetUnit?.id === movingId) {
          return;
        }
        if (!targetUnit) {
          setCustomUnits((prev) =>
            prev.map((c: any) => (c.id === movingId ? { ...c, x, y } : c))
          );
          return;
        }
        if (!isTeamAllowedInSetup(targetUnit.team as TeamName)) {
          return;
        }
        const mx = moving.x;
        const my = moving.y;
        setCustomUnits((prev) =>
          prev.map((c: any) => {
            if (c.id === movingId) return { ...c, x: targetUnit.x, y: targetUnit.y };
            if (c.id === targetUnit.id) return { ...c, x: mx, y: my };
            return c;
          })
        );
        return;
      }
      // Drop on a unit with no field-drag payload: remove that unit (legacy setup gesture)
      const existingUnit = getUnit(x, y);
      if (existingUnit) {
        setCustomUnits((prev) => prev.filter((u) => u.id !== existingUnit.id));
      }
    } else if (!isSetupMode && mergeMode) {
      // Handle troop merging only in formation mode
      const existingUnit = getUnit(x, y);
      const draggedUnit = units?.find(u => u.id === selectedId);
      
      if (draggedUnit && ALL_TEAMS.includes(draggedUnit.team as TeamName)) {
        if (!existingUnit) {
          // Select first troop for merging
          setSelectedForMerge(draggedUnit);
          setLog((prevLog) => [`Selected ${draggedUnit.name} for merging. Now drag another ${draggedUnit.role} onto it to merge.`, ...prevLog]);
        } else if (existingUnit.team === draggedUnit.team && existingUnit.role === draggedUnit.role && existingUnit.id !== draggedUnit.id) {
          // Check if troops are adjacent
          const dx = Math.abs(draggedUnit.x - existingUnit.x);
          const dy = Math.abs(draggedUnit.y - existingUnit.y);
          const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
          
          if (isAdjacent && mergeCount < 2) {
            const mergedHp = mergeTroopHpFields(draggedUnit, existingUnit);
            const mergedTroop = {
              ...draggedUnit,
              ...mergedHp,
              attack: Math.floor((draggedUnit.attack + existingUnit.attack) * 1.2),
              range: Math.max(draggedUnit.range, existingUnit.range),
              move: Math.max(draggedUnit.move, existingUnit.move),
              ammo: (draggedUnit.ammo ?? 0) + (existingUnit.ammo ?? 0),
              id: `merged_${draggedUnit.role}_${Date.now()}`,
              name: draggedUnit.role,
              x,
              y
            };
            
            // Remove both original troops and add merged troop
            setUnits((prev) => {
              const filtered = prev.filter((u: any) => u.id !== draggedUnit.id && u.id !== existingUnit.id);
              return [...filtered, mergedTroop];
            });
            
            setMergeCount(prev => prev + 1);
            setLog((prevLog) => [`Merged ${draggedUnit.name} and ${existingUnit.name} into one ${draggedUnit.role}. (${2 - mergeCount - 1} merges remaining)`, ...prevLog]);
            
            setSelectedId(null);
            setSelectedForMerge(null);
            setMergeMode(false);
          } else if (!isAdjacent) {
            setLog((prevLog) => [`Troops must be adjacent to merge!`, ...prevLog]);
          } else {
            setLog((prevLog) => [`No more merges allowed this game!`, ...prevLog]);
          }
        } else if (existingUnit.team === draggedUnit.team && existingUnit.role === draggedUnit.role && existingUnit.id === draggedUnit.id) {
          setLog((prevLog) => [`Cannot merge a troop with itself!`, ...prevLog]);
        } else if (existingUnit.team === draggedUnit.team && existingUnit.role !== draggedUnit.role) {
          setLog((prevLog) => [`Can only merge troops of the same role!`, ...prevLog]);
        } else if (existingUnit.team !== draggedUnit.team) {
          setLog((prevLog) => [`Cannot merge with enemy troops!`, ...prevLog]);
        }
      }
    }
  };

  const startCustomGame = () => {
    if (customUnits.length === 0) return;
    if (customScenarioSpectator) {
      const factions = [...new Set(customUnits.map((u: any) => u.team as TeamName))];
      if (factions.length < 2) {
        setLog((prev) => [`Spectator (all AI) needs at least two different factions on the field.`, ...prev]);
        return;
      }
    } else {
      const playerUnits = customUnits.filter((u: any) => u.team === playerTeam).length;
      const enemyUnits = customUnits.filter((u: any) => u.team !== playerTeam).length;
      if (playerUnits === 0 || enemyUnits === 0) {
        setLog((prev) => [`${playerTeam} needs at least 1 troop and there must be at least 1 enemy troop before starting.`, ...prev]);
        return;
      }
    }
    const teamsInPlay = [...new Set(customUnits.map((u: any) => u.team as TeamName))];
    for (const team of teamsInPlay) {
      const spend = sumSetupTokensForTeam(customUnits, team);
      if (spend > SETUP_ARMY_TOKEN_BUDGET) {
        setLog((prev) => [
          `${team} exceeds the ${SETUP_ARMY_TOKEN_BUDGET} army token budget (${spend} spent). Remove units before starting.`,
          ...prev
        ]);
        return;
      }
    }

    setIsSetupMode(false);
    const prepared = prepareUnitsForBattle(
      customUnits,
      buildPrepareBattleOptsForGame(
        gameMode,
        currentLevel,
        playerTeam,
        aiDifficulty,
        multiplayerTeams,
        customScenarioSpectator,
        customUnits
      )
    );
    setUnits(prepared);
    if (customScenarioSpectator) {
      const present = new Set(prepared.map((u: any) => u.team));
      const first = ALL_TEAMS.find((t) => present.has(t)) ?? playerTeam;
      setTurn(first);
    } else {
      setTurn(playerTeam);
    }
    setRound(1);
    setSelectedId(null);
    setGameStarted(true);
    setMergeCount(0); // Reset merge count for new game
    setMergeMode(false);
    setSelectedForMerge(null);
    battleOutcomeLoggedRef.current = false;
    initTimedPlayFromUnitList(prepared);
    playBackgroundMusicFromUserGesture();
    if (customScenarioSpectator) {
      setLog((prev) => [
        `Spectator battle — all factions are AI (${AI_DIFFICULTY_LABELS[aiDifficulty]}). You watch only.`,
        ...prev
      ]);
    }
  };

  const startSinglePlayerBattle = () => {
    playBackgroundMusicFromUserGesture();
    const nextPlayerTeam = getValidLevelPlayerTeam(currentLevel, playerTeam);
    setPlayerTeam(nextPlayerTeam);
    setTurn(nextPlayerTeam);
    setRound(1);
    setSelectedId(null);
    setLog([]);
    setGameStarted(true);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
    battleOutcomeLoggedRef.current = false;
    initTimedPlayFromUnitList(units);
  };

  const resetCustomSetup = () => {
    setCustomUnits([]);
    setDraggedTroop(null);
    setSelectedTeam(isDualTeamBattle ? multiplayerTeams[0] : playerTeam);
    setGridOrientation("north");
  };

  const startSinglePlayerMode = () => {
    playBackgroundMusicFromUserGesture();
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setIsInGameUnitsOpen(false);
    setGridOrientation("north");
    setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
    const nextPlayerTeam = getValidLevelPlayerTeam(currentLevel, playerTeam);
    setGameMode("single-player");
    setIsSetupMode(false);
    setUnits(
      prepareUnitsForBattle(
        levels[currentLevel],
        buildPrepareBattleOptsForGame(
          "single-player",
          currentLevel,
          nextPlayerTeam,
          aiDifficulty,
          multiplayerTeams,
          false,
          []
        )
      )
    );
    setPlayerTeam(nextPlayerTeam);
    setTurn(nextPlayerTeam);
    setRound(1);
    setSelectedId(null);
    setLog([]);
    setGameStarted(false);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const startMultiplayerMode = () => {
    playBackgroundMusicFromUserGesture();
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setIsInGameUnitsOpen(false);
    setGridOrientation("north");
    setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
    setGameMode("multiplayer");
    setIsSetupMode(true);
    setUnits(
      prepareUnitsForBattle(
        levels[currentLevel],
        buildPrepareBattleOptsForGame(
          "multiplayer",
          currentLevel,
          playerTeam,
          aiDifficulty,
          multiplayerTeams,
          false,
          []
        )
      )
    );
    setCustomUnits([]);
    setSelectedTeam(multiplayerTeams[0]);
    setTurn(multiplayerTeams[0]);
    setRound(1);
    setSelectedId(null);
    setLog([
      `Multiplayer setup: pick factions (${multiplayerTeams.length} in this match), place troops (max 16 per faction, ${SETUP_ARMY_TOKEN_BUDGET} army tokens each), then start.`
    ]);
    setGameStarted(false);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
  };

  const startMultiplayerGame = () => {
    if (customUnits.length === 0) return;
    for (const team of multiplayerTeams) {
      const placed = customUnits.filter((u: any) => u.team === team).length;
      if (placed === 0) {
        setLog((prev) => [`Every faction in the match needs at least one troop before starting.`, ...prev]);
        return;
      }
      const spend = sumSetupTokensForTeam(customUnits, team);
      if (spend > SETUP_ARMY_TOKEN_BUDGET) {
        setLog((prev) => [
          `${team} exceeds the ${SETUP_ARMY_TOKEN_BUDGET} army token budget (${spend} spent). Remove units before starting.`,
          ...prev
        ]);
        return;
      }
    }

    setIsSetupMode(false);
    const prepared = prepareUnitsForBattle(
      customUnits,
      buildPrepareBattleOptsForGame(
        gameMode,
        currentLevel,
        playerTeam,
        aiDifficulty,
        multiplayerTeams,
        customScenarioSpectator,
        customUnits
      )
    );
    setUnits(prepared);
    setTurn(multiplayerTeams[0]);
    setRound(1);
    setGameStarted(true);
    setMergeCount(0);
    battleOutcomeLoggedRef.current = false;
    initTimedPlayFromUnitList(prepared);
    playBackgroundMusicFromUserGesture();
  };

  const startCustomScenarioMode = () => {
    playBackgroundMusicFromUserGesture();
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setIsInGameUnitsOpen(false);
    setGridOrientation("north");
    setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
    setGameMode("custom-scenario");
    setIsSetupMode(true);
    setCustomScenarioSpectator(false);
    setTurn(playerTeam);
    setRound(1);
    setSelectedId(null);
    setLog([]);
    setGameStarted(false);
    setMergeCount(0);
    setMergeMode(false);
    setSelectedForMerge(null);
    resetCustomSetup();
  };

  const backToMainMenu = () => {
    setStartScreen("menu");
    setIsGameMenuOpen(false);
    setGameMenuControlsOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setIsInGameUnitsOpen(false);
    setGameMode(null);
    setIsSetupMode(false);
    setCurrentLevel("Level1");
    setUnits(
      prepareUnitsForBattle(
        levels["Level1"],
        buildPrepareBattleOptsForGame(null, "Level1", "Romans", aiDifficulty, ["Romans", "Barbarians"], false, [])
      )
    );
    setCustomUnits([]);
    setDraggedTroop(null);
    setSelectedTeam("Romans");
    setPlayerTeam("Romans");
    setSelectedId(null);
    setTurn("Romans");
    setRound(1);
    setLog([]);
    setGameStarted(false);
    setMergeMode(false);
    setMergeCount(0);
    setSelectedForMerge(null);
    setMultiplayerTeams(["Romans", "Barbarians"]);
    setCustomScenarioSpectator(false);
    setGridOrientation("north");
    setBattlefieldTerrain(generateTerrainMap(gameOptions.battlefieldSize, terrainPreset, terrainGenerationSettings));
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const restartCurrentGame = () => {
    if (gameMode === "single-player") {
      const nextPlayerTeam = getValidLevelPlayerTeam(currentLevel, playerTeam);
      setIsGameMenuOpen(false);
      setIsInGameOptionsOpen(false);
      setIsInGameMechanicsOpen(false);
      setIsInGameGraphicsOpen(false);
      setIsInGameUnitsOpen(false);
      setGridOrientation("north");
      setGameMode("single-player");
      setIsSetupMode(false);
      setUnits(
        rerollUnits(
          levels[currentLevel],
          buildPrepareBattleOptsForGame(
            "single-player",
            currentLevel,
            nextPlayerTeam,
            aiDifficulty,
            multiplayerTeams,
            false,
            []
          )
        )
      );
      setPlayerTeam(nextPlayerTeam);
      setTurn(nextPlayerTeam);
      setRound(1);
      setSelectedId(null);
      setLog([]);
      setGameStarted(false);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
      return;
    }

    if (gameMode === "multiplayer") {
      const rerolledCustomUnits = rerollUnits(customUnits);
      setIsGameMenuOpen(false);
      setIsInGameOptionsOpen(false);
      setIsInGameMechanicsOpen(false);
      setIsInGameGraphicsOpen(false);
      setIsInGameUnitsOpen(false);
      setGridOrientation("north");
      setGameMode("multiplayer");
      setIsSetupMode(true);
      setUnits(rerollUnits(levels[currentLevel]));
      setCustomUnits(rerolledCustomUnits);
      setSelectedTeam(multiplayerTeams[0]);
      setTurn(multiplayerTeams[0]);
      setRound(1);
      setSelectedId(null);
      setLog([
        `Multiplayer setup: pick factions (${multiplayerTeams.length} in this match), place troops (max 16 per faction, ${SETUP_ARMY_TOKEN_BUDGET} army tokens each), then start.`
      ]);
      setGameStarted(false);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
      return;
    }

    if (gameMode === "ai-versus") {
      const aiVersusOpts = buildPrepareBattleOptsForGame(
        "ai-versus",
        currentLevel,
        playerTeam,
        aiDifficulty,
        multiplayerTeams,
        false,
        customUnits
      );
      const rerolledCustomUnits = rerollUnits(customUnits, aiVersusOpts);
      setIsGameMenuOpen(false);
      setIsInGameOptionsOpen(false);
      setIsInGameMechanicsOpen(false);
      setIsInGameGraphicsOpen(false);
      setIsInGameUnitsOpen(false);
      setGridOrientation("north");
      setGameMode("ai-versus");
      setIsSetupMode(true);
      setUnits(rerollUnits(levels[currentLevel], aiVersusOpts));
      setCustomUnits(rerolledCustomUnits);
      setSelectedTeam(multiplayerTeams[0]);
      setTurn(multiplayerTeams[0]);
      setRound(1);
      setSelectedId(null);
      setLog([
        `AI vs AI: assign ${multiplayerTeams.length} factions and deploy (max 16 per faction, ${SETUP_ARMY_TOKEN_BUDGET} army tokens each), then start. Fully automated — you watch only. Difficulty: ${AI_DIFFICULTY_LABELS[aiDifficulty]}.`
      ]);
      setGameStarted(false);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
      return;
    }

    if (gameMode === "custom-scenario") {
      setIsGameMenuOpen(false);
      setIsInGameOptionsOpen(false);
      setIsInGameMechanicsOpen(false);
      setIsInGameGraphicsOpen(false);
      setIsInGameUnitsOpen(false);
      setGridOrientation("north");
      setGameMode("custom-scenario");
      setIsSetupMode(true);
      setCustomUnits(
        rerollUnits(
          customUnits,
          buildPrepareBattleOptsForGame(
            "custom-scenario",
            currentLevel,
            playerTeam,
            aiDifficulty,
            multiplayerTeams,
            customScenarioSpectator,
            customUnits
          )
        )
      );
      setTurn(playerTeam);
      setRound(1);
      setSelectedId(null);
      setLog([]);
      setGameStarted(false);
      setMergeCount(0);
      setMergeMode(false);
      setSelectedForMerge(null);
    }
  };

  const toggleBattlefieldFullscreen = async () => {
    if (!battlefieldRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await battlefieldRef.current.requestFullscreen();
    }
  };

  const getTeamCount = (team: string) => {
    return customUnits.filter(u => u.team === team).length;
  };

  const getTeamTokenSpend = (team: TeamName) => sumSetupTokensForTeam(customUnits, team);
  const deploymentBudgetApplies = isDualTeamBattle || gameMode === "custom-scenario";

  const getAutoDeployUnitRange = (size: BattlefieldSize): [number, number] => {
    if (size <= 8) return [12, 13];
    if (size <= 10) return [13, 15];
    return [14, 16];
  };

  const getRandomAutoDeployUnitCount = (size: BattlefieldSize) => {
    const [minimumUnits, maximumUnits] = getAutoDeployUnitRange(size);
    return minimumUnits + Math.floor(Math.random() * (maximumUnits - minimumUnits + 1));
  };

  const getCustomAutoDeployOpponent = () =>
    selectedTeam !== playerTeam
      ? selectedTeam
      : ALL_TEAMS.find((team) => team !== playerTeam) ?? "Barbarians";

  const shuffleArray = <T,>(items: T[]) => {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  };

  const buildAutoDeployRoleCounts = (team: TeamName, totalUnits: number) => {
    const availableTroops = AVAILABLE_TROOPS[team];
    const leaderTroop = availableTroops.find((troop) => troop.Icon === "👑") ?? availableTroops[0];
    const nonLeaderCatalog = availableTroops.filter((troop) => troop.role !== leaderTroop.role);

    const troopMechanicForCatalog = (troop: (typeof availableTroops)[number]) => {
      const referenceStats = getTroopReferenceStats(troop.role);
      return getTroopMechanicType({
        role: troop.role,
        name: troop.name,
        ammo: referenceStats.ammo,
        range: referenceStats.range,
        move: referenceStats.move
      });
    };

    const isSiegedTroop = (troop: (typeof availableTroops)[number]) => troopMechanicForCatalog(troop) === "sieged";

    const pool = shuffleArray([...nonLeaderCatalog]);
    const nonSiegePool = pool.filter((t) => !isSiegedTroop(t));

    const maxUnits = Math.min(totalUnits, 16);
    let cost = getUnitWeightTokenCost(leaderTroop.role);
    const row: typeof availableTroops = [];

    while (row.length < maxUnits - 1 && cost < SETUP_ARMY_TOKEN_BUDGET) {
      const affordable = pool.filter((t) => cost + getUnitWeightTokenCost(t.role) <= SETUP_ARMY_TOKEN_BUDGET);
      if (affordable.length === 0) break;
      const pick = affordable[Math.floor(Math.random() * affordable.length)];
      row.push(pick);
      cost += getUnitWeightTokenCost(pick.role);
    }

    const MAX_SIEGE_UNITS = 2;
    const siegeIndices: number[] = [];
    row.forEach((t, index) => {
      if (isSiegedTroop(t)) siegeIndices.push(index);
    });

    if (siegeIndices.length > MAX_SIEGE_UNITS && nonSiegePool.length > 0) {
      const toReplace = siegeIndices.slice(MAX_SIEGE_UNITS);
      let filler = 0;
      for (const idx of toReplace) {
        row[idx] = nonSiegePool[filler % nonSiegePool.length];
        filler += 1;
      }
    }

    const assembled: typeof availableTroops = [leaderTroop, ...row];
    let totalCost = assembled.reduce((sum, t) => sum + getUnitWeightTokenCost(t.role), 0);
    while (assembled.length > 1 && totalCost > SETUP_ARMY_TOKEN_BUDGET) {
      const removed = assembled.pop()!;
      totalCost -= getUnitWeightTokenCost(removed.role);
    }

    return assembled.slice(0, maxUnits);
  };

  const getFormationColumns = (size: BattlefieldSize) => {
    const flankWidth = size >= 10 ? 2 : 1;
    const laneWidth = size >= 8 ? 1 : 0;
    const leftFlankColumns = Array.from({ length: flankWidth }, (_, index) => index);
    const rightFlankColumns = Array.from({ length: flankWidth }, (_, index) => size - flankWidth + index);
    const leftLaneBoundary = flankWidth + laneWidth;
    const rightLaneBoundary = size - flankWidth - laneWidth;
    const centerColumns = Array.from(
      { length: Math.max(0, rightLaneBoundary - leftLaneBoundary) },
      (_, index) => leftLaneBoundary + index
    );
    const sortCentered = (columns: number[]) =>
      [...columns].sort((a, b) => {
        const center = (size - 1) / 2;
        const distanceDifference = Math.abs(a - center) - Math.abs(b - center);
        if (distanceDifference !== 0) return distanceDifference;
        return a - b;
      });

    return {
      frontCenterColumns: sortCentered(centerColumns),
      backCenterColumns: sortCentered(centerColumns),
      flankColumns: [...leftFlankColumns, ...rightFlankColumns]
    };
  };

  const buildSlotPool = (rows: number[], columns: number[]) =>
    rows.flatMap((row) => columns.map((column) => ({ x: column, y: row })));

  const getAutoDeploySlots = (
    troops: Array<{ role: string; name: string }>,
    size: BattlefieldSize,
    side: "top" | "bottom"
  ) => {
    const minimumFrontlineGap = 2;
    const maxRowsPerArmy = Math.max(1, Math.floor((size - minimumFrontlineGap) / 2));
    const frontRows =
      side === "top"
        ? Array.from({ length: maxRowsPerArmy }, (_, index) => maxRowsPerArmy - 1 - index)
        : Array.from({ length: maxRowsPerArmy }, (_, index) => size - maxRowsPerArmy + index);
    const backRows = [...frontRows].reverse();
    const { frontCenterColumns, backCenterColumns, flankColumns } = getFormationColumns(size);
    const frontCenterSlots = buildSlotPool(frontRows, frontCenterColumns);
    const frontFlankSlots = buildSlotPool(frontRows, flankColumns);
    const backCenterSlots = buildSlotPool(backRows, backCenterColumns);
    const backFlankSlots = buildSlotPool(backRows, flankColumns);
    const fallbackSlots = buildSlotPool(frontRows, Array.from({ length: size }, (_, index) => index));
    const usedSlots = new Set<string>();
    const takeNextSlot = (pools: TerrainPoint[][]) => {
      for (const pool of pools) {
        const nextSlot = pool.find((slot) => !usedSlots.has(`${slot.x},${slot.y}`));
        if (!nextSlot) continue;
        usedSlots.add(`${nextSlot.x},${nextSlot.y}`);
        return nextSlot;
      }

      return { x: 0, y: frontRows[0] ?? 0 };
    };

    const decoratedTroops = troops.map((troop, index) => {
      const referenceStats = getTroopReferenceStats(troop.role);
      const troopType = getTroopMechanicType({
        role: troop.role,
        name: troop.name,
        ammo: referenceStats.ammo,
        range: referenceStats.range,
        move: referenceStats.move
      });

      return {
        troop,
        index,
        troopType,
        isLeader: isLeaderRole(troop.role)
      };
    });

    const slots = Array.from({ length: troops.length }, () => ({ x: 0, y: 0 }));
    const assignTroops = (
      troopFilter: (troop: (typeof decoratedTroops)[number]) => boolean,
      preferredPools: TerrainPoint[][]
    ) => {
      decoratedTroops.filter(troopFilter).forEach((entry) => {
        slots[entry.index] = takeNextSlot(preferredPools);
      });
    };

    assignTroops(
      (entry) => entry.isLeader,
      [backCenterSlots, backFlankSlots, frontCenterSlots, fallbackSlots]
    );
    assignTroops(
      (entry) => !entry.isLeader && entry.troopType === "closecombat",
      [frontCenterSlots, frontFlankSlots, backCenterSlots, fallbackSlots]
    );
    assignTroops(
      (entry) => !entry.isLeader && entry.troopType === "mounted",
      [frontFlankSlots, backFlankSlots, frontCenterSlots, fallbackSlots]
    );
    assignTroops(
      (entry) => !entry.isLeader && entry.troopType === "ranged",
      [backCenterSlots, backFlankSlots, frontCenterSlots, fallbackSlots]
    );
    assignTroops(
      (entry) => !entry.isLeader && entry.troopType === "sieged",
      [backCenterSlots, backFlankSlots, fallbackSlots]
    );

    return slots;
  };

  const createAutoDeployedArmy = (
    team: TeamName,
    side: "top" | "bottom",
    size: BattlefieldSize,
    unitCount: number
  ) => {
    const chosenTroops = buildAutoDeployRoleCounts(team, unitCount);
    const slots = getAutoDeploySlots(chosenTroops, size, side);

    return chosenTroops.map((troop, index) => {
      const stats = generateTroopStats(troop.role);
      const slot = slots[index];

      let u = applyCivilizationPassive({
        ...troop,
        ...stats,
        id: `${team}_${troop.role}_${side}_${index}_${Date.now()}`,
        team,
        x: slot.x,
        y: slot.y,
        Icon: troop.Icon
      });
      const scale = getAiTroopScalingForTeamInGame(
        gameMode,
        currentLevel,
        playerTeam,
        aiDifficulty,
        multiplayerTeams,
        customScenarioSpectator,
        team
      );
      if (scale !== 1) u = applyAiTroopStatMultiplier(u, scale);
      return u;
    });
  };

  const autoDeployCustomBattle = () => {
    const enemyTeam = getCustomAutoDeployOpponent();
    const unitCount = getRandomAutoDeployUnitCount(battlefieldSize);
    const deployedPlayerArmy = createAutoDeployedArmy(playerTeam, "bottom", battlefieldSize, unitCount);
    const deployedEnemyArmy = createAutoDeployedArmy(enemyTeam, "top", battlefieldSize, unitCount);

    setCustomUnits([...deployedEnemyArmy, ...deployedPlayerArmy]);
    setSelectedTeam(playerTeam);
    setDraggedTroop(null);
    setSelectedId(null);
    setLog((prev) => [
      `Auto deployed ${playerTeam} versus ${enemyTeam} with ${unitCount} troops per side (random picks from full faction roster, max 2 siege each), two-tile battle line gap.`,
      ...prev
    ]);
  };

  // Check if two troops are adjacent
  const areAdjacent = (troop1: any, troop2: any) => {
    const dx = Math.abs(troop1.x - troop2.x);
    const dy = Math.abs(troop1.y - troop2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  const toggleOption = (option: keyof GameOptions) => {
    if (option === "musicEnabled") {
      const next = !gameOptions.musicEnabled;
      setGameOptions((prev) => ({ ...prev, musicEnabled: next }));
      if (next) {
        void backgroundMusicRef.current?.play().catch(() => {});
      }
      return;
    }
    setGameOptions((prev) => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const isTerrainLocked = gameStarted && !isSetupMode;
  const isTimedPlayOptionLocked = gameStarted && !isSetupMode;

  const setBattlefieldSize = (size: BattlefieldSize) => {
    setGameOptions((prev) => ({
      ...prev,
      battlefieldSize: size
    }));
    setBattlefieldTerrain(generateTerrainMap(size, terrainPreset, terrainGenerationSettings));
  };

  const regenerateTerrain = () => {
    if (isTerrainLocked) {
      setLog((prev) => ["Terrain cannot be changed after the battle starts.", ...prev]);
      return;
    }

    setBattlefieldTerrain(generateTerrainMap(battlefieldSize, terrainPreset, terrainGenerationSettings));
    setLog((prev) => [
      terrainPreset === "mixed"
        ? "Battlefield terrain regenerated."
        : `Battlefield terrain set to pure ${TERRAIN_LABELS[terrainPreset]}.`,
      ...prev
    ]);
  };

  const changeTerrainPreset = (nextPreset: TerrainPreset) => {
    if (isTerrainLocked) {
      setLog((prev) => ["Terrain cannot be changed after the battle starts.", ...prev]);
      return;
    }

    setTerrainPreset(nextPreset);
    setBattlefieldTerrain(generateTerrainMap(battlefieldSize, nextPreset, terrainGenerationSettings));
    setLog((prev) => [
      nextPreset === "mixed"
        ? "Terrain mode changed to mixed terrain."
        : `Terrain mode changed to pure ${TERRAIN_LABELS[nextPreset]}.`,
      ...prev
    ]);
  };

  const toggleGeneratedTerrainType = (terrainType: TerrainType) => {
    if (isTerrainLocked) {
      setLog((prev) => ["Terrain cannot be changed after the battle starts.", ...prev]);
      return;
    }

    const enabledTypes = getEnabledTerrainTypes(terrainGenerationSettings);
    const willDisable = terrainGenerationSettings[terrainType];

    if (willDisable && enabledTypes.length === 1) {
      setLog((prev) => ["At least one terrain type must stay enabled for mixed generation.", ...prev]);
      return;
    }

    const nextSettings = {
      ...terrainGenerationSettings,
      [terrainType]: !terrainGenerationSettings[terrainType]
    };

    setTerrainGenerationSettings(nextSettings);

    if (terrainPreset === "mixed") {
      setBattlefieldTerrain(generateTerrainMap(battlefieldSize, "mixed", nextSettings));
    }

    const desertIsIsolated = terrainType === "desert" && nextSettings.desert && getEnabledTerrainTypes(nextSettings).length > 1;

    setLog((prev) => [
      desertIsIsolated
        ? "Desert stays isolated and will only generate if it is the only mixed biome enabled."
        : `${TERRAIN_LABELS[terrainType]} ${nextSettings[terrainType] ? "enabled" : "disabled"} for mixed terrain generation.`,
      ...prev
    ]);
  };

  const canRotateTroops = isSetupMode || (!isSetupMode && !gameStarted);

  const rotateTroopsTo = (targetOrientation: GridOrientation) => {
    const rotationSteps = getOrientationRotationSteps(gridOrientation, targetOrientation);
    if (rotationSteps === 0) return;

    if (isSetupMode) {
      setCustomUnits((prev) => rotateUnitCoordinates(prev, rotationSteps, battlefieldSize));
      setLog((prev) => [`Setup troops rotated to face ${targetOrientation}.`, ...prev]);
    } else if (!gameStarted) {
      setUnits((prev) => rotateUnitCoordinates(prev, rotationSteps, battlefieldSize));
      setLog((prev) => [`Battlefield troops rotated to face ${targetOrientation}.`, ...prev]);
    }

    setGridOrientation(targetOrientation);
  };

  const openInGameOptions = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(true);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setIsInGameUnitsOpen(false);
  };

  const openInGameMechanics = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setActiveMechanicsSlide(0);
    setIsInGameMechanicsOpen(true);
    setIsInGameGraphicsOpen(false);
    setIsInGameUnitsOpen(false);
  };

  const openInGameGraphics = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(true);
    setIsInGameUnitsOpen(false);
  };

  const openInGameUnits = () => {
    setIsGameMenuOpen(false);
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setUnitsReferenceTeam(activeTeam as TeamName);
    setUnitsReferenceQuery("");
    setIsInGameUnitsOpen(true);
  };

  const backToInGameMenu = () => {
    setIsInGameOptionsOpen(false);
    setIsInGameMechanicsOpen(false);
    setIsInGameGraphicsOpen(false);
    setIsInGameUnitsOpen(false);
    setIsGameMenuOpen(true);
  };

  const dismissFocusedBattlePanel = () => {
    setSelectedId(null);
    setInspectedUnitId(null);
  };

  const renderGameOptionsContent = () => (
    <div className="space-y-4">
      <div className="text-left bg-black bg-opacity-20 rounded-lg border border-yellow-700 p-4">
        <h3 className="text-yellow-200 font-bold mb-3 text-lg border-b border-yellow-600 pb-2">Game Options</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => toggleOption("musicEnabled")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.musicEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.musicEnabled ? "Music: On" : "Music: Off"}
          </button>
          <button
            onClick={() => toggleOption("sfxEnabled")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.sfxEnabled ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.sfxEnabled ? "Battle SFX: On" : "Battle SFX: Off"}
          </button>
          <button
            onClick={() => toggleOption("showMoveHighlights")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showMoveHighlights ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showMoveHighlights ? "Move Highlights: On" : "Move Highlights: Off"}
          </button>
          <button
            onClick={() => toggleOption("showAttackHighlights")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showAttackHighlights ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showAttackHighlights ? "Attack Highlights: On" : "Attack Highlights: Off"}
          </button>
          <button
            onClick={() => toggleOption("showFloatingDamageNumbers")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showFloatingDamageNumbers ? "bg-rose-600 hover:bg-rose-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showFloatingDamageNumbers ? "Floating damage numbers: On" : "Floating damage numbers: Off"}
          </button>
          <button
            onClick={() => toggleOption("showAttackDamagePreview")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showAttackDamagePreview ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showAttackDamagePreview ? "Attack damage preview: On" : "Attack damage preview: Off"}
          </button>
          <button
            onClick={() => toggleOption("showBattleLog")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showBattleLog ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showBattleLog ? "Battle Log: On" : "Battle Log: Off"}
          </button>
          <button
            onClick={() => toggleOption("showTurnBanner")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.showTurnBanner ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.showTurnBanner ? "Turn Banner: On" : "Turn Banner: Off"}
          </button>
          <button
            type="button"
            disabled={isTimedPlayOptionLocked}
            onClick={() => {
              if (isTimedPlayOptionLocked) return;
              toggleOption("timedPlayEnabled");
            }}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${
              isTimedPlayOptionLocked ? "cursor-not-allowed opacity-50 bg-gray-800" : ""
            } ${gameOptions.timedPlayEnabled ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.timedPlayEnabled
              ? `Timed play: On (${TURN_ACTION_BUDGET_MS / 1000}s/move + bank)`
              : "Timed play: Off"}
          </button>
          <div className="bg-black bg-opacity-20 border border-yellow-700 rounded-lg px-4 py-3">
            <label htmlFor="battlefield-size" className="block text-yellow-200 text-sm font-semibold mb-2">
              Battlefield Size
            </label>
            <select
              id="battlefield-size"
              value={gameOptions.battlefieldSize}
              onChange={(e) => setBattlefieldSize(Number(e.target.value) as BattlefieldSize)}
              className="w-full bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
            >
              {BATTLEFIELD_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size} x {size}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGraphicsContent = () => (
    <div className="space-y-4">
      <div className="text-left bg-black bg-opacity-20 rounded-lg border border-yellow-700 p-4">
        <h3 className="text-yellow-200 font-bold mb-3 text-lg border-b border-yellow-600 pb-2">Graphics</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => toggleOption("terrainEffectsEnabled")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.terrainEffectsEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.terrainEffectsEnabled ? "Terrain Effects: On" : "Terrain Effects: Off"}
          </button>
          <p className="text-xs text-yellow-100 opacity-80 -mt-1">
            When on, each tile changes move, attack, and incoming damage where the rules say so. All desert-hardy factions (Carthage, Barbarians, Egypt, Parthians, Seleucids) get the sand bonus; each has one other terrain perk (Parthians plains, Barbarians forest, Egypt and Seleucids hills, Carthage rivers). When off, combat uses open-ground stats.
          </p>
          <button
            onClick={() => toggleOption("terrainTileVideosEnabled")}
            className={`battle-button w-full px-4 py-3 text-sm font-semibold ${gameOptions.terrainTileVideosEnabled ? "bg-violet-600 hover:bg-violet-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {gameOptions.terrainTileVideosEnabled ? "Shader: On" : "Shader: Off"}
          </button>
          <p className="text-xs text-yellow-100 opacity-80 -mt-1">
            Off uses still terrain images (lighter on CPU/GPU). System &quot;reduce motion&quot; also forces shader off.
          </p>
          <div className="bg-black bg-opacity-20 border border-yellow-700 rounded-lg px-4 py-3">
            <label htmlFor="terrain-preset" className="block text-yellow-200 text-sm font-semibold mb-2">
              Terrain Mode
            </label>
            <select
              id="terrain-preset"
              value={terrainPreset}
              onChange={(e) => changeTerrainPreset(e.target.value as TerrainPreset)}
              disabled={isTerrainLocked}
              className="w-full bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="mixed">Mixed Terrain</option>
              <option value="plain">Pure Plain</option>
              <option value="forest">Pure Forest</option>
              <option value="hill">Pure Hill</option>
              <option value="desert">Pure Desert</option>
            </select>
          </div>
          <div className="bg-black bg-opacity-20 border border-yellow-700 rounded-lg px-4 py-3">
            <div className="block text-yellow-200 text-sm font-semibold mb-2">
              Mixed Terrain Pool
            </div>
            <div className="grid gap-2">
              {TERRAIN_TYPES.map((terrainType) => (
                <button
                  key={terrainType}
                  type="button"
                  onClick={() => toggleGeneratedTerrainType(terrainType)}
                  disabled={isTerrainLocked}
                  aria-pressed={terrainGenerationSettings[terrainType]}
                  className={`battle-button flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold ${
                    terrainGenerationSettings[terrainType]
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-gray-700 hover:bg-gray-800"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span>{TERRAIN_LABELS[terrainType]}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${
                      terrainGenerationSettings[terrainType]
                        ? "border-emerald-300 bg-emerald-200/20 text-emerald-100"
                        : "border-gray-400 bg-black/20 text-gray-200"
                    }`}
                  >
                    {terrainGenerationSettings[terrainType] ? "On" : "Off"}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-yellow-100 mt-2 opacity-80">
              Choose which biomes mixed generation can use. Through 14×14, mixed maps use only plain, forest, and hill (up to 3 types). From 16×16 through 20×20, rivers can appear in the mix (up to 4 types). Desert stays isolated and only appears when it is the only enabled mixed biome—use Pure Desert or desert-only mix for sandy battle bonuses.
            </p>
            <p className="text-xs text-yellow-100/75 opacity-90">
              Large maps: edge rails and drag-pan on the grid appear from 14×14 in a normal window, or from 9×9 in fullscreen. With that chrome, arrow keys and WASD pan the map (same step as the rails). You can still wheel-scroll smaller maps if the grid overflows.
            </p>
          </div>
          <button
            onClick={regenerateTerrain}
            disabled={isTerrainLocked}
            className="battle-button w-full px-4 py-3 text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Regenerate Terrain
          </button>
          {isTerrainLocked && (
            <p className="text-xs text-yellow-100 opacity-80">
              Terrain is locked once the battle has started.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const mechanicsSections = [
    {
      key: "core",
      title: "Core Battle Rules",
      subtitle: "The systems you should expect to matter every round.",
      badge: "Always active",
      badgeClass: "border-yellow-700/60 bg-yellow-500/10 text-yellow-100",
      tabClass: "border-yellow-700/45 bg-yellow-500/10 text-yellow-100",
      panel: (
        <div className="space-y-3">
          {GAME_MECHANICS_INFO.map((mechanic, index) => (
            <div key={mechanic.title} className="rounded-2xl border border-yellow-700/45 bg-gradient-to-r from-black/25 to-yellow-950/10 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-yellow-700/50 bg-black/35 text-xl">
                  {mechanic.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-yellow-700/40 bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-300/85">
                      Rule {index + 1}
                    </span>
                    <div className="text-sm font-semibold text-yellow-200 sm:text-base">{mechanic.title}</div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-yellow-100/80">{mechanic.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      key: "abilities",
      title: "Signature Abilities",
      subtitle: "Per-role passives (Brace, Charge, Harrier, …)—they apply automatically when their conditions are met.",
      badge: "Role passives",
      badgeClass: "border-violet-700/50 bg-violet-500/10 text-violet-100",
      tabClass: "border-violet-700/40 bg-violet-950/25 text-violet-100",
      panel: (
        <div className="rounded-3xl border border-violet-700/40 bg-violet-950/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-violet-50/80">
              Same rules as in combat and on unit tooltips. Stacks with leader aura, command aura, terrain, and formation lines where applicable.
            </p>
            <div className="rounded-full border border-violet-700/45 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-100">
              {SIGNATURE_ABILITY_MECHANICS_INFO.length} abilities
            </div>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {SIGNATURE_ABILITY_MECHANICS_INFO.map((ability) => (
              <div key={ability.title} className="rounded-2xl border border-violet-700/30 bg-black/20 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-700/35 bg-violet-950/25 text-xl">
                    {ability.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-violet-100 sm:text-base">{ability.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-violet-50/80">{ability.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      key: "formations",
      title: "Formations",
      subtitle: "Linked allies (orthogonal chain, min. two) unlock faction-specific buffs—one card per line below.",
      badge: "Linked lines",
      badgeClass: "border-amber-700/50 bg-amber-500/10 text-amber-100",
      tabClass: "border-amber-700/40 bg-amber-950/25 text-amber-100",
      panel: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-amber-50/85">
            Named factions can mix the roles listed on each card. HP scaling from formations applies only to{" "}
            <span className="font-semibold text-amber-100/95">Testudo</span> and the generic{" "}
            <span className="font-semibold text-amber-100/95">Battle line</span>; every other line uses combat or move bonuses
            instead. Bonuses appear in the battle log when they apply.
          </p>
          <div className="grid gap-3 xl:grid-cols-2">
            {FORMATION_BUFF_MECHANICS_INFO.map((entry) => (
              <div key={entry.title} className="rounded-2xl border border-amber-700/30 bg-amber-950/10 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-700/35 bg-black/25 text-xl">
                    {entry.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-amber-100 sm:text-base">{entry.title}</div>
                    {entry.subtitle ? (
                      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/75">{entry.subtitle}</div>
                    ) : null}
                    <p className="mt-2 text-sm leading-relaxed text-amber-50/85">{entry.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-amber-700/25 bg-black/20 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-amber-200/80">
            {FORMATION_BUFF_MECHANICS_INFO.length} entries · linking rules + Battle line + 12 faction lines
          </div>
        </div>
      )
    },
    {
      key: "ai",
      title: "AI Doctrine",
      subtitle: "How the computer now chooses movement, targets, and battlefield posture.",
      badge: "Smarter flow",
      badgeClass: "border-indigo-700/50 bg-indigo-500/10 text-indigo-100",
      tabClass: "border-indigo-700/40 bg-indigo-950/20 text-indigo-100",
      panel: (
        <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-indigo-700/35 bg-indigo-950/15 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200/80">Behavior Priorities</div>
            <div className="mt-3 space-y-2">
              {AI_MECHANICS_INFO.map((detail) => (
                <div key={detail} className="rounded-xl border border-indigo-700/25 bg-black/20 px-3 py-3 text-sm leading-relaxed text-indigo-50/85">
                  {detail}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-yellow-700/35 bg-black/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300/80">What This Means</div>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-yellow-700/25 bg-yellow-950/10 px-3 py-3">
                <div className="text-sm font-semibold text-yellow-100">Protect wounded and exposed units</div>
                <p className="mt-1 text-xs leading-relaxed text-yellow-100/75">
                  The AI now hunts soft targets faster, especially damaged troops, archers, siege engines, and isolated leaders.
                </p>
              </div>
              <div className="rounded-xl border border-yellow-700/25 bg-yellow-950/10 px-3 py-3">
                <div className="text-sm font-semibold text-yellow-100">Terrain still matters to both sides</div>
                <p className="mt-1 text-xs leading-relaxed text-yellow-100/75">
                  Hills, forests, rivers, and plains still shape pathing and combat, but the AI now accepts more risk to keep momentum.
                </p>
              </div>
              <div className="rounded-xl border border-yellow-700/25 bg-yellow-950/10 px-3 py-3">
                <div className="text-sm font-semibold text-yellow-100">Formations are more coherent and aggressive</div>
                <p className="mt-1 text-xs leading-relaxed text-yellow-100/75">
                  Expect tighter lines, safer leaders, earlier contact, and more decisive cavalry flanks instead of passive shuffling.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: "special",
      title: "Special Systems",
      subtitle: "Ammo, hybrid troops, civilization passives, battle feedback, optional timed play (bank + move clock), terrain lock, and the scrollable battle log.",
      badge: "Expanded",
      badgeClass: "border-cyan-700/50 bg-cyan-500/10 text-cyan-100",
      tabClass: "border-cyan-700/40 bg-cyan-950/20 text-cyan-100",
      panel: (
        <div className="space-y-4">
          <div className="grid gap-3">
            {ADDITIONAL_MECHANICS_INFO.map((mechanic) => (
              <div key={mechanic.title} className="rounded-2xl border border-cyan-700/35 bg-black/20 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-700/40 bg-cyan-950/25 text-xl">
                    {mechanic.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-cyan-100 sm:text-base">{mechanic.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-cyan-50/78">{mechanic.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      key: "roles",
      title: "Combat Roles",
      subtitle: "Each unit category solves a different battlefield problem.",
      badge: "Role guide",
      badgeClass: "border-yellow-700/60 bg-black/25 text-yellow-100",
      tabClass: "border-yellow-700/45 bg-black/25 text-yellow-100",
      panel: (
        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-2xl border border-cyan-700/35 bg-cyan-950/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-semibold text-cyan-100">
                <span className="mr-2 text-cyan-300">🐎🏹</span>
                Hybrid
              </div>
              <span className="rounded-full border border-cyan-700/50 bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                special
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-cyan-50/80">
              Hybrid troops count as ranged units while they still have ammo. Once they run dry, they immediately shift into close combat behavior.
            </p>
          </div>
          {TROOP_MECHANICS_INFO.map((troopInfo) => (
            <div key={troopInfo.type} className="rounded-2xl border border-yellow-700/40 bg-gradient-to-br from-black/20 to-yellow-950/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-yellow-200">
                  <span className="mr-2 text-cyan-300">{TROOP_MECHANIC_ICONS[troopInfo.type]}</span>
                  {TROOP_MECHANIC_LABELS[troopInfo.type]}
                </div>
                <span className="rounded-full border border-yellow-700/45 bg-black/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-yellow-100">
                  {troopInfo.type}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-yellow-100/80">{troopInfo.summary}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-700/25 bg-emerald-950/10 px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">Strengths</div>
                  <div className="mt-2 space-y-2">
                    {troopInfo.pros.map((pro) => (
                      <p key={pro} className="text-xs leading-relaxed text-lime-100/90">{pro}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-rose-700/25 bg-rose-950/10 px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200">Weaknesses</div>
                  <div className="mt-2 space-y-2">
                    {troopInfo.cons.map((con) => (
                      <p key={con} className="text-xs leading-relaxed text-yellow-100/85">{con}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      key: "terrain",
      title: "Terrain Atlas",
      subtitle: "Terrain effects apply when terrain modifiers are enabled in Graphics.",
      badge: "Optional layer",
      badgeClass: "border-emerald-700/45 bg-emerald-500/10 text-emerald-100",
      tabClass: "border-emerald-700/40 bg-emerald-950/20 text-emerald-100",
      panel: (
        <div className="grid gap-3 xl:grid-cols-2">
          {TERRAIN_MECHANICS_INFO.map((terrainInfo) => (
            <div key={terrainInfo.terrain} className="rounded-2xl border border-emerald-700/35 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-emerald-100">{TERRAIN_LABELS[terrainInfo.terrain]}</div>
                <span className="rounded-full border border-emerald-700/35 bg-black/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-100">
                  {terrainInfo.terrain}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50/78">{terrainInfo.summary}</p>
              <div className="mt-4 space-y-2 rounded-2xl border border-emerald-700/20 bg-emerald-950/10 px-3 py-3">
                {terrainInfo.effects.map((effect) => (
                  <p key={effect} className="text-xs leading-relaxed text-lime-100/90">
                    {effect}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }
  ] as const;

  const activeMechanicsSection = mechanicsSections[activeMechanicsSlide] ?? mechanicsSections[0];
  const cycleMechanicsSlide = (direction: number) => {
    setActiveMechanicsSlide((current) => (current + direction + mechanicsSections.length) % mechanicsSections.length);
  };

  const renderMechanicsContent = () => (
    <div className="space-y-5 text-left">
      <div className="overflow-hidden rounded-3xl border border-yellow-700/70 bg-black/20 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="border-b border-yellow-700/35 px-5 py-5 sm:px-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-yellow-300/75">Battle Handbook</div>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold text-yellow-100 sm:text-3xl">Mechanics at a Glance</h3>
              <p className="mt-2 text-sm leading-relaxed text-yellow-100/80 sm:text-[15px]">
                Use this handbook to read the battle flow quickly: core rules, signature abilities and formation lines,
                special systems (ammo, timers, log), AI doctrine, combat roles, and the terrain atlas. Tabs below switch
                sections—Core rules, Signature Abilities, Formations (per-line buffs), then Special Systems, AI, Roles, Terrain.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3">
              <div className="rounded-2xl border border-yellow-700/50 bg-black/20 px-3 py-3 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-yellow-300/80">Core</div>
                <div className="mt-1 text-2xl font-bold text-yellow-100">{GAME_MECHANICS_INFO.length}</div>
              </div>
              <div className="rounded-2xl border border-violet-700/45 bg-violet-950/15 px-3 py-3 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-violet-200/85">Abilities</div>
                <div className="mt-1 text-2xl font-bold text-violet-100">{SIGNATURE_ABILITY_MECHANICS_INFO.length}</div>
              </div>
              <div className="rounded-2xl border border-amber-700/45 bg-amber-950/15 px-3 py-3 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-200/85">Formations</div>
                <div className="mt-1 text-2xl font-bold text-amber-100">{FORMATION_BUFF_MECHANICS_INFO.length}</div>
              </div>
              <div className="rounded-2xl border border-cyan-700/45 bg-cyan-950/15 px-3 py-3 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/85">Special</div>
                <div className="mt-1 text-2xl font-bold text-cyan-100">{ADDITIONAL_MECHANICS_INFO.length}</div>
              </div>
              <div className="rounded-2xl border border-emerald-700/45 bg-emerald-950/15 px-3 py-3 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/85">Terrain</div>
                <div className="mt-1 text-2xl font-bold text-emerald-100">{TERRAIN_MECHANICS_INFO.length}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 px-5 py-4 sm:px-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-yellow-700/40 bg-black/20 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300/75">Read First</div>
            <div className="mt-2 text-sm font-semibold text-yellow-100">Front lines decide tempo.</div>
            <p className="mt-1 text-sm leading-relaxed text-yellow-100/75">
              Protect ranged and siege units, keep cavalry lanes open, and avoid letting hybrid troops waste their ammo into poor targets.
            </p>
          </div>
          <div className="rounded-2xl border border-violet-700/35 bg-violet-950/15 px-4 py-3 sm:col-span-1">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/85">Passives &amp; lines</div>
            <div className="mt-2 text-sm font-semibold text-violet-100">Violet = signature abilities · Amber = formations</div>
            <p className="mt-1 text-sm leading-relaxed text-violet-50/80">
              Two separate tabs: role abilities (Brace, Charge, …) and one card per formation buff (linking rules, Battle line, Testudo, Phalanx, …).
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-700/35 bg-emerald-950/15 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80">AI Reminder</div>
            <div className="mt-2 text-sm font-semibold text-emerald-100">The computer now plays for shape, not just distance.</div>
            <p className="mt-1 text-sm leading-relaxed text-emerald-50/75">
              Expect stronger front lines, safer support units, and more deliberate flank pressure in longer fights.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-yellow-700/60 bg-black/20 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="text-lg font-bold text-yellow-200">{activeMechanicsSection.title}</div>
            <p className="mt-1 text-sm text-yellow-100/75">{activeMechanicsSection.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => cycleMechanicsSlide(-1)}
              className="battle-button flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 text-lg font-bold hover:bg-gray-700"
              aria-label="Previous mechanics section"
              title="Previous section"
            >
              ←
            </button>
            <div className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${activeMechanicsSection.badgeClass}`}>
              {activeMechanicsSection.badge}
            </div>
            <button
              type="button"
              onClick={() => cycleMechanicsSlide(1)}
              className="battle-button flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 text-lg font-bold hover:bg-gray-700"
              aria-label="Next mechanics section"
              title="Next section"
            >
              →
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {mechanicsSections.map((section, index) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveMechanicsSlide(index)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                index === activeMechanicsSlide
                  ? section.tabClass
                  : "border-white/10 bg-black/20 text-yellow-100/70 hover:border-yellow-700/40 hover:text-yellow-100"
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300/70">
            Section {activeMechanicsSlide + 1} of {mechanicsSections.length}
          </div>
          <div className="flex items-center gap-2">
            {mechanicsSections.map((section, index) => (
              <button
                key={`${section.key}-dot`}
                type="button"
                onClick={() => setActiveMechanicsSlide(index)}
                aria-label={`Open ${section.title}`}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeMechanicsSlide ? "w-8 bg-yellow-300" : "w-2.5 bg-yellow-300/35 hover:bg-yellow-300/60"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-5">
          {activeMechanicsSection.panel}
        </div>
      </div>
    </div>
  );

  const renderUnitsContent = () => {
    const unitsReferenceTeams = ALL_TEAMS.filter((team) => AVAILABLE_TROOPS[team].length > 0);
    const normalizedUnitsQuery = unitsReferenceQuery.trim().toLowerCase();
    const activeUnitsScope: UnitsReferenceScope =
      normalizedUnitsQuery.length > 0
        ? "All"
        : unitsReferenceTeam === "All" || unitsReferenceTeams.includes(unitsReferenceTeam)
          ? unitsReferenceTeam
          : unitsReferenceTeams[0];
    const visibleTroops = allReferenceTroops.filter((troop) => {
      if (activeUnitsScope !== "All" && troop.team !== activeUnitsScope) {
        return false;
      }

      if (!normalizedUnitsQuery) {
        return true;
      }

      return troop.searchKeywords.some((keyword) => keyword.includes(normalizedUnitsQuery));
    });
    const unitsScopeButtons: UnitsReferenceScope[] = ["All", ...unitsReferenceTeams];
    const unitsHeading = activeUnitsScope === "All" ? "All Units" : activeUnitsScope;
    const unitsSubheading =
      normalizedUnitsQuery.length > 0
        ? `Search results for "${unitsReferenceQuery.trim()}"`
        : activeUnitsScope === "All"
          ? "Full roster across every faction"
          : "Compact faction roster";

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-yellow-700/70 bg-black/20 px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-yellow-300/80">Unit Reference</div>
              </div>
              <div className="rounded-full border border-yellow-700/70 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-100">
                {visibleTroops.length} units
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={unitsReferenceQuery}
                onChange={(event) => setUnitsReferenceQuery(event.target.value)}
                placeholder="Search units, factions, or keywords (ranged, mounted, light, heavy, elite, unique, siege…)"
                className="w-full rounded-lg border border-yellow-700/60 bg-black/30 px-3 py-2 text-sm text-yellow-100 placeholder:text-yellow-100/45 focus:border-yellow-400 focus:outline-none"
              />
              {unitsReferenceQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setUnitsReferenceQuery("")}
                  className="rounded-lg border border-yellow-700/60 bg-black/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-yellow-100 hover:border-yellow-500 hover:text-yellow-50"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {unitsScopeButtons.map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => setUnitsReferenceTeam(team)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    team === activeUnitsScope
                      ? "border-yellow-400 bg-yellow-500/15 text-yellow-100"
                      : "border-yellow-700/60 bg-black/20 text-yellow-200 hover:border-yellow-500 hover:text-yellow-100"
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-yellow-700/70 bg-black/20">
          <div className="flex items-center justify-between gap-3 border-b border-yellow-700/40 px-3 py-3 sm:px-4">
            <div className="min-w-0">
              <div className="text-lg font-bold text-yellow-200 sm:text-xl">{unitsHeading}</div>
              <div className="text-[11px] uppercase tracking-wide text-yellow-100/70">{unitsSubheading}</div>
            </div>
            <div className="hidden rounded-full border border-yellow-700/60 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-100 sm:block">
              Template stats
            </div>
          </div>

          <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
            {visibleTroops.map((troop) => {
              const referenceStats = troop.referenceStats;
              const troopTypeDisplay = troop.troopTypeDisplay;
              const rosterWeightDisplay = getTroopWeightDisplay({ role: troop.role });
              const troopAbilities = getTroopAbilities(troop.role);
              const troopIcon =
                typeof troop.Icon === "string" && troop.Icon.length <= 3
                  ? troop.Icon
                  : ICON_MAP[troop.Icon as keyof typeof ICON_MAP] || troop.Icon || "⚔️";

              return (
                <div
                  key={`${troop.team}-${troop.role}`}
                  className="rounded-lg border border-yellow-700/50 bg-black/25 px-3 py-2.5 cursor-pointer transition-colors hover:border-yellow-500/55 hover:bg-black/35"
                  onClick={() => playTroopSelectSfx({ role: troop.role, ...generateTroopStats(troop.role) })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      playTroopSelectSfx({ role: troop.role, ...generateTroopStats(troop.role) });
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-yellow-700/50 bg-black/30 text-2xl leading-none">
                      {troopIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-yellow-200">{troop.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {(activeUnitsScope === "All" || normalizedUnitsQuery.length > 0) && (
                          <span className="rounded-full border border-amber-700/60 bg-amber-950/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                            {troop.team}
                          </span>
                        )}
                        <span className="rounded-full border border-yellow-700/60 bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-yellow-100">
                          {troop.role}
                        </span>
                        <span className="rounded-full border border-cyan-700/60 bg-cyan-950/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cyan-200">
                          {troopTypeDisplay.icon} {troopTypeDisplay.label}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${rosterWeightDisplay.badgeClassName}`}
                          title={rosterWeightDisplay.summary}
                        >
                          {rosterWeightDisplay.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-yellow-100">
                    <span className="rounded-md border border-yellow-700/40 bg-black/20 px-2 py-1">
                      HP {referenceStats.hp[0]}-{referenceStats.hp[1]}
                    </span>
                    <span className="rounded-md border border-yellow-700/40 bg-black/20 px-2 py-1">
                      ATK {referenceStats.attack[0]}-{referenceStats.attack[1]}
                    </span>
                    <span className="rounded-md border border-yellow-700/40 bg-black/20 px-2 py-1">RNG {referenceStats.range}</span>
                    <span className="rounded-md border border-yellow-700/40 bg-black/20 px-2 py-1">MOV {referenceStats.move}</span>
                    <span className="rounded-md border border-yellow-700/40 bg-black/20 px-2 py-1">AMMO {referenceStats.ammo}</span>
                    <span
                      className={`rounded-md border px-2 py-1 font-semibold uppercase tracking-wide ${rosterWeightDisplay.badgeClassName}`}
                      title={rosterWeightDisplay.summary}
                    >
                      {rosterWeightDisplay.label}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/78">Signature Skills</div>
                    {troopAbilities.length > 0 ? (
                      <div className="mt-1.5 space-y-1.5">
                        {troopAbilities.map((ability) => (
                          <div
                            key={ability.key}
                            className="rounded-lg border border-cyan-700/35 bg-cyan-950/20 px-2.5 py-2 text-[11px] leading-relaxed text-cyan-50"
                          >
                            <span className="font-semibold text-cyan-200">{ability.name}:</span> {ability.description}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1.5 text-[11px] text-yellow-100/68">No signature skills.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {visibleTroops.length === 0 && (
            <div className="border-t border-yellow-700/40 px-4 py-6 text-center text-sm text-yellow-100/80">
              No units matched that search. Try a faction, role, or keywords like `ranged`, `mounted`, `light`, `heavy`, `elite`, `unique`, `hybrid`, or `siege`.
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Oversized grids: native touch scroll (touch-action on viewport) + mouse drag-pan.
   * Defer setPointerCapture until movement exceeds a few px so taps on tiles still register as clicks.
   */
  const handleViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!showGridNavigation) return;
    if (e.pointerType === "touch") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const viewport = battlefieldViewportRef.current;
    if (!viewport) return;

    battlefieldPanCleanupRef.current?.();

    const pointerId = e.pointerId;
    const pointerTarget = e.currentTarget;
    const startX = e.clientX;
    const startY = e.clientY;
    const baseScrollLeft = viewport.scrollLeft;
    const baseScrollTop = viewport.scrollTop;
    let moved = false;

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (!moved) {
        if (Math.abs(deltaX) <= 4 && Math.abs(deltaY) <= 4) return;
        moved = true;
        skipNextGridClickRef.current = true;
        pointerTarget.setPointerCapture(pointerId);
        setIsPanningGrid(true);
      }

      event.preventDefault();
      pointerTarget.scrollLeft = baseScrollLeft - deltaX;
      pointerTarget.scrollTop = baseScrollTop - deltaY;
    };

    const stopPointerPan = (event?: PointerEvent) => {
      if (event && event.pointerId !== pointerId) return;

      if (pointerTarget.hasPointerCapture(pointerId)) {
        pointerTarget.releasePointerCapture(pointerId);
      }

      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", stopPointerPan);
      window.removeEventListener("pointercancel", stopPointerPan);
      battlefieldPanCleanupRef.current = null;
      setIsPanningGrid(false);
    };

    window.addEventListener("pointermove", handleWindowPointerMove, { passive: false });
    window.addEventListener("pointerup", stopPointerPan);
    window.addEventListener("pointercancel", stopPointerPan);
    battlefieldPanCleanupRef.current = () => stopPointerPan();
  };

  const appBackgroundStyle = {
    backgroundImage: 'linear-gradient(rgba(20, 15, 10, 0.55), rgba(20, 15, 10, 0.68)), url("/gamebkg.png")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed"
  } as const;

  if (!gameMode) {
    if (startScreen === "options") {
      return (
        <div className="cc-game-cursors flex flex-col items-center justify-center p-6 space-y-6 min-h-screen" style={appBackgroundStyle}>
          <div className="game-ui p-8 text-center max-w-2xl w-full">
            <div className="mb-4 flex items-center justify-between gap-4">
              <button
                onClick={() => setStartScreen("menu")}
                className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
              >
                Back
              </button>
              <h1 className="text-4xl font-bold text-yellow-200 drop-shadow-lg">Options</h1>
              <button
                type="button"
                onClick={persistUserSettings}
                className="battle-button px-4 py-2 text-sm font-semibold bg-amber-700 hover:bg-amber-800"
              >
                Save
              </button>
            </div>
            {settingsSaveNotice && (
              <p className="mb-4 text-center text-sm text-emerald-300/95">{settingsSaveNotice}</p>
            )}
            {renderGameOptionsContent()}
          </div>
          <AppVersionCorner />
        </div>
      );
    }

    if (startScreen === "about") {
      const aboutSlideLabels = ["Overview", "Modes & scale", "Developer", "Controls"] as const;
      return (
        <div className="cc-game-cursors flex min-h-screen flex-col items-center justify-center p-4 sm:p-6" style={appBackgroundStyle}>
          <div className="game-ui w-full max-w-3xl overflow-hidden p-5 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setStartScreen("menu")}
                className="battle-button w-fit px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
              >
                Back
              </button>
              <div className="text-center sm:flex-1 sm:text-center">
                <h1 className="text-3xl font-bold text-yellow-200 drop-shadow-lg sm:text-4xl">About Strategos</h1>
                <p className="mt-1 text-xs uppercase tracking-[0.28em] text-amber-200/75">Swipe panels · ← → keys · Prev / Next</p>
              </div>
              <div className="flex justify-center sm:justify-end">
                <div className="rounded-full border border-yellow-500/35 bg-black/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-100">
                  v{GAME_VERSION}
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[24px] border border-amber-900/50 bg-gradient-to-b from-black/45 via-amber-950/20 to-black/50 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between gap-2 border-b border-amber-800/30 bg-black/30 px-3 py-3 sm:px-4">
                <button
                  type="button"
                  aria-label="Previous section"
                  disabled={aboutSlideIndex === 0}
                  onClick={() => setAboutSlideIndex((i) => Math.max(0, i - 1))}
                  className="battle-button shrink-0 px-3 py-2 text-xs font-semibold disabled:pointer-events-none disabled:opacity-35 sm:px-4 sm:text-sm"
                >
                  ← Prev
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300/85">
                    {aboutSlideIndex + 1} / {aboutSlideLabels.length}
                  </div>
                  <div className="truncate text-sm font-bold text-yellow-100 sm:text-base">{aboutSlideLabels[aboutSlideIndex]}</div>
                </div>
                <button
                  type="button"
                  aria-label="Next section"
                  disabled={aboutSlideIndex >= aboutSlideLabels.length - 1}
                  onClick={() => setAboutSlideIndex((i) => Math.min(aboutSlideLabels.length - 1, i + 1))}
                  className="battle-button shrink-0 px-3 py-2 text-xs font-semibold disabled:pointer-events-none disabled:opacity-35 sm:px-4 sm:text-sm"
                >
                  Next →
                </button>
              </div>

              <div
                className="relative overflow-hidden touch-pan-y"
                onTouchStart={(e) => {
                  aboutSwipeStartXRef.current = e.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(e) => {
                  const start = aboutSwipeStartXRef.current;
                  aboutSwipeStartXRef.current = null;
                  if (start == null) return;
                  const end = e.changedTouches[0]?.clientX;
                  if (end === undefined) return;
                  const delta = end - start;
                  if (Math.abs(delta) < 56) return;
                  if (delta < 0) {
                    setAboutSlideIndex((i) => Math.min(ABOUT_SCREEN_SLIDE_LAST, i + 1));
                  } else {
                    setAboutSlideIndex((i) => Math.max(0, i - 1));
                  }
                }}
              >
                <div
                  className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
                  style={{ transform: `translateX(-${aboutSlideIndex * 100}%)` }}
                >
                  <div className="w-full shrink-0 px-4 py-5 sm:px-6 sm:py-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-yellow-300/75">Game overview</div>
                    <h2 className="mt-2 text-xl font-bold text-yellow-100 sm:text-2xl">Tactical battles across living battlefields</h2>
                    <p className="mt-3 text-sm leading-7 text-yellow-50/85">
                      Strategos is a tactical grid war game where historical-inspired factions clash across changing terrain. Each
                      battle is shaped by troop roles, linked formation lines, civilization passives, signature abilities,
                      and battlefield feedback that helps you read momentum in real time.
                    </p>
                  </div>

                  <div className="w-full shrink-0 px-4 py-5 sm:px-6 sm:py-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-yellow-300/75">How you can play</div>
                    <h2 className="mt-2 text-xl font-bold text-yellow-100 sm:text-2xl">Modes, build, and scope</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">Single player</div>
                        <p className="mt-1 text-sm leading-6 text-yellow-50/82">
                          Campaign battles against the AI—terrain, faction buffs, and momentum all matter.
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">Multiplayer</div>
                        <p className="mt-1 text-sm leading-6 text-yellow-50/82">
                          Two armies, one machine—local pass-and-play when it&apos;s your turn.
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">Custom scenario</div>
                        <p className="mt-1 text-sm leading-6 text-yellow-50/82">
                          Place troops by hand and test matchups however you like.
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-300/80">This build</div>
                        <p className="mt-1 text-sm leading-6 text-yellow-50/82">
                          {GAME_BUILD_LABEL}—smarter AI, deeper passives and terrain, richer battle feedback.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-amber-700/25 bg-black/30 px-2 py-2.5 text-center">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-200/75">Factions</div>
                        <div className="mt-0.5 text-lg font-bold tabular-nums text-yellow-50">{ALL_TEAMS.length}</div>
                      </div>
                      <div className="rounded-xl border border-amber-700/25 bg-black/30 px-2 py-2.5 text-center">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-200/75">Maps</div>
                        <div className="mt-0.5 text-lg font-bold tabular-nums text-yellow-50">{Object.keys(levels).length}</div>
                      </div>
                      <div className="rounded-xl border border-amber-700/25 bg-black/30 px-2 py-2.5 text-center">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-200/75">Grid</div>
                        <div className="mt-0.5 text-lg font-bold tabular-nums text-yellow-50">
                          {BATTLEFIELD_SIZE_OPTIONS[0]}–{BATTLEFIELD_SIZE_OPTIONS[BATTLEFIELD_SIZE_OPTIONS.length - 1]}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full shrink-0 px-4 py-5 sm:px-6 sm:py-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300/80">From the developer</div>
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div
                        className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-600/50 bg-gradient-to-br from-amber-900/60 to-black/60 font-serif text-2xl font-bold text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:mx-0"
                        aria-hidden
                      >
                        DH
                      </div>
                      <div className="min-w-0 flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-bold text-yellow-100 sm:text-2xl">Dimitar Hristovski</h2>
                        <p className="mt-1 text-sm font-semibold text-amber-200/90">Creator &amp; developer — Strategos</p>
                        <p className="mt-3 text-sm leading-7 text-yellow-50/85">
                          I built Strategos as a solo project: a love letter to tight, readable tactics on a grid—where faction
                          identity, terrain, and moment-to-moment feedback matter as much as raw damage. Every system here is
                          something I wanted to feel on the battlefield: clearer stakes, smarter AI pressure, and battles that
                          tell a story without drowning you in numbers.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-yellow-50/85">
                          If you&apos;re playing, thank you for spending time with something I poured a lot of care into. I hope
                          the fights stay tense, the flanks feel earned, and you find a favorite faction to main.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full shrink-0 px-4 py-5 sm:px-6 sm:py-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-yellow-300/75">Controls &amp; input</div>
                    <h2 className="mt-2 text-xl font-bold text-yellow-100 sm:text-2xl">Keyboard &amp; mouse</h2>
                    <div className="mt-4 max-h-[min(52vh,22rem)] overflow-y-auto pr-1">
                      <GameControlsReferenceBody />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 border-t border-amber-800/30 bg-black/25 px-3 py-3">
                {aboutSlideLabels.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={`Go to ${label}`}
                    aria-current={i === aboutSlideIndex ? "true" : undefined}
                    onClick={() => setAboutSlideIndex(i)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                      i === aboutSlideIndex
                        ? "bg-amber-600/90 text-black shadow-[0_0_16px_rgba(245,158,11,0.35)]"
                        : "border border-amber-800/40 bg-black/30 text-amber-100/80 hover:border-amber-600/50 hover:bg-amber-950/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <AppVersionCorner />
        </div>
      );
    }

    return (
      <div
        className="cc-game-cursors flex min-w-0 flex-col items-center justify-center overflow-visible p-3 pb-8 pt-24 min-h-screen sm:p-5 sm:pb-10 sm:pt-28"
        style={appBackgroundStyle}
      >
        <div className="relative z-0 w-full min-w-0 max-w-3xl">
          <div className="game-ui relative z-10 mx-auto w-full max-w-[min(100%,28rem)] overflow-hidden rounded-2xl px-4 pb-6 pt-[6rem] text-center shadow-[0_16px_40px_rgba(0,0,0,0.42)] ring-1 ring-black/25 sm:max-w-md sm:px-8 sm:pb-8 sm:pt-28">
            <div className="mx-auto flex w-full max-w-md flex-col gap-4">
              <button
                type="button"
                onClick={startSinglePlayerMode}
                className="battle-button w-full px-6 py-4 text-lg font-semibold bg-gray-700 hover:bg-gray-800"
              >
                Single Player
              </button>
              <button
                type="button"
                onClick={startMultiplayerMode}
                className="battle-button w-full px-6 py-4 text-lg font-semibold bg-gray-700 hover:bg-gray-800"
              >
                Multiplayer
              </button>
              <button
                type="button"
                onClick={startCustomScenarioMode}
                className="battle-button w-full px-6 py-4 text-lg font-semibold bg-gray-700 hover:bg-gray-800"
              >
                Custom scenario
              </button>
              <button
                type="button"
                onClick={() => setStartScreen("about")}
                className="battle-button w-full px-6 py-4 text-lg font-semibold bg-gray-700 hover:bg-gray-800"
              >
                About
              </button>
            </div>

            <div className="mx-auto mt-6 w-full max-w-md border-t border-black/20 pt-4">
              <button
                type="button"
                onClick={() => setStartScreen("options")}
                className="battle-button w-full px-6 py-3 text-lg font-semibold bg-gray-800/90 hover:bg-gray-900"
              >
                Options
              </button>
            </div>
          </div>
          <h1 className="pointer-events-none absolute left-1/2 top-0 z-30 w-[min(100%,25rem)] max-w-[calc(100vw-1rem)] -translate-x-1/2 -translate-y-[40%] px-1 sm:max-w-[42rem] sm:-translate-y-[44%]">
            <img
              src="/strategos.png"
              alt="Strategos"
              width={640}
              height={200}
              className="mx-auto h-auto max-h-[min(48vh,18rem)] w-full object-contain object-center drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)] sm:max-h-[min(52vh,22rem)]"
              decoding="async"
            />
          </h1>
        </div>
        <AppVersionCorner />
      </div>
    );
  }

  const battleOutcomeBanner = gameStarted && !isSetupMode ? checkEnd() : null;
  const dualBattleConfigLocked = Boolean(
    gameStarted && !isSetupMode && (gameMode === "multiplayer" || gameMode === "ai-versus")
  );

  return (
    <div
      className="cc-game-cursors flex w-full max-w-full min-w-0 flex-col items-center overflow-x-hidden min-h-screen min-h-[100dvh]"
      style={appBackgroundStyle}
    >
      <div
        ref={battlefieldRef}
        className={`fullscreen-battlefield-shell flex w-full max-w-full min-w-0 flex-col ${
          isBattlefieldFullscreen ? "bf-fs-root min-h-0 flex-1 justify-start" : "items-center"
        }`}
      >
      {/* Top Header */}
      <div className="sticky top-0 z-30 w-full shrink-0">
        <div className="game-ui w-full rounded-none border-x-0 px-2 sm:px-3 py-2 flex flex-wrap items-center gap-2 justify-between relative">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-yellow-200 drop-shadow-lg">Strategos</h1>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/60 bg-black/30 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold tabular-nums text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                title={
                  reduceUiMotion
                    ? "Time of day (cycle paused — reduced motion)"
                    : "Time of day (synced with battlefield sky)"
                }
                aria-label={`${dayNightClock.isNight ? "Night" : "Day"}, ${dayNightClock.timeLabel}`}
              >
                <span aria-hidden className="select-none text-sm leading-none">
                  {reduceUiMotion ? "☀️" : dayNightClock.isNight ? "🌙" : "☀️"}
                </span>
                <span>{dayNightClock.timeLabel}</span>
              </span>
              <span className="rounded-full border border-yellow-700 bg-black bg-opacity-20 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-yellow-100">
                {gameMode === "multiplayer"
                  ? `PvP hot-seat · ${multiplayerTeams.length} factions`
                  : gameMode === "ai-versus"
                    ? `AI vs AI · ${multiplayerTeams.length} factions`
                    : gameMode === "custom-scenario"
                      ? "Custom scenario"
                      : "Player vs AI"}
              </span>
            </div>
            {(gameMode === "multiplayer" || gameMode === "ai-versus") && (
              <div className="mt-1.5 flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 text-[9px] sm:text-[10px] text-yellow-100/90">
                <span className="font-semibold uppercase tracking-wide text-yellow-200/80">Match</span>
                <select
                  aria-label="Match type: player versus player or AI versus AI"
                  className="max-w-[11rem] rounded border border-yellow-600/70 bg-gray-900/90 px-1.5 py-0.5 text-[9px] font-semibold text-yellow-100 focus:border-amber-400 focus:outline-none sm:text-[10px]"
                  disabled={dualBattleConfigLocked}
                  value={gameMode === "ai-versus" ? "ai" : "pvp"}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "ai") {
                      setGameMode("ai-versus");
                      restartSessionForGameplaySettings({ gameMode: "ai-versus" });
                    } else {
                      setGameMode("multiplayer");
                      restartSessionForGameplaySettings({ gameMode: "multiplayer" });
                    }
                  }}
                >
                  <option value="pvp">PvP (hot-seat)</option>
                  <option value="ai">AI vs AI (spectator)</option>
                </select>
                <label className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide text-yellow-200/80">
                  Factions
                  <input
                    type="number"
                    min={2}
                    max={ALL_TEAMS.length}
                    title="How many factions in this match (2–12)"
                    className="w-10 rounded border border-yellow-600/70 bg-gray-900/90 px-1 py-0.5 text-center font-mono text-[10px] font-bold text-yellow-100 tabular-nums focus:border-amber-400 focus:outline-none sm:w-11 sm:text-[11px]"
                    disabled={dualBattleConfigLocked}
                    value={multiplayerTeams.length}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (!Number.isFinite(n)) return;
                      const next = resizeMultiplayerTeamList(multiplayerTeams, n);
                      const filtered = customUnits.filter((u: any) => next.includes(u.team));
                      setMultiplayerTeams(next);
                      setCustomUnits(filtered);
                      setSelectedTeam((st) => (next.includes(st) ? st : next[0]));
                      restartSessionForGameplaySettings({
                        gameMode: gameMode === "ai-versus" ? "ai-versus" : "multiplayer",
                        customUnitsForReroll: filtered
                      });
                    }}
                  />
                </label>
                {gameMode === "ai-versus" && (
                  <>
                    <span className="font-semibold uppercase tracking-wide text-yellow-200/80">AI</span>
                    <select
                      aria-label="AI difficulty"
                      className="max-w-[9rem] rounded border border-yellow-600/70 bg-gray-900/90 px-1.5 py-0.5 text-[9px] font-semibold text-yellow-100 focus:border-amber-400 focus:outline-none sm:max-w-none sm:text-[10px]"
                      value={aiDifficulty}
                      onChange={(e) => {
                        const next = e.target.value as AiDifficulty;
                        setAiDifficulty(next);
                        restartSessionForGameplaySettings({ aiDifficulty: next });
                      }}
                    >
                      {AI_DIFFICULTY_ORDER.map((d) => (
                        <option key={d} value={d}>
                          {AI_DIFFICULTY_LABELS[d]}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-yellow-200 text-xs sm:text-sm font-semibold">
            {!isSetupMode && <span className="rounded-full border border-yellow-700 bg-black bg-opacity-20 px-3 py-1">Round {round}</span>}

            {!isSetupMode && gameStarted && gameOptions.timedPlayEnabled && timedPlayTeamKeys.length > 0 && !timedPlayLoserTeam && (
              <span
                className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-lg border border-amber-700/50 bg-black/20 px-1.5 py-1"
                title={`Timed play: ${TURN_ACTION_BUDGET_MS / 1000}s move clock + ${getPerTeamTimeBudgetMinutes(battlefieldSize)} min per faction`}
              >
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tabular-nums sm:text-[11px] ${
                    turnActionSecsLeft <= 5
                      ? "border-rose-500/85 bg-rose-950/40 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                      : "border-sky-600/70 bg-sky-950/30 text-sky-100"
                  }`}
                  title={`${TURN_ACTION_BUDGET_MS / 1000}s move clock (${turn})`}
                >
                  <span aria-hidden>⏲</span>
                  <span className="max-w-[6rem] truncate">{turn}</span>
                  <span className="text-yellow-100/90">·</span>
                  <span>{turnActionSecsLeft}s</span>
                </span>
                {timedPlayTeamKeys.map((teamKey) => {
                  const bank = timedPlayCommittedMs[teamKey] ?? 0;
                  const onTurn = teamKey === turn && !timedPlayLoserTeam;
                  const remainingMs =
                    timedPlayLoserTeam === teamKey
                      ? 0
                      : onTurn
                        ? Math.max(0, bank - (matchNowMs - timedPlayTurnStartedAtRef.current))
                        : bank;
                  const low = remainingMs <= 60_000 && timedPlayLoserTeam !== teamKey;
                  return (
                    <span
                      key={teamKey}
                      className={`inline-flex max-w-[8.5rem] items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums sm:text-[11px] ${
                        timedPlayLoserTeam === teamKey
                          ? "border-rose-500/80 bg-rose-950/40 text-rose-100"
                          : low
                            ? "border-orange-500/80 bg-orange-950/35 text-orange-100"
                            : teamKey === turn
                              ? "border-amber-400/90 bg-black/35 text-amber-50"
                              : "border-amber-600/70 bg-black/30 text-amber-50/90"
                      }`}
                    >
                      <span className="min-w-0 truncate" title={teamKey}>
                        {teamKey}
                      </span>
                      <span className="shrink-0" aria-hidden>
                        ·
                      </span>
                      <span className="shrink-0">{formatMatchCountdown(remainingMs)}</span>
                    </span>
                  );
                })}
              </span>
            )}

            {!isSetupMode && gameMode !== "custom-scenario" && (
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="level-select" className="text-xs uppercase tracking-wide text-yellow-100">
                  Level
                </label>
                <select
                  id="level-select"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value as keyof typeof levels)}
                  className="bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:border-yellow-400"
                >
                  {(Object.entries(LEVEL_MATCHUP_LABELS) as [keyof typeof levels, string][]).map(([levelKey, label], index) => (
                    <option key={levelKey} value={levelKey}>
                      {`Level ${index + 1}: ${label}`}
                    </option>
                  ))}
                </select>
                {gameMode === "single-player" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="single-player-team" className="text-xs uppercase tracking-wide text-yellow-100">
                      Faction
                    </label>
                    <select
                      id="single-player-team"
                      value={playerTeam}
                      onChange={(e) => {
                        const nextTeam = e.target.value as TeamName;
                        restartSessionForGameplaySettings({ playerTeam: nextTeam });
                      }}
                      className="bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:border-yellow-400"
                    >
                      {levelTeams.map((team) => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                    <label htmlFor="single-player-ai-difficulty" className="text-xs uppercase tracking-wide text-yellow-100">
                      AI difficulty
                    </label>
                    <select
                      id="single-player-ai-difficulty"
                      value={aiDifficulty}
                      onChange={(e) => {
                        const next = e.target.value as AiDifficulty;
                        setAiDifficulty(next);
                        restartSessionForGameplaySettings({ aiDifficulty: next });
                      }}
                      className="bg-gray-800 text-yellow-200 border border-yellow-600 rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:border-yellow-400"
                    >
                      {AI_DIFFICULTY_ORDER.map((d) => (
                        <option key={d} value={d}>
                          {AI_DIFFICULTY_LABELS[d]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setIsGameMenuOpen((open) => !open)}
              className="battle-button px-3 py-1.5 text-xs sm:text-sm font-semibold bg-gray-700 hover:bg-gray-800"
            >
              Game Menu
            </button>
          </div>
        </div>

        {battleOutcomeBanner && (
          <div
            className="game-ui w-full rounded-none border-x-0 border-t border-emerald-600/55 bg-emerald-950/88 px-3 py-2 text-center shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
            role="status"
            aria-live="polite"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/85">Battle over</div>
            <div className="mt-0.5 text-sm font-bold leading-snug text-emerald-50 sm:text-base">{battleOutcomeBanner}</div>
          </div>
        )}

        {passiveTeams.length > 0 && (
          <div className="fixed left-3 top-28 z-[60] max-h-[min(calc(100dvh-7rem),calc(100vh-7rem))] overflow-y-auto overflow-x-hidden pb-4 pt-0.5 [-webkit-overflow-scrolling:touch] sm:left-4">
            <div className="game-ui flex flex-col items-center gap-3 rounded-r-2xl border border-yellow-600/70 bg-gray-950/90 px-2 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm">
              {passiveTeams.map((team) => (
                <FactionPassiveRailCell key={team} team={team} />
              ))}
            </div>
          </div>
        )}

        <div className="pointer-events-none fixed right-3 top-28 z-20 flex max-h-[calc(100vh-8rem)] flex-col items-end gap-2 sm:right-4">
          {isBattlefieldFullscreen && !isSetupMode && gameStarted && gameOptions.timedPlayEnabled && timedPlayTeamKeys.length > 0 && !timedPlayLoserTeam && (
            <div
              className="pointer-events-auto flex max-w-[min(92vw,16rem)] flex-col gap-1.5 rounded-lg border border-amber-600/70 bg-gray-900/85 px-2.5 py-1.5 text-[10px] font-semibold backdrop-blur-sm sm:text-[11px]"
              title={`Timed play: ${TURN_ACTION_BUDGET_MS / 1000}s / turn + total bank`}
            >
              <div className="text-[9px] uppercase tracking-wide text-amber-200/90">Timed play</div>
              <div
                className={`flex items-center justify-between gap-2 rounded border px-2 py-0.5 font-mono font-bold tabular-nums ${
                  turnActionSecsLeft <= 5
                    ? "border-rose-500/70 bg-rose-950/40 text-rose-100"
                    : "border-sky-600/60 bg-sky-950/30 text-sky-100"
                }`}
              >
                <span className="truncate">⏲ {turn}</span>
                <span>{turnActionSecsLeft}s</span>
              </div>
              {timedPlayTeamKeys.map((teamKey) => {
                const bank = timedPlayCommittedMs[teamKey] ?? 0;
                const onTurn = teamKey === turn && !timedPlayLoserTeam;
                const remainingMs =
                  timedPlayLoserTeam === teamKey
                    ? 0
                    : onTurn
                      ? Math.max(0, bank - (matchNowMs - timedPlayTurnStartedAtRef.current))
                      : bank;
                const low = remainingMs <= 60_000 && timedPlayLoserTeam !== teamKey;
                return (
                  <div
                    key={teamKey}
                    className={`flex items-center justify-between gap-2 font-mono tabular-nums ${
                      timedPlayLoserTeam === teamKey
                        ? "text-rose-200"
                        : low
                          ? "text-orange-200"
                          : teamKey === turn
                            ? "text-amber-100"
                            : "text-amber-100/80"
                    }`}
                  >
                    <span className="min-w-0 truncate" title={teamKey}>
                      {teamKey}
                    </span>
                    <span className="shrink-0">{formatMatchCountdown(remainingMs)}</span>
                  </div>
                );
              })}
            </div>
          )}
          {isBattlefieldFullscreen && !isSetupMode && (
            <div className="pointer-events-auto max-w-[min(92vw,22rem)] whitespace-normal border border-yellow-700 bg-gray-900/80 px-2.5 py-1.5 text-center text-xs font-semibold leading-snug text-yellow-100 backdrop-blur-sm sm:text-sm">
              {checkEnd() || `${turn.toUpperCase()} TURN`}
            </div>
          )}

          {!isSetupMode && gameStarted && (
            <div
              className="pointer-events-auto text-blue-200 font-semibold bg-blue-900/70 px-2.5 py-1.5 rounded border border-blue-600 text-center backdrop-blur-sm"
              title={`${mergeCount}/2 merges used`}
            >
              <span className="block text-[11px] uppercase tracking-wide">Merges</span>
              <span className="block text-xs sm:text-sm">{mergeCount}/2</span>
            </div>
          )}

          {!isSetupMode && focusedBattleUnit && (
            <div
              className={`game-ui pointer-events-auto absolute right-0 w-[18rem] rounded-2xl border border-amber-700/70 bg-black/20 p-3 text-left text-yellow-100 shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-sm ${
                isBattlefieldFullscreen ? "top-[4.75rem]" : "top-[3.4rem]"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-2xl">
                  {(() => {
                    const FocusedUnitIcon = getUnitDisplayIcon(focusedBattleUnit);
                    return typeof FocusedUnitIcon === "string" ? FocusedUnitIcon : (FocusedUnitIcon ? createElement(FocusedUnitIcon) : "⚔️");
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-amber-300/80">
                    {selected ? "Selected Unit" : "Focused Unit"}
                  </div>
                  <div className="truncate text-base font-semibold text-yellow-50">{focusedBattleUnit.name}</div>
                  <div className="truncate text-xs text-amber-200/85">{focusedBattleUnit.team} · {focusedBattleUnit.role}</div>
                  {focusedTroopTypeDisplay && focusedWeightDisplay && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="rounded-full border border-cyan-700/45 bg-cyan-950/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-100">
                        {focusedTroopTypeDisplay.icon} {focusedTroopTypeDisplay.label}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${focusedWeightDisplay.badgeClassName}`}
                        title={focusedWeightDisplay.summary}
                      >
                        {focusedWeightDisplay.label}
                      </span>
                    </div>
                  )}
                </div>
                </div>
                <button
                  type="button"
                  onClick={dismissFocusedBattlePanel}
                  className="battle-button flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 p-0 text-sm font-bold leading-none hover:bg-gray-800"
                  aria-label="Close selected unit"
                  title="Close"
                >
                  X
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">HP {focusedBattleUnit.hp}/{focusedBattleUnit.maxHp}</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                          ATK {getDisplayedAttack(focusedBattleUnit, currentBattleUnits, terrainEffectMap, { round })}
                        </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">RNG {getRangeForBattle(focusedBattleUnit)}</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">MOV {getMoveForBattle(focusedBattleUnit)}</div>
              </div>
              <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-950/20 px-2.5 py-2 text-xs text-emerald-100/90">
                <span className="font-semibold text-emerald-200">Terrain:</span>{" "}
                {TERRAIN_LABELS[focusedTerrainType ?? "plain"]}
              </div>
              <div className="mt-3 rounded-xl border border-cyan-500/15 bg-cyan-950/20 px-2.5 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/85">Signature Skills</div>
                {focusedUnitAbilities.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {focusedUnitAbilities.map((ability) => (
                      <div key={ability.key} className="rounded-lg border border-cyan-500/20 bg-black/20 px-2.5 py-2 text-[11px] leading-5 text-cyan-50/92">
                        <span className="font-semibold text-cyan-200">{ability.name}:</span> {ability.description}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg border border-white/8 bg-black/20 px-2.5 py-2 text-[11px] leading-5 text-yellow-100/72">
                    This unit has no signature passive skill.
                  </div>
                )}
              </div>
              {focusedFeedbackKinds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {focusedFeedbackKinds.map((kind) => (
                    <div
                      key={kind}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                        kind === "hit" || kind === "meleeHit"
                          ? "border-orange-400/50 bg-orange-500/10 text-orange-100"
                          : kind === "death"
                            ? "border-red-400/50 bg-red-500/10 text-red-100"
                            : kind === "charge"
                              ? "border-amber-400/50 bg-amber-500/10 text-amber-100"
                              : kind === "morale"
                                ? "border-violet-400/50 bg-violet-500/10 text-violet-100"
                                : kind === "ranged"
                                  ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-100"
                                  : kind === "siegeFog"
                                    ? "border-slate-400/50 bg-slate-500/15 text-slate-100"
                                    : "border-emerald-400/50 bg-emerald-500/10 text-emerald-100"
                      }`}
                    >
                      {kind === "hit"
                        ? "Under Fire"
                        : kind === "meleeHit"
                          ? "Melee clash"
                          : kind === "death"
                          ? "Breaking"
                          : kind === "charge"
                            ? "Charging"
                            : kind === "morale"
                              ? "Shaken"
                              : kind === "ranged"
                                ? "Volley"
                                : kind === "siegeFog"
                                  ? "Siege dust"
                                  : "On The Move"}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 space-y-1.5">
                {focusedEffectNotes.slice(0, 3).map((note) => (
                  <div key={note} className="rounded-xl border border-white/8 bg-black/25 px-2.5 py-2 text-[11px] leading-5 text-yellow-100/88">
                    {note}
                  </div>
                ))}
                {focusedEffectNotes.length === 0 && (
                  <div className="rounded-xl border border-white/8 bg-black/25 px-2.5 py-2 text-[11px] leading-5 text-yellow-100/72">
                    No special effects active on this unit right now.
                  </div>
                )}
              </div>
            </div>
          )}

          {canRotateTroops && (
            <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-2xl border border-yellow-700 bg-gray-900/80 px-1.5 py-1.5 backdrop-blur-sm">
              {GRID_ORIENTATIONS.map((orientation) => (
                <button
                  key={orientation}
                  type="button"
                  onClick={() => rotateTroopsTo(orientation)}
                  title={`Face ${orientation}`}
                  aria-label={`Face ${orientation}`}
                  className={`rounded-full px-2 py-1 text-[10px] sm:text-xs font-bold uppercase transition-colors ${
                    gridOrientation === orientation
                      ? "bg-yellow-500 text-gray-900"
                      : "text-yellow-100 hover:bg-yellow-700/30"
                  }`}
                >
                  {orientation.charAt(0)}
                </button>
              ))}
            </div>
          )}

          {(!isSetupMode || isDualTeamBattle || gameMode === "custom-scenario") && (
            <button
              type="button"
              onClick={toggleBattlefieldFullscreen}
              className={`pointer-events-auto ${iconActionButtonClass} bg-indigo-600 hover:bg-indigo-700`}
              aria-label={isBattlefieldFullscreen ? "Exit fullscreen battlefield" : "Enter fullscreen battlefield"}
              title={isBattlefieldFullscreen ? "Exit fullscreen battlefield" : "Enter fullscreen battlefield"}
            >
              {isBattlefieldFullscreen ? "🗗" : "🗖"}
            </button>
          )}

          {gameMode && (
            <button
              type="button"
              onClick={restartCurrentGame}
              className={`pointer-events-auto ${iconActionButtonClass} bg-red-700 hover:bg-red-800`}
              aria-label="Restart game"
              title="Restart game"
            >
              ↺
            </button>
          )}

          {!isSetupMode && (gameOptions.showTurnBanner || gameOptions.showBattleLog) && (
            <button
              type="button"
              onClick={() => setIsBattleLogPanelOpen((open) => !open)}
              className={`pointer-events-auto ${iconActionButtonClass} bg-amber-700 hover:bg-amber-800 ${
                isBattleLogPanelOpen ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-gray-900" : ""
              }`}
              aria-label={isBattleLogPanelOpen ? "Close battle log" : "Open battle log"}
              aria-expanded={isBattleLogPanelOpen}
              title={isBattleLogPanelOpen ? "Close battle log" : "Open battle log"}
            >
              📜
            </button>
          )}

          {isSetupMode && (
            <button
              type="button"
              onClick={() => setIsUnitPanelOpen(true)}
              className={`pointer-events-auto ${iconActionButtonClass} bg-purple-700 hover:bg-purple-800`}
              aria-label={`Open ${selectedTeam} troops`}
              title={`Open ${selectedTeam} troops`}
            >
              🪖
            </button>
          )}

          {gameMode === "single-player" && !isSetupMode && !gameStarted && (
            <button
              type="button"
              onClick={startSinglePlayerBattle}
              className={`pointer-events-auto ${iconActionButtonClass} bg-green-600 hover:bg-green-700`}
              aria-label="Start battle"
              title="Start battle"
            >
              ▶
            </button>
          )}

          {gameMode === "custom-scenario" && isSetupMode && (
            <>
              <button
                type="button"
                onClick={autoDeployCustomBattle}
                className={`pointer-events-auto ${iconActionButtonClass} bg-blue-600 hover:bg-blue-700`}
                aria-label="Auto deploy troops"
                title="Auto deploy troops"
              >
                ✨
              </button>

              <button
                type="button"
                onClick={startCustomGame}
                disabled={customUnits.length === 0}
                className={`pointer-events-auto ${iconActionButtonClass} bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Start custom game"
                title="Start custom game"
              >
                ▶
              </button>

              <button
                type="button"
                onClick={resetCustomSetup}
                className={`pointer-events-auto ${iconActionButtonClass} bg-red-600 hover:bg-red-700`}
                aria-label="Reset setup"
                title="Reset setup"
              >
                🗑
              </button>
            </>
          )}

          {isDualTeamBattle && isSetupMode && (
            <>
              <button
                type="button"
                onClick={startMultiplayerGame}
                disabled={customUnits.length === 0}
                className={`pointer-events-auto ${iconActionButtonClass} bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={gameMode === "ai-versus" ? "Start AI vs AI battle" : "Start multiplayer game"}
                title={gameMode === "ai-versus" ? "Start AI vs AI battle" : "Start multiplayer game"}
              >
                ▶
              </button>

              <button
                type="button"
                onClick={resetCustomSetup}
                className={`pointer-events-auto ${iconActionButtonClass} bg-red-600 hover:bg-red-700`}
                aria-label="Reset setup"
                title="Reset setup"
              >
                🗑
              </button>
            </>
          )}

          {!isSetupMode &&
            gameStarted &&
            (gameMode === "multiplayer" ||
              ((gameMode === "single-player" || gameMode === "custom-scenario") &&
                turn === playerTeam &&
                !(gameMode === "custom-scenario" && customScenarioSpectator))) && (
            <button
              type="button"
              onClick={() => {
                if (mergeCount < 2) {
                  setMergeMode(!mergeMode);
                  setSelectedForMerge(null);
                  setSelectedId(null);
                  if (!mergeMode) {
                    setLog((prevLog) => [`Merge mode activated! All teams can now merge their troops. Click on two adjacent troops of the same role to merge them. (${2 - mergeCount} merges remaining)`, ...prevLog]);
                  } else {
                    setLog((prevLog) => [`Merge mode deactivated.`, ...prevLog]);
                  }
                } else {
                  setLog((prevLog) => [`No more merges allowed this game!`, ...prevLog]);
                }
              }}
              disabled={mergeCount >= 2 || Boolean(timedPlayLoserTeam)}
              className={`pointer-events-auto ${iconActionButtonClass} ${mergeMode ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={mergeMode ? "Cancel merge mode" : "Enable merge mode"}
              title={mergeMode ? "Cancel merge mode" : "Enable merge mode"}
            >
              🔗
            </button>
          )}

          <button
            type="button"
            onClick={regenerateTerrain}
            className={`pointer-events-auto ${iconActionButtonClass} bg-emerald-700 hover:bg-emerald-800`}
            aria-label="Regenerate terrain"
            title="Regenerate terrain"
          >
            🗺
          </button>
        </div>
      </div>

      {isInGameOptionsOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto mt-8 sm:mt-12 mb-6">
            <div className="game-ui p-4 sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <h2 className="text-2xl font-bold text-yellow-200 sm:text-3xl">Options</h2>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={backToInGameMenu}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={persistUserSettings}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-amber-700 hover:bg-amber-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsInGameOptionsOpen(false)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
              {settingsSaveNotice && (
                <p className="mb-4 text-center text-sm text-emerald-300/95 sm:text-left">{settingsSaveNotice}</p>
              )}
              {renderGameOptionsContent()}
            </div>
          </div>
        </div>
      )}

      {isInGameMechanicsOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto mt-8 sm:mt-12 mb-6">
            <div className="game-ui p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Mechanics</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={backToInGameMenu}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setIsInGameMechanicsOpen(false)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
              {renderMechanicsContent()}
            </div>
          </div>
        </div>
      )}

      {isGameMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center">
            <div className="game-ui w-full max-w-md overflow-visible rounded-[28px] border border-yellow-700/80 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
              <div className="border-b border-yellow-700/40 px-5 py-5 sm:px-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-yellow-300/75">Pause Menu</div>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <div
                    className="group relative z-0 min-w-0 rounded-lg outline-none hover:z-20 focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-amber-500/40"
                    tabIndex={0}
                    title={
                      gameMenuControlsOpen
                        ? "Keyboard, mouse, and map navigation — same details as About on the main menu."
                        : "Open battle references, settings, controls, and quick navigation."
                    }
                  >
                    <h2 className="text-2xl font-bold text-yellow-200 sm:text-3xl">Game Menu</h2>
                    <div
                      className="pointer-events-none absolute left-0 top-full z-[60] mt-2 max-w-[min(100%,18rem)] rounded-xl border border-yellow-600/50 bg-gray-950/98 px-3 py-2 text-sm leading-relaxed text-yellow-100/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                      role="tooltip"
                    >
                      {gameMenuControlsOpen
                        ? "Keyboard, mouse, and map navigation — same details as About on the main menu."
                        : "Open battle references, settings, controls, and quick navigation."}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsGameMenuOpen(false)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
              {gameMenuControlsOpen ? (
                <div className="border-t border-yellow-700/35 px-5 py-5 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setGameMenuControlsOpen(false)}
                    className="battle-button mb-4 w-full px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800 sm:w-auto"
                  >
                    Back to menu
                  </button>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-300/75">Controls</div>
                  <div className="mt-3 max-h-[min(52vh,28rem)] overflow-y-auto pr-1">
                    <GameControlsReferenceBody dense />
                  </div>
                </div>
              ) : (
              <div className="grid gap-3 p-5 sm:p-6">
                <button
                  type="button"
                  title="Battle, setup, large-map pan (arrows / WASD), pause menu, and audio."
                  onClick={() => setGameMenuControlsOpen(true)}
                  className="group relative z-0 rounded-2xl border border-sky-700/45 bg-sky-950/20 px-4 py-4 text-left transition-colors hover:z-20 hover:bg-sky-900/25 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
                >
                  <div className="text-base font-semibold text-sky-100">Controls &amp; shortcuts</div>
                  <div
                    className="pointer-events-none absolute left-0 right-0 top-full z-[60] mt-2 rounded-xl border border-sky-600/45 bg-gray-950/98 px-3 py-2 text-sm leading-relaxed text-sky-50/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                    role="tooltip"
                  >
                    Battle, setup, large-map pan (arrows / WASD), pause menu, and audio.
                  </div>
                </button>
                <button
                  type="button"
                  title="Gameplay toggles, sound, and battlefield size."
                  onClick={openInGameOptions}
                  className="group relative z-0 rounded-2xl border border-yellow-700/50 bg-black/20 px-4 py-4 text-left transition-colors hover:z-20 hover:bg-yellow-700/15 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50"
                >
                  <div className="text-base font-semibold text-yellow-100">Options</div>
                  <div
                    className="pointer-events-none absolute left-0 right-0 top-full z-[60] mt-2 rounded-xl border border-yellow-600/45 bg-gray-950/98 px-3 py-2 text-sm leading-relaxed text-yellow-100/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                    role="tooltip"
                  >
                    Gameplay toggles, sound, and battlefield size.
                  </div>
                </button>
                <button
                  type="button"
                  title="Battle rules, troop types, hybrids, and terrain effects."
                  onClick={openInGameMechanics}
                  className="group relative z-0 rounded-2xl border border-cyan-700/40 bg-cyan-950/15 px-4 py-4 text-left transition-colors hover:z-20 hover:bg-cyan-800/20 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                >
                  <div className="text-base font-semibold text-cyan-100">Mechanics</div>
                  <div
                    className="pointer-events-none absolute left-0 right-0 top-full z-[60] mt-2 rounded-xl border border-cyan-600/45 bg-gray-950/98 px-3 py-2 text-sm leading-relaxed text-cyan-50/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                    role="tooltip"
                  >
                    Battle rules, troop types, hybrids, and terrain effects.
                  </div>
                </button>
                <button
                  type="button"
                  title="Browse faction rosters and troop reference stats."
                  onClick={openInGameUnits}
                  className="group relative z-0 rounded-2xl border border-yellow-700/50 bg-black/20 px-4 py-4 text-left transition-colors hover:z-20 hover:bg-yellow-700/15 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50"
                >
                  <div className="text-base font-semibold text-yellow-100">Units</div>
                  <div
                    className="pointer-events-none absolute left-0 right-0 top-full z-[60] mt-2 rounded-xl border border-yellow-600/45 bg-gray-950/98 px-3 py-2 text-sm leading-relaxed text-yellow-100/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                    role="tooltip"
                  >
                    Browse faction rosters and troop reference stats.
                  </div>
                </button>
                <button
                  type="button"
                  title="Terrain visuals, overlays, and battlefield presentation."
                  onClick={openInGameGraphics}
                  className="group relative z-0 rounded-2xl border border-emerald-700/40 bg-emerald-950/15 px-4 py-4 text-left transition-colors hover:z-20 hover:bg-emerald-800/20 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
                >
                  <div className="text-base font-semibold text-emerald-100">Graphics</div>
                  <div
                    className="pointer-events-none absolute left-0 right-0 top-full z-[60] mt-2 rounded-xl border border-emerald-600/45 bg-gray-950/98 px-3 py-2 text-sm leading-relaxed text-emerald-50/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                    role="tooltip"
                  >
                    Terrain visuals, overlays, and battlefield presentation.
                  </div>
                </button>
                <button
                  type="button"
                  title="Leave the current battle and return to the main screen."
                  onClick={backToMainMenu}
                  className="group relative z-0 rounded-2xl border border-rose-700/40 bg-rose-950/15 px-4 py-4 text-left transition-colors hover:z-20 hover:bg-rose-800/20 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                >
                  <div className="text-base font-semibold text-rose-100">Back to Menu</div>
                  <div
                    className="pointer-events-none absolute left-0 right-0 top-full z-[60] mt-2 rounded-xl border border-rose-600/45 bg-gray-950/98 px-3 py-2 text-sm leading-relaxed text-rose-50/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                    role="tooltip"
                  >
                    Leave the current battle and return to the main screen.
                  </div>
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isInGameGraphicsOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto mt-8 sm:mt-12 mb-6">
            <div className="game-ui p-4 sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <h2 className="text-2xl font-bold text-yellow-200 sm:text-3xl">Graphics</h2>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={backToInGameMenu}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={persistUserSettings}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-amber-700 hover:bg-amber-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsInGameGraphicsOpen(false)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
              {settingsSaveNotice && (
                <p className="mb-4 text-center text-sm text-emerald-300/95 sm:text-left">{settingsSaveNotice}</p>
              )}
              {renderGraphicsContent()}
            </div>
          </div>
        </div>
      )}

      {isInGameUnitsOpen && (
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="mx-auto mt-6 mb-6 w-full max-w-5xl sm:mt-10">
            <div className="game-ui p-3 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-yellow-200 sm:text-2xl">Units</h2>
                  <div className="text-xs uppercase tracking-wide text-yellow-100/70">Compact roster browser</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={backToInGameMenu}
                    className="battle-button bg-gray-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-gray-800 sm:text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setIsInGameUnitsOpen(false)}
                    className="battle-button bg-gray-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-gray-800 sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
              {renderUnitsContent()}
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex w-full min-w-0 max-w-full justify-center ${
          isBattlefieldFullscreen ? "bf-main-stage min-h-0 flex-1 flex-col overflow-hidden justify-center pt-2" : ""
        }`}
      >
        {false && !isSetupMode && (gameOptions.showTurnBanner || gameOptions.showBattleLog) && (
          <div className={`flex-shrink-0 ${isBattlefieldFullscreen ? "w-56" : "xl:w-80"}`}>
            <div className={`game-ui p-4 relative ${isBattlefieldFullscreen ? "max-h-[72vh] overflow-y-auto" : ""}`}>
              {gameOptions.showTurnBanner && (
                <div className="text-center relative">
                {/* Decorative crown for turn display */}
                  <svg className="absolute -top-2 left-4 w-8 h-8 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8l3 4h2l-3 4-3-4H9l3-4z"/>
                  </svg>
                  
                  <div className="text-2xl font-bold text-yellow-200">
                    {checkEnd() || `${turn.toUpperCase()} TURN`}
                  </div>
                  <div className="text-sm text-yellow-100 mt-1">
                    {gameMode === "multiplayer"
                      ? `${turn} player's turn`
                      : turn === playerTeam ? "Your turn - Click to select and move/attack"
                        : turn === "Barbarians" ? "Barbarians are thinking..."
                        : turn === "Greeks" ? "Greeks are thinking..."
                        : turn === "Gauls" ? "Gauls are thinking..."
                        : turn === "Germanic" ? "Germanic tribes are thinking..."
                        : turn === "Carthage" ? "Carthage is thinking..."
                        : turn === "Egypt" ? "Egypt is thinking..."
                        : turn === "Thracians" ? "Thracians are thinking..."
                        : turn === "Dacians" ? "Dacians are thinking..."
                        : turn === "Parthians" ? "Parthians are thinking..."
                        : turn === "Seleucids" ? "Seleucids are thinking..."
                        : turn === "Vikings" ? "Vikings are thinking..." : ""}
                  </div>
                  
                  {/* Decorative sword */}
                  <svg className="absolute -bottom-2 right-4 w-8 h-8 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.92 5H5.14c-.47 0-.92.21-1.18.56L3.04 7H2v1h1.04l.92 1.44c.26.35.71.56 1.18.56h1.78c.47 0 .92-.21 1.18-.56L9.96 7H11V6H9.96L8.1 4.56C7.84 4.21 7.39 4 6.92 4z"/>
                  </svg>
                </div>
              )}

              {gameOptions.showTurnBanner && gameOptions.showBattleLog && (
                <div className="my-3 border-t border-yellow-600/50" />
              )}

              {gameOptions.showBattleLog && (
                <div className="relative">
                {/* Decorative scroll */}
                  <svg className="absolute -top-2 left-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                  </svg>
                  
                  <h3 className="text-yellow-200 font-bold mb-3 text-lg border-b border-yellow-600 pb-2">Battle Log</h3>
                  <div className={`${isBattlefieldFullscreen ? "max-h-[58vh]" : "max-h-96"} overflow-y-auto space-y-1`}>
                    {visibleBattleLog.map((line, i) => (
                      <div key={i} className="text-green-200 text-sm bg-black bg-opacity-30 p-2 rounded border-l-2 border-yellow-600">
                        {line}
                      </div>
                    ))}
                  </div>
                  
                  {/* Decorative quill */}
                  <svg className="absolute -bottom-2 right-2 w-6 h-6 text-yellow-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div
          className={`battlefield-container relative mx-auto flex w-full min-w-0 max-w-full justify-center ${
            isBattlefieldFullscreen
              ? "bf-fs-battlefield min-h-0 flex-1 flex-col overflow-hidden items-center justify-center"
              : "mt-7 sm:mt-9 items-center"
          }`}
          style={battlefieldMotionCssVars as CSSProperties}
          data-battle-motion={reduceUiMotion ? "reduced" : "normal"}
        >
          <div
            className={
              `relative mx-auto min-w-0 max-w-full ${
                useEightByEightViewport
                  ? "battlefield-shell-8x8"
                  : useFullscreenBoundedBattlefield
                    ? "battlefield-shell-fullscreen-large bf-fs-shell"
                    : "w-fit max-w-full"
              }`
            }
          >
            <div className="relative mx-auto min-w-0 w-full max-w-full">
                {showGridNavigation && (
                  <>
                    <div
                      className="pointer-events-none absolute left-1.5 right-1.5 top-1.5 z-10 flex h-10 items-start justify-center sm:left-2 sm:right-2 sm:top-2"
                    >
                      <div
                        className="pointer-events-auto battlefield-nav-rail battlefield-nav-rail-horizontal battlefield-nav-rail--edge-n"
                        aria-hidden="true"
                        onMouseEnter={() => setHoverScrollDirection("up")}
                        onMouseLeave={() => setHoverScrollDirection(null)}
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute bottom-1.5 left-1.5 right-1.5 z-10 flex h-10 items-end justify-center sm:bottom-2 sm:left-2 sm:right-2"
                    >
                      <div
                        className="pointer-events-auto battlefield-nav-rail battlefield-nav-rail-horizontal battlefield-nav-rail--edge-s"
                        aria-hidden="true"
                        onMouseEnter={() => setHoverScrollDirection("down")}
                        onMouseLeave={() => setHoverScrollDirection(null)}
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 z-10 flex w-10 items-center justify-start sm:bottom-2 sm:left-2 sm:top-2"
                    >
                      <div
                        className="pointer-events-auto battlefield-nav-rail battlefield-nav-rail-vertical battlefield-nav-rail--edge-w"
                        aria-hidden="true"
                        onMouseEnter={() => setHoverScrollDirection("left")}
                        onMouseLeave={() => setHoverScrollDirection(null)}
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute bottom-1.5 right-1.5 top-1.5 z-10 flex w-10 items-center justify-end sm:bottom-2 sm:right-2 sm:top-2"
                    >
                      <div
                        className="pointer-events-auto battlefield-nav-rail battlefield-nav-rail-vertical battlefield-nav-rail--edge-e"
                        aria-hidden="true"
                        onMouseEnter={() => setHoverScrollDirection("right")}
                        onMouseLeave={() => setHoverScrollDirection(null)}
                      />
                    </div>
                  </>
                )}
                <div
                  className={`flex w-full min-w-0 max-w-full items-start justify-center ${
                    useFullscreenBoundedBattlefield ? "bf-battlefield-inner min-h-0 flex-1 flex-col" : ""
                  }`}
                >
                  <div
                    ref={battlefieldViewportRef}
                    className={[
                      "min-w-0 max-w-full battlefield-scroll-viewport",
                      useEightByEightViewport
                        ? "battlefield-scroll-viewport-8x8"
                        : useFullscreenBoundedBattlefield
                          ? "battlefield-scroll-viewport-fullscreen-large bf-fs-viewport"
                          : "",
                      showGridNavigation && "cc-map-pan-enabled",
                      isPanningGrid && "cc-map-pan-active"
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onPointerDownCapture={handleViewportPointerDown}
                  >
                    <div className="mx-auto w-max max-w-none">
                    <div
                      ref={battlefieldGridRef}
                      className="battlefield-grid grid mx-auto gap-0 rounded-lg"
                      style={{
                        width: "max-content",
                        gridTemplateColumns: `repeat(${battlefieldSize}, auto)`,
                        gridTemplateRows: `repeat(${battlefieldSize}, auto)`
                      }}
                    >
                <div
                  ref={dayNightOverlayRef}
                  className="battlefield-daynight-overlay"
                  aria-hidden
                />
                <BattlefieldSkyLayer />
                <LayoutGroup id="battlefield-units">
                {[...Array(battlefieldSize)].flatMap((_, y) =>
                  [...Array(battlefieldSize)].map((_, x) => {
                const u = getUnit(x, y);
                const isSelected = u?.id === selectedId;
                const key = `${x},${y}`;
                const isMeleeApproach =
                  Boolean(highlightMeleeApproach.length > 0 && highlightMeleeApproach.includes(key));
                const isMove =
                  Boolean(highlightMove && highlightMove.includes(key)) && !isMeleeApproach;
                const isAttack = highlightAttack && highlightAttack.includes(key);
                const distToSelected = selected ? Math.abs(x - selected.x) + Math.abs(y - selected.y) : 999;
                const canAttackFromRangePreview =
                  Boolean(selected && u && u.team !== selected.team && distToSelected <= selectedEffectiveRange);
                const canCloseForAttackPreview =
                  Boolean(
                    selected &&
                      u &&
                      u.team !== selected.team &&
                      selectedEffectiveRange === 1 &&
                      getCloseCombatAttackDestination(selected, u)
                  );
                const isAttackTargetForPreview = canAttackFromRangePreview || canCloseForAttackPreview;
                const canPreviewAttackDamage =
                  gameOptions.showAttackDamagePreview &&
                  !isSetupMode &&
                  gameStarted &&
                  !mergeMode &&
                  selected &&
                  selected.team === playerTeam &&
                  turn === playerTeam &&
                  !timedPlayLoserTeam &&
                  isAttackTargetForPreview;
                const percent = u ? (u.hp / u.maxHp) * 100 : 0;
                const battleBuffStrip = u ? getBattlefieldBuffStrip(u, currentBattleUnits, battlefieldTerrain) : [];
                const terrainType = getTerrainAt(battlefieldTerrain, x, y);
                const UnitDisplayIcon = u ? getUnitDisplayIcon(u) : null;
                const feedbackKinds = cellFeedback[key] ?? [];
                const hasHitFeedback = feedbackKinds.includes("hit");
                const hasMeleeWindupFeedback = feedbackKinds.includes("meleeWindup");
                const hasMeleeHitFeedback = feedbackKinds.includes("meleeHit");
                const hasDeathFeedback = feedbackKinds.includes("death");
                const hasChargeFeedback = feedbackKinds.includes("charge");
                const hasMoraleFeedback = feedbackKinds.includes("morale");
                const hasRangedFeedback = feedbackKinds.includes("ranged");
                const hasMoveFeedback = feedbackKinds.includes("move");
                const hasSiegeFogFeedback = feedbackKinds.includes("siegeFog");
                const prevGrid = u ? unitPreviousGridRef.current[u.id] : undefined;
                const tilesMoved =
                  u && prevGrid != null
                    ? Math.abs(prevGrid.x - u.x) + Math.abs(prevGrid.y - u.y)
                    : 0;
                /** 2s per tile traveled (matches projectile travel duration). */
                const unitLayoutDuration = reduceUiMotion
                  ? 0.35
                  : prevGrid == null || tilesMoved === 0
                    ? 0.35
                    : Math.min(24, tilesMoved * 2);
                const terrainAutotileVisual = getTerrainAutotileVisual(
                  terrainType,
                  x,
                  y,
                  battlefieldTerrain,
                  battlefieldSize
                );
                const useForestVideo = terrainType === "forest" && terrainVideoAllowed;
                const usePlainVideo = terrainType === "plain" && terrainVideoAllowed;
                const useHillVideo = terrainType === "hill" && terrainVideoAllowed;
                const useRiverVideo = terrainType === "river" && terrainVideoAllowed;
                /** River corners always use `Riverbend.png`; only straights / full cells use `river.mp4` when shader is on. */
                const isRiverCornerAutotile =
                  terrainType === "river" && terrainAutotileVisual?.asset === RIVER_CORNER_ASSET;
                const useRiverVideoAutotile = useRiverVideo && Boolean(terrainAutotileVisual) && !isRiverCornerAutotile;
                const useDesertVideo = terrainType === "desert" && terrainVideoAllowed;
                const terrainStyle: CSSProperties = {
                  gridColumn: x + 1,
                  gridRow: y + 1,
                  ...(terrainAutotileVisual ||
                  useForestVideo ||
                  usePlainVideo ||
                  useHillVideo ||
                  useRiverVideo ||
                  useDesertVideo
                    ? { backgroundImage: "none" }
                    : {
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12)), url(${TERRAIN_ASSETS[terrainType]})`,
                        ...(reduceUiMotion
                          ? { backgroundSize: "cover" as const, backgroundPosition: "center" as const }
                          : {
                              /* Extra canvas for slow pan — see .terrain-cell--living in index.css */
                              backgroundSize: "122% 122%",
                              backgroundPosition: "50% 50%",
                              ["--terrain-drift-delay" as string]: `${-((x + y * 13) % 47)}s`
                            })
                      })
                };
                const terrainAutotileTransformStyle: CSSProperties | null = terrainAutotileVisual
                  ? {
                      left: "50%",
                      top: "50%",
                      width: "141%",
                      height: "141%",
                      transform: `translate(calc(-50% + ${terrainAutotileVisual.nudgeXPx ?? 0}px), -50%) rotate(${terrainAutotileVisual.rotationDeg}deg)`,
                      transformOrigin: "center center"
                    }
                  : null;
                const terrainAutotileArtStyle: CSSProperties | null =
                  terrainAutotileVisual && !useForestVideo && !useHillVideo && (!useRiverVideo || isRiverCornerAutotile)
                    ? {
                        ...terrainAutotileTransformStyle,
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12)), url(${terrainAutotileVisual.asset})`,
                        ...(reduceUiMotion
                          ? { backgroundSize: "cover" as const, backgroundPosition: "center" as const }
                          : {
                              backgroundSize: "122% 122%",
                              backgroundPosition: "50% 50%",
                              ["--terrain-drift-delay" as string]: `${-((x + y * 13) % 47)}s`
                            })
                      }
                    : null;
                
                return (
                  <div
                    key={key}
                    ref={(node) => {
                      battlefieldCellRefs.current[key] = node;
                    }}
                    onClick={() => handleClick(x, y)}
                    onMouseEnter={() => {
                      if (!canPreviewAttackDamage || !u || !selected) return;
                      const outcome = getAttackDamage(selected, u, units, terrainEffectMap, {
                        round,
                        attackerMovedThisTurn: false
                      });
                      setAttackPreviewHover({
                        key,
                        damage: outcome.damage,
                        mitigated: outcome.mitigatedDamage
                      });
                    }}
                    onMouseLeave={() => {
                      setAttackPreviewHover((prev) => (prev?.key === key ? null : prev));
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, x, y)}
                    draggable={
                      (isSetupMode && u && isTeamAllowedInSetup(u.team as TeamName)) ||
                      (!isSetupMode && mergeMode && u && ALL_TEAMS.includes(u.team as TeamName))
                    }
                    onDragStart={(e: React.DragEvent) => {
                      if (isSetupMode && u && isTeamAllowedInSetup(u.team as TeamName)) {
                        setupFieldDragUnitIdRef.current = u.id;
                        setSetupFieldDragActive(true);
                        e.dataTransfer.setData("application/x-codeconq-setup-unit", u.id);
                        e.dataTransfer.effectAllowed = "move";
                        playTroopSelectSfx(u);
                        return;
                      }
                      if (!isSetupMode && mergeMode && u && ALL_TEAMS.includes(u.team as TeamName)) {
                        setSelectedId(u.id);
                        playTroopSelectSfx(u);
                        e.dataTransfer.setData("text/plain", u.id);
                      }
                    }}
                    onDragEnd={() => {
                      setupFieldDragUnitIdRef.current = null;
                      setSetupFieldDragActive(false);
                    }}
                    className={`${isBattlefieldFullscreen ? "w-[76px] h-[84px] sm:w-[84px] sm:h-[100px]" : "w-[84px] h-[100px] sm:w-[100px] sm:h-[116px]"} terrain-cell ${u ? "terrain-cell--has-unit" : ""}${reduceUiMotion || terrainAutotileVisual || useForestVideo || usePlainVideo || useHillVideo || useRiverVideo || useDesertVideo ? "" : " terrain-cell--living"} flex flex-col items-center justify-center text-xs sm:text-sm transition-all duration-300 relative
                    ${isSelected ? "unit-selected" : ""}
                    ${isMove ? "movement-highlight" : ""}
                    ${isMeleeApproach ? "melee-approach-highlight" : ""}
                    ${isAttack ? "attack-highlight" : ""}
                    ${u ? (u.team === "Romans" ? "unit-roman" : u.team === "Greeks" ? "unit-greek" : u.team === "Gauls" ? "unit-celtic" : u.team === "Germanic" ? "unit-germanic" : u.team === "Carthage" ? "unit-carthage" : u.team === "Egypt" ? "unit-egypt" : u.team === "Thracians" ? "unit-thracian" : u.team === "Dacians" ? "unit-dacian" : u.team === "Parthians" ? "unit-parthian" : u.team === "Seleucids" ? "unit-seleucid" : u.team === "Vikings" ? "unit-viking" : "unit-barbarian") : ""}
                    ${isSetupMode && ((draggedTroop && !u) || (setupFieldDragActive && !u)) ? "drag-over" : ""}
                    ${mergeMode && u && u.team === turn && selectedForMerge && u.role === selectedForMerge.role ? "merge-highlight" : ""}
                    ${mergeMode && u && u.team === turn && selectedForMerge && u.id === selectedForMerge.id ? "merge-selected" : ""}
                    ${hasHitFeedback ? "battle-feedback-hit" : ""}
                    ${hasMeleeWindupFeedback ? "battle-feedback-melee-windup" : ""}
                    ${hasMeleeHitFeedback ? "battle-feedback-melee-hit" : ""}
                    ${hasDeathFeedback ? "battle-feedback-death" : ""}
                    ${hasChargeFeedback ? "battle-feedback-charge" : ""}
                    ${hasMoraleFeedback ? "battle-feedback-morale" : ""}
                    ${hasRangedFeedback ? "battle-feedback-ranged" : ""}
                    ${hasMoveFeedback ? "battle-feedback-move" : ""}
                    ${hasSiegeFogFeedback ? "battle-feedback-siege-fog" : ""}
                    ${
                      (isSetupMode && u && isTeamAllowedInSetup(u.team as TeamName)) ||
                      (!isSetupMode && mergeMode && u && ALL_TEAMS.includes(u.team as TeamName))
                        ? "cursor-grab active:cursor-grabbing"
                        : ""
                    }`}
                    style={terrainStyle}
                    data-terrain={terrainType}
                    title={TERRAIN_LABELS[terrainType]}
                  >
                    {terrainAutotileVisual && terrainAutotileTransformStyle && useForestVideo && (
                      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
                        <div
                          className="terrain-cell__autotile-art terrain-cell__forest-video-wrap absolute z-0"
                          data-terrain="forest"
                          style={terrainAutotileTransformStyle}
                        >
                          <video
                            className="terrain-cell__forest-video absolute inset-0 z-0 h-full w-full object-cover"
                            src={FOREST_TILE_VIDEO_SRC}
                            poster={TERRAIN_ASSETS.forest}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                          />
                          <div
                            className="pointer-events-none absolute inset-0 z-[1]"
                            style={{
                              backgroundImage:
                                "linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12))"
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {terrainAutotileVisual && terrainAutotileTransformStyle && useHillVideo && (
                      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
                        <div
                          className="terrain-cell__autotile-art terrain-cell__hill-video-wrap absolute z-0"
                          data-terrain="hill"
                          style={terrainAutotileTransformStyle}
                        >
                          <video
                            className="terrain-cell__hill-video absolute inset-0 z-0 h-full w-full object-cover"
                            src={HILL_TILE_VIDEO_SRC}
                            poster={TERRAIN_ASSETS.hill}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                          />
                          <div
                            className="pointer-events-none absolute inset-0 z-[1]"
                            style={{
                              backgroundImage:
                                "linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12))"
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {terrainAutotileVisual && terrainAutotileTransformStyle && useRiverVideoAutotile && (
                      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
                        <div
                          className="terrain-cell__autotile-art terrain-cell__river-video-wrap absolute z-0"
                          data-terrain="river"
                          style={terrainAutotileTransformStyle}
                        >
                          <video
                            className="terrain-cell__river-video absolute inset-0 z-0 h-full w-full object-cover"
                            src={RIVER_TILE_VIDEO_SRC}
                            poster={TERRAIN_ASSETS.river}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                          />
                          <div
                            className="pointer-events-none absolute inset-0 z-[1]"
                            style={{
                              backgroundImage:
                                "linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12))"
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {terrainAutotileVisual && terrainAutotileArtStyle && (
                      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
                        <div
                          className={`terrain-cell__autotile-art absolute z-0 ${!reduceUiMotion ? "terrain-cell--living" : ""}`}
                          data-terrain={terrainType}
                          style={terrainAutotileArtStyle}
                        />
                      </div>
                    )}
                    {!terrainAutotileVisual && useForestVideo && (
                      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
                        <video
                          className="terrain-cell__forest-video absolute left-1/2 top-1/2 z-0 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                          src={FOREST_TILE_VIDEO_SRC}
                          poster={TERRAIN_ASSETS.forest}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 z-[1]"
                          style={{
                            backgroundImage:
                              "linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12))"
                          }}
                        />
                      </div>
                    )}
                    {!terrainAutotileVisual && useHillVideo && (
                      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
                        <video
                          className="terrain-cell__hill-video absolute left-1/2 top-1/2 z-0 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                          src={HILL_TILE_VIDEO_SRC}
                          poster={TERRAIN_ASSETS.hill}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 z-[1]"
                          style={{
                            backgroundImage:
                              "linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12))"
                          }}
                        />
                      </div>
                    )}
                    {!terrainAutotileVisual && useRiverVideo && (
                      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
                        <video
                          className="terrain-cell__river-video absolute left-1/2 top-1/2 z-0 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                          src={RIVER_TILE_VIDEO_SRC}
                          poster={TERRAIN_ASSETS.river}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 z-[1]"
                          style={{
                            backgroundImage:
                              "linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12))"
                          }}
                        />
                      </div>
                    )}
                    {!terrainAutotileVisual && usePlainVideo && (
                      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
                        <video
                          className="terrain-cell__plain-video absolute left-1/2 top-1/2 z-0 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                          src={PLAIN_TILE_VIDEO_SRC}
                          poster={TERRAIN_ASSETS.plain}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 z-[1]"
                          style={{
                            backgroundImage:
                              "linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12))"
                          }}
                        />
                      </div>
                    )}
                    {!terrainAutotileVisual && useDesertVideo && (
                      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
                        <video
                          className="terrain-cell__desert-video absolute left-1/2 top-1/2 z-0 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                          src={DESERT_TILE_VIDEO_SRC}
                          poster={TERRAIN_ASSETS.desert}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 z-[1]"
                          style={{
                            backgroundImage:
                              "linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12))"
                          }}
                        />
                      </div>
                    )}
                    <AnimatePresence mode="popLayout" initial={false}>
                      {u && (
                        <motion.div
                          key={u.id}
                          layoutId={isSetupMode ? undefined : `battle-unit-${u.id}`}
                          layout={!isSetupMode}
                          initial={false}
                          exit={
                            reduceUiMotion
                              ? { opacity: 0 }
                              : { opacity: 0, scale: 0.82, y: 12 }
                          }
                          animate={
                            reduceUiMotion
                              ? {}
                              : hasMeleeWindupFeedback
                                ? { scale: [1, 1.09, 1] }
                                : hasMeleeHitFeedback
                                  ? { y: [0, -5, 0, -4, 0, -3, 0, -2, 0] }
                                  : {}
                          }
                          transition={{
                            layout: {
                              type: "tween",
                              duration: unitLayoutDuration,
                              ease: [0.22, 0.61, 0.36, 1]
                            },
                            duration: hasMeleeWindupFeedback
                              ? MELEE_WINDUP_MS / 1000
                              : hasMeleeHitFeedback
                                ? ATTACK_RESOLVE_MELEE_MS / 1000
                                : 0.25,
                            ease: hasMeleeHitFeedback ? [0.37, 0, 0.63, 1] : "easeOut",
                            exit: {
                              duration: reduceUiMotion ? 0.12 : DEATH_EXIT_ANIMATION_S,
                              ease: [0.4, 0, 0.2, 1]
                            }
                          }}
                          className="battle-unit-layout-root relative z-30 flex h-full w-full min-w-0 flex-col items-center justify-center will-change-transform [transform:translateZ(0)]"
                        >
                          {/* Unit Icon */}
                          <div className="text-2xl mb-0.5 drop-shadow-md">
                            {typeof UnitDisplayIcon === "string" ? UnitDisplayIcon : (UnitDisplayIcon ? createElement(UnitDisplayIcon) : "⚔️")}
                          </div>

                          {/* Unit Name */}
                          <div className="rounded-full bg-black/35 px-2 py-0.5 text-[10px] text-center font-semibold text-yellow-100 leading-tight shadow-sm">
                            {getBattlefieldUnitLabel(u)}
                          </div>

                          {/* Health + Range State */}
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-white/95">
                            <span>{u.hp} HP</span>
                            {u.ammo && u.ammo > 0 && <span className="text-cyan-300">| 🏹{u.ammo}</span>}
                            {hasNoAmmoPenalty(u) && <span className="text-red-300">| ⚔️</span>}
                          </div>

                          {/* Health Bar */}
                          <div className="w-full bg-gray-800 rounded-full h-1 mt-1 border border-gray-600">
                            <div
                              className="health-bar rounded-full h-full"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>

                          {/* Movement and Attack Indicators */}
                          {isMove && <div className="text-green-400 text-lg motion-safe:animate-bounce">🚶‍♂️</div>}
                          {isAttack && <div className="text-red-400 text-lg motion-safe:animate-pulse">⚔️</div>}
                          {battleBuffStrip.length > 0 && (
                            <div
                              className="pointer-events-auto absolute right-0 top-0 z-[35] flex flex-col items-end gap-0.5 overflow-visible pr-0.5 pt-0.5"
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              role="group"
                              aria-label="Active buffs and abilities"
                            >
                              {battleBuffStrip.map((item) => (
                                <span
                                  key={item.id}
                                  className="group relative inline-flex"
                                  aria-label={item.tooltip}
                                >
                                  <span
                                    className="cursor-help text-[10px] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] sm:text-[11px]"
                                    aria-hidden
                                  >
                                    {item.icon}
                                  </span>
                                  <span
                                    role="tooltip"
                                    className="pointer-events-none absolute bottom-full left-1/2 z-[80] mb-0.5 w-max max-w-[min(92vw,9rem)] -translate-x-1/2 whitespace-normal rounded border border-amber-600/55 bg-gray-950/98 px-1.5 py-0.5 text-center text-[9px] font-semibold leading-tight text-amber-100 opacity-0 shadow-md transition-opacity duration-100 group-hover:opacity-100 sm:max-w-[11rem] sm:text-[10px]"
                                  >
                                    {item.label}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {attackPreviewHover?.key === key && (
                      <div
                        className="battle-damage-preview pointer-events-none absolute top-1 left-1/2 z-[44] flex flex-col items-center gap-0.5"
                        aria-hidden
                      >
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-200/95">Preview</span>
                        <span className="text-base font-black tabular-nums text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:text-lg">
                          −{attackPreviewHover.damage}
                        </span>
                        {attackPreviewHover.mitigated > 0 && (
                          <span className="text-sm font-black tabular-nums text-emerald-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] sm:text-base">
                            −{attackPreviewHover.mitigated} blocked
                          </span>
                        )}
                      </div>
                    )}
                    {damagePopups
                      .filter((d) => d.x === x && d.y === y)
                      .map((d) =>
                        d.kind === "mitigated" ? (
                          <div
                            key={d.id}
                            className="battle-damage-mitigated pointer-events-none absolute bottom-11 left-1/2 z-[45] flex flex-col items-center gap-0.5 sm:bottom-12"
                            aria-hidden
                          >
                            <span className="text-sm font-black tabular-nums text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:text-base md:text-lg">
                              −{d.value}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-200/95">
                              blocked
                            </span>
                          </div>
                        ) : (
                          <div
                            key={d.id}
                            className="battle-damage-popup pointer-events-none absolute bottom-0.5 left-1/2 z-[46] -translate-x-1/2 text-base font-black tabular-nums text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] sm:text-lg md:text-xl"
                            aria-hidden
                          >
                            −{d.value}
                          </div>
                        )
                      )}
                    {!u && (
                      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
                        <div className="text-gray-600 text-xs"></div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
                </LayoutGroup>
                      {projectileFeedback.map((projectile) => (
                        <div
                          key={projectile.id}
                          className="battle-projectile-wrap"
                          style={{
                            left: `${projectile.startX}px`,
                            top: `${projectile.startY}px`,
                            width: `${projectile.distance}px`,
                            transform: `translateY(-50%) rotate(${projectile.angle}rad)`
                          }}
                        >
                          {projectile.variant === "siege" ? (
                            <div className="battle-projectile-volley battle-projectile-volley--siege" aria-hidden>
                              <div className="battle-rock-salvo">
                                <span className="battle-rock battle-rock--1" />
                                <span className="battle-rock battle-rock--2" />
                                <span className="battle-rock battle-rock--3" />
                                <span className="battle-rock battle-rock--4" />
                                <span className="battle-rock battle-rock--5" />
                              </div>
                            </div>
                          ) : projectile.variant === "arrow" ? (
                            <div className="battle-projectile-volley battle-projectile-volley--arrow" aria-hidden>
                              <div className="battle-arrow-salvo battle-arrow-salvo--compact">
                                {(
                                  [
                                    "",
                                    "battle-arrow-unit--dim",
                                    "battle-arrow-unit--dim2",
                                    "battle-arrow-unit--dim3",
                                    "",
                                    "battle-arrow-unit--dim",
                                    "battle-arrow-unit--dim2",
                                    "battle-arrow-unit--dim3"
                                  ] as const
                                ).map((dimClass, arrowIndex) => (
                                  <span
                                    key={arrowIndex}
                                    className={["battle-arrow-unit", dimClass].filter(Boolean).join(" ")}
                                  >
                                    <span className="battle-arrow-feather" />
                                    <span className="battle-arrow-stick" />
                                    <span className="battle-arrow-tip" />
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="battle-projectile-volley battle-projectile-volley--charge" aria-hidden>
                              <div className="battle-charge-salvo">
                                <span className="battle-charge-ember battle-charge-ember--1" />
                                <span className="battle-charge-ember battle-charge-ember--2" />
                                <span className="battle-charge-ember battle-charge-ember--3" />
                                <span className="battle-charge-ember battle-charge-ember--4" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {inspectedUnit && (
          <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-lg mx-auto mt-8 sm:mt-12 mb-6">
              <div className="game-ui p-4 sm:p-6 relative">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Troop Details</h2>
                  <button
                    onClick={() => setInspectedUnitId(null)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3 text-sm sm:text-base text-yellow-200">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const InspectedUnitIcon = getUnitDisplayIcon(inspectedUnit);
                      return (
                    <div className="text-3xl">
                      {typeof InspectedUnitIcon === "string" ? InspectedUnitIcon : (InspectedUnitIcon ? createElement(InspectedUnitIcon) : "⚔️")}
                    </div>
                      );
                    })()}
                    <div>
                      <div className="text-lg font-bold text-yellow-100">{inspectedUnit.name}</div>
                      <div className="text-xs sm:text-sm text-yellow-300">{inspectedUnit.role}</div>
                    </div>
                  </div>

                  <p><span className="text-sky-300">🏴</span> Team: {inspectedUnit.team}</p>
                  <p>
                    <span className="text-red-400">❤️</span> HP: {inspectedUnit.hp}/{inspectedUnit.maxHp}
                    {inspectedUnit.baseMaxHp && inspectedUnit.baseMaxHp !== inspectedUnit.maxHp ? ` (base ${inspectedUnit.baseMaxHp})` : ""}
                  </p>
                  <p>
                    <span className="text-orange-400">⚔️</span> Attack: {inspectedEffectiveAttack}
                    {inspectedEffectiveAttack !== inspectedUnit.attack ? ` (base ${inspectedUnit.attack})` : ""}
                  </p>
                  <p>
                    <span className="text-blue-400">🎯</span> Range: {inspectedEffectiveRange}
                    {inspectedEffectiveRange !== inspectedUnit.range ? ` (base ${inspectedUnit.range})` : ""}
                  </p>
                  <p>
            <span className="text-green-400">🚶‍♂️</span> Move: {getMoveForBattle(inspectedUnit)}
            {getMoveForBattle(inspectedUnit) !== inspectedUnit.move ? ` (base ${inspectedUnit.move})` : ""}
          </p>
                  <p>
                    <span className="text-cyan-300">{getTroopTypeDisplay(inspectedUnit).icon}</span>{" "}
                    Troop Type: {getTroopTypeDisplay(inspectedUnit).label}
                  </p>
                  {inspectedWeightDisplay && (
                    <p>
                      <span className="text-fuchsia-300">⚖️</span> Line weight:{" "}
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${inspectedWeightDisplay.badgeClassName}`}
                        title={inspectedWeightDisplay.summary}
                      >
                        {inspectedWeightDisplay.label}
                      </span>
                      <span className="block mt-1 text-xs text-yellow-100/75 leading-snug">{inspectedWeightDisplay.summary}</span>
                    </p>
                  )}
                  <p><span className="text-lime-300">🗺️</span> Terrain: <strong>{TERRAIN_LABELS[inspectedTerrainType ?? "plain"]}</strong></p>
                  <div className="rounded-lg border border-cyan-700 bg-black/20 px-3 py-2">
                    <div className="text-cyan-300 text-sm font-semibold mb-1">Signature Skills</div>
                    {inspectedUnitAbilities.length > 0 ? (
                      <div className="space-y-1.5">
                        {inspectedUnitAbilities.map((ability) => (
                          <p key={ability.key} className="text-xs text-yellow-100 leading-relaxed">
                            <span className="font-semibold text-cyan-200">{ability.name}:</span> {ability.description}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-yellow-100/75">No signature skills.</p>
                    )}
                  </div>
                  {!gameOptions.terrainEffectsEnabled && (
                    <p className="text-xs text-yellow-100 opacity-90">Terrain effects are disabled in Graphics.</p>
                  )}
                  {inspectedEffectNotes.length > 0 && (
                    <div className="rounded-lg border border-lime-700 bg-black/20 px-3 py-2">
                      <div className="text-lime-300 text-sm font-semibold mb-1">Active Effects</div>
                      <div className="space-y-1">
                        {inspectedEffectNotes.map((note) => (
                          <p key={note} className="text-xs text-yellow-100">{note}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {inspectedUnit.ammo && inspectedUnit.ammo > 0 && (
                    <p><span className="text-cyan-400">🏹</span> Shots: {inspectedUnit.ammo}</p>
                  )}
                  {hasNoAmmoPenalty(inspectedUnit) && (
                    <p><span className="text-red-400">⚔️</span> <strong>No shots left - fights in close combat at half attack</strong></p>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-xs text-yellow-200 mb-1">Health</div>
                  <div className="w-full bg-gray-700 rounded-full h-3 border border-gray-600">
                    <div
                      className="health-bar rounded-full h-full"
                      style={{ width: `${(inspectedUnit.hp / inspectedUnit.maxHp) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {inspectedTile && inspectedTileTerrainType && inspectedTileInfo && (
          <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-lg mx-auto mt-8 sm:mt-12 mb-6">
              <div className="game-ui p-4 sm:p-6 relative">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-200">Terrain Details</h2>
                  <button
                    onClick={() => setInspectedTile(null)}
                    className="battle-button px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3 text-sm sm:text-base text-yellow-200">
                  <p>
                    <span className="text-lime-300">🗺️</span> Terrain: <strong>{TERRAIN_LABELS[inspectedTileTerrainType]}</strong>
                  </p>
                  <p>
                    <span className="text-sky-300">📍</span> Tile: {inspectedTile.x + 1}, {inspectedTile.y + 1}
                  </p>
                  <p className="text-yellow-100 leading-relaxed">{inspectedTileInfo.summary}</p>
                  {!gameOptions.terrainEffectsEnabled && (
                    <p className="text-xs text-yellow-100 opacity-90">Terrain effects are currently disabled in Graphics.</p>
                  )}
                  <div className="rounded-lg border border-lime-700 bg-black/20 px-3 py-3">
                    <div className="text-lime-300 text-sm font-semibold mb-2">Terrain Effects</div>
                    <div className="space-y-1">
                      {inspectedTileInfo.effects.map((effect) => (
                        <p key={effect} className="text-xs text-yellow-100 leading-relaxed">{effect}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isBattleLogPanelOpen && !isSetupMode && (gameOptions.showTurnBanner || gameOptions.showBattleLog) && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-3 py-8 backdrop-blur-md sm:px-6"
            role="presentation"
          >
            <div
              className="game-ui flex max-h-[min(88vh,44rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-2 border-amber-600/55 shadow-[0_0_0_1px_rgba(251,191,36,0.08),0_28px_80px_rgba(0,0,0,0.65)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="battle-log-dialog-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-700/45 bg-gradient-to-r from-gray-950 via-gray-900 to-amber-950/30 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <h2 id="battle-log-dialog-title" className="truncate text-lg font-bold tracking-tight text-amber-100 sm:text-2xl">
                    Battle log
                  </h2>
                  <p className="mt-0.5 text-[10px] text-amber-200/65 sm:text-xs">
                    Tap 📜 again to close
                    {gameOptions.timedPlayEnabled && gameStarted
                      ? ` · Timed play: ${TURN_ACTION_BUDGET_MS / 1000}s move clock + total bank`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBattleLogPanelOpen(false)}
                  className="battle-button shrink-0 rounded-full px-3 py-2 text-xs font-semibold bg-gray-800 hover:bg-gray-700 sm:text-sm"
                >
                  Close
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
                {gameOptions.showTurnBanner && (
                  <div className="relative mb-5 rounded-xl border border-amber-700/35 bg-black/25 px-4 py-4 text-center">
                    <div className="text-xl font-bold text-yellow-100 sm:text-2xl">{checkEnd() || `${turn.toUpperCase()} TURN`}</div>
                    <div className="mt-2 text-xs text-yellow-100/85 sm:text-sm">
                      {gameMode === "multiplayer"
                        ? `${turn} player's turn`
                        : gameMode === "ai-versus"
                          ? `AI is playing — ${turn}`
                          : turn === playerTeam
                            ? "Your turn — select a unit, then move or attack"
                            : turn === "Barbarians"
                              ? "Barbarians are thinking..."
                                : turn === "Greeks"
                                  ? "Greeks are thinking..."
                                  : turn === "Gauls"
                                    ? "Gauls are thinking..."
                                    : turn === "Germanic"
                                      ? "Germanic tribes are thinking..."
                                      : turn === "Carthage"
                                        ? "Carthage is thinking..."
                                        : turn === "Egypt"
                                          ? "Egypt is thinking..."
                                          : turn === "Thracians"
                                            ? "Thracians are thinking..."
                                            : turn === "Dacians"
                                              ? "Dacians are thinking..."
                                              : turn === "Parthians"
                                                ? "Parthians are thinking..."
                                                : turn === "Seleucids"
                                                  ? "Seleucids are thinking..."
                                                  : turn === "Vikings"
                                                    ? "Vikings are thinking..."
                                                    : ""}
                    </div>
                    {gameStarted && gameOptions.timedPlayEnabled && !timedPlayLoserTeam && (
                      <div
                        className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-bold tabular-nums ${
                          turnActionSecsLeft <= 5
                            ? "border-rose-500/80 bg-rose-950/40 text-rose-100"
                            : "border-sky-600/60 bg-sky-950/35 text-sky-100"
                        }`}
                      >
                        Move clock · {turnActionSecsLeft}s left
                      </div>
                    )}
                  </div>
                )}

                {gameOptions.showBattleLog && (
                  <div>
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-[0.2em] text-amber-300/90">Timeline</h3>
                    <p className="mb-3 text-xs leading-relaxed text-yellow-100/65">
                      Attacks, movement, AI orders, merges, and outcomes (newest first).
                    </p>
                    <div className="space-y-2">
                      {visibleBattleLog.map((line, i) => {
                        const appearance = getBattleLogAppearance(line);
                        return (
                          <div
                            key={i}
                            className={`rounded-xl border-l-[3px] p-3 text-sm leading-snug ${appearance.accent} ${appearance.text} ${appearance.bg}`}
                          >
                            {line}
                          </div>
                        );
                      })}
                      {visibleBattleLog.length === 0 && (
                        <p className="rounded-lg border border-dashed border-yellow-700/40 bg-black/20 px-3 py-6 text-center text-sm text-yellow-100/70">
                          No entries yet.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isUnitPanelOpen && isSetupMode && (
          <div
            className={
              gameMode === "custom-scenario"
                ? "fixed left-2 right-2 top-[4.75rem] z-40 sm:left-auto sm:right-4 sm:w-[min(26rem,calc(100vw-1rem))]"
                : "fixed left-3 right-3 top-24 z-40 sm:left-auto sm:right-4 sm:w-[22rem]"
            }
          >
            <div
              className={
                gameMode === "custom-scenario"
                  ? "game-ui relative flex max-h-[calc(100vh-5rem)] flex-col overflow-y-auto overflow-x-hidden rounded-2xl border border-amber-800/45 bg-gradient-to-b from-[#141a14]/98 via-gray-950/98 to-black/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.55)] ring-1 ring-amber-900/25 sm:max-h-[calc(100vh-7rem)] sm:p-5"
                  : "game-ui relative flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden p-3 sm:p-4"
              }
            >
              {gameMode === "custom-scenario" ? (
                <div className="mb-4 flex shrink-0 items-start justify-between gap-3 border-b border-amber-800/40 pb-4">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400/95">Custom scenario</p>
                    <h2 className="mt-1.5 text-xl font-bold leading-tight tracking-tight text-yellow-50 sm:text-2xl">Army deployment</h2>
                    <p className="mt-2 max-w-[20rem] text-[12px] leading-relaxed text-yellow-100/68">
                      Choose your faction below, then drag troops to the map. Hold hover on an icon for stats and skills.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUnitPanelOpen(false)}
                    className="battle-button shrink-0 rounded-xl border border-yellow-800/55 bg-black/50 px-3 py-2 text-sm font-semibold text-yellow-100/95 hover:border-amber-600/50 hover:bg-black/70"
                    aria-label="Close deployment panel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold leading-tight text-yellow-200 sm:text-xl">{selectedTeam}</h2>
                    <p className="mt-1 text-[11px] leading-snug text-yellow-100/72">
                      Drag a unit onto the field. Hover an icon for stats and signature skills.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUnitPanelOpen(false)}
                    className="battle-button shrink-0 px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-800 sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              )}

              {gameMode === "custom-scenario" && (
                <div className="mb-4 grid shrink-0 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-cyan-900/45 bg-cyan-950/25 p-3 shadow-inner shadow-black/20">
                    <label
                      htmlFor="unit-panel-custom-ai-difficulty"
                      className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-cyan-200/95"
                    >
                      <span className="text-sm" aria-hidden>
                        ⚔️
                      </span>
                      Enemy AI strength
                    </label>
                    <p className="mt-0.5 text-[9px] leading-snug text-cyan-100/55">HP and attack scaling for AI factions</p>
                    <select
                      id="unit-panel-custom-ai-difficulty"
                      value={aiDifficulty}
                      onChange={(e) => {
                        const next = e.target.value as AiDifficulty;
                        setAiDifficulty(next);
                        restartSessionForGameplaySettings({ aiDifficulty: next });
                      }}
                      className="mt-2.5 w-full cursor-pointer rounded-lg border border-cyan-700/50 bg-gray-950/90 px-3 py-2.5 text-sm font-medium text-cyan-50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
                    >
                      {AI_DIFFICULTY_ORDER.map((d) => (
                        <option key={d} value={d}>
                          {AI_DIFFICULTY_LABELS[d]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-xl border border-amber-900/45 bg-amber-950/20 p-3 shadow-inner shadow-black/20">
                    <label
                      htmlFor="unit-panel-your-team"
                      className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-amber-200/95"
                    >
                      <span className="text-sm" aria-hidden>
                        🎖️
                      </span>
                      Your faction
                    </label>
                    <p className="mt-0.5 text-[9px] leading-snug text-amber-100/55">You command this side in battle</p>
                    <select
                      id="unit-panel-your-team"
                      value={playerTeam}
                      onChange={(e) => {
                        const next = e.target.value as TeamName;
                        restartSessionForGameplaySettings({ playerTeam: next });
                      }}
                      className="mt-2.5 w-full cursor-pointer rounded-lg border border-amber-700/50 bg-gray-950/90 px-3 py-2.5 text-sm font-medium text-amber-50 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/25"
                    >
                      {renderTeamSelectOptions(ALL_TEAMS)}
                    </select>
                  </div>
                </div>
              )}

              {isDualTeamBattle && (
                <div className="mb-3 grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
                  {multiplayerTeams.map((team, index) => (
                    <div key={`mp-team-slot-${index}`}>
                      <label
                        htmlFor={`unit-panel-mp-${index}`}
                        className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-yellow-200/90"
                      >
                        {gameMode === "ai-versus" ? `AI faction ${index + 1}` : `Player ${index + 1}`}
                      </label>
                      <select
                        id={`unit-panel-mp-${index}`}
                        value={team}
                        onChange={(e) => {
                          const next = e.target.value as TeamName;
                          if (multiplayerTeams.some((t, j) => j !== index && t === next)) return;
                          const nextTeams = [...multiplayerTeams];
                          nextTeams[index] = next;
                          const filtered = customUnits.filter((u: any) => nextTeams.includes(u.team));
                          setMultiplayerTeams(nextTeams);
                          setCustomUnits(filtered);
                          setSelectedTeam((st) => (st === team ? next : st));
                          restartSessionForGameplaySettings({
                            gameMode: gameMode === "ai-versus" ? "ai-versus" : "multiplayer",
                            customUnitsForReroll: filtered
                          });
                        }}
                        className="w-full rounded-lg border border-yellow-600/70 bg-gray-900/90 px-2.5 py-2 text-xs text-yellow-200 focus:border-amber-400 focus:outline-none sm:text-sm"
                      >
                        {renderTeamSelectOptions(ALL_TEAMS)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {gameMode === "custom-scenario" ? (
                <div className="mb-3 shrink-0">
                  <div className="mb-2 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-200/85">Place for faction</p>
                      <p className="text-[11px] text-yellow-100/55">Tap a banner to load its roster</p>
                    </div>
                    <span className="hidden text-[9px] text-yellow-100/40 sm:inline">Scroll →</span>
                  </div>
                  <div className="flex max-w-full gap-2 overflow-x-auto overflow-y-hidden pb-2 pt-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
                    {setupTeams.map((team) => {
                      const passive = CIV_PASSIVES[team];
                      const placed = getTeamCount(team);
                      const isActive = selectedTeam === team;
                      return (
                        <button
                          key={team}
                          type="button"
                          onClick={() => setSelectedTeam(team)}
                          title={
                            passive
                              ? `${team} — ${passive.name}: ${passive.effect}. Placed ${placed}/16${
                                  deploymentBudgetApplies
                                    ? ` · ${getTeamTokenSpend(team)}/${SETUP_ARMY_TOKEN_BUDGET} tokens`
                                    : ""
                                }.`
                              : `${team}. Placed ${placed}/16${
                                  deploymentBudgetApplies
                                    ? ` · ${getTeamTokenSpend(team)}/${SETUP_ARMY_TOKEN_BUDGET} tokens`
                                    : ""
                                }.`
                          }
                          className={`flex min-w-[5.25rem] max-w-[6.5rem] shrink-0 flex-col items-center rounded-2xl border px-1.5 py-2.5 text-center transition ${
                            isActive
                              ? "border-amber-400/90 bg-gradient-to-b from-amber-950/70 to-black/60 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]"
                              : "border-yellow-900/50 bg-black/40 hover:border-amber-600/45 hover:bg-black/55"
                          }`}
                        >
                          <span className="text-xl leading-none sm:text-2xl" aria-hidden>
                            {PASSIVE_ICONS[team]}
                          </span>
                          <span className="mt-1 w-full truncate text-[8px] font-bold uppercase leading-tight tracking-wide text-yellow-50/95 sm:text-[9px]">
                            {team}
                          </span>
                          <span className="mt-0.5 text-[9px] tabular-nums text-yellow-200/75">
                            {placed}/16
                            {deploymentBudgetApplies && (
                              <span className="mt-0.5 block text-[8px] font-medium text-amber-300/90">
                                {getTeamTokenSpend(team)} tok
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-3 shrink-0">
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-yellow-200/90">
                    Faction roster to place
                  </div>
                  <div className="grid max-h-[min(9.5rem,32vh)] grid-cols-4 gap-1.5 overflow-y-auto overflow-x-hidden pr-0.5 [-webkit-overflow-scrolling:touch] sm:grid-cols-3">
                    {setupTeams.map((team) => {
                      const passive = CIV_PASSIVES[team];
                      const placed = getTeamCount(team);
                      const isActive = selectedTeam === team;
                      return (
                        <button
                          key={team}
                          type="button"
                          onClick={() => setSelectedTeam(team)}
                          title={
                            passive
                              ? `${team} — ${passive.name}: ${passive.effect}. Placed ${placed}/16${
                                  deploymentBudgetApplies
                                    ? ` · ${getTeamTokenSpend(team)}/${SETUP_ARMY_TOKEN_BUDGET} tokens`
                                    : ""
                                }.`
                              : `${team}. Placed ${placed}/16${
                                  deploymentBudgetApplies
                                    ? ` · ${getTeamTokenSpend(team)}/${SETUP_ARMY_TOKEN_BUDGET} tokens`
                                    : ""
                                }.`
                          }
                          className={`flex flex-col items-center justify-center rounded-xl border px-0.5 py-1.5 text-center transition ${
                            isActive
                              ? "border-amber-400/80 bg-amber-950/45 ring-2 ring-amber-500/45"
                              : "border-yellow-800/55 bg-black/35 hover:border-amber-500/50 hover:bg-black/45"
                          }`}
                        >
                          <span className="text-base leading-none sm:text-lg" aria-hidden>
                            {PASSIVE_ICONS[team]}
                          </span>
                          <span className="mt-0.5 w-full truncate px-0.5 text-[7px] font-bold uppercase leading-tight tracking-tight text-yellow-100/88 sm:text-[8px]">
                            {team}
                          </span>
                          <span className="text-[7px] tabular-nums text-yellow-200/65 sm:text-[8px]">
                            {placed}/16
                            {deploymentBudgetApplies && (
                              <span className="block text-[6px] text-amber-200/80">
                                {getTeamTokenSpend(team)}/{SETUP_ARMY_TOKEN_BUDGET}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                className={
                  gameMode === "custom-scenario"
                    ? "flex min-h-[min(42vh,17.5rem)] shrink-0 flex-col overflow-x-hidden pb-2 pr-0.5 pt-1"
                    : "min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-2 pr-0.5"
                }
              >
                {gameMode === "custom-scenario" && (
                  <div className="mb-3 border-l-2 border-amber-500/70 pl-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">Troop roster</p>
                    <p className="text-base font-bold text-yellow-50">{selectedTeam}</p>
                    <p className="mt-0.5 text-[11px] text-yellow-100/55">Drag icons to the battlefield</p>
                  </div>
                )}
                <div
                  className={
                    gameMode === "custom-scenario"
                      ? "grid min-h-[12rem] grid-cols-4 gap-2.5 sm:grid-cols-5"
                      : "grid grid-cols-5 gap-2 sm:grid-cols-6"
                  }
                >
                  {AVAILABLE_TROOPS[selectedTeam].map((troop, index) => (
                    <SetupTroopPaletteCell
                      key={`${troop.role}-${index}`}
                      troop={troop}
                      deploymentBudgetApplies={deploymentBudgetApplies}
                      selectedTeamTokenSpend={getTeamTokenSpend(selectedTeam)}
                      paletteSize={gameMode === "custom-scenario" ? "comfortable" : "default"}
                      onDragStart={() => {
                        setDraggedTroop(troop);
                        playTroopSelectSfx({ ...troop, ...generateTroopStats(troop.role) });
                      }}
                      onDragEnd={() => setDraggedTroop(null)}
                    />
                  ))}
                </div>
              </div>

              {gameMode === "custom-scenario" ? (
                <div className="mt-3 shrink-0 rounded-xl border border-yellow-800/50 bg-gradient-to-br from-black/50 to-amber-950/20 p-3">
                  <div className="flex items-center justify-between gap-2 border-b border-yellow-800/35 pb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-yellow-200/95">Deployment summary</span>
                    {deploymentBudgetApplies && (
                      <span className="text-[9px] text-amber-200/80">Token budget / side</span>
                    )}
                  </div>
                  {deploymentBudgetApplies && (
                    <p className="mt-2 text-[10px] leading-snug text-amber-100/80">
                      Light 1 · med 2 · heavy 3 · elite 4 · unique 5 — max {SETUP_ARMY_TOKEN_BUDGET} per faction.
                    </p>
                  )}
                  <ul className="mt-2 max-h-[28vh] space-y-1 overflow-y-auto pr-0.5 text-[12px] text-yellow-100/88 sm:text-[11px]">
                    {setupTeams.map((team) => (
                      <li
                        key={team}
                        className="flex items-center justify-between gap-2 rounded-lg border border-yellow-900/30 bg-black/30 px-2.5 py-1.5 tabular-nums"
                      >
                        <span className="flex min-w-0 items-center gap-2 truncate">
                          <span className="text-base leading-none" aria-hidden>
                            {PASSIVE_ICONS[team]}
                          </span>
                          <span className="truncate font-medium text-yellow-50/95">{team}</span>
                        </span>
                        <span className="shrink-0 text-right text-yellow-200/90">
                          <span className="font-semibold">{getTeamCount(team)}</span>
                          <span className="text-yellow-100/50">/16</span>
                          {deploymentBudgetApplies && (
                            <span className="ml-1.5 text-amber-200/95">
                              {getTeamTokenSpend(team)}/{SETUP_ARMY_TOKEN_BUDGET}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-3 shrink-0 rounded-xl border border-yellow-700/45 bg-black/25 p-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-yellow-200/90">Placed</div>
                  {deploymentBudgetApplies && (
                    <p className="mt-1 text-[10px] leading-snug text-amber-100/85">
                      Army tokens: light 1 · medium 2 · heavy 3 · elite 4 · unique 5 — max {SETUP_ARMY_TOKEN_BUDGET} per side.
                    </p>
                  )}
                  <div className="mt-1.5 space-y-0.5 text-xs text-yellow-100/80">
                    {setupTeams.map((team) => (
                      <div key={team} className="flex justify-between gap-2 tabular-nums">
                        <span className="truncate">{team}</span>
                        <span className="shrink-0 text-yellow-200/90">
                          {getTeamCount(team)}/16
                          {deploymentBudgetApplies && (
                            <span className="ml-1 text-amber-200/90">
                              · {getTeamTokenSpend(team)}/{SETUP_ARMY_TOKEN_BUDGET} tokens
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
      <AppVersionCorner />
    </div>
  );
}

export default CodeConq;
