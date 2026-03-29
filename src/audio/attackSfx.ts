/**
 * Strike sounds for combat resolution (`src/audio/sounds/attacks/`).
 */

export type AttackSfxKind = "closecombat" | "ranged" | "siege";

const SOURCES: Record<AttackSfxKind, string> = {
  closecombat: new URL("./sounds/attacks/closecombat-attacks.mp3", import.meta.url).href,
  ranged: new URL("./sounds/attacks/ranged-attacks.mp3", import.meta.url).href,
  siege: new URL("./sounds/attacks/siege-attacks.mp3", import.meta.url).href
};

export const ATTACK_SFX_FILES: Record<AttackSfxKind, string> = {
  closecombat: "closecombat-attacks.mp3",
  ranged: "ranged-attacks.mp3",
  siege: "siege-attacks.mp3"
};

export function createAttackSfxController(volume = 0.5) {
  const audioCache = new Map<AttackSfxKind, HTMLAudioElement>();
  const lastPlayedAt = new Map<AttackSfxKind, number>();
  const activeClones = new Set<HTMLAudioElement>();

  const ensureAudio = (kind: AttackSfxKind) => {
    const cached = audioCache.get(kind);
    if (cached) return cached;

    const audio = new Audio(SOURCES[kind]);
    audio.preload = "auto";
    audio.volume = volume;
    audioCache.set(kind, audio);
    return audio;
  };

  const preload = () => {
    (Object.keys(SOURCES) as AttackSfxKind[]).forEach((kind) => {
      ensureAudio(kind).load();
    });
  };

  const play = (kind: AttackSfxKind, options: { cooldownMs?: number; playbackRate?: number; volumeMultiplier?: number } = {}) => {
    const cooldownMs = options.cooldownMs ?? 70;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const lastPlayed = lastPlayedAt.get(kind) ?? -Infinity;
    if (now - lastPlayed < cooldownMs) return;
    lastPlayedAt.set(kind, now);

    const source = ensureAudio(kind);
    const clone = source.cloneNode(true) as HTMLAudioElement;
    clone.volume = Math.max(0, Math.min(1, volume * (options.volumeMultiplier ?? 1)));
    clone.playbackRate = options.playbackRate ?? 1;
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
    play,
    dispose
  };
}
