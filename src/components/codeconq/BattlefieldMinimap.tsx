import type { TeamName } from "../../game/types";

const TEAM_DOT_COLORS: Record<TeamName, string> = {
  Romans: "#ef4444",
  Barbarians: "#d97706",
  Greeks: "#3b82f6",
  Gauls: "#22c55e",
  Germanic: "#78716c",
  Carthage: "#92400e",
  Egypt: "#eab308",
  Thracians: "#a855f7",
  Dacians: "#475569",
  Parthians: "#f97316",
  Seleucids: "#0ea5e9",
  Vikings: "#14b8a6"
};

function teamColor(team: string): string {
  return TEAM_DOT_COLORS[team as TeamName] ?? "#94a3b8";
}

type UnitLite = { team: string; x: number; y: number; hp?: number };

/** Target max edge length for the grid; scales cell size for any battlefield dimension. */
const GRID_MAX_PX = 420;

export function BattlefieldMinimap({
  units,
  size,
  className = ""
}: {
  units: UnitLite[] | null | undefined;
  size: number;
  className?: string;
}) {
  const alive = (units ?? []).filter((u) => u && (u.hp ?? 0) > 0);
  const byCell = new Map<string, UnitLite[]>();
  for (const u of alive) {
    if (u.x < 0 || u.y < 0 || u.x >= size || u.y >= size) continue;
    const k = `${u.x},${u.y}`;
    if (!byCell.has(k)) byCell.set(k, []);
    byCell.get(k)!.push(u);
  }

  const cellPx = Math.max(4, Math.min(18, Math.floor(GRID_MAX_PX / Math.max(1, size))));
  const gridPx = cellPx * size;

  const teamsInPlay = Array.from(new Set(alive.map((u) => u.team))).sort();

  return (
    <div
      className={`pointer-events-auto select-none text-left ${className}`}
      aria-label="Battlefield minimap: troop positions by faction"
    >
      <div
        className="w-max max-w-[min(calc(100vw-1rem),460px)] shrink-0 overflow-hidden rounded-xl border-2 border-[#6b5c45]/90 shadow-[0_14px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]"
        style={{
          background: `
            linear-gradient(165deg, rgba(120, 140, 160, 0.28) 0%, transparent 45%),
            linear-gradient(180deg, rgba(72, 82, 58, 0.55) 0%, rgba(32, 28, 22, 0.98) 55%, rgba(18, 16, 14, 1) 100%)
          `
        }}
      >
        <div className="p-2.5">
          <div
            className="grid gap-px rounded-md border border-[#2a261f] bg-[#0a0908] p-px shadow-[inset_0_3px_14px_rgba(0,0,0,0.65),0_0_20px_rgba(40,55,35,0.12)]"
            style={{
              width: gridPx,
              height: gridPx,
              gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
              gridTemplateRows: `repeat(${size}, ${cellPx}px)`
            }}
          >
            {[...Array(size)].flatMap((_, y) =>
              [...Array(size)].map((_, x) => {
                const stack = byCell.get(`${x},${y}`) ?? [];
                const tint = (x + y) % 3;
                const cellBg =
                  tint === 0
                    ? "rgba(48, 58, 42, 0.97)"
                    : tint === 1
                      ? "rgba(40, 50, 36, 0.97)"
                      : "rgba(34, 44, 32, 0.97)";
                return (
                  <div
                    key={`${x},${y}`}
                    className="relative min-h-0 min-w-0"
                    style={{ backgroundColor: cellBg }}
                    title={
                      stack.length
                        ? stack.map((u) => `${u.team}`).join(", ")
                        : `(${x},${y})`
                    }
                  >
                    {stack.map((u, idx) => {
                      const n = stack.length;
                      const offset = n > 1 ? idx * (42 / n) : 0;
                      const dot = n > 1 ? Math.max(42 / n, 35) : 64;
                      return (
                        <span
                          key={`${u.team}-${idx}-${u.x}-${u.y}`}
                          className="absolute rounded-full border border-black/50 shadow-sm"
                          style={{
                            width: `${dot}%`,
                            height: `${dot}%`,
                            left: `${offset}%`,
                            top: `${offset}%`,
                            backgroundColor: teamColor(u.team),
                            boxShadow: `0 0 8px ${teamColor(u.team)}70, inset 0 1px 0 rgba(255,255,255,0.15)`
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
        {teamsInPlay.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-2 border-t border-black/35 bg-black/25 px-3 py-2.5">
            {teamsInPlay.map((team) => (
              <span key={team} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-50/95">
                <span
                  className="h-2 w-2 shrink-0 rounded-full border border-black/40 shadow-[0_0_6px_currentColor]"
                  style={{ backgroundColor: teamColor(team), color: teamColor(team) }}
                />
                <span className="max-w-[7rem] truncate">{team}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
