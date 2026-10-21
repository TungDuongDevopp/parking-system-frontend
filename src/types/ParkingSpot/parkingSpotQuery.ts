export interface ParkingSpotQuery{
   keyword?:string,
   sorting?:string,
   skipCount?: number,
   maxResultCount? : number,
   status?: number
   parkingAreaId?: number
}