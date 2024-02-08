import {FC} from "react";
import {FormProvider, useForm} from "react-hook-form";
import Input from "../../components/fields/Input";
import Button from "../../components/Button";
import {apiWithConfig, setAuthHeader} from "../../api/api.config";
import {LoginRequest} from "../../types/LoginRequest";
import {useNavigate} from "react-router-dom";
import {useUserContext} from "../../context/UserContext";


const LoginPage: FC = () => {
    const methods = useForm<LoginRequest>({
        values: {
            email: "",
            password: "",
        },
    });
    const {setAccount} = useUserContext();
    const {handleSubmit} = methods;
    const navigation = useNavigate();

    const onSubmit = handleSubmit((values) => {

        apiWithConfig.post('/users/login', values)
            .then(response => {
                setAuthHeader(response.data.token);
                setAccount({
                    id: response.data._id, username: response.data.username, phoneNumber: response.data.phoneNumber,
                });
                console.table(response.data)
                navigation("/");
            })
            .catch(error => {
                console.error(error);
            })
    });

    const handleClick = () => {
        navigation("/register")
    }

    return (
        <>
            <p className="font-sans text-xl italic font-medium mt-28 text-center">Logowanie</p>
            <div className="flex justify-center">
                <FormProvider {...methods}>
                    <form onSubmit={onSubmit} className="pt-[50px] w-[60%]">
                        <Input label="Login: " placeholder="Podaj login" name="email"/>
                        <Input label="Hasło: " placeholder="Podaj hasło" name="password" type="password"/>
                        <div onClick={handleClick} className="hover:cursor-pointer">
                            <p>Zarejestruj się</p>
                        </div>
                        <div className="flex justify-center">
                            <Button type="submit" label="Zaloguj się"
                                    className="bg-nice-green w-full mt-6 h-9 rounded-md font-medium"/>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </>
    );
};

export default LoginPage;
