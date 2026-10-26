export interface SubscriptionDto{
    id:number,
    startTime:string,
    endTime:string,
    status:number,
    subscriptionStatusName:string,
    duration: number,
    durationUnit: number,
    durationUnitName:string,
    totalAmount:string,
    price:number,
    customerId:number,
    customerName:string,
    vehicleType:number
    vehicleTypeName:string
}

export interface SubscriptionCreateRequest{
    startTime:string,
    quotationId:number,
    plateNumbers:string[]
}

export interface SubscriptionCustomerLookup{
    id:number,
    name:string,
    phoneNumber:string,
    displayText:string
}
export interface SubscriptionQuotationLookup{
    id:number,
    vehicleType: number,
    duration: number,
    durationUnit: number,
    price: number,
    displayText:string
}
export interface SubscriptionLookUpDto{
    customers: SubscriptionCustomerLookup[],
    quotations: SubscriptionQuotationLookup[]
}