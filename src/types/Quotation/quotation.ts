export interface QuotationDto{
    id:number,
    vehicleType : number,
    vehicleTypeName: string,
    duration: number,
    durationUnit: number,
    price: number

}
export interface QuotationCreateRequest{
    vehicleType : number,
    duration: number,
    durationUnit: number,
    price: number
}
export interface QuotationUpdateRequest{
    id: number,
    vehicleType? : number|null,
    duration?: number|null,
    durationUnit?: number|null,
    price?: number|null
}