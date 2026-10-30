/** Injectable randomness source (returns a number in [0, 1)), so draws can be tested. */
export type Random = () => number;

export function chance(probability: number, random: Random): boolean {
  return random() < probability;
}

export function pick<T>(items: readonly T[], random: Random): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error("Cannot pick from an empty list");
  return item;
}

/** Picks an item with a probability proportional to its weight. */
export function weightedPick<T>(items: readonly T[], weight: (item: T) => number, random: Random): T {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let roll = random() * total;
  for (const item of items) {
    roll -= weight(item);
    if (roll < 0) return item;
  }
  return pick(items, random);
}

export function between(min: number, max: number, random: Random): number {
  return min + (max - min) * random();
}
