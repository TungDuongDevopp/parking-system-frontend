export interface PaymentQuery{
   keyword?:string,
   sorting?:string,
   skipCount?: number,
   maxResultCount? : number,
   paymentMethod? : number,
   paymentStatus? : number,
   paymentType? : number,
   subscriptionId? : number,
   parkingSessionId?:number,
   amountFrom?:number,
   amountTo?:number,
   expiresFrom?:string,
   expiresTo?:string,
   paidAtFrom?:string,
   paidAtTo?:string
}