import {
  ALL_DIRECTIONS,
  CARDINAL_DIRECTIONS,
  TERRAIN_TYPES
} from "./constants";
import type {
  BattlefieldSize,
  ScalarField,
  TerrainGenerationSettings,
  TerrainPoint,
  TerrainPreset,
  TerrainType
} from "./types";

export const getEnabledTerrainTypes = (terrainSettings: TerrainGenerationSettings): TerrainType[] => {
  const enabledTypes = TERRAIN_TYPES.filter((terrainType) => terrainSettings[terrainType]);
  return enabledTypes.length > 0 ? enabledTypes : ["plain"];
};

const getMixedTerrainTypeLimit = (battlefieldSize: BattlefieldSize) => {
  if (battlefieldSize <= 10) return 2;
  if (battlefieldSize <= 16) return 3;
  return 4;
};

const getMixedTerrainTypes = (
  terrainSettings: TerrainGenerationSettings,
  battlefieldSize: BattlefieldSize
): TerrainType[] => {
  const enabledTypes = getEnabledTerrainTypes(terrainSettings);

  // Keep desert isolated so sand never appears blended into greener mixed maps.
  const desertFilteredTypes =
    enabledTypes.includes("desert") && enabledTypes.length > 1
      ? enabledTypes.filter((terrainType) => terrainType !== "desert")
      : enabledTypes;

  const terrainLimit = getMixedTerrainTypeLimit(battlefieldSize);
  if (desertFilteredTypes.length <= terrainLimit) {
    return desertFilteredTypes;
  }

  const priorityOrder: TerrainType[] = ["plain", "forest", "hill", "river", "desert"];
  return priorityOrder.filter((terrainType) => desertFilteredTypes.includes(terrainType)).slice(0, terrainLimit);
};

const createTerrainCounts = (): Record<TerrainType, number> => ({
  plain: 0,
  forest: 0,
  hill: 0,
  river: 0,
  desert: 0
});

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const createScalarField = (size: number, valueFactory: (x: number, y: number) => number): ScalarField =>
  Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => valueFactory(x, y)));

const createTerrainField = (size: number, valueFactory: (x: number, y: number) => TerrainType): TerrainType[][] =>
  Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => valueFactory(x, y)));

const normalizeScalarField = (field: ScalarField): ScalarField => {
  let minimum = Infinity;
  let maximum = -Infinity;

  field.forEach((row) => {
    row.forEach((value) => {
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    });
  });

  if (minimum === Infinity || maximum === -Infinity || Math.abs(maximum - minimum) < 0.0001) {
    return field.map((row) => row.map(() => 0.5));
  }

  return field.map((row) => row.map((value) => (value - minimum) / (maximum - minimum)));
};

const blurScalarField = (field: ScalarField, passes = 1): ScalarField => {
  let current = field.map((row) => [...row]);

  for (let pass = 0; pass < passes; pass += 1) {
    current = current.map((row, y) =>
      row.map((_, x) => {
        let total = 0;
        let weight = 0;

        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            const sampleX = x + offsetX;
            const sampleY = y + offsetY;
            if (sampleX < 0 || sampleY < 0 || sampleX >= row.length || sampleY >= current.length) continue;

            const sampleWeight = offsetX === 0 && offsetY === 0 ? 4 : offsetX === 0 || offsetY === 0 ? 2 : 1;
            total += current[sampleY][sampleX] * sampleWeight;
            weight += sampleWeight;
          }
        }

        return weight > 0 ? total / weight : current[y][x];
      })
    );
  }

  return current;
};

const getNeighbors = (x: number, y: number, size: number, includeDiagonals = true): TerrainPoint[] => {
  const offsets = includeDiagonals ? ALL_DIRECTIONS : CARDINAL_DIRECTIONS;
  const neighbors: TerrainPoint[] = [];

  offsets.forEach((offset) => {
    const nextX = x + offset.x;
    const nextY = y + offset.y;
    if (nextX < 0 || nextY < 0 || nextX >= size || nextY >= size) return;
    neighbors.push({ x: nextX, y: nextY });
  });

  return neighbors;
};

const getManhattanDistance = (left: TerrainPoint, right: TerrainPoint) =>
  Math.abs(left.x - right.x) + Math.abs(left.y - right.y);

