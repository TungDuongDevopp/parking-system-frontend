import type{
    PlateDto,
    ChangePlateRequest,
    AddPlateRequest
}from '../types/Plate/plate'

import type{PlateQuery}from '../types/Plate/plateQuery';
import type { PagedResult } from '../types/Apb/abp';
import { apiClient } from './apiClient';
import { readAbpResult} from './serviceResponse';

export const getPlates = async (params: PlateQuery): Promise<PagedResult<PlateDto>> =>{
  const query = new URLSearchParams()

  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
  if(params.subscriptionId !== undefined) query.set('SubscriptionId',params.subscriptionId.toString())    

  const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/SubscriptionPlate/GetAll?${queryString}`
    : '/api/services/app/SubscriptionPlate/GetAll'
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Unable to load plate.')  
}
export const getPlateById = async (id: number): Promise<PlateDto> => {
  const response = await apiClient(`/api/services/app/SubscriptionPlate/Get/${id}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể lấy thông tin biển xe.')
}
export const addPlate = async (data: AddPlateRequest): Promise<PlateDto> => {
  const response = await apiClient('/api/services/app/SubscriptionPlate/AddPlate', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể thêm biển.')
}
export const changePlate = async (data: ChangePlateRequest): Promise<PlateDto> => {
  const response = await apiClient('/api/services/app/SubscriptionPlate/ChangePlate', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể thay đổi biển.')
}