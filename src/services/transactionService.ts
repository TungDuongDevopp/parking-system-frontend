import type { TransactionDto, ProcessPaymentRessultInput, TransactionLookUpDto } from "../types/Transaction/transaction";
import type { TransactionQuery } from "../types/Transaction/transactionQuery";
import type { PagedResult } from '../types/Apb/abp';
import type { EntityDto } from '../types/Apb/entity';
import { apiClient } from './apiClient';
import { readAbpResult} from './serviceResponse';

export const getTransactions = async (params:TransactionQuery ): Promise<PagedResult<TransactionDto>> =>{
  const query = new URLSearchParams()

  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
  if (params.status!== undefined) query.set('Status', params.status.toString())  
  if (params.type!== undefined) query.set('Type', params.type.toString())         
  if (params.transactionTimeFrom) query.set('TransactionTimeFrom', params.transactionTimeFrom)
  if (params.transactionTimeTo) query.set('TransactionTimeTo', params.transactionTimeTo)
  if(params.paymentId !== undefined) query.set('PaymentId',params.paymentId.toString())   
  if(params.minAmount!== undefined) query.set('MinAmount',params.minAmount.toString())   
  if(params.maxAmount!== undefined) query.set('MaxAmount',params.maxAmount.toString())  

   const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/Transaction/GetAll?${queryString}`
    : '/api/services/app/Transaction/GetAll'
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Unable to load transactions.')
}
export const getTransactionById = async(entity: EntityDto): Promise<TransactionDto>=>{
     const query = new URLSearchParams({ Id: entity.Id.toString() })
    const response = await apiClient(`/api/services/app/Transaction/Get?${query.toString()}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể lấy thông tin giao dịch.')
}
export const processResult = async(data: ProcessPaymentRessultInput) : Promise<TransactionDto> =>{
    const response = await apiClient(`/api/services/app/Transaction/ProcessPaymentResult`,{
        method:'POST',
        authenticated:true,
        body: JSON.stringify(data)
    })
     return readAbpResult(response, 'Không thể giả lập giao dịch.')
}

export const getTransactionLookup =  async() : Promise<TransactionLookUpDto>=>{
  const response = await apiClient(`/api/services/app/Transaction/GetTransactionLookup`,{
    method:'GET',
    authenticated:true
  })
   return readAbpResult(response, 'Không thể tra cứu giao dịch.')
}