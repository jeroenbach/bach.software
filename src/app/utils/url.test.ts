import { describe, expect, it } from 'vitest';
import { createAbsoluteUrl, createSlug, stripHtmlExtension } from '@/utils/url';

describe('url', () => {
  describe('createSlug', () => {
    it('should work with a .', async () => {
      expect(
        createSlug('This is a test with a dot. Let\'s see if it works'),
      ).toBe('this-is-a-test-with-a-dot_-let\'s-see-if-it-works');
    });
  });

  describe('stripHtmlExtension', () => {
    it('should strip .html at the end of the url', () => {
      expect(stripHtmlExtension('/posts/1-my-post.html')).toBe('/posts/1-my-post');
    });
    it('should strip .html while keeping the #fragment', () => {
      expect(stripHtmlExtension('/nl/posts/1-my-post.html#section-two')).toBe('/nl/posts/1-my-post#section-two');
    });
    it('should strip .html while keeping the ?query', () => {
      expect(stripHtmlExtension('/posts/1-my-post.html?page=2')).toBe('/posts/1-my-post?page=2');
    });
    it('should reduce index.html to the directory url', () => {
      expect(stripHtmlExtension('/index.html')).toBe('/');
      expect(stripHtmlExtension('/nl/index.html#about')).toBe('/nl/#about');
    });
    it('should leave urls without an extension untouched', () => {
      expect(stripHtmlExtension('/posts/1-my-post#section')).toBe('/posts/1-my-post#section');
      expect(stripHtmlExtension('/')).toBe('/');
    });
    it('should not touch .html appearing mid-path', () => {
      expect(stripHtmlExtension('/posts/about-html-files')).toBe('/posts/about-html-files');
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
