import type { AbpResponse } from "./abp";
export interface RegisterRequest{
  emailAddress: string;
  name: string;
  password: string;
  surname: string;
  userName: string;
}

export interface CanLogin{
    canLogin:boolean|null;
}

export type RegisterResponse = AbpResponse<CanLogin>;