const chooseEnabledTerrain = (terrainOptions: TerrainType[], enabledTerrainTypes: TerrainType[]): TerrainType => {
  for (const terrainType of terrainOptions) {
    if (enabledTerrainTypes.includes(terrainType)) return terrainType;
  }

  return enabledTerrainTypes[0] ?? "plain";
};

const generateElevationField = (battlefieldSize: BattlefieldSize): ScalarField => {
  const size = battlefieldSize;
  const broadNoise = blurScalarField(createScalarField(size, () => Math.random()), 4 + Math.floor(size / 6));
  const detailNoise = blurScalarField(createScalarField(size, () => Math.random()), 2 + Math.floor(size / 10));
  const ridgeNoise = blurScalarField(createScalarField(size, () => Math.random()), 3);
  const ridgeIsVertical = Math.random() < 0.5;
  const ridgeCenter = 0.2 + Math.random() * 0.6;
  const ridgeWidth = 0.16 + Math.random() * 0.12;

  const elevation = createScalarField(size, (x, y) => {
    const normalizedX = size <= 1 ? 0 : x / (size - 1);
    const normalizedY = size <= 1 ? 0 : y / (size - 1);
    const axis = ridgeIsVertical ? normalizedX : normalizedY;
    const ridgeBand = clamp01(1 - Math.abs(axis - ridgeCenter) / ridgeWidth);
    const edgeDistance = Math.min(normalizedX, normalizedY, 1 - normalizedX, 1 - normalizedY);
    const inlandLift = clamp01(edgeDistance / 0.5);

    return (
      broadNoise[y][x] * 0.46 +
      detailNoise[y][x] * 0.18 +
      ridgeNoise[y][x] * ridgeBand * 0.26 +
      inlandLift * 0.1
    );
  });

  return normalizeScalarField(elevation);
};

const generateMoistureField = (battlefieldSize: BattlefieldSize, elevationField: ScalarField): ScalarField => {
  const size = battlefieldSize;
  const broadNoise = blurScalarField(createScalarField(size, () => Math.random()), 4 + Math.floor(size / 6));
  const detailNoise = blurScalarField(createScalarField(size, () => Math.random()), 2);
  const directionX = Math.random() * 2 - 1 || 0.65;
  const directionY = Math.random() * 2 - 1 || -0.45;

  const directionalField = normalizeScalarField(
    createScalarField(size, (x, y) => {
      const normalizedX = size <= 1 ? 0 : x / (size - 1);
      const normalizedY = size <= 1 ? 0 : y / (size - 1);
      return normalizedX * directionX + normalizedY * directionY;
    })
  );

  const moisture = createScalarField(size, (x, y) => {
    const elevationPenalty = elevationField[y][x] * 0.18;
    return broadNoise[y][x] * 0.5 + detailNoise[y][x] * 0.2 + directionalField[y][x] * 0.22 + (1 - elevationPenalty) * 0.08;
  });

  return normalizeScalarField(moisture);
};

const pickRiverSources = (elevationField: ScalarField, battlefieldSize: BattlefieldSize): TerrainPoint[] => {
  const size = battlefieldSize;
  const candidates: Array<TerrainPoint & { score: number }> = [];

  for (let y = 1; y < size - 1; y += 1) {
    for (let x = 1; x < size - 1; x += 1) {
      const elevation = elevationField[y][x];
      if (elevation < 0.6) continue;
      candidates.push({ x, y, score: elevation + Math.random() * 0.15 });
    }
  }

  candidates.sort((left, right) => right.score - left.score);

  const riverCount = Math.max(1, Math.min(3, Math.floor(size / 7)));
  const minimumSpacing = Math.max(3, Math.floor(size / 3));
  const sources: TerrainPoint[] = [];

  candidates.forEach(({ x, y }) => {
    if (sources.length >= riverCount) return;
    const point = { x, y };
    const overlapsExistingSource = sources.some((source) => getManhattanDistance(source, point) < minimumSpacing);
    if (!overlapsExistingSource) sources.push(point);
  });

  return sources;
};

const pickRiverExit = (source: TerrainPoint, battlefieldSize: BattlefieldSize): TerrainPoint => {
  const size = battlefieldSize;
  const exitOptions = [
    { x: 0, y: source.y, weight: Math.pow(Math.max(1, source.x), 1.1) },
    { x: size - 1, y: source.y, weight: Math.pow(Math.max(1, size - 1 - source.x), 1.1) },
    { x: source.x, y: 0, weight: Math.pow(Math.max(1, source.y), 1.1) },
    { x: source.x, y: size - 1, weight: Math.pow(Math.max(1, size - 1 - source.y), 1.1) }
  ];
  const totalWeight = exitOptions.reduce((sum, option) => sum + option.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const option of exitOptions) {
    roll -= option.weight;
    if (roll <= 0) return { x: option.x, y: option.y };
  }

  return { x: 0, y: source.y };
};

