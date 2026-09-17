export type ApiError = {
  message: string;
  code?: string;
};

export type ApiResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: ApiError };
