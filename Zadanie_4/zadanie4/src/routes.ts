import {RouteObject} from "react-router-dom";
import MainPage from "./pages/main";

export const UnprotectedRoutes = [
    {path: "/", Component: MainPage},
] satisfies RouteObject[];
// export const AdminRoutes = [
//     {path: "/admin", Component: AdminLayout},
//
// ] satisfies RouteObject[];
