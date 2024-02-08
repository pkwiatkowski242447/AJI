import { FC, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import spring_logo from "../assets/spring-logo.png"

const AuthenticationLayout: FC = () => {

    const token = window.localStorage.getItem("token");
    const navigation = useNavigate();

    useEffect(() => {
        if (token != null && token !== "null") {
            navigation("/");
        }
    }, [token, navigation]);

    return (
        <main className="h-screen flex justify-center items-center">
            <div className="flex w-[70vw] h-[80vh] shadow-large-shadow">
                <div className="bg-nice-green h-[100%] w-[40%]">
                     <p className="font-sans text-3xl italic font-medium mt-7 text-center">TEST</p>
                </div>

                <div className="bg-white h-[100%] w-[60%]">
                    <Outlet />
                </div>
            </div>
        </main>
    );
}

export default AuthenticationLayout;