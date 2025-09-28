import { describe, expect, it } from 'vitest';
import {
  divideArray,
} from '@/utils/divideArray';

describe('divideArray', () => {
  it('should divide an array correctly', async () => {
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

    expect(divideArray(array, x => x.key <= 2)).toEqual([
      [
        {
          key: 1,
          value: 'value 1',
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
      ],
    ]);
  });
  it('should divide and map an array correctly', async () => {
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

    expect(
      divideArray(
        array,
        x => x.value === 'value 2',
        x => x.key,
      ),
    ).toEqual([[2], [1, 3]]);
  });
  it('should be error prone', async () => {
    // @ts-expect-error testing
    expect(divideArray([], undefined)).toEqual([[], []]);
    // @ts-expect-error testing
    expect(divideArray([], null)).toEqual([[], []]);
    // @ts-expect-error testing
    expect(divideArray([], _ => null)).toEqual([[], []]);
    expect(divideArray([], _ => false)).toEqual([[], []]);
    // @ts-expect-error testing
    expect(divideArray(null, _ => null)).toEqual([[], []]);
    // @ts-expect-error testing
    expect(divideArray(undefined, _ => null)).toEqual([[], []]);
    // @ts-expect-error testing
    expect(divideArray(undefined, _ => false)).toEqual([[], []]);
    // @ts-expect-error testing
    expect(divideArray(undefined, null)).toEqual([[], []]);
  });
});
