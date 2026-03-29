/**
 * Troop selection sounds (`src/audio/sounds/`).
 *
 * Mapping:
 * - siege.mp3 — siege engines (ballista, catapult, onager, …)
 * - elephant.mp3 — roles containing "elephant"
 * - horse.wav — mounted / hybrid mounted-ranged (cavalry, chariots, horse archer, …)
 * - infantry_marching.mp3 — foot melee and foot ranged
 *
 * Keep hybrid keywords in sync with `normalizeUnitStats` in `game/battleEngine.ts`.
 */

export type TroopSelectionSfxKind = "siege" | "elephant" | "horse" | "infantry";

const SIEGE_ROLE_KEYWORDS = [
  "ballista",
  "catapult",
  "trebuchet",
  "polybolos",
  "siege tower",
  "onager",
  "bombard"
] as const;

/** Substrings matched against `unit.role` (lowercased). Sync with battleEngine hybrid list. */
const HYBRID_MOUNTED_RANGED_KEYWORDS = [
  "barbarian scout",
  "gallic chariot",
  "royal chariot",
  "desert scout",
  "scout",
  "horse archer",
  "camel rider archer",
  "elephant archer"
] as const;

const MOUNTED_MELEE_KEYWORDS = [
  "cavalry",
  "chariot",
  "rider",
  "knight",
  "horse",
  "camel",
  "cataphract",
  "scout"
] as const;

const SOURCES: Record<TroopSelectionSfxKind, string> = {
  siege: new URL("./sounds/siege.mp3", import.meta.url).href,
  elephant: new URL("./sounds/elephant.mp3", import.meta.url).href,
  horse: new URL("./sounds/horse.wav", import.meta.url).href,
  infantry: new URL("./sounds/infantry_marching.mp3", import.meta.url).href
};

export const TROOP_SELECTION_SFX_FILES: Record<TroopSelectionSfxKind, string> = {
  siege: "siege.mp3",
  elephant: "elephant.mp3",
  horse: "horse.wav",
  infantry: "infantry_marching.mp3"
};

export function getTroopSelectionSfxKind(unit: unknown): TroopSelectionSfxKind {
  if (!unit || typeof unit !== "object") return "infantry";

  const u = unit as { role?: string; ammo?: number; range?: number; move?: number };
  const role = String(u.role ?? "").toLowerCase();

  if (SIEGE_ROLE_KEYWORDS.some((keyword) => role.includes(keyword))) {
    return "siege";
  }

  if (role.includes("elephant")) {
    return "elephant";
  }

  if (HYBRID_MOUNTED_RANGED_KEYWORDS.some((keyword) => role.includes(keyword))) {
    return "horse";
  }

  const ammo = u.ammo ?? 0;
  const range = u.range ?? 1;
  if (ammo > 0 && range > 1) {
    return "infantry";
  }

  if (MOUNTED_MELEE_KEYWORDS.some((keyword) => role.includes(keyword)) || (range <= 1 && (u.move ?? 0) >= 3)) {
    return "horse";
  }

  return "infantry";
}

export function createTroopSelectionSfxController(volume = 0.5) {
  const audioCache = new Map<TroopSelectionSfxKind, HTMLAudioElement>();
  const lastPlayedAt = new Map<TroopSelectionSfxKind, number>();
  const activeClones = new Set<HTMLAudioElement>();

  const ensureAudio = (kind: TroopSelectionSfxKind) => {
    const cached = audioCache.get(kind);
    if (cached) return cached;

    const audio = new Audio(SOURCES[kind]);
    audio.preload = "auto";
    audio.volume = volume;
    audioCache.set(kind, audio);
    return audio;
  };

  const preload = () => {
    (Object.keys(SOURCES) as TroopSelectionSfxKind[]).forEach((kind) => {
      ensureAudio(kind).load();
    });
  };

  const playForUnit = (unit: unknown, options: { cooldownMs?: number; volumeMultiplier?: number } = {}) => {
    const kind = getTroopSelectionSfxKind(unit);
    const cooldownMs = options.cooldownMs ?? 140;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const lastPlayed = lastPlayedAt.get(kind) ?? -Infinity;
    if (now - lastPlayed < cooldownMs) return;
    lastPlayedAt.set(kind, now);

    const source = ensureAudio(kind);
    const clone = source.cloneNode(true) as HTMLAudioElement;
    clone.volume = Math.max(0, Math.min(1, volume * (options.volumeMultiplier ?? 1)));
    activeClones.add(clone);

    const cleanup = () => {
      clone.pause();
      clone.src = "";
      activeClones.delete(clone);
    };

    clone.addEventListener("ended", cleanup, { once: true });
    void clone.play().catch(() => {
      cleanup();
    });
  };

  const dispose = () => {
    audioCache.forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
    audioCache.clear();

    activeClones.forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
    activeClones.clear();
  };

  return {
    preload,
    playForUnit,
    dispose
  };
}
