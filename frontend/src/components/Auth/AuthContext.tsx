// src/components/Auth/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import api, { setToken as setApiToken, getToken as getApiToken } from "@/lib/api";

type UserShape = { id?: string; email?: string; fullName?: string; role?: string } | null;

interface AuthContextValue {
    token: string | null;
    user: UserShape;
    setToken: (t: string | null, user?: UserShape) => void;
    setUser: (u: UserShape) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEYS = ["cognito_token", "auth_token"];
const USER_KEYS = ["cognito_user", "auth_user"];

function readFirstStorage(keys: string[]): string | null {
    try {
        for (const k of keys) {
            const v = localStorage.getItem(k);
            if (v) return v;
        }
    } catch { }
    return null;
}

function readUserFromStorage(): UserShape {
    try {
        for (const k of USER_KEYS) {
            const raw = localStorage.getItem(k);
            if (raw) {
                try {
                    return JSON.parse(raw);
                } catch {
                    return { email: raw };
                }
            }
        }
    } catch { }
    return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const initialToken = (() => {
        try {
            const fromApi = getApiToken?.();
            if (fromApi) return fromApi;
        } catch { }
        return readFirstStorage(TOKEN_KEYS);
    })();

    const [token, setTokenState] = useState<string | null>(initialToken);
    const [user, setUserState] = useState<UserShape>(() => readUserFromStorage());

    // Keep api helper and localStorage in sync, but do it conservatively
    useEffect(() => {
        try {
            // If api already has same Authorization header, avoid rewriting to prevent storage events
            const currentHeader = (api.defaults.headers && (api.defaults.headers as any).common && (api.defaults.headers as any).common.Authorization) || null;
            const desiredHeader = token ? `Bearer ${token}` : null;
            if (currentHeader !== desiredHeader) {
                setApiToken(token);
            }

            // Only write localStorage if value changed
            const existingToken = readFirstStorage(TOKEN_KEYS);
            if (token && existingToken !== token) {
                localStorage.setItem("cognito_token", token);
                localStorage.setItem("auth_token", token);
            } else if (!token && existingToken) {
                localStorage.removeItem("cognito_token");
                localStorage.removeItem("auth_token");
            }
        } catch { }
    }, [token]);

    // Persist user only when changed (string compare)
    useEffect(() => {
        try {
            const prev = readUserFromStorage();
            const prevStr = prev ? JSON.stringify(prev) : null;
            const nowStr = user ? JSON.stringify(user) : null;
            if (nowStr !== prevStr) {
                if (user) {
                    localStorage.setItem("cognito_user", nowStr as string);
                    localStorage.setItem("auth_user", nowStr as string);
                    if ((user as any)?.email) localStorage.setItem("auth_user_email", (user as any).email);
                } else {
                    localStorage.removeItem("cognito_user");
                    localStorage.removeItem("auth_user");
                    localStorage.removeItem("auth_user_email");
                }
            }
        } catch { }
    }, [user]);

    // Unauthorized handler: clear state but DO NOT navigate here (avoid competing navigations)
    useEffect(() => {
        const handler = () => {
            try {
                setTokenState(null);
                setUserState(null);
                setApiToken(null);
                // clear storage keys
                localStorage.removeItem("cognito_token");
                localStorage.removeItem("auth_token");
                localStorage.removeItem("cognito_user");
                localStorage.removeItem("auth_user");
                localStorage.removeItem("auth_user_email");
            } catch { }
        };
        window.addEventListener("cognito:unauthorized", handler as EventListener);
        return () => window.removeEventListener("cognito:unauthorized", handler as EventListener);
    }, []);

    const setToken = useCallback((t: string | null, u?: UserShape) => {
        setTokenState(t);
        if (u !== undefined) setUserState(u);
    }, []);

    const setUser = useCallback((u: UserShape) => {
        setUserState(u);
    }, []);

    const logout = useCallback(() => {
        try {
            setTokenState(null);
            setUserState(null);
            setApiToken(null);
            localStorage.removeItem("cognito_token");
            localStorage.removeItem("auth_token");
            localStorage.removeItem("cognito_user");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_user_email");
        } catch { }
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, setToken, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
