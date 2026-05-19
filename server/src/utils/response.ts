import type { ApiResponse } from '../types';

export function success<T>(data?: T, message = 'success'): ApiResponse<T> {
  return {
    code: 0,
    message,
    data,
  };
}

export function error(message: string, code = 1): ApiResponse {
  return {
    code,
    message,
  };
}
