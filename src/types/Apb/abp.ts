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

export interface PagedResult<T> {
    totalCount: number;
    items: T[];
}

export interface AbpUserConfiguration {
    auth: {
        allPermissions: Record<string, string>;
        grantedPermissions: Record<string, string>;
    };
}