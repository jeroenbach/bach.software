import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountWithContexts } from '~/tests/helpers/mountWithContexts';
import { usePageLikesContext } from './usePageLikesContext';
import { usePageReadsContext } from './usePageReadsContext';

// The backend client is deliberately not mocked: Kiota's own request adapter parses the
// stubbed responses, so these tests prove the shape of the errors the real client throws.

mockNuxtImport('useTrackEvent', () => vi.fn());

const unavailable = 'This information is temporarily unavailable. Please try again later.';
const unexpected = 'Something went wrong. Please try again later.';

function problemResponse(status: number, body: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({ status, ...body }), {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}

function stubFetch(response: () => Response | Promise<Response>) {
  const fetchMock = vi.fn(async () => response());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('api error surfacing through the generated client', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    useRuntimeConfig().public.plausibleDomain = '';
    localStorage.clear();
  });

  it.each([
    ['a 502 problem response', () => problemResponse(502, { title: 'A dependency failed' }), unavailable],
    ['a 500 problem response', () => problemResponse(500, { title: 'An unexpected error occurred' }), unexpected],
    ['a 502 with an html body from a proxy', () => new Response('<html><h1>502 Bad Gateway</h1></html>', { status: 502, headers: { 'Content-Type': 'text/html' } }), unavailable],
    ['a 502 with a plain text body', () => new Response('Bad Gateway', { status: 502, headers: { 'Content-Type': 'text/plain' } }), unavailable],
    ['a 502 without a body or content type', () => new Response(null, { status: 502 }), unavailable],
    ['a 500 with an html body', () => new Response('<h1>Oops</h1>', { status: 500, headers: { 'Content-Type': 'text/html' } }), unexpected],
    ['a 404 with an html body', () => new Response('<h1>Not found</h1>', { status: 404, headers: { 'Content-Type': 'text/html' } }), undefined],
  ])('should map %s to the expected message', async (_, response, expected) => {
    stubFetch(response);

    const { results: [{ isLoadingPageReads }], messages } = await mountWithContexts(usePageReadsContext);

    await vi.waitFor(() => expect(isLoadingPageReads.value).toBe(false));
    await vi.waitFor(() => expect(messages.value.map(x => x.description)).toEqual(expected ? [expected] : []));
  });

  it('should show the translated codes of a validation problem read from the real error shape', async () => {
    stubFetch(() => problemResponse(400, {
      title: 'Validation failed',
      errors: { url: ['urlRequired', 'urlInvalid'] },
    }));

    const { messages } = await mountWithContexts(usePageReadsContext);

    await vi.waitFor(() => expect(messages.value).toHaveLength(1));
    expect(messages.value[0]).toMatchObject({
      description: 'Some of the input is not valid.',
      details: [{ label: 'url', values: ['A URL is required.', 'The URL is not valid.'] }],
    });
  });

  it('should map a network failure to the unexpected message', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));

    const { messages } = await mountWithContexts(usePageReadsContext);

    await vi.waitFor(() => expect(messages.value.map(x => x.description)).toEqual([unexpected]));
  });

  it('should show no message for a successful response', async () => {
    stubFetch(() => new Response(JSON.stringify({ opened: 3 }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const { results: [{ pageReads }], messages } = await mountWithContexts(usePageReadsContext);

    await vi.waitFor(() => expect(pageReads.value).toMatchObject({ opened: 3 }));
    expect(messages.value).toHaveLength(0);
  });

  it('should show the unavailable message only once when both requests fail', async () => {
    const fetchMock = stubFetch(() => problemResponse(502));

    const { messages } = await mountWithContexts(usePageReadsContext, () => usePageLikesContext());

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(messages.value.length).toBeGreaterThan(0));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(messages.value.map(x => x.description)).toEqual([unavailable]);
  });
});
