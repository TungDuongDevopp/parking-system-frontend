export interface TransactionDto{
    id:number,
    transactionCode:number,
    status:number,
    transactionStatusName:string,
    type:number,
    transactionTypeName:string,
    transactionTime:string|null,
    paymentId: number|null,
    amount:number
}
export interface RetryPaymentDto{
    paymentId:number
}
export interface ProcessPaymentRessultInput{
    transactionCode:string,
    isSuccess:boolean
}

export interface TransactionLookUpDto{
    payments: TransPaymentDto[]
}
export interface TransPaymentDto{
    id: number
    method: string
    type: string
    display?: string
}