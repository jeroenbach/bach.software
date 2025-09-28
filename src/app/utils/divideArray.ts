/**
 * Just like filter it filters an array, but it will also return an array with filtered out values.
 * @param array The Array to divide
 * @param divideFn the divide function
 */
export function divideArray<T>(
  array: T[],
  divideFn: (item: T) => boolean,
): [T[], T[]];
/**
 * Just like filter it filters an array, but it will also return an array with filtered out values.
 * @param array The Array to divide
 * @param divideFn the divide function
 * @param mapFn An optional map function, to make use of the 1x iteration
 */
export function divideArray<T, U>(
  array: T[],
  divideFn: (item: T) => boolean,
  mapFn: (item: T) => U,
): [U[], U[]];

export function divideArray<T, U = T>(
  array: T[],
  divideFn: (item: T) => boolean,
  mapFn?: (item: T) => U,
): [U[], U[]] {
  if (!array || !divideFn)
    return [[], []];

  const matched: U[] = [];
  const unmatched: U[] = [];

  for (const item of array) {
    const mapped = mapFn ? mapFn(item) : (item as unknown as U);
    if (divideFn(item)) {
      matched.push(mapped);
    }
    else {
      unmatched.push(mapped);
    }
  }

  return [matched, unmatched];
}
