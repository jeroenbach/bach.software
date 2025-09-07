import type { ProblemDetails } from '~/types/ProblemDetails';
import { isProblemDetails } from '~/types/ProblemDetails';

export interface AdditionalErrorDataHolder {
  additionalData: Record<string, string[]>
}

export interface ValidationProblemDetails extends ProblemDetails {
  errors: AdditionalErrorDataHolder
}

export function isValidationProblemDetails(error: unknown): error is ValidationProblemDetails {
  return (
    isProblemDetails(error)
    && 'errors' in error
    && typeof error.errors === 'object'
  );
}
