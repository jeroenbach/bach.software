import type { ApiError } from '@microsoft/kiota-abstractions';

/**
 * The RFC 9457 problem-details contract produced by the backend's exception handler.
 * The machine-readable part rides in extensions: `code` + `placeholders` for the
 * top-level failure, `errors` + `errorDetails` for field-scoped (batch) failures.
 */
export interface ProblemDetails {
  /** The HTTP status of the response, taken from Kiota's `responseStatusCode`. */
  status?: number
  title?: string
  /** Machine-readable error code; the frontend translates `errors.${code}`. */
  code?: string
  /** Values to interpolate into the translated template. */
  placeholders?: Record<string, string>
}

export interface ErrorDetail {
  code: string
  /** Dotted path of the field this error applies to, e.g. `order.quantity`. */
  field?: string
  placeholders?: Record<string, string>
}

export interface ValidationProblemDetails extends ProblemDetails {
  /** field → codes, same shape as ASP.NET model validation. A field can carry several codes. */
  errors?: Record<string, string[]>
  /** One entry per failed item, with the placeholders `errors` cannot carry. */
  errorDetails?: ErrorDetail[]
}

/**
 * Every error a Kiota-generated client throws for a non-2xx response carries a
 * `responseStatusCode`. When the body is parsed through an error mapping the thrown
 * value is the plain parsed model (not an `Error`), so the check must not require one.
 */
export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'responseStatusCode' in error;
}

export function isValidationProblem(
  problem: ValidationProblemDetails | undefined,
): problem is ValidationProblemDetails {
  return problem != null && (problem.errorDetails != null || problem.errors != null);
}

type KiotaProblem = ApiError & {
  title?: string | null
  code?: string | null
  placeholders?: { additionalData?: Record<string, unknown> } | null
  errors?: { additionalData?: Record<string, unknown> } | null
  additionalData?: Record<string, unknown>
};

// Placeholder values arrive with their JSON types (a count as a number), but the
// translations interpolate strings, so primitives are coerced rather than dropped.
function readStringRecord(value: unknown): Record<string, string> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return undefined;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean')
      .map(([key, entry]) => [key, String(entry)]),
  );
}

function readFieldErrors(value: unknown): Record<string, string[]> | undefined {
  if (typeof value !== 'object' || value === null)
    return undefined;
  return Object.fromEntries(
    Object.entries(value).map(([field, codes]) => [
      field,
      Array.isArray(codes) ? codes.filter((code): code is string => typeof code === 'string') : [],
    ]),
  );
}

function readErrorDetails(value: unknown): ErrorDetail[] | undefined {
  if (!Array.isArray(value))
    return undefined;
  return value
    .filter(detail => typeof detail === 'object' && detail !== null && typeof detail.code === 'string')
    .map(detail => ({
      code: detail.code as string,
      field: typeof detail.field === 'string' ? detail.field : undefined,
      placeholders: readStringRecord(detail.placeholders),
    }));
}

/**
 * Normalizes whatever a Kiota client throws into our problem-details shape, or
 * undefined when the failure never reached the API (network down, CORS, abort).
 *
 * The OpenAPI schema declares `code` and `placeholders`, so the generated model
 * carries them as typed properties — but open objects (`placeholders`, `errors`)
 * are generated as empty models whose values sit in their own nested
 * `additionalData` bag. `errorDetails` is not in the schema, so it lands in the
 * top-level `additionalData`. The fallbacks on that bag keep the normalizer
 * working for bodies parsed without the generated error mapping.
 */
export function toProblemDetails(error: unknown): ValidationProblemDetails | undefined {
  if (!isApiError(error))
    return undefined;

  const problem = error as KiotaProblem;
  const extensions = problem.additionalData ?? {};

  return {
    status: error.responseStatusCode,
    title: problem.title ?? undefined,
    code: typeof problem.code === 'string'
      ? problem.code
      : typeof extensions.code === 'string' ? extensions.code : undefined,
    placeholders: readStringRecord(problem.placeholders?.additionalData ?? extensions.placeholders),
    errors: readFieldErrors(problem.errors?.additionalData),
    errorDetails: readErrorDetails(extensions.errorDetails),
  };
}
