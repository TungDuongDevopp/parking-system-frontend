
import type { UserRequestCreate, UserRequestUpdate, UserResponse } from '../types/User/user'
import { apiClient } from './apiClient'
import type { AbpResponse } from '../types/Apb/abp'
import type { UserQuery } from '../types/User/userQuery'

export const getUsers = async (params: UserQuery): Promise<UserResponse> => {
    const query = new URLSearchParams();

    if (params.keyword)
        query.set("Keyword", params.keyword);

    if (params.sorting)
        query.set("Sorting", params.sorting);

    if (params.skipCount !== undefined)
        query.set("SkipCount", params.skipCount.toString());

    if (params.maxResultCount !== undefined)
        query.set("MaxResultCount", params.maxResultCount.toString());

    if(params.isActive !==undefined)
        query.set("IsActive",params.isActive.toString());
    const queryString = query.toString();
    const endpoint = queryString
        ? `/api/services/app/User/GetAll?${queryString}`
        : '/api/services/app/User/GetAll';
    const response = await apiClient(endpoint, {
        method: 'GET',
        authenticated: true
    })

    return response.json() as Promise<UserResponse>
}

export const createUser = async(data:UserRequestCreate) : Promise<UserResponse> =>{
     const response = await apiClient('/api/services/app/User/Create', {
    method: 'POST',
        authenticated: true,
        body:JSON.stringify(data)
    })
    return response.json() as Promise<UserResponse>;
}

export const deleteUser = async (id: number): Promise<void> => {
    const response = await apiClient(`/api/services/app/User/Delete/${id}`, {
        method: 'DELETE',
        authenticated: true,
    })
    const data = await response.json() as AbpResponse<null>

    if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Không thể xóa user.')
    }
}

export const updateUser = async (data: UserRequestUpdate): Promise<UserResponse> => {
    const response = await apiClient('/api/services/app/User/Update', {
        method: 'PUT',
        authenticated: true,
        body: JSON.stringify(data),
    })

    return response.json() as Promise<UserResponse>
}