const traceRiverPath = (
  source: TerrainPoint,
  target: TerrainPoint,
  elevationField: ScalarField,
  moistureField: ScalarField,
  existingRiverField: boolean[][]
): TerrainPoint[] => {
  const size = elevationField.length;
  const minimumLength = Math.max(4, Math.floor(size * 0.45));
  const path: TerrainPoint[] = [];
  const visited = new Set<string>();
  let current = source;
  let previousDirection: TerrainPoint | null = null;

  for (let step = 0; step < size * size; step += 1) {
    const currentKey = `${current.x},${current.y}`;
    if (visited.has(currentKey)) break;

    visited.add(currentKey);
    path.push(current);

    const reachedExistingRiver = existingRiverField[current.y][current.x];
    const reachedEdge = current.x === 0 || current.y === 0 || current.x === size - 1 || current.y === size - 1;

    if ((reachedExistingRiver && path.length >= Math.max(3, Math.floor(minimumLength * 0.5))) || (reachedEdge && path.length >= minimumLength)) {
      return path;
    }

    let bestNextPoint: TerrainPoint = current;
    let foundNextPoint = false;
    let bestScore = Infinity;

    for (const neighbor of getNeighbors(current.x, current.y, size, false)) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (visited.has(neighborKey)) continue;

      const direction = { x: neighbor.x - current.x, y: neighbor.y - current.y };
      const uphillPenalty = Math.max(0, elevationField[neighbor.y][neighbor.x] - elevationField[current.y][current.x]) * 3.2;
      const targetDistance = getManhattanDistance(neighbor, target) / Math.max(1, size - 1);
      const turnPenalty =
        previousDirection && (previousDirection.x !== direction.x || previousDirection.y !== direction.y) ? 0.12 : 0;
      const mergeBonus = existingRiverField[neighbor.y][neighbor.x] ? -0.55 : 0;
      const edgeBonus =
        neighbor.x === 0 || neighbor.y === 0 || neighbor.x === size - 1 || neighbor.y === size - 1 ? -0.18 : 0;
      const score =
        elevationField[neighbor.y][neighbor.x] * 0.62 +
        targetDistance * 0.26 +
        uphillPenalty +
        turnPenalty +
        mergeBonus +
        edgeBonus -
        moistureField[neighbor.y][neighbor.x] * 0.08 +
        Math.random() * 0.04;

      if (score < bestScore) {
        bestScore = score;
        bestNextPoint = neighbor;
        foundNextPoint = true;
      }
    }

    if (!foundNextPoint) break;

    previousDirection = { x: bestNextPoint.x - current.x, y: bestNextPoint.y - current.y };
    current = bestNextPoint;
  }

  return path.length >= minimumLength ? path : [];
};

const generateRiverField = (
  battlefieldSize: BattlefieldSize,
  elevationField: ScalarField,
  moistureField: ScalarField
): boolean[][] => {
  const size = battlefieldSize;
  const riverField = Array.from({ length: size }, () => Array.from({ length: size }, () => false));

  pickRiverSources(elevationField, battlefieldSize).forEach((source) => {
    const riverPath = traceRiverPath(source, pickRiverExit(source, battlefieldSize), elevationField, moistureField, riverField);
    riverPath.forEach((point) => {
      riverField[point.y][point.x] = true;
    });
  });

  return riverField;
};

const buildRiverDistanceField = (riverField: boolean[][]): ScalarField => {
  const size = riverField.length;
  const distances = Array.from({ length: size }, () => Array.from({ length: size }, () => Number.POSITIVE_INFINITY));
  const queue: TerrainPoint[] = [];
  let pointer = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!riverField[y][x]) continue;
      distances[y][x] = 0;
      queue.push({ x, y });
    }
  }

  while (pointer < queue.length) {
    const current = queue[pointer];
    pointer += 1;

    getNeighbors(current.x, current.y, size, false).forEach((neighbor) => {
      const nextDistance = distances[current.y][current.x] + 1;
      if (nextDistance >= distances[neighbor.y][neighbor.x]) return;
      distances[neighbor.y][neighbor.x] = nextDistance;
      queue.push(neighbor);
    });
  }

  return distances;
};

