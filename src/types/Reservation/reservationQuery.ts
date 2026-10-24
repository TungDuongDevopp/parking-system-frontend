export interface ReservationQuery{
   keyword?:string,
   sorting?:string,
   skipCount?: number,
   maxResultCount? : number,
   customerId?: number,
   parkingSpotId?:number,
   parkingAreaId?:number,
   reservedAtFrom?:string,
   reservedAtTo?:string,
   expireAtFrom?:string,
   expireAtTo?:string,
   status?:number

}