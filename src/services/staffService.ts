import type {
  StaffDto,
  StaffChangeProfileRequest,
  StaffChangeStatusRequest,
  StaffRequestCreate,
  StaffRequestUpdate,
  AvailableUser,
} from '../types/Staff/staff'
import type { PagedResult } from '../types/Apb/abp'
import { apiClient } from './apiClient'
import { readAbpResult, readAbpVoid } from './serviceResponse'
import type { StaffQuery } from '../types/Staff/staffQuery'

export const getStaffs = async (params: StaffQuery): Promise<PagedResult<StaffDto>> => {
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
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Unable to load staff.')
}

export const createStaff = async (data: StaffRequestCreate): Promise<StaffDto> => {
  const response = await apiClient('/api/services/app/Staff/Create', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể tạo nhân viên.')
}

export const updateStaff = async (data: StaffRequestUpdate): Promise<StaffDto> => {
  const response = await apiClient('/api/services/app/Staff/Update', {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể cập nhật nhân viên.')
}

export const deleteStaff = async (id: number): Promise<void> => {
  const query = new URLSearchParams({ Id: id.toString() })
  const response = await apiClient(`/api/services/app/Staff/Delete?${query.toString()}`, {
    method: 'DELETE',
    authenticated: true,
  })
  await readAbpVoid(response, 'Không thể xóa nhân viên.')
}

export const getAvailableUsers = async (): Promise<AvailableUser[]> => {
  const response = await apiClient('/api/services/app/Staff/GetAvailableUsers', {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể tải danh sách user khả dụng.')
}

export const changeStaffStatus = async (data: StaffChangeStatusRequest): Promise<StaffDto> => {
  const response = await apiClient('/api/services/app/Staff/ChangeStatus', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể thay đổi trạng thái nhân viên.')
}

export const changeStaffProfile = async (data: StaffChangeProfileRequest): Promise<StaffDto> => {
  const response = await apiClient('/api/services/app/Staff/ChangeProfile', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể cập nhật hồ sơ nhân viên.')
}

export const getStaffById = async (id: number): Promise<StaffDto> => {
  const response = await apiClient(`/api/services/app/Staff/Get/${id}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể tải hồ sơ nhân viên.')
}

export const getMyStaffProfile = async (): Promise<StaffDto> => {
  const response = await apiClient('/api/services/app/Staff/GetMyProfile', {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể tải hồ sơ nhân viên.')
}
