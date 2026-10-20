import type { AbpResponse, PagedResult } from "../Apb/abp";

export interface ParkingAreaDto{
    parkingCode : string,
    name: string,
    vehicleTypeName: string,
    capacity: number,
    parkingModeName: string,
    location: string,
    description: string|null,
    parkingAreaStatusName: string,
    currentOccupancy: number
}
export interface ParkingAreaCreateRequest{
    parkingCode : string,
    name: string,
    vehicleType: number,
    capacity: number,
    parkingMode: number,
    location: string,
    description?: string
}
export interface ParkingAreaUpdateRequest{
    id: number,
    
}
export interface ParkingAreaChangeStatus{

}

export type ParkingAreaResponse = AbpResponse<PagedResult<ParkingAreaDto>>