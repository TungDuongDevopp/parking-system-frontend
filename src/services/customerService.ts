import type { PagedResult } from '../types/Apb/abp'
import type { CustomerDto, CustomerRequestUpdate } from '../types/Customer/customer'
import type { CustomerQuery } from '../types/Customer/customerQuery'
import { apiClient } from './apiClient'
import { readAbpResult, readAbpVoid } from './serviceResponse'

export const getCustomers = async (params: CustomerQuery): Promise<PagedResult<CustomerDto>> => {
  const query = new URLSearchParams()
  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())

  const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/Customer/GetAll?${queryString}`
    : '/api/services/app/Customer/GetAll'
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Unable to load customers.')
}

export const deleteCustomer = async (id: number): Promise<void> => {
  const query = new URLSearchParams({ Id: id.toString() })
  const response = await apiClient(`/api/services/app/Customer/Delete?${query.toString()}`, {
    method: 'DELETE',
    authenticated: true,
  })
  await readAbpVoid(response, 'Không thể xóa customer.')
}

export const updateCustomer = async (data: CustomerRequestUpdate): Promise<CustomerDto> => {
  const response = await apiClient('/api/services/app/Customer/Update', {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Unable to update customer profile.')
}

export const getMyProfile = async (): Promise<CustomerDto | null> => {
  const response = await apiClient('/api/services/app/Customer/GetMyProfile', {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Unable to load customer profile.', true)
}
