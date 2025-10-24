// src/App.tsx

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import AuthPage from './pages/AuthPage'
import { AuthProvider, useAuth } from '@/components/Auth/AuthContext'
import Header from "@/components/common/Header.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import {CartProvider} from "@/components/Cart/CartContext.tsx";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { token } = useAuth()
    // If not authenticated, redirect to auth page
    return token ? <>{children}</> : <Navigate to="/auth" replace />
}

// When user visits /auth, if already signed in send them to dashboard
function AuthRoute() {
    const { token } = useAuth()
    return token ? <Navigate to="/dashboard" replace /> : <AuthPage />
}

// Root redirect: send authenticated users to dashboard, others to auth
function RootRedirect() {
    const { token } = useAuth()
    return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
}

export default function App() {
    return (
        <AuthProvider>
        <CartProvider>
            <>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/auth" element={<AuthRoute />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Header />
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="*" element={<RootRedirect />} />
                </Routes>
            </>
        </CartProvider>
        </AuthProvider>
    )
}
