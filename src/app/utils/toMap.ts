/**
 * Helps to create a map (dictionary) from a list of items.
 * For the key and values you can either provide a keyof T or a function that returns the value.
 * If you don't specify any value, the whole item will be used as value.
 * @param array - the array to convert
 * @param key - a keyof an array item | a function that returns a value that represents the key of the dictionary
 * @param value - a keyof an array item | a function that returns any value
 * @returns an new Map()
 */
export function toMap<
  T,
  KF extends keyof T | ((item: T) => any) | undefined,
  KV extends keyof T | ((item: T) => any) | undefined,
>(
  array: readonly T[],
  key?: KF,
  value?: KV,
) {
  type TKeyType = undefined extends KF ? T : KF extends keyof T ? T[KF] : KF extends ((item: T) => infer K) ? K : never;
  type TValueType = undefined extends KV ? T : KV extends ((item: T) => infer VF) ? VF : KV extends keyof T ? T[KV] : never;

  if (!array?.length)
    return new Map<TKeyType, TValueType>();

  const keyFn: (item: T) => TKeyType
    = typeof key === 'function'
      ? key
      : key !== undefined && typeof array[0] === 'object' && array[0] !== null
        ? item => item[key as keyof T]
        : item => item;

  const valueFn: (item: T) => TValueType
    = typeof value === 'function'
      ? value
      : value !== undefined && typeof array[0] === 'object' && array[0] !== null
        ? item => item[value as keyof T]
        : item => item;

  // Create the map and loop the array only once
  const map = new Map<TKeyType, TValueType>();
  array?.forEach((item) => {
    map.set(keyFn(item), valueFn(item));
  });

  return map;
}
