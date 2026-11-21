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
const unavailable = 'This information is temporarily unavailable. Please try again later.';
const unexpected = 'Something went wrong. Please try again later.';

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

  describe('failures', () => {
    it.each([
      ['a 502', kiotaError(502), unavailable],
      ['a 503', kiotaError(503), unavailable],
      ['a 500', kiotaError(500), unexpected],
      ['an unmapped status', kiotaError(418), unexpected],
      ['a network failure', new TypeError('Failed to fetch'), unexpected],
    ])('should show one message for %s', async (_, error, expected) => {
      mock.getPageReads.mockRejectedValue(error);

      const { messages } = await mountWithContexts(usePageReadsContext);

      await vi.waitFor(() => expect(messages.value).toHaveLength(1));
      expect(messages.value[0]).toMatchObject({ severity: 'error', description: expected });
    });

    it('should show one translated line per code for a validation failure', async () => {
      mock.getPageReads.mockRejectedValue(kiotaError(400, {
        title: 'Validation failed',
        errors: { url: ['urlRequired', 'urlInvalid'] },
      }));

      const { messages } = await mountWithContexts(usePageReadsContext);

      await vi.waitFor(() => expect(messages.value).toHaveLength(1));
      expect(messages.value[0]!.details).toEqual([
        { label: 'url', values: ['A URL is required.', 'The URL is not valid.'] },
      ]);
      expect(JSON.stringify(messages.value[0])).not.toContain('Validation failed');
    });

    it('should show nothing for a 404', async () => {
      mock.getPageReads.mockRejectedValue(kiotaError(404));

      const { results: [{ isLoadingPageReads }], messages } = await mountWithContexts(usePageReadsContext);

      await vi.waitFor(() => expect(isLoadingPageReads.value).toBe(false));
      expect(messages.value).toHaveLength(0);
    });

    it('should remove the message when the component unmounts', async () => {
      mock.getPageReads.mockRejectedValue(kiotaError(502));
      const { wrapper, messages } = await mountWithContexts(usePageReadsContext);
      await vi.waitFor(() => expect(messages.value).toHaveLength(1));

      wrapper.unmount();

      expect(messages.value).toHaveLength(0);
    });

    it('should not report a failure that arrives after the component unmounted', async () => {
      let reject!: (reason: unknown) => void;
      mock.getPageReads.mockReturnValue(new Promise((_, rej) => {
        reject = rej;
      }));
      const { wrapper, messages } = await mountWithContexts(usePageReadsContext);

      wrapper.unmount();
      reject(kiotaError(502));
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(messages.value).toHaveLength(0);
    });
  });
});
