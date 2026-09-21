export interface AbpError {
  code: number;
  message: string;
  details: string | null;
  validationErrors: unknown[] | null;
}

export interface AbpResponse<T> {
  result: T | null;
  targetUrl: string | null;
  success: boolean;
  error: AbpError | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}