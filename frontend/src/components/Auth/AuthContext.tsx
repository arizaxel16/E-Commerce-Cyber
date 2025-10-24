import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "@/lib/api";

interface AuthContextValue {
    token: string | null;
    setToken: (t: string | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(() => {
        return typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem("auth_token", token);
            // ensure axios instance includes the header for future production calls
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            localStorage.removeItem("auth_token");
            // remove header when no token
            if (api.defaults.headers.common.Authorization) {
                delete api.defaults.headers.common.Authorization;
            }
        }
    }, [token]);

    function setToken(t: string | null) {
        setTokenState(t);
    }

    function logout() {
        setTokenState(null);
    }

    return <AuthContext.Provider value={{ token, setToken, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
