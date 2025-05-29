type NullOrUndefined = null | undefined;
type NullOrUndefinedOrEmpty = NullOrUndefined | "";

export const isNullOrUndefined = <T>(
  value: T | NullOrUndefined,
): value is NullOrUndefined => value === null || value === undefined;

export const isNullOrUndefinedOrEmpty = <T>(
  value: T | NullOrUndefinedOrEmpty,
): value is NullOrUndefinedOrEmpty => isNullOrUndefined(value) || value === "";

export const isNotNullOrUndefined = <T>(
  value: T | NullOrUndefined,
): value is T => !isNullOrUndefined(value);

export const isNotNullOrUndefinedOrEmpty = <T>(
  value: T | NullOrUndefinedOrEmpty,
): value is T => !isNullOrUndefinedOrEmpty(value);

export const isFalseOrUndefined = <T>(
  value: T | undefined | false,
): value is undefined | false => value === false || value === undefined;

export const isNumber = (value: unknown): value is number =>
  typeof value === "number";
