import { isApiError, type ApiError } from "~/types/ApiError";

export interface ProblemDetails extends ApiError {
  title: string;
  detail?: string;
}

export const isProblemDetails = (error: unknown): error is ProblemDetails => {
  return (
    isApiError(error) && "title" in error && typeof error.title === "string"
  );
};
