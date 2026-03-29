import { TERRAIN_ASSETS } from "./constants";
import type { TerrainType } from "./types";

export const RIVER_CORNER_ASSET = "/tiles/corners/Riverbend.png";

export type TerrainAutotileVisual = {
  asset: string;
  rotationDeg: number;
  nudgeXPx?: number;
};

function cardinalNeighborsSame(
  x: number,
  y: number,
  terrain: TerrainType[][],
  size: number,
  kind: TerrainType
) {
  const m = (nx: number, ny: number) =>
    nx >= 0 && ny >= 0 && nx < size && ny < size && terrain[ny][nx] === kind;

  return {
    n: m(x, y - 1),
    e: m(x + 1, y),
    s: m(x, y + 1),
    w: m(x - 1, y)
  };
}

const normalizeRotationDeg = (deg: number) => ((deg % 360) + 360) % 360;

/** True if this cell is same biome and has exactly two same-biome cardinals meeting at a right angle (not a straight). */
function isPerpendicularCornerCell(
  tx: number,
  ty: number,
  terrain: TerrainType[][],
  size: number,
  kind: TerrainType
): boolean {
  if (tx < 0 || ty < 0 || tx >= size || ty >= size) return false;
  if (terrain[ty][tx] !== kind) return false;
  const { n, e, s, w } = cardinalNeighborsSame(tx, ty, terrain, size, kind);
  const count = (n ? 1 : 0) + (e ? 1 : 0) + (s ? 1 : 0) + (w ? 1 : 0);
  if (count !== 2) return false;
  if ((n && s) || (e && w)) return false;
  return true;
}

type TwoNeighborAutotileOptions = {
  straightRotationOffsetDeg?: number;
  cornerRotationOffsetDeg?: number;
  cornerNudgeXPx?: number;
};

type CornerAssetPick = string | ((ctx: { x: number; y: number; cornerBaseDeg: number }) => string);

/**
 * Autotile only when this cell touches **exactly two** same-biome cardinals:
 * - opposite pair → straight tile, rotated
 * - perpendicular pair → corner tile (only if `cornerAsset` is set; skipped if a leg touches another perpendicular corner)
 *
 * Any other neighbor count (0, 1, 3, 4) → `null` (full default biome texture on the cell).
 */
function autotileForExactlyTwoSameNeighbors(
  kind: TerrainType,
  terrain: TerrainType[][],
  size: number,
  n: boolean,
  e: boolean,
  s: boolean,
  w: boolean,
  gridX: number,
  gridY: number,
  straightAsset: string,
  cornerAsset: CornerAssetPick | null,
  options: TwoNeighborAutotileOptions = {}
): TerrainAutotileVisual | null {
  const count = (n ? 1 : 0) + (e ? 1 : 0) + (s ? 1 : 0) + (w ? 1 : 0);
  if (count !== 2) return null;

  const sOff = options.straightRotationOffsetDeg ?? 0;
  const cOff = options.cornerRotationOffsetDeg ?? 0;

  const straight = (deg: number): TerrainAutotileVisual => ({
    asset: straightAsset,
    rotationDeg: normalizeRotationDeg(deg + sOff)
  });
  const corner = (deg: number): TerrainAutotileVisual => {
    const ca = cornerAsset as CornerAssetPick;
    const asset =
      typeof ca === "function"
        ? ca({ x: gridX, y: gridY, cornerBaseDeg: deg })
        : ca;
    return {
      asset,
      rotationDeg: normalizeRotationDeg(deg + cOff),
      ...(options.cornerNudgeXPx !== undefined ? { nudgeXPx: options.cornerNudgeXPx } : {})
    };
  };

  if (n && s) return straight(90);
  if (e && w) return straight(0);

  if (cornerAsset === null) return null;

  const legCoords: [number, number][] = [];
  if (n) legCoords.push([gridX, gridY - 1]);
  if (e) legCoords.push([gridX + 1, gridY]);
  if (s) legCoords.push([gridX, gridY + 1]);
  if (w) legCoords.push([gridX - 1, gridY]);

  if (legCoords.some(([nx, ny]) => isPerpendicularCornerCell(nx, ny, terrain, size, kind))) {
    return null;
  }

  if (w && s) return corner(0);
  if (n && w) return corner(90);
  if (n && e) return corner(180);
  if (e && s) return corner(270);

  return null;
}

/** Hill / forest straight segments only (no corner PNGs). */
const HILL_FOREST_STRAIGHT_ROTATION_OFFSET_DEG = 180;

/**
 * River: straights + Riverbend corners. Hill / forest: straights only; L-junctions use the default full tile.
 */
export function getTerrainAutotileVisual(
  terrainType: TerrainType,
  x: number,
  y: number,
  terrain: TerrainType[][],
  size: number
): TerrainAutotileVisual | null {
  if (terrainType === "river") {
    const { n, e, s, w } = cardinalNeighborsSame(x, y, terrain, size, "river");
    return autotileForExactlyTwoSameNeighbors("river", terrain, size, n, e, s, w, x, y, TERRAIN_ASSETS.river, RIVER_CORNER_ASSET, {
      cornerNudgeXPx: -7
    });
  }

  if (terrainType === "hill") {
    const { n, e, s, w } = cardinalNeighborsSame(x, y, terrain, size, "hill");
    return autotileForExactlyTwoSameNeighbors("hill", terrain, size, n, e, s, w, x, y, TERRAIN_ASSETS.hill, null, {
      straightRotationOffsetDeg: HILL_FOREST_STRAIGHT_ROTATION_OFFSET_DEG
    });
  }

  if (terrainType === "forest") {
    const { n, e, s, w } = cardinalNeighborsSame(x, y, terrain, size, "forest");
    return autotileForExactlyTwoSameNeighbors("forest", terrain, size, n, e, s, w, x, y, TERRAIN_ASSETS.forest, null, {
      straightRotationOffsetDeg: HILL_FOREST_STRAIGHT_ROTATION_OFFSET_DEG
    });
  }

  return null;
}
