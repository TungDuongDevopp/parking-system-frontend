import type { AbpResponse } from "../Apb/abp"

export interface ChangePassWordRequest {
    currentPassword: string,
    newPassword: string
}
export type ChangePassWordResponse = AbpResponse<boolean>

