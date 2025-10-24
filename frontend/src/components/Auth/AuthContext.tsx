import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface AuthContextValue {
    token: string | null
    setToken: (t: string | null) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(() => {
        return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    })

    useEffect(() => {
        if (token) localStorage.setItem('auth_token', token)
        else localStorage.removeItem('auth_token')
    }, [token])

    function setToken(t: string | null) {
        setTokenState(t)
    }

    function logout() {
        setTokenState(null)
    }

    return <AuthContext.Provider value={{ token, setToken, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}