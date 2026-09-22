import type { LoginRequest, LoginResponse } from "../types/Account/login";
import type { RegisterRequest,RegisterResponse } from "../types/Account/register";
import type { ChangePassWordRequest,ChangePassWordResponse } from "../types/Account/changePassword";
import { apiClient } from './apiClient';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient('/api/TokenAuth/Authenticate', {
        method: 'POST',
        body: JSON.stringify(data)
    });

    return res.json() as Promise<LoginResponse>;
}


export const register = async (data: RegisterRequest):Promise<RegisterResponse> =>{

    const res = await apiClient('/api/services/app/Account/Register',

        {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return res.json() as Promise<RegisterResponse>;
};

export const changePassword = async (data:ChangePassWordRequest): Promise<ChangePassWordResponse>=>{
    const res = await apiClient('/api/services/app/User/ChangePassword',
        {
            method :'POST',
            authenticated: true,
            body: JSON.stringify(data)
        });
    return res.json() as Promise<ChangePassWordResponse>;
};


export const getUserName = async() : Promise<string> =>{
    const res = await apiClient('/api/services/app/Session/GetCurrentLoginInformations',
        {
            method :'GET',
            authenticated: true,
        });
        const data = await res.json();
        const user = data.result?.user;
        const username = user?.name ?? user?.userName;

        if (!username) {
            throw new Error("Không lấy được username người dùng.");
        }

        return username;

}