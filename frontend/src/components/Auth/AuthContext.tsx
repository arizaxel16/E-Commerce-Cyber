// src/components/Auth/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "@/lib/api";

type UserShape = { id?: string; email?: string } | null;

interface AuthContextValue {
    token: string | null;
    user: UserShape;
    setToken: (t: string | null, user?: UserShape) => void;
    setUser: (u: UserShape) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("auth_token");
    });

    const [user, setUserState] = useState<UserShape>(() => {
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("auth_user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        // persist token
        if (token) {
            localStorage.setItem("auth_token", token);
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            localStorage.removeItem("auth_token");
            if (api.defaults.headers && api.defaults.headers.common) {
                delete api.defaults.headers.common.Authorization;
            }
        }
    }, [token]);

    useEffect(() => {
        // persist user (email, id, whatever)
        if (user) {
            try {
                localStorage.setItem("auth_user", JSON.stringify(user));
            } catch {}
        } else {
            localStorage.removeItem("auth_user");
        }
    }, [user]);

    function setToken(t: string | null, u?: UserShape) {
        setTokenState(t);
        if (u !== undefined) setUserState(u);
    }

    function setUser(u: UserShape) {
        setUserState(u);
    }

    function logout() {
        setTokenState(null);
        setUserState(null);
    }

    return <AuthContext.Provider value={{ token, user, setToken, setUser, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