const hydrateMoistureField = (
  moistureField: ScalarField,
  elevationField: ScalarField,
  riverDistanceField: ScalarField
): ScalarField => {
  const size = moistureField.length;

  const hydratedField = createScalarField(size, (x, y) => {
    const riverBonus = Math.max(0, 0.28 - riverDistanceField[y][x] * 0.08);
    const hillDryness = Math.max(0, elevationField[y][x] - 0.72) * 0.18;
    return clamp01(moistureField[y][x] + riverBonus - hillDryness);
  });

  return normalizeScalarField(hydratedField);
};

const chooseBaseTerrain = (
  elevation: number,
  moisture: number,
  nearRiver: boolean,
  enabledTerrainTypes: TerrainType[]
): TerrainType => {
  if (nearRiver) return chooseEnabledTerrain(["river", "plain", "forest", "hill", "desert"], enabledTerrainTypes);

  if (elevation >= 0.72) {
    return chooseEnabledTerrain(["hill", moisture >= 0.58 ? "forest" : "plain", "desert"], enabledTerrainTypes);
  }

  if (moisture <= 0.3) {
    return chooseEnabledTerrain(["desert", "plain", "hill", "forest"], enabledTerrainTypes);
  }

  if (moisture >= 0.62) {
    return chooseEnabledTerrain(["forest", "plain", "hill", "desert"], enabledTerrainTypes);
  }

  return chooseEnabledTerrain(["plain", "forest", "hill", "desert"], enabledTerrainTypes);
};

const getNeighborTerrainCounts = (
  terrainMap: TerrainType[][],
  x: number,
  y: number,
  includeDiagonals = true
): Record<TerrainType, number> => {
  const counts = createTerrainCounts();
  getNeighbors(x, y, terrainMap.length, includeDiagonals).forEach((neighbor) => {
    counts[terrainMap[neighbor.y][neighbor.x]] += 1;
  });
  return counts;
};

const getDominantNeighborTerrain = (
  terrainMap: TerrainType[][],
  x: number,
  y: number,
  enabledTerrainTypes: TerrainType[],
  excludedTerrainTypes: TerrainType[] = []
): TerrainType => {
  const counts = getNeighborTerrainCounts(terrainMap, x, y);
  const ranking: TerrainType[] = ["plain", "forest", "hill", "desert", "river"];
  let bestTerrain = terrainMap[y][x];
  let bestCount = -1;

  ranking.forEach((terrainType) => {
    if (!enabledTerrainTypes.includes(terrainType) || excludedTerrainTypes.includes(terrainType)) return;
    if (counts[terrainType] > bestCount) {
      bestTerrain = terrainType;
      bestCount = counts[terrainType];
    }
  });

  return bestTerrain;
};

const removeIsolatedTerrainTiles = (
  terrainMap: TerrainType[][],
  enabledTerrainTypes: TerrainType[],
  moistureField: ScalarField,
  riverDistanceField: ScalarField
): TerrainType[][] => {
  const nextMap = terrainMap.map((row) => [...row]);

  for (let y = 0; y < terrainMap.length; y += 1) {
    for (let x = 0; x < terrainMap.length; x += 1) {
      const currentTerrain = terrainMap[y][x];
      const counts = getNeighborTerrainCounts(terrainMap, x, y);
      const sameNeighbors = counts[currentTerrain];

      if (currentTerrain === "river") {
        if (sameNeighbors === 0) {
          nextMap[y][x] = chooseEnabledTerrain(["plain", "forest", "hill", "desert"], enabledTerrainTypes);
        }
        continue;
      }

      if (currentTerrain === "hill" && sameNeighbors === 0) {
        nextMap[y][x] = chooseEnabledTerrain(["plain", "forest", "desert"], enabledTerrainTypes);
        continue;
      }

      if (currentTerrain === "forest" && counts.desert >= 2) {
        nextMap[y][x] = chooseEnabledTerrain(["plain", "forest"], enabledTerrainTypes);
        continue;
      }

      if (currentTerrain === "desert" && (counts.forest >= 2 || riverDistanceField[y][x] <= 1 || moistureField[y][x] >= 0.46)) {
        nextMap[y][x] = chooseEnabledTerrain(["plain", "forest", "desert"], enabledTerrainTypes);
        continue;
      }

      if (sameNeighbors <= 1) {
        nextMap[y][x] = getDominantNeighborTerrain(terrainMap, x, y, enabledTerrainTypes, ["river"]);
      }
    }
  }

  return nextMap;
};

