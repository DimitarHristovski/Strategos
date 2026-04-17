/** Five ore types in resource war (matches `RESOURCE_LINK_ICON_SRC` order). */
export const RESOURCE_WAR_ORE_SLOT_COUNT = 5;

export function emptyResourceWarOreBag(): number[] {
  return Array.from({ length: RESOURCE_WAR_ORE_SLOT_COUNT }, () => 0);
}

export function normalizeResourceWarOreBag(bag: unknown): number[] {
  const out = emptyResourceWarOreBag();
  if (!Array.isArray(bag)) return out;
  for (let i = 0; i < RESOURCE_WAR_ORE_SLOT_COUNT; i++) {
    const n = bag[i];
    out[i] = typeof n === "number" && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }
  return out;
}

export function sumResourceWarOres(bag: number[] | undefined): number {
  return normalizeResourceWarOreBag(bag).reduce((a, b) => a + b, 0);
}

export function addResourceWarOresToBag(bag: number[], delta: number[]): number[] {
  const out = normalizeResourceWarOreBag(bag);
  const d = normalizeResourceWarOreBag(delta);
  for (let i = 0; i < RESOURCE_WAR_ORE_SLOT_COUNT; i++) {
    out[i] += d[i];
  }
  return out;
}

/** Pay a flat ore “price” by consuming slots 0→4 first (deterministic). */
export function tryPayResourceWarOrePrice(
  bag: number[],
  price: number
): { nextBag: number[]; debit: number[] } | null {
  if (price <= 0) {
    return { nextBag: normalizeResourceWarOreBag(bag), debit: emptyResourceWarOreBag() };
  }
  const b = normalizeResourceWarOreBag(bag);
  if (sumResourceWarOres(b) < price) return null;
  const debit = emptyResourceWarOreBag();
  let left = price;
  for (let i = 0; i < RESOURCE_WAR_ORE_SLOT_COUNT && left > 0; i++) {
    const take = Math.min(b[i], left);
    b[i] -= take;
    debit[i] = take;
    left -= take;
  }
  if (left > 0) return null;
  return { nextBag: b, debit };
}

export function refundResourceWarOresToBag(bag: number[], debit: number[]): number[] {
  return addResourceWarOresToBag(bag, debit);
}
