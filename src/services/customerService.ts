import type { CustomerResponse, CustomerDto, CustomerRequestCreate, CustomerRequestUpdate } from "../types/Customer/customer";
import { apiClient } from "./apiClient";
import type { AbpResponse } from "../types/Apb/abp";
import type { CustomerQuery } from "../types/Customer/customerQuery";

export const getCustomers = async(params: CustomerQuery) : Promise<CustomerResponse>=>{
    const query = new URLSearchParams();

    if (params.keyword)
        query.set("Keyword", params.keyword);

    if (params.sorting)
        query.set("Sorting", params.sorting);

    if (params.skipCount !== undefined)
        query.set("SkipCount", params.skipCount.toString());

    if (params.maxResultCount !== undefined)
        query.set("MaxResultCount", params.maxResultCount.toString());
      const queryString = query.toString();

       const endpoint = queryString
        ? `/api/services/app/Customer/GetAll?${queryString}`
        : '/api/services/app/Customer/GetAll';
    const response = await apiClient(endpoint, {
        method: 'GET',
        authenticated: true
    })
    return response.json() as Promise<CustomerResponse>;
}

 export const createCustomer = async(data: CustomerRequestCreate): Promise<CustomerResponse>=>{
    const response = await apiClient('/api/services/app/Customer/Create', {
    method: 'POST',
        authenticated: true,
        body:JSON.stringify(data)
    })
    return response.json() as Promise<CustomerResponse>;
}

export const deleteCustomer = async (id: number): Promise<void> => {
    const response = await apiClient(`/api/services/app/Customer/Delete/${id}`, {
        method: 'DELETE',
        authenticated: true,
    })
    const data = await response.json() as AbpResponse<null>

    if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Không thể xóa customer.')
    }
}

export const updateCustomer = async (data: CustomerRequestUpdate): Promise<CustomerResponse> => {
    const response = await apiClient('/api/services/app/Customer/Update', {
        method: 'PUT',
        authenticated: true,
        body: JSON.stringify(data),
    })

    return response.json() as Promise<CustomerResponse>
}

export const getMyProfile = async (): Promise<AbpResponse<CustomerDto>> => {
    const response = await apiClient('/api/services/app/Customer/GetMyProfile', {
        method: 'GET',
        authenticated: true,
    })
    return response.json() as Promise<AbpResponse<CustomerDto>>
}