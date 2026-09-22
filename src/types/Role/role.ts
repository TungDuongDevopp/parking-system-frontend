import type { AbpResponse } from "../Apb/abp";
import type { PagedResult } from "../Apb/abp";
export interface RoleRequest {
  displayName: string;
  name: string;
  normalizedName: string;
  description: string;
  grantedPermissions: string[];
}

export interface Role {
    id: number;
    name: string;
    displayName: string;
    normalizedName: string;
    description: string;
    grantedPermissions: string[];
}


export type RoleResponse = AbpResponse<PagedResult<Role>>