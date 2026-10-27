import type { SessionQuery } from "../types/Session/sessionQuery";
import type { SessionDto,
     CheckInRequest,
     CheckInResponse,
     CheckOutResponse,
     SessionLookUpDto
 } from "../types/Session/session";
import type { PagedResult } from '../types/Apb/abp';
import type { EntityDto } from '../types/Apb/entity';
import { apiClient } from './apiClient';
import { readAbpResult} from './serviceResponse';

export const getSessions = async (params: SessionQuery): Promise<PagedResult<SessionDto>> =>{
  const query = new URLSearchParams()

  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
  if(params.customerId!== undefined) query.set('CustomerId',params.customerId.toString()) 
  if(params.parkingAreaId!== undefined) query.set('ParkingAreaId',params.parkingAreaId.toString())
  if(params.parkingSpotId!== undefined) query.set('ParkingSpotId',params.parkingSpotId.toString()) 
  if(params.status !== undefined) query.set('Status',params.status.toString())      
  if(params.minFee!==undefined) query.set('MinFee',params.minFee.toString())  
  if(params.maxFee!==undefined) query.set('MaxFee',params.maxFee.toString())    
  if(params.minDailyRate!==undefined) query.set('MinDailyRate',params.minDailyRate.toString())    
 if(params.maxDailyRate!==undefined) query.set('MaxDailyRate',params.maxDailyRate.toString())   
  if(params.minHourlyRate!==undefined) query.set('MinHourlyRate',params.minHourlyRate.toString())    
 if(params.maxHourlyRate!==undefined) query.set('MaxHourlyRate',params.maxHourlyRate.toString())  
  if(params.entryFrom!==undefined) query.set('EntryFrom',params.entryFrom.toString())  
  if(params.entryTo!==undefined) query.set('EntryTo',params.entryTo.toString())
  if(params.exitFrom!==undefined) query.set('ExitFrom',params.exitFrom.toString())  
      if(params.exitTo!==undefined) query.set('ExitTo',params.exitTo.toString())    

  const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/ParkingSession/GetAll?${queryString}`
    : '/api/services/app/ParkingSession/GetAll'
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Unable to load session.')  
}
export const getSessionById = async (entity: EntityDto): Promise<SessionDto> => {
  const query = new URLSearchParams({ Id: entity.Id.toString() })
  const response = await apiClient(`/api/services/app/ParkingSession/Get?${query.toString()}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể lấy thông tin phiên gửi xe.')
}

export const checkIn = async(data: CheckInRequest): Promise<CheckInResponse> =>{
    const response = await apiClient('/api/services/app/ParkingSession/CheckIn', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể checkIn.')
}

export const checkOut = async(id: number): Promise<CheckOutResponse> =>{
    const response = await apiClient('/api/services/app/ParkingSession/CheckIn', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(id),
  })
  return readAbpResult(response, 'Không thể checkOut.')
}
export const getSessionLookUp = async (): Promise<SessionLookUpDto> => {
  const response = await apiClient(`/api/services/app/ParkingSession/GetSessionLookUp`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể tra cứu thông tin phiên gửi.')
}