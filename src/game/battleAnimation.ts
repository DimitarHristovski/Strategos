/**
 * Single source of truth for battle timing (keep in sync with CSS vars on the battlefield container).
 * CSS: :root defaults in index.css; runtime overrides via style={{ ...battlefieldMotionCssVars }}.
 */
export const ATTACK_RESOLVE_RANGED_MS = 2000;
export const ATTACK_RESOLVE_MELEE_MS = 3000;

/** Attacker pre-strike telegraph (melee / charge wind-up). */
export const MELEE_WINDUP_MS = 220;

/** Quick defender flash when a projectile or melee impact lands. */
export const HIT_FLASH_MS = 720;

export const SIEGE_IMPACT_DELAY_MS = 2000;
export const SIEGE_FOG_DURATION_MS = 3200;

export const RANGED_ATTACKER_PULSE_MS = 2000;

export const DEATH_CELL_FEEDBACK_MS = 1080;

/** Framer exit duration when a unit is removed after lethal damage. */
export const DEATH_EXIT_ANIMATION_S = 0.48;

export const getAttackResolutionDelayMs = (isProjectile: boolean) =>
  isProjectile ? ATTACK_RESOLVE_RANGED_MS : ATTACK_RESOLVE_MELEE_MS;

/** Inline style object for CSS custom properties (battlefield wrapper). */
export const battlefieldMotionCssVars = {
  ["--battle-ranged-ms"]: `${ATTACK_RESOLVE_RANGED_MS}ms`,
  ["--battle-melee-ms"]: `${ATTACK_RESOLVE_MELEE_MS}ms`,
  ["--battle-windup-ms"]: `${MELEE_WINDUP_MS}ms`,
  ["--battle-hit-flash-ms"]: `${HIT_FLASH_MS}ms`,
  ["--siege-impact-delay"]: `${SIEGE_IMPACT_DELAY_MS}ms`,
  ["--siege-fog-duration"]: `${SIEGE_FOG_DURATION_MS}ms`
} as const;
