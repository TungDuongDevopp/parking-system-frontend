export const BackendPaymentMethod = {
  Cash: 1,
  BankTransfer: 2,
  EWallet: 3,
  CreditCard: 4,
} as const

export type BackendPaymentMethod = typeof BackendPaymentMethod[keyof typeof BackendPaymentMethod]

export type CheckoutPaymentMethod = 'card' | 'bank' | 'qr'

export const checkoutPaymentMethodValue: Record<CheckoutPaymentMethod, BackendPaymentMethod> = {
  card: BackendPaymentMethod.CreditCard,
  bank: BackendPaymentMethod.BankTransfer,
  qr: BackendPaymentMethod.EWallet,
}

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