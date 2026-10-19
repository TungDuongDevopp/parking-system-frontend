import type {
  StaffDto,
  StaffChangeProfileRequest,
  StaffChangeStatusRequest,
  StaffRequestCreate,
  StaffResponse,
  StaffRequestUpdate,
  AvailableUser,
} from '../types/Staff/staff'
import { apiClient } from './apiClient'
import type { AbpResponse } from '../types/Apb/abp'
import { getAbpErrorMessage } from './abpError'
import type { StaffQuery } from '../types/Staff/staffQuery'

export const getStaffs = async (params: StaffQuery): Promise<StaffResponse> => {
  const query = new URLSearchParams()

  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
  if (params.status !== undefined) query.set('Status', params.status.toString())
  if (params.dateOfBirthFrom) query.set('DateOfBirthFrom', params.dateOfBirthFrom)
  if (params.dateOfBirthTo) query.set('DateOfBirthTo', params.dateOfBirthTo)
  if (params.hiredDateFrom) query.set('HiredDateFrom', params.hiredDateFrom)
  if (params.hiredDateTo) query.set('HiredDateTo', params.hiredDateTo)

  const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/Staff/GetAll?${queryString}`
    : '/api/services/app/Staff/GetAll'

  const response = await apiClient(endpoint, {
    method: 'GET',
    authenticated: true,
  })

  return response.json() as Promise<StaffResponse>
}

export const createStaff = async (data: StaffRequestCreate): Promise<AbpResponse<StaffDto | null>> => {
  const response = await apiClient('/api/services/app/Staff/Create', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })

  return response.json() as Promise<AbpResponse<StaffDto | null>>
}

export const updateStaff = async (data: StaffRequestUpdate): Promise<AbpResponse<StaffDto | null>> => {
  const response = await apiClient('/api/services/app/Staff/Update', {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(data),
  })

  return response.json() as Promise<AbpResponse<StaffDto | null>>
}

export const deleteStaff = async (id: number): Promise<void> => {
  const response = await apiClient(`/api/services/app/Staff/Delete/${id}`, {
    method: 'DELETE',
    authenticated: true,
  })

  const data = (await response.json()) as AbpResponse<null>

  if (!response.ok || !data.success) {
    throw new Error(getAbpErrorMessage(data.error, 'Không thể xóa nhân viên.'))
  }
}

export const getAvailableUsers = async (): Promise<AbpResponse<AvailableUser[]>> => {
  const response = await apiClient('/api/services/app/Staff/GetAvailableUsers', {
    method: 'GET',
    authenticated: true,
  })

  return response.json() as Promise<AbpResponse<AvailableUser[]>>
}

export const changeStaffStatus = async (data: StaffChangeStatusRequest): Promise<AbpResponse<StaffDto | null>> => {
  const response = await apiClient('/api/services/app/Staff/ChangeStatus', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })

  const result = (await response.json()) as AbpResponse<StaffDto | null>

  if (!response.ok || !result.success) {
    throw new Error(getAbpErrorMessage(result.error, 'Không thể thay đổi trạng thái nhân viên.'))
  }

  return result
}

export const changeStaffProfile = async (data: StaffChangeProfileRequest): Promise<AbpResponse<StaffDto | null> | null> => {
  const response = await apiClient('/api/services/app/Staff/ChangeProfile', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })

  const body = await response.text()
  if (!body.trim()) {
    if (!response.ok) {
      throw new Error(`Không thể cập nhật hồ sơ nhân viên (HTTP ${response.status}).`)
    }
    return null
  }

  const result = JSON.parse(body) as AbpResponse<StaffDto | null>
  if (!response.ok || !result.success) {
    throw new Error(getAbpErrorMessage(result.error, 'Không thể cập nhật hồ sơ nhân viên.'))
  }

  return result
}

export const getStaffById = async (id: number): Promise<AbpResponse<StaffDto | null>> => {
  const response = await apiClient(`/api/services/app/Staff/Get/${id}`, {
    method: 'GET',
    authenticated: true,
  })

  return response.json() as Promise<AbpResponse<StaffDto>>
}

export const getMyStaffProfile = async (): Promise<AbpResponse<StaffDto | null>> => {
  const response = await apiClient('/api/services/app/Staff/GetMyProfile', {
    method: 'GET',
    authenticated: true,
  })

  return response.json() as Promise<AbpResponse<StaffDto | null>>
}
