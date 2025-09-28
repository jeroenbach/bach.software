/**
 * Merge two arrays of objects:
 * - If a key in newArr exists in oldArr → replace the old object.
 * - If a key in newArr does not exist in oldArr → append it.
 *
 * @param array - the original array
 * @param itemsToAdd - the replacement array
 * @param keyFn  - function to extract the unique key for each object
 */
export function mergeReplace<T, K>(
  array: readonly T[],
  itemsToAdd: readonly T[],
  keyFn: (item: T) => K,
): T[] {
  const newMap = new Map(itemsToAdd.map(item => [keyFn(item), item]));

  const result: T[] = [];

  // 1. Keep old order, replacing where applicable
  for (const oldItem of array) {
    const key = keyFn(oldItem);
    if (newMap.has(key)) {
      result.push(newMap.get(key)!);
      newMap.delete(key); // remove so we don’t append it later
    }
    else {
      result.push(oldItem);
    }
  }

  // 2. Append leftovers (new items not in oldArr)
  for (const leftover of newMap.values()) {
    result.push(leftover);
  }

  return result;
}
