export interface ParkingSpotDto{
    id:number,
    spotCode: string,
    status: number,
    parkingAreaId: number,
    parkingAreaCode: string,
    parkingAreaName: string
}
export interface ParkingSpotCreateRequest{
    spotCode: string,
    parkingAreaId: number
}
export interface ParkingSpotUpdateRequest{
    id: number,
    spotCode?: string|null
}
export interface ParkingSpotChangeStatus{
    id: number,
    status: number
}
export interface ParkingSpotLookup{
    id: number,
    parkingCode:string,
    vehicleType:number,
    displayText:string
}