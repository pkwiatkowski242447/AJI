import {AccountTypeEnum} from "../enums/AccountType.enum";

export interface AccountType {
    id: string
    username: string
    email: string
    phoneNumber: string
    password: string
    refreshToken?: string
    userImage: string
    role?: AccountTypeEnum
}