import { beforeEach, describe, expect, it, vi } from 'vitest';
import { kiotaError } from '~/tests/helpers/apiErrors';
import { translate } from '~/tests/helpers/translate';
import { useApiErrorReporter } from './useApiErrorReporter';
import { createPinia, setActivePinia } from './useDestructiblePinia';
import { useMessageStore } from './useMessageStore';

const mock = vi.hoisted(() => ({ t: vi.fn() }));

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: mock.t }) }));

const unavailable = 'This information is temporarily unavailable. Please try again later.';
const unexpected = 'Something went wrong. Please try again later.';

function arrange(options?: Parameters<typeof useApiErrorReporter>[0]) {
  const { messages } = useMessageStore();
  return { messages, ...useApiErrorReporter(options) };
}

describe('useApiErrorReporter', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mock.t.mockReset().mockImplementation(translate);
  });

  describe('status mapping', () => {
    it.each([502, 503])('should map a %i response status to the unavailable message', async (status) => {
      const { messages, reportError } = arrange();

      const outcome = await reportError(kiotaError(status));

      expect(outcome).toEqual({ status: 'error', description: unavailable });
      expect(messages.value.map(x => x.description)).toEqual([unavailable]);
    });

    it('should map a 500 to the unexpected message', async () => {
      const { messages, reportError } = arrange();

      await reportError(kiotaError(500));

      expect(messages.value.map(x => x.description)).toEqual([unexpected]);
    });

    it.each([504, 418, 400])('should not map status %i to the unavailable message', async (status) => {
      const { messages, reportError } = arrange();

      await reportError(kiotaError(status));

      expect(messages.value.map(x => x.description)).toEqual([unexpected]);
    });

    it('should read the status from responseStatusCode, not from the body', async () => {
      const { messages, reportError } = arrange();

      await reportError({ ...kiotaError(502), status: 200 });
      await reportError({ responseStatusCode: 503 });

      expect(messages.value.map(x => x.description)).toEqual([unavailable]);
    });
  });

  describe('error codes', () => {
    it('should translate a code with its placeholders', async () => {
      const { reportError } = arrange();

      await reportError(kiotaError(409, { code: 'orderShipped', placeholders: { orderId: '12' } }));

      expect(mock.t).toHaveBeenCalledWith('errors.orderShipped', { orderId: '12' });
    });

    it('should show the translated text of a known code', async () => {
      const { messages, reportError } = arrange();

      await reportError(kiotaError(400, { code: 'urlRequired' }));

      expect(messages.value.map(x => x.description)).toEqual(['A URL is required.']);
    });

    it.each([
      ['an unknown code is reported by its key', kiotaError(409, { code: 'notInCatalog' }), 'errors.notInCatalog'],
      ['a missing code', kiotaError(409), unexpected],
    ])('should fall back for %s', async (_, error, expected) => {
      const { messages, reportError } = arrange();

      await reportError(error);

      expect(messages.value.map(x => x.description)).toEqual([expected]);
    });

    it.each([
      ['a TypeError', new TypeError('Failed to fetch')],
      ['an AbortError', new DOMException('aborted', 'AbortError')],
      ['a rejected string', 'boom'],
      ['undefined', undefined],
    ])('should map %s to the unexpected message', async (_, error) => {
      const { messages, reportError } = arrange();

      await reportError(error);

      expect(messages.value.map(x => x.description)).toEqual([unexpected]);
    });
  });

  describe('validation problems', () => {
    it('should expand the field errors into one translated line per field', async () => {
      const { messages, reportError } = arrange();

      const outcome = await reportError(kiotaError(400, {
        errors: { url: ['urlRequired', 'urlInvalid'], other: ['urlInvalid'] },
      }));

      expect(outcome).toEqual({
        status: 'error',
        description: 'Some of the input is not valid.',
        validationErrors: [
          { label: 'url', values: ['A URL is required.', 'The URL is not valid.'] },
          { label: 'other', values: ['The URL is not valid.'] },
        ],
      });
      expect(messages.value).toHaveLength(1);
      expect(messages.value[0]!.details).toHaveLength(2);
    });

    it('should prefer errorDetails and interpolate their placeholders', async () => {
      const { reportError } = arrange();

      const outcome = await reportError(kiotaError(400, {
        errors: { ignored: ['urlRequired'] },
        errorDetails: [
          { code: 'urlRequired', field: 'url' },
          { code: 'urlInvalid', field: 'url' },
        ],
      }));

      expect(outcome).toMatchObject({
        validationErrors: [{ label: 'url', values: ['A URL is required.', 'The URL is not valid.'] }],
      });
    });

    it('should give a line without a label when the field name is empty', async () => {
      const { reportError } = arrange();

      const outcome = await reportError(kiotaError(400, { errors: { '': ['urlRequired'] } }));

      expect(outcome).toMatchObject({ validationErrors: [{ label: undefined, values: ['A URL is required.'] }] });
    });

    it('should use the code of the problem as the heading when it has one', async () => {
      const { reportError } = arrange();

      const outcome = await reportError(kiotaError(400, { code: 'urlInvalid', errors: { url: ['urlInvalid'] } }));

      expect(outcome).toMatchObject({ description: 'The URL is not valid.' });
    });
  });

  describe('options', () => {
    it('should report nothing for a 404 and resolve it as not found', async () => {
      const { messages, reportError } = arrange();

      const outcome = await reportError(kiotaError(404));

      expect(outcome).toEqual({ status: 'notFound' });
      expect(messages.value).toHaveLength(0);
    });

    it('should report a 404 when it is an error for this call', async () => {
      const { messages, reportError } = arrange({ notFoundIsError: true });

      const outcome = await reportError(kiotaError(404));

      expect(outcome.status).toBe('error');
      expect(messages.value).toHaveLength(1);
    });

    it('should redirect a 401 instead of reporting it when a handler is given', async () => {
      const onUnauthorized = vi.fn();
      const { messages, reportError } = arrange({ onUnauthorized });

      const outcome = await reportError(kiotaError(401));

      expect(outcome).toEqual({ status: 'redirected' });
      expect(onUnauthorized).toHaveBeenCalledOnce();
      expect(messages.value).toHaveLength(0);
    });

    it('should report a 401 like any other failure without a handler', async () => {
      const { messages, reportError } = arrange();

      await reportError(kiotaError(401));

      expect(messages.value).toHaveLength(1);
    });

    it('should name the failing call when a friendlyName is given', async () => {
      const { messages, reportError } = arrange({ friendlyName: 'loading the page likes' });

      await reportError(kiotaError(500));

      expect(messages.value.map(x => x.description)).toEqual([
        `Error while loading the page likes: ${unexpected}`,
      ]);
    });

    it('should wrap a translated error code with the friendlyName', async () => {
      const { messages, reportError } = arrange({ friendlyName: 'saving the url' });

      await reportError(kiotaError(400, { code: 'urlRequired' }));

      expect(messages.value.map(x => x.description)).toEqual([
        'Error while saving the url: A URL is required.',
      ]);
    });

    it('should not wrap an explicit errorMessage with the friendlyName', async () => {
      const { messages, reportError } = arrange({ friendlyName: 'loading', errorMessage: 'Custom' });

      await reportError(kiotaError(500));

      expect(messages.value.map(x => x.description)).toEqual(['Custom']);
    });

    it('should use a fixed errorMessage', async () => {
      const { messages, reportError } = arrange({ errorMessage: 'Custom' });

      await reportError(kiotaError(502));

      expect(messages.value.map(x => x.description)).toEqual(['Custom']);
    });

    it('should let an errorMessage function use the problem details', async () => {
      const { messages, reportError } = arrange({ errorMessage: problem => `Failed with ${problem?.status}` });

      await reportError(kiotaError(409));

      expect(messages.value.map(x => x.description)).toEqual(['Failed with 409']);
    });

    it('should collapse the errors of one instance into a grouped bar', async () => {
      const { messages, reportError } = arrange({ group: 'loading', groupMessage: 'Loading failed' });

      await reportError(kiotaError(502));
      await reportError(kiotaError(500));

      expect(messages.value).toHaveLength(1);
      expect(messages.value[0]).toMatchObject({
        description: 'Loading failed',
        details: [{ values: [unavailable] }, { values: [unexpected] }],
      });
    });

    it('should keep an error out of the message store when reporting is turned off', async () => {
      const { messages, reportError } = arrange({ reportErrors: false });

      const outcome = await reportError(kiotaError(500));

      expect(outcome).toEqual({ status: 'error', description: unexpected });
      expect(messages.value).toHaveLength(0);
    });

    it('should still give the caller the field errors when reporting is turned off', async () => {
      const { messages, reportError } = arrange({ reportErrors: false });

      const outcome = await reportError(kiotaError(400, { errors: { url: ['urlRequired'] } }));

      expect(outcome).toMatchObject({
        status: 'error',
        validationErrors: [{ label: 'url', values: ['A URL is required.'] }],
      });
      expect(messages.value).toHaveLength(0);
    });

    it('should still resolve a 404 as not found and redirect a 401 when reporting is turned off', async () => {
      const onUnauthorized = vi.fn();
      const { reportError } = arrange({ reportErrors: false, onUnauthorized });

      expect(await reportError(kiotaError(404))).toEqual({ status: 'notFound' });
      expect(await reportError(kiotaError(401))).toEqual({ status: 'redirected' });
      expect(onUnauthorized).toHaveBeenCalledOnce();
    });

    it('should show an identical error reported twice only once', async () => {
      const { messages, reportError } = arrange();

      await reportError(kiotaError(502));
      await reportError(kiotaError(502));

      expect(messages.value).toHaveLength(1);
    });

    it('should report a success that outlives the component', async () => {
      const { messages, reportSuccess } = arrange();

      await reportSuccess('Saved', { persist: true });

      expect(messages.value[0]).toMatchObject({ severity: 'success', description: 'Saved', persist: true });
    });
  });
});
