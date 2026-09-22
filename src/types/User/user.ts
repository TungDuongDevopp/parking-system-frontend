import type { AbpResponse } from "../Apb/abp";
import type { PagedResult } from "../Apb/abp";

export interface UserRequestCreate{
  emailAddress: string,
  name: string,
  password: string,
  surname: string,
  userName: string,
  isActive: boolean,
  roleNames: string[]
}
export interface UserDto{
    id: number,
    userName: string,
    name: string,
    fullName: string,
    surname: string,
    emailAddress: string,
    isActive: boolean, 
    lastLoginTime: string,
    creationTime: string,
    roleNames: string[]                          
}
export interface UserRequestUpdate{
  id: number,  
  emailAddress: string,
  name: string,
  surname: string,
  userName: string,
  isActive: boolean,
  roleNames: string[]
}


export type UserResponse = AbpResponse<PagedResult<UserDto>>