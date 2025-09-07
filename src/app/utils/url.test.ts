import { describe, expect, it } from 'vitest';

describe('url', () => {
  describe('createSlug', () => {
    it('should work with a .', async () => {
      expect(
        createSlug('This is a test with a dot. Let\'s see if it works'),
      ).toBe('this-is-a-test-with-a-dot_-let\'s-see-if-it-works');
    });
  });

  describe('createAbsoluteUrl', () => {
    it('should add the base url correctly', async () => {
      expect(createAbsoluteUrl('/', 'https://bach.software')).toBe(
        'https://bach.software/',
      );
    });
    it('should ignore the base url if it is already part of the url', async () => {
      expect(
        createAbsoluteUrl('https://bach.software', 'https://bach.software'),
      ).toBe('https://bach.software/');
      expect(
        createAbsoluteUrl('https://bach.software/', 'https://bach.software'),
      ).toBe('https://bach.software/');
      expect(
        createAbsoluteUrl('https://bach.software', 'https://bach.software/'),
      ).toBe('https://bach.software/');
    });
  });
});
