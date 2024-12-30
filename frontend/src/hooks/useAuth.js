import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import api from "../api";

export const useAuth = () => {
    const [isAuthorized, setIsAuthorized] = useState(null);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            setIsAuthorized(false);
            return false;
        }

        try {
            const res = await api.post("/api/token/refresh", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
                return true;
            }
            setIsAuthorized(false);
            return false;
        } catch (error) {
            setIsAuthorized(false);
            return false;
        }
    };

    const checkToken = () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const refreshTokenExists = localStorage.getItem(REFRESH_TOKEN);

        if (!token || !refreshTokenExists) {
            setIsAuthorized(false);
            return false;
        }

        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;
            const timeUntilExpiration = tokenExpiration - now;

            if (timeUntilExpiration < 300) {
                return false;
            }
            
            setIsAuthorized(true);
            return true;
        } catch (error) {
            setIsAuthorized(false);
            return false;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const hasTokens = localStorage.getItem(ACCESS_TOKEN) && localStorage.getItem(REFRESH_TOKEN);
            if (!hasTokens) {
                setIsAuthorized(false);
                return;
            }

            if (!checkToken()) {
                await refreshToken();
            }
        };

        initializeAuth();

        const interval = setInterval(initializeAuth, 60000);
        return () => clearInterval(interval);
    }, []);

    return { isAuthorized };
};