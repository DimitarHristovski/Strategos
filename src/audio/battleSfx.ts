export type BattleSfxKey =
  | "melee-hit"
  | "arrow-shot"
  | "death-fall"
  | "charge-impact"
  | "morale-break"
  | "roman-turn"
  | "barbarian-turn"
  | "greek-turn"
  | "eastern-turn"
  | "northern-turn";

export const BATTLE_SFX_SOURCES: Record<BattleSfxKey, string> = {
  "melee-hit": "/audio/melee-hit.wav",
  "arrow-shot": "/audio/arrow-shot.wav",
  "death-fall": "/audio/death-fall.wav",
  "charge-impact": "/audio/charge-impact.wav",
  "morale-break": "/audio/morale-break.wav",
  "roman-turn": "/audio/roman-turn.wav",
  "barbarian-turn": "/audio/barbarian-turn.wav",
  "greek-turn": "/audio/greek-turn.wav",
  "eastern-turn": "/audio/eastern-turn.wav",
  "northern-turn": "/audio/northern-turn.wav"
};

const TURN_SFX_BY_TEAM: Record<string, BattleSfxKey> = {
  Romans: "roman-turn",
  Barbarians: "barbarian-turn",
  Gauls: "barbarian-turn",
  Germanic: "barbarian-turn",
  Greeks: "greek-turn",
  Egypt: "eastern-turn",
  Carthage: "eastern-turn",
  Thracians: "eastern-turn",
  Dacians: "eastern-turn",
  Parthians: "eastern-turn",
  Seleucids: "eastern-turn",
  Vikings: "northern-turn"
};

export const getTurnCueForTeam = (team: string) => TURN_SFX_BY_TEAM[team] ?? "roman-turn";

export const createBattleSfxController = (volume = 0.5) => {
  const audioCache = new Map<BattleSfxKey, HTMLAudioElement>();
  const lastPlayedAt = new Map<BattleSfxKey, number>();
  const activeClones = new Set<HTMLAudioElement>();

  const ensureAudio = (key: BattleSfxKey) => {
    const cached = audioCache.get(key);
    if (cached) return cached;

    const audio = new Audio(BATTLE_SFX_SOURCES[key]);
    audio.preload = "auto";
    audio.volume = volume;
    audioCache.set(key, audio);
    return audio;
  };

  const preload = () => {
    (Object.keys(BATTLE_SFX_SOURCES) as BattleSfxKey[]).forEach((key) => {
      const audio = ensureAudio(key);
      audio.load();
    });
  };

  const play = (key: BattleSfxKey, options: { cooldownMs?: number; playbackRate?: number; volumeMultiplier?: number } = {}) => {
    const cooldownMs = options.cooldownMs ?? 80;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const lastPlayed = lastPlayedAt.get(key) ?? -Infinity;
    if (now - lastPlayed < cooldownMs) return;
    lastPlayedAt.set(key, now);

    const source = ensureAudio(key);
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
};
