// src/App.tsx

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import AuthPage from './pages/AuthPage'
import { AuthProvider, useAuth } from '@/components/Auth/AuthContext'

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { token } = useAuth()
    return token ? <>{children}</> : <Navigate to="/auth" />
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
                    <Route path="/auth" element={<AuthPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <DashboardPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/auth" />} />
                </Routes>
            </>
        </AuthProvider>
    )
}
