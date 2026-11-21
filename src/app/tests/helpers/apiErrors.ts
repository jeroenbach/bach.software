/**
 * Builds what the generated backend client throws for a failed response: the parsed
 * error model (a plain object, not an Error) carrying the response status, with the
 * extensions in `additionalData` and the field errors in `errors.additionalData`.
 */
export function kiotaError(
  status: number,
  body: {
    title?: string
    code?: string
    placeholders?: Record<string, string>
    errors?: Record<string, string[]>
    errorDetails?: Array<{ code: string, field?: string, placeholders?: Record<string, string> }>
  } = {},
) {
  const { title, code, placeholders, errors, errorDetails } = body;
  const additionalData: Record<string, unknown> = {};
  if (code !== undefined)
    additionalData.code = code;
  if (placeholders !== undefined)
    additionalData.placeholders = placeholders;
  if (errorDetails !== undefined)
    additionalData.errorDetails = errorDetails;

  return {
    responseStatusCode: status,
    status,
    title,
    ...(errors ? { errors: { additionalData: errors } } : {}),
    ...(Object.keys(additionalData).length ? { additionalData } : {}),
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
