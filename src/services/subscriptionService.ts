import type{ 
    SubscriptionDto,
    SubscriptionCreateRequest,
    SubscriptionLookUpDto
 } from "../types/Subscription/subscription";
 import type {
    QuotationDto
 } from "../types/Quotation/quotation"
 import type{SubscriptionQuery} from "../types/Subscription/subscriptionQuery"
import type { PagedResult } from '../types/Apb/abp';
import type { EntityDto } from '../types/Apb/entity';
import { apiClient } from './apiClient';
import { readAbpResult} from './serviceResponse';

export const getSubscriptions= async (params: SubscriptionQuery): Promise<PagedResult<SubscriptionDto>> =>{
  const query = new URLSearchParams()

  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
  if (params.status !== undefined) query.set('Status', params.status.toString())  
  if (params.startTimeFrom) query.set('StartTimeFrom', params.startTimeFrom)
  if (params.startTimeTo) query.set('StartTimeTo', params.startTimeTo)
  if (params.endTimeFrom) query.set('EndTimeFrom', params.endTimeFrom)
  if (params.endTimeTo) query.set('EndTimeTo', params.endTimeTo)
  if(params.customerId !== undefined) query.set('CustomerId',params.customerId.toString())
  if(params.quotationId !== undefined) query.set('QuotationId',params.quotationId.toString())    

   const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/Subscription/GetAll?${queryString}`
    : '/api/services/app/Subscription/GetAll'
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Unable to load subscription.')  
}
export const createSubscription = async (data: SubscriptionCreateRequest): Promise<SubscriptionDto> => {
  const response = await apiClient('/api/services/app/Subscription/Create', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể tạo gói gửi xe.')
}
export const getSubscriptionById = async (entity: EntityDto): Promise<SubscriptionDto> => {
  const query = new URLSearchParams({ Id: entity.Id.toString() })
  const response = await apiClient(`/api/services/app/Subscription/Get?${query.toString()}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể lấy thông tin gói gửi xe.')
}
export const getMyCurrentSubscription = async(): Promise<SubscriptionDto>=>{
    const response = await apiClient(`/api/services/app/Subscription/GetMyCurrentSubscription`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể lấy thông tin gói gửi xe đang dùng.')
}
export const getAvailableQuotation = async():Promise<QuotationDto[]>=>{
    const response = await apiClient(`/api/services/app/Subscription/GetAvailableQuotations`, {
    method: 'GET',
    authenticated: false,
  })
  return readAbpResult(response, 'Không thể lấy bảng giá khả dụng.')
}
export const getSubscriptionLookUp = async():Promise<SubscriptionLookUpDto>=>{
     const response = await apiClient(`/api/services/app/Subscription/GetSubscriptionLookUp`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể tra cứu subscription.')
}