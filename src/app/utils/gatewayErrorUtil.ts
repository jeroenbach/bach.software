/** Statuses a proxy or ingress answers with when the API behind it is down. */
const gatewayStatuses = new Set([502, 503]);

/**
 * A proxy or ingress usually answers 502 and 503 with its own HTML page. Kiota can
 * only read the error body through a registered parser, so such a response throws a
 * plain error without a status and the failure looks unexpected instead of
 * unavailable. Re-answering with a problem-details body keeps the status and lets
 * the generated error mapping do its work.
 */
export async function fetchWithGatewayErrorsNormalized(input: string, init: RequestInit): Promise<Response> {
  const response = await fetch(input, init);

  if (!gatewayStatuses.has(response.status) || /json/i.test(response.headers.get('Content-Type') ?? ''))
    return response;

  await response.body?.cancel().catch(() => {});

  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'application/problem+json');
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');

  return new Response(
    JSON.stringify({ status: response.status, title: response.statusText || undefined }),
    { status: response.status, statusText: response.statusText, headers },
  );
}
