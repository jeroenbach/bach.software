import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useScrollspy } from './useScrollspy';

const mock = vi.hoisted(() => ({
  useScroll: vi.fn(() => ({ y: ref(0) })),
}));

vi.mock('@vueuse/core', async () => {
  const actual = (await vi.importActual('@vueuse/core')) as any;
  return {
    ...actual,
    useScroll: mock.useScroll,
  };
});

function createHeading(id: string, top: number) {
  const element = document.createElement('h2');
  element.id = id;
  element.getBoundingClientRect = () => ({ top }) as DOMRect;
  document.body.appendChild(element);
  return element;
}

function setHeadingTop(element: HTMLElement, top: number) {
  element.getBoundingClientRect = () => ({ top }) as DOMRect;
}

describe('useScrollspy', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('has no active heading while above the first heading', () => {
    createHeading('one', 500);
    createHeading('two', 900);

    const { activeId } = useScrollspy(['one', 'two']);

    expect(activeId.value).toBeUndefined();
  });

  it.each([
    { tops: [50, 400], expected: 'one', description: 'first heading passed the offset' },
    { tops: [-200, 50], expected: 'two', description: 'second heading passed the offset' },
    { tops: [-400, -200], expected: 'two', description: 'all headings passed the offset' },
  ])(
    'activates $expected when $description',
    ({ tops, expected }) => {
      createHeading('one', tops[0]!);
      createHeading('two', tops[1]!);

      const { activeId } = useScrollspy(['one', 'two']);

      expect(activeId.value).toBe(expected);
    },
  );

  it('updates the active heading when the user scrolls', () => {
    const scrollY = ref(0);
    mock.useScroll.mockReturnValueOnce({ y: scrollY });
    const one = createHeading('one', 500);
    const two = createHeading('two', 900);

    const { activeId } = useScrollspy(['one', 'two']);
    expect(activeId.value).toBeUndefined();

    setHeadingTop(one, 50);
    setHeadingTop(two, 450);
    scrollY.value = 450;
    expect(activeId.value).toBe('one');

    setHeadingTop(one, -350);
    setHeadingTop(two, 50);
    scrollY.value = 850;
    expect(activeId.value).toBe('two');
  });

  it('ignores ids without a matching element', () => {
    createHeading('two', 50);

    const { activeId } = useScrollspy(['missing', 'two']);

    expect(activeId.value).toBe('two');
  });

  it('respects a custom offset', () => {
    createHeading('one', 150);

    expect(useScrollspy(['one']).activeId.value).toBeUndefined();
    expect(useScrollspy(['one'], { offset: 200 }).activeId.value).toBe('one');
  });
});
