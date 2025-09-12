import type { ApiError } from '~/types/ApiError';
import { isApiError } from '~/types/ApiError';

export interface ProblemDetails extends ApiError {
  title: string
  detail?: string
}

export function isProblemDetails(error: unknown): error is ProblemDetails {
  return (
    isApiError(error) && 'title' in error && typeof error.title === 'string'
  );
}
