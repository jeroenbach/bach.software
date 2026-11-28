import { describe, expect, it } from 'vitest';
import {
  isFalseOrUndefined,
  isNotNullOrUndefined,
  isNotNullOrUndefinedOrEmpty,
  isNullOrUndefined,
  isNullOrUndefinedOrEmpty,
  isNumber,
} from './checksUtil';

describe('checksUtil', () => {
  it('should treat only null and undefined as null or undefined', () => {
    expect(isNullOrUndefined(null)).toBe(true);
    expect(isNullOrUndefined(undefined)).toBe(true);
    expect(isNullOrUndefined(0)).toBe(false);
    expect(isNotNullOrUndefined('')).toBe(true);
  });

  it('should also treat the empty string as empty', () => {
    expect(isNullOrUndefinedOrEmpty('')).toBe(true);
    expect(isNullOrUndefinedOrEmpty(' ')).toBe(false);
    expect(isNotNullOrUndefinedOrEmpty('text')).toBe(true);
    expect(isNotNullOrUndefinedOrEmpty(null)).toBe(false);
  });

  it('should treat only false and undefined as false or undefined', () => {
    expect(isFalseOrUndefined(false)).toBe(true);
    expect(isFalseOrUndefined(undefined)).toBe(true);
    expect(isFalseOrUndefined(true)).toBe(false);
    expect(isFalseOrUndefined(0)).toBe(false);
  });

  it('should recognize numbers by type only', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(Number.NaN)).toBe(true);
    expect(isNumber('1')).toBe(false);
  });
});
