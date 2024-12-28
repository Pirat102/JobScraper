import { useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import api from "../api";

export const useAuth = () => {
    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    const checkAndRefreshToken = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) return false;

        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            return await refreshToken();
        }
        return true;
    };

    useEffect(() => {
        checkAndRefreshToken();
    }, []);

    return { checkAndRefreshToken };
};