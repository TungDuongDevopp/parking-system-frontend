import type { AbpResponse } from "../Apb/abp";
export interface LoginRequest {
    userNameOrEmailAddress: string;
    password: string;
    rememberClient: boolean;
}

export interface LoginResult {
    userId: number;
    expireInSeconds: number;
    xsrfToken: string;
}

export type LoginResponse = AbpResponse<LoginResult>;