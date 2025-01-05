import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

// importing everything from env variable file
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Adding authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)


export default api