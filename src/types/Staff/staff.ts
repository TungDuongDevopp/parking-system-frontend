
export interface StaffChangeProfileRequest{
  phoneNumber?: string
  email?: string
  gender?: boolean
  dateOfBirth?: string
  address?: string
}

export interface StaffDto{
  id: number
  name: string
  phoneNumber: string
  email: string | null
  address: string | null
  gender: boolean | null
  genderName: string
  dateOfBirth: string | null
  hiredDate: string
  status: number
  statusName: string
}

export interface StaffRequestCreate {
  userId: number
  name: string
  phoneNumber: string
  email?: string | null
  gender?: boolean | null
  hiredDate: string
  dateOfBirth?: string | null
  address?: string | null
}

export interface StaffRequestUpdate {
  id: number
  name?: string | null
  phoneNumber?: string | null
  email?: string | null
  gender?: boolean | null
  hiredDate?: string | null
  dateOfBirth?: string | null
  address?: string | null
}

export interface AvailableUser {
  id: number
  userName: string
  fullName: string
  emailAddress: string
  phoneNumber: string
}

export interface StaffChangeStatusRequest {
  id: number
  status: number
}
