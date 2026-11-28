/**
 * Builds what the generated backend client throws for a failed response: the parsed
 * error model (a plain object, not an Error) carrying the response status. `code` is
 * a typed property (it is in the OpenAPI schema), open objects (`placeholders`,
 * `errors`) hold their values in a nested `additionalData` bag, and `errorDetails`
 * (not in the schema) lands in the top-level `additionalData`.
 */
export function kiotaError(
  status: number,
  body: {
    title?: string
    code?: string
    placeholders?: Record<string, unknown>
    errors?: Record<string, string[]>
    errorDetails?: Array<{ code: string, field?: string, placeholders?: Record<string, unknown> }>
  } = {},
) {
  const { title, code, placeholders, errors, errorDetails } = body;

  return {
    responseStatusCode: status,
    status,
    title,
    ...(code !== undefined ? { code } : {}),
    ...(placeholders ? { placeholders: { additionalData: placeholders } } : {}),
    ...(errors ? { errors: { additionalData: errors } } : {}),
    ...(errorDetails ? { additionalData: { errorDetails } } : {}),
  };
}

/** A promise that is resolved or rejected by the test. */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
