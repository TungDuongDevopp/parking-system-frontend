import type { Role, RoleRequest, RoleResponse } from '../types/Role/role'
import { apiClient } from './apiClient'
import type { AbpResponse, AbpUserConfiguration } from '../types/Apb/abp'

export const getRoles = async (): Promise<RoleResponse> => {
	const response = await apiClient('/api/services/app/Role/GetAll', {
		method: 'GET',
		authenticated: true,
	})

	return response.json() as Promise<RoleResponse>
}
export const getPermission = async (): Promise<string[]> => {
    const response = await apiClient('/AbpUserConfiguration/GetAll', {
        method: 'GET',
        authenticated: true,
    });

    const data: { result: AbpUserConfiguration } = await response.json();

    return Object.keys(data.result.auth.allPermissions);
};

export const createRole = async (data:RoleRequest) : Promise<RoleResponse>=>{
	const response = await apiClient('/api/services/app/Role/Create',

		{	method:'POST',
			authenticated:true,
			body:JSON.stringify(data)
		});
		return response.json() as Promise<RoleResponse>;
}
export const deleteRole = async (id: number): Promise<void> => {
	const response = await apiClient(`/api/services/app/Role/Delete/${id}`, {
		method: 'DELETE',
		authenticated: true,
	})
	const data = await response.json() as AbpResponse<null>

	if (!response.ok || !data.success) {
		throw new Error(data.error?.message || 'Không thể xóa role.')
	}
}
export const updateRole = async (data: Role): Promise<RoleResponse> => {
	const response = await apiClient('/api/services/app/Role/Update', {
		method: 'PUT',
		authenticated: true,
		body: JSON.stringify(data),
	})

	return response.json() as Promise<RoleResponse>
}
export const getRoleNames = async (): Promise<string[]> => {
   const data = await getRoles();
 	if (!data.result) {
        return []
    }
	const roleNames = data.result.items.map(role => role.name);
	return roleNames;
};
