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
  errors?: { additionalData?: Record<string, unknown> } | null
  additionalData?: Record<string, unknown>
};

function readStringRecord(value: unknown): Record<string, string> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return undefined;
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
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
 * The generated models only type the properties in the OpenAPI schema. The
 * extensions (`code`, `placeholders`, `errorDetails`) land in `additionalData`, and
 * the field errors sit in `errors.additionalData` because the generated `errors`
 * object is itself a bag of undeclared properties.
 */
export function toProblemDetails(error: unknown): ValidationProblemDetails | undefined {
  if (!isApiError(error))
    return undefined;

  const problem = error as KiotaProblem;
  const extensions = problem.additionalData ?? {};

  return {
    status: error.responseStatusCode,
    title: problem.title ?? undefined,
    code: typeof extensions.code === 'string' ? extensions.code : undefined,
    placeholders: readStringRecord(extensions.placeholders),
    errors: readFieldErrors(problem.errors?.additionalData),
    errorDetails: readErrorDetails(extensions.errorDetails),
  };
}
