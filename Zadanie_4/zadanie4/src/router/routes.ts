import { AccountDetailsPageComponent } from '../pages/admin/AccountDetailsPage'
import { AccountsPageComponent } from '../pages/admin/AccountsPage'
import { LoginPageComponent } from '../pages/public/LoginPage'
import { HomePageComponent } from '../pages/user/HomePage'
import { RouteType } from '../types/Route'
import { Pathnames } from './pathnames'

export const adminRoutes: RouteType[] = [
    {
        path: Pathnames.admin.accounts,
        Component: AccountsPageComponent,
    },
    {
        path: Pathnames.admin.accountDetails,
        Component: AccountDetailsPageComponent,
    },
]

export const userRoutes: RouteType[] = [
    {
        path: Pathnames.user.home,
        Component: HomePageComponent,
    },
]

export const publicRoutes: RouteType[] = [
    {
        path: Pathnames.public.login,
        Component: LoginPageComponent,
    },
]