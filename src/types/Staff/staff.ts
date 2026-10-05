import type { AbpResponse } from "../Apb/abp";
import type { PagedResult } from "../Apb/abp";
export interface StaffRequestCreate{
  userId: number,
  name: string,
  phoneNumber: string,
  email: string,
  gender: boolean,
  hiredDate: string,
  dateOfBirth: string,
  address: string
}

export interface StaffRequestUpdate{
  Id: number,
  name: string,
  phoneNumber: string,
  email: string,
  gender: boolean,
  hiredDate: string,
  dateOfBirth: string,
  address: string
}

export interface StaffChangeProfileRequest{
  phoneNumber: string,
  email: string,
  gender: boolean,
  dateOfBirth: string,
  address: string
}

export interface StaffDto{
     id: number,
     name: string,
     phoneNumber: string,
     email: string,
     address: string,
     gender: boolean,
     genderName: string,
     dateOfBirth: string,
     hiredDate: string,
     status: number,
     statusName: string,
     creationTime: string,
     isDeleted: boolean
}
export type StaffResponse = AbpResponse<PagedResult<StaffDto>>