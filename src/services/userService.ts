import type { PagedResult } from '../types/Apb/abp'
import type { UserRequestCreate, UserRequestUpdate, UserDto } from '../types/User/user'
import type { UserQuery } from '../types/User/userQuery'
import { apiClient } from './apiClient'
import { readAbpResult, readAbpVoid } from './serviceResponse'

export const getUsers = async (params: UserQuery): Promise<PagedResult<UserDto>> => {
  const query = new URLSearchParams()
  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
  if (params.isActive !== undefined) query.set('IsActive', params.isActive.toString())

  const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/User/GetAll?${queryString}`
    : '/api/services/app/User/GetAll'
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Không thể tải danh sách user.')
}

export const createUser = async (data: UserRequestCreate): Promise<UserDto> => {
  const response = await apiClient('/api/services/app/User/Create', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể tạo user.')
}

export const deleteUser = async (id: number): Promise<void> => {
  const query = new URLSearchParams({ Id: id.toString() })
  const response = await apiClient(`/api/services/app/User/Delete?${query.toString()}`, {
    method: 'DELETE',
    authenticated: true,
  })
  await readAbpVoid(response, 'Không thể xóa user.')
}

export const updateUser = async (data: UserRequestUpdate): Promise<UserDto> => {
  const response = await apiClient('/api/services/app/User/Update', {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể cập nhật user.')
}
