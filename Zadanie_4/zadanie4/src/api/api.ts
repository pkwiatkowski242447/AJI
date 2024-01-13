import {ApiResponseType} from "../types/ApiResponse";
import {AccountType} from "../types/Account";
import {apiWithConfig} from "./api.config";

interface loginScheme {
    email: string;
    password: string;
}

export const api = {
    logIn: (email: string, password: string): ApiResponseType<AccountType> => {
        const loginData: loginScheme = {
            email: email,
            password: password
        }
        return apiWithConfig.post('/users/login', loginData)
    }
}
