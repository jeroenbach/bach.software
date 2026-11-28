import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWithGatewayErrorsNormalized } from './gatewayErrorUtil';

function answerWith(response: Response) {
  vi.stubGlobal('fetch', vi.fn(async () => response));
}

describe('fetchWithGatewayErrorsNormalized', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([502, 503])('should turn a %s html page into a problem response carrying the status', async (status) => {
    answerWith(new Response('<h1>Gateway page</h1>', { status, statusText: 'Gateway', headers: { 'Content-Type': 'text/html; charset=utf-8' } }));

    const response = await fetchWithGatewayErrorsNormalized('/api/x', {});

    expect(response.status).toBe(status);
    expect(response.headers.get('Content-Type')).toBe('application/problem+json');
    expect(await response.json()).toEqual({ status, title: 'Gateway' });
  });

  it('should normalize a gateway response without a body', async () => {
    answerWith(new Response(null, { status: 502 }));

    const response = await fetchWithGatewayErrorsNormalized('/api/x', {});

    expect(response.headers.get('Content-Type')).toBe('application/problem+json');
    expect(await response.json()).toEqual({ status: 502 });
  });

  it('should still normalize the response when discarding the gateway page fails', async () => {
    const body = new ReadableStream({
      cancel() {
        throw new Error('stream already closed');
      },
    });
    answerWith(new Response(body, { status: 503, headers: { 'Content-Type': 'text/html' } }));

    const response = await fetchWithGatewayErrorsNormalized('/api/x', {});

    expect(response.headers.get('Content-Type')).toBe('application/problem+json');
    expect(await response.json()).toEqual({ status: 503 });
  });

  it('should keep the headers of the original response apart from the body descriptors', async () => {
    answerWith(new Response('<h1>x</h1>', {
      status: 503,
      headers: { 'Content-Type': 'text/html', 'Content-Length': '10', 'Content-Encoding': 'gzip', 'Retry-After': '30' },
    }));

    const response = await fetchWithGatewayErrorsNormalized('/api/x', {});

    expect(response.headers.get('Retry-After')).toBe('30');
    expect(response.headers.has('Content-Length')).toBe(false);
    expect(response.headers.has('Content-Encoding')).toBe(false);
  });

  it.each(['application/json', 'application/problem+json; charset=utf-8'])('should leave a %s gateway response untouched', async (contentType) => {
    const original = new Response('{"status":502,"code":"dependencyFailed"}', { status: 502, headers: { 'Content-Type': contentType } });
    answerWith(original);

    const response = await fetchWithGatewayErrorsNormalized('/api/x', {});

    expect(response).toBe(original);
  });

  it.each([200, 400, 404, 500])('should leave a %s html response untouched', async (status) => {
    const original = new Response('<h1>page</h1>', { status, headers: { 'Content-Type': 'text/html' } });
    answerWith(original);

    const response = await fetchWithGatewayErrorsNormalized('/api/x', {});

    expect(response).toBe(original);
  });

  it('should pass the request through to fetch unchanged', async () => {
    answerWith(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const init = { method: 'GET', headers: { Accept: 'application/json' } };

    await fetchWithGatewayErrorsNormalized('/api/analytics/pageReads', init);

    expect(fetch).toHaveBeenCalledWith('/api/analytics/pageReads', init);
  });
});
