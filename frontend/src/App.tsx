// src/App.tsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";

import AuthPage from "./pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import CartPage from "@/pages/CartPage";
import { AuthProvider, useAuth } from "@/components/Auth/AuthContext";
import Header from "@/components/common/Header";
import { CartProvider } from "@/components/Cart/CartContext";

/**
 * PrivateRoute: keep it simple — expects to be used inside AuthProvider.
 * If not authenticated, redirect to /auth.
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    return token ? <>{children}</> : <Navigate to="/auth" replace />;
}

/**
 * AuthRoute: when visiting /auth, if already signed in send to dashboard.
 */
function AuthRoute() {
    const { token } = useAuth();
    return token ? <Navigate to="/dashboard" replace /> : <AuthPage />;
}

/**
 * RootRedirect: redirect root & unknown routes depending on auth state.
 */
function RootRedirect() {
    const { token } = useAuth();
    return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />;
}

/**
 * AuthenticatedLayout: layout for all private routes.
 * Renders Header once and then nested routes via <Outlet />.
 */
function AuthenticatedLayout() {
    return (
        <div className="min-h-screen">
            <Header />
            {/* main area for nested private pages */}
            <main className="px-6">
                <Outlet />
            </main>
        </div>
    );
}

/**
 * Simple checkout placeholder so /checkout doesn't 404 while you implement the payment flow.
 */
function CheckoutPlaceholder() {
    return (
        <main className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Checkout (placeholder)</h2>
            <p className="text-sm text-gray-300 mb-4">Payment module will be implemented later — this is a demo route.</p>
        </main>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <>
                    <Toaster position="top-right" />
                    <Routes>
                        {/* Public / auth */}
                        <Route path="/auth" element={<AuthRoute />} />

                        {/* Private: wrap an AuthenticatedLayout inside PrivateRoute */}
                        <Route
                            element={
                                <PrivateRoute>
                                    <AuthenticatedLayout />
                                </PrivateRoute>
                            }
                        >
                            {/* nested private routes */}
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout" element={<CheckoutPlaceholder />} />
                        </Route>

                        {/* root and fallback */}
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="*" element={<RootRedirect />} />
                    </Routes>
                </>
            </CartProvider>
        </AuthProvider>
    );
}
