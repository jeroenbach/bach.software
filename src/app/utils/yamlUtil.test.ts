import { describe, expect, it } from 'vitest';
import { readYaml } from './yamlUtil';

describe('readYaml', () => {
  it('should parse a yaml document into an object', () => {
    expect(readYaml<{ title: string, tags: string[] }>('title: Hello\ntags:\n  - a\n  - b\n')).toEqual({
      title: 'Hello',
      tags: ['a', 'b'],
    });
  });
});
