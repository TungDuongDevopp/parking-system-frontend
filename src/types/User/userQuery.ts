export interface UserQuery{

   keyword?:string,
   sorting?:string,
   isActive?:boolean,
   skipCount?: number,
   maxResultCount? : number
}