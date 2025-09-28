import { describe, expect, it } from 'vitest';
import {
  toDictionary,
} from '@/utils/toDictionary';

describe('toDictionary', () => {
  const array = [
    {
      key: 1,
      value: 'value 1',
    },
    {
      key: 2,
      value: 'value 2',
    },
    {
      key: 3,
      value: 'value 3',
    },
  ];
  it('should transform an array to a dictionary, using a key', async () => {
    expect(toDictionary(array, 'key')).toEqual({
      1: {
        key: 1,
        value: 'value 1',
      },
      2: {
        key: 2,
        value: 'value 2',
      },
      3: {
        key: 3,
        value: 'value 3',
      },
    });
  });
  it('should transform an array to a dictionary, using a key function', async () => {
    expect(toDictionary(array, x => x.key)).toEqual({
      1: {
        key: 1,
        value: 'value 1',
      },
      2: {
        key: 2,
        value: 'value 2',
      },
      3: {
        key: 3,
        value: 'value 3',
      },
    });
  });
  it('should transform an array to a dictionary, using a key and getting only the value', async () => {
    expect(toDictionary(array, 'key', 'value')).toEqual({
      1: 'value 1',
      2: 'value 2',
      3: 'value 3',
    });
  });
  it('should transform an array to a dictionary, using a key function and value', async () => {
    expect(toDictionary(array, x => `key-${x.key}`, 'value')).toEqual({
      'key-1': 'value 1',
      'key-2': 'value 2',
      'key-3': 'value 3',
    });
  });
  it('should transform an array to a dictionary, using a key function and value function', async () => {
    expect(
      toDictionary(
        array,
        x => `key-${x.key}`,
        x => `added ${x.value}`,
      ),
    ).toEqual({
      'key-1': 'added value 1',
      'key-2': 'added value 2',
      'key-3': 'added value 3',
    });
  });
  it('should be error prone', async () => {
    // @ts-expect-error testing
    expect(toDictionary([], '')).toEqual({});
    // @ts-expect-error testing
    expect(toDictionary([], 'key')).toEqual({});
    // @ts-expect-error testing
    expect(toDictionary([], undefined)).toEqual({});
    // @ts-expect-error testing
    expect(toDictionary([], null)).toEqual({});
    // @ts-expect-error testing
    expect(toDictionary(undefined, '')).toEqual(undefined);
  });
});
