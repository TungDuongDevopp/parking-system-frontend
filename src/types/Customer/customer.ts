
export interface CustomerDto{
    id: number,
    name: string,
    phoneNumber: string | null,
    email: string
}

export interface CustomerRequestUpdate{
    id: number
    name?: string,
    phoneNumber?: string | null,
    email?: string
}
