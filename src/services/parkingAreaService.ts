import type{
    ParkingAreaDto,
    ParkingAreaChangeStatus,
    ParkingAreaCreateRequest,
    ParkingAreaUpdateRequest
} from '../types/ParkingArea/parkingArea';

import type { PagedResult } from '../types/Apb/abp';
import { apiClient } from './apiClient';
import { readAbpResult,readAbpVoid } from './serviceResponse';
import type { ParkingAreaQuery } from '../types/ParkingArea/parkingAreaQuery';

export const getParkingAreas = async (params: ParkingAreaQuery): Promise<PagedResult<ParkingAreaDto>> =>{
  const query = new URLSearchParams()

  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
  if (params.status !== undefined) query.set('Status', params.status.toString())
  if(params.maxCapacity !== undefined) query.set('MaxCapacity',params.maxCapacity.toString())
  if(params.minCapacity !== undefined) query.set('MinCapacity',params.minCapacity.toString())     
  if(params.parkingMode !== undefined) query.set('ParkingMode',params.parkingMode.toString())
  if(params.vehicleType !== undefined) query.set('VehicleType',params.vehicleType.toString())    

   const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/ParkingArea/GetAll?${queryString}`
    : '/api/services/app/ParkingArea/GetAll'
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Unable to load parkingArea.')  
}

export const createParkingArea = async (data: ParkingAreaCreateRequest): Promise<ParkingAreaDto> => {
  const response = await apiClient('/api/services/app/ParkingArea/Create', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể tạo khu vực đỗ xe.')
}
export const updateParkingArea = async (data: ParkingAreaUpdateRequest): Promise<ParkingAreaDto> => {
  const response = await apiClient('/api/services/app/ParkingArea/Update', {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể cập nhật khu vực đỗ xe.')
}

export const deleteParkingArea = async (id: number): Promise<void> => {
  const query = new URLSearchParams({ Id: id.toString() })
  const response = await apiClient(`/api/services/app/ParkingArea/Delete?${query.toString()}`, {
    method: 'DELETE',
    authenticated: true,
  })
  await readAbpVoid(response, 'Không thể xóa khu vực đỗ xe.')
}
export const changeParkingAreaStatus = async (data: ParkingAreaChangeStatus): Promise<ParkingAreaDto> => {
  const response = await apiClient('/api/services/app/ParkingArea/ChangeStatus', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể thay đổi trạng thái khu vực đỗ xe.')
}

export const getParkingAreaById = async (id: number): Promise<ParkingAreaDto> => {
  const response = await apiClient(`/api/services/app/ParkingArea/Get/${id}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể tải hồ sơ khu vực đỗ xe')
}