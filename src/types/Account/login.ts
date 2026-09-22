import type { AbpResponse } from "../Apb/abp";
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