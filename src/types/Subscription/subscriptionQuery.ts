export interface SubscriptionQuery{
   keyword?:string,
   sorting?:string,
   skipCount?: number,
   maxResultCount? : number
   status? : number,
   startTimeFrom?: string,
   startTimeTo?: string,
   endTimeFrom?: string,
   endTimeTo?: string,
   quotationId?: number,
   customerId?: number
}