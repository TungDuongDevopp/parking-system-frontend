import type{
QuotationCreateRequest,
QuotationDto,
QuotationUpdateRequest
} from '../types/Quotation/quotation';

import type{QuotationQuery} from '../types/Quotation/quotationQuery';

import type { PagedResult } from '../types/Apb/abp';
import { apiClient } from './apiClient';
import { readAbpResult,readAbpVoid } from './serviceResponse';

export const getQuotations = async (params: QuotationQuery): Promise<PagedResult<QuotationDto>> =>{
  const query = new URLSearchParams()

  if (params.keyword) query.set('Keyword', params.keyword)
  if (params.sorting) query.set('Sorting', params.sorting)
  if (params.skipCount !== undefined) query.set('SkipCount', params.skipCount.toString())
  if (params.maxResultCount !== undefined) query.set('MaxResultCount', params.maxResultCount.toString())
  if (params.duration !== undefined) query.set('Duration', params.duration.toString())
  if(params.maxPrice !== undefined) query.set('MaxPrice',params.maxPrice.toString())
  if(params.minPrice !== undefined) query.set('MinPrice',params.minPrice.toString())     
  if(params.durationUnit !== undefined) query.set('DurationUnit',params.durationUnit.toString())
  if(params.vehicleType !== undefined) query.set('VehicleType',params.vehicleType.toString())    

   const queryString = query.toString()
  const endpoint = queryString
    ? `/api/services/app/Quotation/GetAll?${queryString}`
    : '/api/services/app/Quotation/GetAll'
  const response = await apiClient(endpoint, { method: 'GET', authenticated: true })
  return readAbpResult(response, 'Unable to load quotation.')  
}
export const createQuotation = async (data: QuotationCreateRequest): Promise<QuotationDto> => {
  const response = await apiClient('/api/services/app/Quotation/Create', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể tạo bảng giá.')
}
export const updateQuotation= async (data: QuotationUpdateRequest): Promise<QuotationDto> => {
  const response = await apiClient('/api/services/app/Quotation/Update', {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Không thể cập nhật bảng giá.')
}

export const deleteQuotation = async (id: number): Promise<void> => {
  const query = new URLSearchParams({ Id: id.toString() })
  const response = await apiClient(`/api/services/app/Quotation/Delete?${query.toString()}`, {
    method: 'DELETE',
    authenticated: true,
  })
  await readAbpVoid(response, 'Không thể xóa bảng giá.')
}
export const getQuotationById = async (id: number): Promise<QuotationDto> => {
  const response = await apiClient(`/api/services/app/Quotation/Get/${id}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Không thể tải hồ sơ bảng giá.')
}