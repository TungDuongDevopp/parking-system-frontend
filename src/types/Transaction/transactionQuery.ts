export interface TransactionQuery{
   keyword?:string,
   sorting?:string,
   skipCount?: number,
   maxResultCount? : number,
   paymentId?:number,
   minAmount?:number,
   maxAmount?:number,
   status?:number,
   type?:number,
   transactionTimeFrom?:string,
   transactionTimeTo?:string
}