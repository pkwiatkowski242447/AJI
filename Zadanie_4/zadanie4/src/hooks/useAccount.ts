import {api} from "../api/api";
import {AccountTypeEnum} from "../enums/AccountType.enum";
import {useAccountState} from "../context/AccountContext";
import {useNavigate} from "react-router-dom";
import {Pathnames} from "../router/pathnames";
import {logoutUser} from "../api/logout";

export const useAccount = () => {
    const navigate = useNavigate()
    const {account, setAccount, isLoggingIn, setIsLoggingIn, isFetching, setIsFetching} =
        useAccountState()
    // const isAuthenticated = !!account?.login
    // const isAdmin = account?.accountType === AccountTypeEnum.ADMIN

    const logIn = async (login: string, password: string) => {
        try {
            setIsLoggingIn(true)
            const {data} = await api.logIn(login, password)
            setAccount(data)
        } catch {
            alert('Logging in error!')
            logoutUser()
        } finally {
            setIsLoggingIn(false)
        }
    }
    const getCurrentAccount = async () => {
        try {
            setIsFetching(true)
            if (localStorage.getItem('token')) {
                const {data} = await api.getCurrentAccount()
                setAccount(data)
            }
        } catch {
            alert('Unable to get current account!')
            logoutUser()
        } finally {
            setIsFetching(false)
        }
    }
    return {
        account,
        isLoggingIn,
        isFetching,
        logIn,
        getCurrentAccount,
    }
}