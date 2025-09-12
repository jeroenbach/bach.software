export interface ApiError {
  status: number
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object'
    && error !== null
    && 'status' in error
    && typeof error.status === 'number'
  );
}
