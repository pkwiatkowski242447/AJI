import {AccountTypeEnum} from "../enums/AccountType.enum";

export interface AccountType {
    id: string
    username: string
    phoneNumber: string
    role?: AccountTypeEnum
}