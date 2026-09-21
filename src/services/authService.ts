import type { LoginRequest, LoginResponse } from "../types/login";
import type { RegisterRequest,RegisterResponse } from "../types/register";
const BASE_URL:string ="https://localhost:44337";
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/api/TokenAuth/Authenticate`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
    });


    const result = await res.json() as LoginResponse;
    if (!result.success) {
    throw new Error(result.error?.message ?? "Đăng nhập thất bại");
}
    return result;
}


export const register = async (data: RegisterRequest):Promise<RegisterResponse> =>{

    const res = await fetch (`${BASE_URL}/api/services/app/Account/Register`,

        {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await res.json() as RegisterResponse;
        if (!result.success) {
    throw new Error(result.error?.message ?? "Đăng nhập thất bại");
        }
        return result;
};
