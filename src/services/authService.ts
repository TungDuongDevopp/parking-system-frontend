import type { LoginRequest, LoginResponse } from "../types/login";
import type { RegisterRequest,RegisterResponse } from "../types/register";
import type { ChangePassWordRequest,ChangePassWordResponse } from "../types/changePassword";
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
        return result;
};

export const changePassword = async (data:ChangePassWordRequest): Promise<ChangePassWordResponse>=>{
    const accessToken = localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");

    if (!accessToken) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    const res = await fetch(`${BASE_URL}/api/services/app/User/ChangePassword`,
        {
            method :'POST',
             headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });
    const result = await res.json() as ChangePassWordResponse;
        return result;
};


export const getUserName = async() : Promise<string> =>{
     const accessToken = localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");

    if (!accessToken) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    const res = await fetch(`${BASE_URL}/api/services/app/Session/GetCurrentLoginInformations`,
        {
            method :'GET',
             headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        });
        const data = await res.json();
        const user = data.result?.user;
        const username = user?.name ?? user?.userName;

        if (!username) {
            throw new Error("Không lấy được username người dùng.");
        }

        return username;

}