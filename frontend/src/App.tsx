// src/App.tsx

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import AuthPage from './pages/AuthPage'
import { AuthProvider, useAuth } from '@/components/Auth/AuthContext'

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

function DashboardPage() {
    return <div className="p-6 text-center">Welcome to your dashboard!</div>
}

export default function App() {
    return (
        <AuthProvider>
            <>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/auth" element={<AuthRoute />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <DashboardPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="*" element={<RootRedirect />} />
                </Routes>
            </>
        </AuthProvider>
    )
}
