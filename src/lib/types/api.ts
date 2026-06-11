import axios from 'axios';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  code?: string;
  field?: string;
  message: string;
}

export interface ApiValidationError {
  errors: Record<string, string>;
  message: string;
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong'
): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
}

export function getValidationErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiValidationError>(error)) {
    return error.response?.data?.errors ?? {};
  }
  return {};
}
