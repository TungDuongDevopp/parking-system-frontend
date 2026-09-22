import type { AbpResponse } from "./abp"

export interface ChangePassWordRequest {
    currentPassword: string,
    newPassword: string
}
export type ChangePassWordResponse = AbpResponse<boolean>

