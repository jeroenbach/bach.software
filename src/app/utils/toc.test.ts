import { describe, expect, it } from 'vitest';

import { flattenTocLinkIds } from './toc';

describe('flattenTocLinkIds', () => {
  it('returns an empty list when there are no links', () => {
    expect(flattenTocLinkIds([])).toEqual([]);
  });

  it('keeps nested children in document order', () => {
    expect(
      flattenTocLinkIds([
        { id: 'one', text: 'One', depth: 2 },
        {
          id: 'two',
          text: 'Two',
          depth: 2,
          children: [
            { id: 'two-a', text: 'Two A', depth: 3 },
            { id: 'two-b', text: 'Two B', depth: 3 },
          ],
        },
        { id: 'three', text: 'Three', depth: 2 },
      ]),
    ).toEqual(['one', 'two', 'two-a', 'two-b', 'three']);
  });
});
