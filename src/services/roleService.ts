import type { PagedResult } from '../types/Apb/abp'
import type { EntityDto } from '../types/Apb/entity'
import type { Role, RoleRequest } from '../types/Role/role'
import { apiClient } from './apiClient'
import { readAbpResult, readAbpVoid } from './serviceResponse'

export const getRoles = async (): Promise<PagedResult<Role>> => {
  const response = await apiClient('/api/services/app/Role/GetAll', {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể tải danh sách role.')
}

export const getPermission = async (): Promise<string[]> => {
  const response = await apiClient('/AbpUserConfiguration/GetAll', {
    method: 'GET',
    authenticated: true,
  })
  if (!response.ok) {
    throw new Error(`Không thể tải danh sách permission (HTTP ${response.status}).`)
  }

  const data = await response.json() as {
    result?: { auth?: { allPermissions?: Record<string, string> } } | null
  }
  const permissions = data.result?.auth?.allPermissions
  if (!permissions) throw new Error('Invalid permission response from server.')
  return Object.keys(permissions)
}

export const createRole = async (data: RoleRequest): Promise<Role> => {
  const response = await apiClient('/api/services/app/Role/Create', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể tạo role.')
}

export const deleteRole = async (entity: EntityDto): Promise<void> => {
  const query = new URLSearchParams({ Id: entity.Id.toString() })
  const response = await apiClient(`/api/services/app/Role/Delete?${query.toString()}`, {
    method: 'DELETE',
    authenticated: true,
  })
  await readAbpVoid(response, 'Không thể xóa role.')
}

export const updateRole = async (data: Role): Promise<Role> => {
  const response = await apiClient('/api/services/app/Role/Update', {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể cập nhật role.')
}

export const getRoleNames = async (): Promise<string[]> => {
  const roles = await getRoles()
  return roles.items.map((role) => role.name)
}
