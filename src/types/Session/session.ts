export interface SessionDto{
    id:number
    ticketCode:string,
    fee: number|null,
    parkingAreaId: number,
    parkingAreaCode: string,
    parkingSpotId: number|null,
    parkingSpotCode: string|null,
    customerId: number|null,
    plateNumber: string|null,
    entryTime: string,
    exitTime: string|null,
    status: number,
    parkingSessionStatusName: string,
    checkInStaffId: number|null,
    checkOutStaffId: number| null,
    hourlyRate: number|null,
    dailyRate: number|null
}
export interface CheckInRequest{
    parkingAreaId?: number|null,
    parkingSpotId?:number|null,
    plateNumber?: string|null,
    reservationId?: number|null,
    vehicleType: number
}
export interface CheckInResponse{
    id: number,
    success:boolean,
    message: string,
    ticketCode: string|null,
    parkingAreaId: number|null,
    parkingSpotId: number|null,
    plateNumber: string|null,
    entryTime: string|null,
    status: number|null,
    parkingSessionStatusName: string|null,
    hourlyRate: number|null,
    dailyRate: number|null,
    fee: number|null,
    customerId: number| null,
    checkInStaffId: number|null
}
export interface CheckOutResponse{
    success:boolean,
    message: string,
    ticketCode: string,
    parkingAreaId: number,
    parkingSpotId: number|null,
    plateNumber: string|null,
    exitTime: string,
    status: number,
    parkingSessionStatusName: string,
    hourlyRate: number|null,
    dailyRate: number|null,
    fee: number,
    customerId: number| null,
    checkOutStaffId: number,
    paymentId: number|null,
    transactionCode: string|null,
    paymentExpiresAt: string|null,
    paymentStatus: number| null,
    paymentMethod: number| null
}

export interface SessionCustomerLookUp{
    id:number,
    name:string,
    phoneNumber: string|null,
    displayText: string
}
export interface SessionStaffLookUp{
    id:number,
    name: string,
    userId: number,
    displayText: string
}
export interface SessionParkingAreaLookUp{
    id:number,
    parkingCode: string,
    vehicleType: number,
    displayText: string
}
export interface SessionParkingSpotLookUp{
    id:number,
    spotCode: string,
    displayText: string
}
export interface SessionLookUpDto{
    customers : SessionCustomerLookUp[],
    staffs: SessionStaffLookUp[],
    parkingAreas: SessionParkingAreaLookUp[],
    parkingSpots : SessionParkingSpotLookUp[]

}
export interface ActiveSessionDto{
    id?: number | null,
    plateNumber?: string | null
}
export interface  CheckOutRequest{
    id:number,
    paymentMethod: number
}