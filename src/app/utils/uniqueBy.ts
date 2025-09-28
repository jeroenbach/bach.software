/**
 * Returns a new array with duplicates removed, keeping only the **first occurrence**
 * of each item based on a key function.
 */
export function uniqueBy<T, K extends PropertyKey>(
  arr: readonly T[],
  keyFn: (item: T) => K,
): T[] {
  const seen = new Set();
  return arr.filter((item) => {
    const key = keyFn(item);
    return seen.has(key) ? false : seen.add(key);
  });
}
