import axios from 'axios'
import {logoutUser} from "./logout";

export const getAuthToken = () => {
    return window.localStorage.getItem('token');
};

export const setAuthHeader = (token: string) => {
    window.localStorage.setItem('token', token);
};

export const apiWithConfig = axios.create({
    baseURL: 'https://localhost:8080/v1',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
})

apiWithConfig.interceptors.request.use(
    function (config) {
        const token = getAuthToken();
        if (token != null && token != "null") {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        console.error(error);
    }
)

apiWithConfig.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        console.error(error)
        logoutUser();
    }
)
