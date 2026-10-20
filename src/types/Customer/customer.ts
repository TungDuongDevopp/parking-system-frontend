
export interface CustomerRequestCreate{
    name: string,
    phoneNumber: string,
    email?: string
}
export interface CustomerDto{
    id: number,
    name: string,
    phoneNumber: string,
    email: string|null
}

export interface CustomerRequestUpdate{
    id: number
    name?: string,
    phoneNumber?: string,
    email?: string
}
