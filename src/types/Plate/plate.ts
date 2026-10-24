export interface PlateDto{
    id: number,
    subscriptionId: number,
    plateNumber: string,
    vehicleType: number,
    vehicleTypeName: string
}

export interface ChangePlateRequest{
    id: number,
    subscriptionId: number,
    plateNumber: string
}
export interface AddPlateRequest{
    subscriptionId: number,
    plateNumber: string
}