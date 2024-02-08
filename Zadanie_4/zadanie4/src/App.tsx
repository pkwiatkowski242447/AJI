import './App.css'
import ReactDOM from "react-dom/client";
import React from 'react';
import {
    RouteObject,
    RouterProvider,
    createBrowserRouter,
} from "react-router-dom";
import {UnprotectedRoutes} from "./routes";
import UserContextProvider from "./context/UserContext";
import LoginPage from "./pages/login/login";
import Layout from "./pages/Layout";
import AuthenticationLayout from "./pages/AuthenticationLayout";
const router = createBrowserRouter([
    {
        path: "/",
        Component: Layout,
        children: [
            ...UnprotectedRoutes,
            {
                path: "/",
            },
        ],
    },
    {
        path: "/",
        Component: AuthenticationLayout,
        children: [
            // { path: "/register", Component: RegisterPage },
            { path: "/login", Component: LoginPage },
        ],
    },
    // {
    //     path: "/admin",
    //     Component: AdminLayout,
    //     children: AdminRoutes,
    // },
] satisfies RouteObject[]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <UserContextProvider>
            <RouterProvider router={router} />
        </UserContextProvider>
    </React.StrictMode>
);

const App: React.FC = () => {
    return (
        <UserContextProvider>
            <RouterProvider router={router} />
        </UserContextProvider>
    );
};


export default App;