const mergeTinyTerrainRegions = (
  terrainMap: TerrainType[][],
  battlefieldSize: BattlefieldSize,
  enabledTerrainTypes: TerrainType[]
): TerrainType[][] => {
  const nextMap = terrainMap.map((row) => [...row]);
  const visited = new Set<string>();
  const size = terrainMap.length;
  const tinyRegionSize = Math.max(2, Math.floor(battlefieldSize / 3));
  const minimumRiverSize = Math.max(3, Math.floor(battlefieldSize * 0.45));

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const regionKey = `${x},${y}`;
      if (visited.has(regionKey)) continue;

      const terrainType = terrainMap[y][x];
      const queue: TerrainPoint[] = [{ x, y }];
      const region: TerrainPoint[] = [];
      visited.add(regionKey);

      while (queue.length > 0) {
        const current = queue.shift()!;
        region.push(current);

        getNeighbors(current.x, current.y, size, false).forEach((neighbor) => {
          const neighborKey = `${neighbor.x},${neighbor.y}`;
          if (terrainMap[neighbor.y][neighbor.x] !== terrainType || visited.has(neighborKey)) return;
          visited.add(neighborKey);
          queue.push(neighbor);
        });
      }

      const shouldMerge =
        terrainType === "river" ? region.length < minimumRiverSize : terrainType !== "plain" && region.length <= tinyRegionSize;

      if (!shouldMerge) continue;

      const replacement =
        terrainType === "river"
          ? chooseEnabledTerrain(["plain", "forest", "hill", "desert"], enabledTerrainTypes)
          : getDominantNeighborTerrain(nextMap, x, y, enabledTerrainTypes, ["river"]);

      region.forEach((point) => {
        nextMap[point.y][point.x] = replacement;
      });
    }
  }

  return nextMap;
};

const enforceBiomeTransitions = (
  terrainMap: TerrainType[][],
  enabledTerrainTypes: TerrainType[],
  moistureField: ScalarField,
  elevationField: ScalarField,
  riverDistanceField: ScalarField
): TerrainType[][] => {
  const nextMap = terrainMap.map((row) => [...row]);

  for (let y = 0; y < terrainMap.length; y += 1) {
    for (let x = 0; x < terrainMap.length; x += 1) {
      const currentTerrain = terrainMap[y][x];
      if (currentTerrain === "river") continue;

      const counts = getNeighborTerrainCounts(terrainMap, x, y);

      if (currentTerrain === "forest" && counts.desert >= 2) {
        nextMap[y][x] = chooseEnabledTerrain(["plain", "forest"], enabledTerrainTypes);
        continue;
      }

      if (currentTerrain === "desert") {
        if (counts.forest >= 1 || counts.hill >= 3 || riverDistanceField[y][x] <= 1 || moistureField[y][x] > 0.5) {
          nextMap[y][x] = chooseEnabledTerrain(["plain", "forest", "desert"], enabledTerrainTypes);
        }
        continue;
      }

      if (currentTerrain === "hill") {
        if (counts.hill === 0 || (counts.desert >= 2 && counts.plain + counts.forest >= 2)) {
          nextMap[y][x] = chooseEnabledTerrain(["plain", elevationField[y][x] > 0.66 ? "hill" : "forest"], enabledTerrainTypes);
        }
        continue;
      }

      if (currentTerrain === "plain") {
        if (moistureField[y][x] >= 0.7 && counts.forest >= 4) {
          nextMap[y][x] = chooseEnabledTerrain(["forest", "plain"], enabledTerrainTypes);
          continue;
        }

        if (moistureField[y][x] <= 0.22 && counts.desert >= 4 && riverDistanceField[y][x] > 1) {
          nextMap[y][x] = chooseEnabledTerrain(["desert", "plain"], enabledTerrainTypes);
        }
      }
    }
  }

  return nextMap;
};

