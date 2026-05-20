export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function success<T>(data?: T, message = 'success'): ApiResponse<T> {
  return {
    code: 0,
    message,
    data: data ?? null,
  };
}

export function error(message: string, code = 1): ApiResponse {
  return {
    code,
    message,
    data: null,
  };
}
