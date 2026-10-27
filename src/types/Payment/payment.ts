export interface PaymentDto{
    id:number,
    amount: number,
    paidAt: string|null,
    expiresAt: string|null,
    description: string|null,
    paymentMethod: number,
    paymentMethodName: string,
    paymentStatus: number,
    paymentStatusName: string,
    paymentType: number,
    paymentTypeName: string,
    subscriptionId: number|null
    parkingSessionId: number|null
}
export interface SessionLookupDto{
    id: number,
    plateNumber: string,
    nameStaffIn: string,
    nameStaffOut: string
}

export interface SubscriptionLookUpDto{
    id:number,
    customerName: string,
    quotationId:number
}
export interface PaymentLookUpDto{
    sessions : SessionLookupDto[],
    subscriptions: SubscriptionLookUpDto[]
}