export interface ParkingAreaQuery {
   keyword?:string,
   sorting?:string,
   skipCount?: number,
   maxResultCount? : number,
   status?: number,
   vehicleType?: number,
   minCapacity?: number,
   maxCapacity?: number,
   parkingMode?: number
}