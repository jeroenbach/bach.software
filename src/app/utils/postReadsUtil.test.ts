import { describe, expect, it } from 'vitest';
import { toPostReads } from './postReadsUtil';

describe('postReadsUtil', () => {
  describe('toPostReads', () => {
    it('maps threeQuarterRead to the read count', () => {
      expect(toPostReads({ threeQuarterRead: 11 })).toEqual({ readCount: 11 });
    });

    it('ignores read when threeQuarterRead is present', () => {
      expect(toPostReads({ read: 3, threeQuarterRead: 11 })).toEqual({ readCount: 11 });
    });

    it('maps missing or null counts to no count', () => {
      expect(toPostReads({})).toEqual({ readCount: undefined });
      expect(toPostReads({ read: 3, threeQuarterRead: null })).toEqual({ readCount: undefined });
    });

    it('keeps a count of zero', () => {
      expect(toPostReads({ threeQuarterRead: 0 })).toEqual({ readCount: 0 });
    });

    it('maps undefined and null to undefined', () => {
      expect(toPostReads(undefined)).toBeUndefined();
      expect(toPostReads(null)).toBeUndefined();
    });
  });
});
