/** 5×5 grid link-matching minigame for Resource war mining. */

export const RESOURCE_LINK_GRID_SIZE = 5;
export const RESOURCE_LINK_MIN_CHAIN = 3;
/** Session length (seconds). */
export const RESOURCE_LINK_SESSION_SEC = 5 * 60;
/** Raw score from cleared cells → bonus gold (higher = stingier). */
export const RESOURCE_LINK_SCORE_TO_GOLD_DIVISOR = 35;

/** Public paths under `/public/icons/resources/`. */
export const RESOURCE_LINK_ICON_SRC: readonly string[] = [
  encodeURI("/icons/resources/ChatGPT Image Apr 17, 2026, 11_05_56 PM (1).png"),
  encodeURI("/icons/resources/ChatGPT Image Apr 17, 2026, 11_03_30 PM (1).png"),
  encodeURI("/icons/resources/ChatGPT Image Apr 17, 2026, 11_03_30 PM (2).png"),
  encodeURI("/icons/resources/ChatGPT Image Apr 17, 2026, 11_03_30 PM (3).png"),
  encodeURI("/icons/resources/ChatGPT Image Apr 17, 2026, 11_04_23 PM (1).png")
] as const;

export type ResourceLinkCell = number | null;
export type ResourceLinkPoint = { r: number; c: number };

export function randomResourceIndex(): number {
  return Math.floor(Math.random() * RESOURCE_LINK_ICON_SRC.length);
}

export function createResourceLinkGrid(size: number): ResourceLinkCell[][] {
  const g: ResourceLinkCell[][] = [];
  for (let r = 0; r < size; r++) {
    const row: ResourceLinkCell[] = [];
    for (let c = 0; c < size; c++) {
      row.push(randomResourceIndex());
    }
    g.push(row);
  }
  return g;
}

function orthoAdjacent(a: ResourceLinkPoint, b: ResourceLinkPoint): boolean {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

/** Allow stepping back one cell to undo the last link segment. */
export function extendResourceLinkPath(
  grid: ResourceLinkCell[][],
  path: ResourceLinkPoint[],
  next: ResourceLinkPoint
): ResourceLinkPoint[] | null {
  const { r, c } = next;
  if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return null;
  const t = grid[r][c];
  if (t === null) return null;

  if (path.length === 0) return [{ r, c }];

  const last = path[path.length - 1];
  if (!orthoAdjacent(last, next)) return null;
  if (grid[last.r][last.c] !== t) return null;

  if (path.length >= 2) {
    const prev = path[path.length - 2];
    if (prev.r === next.r && prev.c === next.c) {
      return path.slice(0, -1);
    }
  }

  for (const p of path) {
    if (p.r === next.r && p.c === next.c) return null;
  }

  return [...path, next];
}

export function scoreForClearedCells(count: number): number {
  return count * count;
}

export function applyGravityAndRefill(grid: ResourceLinkCell[][], rng: () => number = Math.random): void {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let c = 0; c < cols; c++) {
    const col: ResourceLinkCell[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      const v = grid[r][c];
      if (v !== null) col.push(v);
    }
    let write = rows - 1;
    for (const v of col) {
      grid[write][c] = v;
      write--;
    }
    while (write >= 0) {
      grid[write][c] = Math.floor(rng() * RESOURCE_LINK_ICON_SRC.length);
      write--;
    }
  }
}

export function commitResourceLinkChain(
  grid: ResourceLinkCell[][],
  path: ResourceLinkPoint[]
): { cleared: number; scoreGained: number; oreType: number } | null {
  if (path.length < RESOURCE_LINK_MIN_CHAIN) return null;
  const t = grid[path[0].r][path[0].c];
  if (t === null) return null;
  for (const p of path) {
    if (grid[p.r][p.c] !== t) return null;
  }
  const cleared = path.length;
  for (const p of path) {
    grid[p.r][p.c] = null;
  }
  applyGravityAndRefill(grid);
  return { cleared, scoreGained: scoreForClearedCells(cleared), oreType: t };
}

export function bonusGoldFromMinigameScore(totalScore: number): number {
  return Math.max(0, Math.floor(totalScore / RESOURCE_LINK_SCORE_TO_GOLD_DIVISOR));
}
