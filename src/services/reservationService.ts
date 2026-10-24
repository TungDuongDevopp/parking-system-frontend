import type {
ReservationDto,
ReservationCreateRequest,
ReservationLookUp
} from '../types/Reservation/reservation'

import type {ReservationQuery} from '../types/Reservation/reservationQuery'
import type { PagedResult } from '../types/Apb/abp';
import { apiClient } from './apiClient';
import { readAbpResult} from './serviceResponse';

export const getReservations = async (params: ReservationQuery): Promise<PagedResult<ReservationDto>> =>{
  const query = new URLSearchParams()

  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
  if(params.customerId!== undefined) query.set('CustomerId',params.customerId.toString()) 
  if(params.parkingAreaId!== undefined) query.set('ParkingAreaId',params.parkingAreaId.toString())
  if(params.parkingSpotId!== undefined) query.set('ParkingSpotId',params.parkingSpotId.toString()) 
  if(params.status !== undefined) query.set('Status',params.status.toString())      
  if(params.expireAtFrom!==undefined) query.set('ExpireAtFrom',params.expireAtFrom.toString())  
  if(params.expireAtTo!==undefined) query.set('ExpireAtTo',params.expireAtTo.toString())    
  if(params.reservedAtFrom!==undefined) query.set('ReservedAtFrom',params.reservedAtFrom.toString())    
 if(params.reservedAtTo!==undefined) query.set('ReservedAtTo',params.reservedAtTo.toString())   

  const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/Reservation/GetAll?${queryString}`
    : '/api/services/app/Reservation/GetAll'
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Unable to load reservation.')  
}
export const getReservationById = async (id: number): Promise<ReservationDto> => {
  const response = await apiClient(`/api/services/app/Reservation/Get/${id}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể lấy thông tin lịch đặt chỗ.')
}
export const createReservation = async (data: ReservationCreateRequest): Promise<ReservationDto> => {
  const response = await apiClient('/api/services/app/Reservation/Create', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể đặt chỗ.')
}

export const cancelReservation = async (id:number ): Promise<ReservationDto> => {
  const response = await apiClient('/api/services/app/Reservation/Canceled', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(id),
  })
  return readAbpResult(response, 'Không thể hủy đặt chỗ.')
}
export const getReservationLookUp = async (): Promise<ReservationLookUp> => {
  const response = await apiClient(`/api/services/app/Reservation/GetReservationLookUp`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể tra cứu thông tin')
}