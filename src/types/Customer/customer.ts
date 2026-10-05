import type { AbpResponse } from "../Apb/abp";
import type { PagedResult } from "../Apb/abp";

export interface CustomerRequestCreate{
    name: string,
    phoneNumber: string,
    email: string
}
export interface CustomerDto{
    id: number,
    name: string,
    phoneNumber: string,
    email: string,
    creationTime: string,
    isDeleted: boolean
}

export interface CustomerRequestUpdate{
    id: number
    name: string,
    phoneNumber: string,
    email: string
}

export type CustomerResponse = AbpResponse<PagedResult<CustomerDto>>