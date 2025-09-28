// Filter only keys that are of type PropertyKey (string | number | symbol)
type KeysWithPropertyKeyValues<T> = {
  [K in keyof T]-?: T[K] extends PropertyKey ? K : never;
}[keyof T];

/**
 * Helps to create a object dictionary from a list of items.
 * @param array - the array to convert
 * @param key - a keyof an array item | a function that returns a PropertyKey (string | number | symbol)
 * @param value - a keyof an array item | a function that returns any value
 * @returns an object dictionary {}
 */
export function toDictionary<
  T extends Record<PropertyKey, any>,
  K extends KeysWithPropertyKeyValues<T> | ((item: T) => PropertyKey),
  V extends keyof T | ((item: T) => any) | undefined,
>(
  array: readonly T[],
  key: K,
  value?: V,
) {
  // Either use the key as a function directly, or use the keyof value
  type TKeyType = K extends ((item: T) => infer KF) ? KF : V extends keyof T ? T[V] : never;
  const getKey: (item: T) => TKeyType
    = typeof key === 'function' ? key : item => item[key as PropertyKey];

  // In case of the value, we can also provide nothing, in that case we return the whole object
  type TValueType = undefined extends V ? T : V extends ((item: T) => infer VF) ? VF : V extends keyof T ? T[V] : never;
  const getValue: (item: T) => TValueType
    = value === undefined
      ? item => item
      : typeof value === 'function'
        ? value
        : item => item[value as PropertyKey];

  return array?.reduce(
    (acc, c) => {
      acc[getKey(c)] = getValue(c);
      return acc;
    },
    {} as Record<TKeyType, TValueType>,
  );
}
