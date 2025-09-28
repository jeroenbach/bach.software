import { describe, expect, it } from 'vitest';
import {
  toMap,
} from '@/utils/toMap';

describe('toMap', () => {
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
  it('should transform an array to a map, using a key', async () => {
    expect(toMap(array, 'key')).toEqual(
      new Map([
        [
          1,
          {
            key: 1,
            value: 'value 1',
          },
        ],
        [
          2,
          {
            key: 2,
            value: 'value 2',
          },
        ],
        [
          3,
          {
            key: 3,
            value: 'value 3',
          },
        ],
      ]),
    );
  });
  it('should transform an array to a map, using a key function', async () => {
    expect(toMap(array, x => x.key)).toEqual(
      new Map([
        [
          1,
          {
            key: 1,
            value: 'value 1',
          },
        ],
        [
          2,
          {
            key: 2,
            value: 'value 2',
          },
        ],
        [
          3,
          {
            key: 3,
            value: 'value 3',
          },
        ],
      ]),
    );
  });
  it('should transform an array to a map, using a key and getting only the value', async () => {
    expect(toMap(array, 'key', 'value')).toEqual(
      new Map([
        [1, 'value 1'],
        [2, 'value 2'],
        [3, 'value 3'],
      ]),
    );
  });
  it('should transform an array to a map, using a key function and value', async () => {
    expect(toMap(array, x => `key-${x.key}`, 'value')).toEqual(
      new Map([
        ['key-1', 'value 1'],
        ['key-2', 'value 2'],
        ['key-3', 'value 3'],
      ]),
    );
  });
  it('should transform an array to a map, using a key function and value function', async () => {
    expect(
      toMap(
        array,
        x => `key-${x.key}`,
        x => `added ${x.value}`,
      ),
    ).toEqual(
      new Map([
        ['key-1', 'added value 1'],
        ['key-2', 'added value 2'],
        ['key-3', 'added value 3'],
      ]),
    );
  });
  it('should transform an array to a map with no parameters (item as both key and value)', async () => {
    expect(toMap(array)).toEqual(
      new Map([
        [
          {
            key: 1,
            value: 'value 1',
          },
          {
            key: 1,
            value: 'value 1',
          },
        ],
        [
          {
            key: 2,
            value: 'value 2',
          },
          {
            key: 2,
            value: 'value 2',
          },
        ],
        [
          {
            key: 3,
            value: 'value 3',
          },
          {
            key: 3,
            value: 'value 3',
          },
        ],
      ]),
    );
  });
  it('should be error prone', async () => {
    expect(toMap([], '')).toEqual(new Map());
    expect(toMap([], 'key')).toEqual(new Map());
    expect(toMap([], undefined)).toEqual(new Map());
    // @ts-expect-error testing
    expect(toMap([], null)).toEqual(new Map());
    // @ts-expect-error testing
    expect(toMap(undefined, '')).toEqual(new Map());
  });
});
