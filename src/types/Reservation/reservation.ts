export interface ReservationDto{
id: number,    
customerId : number,
customerName: string,
parkingAreaId: number,
parkingAreaCode : string,
parkingAreaName?: string|null,
parkingSpotId: number|null,
parkingSpotCode: string|null,
reservedAt : string,
status : string,
endTime : string,
vehicleType: number|null,
vehicleTypeName : string|null
reservationStatusName: string,
contactPhone: string
}

export interface ReservationCreateRequest{
    parkingAreaId: number,
    ParkingSpotId?: number|null,
    reservedAt : string
}
export interface ReservationCustomerLookUp{
    id: number,
    phoneNumber: string,
    name: string
}
export interface ReservationParkingAreaLookUp{
    id:number,
    parkingCode: string,
    vehicleType: number
}
export interface ReservationParkingSpotLookUp{
    id:number,
    spotCode: string
}
export interface  ReservationLookUp{
    customers : ReservationCustomerLookUp[],
    parkingAreas: ReservationParkingAreaLookUp[],
    parkingSpots: ReservationParkingSpotLookUp[]
}
export interface CanceledRequest{
    id:number
}