const smoothTerrainEdges = (
  terrainMap: TerrainType[][],
  enabledTerrainTypes: TerrainType[],
  passes = 2
): TerrainType[][] => {
  let currentMap = terrainMap.map((row) => [...row]);

  for (let pass = 0; pass < passes; pass += 1) {
    const nextMap = currentMap.map((row) => [...row]);

    for (let y = 0; y < currentMap.length; y += 1) {
      for (let x = 0; x < currentMap.length; x += 1) {
        const currentTerrain = currentMap[y][x];
        if (currentTerrain === "river") continue;

        const counts = getNeighborTerrainCounts(currentMap, x, y);
        const dominantTerrain = getDominantNeighborTerrain(currentMap, x, y, enabledTerrainTypes, ["river"]);

        if (dominantTerrain === currentTerrain || counts[dominantTerrain] < 5) continue;

        const isHarshGreenDryBoundary =
          (currentTerrain === "forest" && dominantTerrain === "desert") ||
          (currentTerrain === "desert" && dominantTerrain === "forest");

        nextMap[y][x] = isHarshGreenDryBoundary
          ? chooseEnabledTerrain(["plain", dominantTerrain, currentTerrain], enabledTerrainTypes)
          : dominantTerrain;
      }
    }

    currentMap = nextMap;
  }

  return currentMap;
};

const generateBattlefieldTerrain = (battlefieldSize: BattlefieldSize, terrainSettings: TerrainGenerationSettings): TerrainType[][] => {
  const enabledTerrainTypes = getMixedTerrainTypes(terrainSettings, battlefieldSize);

  if (enabledTerrainTypes.length === 1) {
    return generatePureTerrain(battlefieldSize, enabledTerrainTypes[0]);
  }

  const elevationField = generateElevationField(battlefieldSize);
  const baseMoistureField = generateMoistureField(battlefieldSize, elevationField);
  const riverField: boolean[][] = terrainSettings.river
    ? generateRiverField(battlefieldSize, elevationField, baseMoistureField)
    : Array.from({ length: battlefieldSize }, () => Array.from({ length: battlefieldSize }, () => false));
  const riverDistanceField = terrainSettings.river
    ? buildRiverDistanceField(riverField)
    : createScalarField(battlefieldSize, () => Number.POSITIVE_INFINITY);
  const hydratedMoistureField = hydrateMoistureField(baseMoistureField, elevationField, riverDistanceField);

  let terrainMap = createTerrainField(battlefieldSize, (x, y) => {
    const nearRiver = terrainSettings.river && riverField[y]?.[x];
    return chooseBaseTerrain(elevationField[y][x], hydratedMoistureField[y][x], nearRiver, enabledTerrainTypes);
  });

  // Build macro geography first, then collapse tiny speckles so plains become the natural transition biome.
  terrainMap = removeIsolatedTerrainTiles(terrainMap, enabledTerrainTypes, hydratedMoistureField, riverDistanceField);
  terrainMap = mergeTinyTerrainRegions(terrainMap, battlefieldSize, enabledTerrainTypes);
  terrainMap = enforceBiomeTransitions(terrainMap, enabledTerrainTypes, hydratedMoistureField, elevationField, riverDistanceField);
  terrainMap = smoothTerrainEdges(terrainMap, enabledTerrainTypes, 2);
  terrainMap = mergeTinyTerrainRegions(terrainMap, battlefieldSize, enabledTerrainTypes);

  return terrainMap;
};

const generatePureTerrain = (battlefieldSize: BattlefieldSize, terrainType: TerrainType): TerrainType[][] =>
  Array.from({ length: battlefieldSize }, () => Array.from({ length: battlefieldSize }, () => terrainType));

export const generateTerrainMap = (
  battlefieldSize: BattlefieldSize,
  terrainPreset: TerrainPreset,
  terrainSettings: TerrainGenerationSettings
): TerrainType[][] =>
  terrainPreset === "mixed"
    ? generateBattlefieldTerrain(battlefieldSize, terrainSettings)
    : generatePureTerrain(battlefieldSize, terrainPreset);

export const isValidTerrainMap = (terrainMap: any, battlefieldSize: BattlefieldSize): terrainMap is TerrainType[][] => {
  return (
    Array.isArray(terrainMap) &&
    terrainMap.length === battlefieldSize &&
    terrainMap.every(
      (row: any) =>
        Array.isArray(row) &&
        row.length === battlefieldSize &&
        row.every((tile: any) => TERRAIN_TYPES.includes(tile))
    )
  );
};

export const getTerrainAt = (terrainMap: TerrainType[][], x: number, y: number): TerrainType => {
  return terrainMap?.[y]?.[x] ?? "plain";
};
