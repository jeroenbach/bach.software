import { describe, expect, it } from 'vitest';
import {
  mergeReplace,
} from '@/utils/mergeReplace';

interface Item { id: number, name: string }

describe('uniqueBy', () => {
  it('deduplicates by numeric id', () => {
    const arr = [
      { id: 1, name: 'apple' },
      { id: 2, name: 'banana' },
      { id: 1, name: 'apple' },
    ];
    const result = uniqueBy(arr, x => x.id);
    expect(result).toEqual([
      { id: 1, name: 'apple' },
      { id: 2, name: 'banana' },
    ]);
  });

  it('deduplicates by string property', () => {
    const arr = [
      { code: 'A', value: 10 },
      { code: 'B', value: 20 },
      { code: 'A', value: 30 },
    ];
    const result = uniqueBy(arr, x => x.code);
    expect(result).toEqual([
      { code: 'A', value: 10 },
      { code: 'B', value: 20 },
    ]);
  });

  it('works with primitive arrays', () => {
    const arr = [1, 2, 1, 3, 2];
    const result = uniqueBy(arr, x => x); // identity
    expect(result).toEqual([1, 2, 3]);
  });

  it('returns empty array for empty input', () => {
    // @ts-expect-error testing
    const result = uniqueBy([], x => x.id);
    expect(result).toEqual([]);
  });

  it('keeps first occurrence when duplicates exist', () => {
    const arr = [
      { id: 1, name: 'first' },
      { id: 1, name: 'second' },
    ];
    const result = uniqueBy(arr, x => x.id);
    expect(result).toEqual([{ id: 1, name: 'first' }]);
  });

  it('can deduplicate by derived/computed key', () => {
    const arr = [{ name: 'Apple' }, { name: 'apple' }, { name: 'Banana' }];
    const result = uniqueBy(arr, x => x.name.toLowerCase());
    expect(result).toEqual([{ name: 'Apple' }, { name: 'Banana' }]);
  });
});
describe('mergeReplace', () => {
  it('replaces matching items by key and preserves original order', () => {
    const oldArr: readonly Item[] = [
      { id: 1, name: 'apple' },
      { id: 2, name: 'banana' },
      { id: 3, name: 'cherry' },
    ];

    const newArr: readonly Item[] = [
      { id: 2, name: 'blueberry' }, // replaces banana in-place
    ];

    const result = mergeReplace(oldArr, newArr, x => x.id);

    expect(result).toEqual([
      { id: 1, name: 'apple' },
      { id: 2, name: 'blueberry' }, // replaced
      { id: 3, name: 'cherry' },
    ]);
  });

  it('appends non-matching new items at the end, preserving newArr order', () => {
    const oldArr: readonly Item[] = [{ id: 1, name: 'apple' }];
    const newArr: readonly Item[] = [
      { id: 2, name: 'banana' },
      { id: 3, name: 'cherry' },
    ];

    const result = mergeReplace(oldArr, newArr, x => x.id);

    expect(result).toEqual([
      { id: 1, name: 'apple' },
      { id: 2, name: 'banana' }, // appended in newArr order
      { id: 3, name: 'cherry' },
    ]);
  });

  it('handles mix: some replacements and some appends', () => {
    const oldArr: readonly Item[] = [
      { id: 1, name: 'old-1' },
      { id: 2, name: 'old-2' },
    ];
    const newArr: readonly Item[] = [
      { id: 2, name: 'new-2' }, // replace
      { id: 3, name: 'new-3' }, // append
    ];

    const result = mergeReplace(oldArr, newArr, x => x.id);

    expect(result).toEqual([
      { id: 1, name: 'old-1' },
      { id: 2, name: 'new-2' }, // replaced
      { id: 3, name: 'new-3' }, // appended
    ]);
  });

  it('no-op when newArr is empty', () => {
    const oldArr: readonly Item[] = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ];
    const result = mergeReplace(oldArr, [], x => x.id);
    expect(result).toEqual(oldArr);
    // unchanged references for non-replaced items (useful optimisation check)
    expect(result[0]).toBe(oldArr[0]);
    expect(result[1]).toBe(oldArr[1]);
  });

  it('returns a copy of newArr when oldArr is empty', () => {
    const newArr: readonly Item[] = [
      { id: 7, name: 'x' },
      { id: 8, name: 'y' },
    ];
    const result = mergeReplace([], newArr, x => x.id);
    expect(result).toEqual(newArr);
    expect(result).not.toBe(newArr); // new array instance
  });

  it('if newArr contains duplicate keys, the last one wins (Map overwrite)', () => {
    const oldArr: readonly Item[] = [{ id: 1, name: 'old' }];
    const newArr: readonly Item[] = [
      { id: 1, name: 'new-a' },
      { id: 1, name: 'new-b' }, // last duplicate
    ];
    const result = mergeReplace(oldArr, newArr, x => x.id);
    expect(result).toEqual([{ id: 1, name: 'new-b' }]);
  });

  it('works with computed keys (e.g. case-insensitive replacement)', () => {
    const oldArr = [
      { id: 'A', name: 'old-A' },
      { id: 'b', name: 'old-b' },
    ];

    const newArr = [
      { id: 'a', name: 'new-a' }, // matches 'A' when lowercased
      { id: 'c', name: 'new-c' }, // append
    ];

    const result = mergeReplace(oldArr, newArr, x => x.id.toLowerCase());

    expect(result).toEqual([
      { id: 'a', name: 'new-a' }, // replaced A
      { id: 'b', name: 'old-b' },
      { id: 'c', name: 'new-c' }, // appended
    ]);
  });

  it('input arrays are not mutated', () => {
    const oldArr: readonly Item[] = Object.freeze([{ id: 1, name: 'apple' }]);
    const newArr: readonly Item[] = Object.freeze([
      { id: 1, name: 'apple-new' },
      { id: 2, name: 'banana' },
    ]);

    const beforeOld = JSON.stringify(oldArr);
    const beforeNew = JSON.stringify(newArr);

    const result = mergeReplace(oldArr, newArr, x => x.id);

    expect(JSON.parse(beforeOld)).toEqual(oldArr);
    expect(JSON.parse(beforeNew)).toEqual(newArr);
    expect(result).toEqual([
      { id: 1, name: 'apple-new' },
      { id: 2, name: 'banana' },
    ]);
  });

  it('supports symbol keys', () => {
    const a = Symbol('a');
    const b = Symbol('b');

    const oldArr = [
      { key: a, v: 1 },
      { key: b, v: 2 },
    ];
    const newArr = [{ key: a, v: 10 }];

    const result = mergeReplace(oldArr, newArr, x => x.key);
    expect(result).toEqual([
      { key: a, v: 10 },
      { key: b, v: 2 },
    ]);
  });
});
