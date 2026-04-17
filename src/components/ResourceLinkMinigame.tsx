import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RESOURCE_LINK_GRID_SIZE,
  RESOURCE_LINK_ICON_SRC,
  RESOURCE_LINK_MIN_CHAIN,
  RESOURCE_LINK_SESSION_SEC,
  bonusGoldFromMinigameScore,
  commitResourceLinkChain,
  createResourceLinkGrid,
  extendResourceLinkPath,
  type ResourceLinkCell,
  type ResourceLinkPoint
} from "../game/resourceLinkMinigame";
import { emptyResourceWarOreBag } from "../game/resourceWarOres";

export type ResourceLinkMinigameResult = {
  totalScore: number;
  /** Feeds the AI war chest from your score (you keep ores, not this). */
  bonusGold: number;
  /** Ores cleared this session, by type index (same order as grid icons). */
  oresMined: number[];
};

type Props = {
  open: boolean;
  /** When true, hide Forfeit — used between resource-war waves so the player must Cash out. */
  intermissionLock?: boolean;
  onClose: () => void;
  onSessionComplete: (result: ResourceLinkMinigameResult) => void;
};

const FONT_LINK_ID = "cc-resource-mining-fonts";

function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TimerRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const r = 40;
  const c = 46;
  const stroke = 3.5;
  const normalized = total > 0 ? Math.max(0, Math.min(1, timeLeft / total)) : 0;
  const circ = 2 * Math.PI * r;
  const dash = circ * normalized;
  const urgent = timeLeft <= 30;

  return (
    <div className="relative flex h-[5.75rem] w-[5.75rem] shrink-0 items-center justify-center">
      <svg width={c * 2} height={c * 2} className="-rotate-90 transform" aria-hidden>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={urgent ? "url(#mining-ring-urgent)" : "url(#mining-ring)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          className="transition-[stroke-dasharray] duration-300 ease-out"
        />
        <defs>
          <linearGradient id="mining-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="55%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="mining-ring-urgent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="resource-mining-ui__timer text-[1.35rem] font-bold tabular-nums leading-none tracking-tight text-amber-50 drop-shadow-[0_1px_8px_rgba(251,191,36,0.35)]">
          {formatTime(timeLeft)}
        </span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-200/55">left</span>
      </div>
    </div>
  );
}

