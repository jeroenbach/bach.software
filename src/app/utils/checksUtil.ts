type NullOrUndefined = null | undefined;
type NullOrUndefinedOrEmpty = NullOrUndefined | '';

export function isNullOrUndefined<T>(value: T | NullOrUndefined): value is NullOrUndefined {
  return value === null || value === undefined;
}

export function isNullOrUndefinedOrEmpty<T>(value: T | NullOrUndefinedOrEmpty): value is NullOrUndefinedOrEmpty {
  return isNullOrUndefined(value) || value === '';
}

export function isNotNullOrUndefined<T>(value: T | NullOrUndefined): value is T {
  return !isNullOrUndefined(value);
}

export function isNotNullOrUndefinedOrEmpty<T>(value: T | NullOrUndefinedOrEmpty): value is T {
  return !isNullOrUndefinedOrEmpty(value);
}

export function isFalseOrUndefined<T>(value: T | undefined | false): value is undefined | false {
  return value === false || value === undefined;
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}
