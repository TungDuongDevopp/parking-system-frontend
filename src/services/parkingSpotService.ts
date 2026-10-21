import type{
 ParkingSpotCreateRequest,
 ParkingSpotChangeStatus,
 ParkingSpotDto,
 ParkingSpotUpdateRequest,
 ParkingSpotLookup 
} from '../types/ParkingSpot/parkingSpot';

import type { PagedResult } from '../types/Apb/abp';
import { apiClient } from './apiClient';
import { readAbpResult,readAbpVoid } from './serviceResponse';

import type {ParkingSpotQuery} from '../types/ParkingSpot/parkingSpotQuery';

export const getParkingSpots = async(params: ParkingSpotQuery) : Promise<PagedResult<ParkingSpotDto>> =>{
    const query = new URLSearchParams()
        if (params.keyword) query.set('Keyword', params.keyword)
        if (params.sorting) query.set('Sorting', params.sorting)
        if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
        if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
        if (params.status !== undefined) query.set('Status', params.status.toString())
        if(params.parkingAreaId !== undefined) query.set('ParkingAreaId',params.parkingAreaId.toString())
                const queryString = query.toString()
    const endpoint = queryString
    ? `/api/services/app/ParkingSpot/GetAll?${queryString}`
    : '/api/services/app/ParkingSpot/GetAll'
    const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
    return readAbpResult(response, 'Unable to load parkingSpot.')
}

export const createParkingSpot = async (data: ParkingSpotCreateRequest): Promise<ParkingSpotDto> => {
  const response = await apiClient('/api/services/app/ParkingSpot/Create', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể tạo vị trí đỗ xe.')
}
export const updateParkingSpot = async (data: ParkingSpotUpdateRequest): Promise<ParkingSpotDto> => {
  const response = await apiClient('/api/services/app/ParkingSpot/Update', {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể cập nhật vị trí đỗ xe.')
}

export const deleteParkingSpot = async (id: number): Promise<void> => {
  const query = new URLSearchParams({ Id: id.toString() })
  const response = await apiClient(`/api/services/app/ParkingSpot/Delete?${query.toString()}`, {
    method: 'DELETE',
    authenticated: true,
  })
  await readAbpVoid(response, 'Không thể xóa vị trí đỗ xe.')
}

export const changeParkingSpotStatus = async (data: ParkingSpotChangeStatus): Promise<void> => {
  const response = await apiClient('/api/services/app/ParkingSpot/ChangeStatus', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  await readAbpVoid(response, 'Không thể thay đổi trạng thái vị trí đỗ xe.')
}

export const getParkingSpotById = async (id: number): Promise<ParkingSpotDto> => {
  const response = await apiClient(`/api/services/app/ParkingSpot/Get/${id}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể tải hồ sơ vị trí đỗ xe')
}
export const getParkingAreaLookup = async(): Promise<ParkingSpotLookup[]> =>{
  const response = await apiClient(`/api/services/app/ParkingSpot/GetParkingAreaLookUp/`,{
    method:'GET',
    authenticated:true
  })
   return readAbpResult(response, 'Không thể tải danh sách khu vực đỗ xe')
}