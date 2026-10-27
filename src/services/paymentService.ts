import type { PaymentDto, PaymentLookUpDto } from "../types/Payment/payment";
import type { PaymentQuery } from "../types/Payment/paymentQuery";
import type { PagedResult } from '../types/Apb/abp';
import type { EntityDto } from '../types/Apb/entity';
import { apiClient } from './apiClient';
import { readAbpResult} from './serviceResponse';

export const getPayments = async (params: PaymentQuery): Promise<PagedResult<PaymentDto>> =>{
  const query = new URLSearchParams()

  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
  if (params.paymentStatus!== undefined) query.set('PaymentStatus', params.paymentStatus.toString()) 
  if (params.paymentMethod!== undefined) query.set('PaymentMethod', params.paymentMethod.toString()) 
  if (params.paymentType!== undefined) query.set('PaymentType', params.paymentType.toString())        
  if (params.expiresFrom) query.set('ExpiresFrom', params.expiresFrom)
  if (params.expiresTo) query.set('ExpiresTo', params.expiresTo)
  if (params.paidAtFrom) query.set('PaidAtFrom', params.paidAtFrom)
  if (params.paidAtTo) query.set('PaidAtTo', params.paidAtTo)
  if(params.subscriptionId !== undefined) query.set('SubscriptionId',params.subscriptionId.toString())
  if(params.parkingSessionId!== undefined) query.set('ParkingSessionId',params.parkingSessionId.toString())    
  if(params.amountFrom!== undefined) query.set('AmountFrom',params.amountFrom.toString())   
  if(params.amountTo!== undefined) query.set('AmountTo',params.amountTo.toString())  

   const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/Payment/GetAll?${queryString}`
    : '/api/services/app/payment/GetAll'
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Unable to load payment.')  
}
export const getPaymentById = async(entity: EntityDto): Promise<PaymentDto>=>{
     const query = new URLSearchParams({ Id: entity.Id.toString() })
    const response = await apiClient(`/api/services/app/Payment/Get?${query.toString()}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể lấy thông tin khoản thanh toán.')
}

export const getPaymentLookup = async(): Promise<PaymentLookUpDto> =>{
  const response = await apiClient(`/api/services/app/Payment/GetPaymentLookUp`,{
    method:'GET',
    authenticated:true,
  })
  return readAbpResult(response, 'Không thể tra cứu payment')

}