export function ResourceLinkMinigame({ open, intermissionLock = false, onClose, onSessionComplete }: Props) {
  const [grid, setGrid] = useState<ResourceLinkCell[][]>(() => createResourceLinkGrid(RESOURCE_LINK_GRID_SIZE));
  const [path, setPath] = useState<ResourceLinkPoint[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(RESOURCE_LINK_SESSION_SEC);
  const finishedRef = useRef(false);
  const gridRef = useRef(grid);
  const totalScoreRef = useRef(0);
  const sessionOresRef = useRef<number[]>(emptyResourceWarOreBag());
  const [sessionOres, setSessionOres] = useState<number[]>(() => emptyResourceWarOreBag());
  const onSessionCompleteRef = useRef(onSessionComplete);

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    totalScoreRef.current = totalScore;
  }, [totalScore]);

  useEffect(() => {
    if (!open) return;
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:ital,opsz,wght@0,9..40,450;0,9..40,600;1,9..40,450&display=swap";
    document.head.appendChild(link);
  }, [open]);

  const resetRound = useCallback(() => {
    setGrid(createResourceLinkGrid(RESOURCE_LINK_GRID_SIZE));
    setPath([]);
    setDrawing(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    finishedRef.current = false;
    totalScoreRef.current = 0;
    const zeroOres = emptyResourceWarOreBag();
    sessionOresRef.current = zeroOres;
    setSessionOres(zeroOres);
    setTotalScore(0);
    setTimeLeft(RESOURCE_LINK_SESSION_SEC);
    resetRound();

    const started = Date.now();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const left = Math.max(0, RESOURCE_LINK_SESSION_SEC - elapsed);
      setTimeLeft(left);
      if (left <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        const ts = totalScoreRef.current;
        onSessionCompleteRef.current({
          totalScore: ts,
          bonusGold: bonusGoldFromMinigameScore(ts),
          oresMined: [...sessionOresRef.current]
        });
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [open, resetRound]);

  const finishChain = useCallback(() => {
    setPath((currentPath) => {
      if (currentPath.length === 0) return currentPath;
      const g = gridRef.current.map((row) => [...row]);
      const res = commitResourceLinkChain(g, currentPath);
      if (res) {
        setGrid(g);
        setTotalScore((s) => s + res.scoreGained);
        const nextOres = [...sessionOresRef.current];
        nextOres[res.oreType] += res.cleared;
        sessionOresRef.current = nextOres;
        setSessionOres(nextOres);
      }
      return [];
    });
    setDrawing(false);
  }, []);

  const tryExtend = useCallback(
    (r: number, c: number) => {
      if (!drawing) return;
      setPath((prev) => {
        const g = gridRef.current;
        const next = extendResourceLinkPath(g, prev, { r, c });
        return next ?? prev;
      });
    },
    [drawing]
  );

  const handlePointerDown = (r: number, c: number) => {
    if (timeLeft <= 0 || finishedRef.current) return;
    setDrawing(true);
    setPath((prev) => {
      if (prev.length > 0) return prev;
      const g = gridRef.current;
      const next = extendResourceLinkPath(g, [], { r, c });
      return next ?? [];
    });
  };

  useEffect(() => {
    if (!open) return;
    const end = () => {
      if (drawing) finishChain();
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [open, drawing, finishChain]);

  const pathKeys = useMemo(() => new Set(path.map((p) => `${p.r},${p.c}`)), [path]);
  const rivalLevy = bonusGoldFromMinigameScore(totalScore);
  const chainLen = path.length;
  const chainReady = chainLen >= RESOURCE_LINK_MIN_CHAIN;

  if (!open) return null;

  return (
    <div
      className="resource-mining-overlay fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Resource mining minigame"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_20%,rgba(180,83,9,0.22),transparent_55%),radial-gradient(ellipse_60%_50%_at_80%_90%,rgba(67,56,202,0.12),transparent_45%),linear-gradient(180deg,#07060b_0%,#12101a_40%,#0a090d_100%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.07%22/%3E%3C/svg%3E')] opacity-90" aria-hidden />

      <div className="resource-mining-ui relative flex max-h-[min(98vh,820px)] w-full max-w-[min(96vw,680px)] flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-gradient-to-b from-[#16131f]/98 via-[#0e0c12]/98 to-[#08070a]/98 shadow-[0_0_0_1px_rgba(251,191,36,0.08),0_25px_80px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
        <div
          className="h-1 w-full shrink-0 bg-gradient-to-r from-transparent via-amber-400/90 to-transparent"
          aria-hidden
        />

        <header className="flex shrink-0 flex-col gap-4 border-b border-white/[0.06] px-4 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="resource-mining-ui__eyebrow text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-400/75">
              Strategos
            </p>
            <h2 className="resource-mining-ui__title mt-1.5 text-xl font-bold tracking-[0.04em] text-amber-50/95 sm:text-2xl">
              Vein harvest
            </h2>
            <p className="mt-2 max-w-[20rem] text-[13px] leading-snug text-amber-100/65 sm:max-w-none">
              {intermissionLock ? (
                <>
                  <span className="font-semibold text-amber-200/95">Between waves</span> — mine ores now; Cash out to bring in
                  the next enemy wave.
                </>
              ) : (
                <>
                  Drag through <span className="font-semibold text-amber-200/95">{RESOURCE_LINK_MIN_CHAIN}+</span> matching ores
                  (up, down, left, right). Release to smelt into score.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 sm:justify-end">
            <TimerRing timeLeft={timeLeft} total={RESOURCE_LINK_SESSION_SEC} />
            <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/50 to-black/40 px-3 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-4">
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-300/55">Yield</div>
              <div className="resource-mining-ui__score mt-1 text-2xl font-bold tabular-nums text-amber-50">{totalScore}</div>
              <div className="mt-2 flex flex-wrap items-center justify-end gap-1">
                {RESOURCE_LINK_ICON_SRC.map((src, i) => (
                  <span
                    key={src}
                    className="inline-flex items-center gap-0.5 rounded-lg border border-white/10 bg-black/35 px-1 py-0.5"
                    title={`Ore type ${i + 1}`}
                  >
                    <span
                      className="resource-ore-icon-wrap resource-ore-icon-anim inline-flex items-center justify-center p-0.5"
                      style={{ animationDelay: `${i * 0.16}s` }}
                    >
                      <img
                        src={src}
                        alt=""
                        className="resource-ore-icon-img h-5 w-5 object-contain sm:h-6 sm:w-6"
                        draggable={false}
                      />
                    </span>
                    <span className="min-w-[1rem] text-left text-[11px] font-semibold tabular-nums text-amber-100/90">
                      {sessionOres[i] ?? 0}
                    </span>
                  </span>
                ))}
              </div>
              <div className="mt-2 text-[10px] font-medium text-rose-200/55">Rival levy from score ~{rivalLevy}</div>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-5">
          {(drawing && chainLen > 0) || chainLen > 0 ? (
            <div
              className={`mb-3 flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center text-[12px] font-medium transition-colors duration-200 ${
                chainReady
                  ? "border-emerald-500/35 bg-emerald-950/25 text-emerald-100/90"
                  : "border-white/10 bg-white/[0.04] text-amber-100/70"
              }`}
            >
              <span className="tabular-nums font-bold text-amber-100">{chainLen}</span>
              <span>in chain</span>
              {chainReady ? (
                <span className="text-emerald-200/90">— release to clear</span>
              ) : (
                <span className="text-amber-200/50">— need {RESOURCE_LINK_MIN_CHAIN}+ to clear</span>
              )}
            </div>
          ) : null}

          <div className="relative mx-auto w-full max-w-[min(92vw,520px)] rounded-[1.1rem] border border-amber-900/35 bg-gradient-to-b from-[#1c1917]/90 to-black/80 p-3 sm:p-4 shadow-[inset_0_2px_12px_rgba(0,0,0,0.45),0_0_40px_rgba(180,83,9,0.06)]">
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.05rem] opacity-[0.45]"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 3px)"
              }}
              aria-hidden
            />
            <div
              className="relative grid aspect-square w-full gap-2 sm:gap-3"
              style={{
                gridTemplateColumns: `repeat(${RESOURCE_LINK_GRID_SIZE}, minmax(0, 1fr))`
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const inPath = pathKeys.has(`${r},${c}`);
                  const src = cell !== null ? RESOURCE_LINK_ICON_SRC[cell] : null;
                  const disabled = timeLeft <= 0 || finishedRef.current || cell === null;
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      disabled={disabled}
                      className={`resource-mining-cell group relative flex aspect-square min-h-0 items-center justify-center rounded-[0.65rem] border transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141218] ${
                        inPath
                          ? "resource-mining-cell--path z-[2] scale-[1.03] border-amber-300/70 bg-gradient-to-br from-amber-500/25 to-amber-900/20 shadow-[0_0_24px_rgba(251,191,36,0.28),inset_0_1px_0_rgba(255,255,255,0.12)]"
                          : "border-zinc-600/25 bg-gradient-to-br from-zinc-700/35 to-zinc-950/90 shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] hover:border-amber-500/35 hover:from-zinc-600/40"
                      } ${cell === null ? "cursor-not-allowed opacity-35" : disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer active:scale-[0.96]"}`}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        handlePointerDown(r, c);
                      }}
                      onPointerEnter={() => {
                        if (drawing) tryExtend(r, c);
                      }}
                    >
                      {src ? (
                        <>
                          <span
                            className="pointer-events-none absolute inset-[10%] rounded-md bg-amber-400/5 opacity-0 blur-md transition-opacity group-hover:opacity-100"
                            aria-hidden
                          />
                          <span className="resource-ore-icon-wrap relative z-[1] flex h-[88%] w-[88%] items-center justify-center p-0.5 sm:p-1">
                            <img
                              src={src}
                              alt=""
                              className="resource-ore-icon-img resource-ore-icon-anim max-h-full max-w-full select-none object-contain"
                              style={{ animationDelay: `${(r * RESOURCE_LINK_GRID_SIZE + c) * 0.04}s` }}
                              draggable={false}
                            />
                          </span>
                        </>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <ul className="mx-auto mt-4 w-full max-w-[min(92vw,520px)] space-y-1.5 text-[11px] leading-relaxed text-amber-100/50 sm:text-xs">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500/60" aria-hidden />
              <span>Step back one tile to undo the last link.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500/60" aria-hidden />
              <span>When time runs out, cleared ores go to your vault; score only feeds the rival levy for their recruits.</span>
            </li>
          </ul>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] bg-black/25 px-4 py-3.5 sm:px-5">
          {!intermissionLock && (
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] font-semibold text-amber-100/75 transition hover:border-amber-500/30 hover:bg-amber-950/30 hover:text-amber-50"
              onClick={() => {
                if (!finishedRef.current && !window.confirm("Leave without collecting? Your session will be forfeited.")) {
                  return;
                }
                onClose();
              }}
            >
              Forfeit
            </button>
          )}
          <button
            type="button"
            className="rounded-xl border border-amber-400/50 bg-gradient-to-b from-amber-500/90 to-amber-700/95 px-5 py-2.5 text-[13px] font-bold tracking-wide text-amber-950 shadow-[0_4px_20px_rgba(217,119,6,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition hover:from-amber-400 hover:to-amber-600 hover:shadow-[0_6px_28px_rgba(251,191,36,0.4)]"
            onClick={() => {
              if (finishedRef.current) return;
              finishedRef.current = true;
              const ts = totalScoreRef.current;
              onSessionCompleteRef.current({
                totalScore: ts,
                bonusGold: bonusGoldFromMinigameScore(ts),
                oresMined: [...sessionOresRef.current]
              });
            }}
          >
            Cash out
          </button>
        </footer>
      </div>
    </div>
  );
}
