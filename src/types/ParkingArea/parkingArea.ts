
export interface ParkingAreaDto{
    id:number,
    parkingCode : string,
    name: string,
    vehicleTypeName: string,
    vehicleType: number
    capacity: number,
    parkingMode: string,
    parkingModeName: string,
    location: string,
    description: string|null,
    status: number
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
    description?: string|null
}
export interface ParkingAreaUpdateRequest{
    id: number,
    parkingCode : string,
    name: string,
    vehicleType: number,
    capacity: number,
    parkingMode: number,
    location: string,
    description?: string|null
}
export interface ParkingAreaChangeStatus{
    id: number,
    status: number
}
