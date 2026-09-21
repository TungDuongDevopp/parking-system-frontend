import type { AbpResponse } from "./abp";
export interface LoginRequest {
    userNameOrEmailAddress: string;
    password: string;
    rememberClient: boolean;
}

export interface LoginResult {
    accessToken: string;
    encryptedAccessToken: string;
    expireInSeconds: number;
    userId: number;
}

export type LoginResponse = AbpResponse<LoginResult>;