import { beforeEach, describe, expect, it, vi } from 'vitest';
import { kiotaError } from '~/tests/helpers/apiErrors';
import { mountWithContexts } from '~/tests/helpers/mountWithContexts';
import { usePageReadsContext } from './usePageReadsContext';

const mock = vi.hoisted(() => ({
  getPageReads: vi.fn(),
}));

vi.mock('~/services/backend', () => ({
  useApiClient: () => ({
    analytics: { pageReads: { get: mock.getPageReads } },
  }),
}));

const pageReads = { opened: 10, read: 4 };

describe('usePageReadsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.getPageReads.mockResolvedValue(pageReads);
    useRuntimeConfig().public.plausibleDomain = '';
  });

  describe('fetching', () => {
    it('should fetch the page reads for the current page', async () => {
      const { results: [{ pageReads: state }], messages } = await mountWithContexts(usePageReadsContext);

      await vi.waitFor(() => expect(state.value).toEqual(pageReads));
      expect(mock.getPageReads).toHaveBeenCalledWith({
        queryParameters: { url: expect.stringContaining(window.location.origin) },
      });
      expect(messages.value).toHaveLength(0);
    });

    it('should query the page reads on the configured plausible domain', async () => {
      useRuntimeConfig().public.plausibleDomain = 'plausible.bach.software';

      const { results: [{ pageReads: state }] } = await mountWithContexts(usePageReadsContext);

      await vi.waitFor(() => expect(state.value).toEqual(pageReads));
      expect(mock.getPageReads).toHaveBeenCalledWith({
        queryParameters: { url: expect.stringContaining('https://plausible.bach.software/') },
      });
    });

    it('should report that it is loading until the request settles', async () => {
      let resolve!: (value: unknown) => void;
      mock.getPageReads.mockReturnValue(new Promise((res) => {
        resolve = res;
      }));

      const { results: [{ isLoadingPageReads }], messages } = await mountWithContexts(usePageReadsContext);

      await vi.waitFor(() => expect(isLoadingPageReads.value).toBe(true));
      expect(messages.value).toHaveLength(0);
      resolve(pageReads);
      await vi.waitFor(() => expect(isLoadingPageReads.value).toBe(false));
    });
  });

  // Analytics failures are deliberately invisible (`reportErrors: false`):
  // the page renders without the counters instead of showing an error bar.
  describe('failures', () => {
    it.each([
      ['a 502', kiotaError(502)],
      ['a 503', kiotaError(503)],
      ['a 500', kiotaError(500)],
      ['a 404', kiotaError(404)],
      ['a validation failure', kiotaError(400, { title: 'Validation failed', errors: { url: ['urlRequired', 'urlInvalid'] } })],
      ['an unmapped status', kiotaError(418)],
      ['a network failure', new TypeError('Failed to fetch')],
    ])('should stay silent and resolve to no data for %s', async (_, error) => {
      mock.getPageReads.mockRejectedValue(error);

      const { results: [{ pageReads: state, isLoadingPageReads }], messages } = await mountWithContexts(usePageReadsContext);

      await vi.waitFor(() => expect(mock.getPageReads).toHaveBeenCalled());
      await vi.waitFor(() => expect(isLoadingPageReads.value).toBe(false));
      expect(state.value).toBeUndefined();
      expect(messages.value).toHaveLength(0);
    });
  });
});
