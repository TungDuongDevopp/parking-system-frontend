export interface QuotationQuery{
   keyword?:string,
   sorting?:string,
   skipCount?: number,
   maxResultCount? : number,
   vehicleType?: number,
   duration?:number,
   durationUnit?: number,
   minPrice?:number,
   maxPrice?:number
}