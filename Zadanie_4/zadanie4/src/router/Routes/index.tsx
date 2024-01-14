import { Navigate, Route, Routes } from 'react-router-dom'
import { Pathnames } from '../pathnames'
import { adminRoutes, publicRoutes, userRoutes } from "../routes"
import {useAccount} from "../../hooks/useAccount";
import {useEffect} from "react";

export const RoutesComponent = () => {
    const { account, isFetching, getCurrentAccount } = useAccount()
    useEffect(() => {
        if (!account) {
            getCurrentAccount()
        }
    }, [])
    if (isFetching) {
        return <div>Loading</div>
    }
    return (
        <Routes>
            {publicRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
            ))}
            {
                userRoutes.map(({ path, Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                ))}
            {
                adminRoutes.map(({ path, Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                ))}
            <Route path="*" element={<Navigate to={Pathnames.public.login} replace />} />
        </Routes>
    )
}