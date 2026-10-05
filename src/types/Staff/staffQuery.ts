export interface StaffQuery{
   keyword?:string,
   sorting?:string,
   skipCount?: number,
   maxResultCount? : number,
   status?: number,
   dateOfBirthFrom?: string,
   dateOfBirthTo?: string,
   hiredDateFrom?: string,
   hiredDateTo?: string
}