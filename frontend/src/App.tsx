import React from "react";

import { Routes, Route, Navigate, Outlet, BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import AuthPage from "./pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import CartPage from "@/pages/CartPage";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import Header from "@/components/common/Header";
import { CartProvider } from "@/components/Cart/CartContext";
import ProductPage from "@/pages/ProductPage.tsx";
import MyOrders from "@/pages/MyOrders.tsx";
import AuthorizeNewUsers from "@/pages/AuthorizeNewUsers.tsx";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Cargando sesión...</div>; 
    }
    
    return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AuthRoute() {
    const { isAuthenticated, isLoading } = useAuth(); 

    if (isLoading) {
        return <div>Cargando sesión...</div>; // O un componente <Spinner />
    }

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />;
}

function RootRedirect() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Cargando sesión...</div>;
    }

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />;
}

/**
 * AuthenticatedLayout: (¡Tu JSX 100% Preservado!)
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
 * App: (¡Tu JSX 100% Preservado, con BrowserRouter añadido!)
 */
export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                {/* 6. ¡AÑADIDO! BrowserRouter debe envolver tus Routes */}
                <BrowserRouter> 
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
                            <Route path="/product/:id" element={<ProductPage />} />
                            <Route path="my-orders" element={<MyOrders />} />
                            <Route path="/authorize-new-users" element={<AuthorizeNewUsers />} />
                        </Route>

                        {/* root and fallback */}
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="*" element={<RootRedirect />} />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}