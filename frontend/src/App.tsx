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

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth(); // <-- CORREGIDO
    return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AuthRoute() {
    const { isAuthenticated } = useAuth(); // <-- CORREGIDO
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />;
}

function RootRedirect() {
    const { isAuthenticated } = useAuth(); // <-- CORREGIDO
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />;
}

function AuthenticatedLayout() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="px-6">
                <Outlet />
            </main>
        </div>
    );
}

// ... (CheckoutPlaceholder se queda igual) ...

/**
 * App:
 * (Tu 'App' ya estaba usando AuthProvider, lo cual es correcto,
 * pero 'main.tsx' no debería hacerlo si 'App.tsx' ya lo hace).
 *
 * NOTA: ¡He añadido <BrowserRouter> aquí!
 * Tu 'main.tsx' NO debe tener el AuthProvider si App.tsx lo tiene.
 * Moveremos toda la lógica de 'Providers' aquí para que 'main.tsx'
 * esté limpio.
 */
export default function App() {
    return (
        <AuthProvider> {/* <--- El AuthProvider debe estar aquí... */}
            <CartProvider>
                <BrowserRouter> {/* <--- ...y DENTRO de BrowserRouter */}
                    <Toaster position="top-right" />
                    <Routes>
                        {/* Public / auth */}
                        <Route path="/auth" element={<AuthRoute />} />

                        {/* Private */}
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
                            {/* <Route path="/checkout" element={<CheckoutPlaceholder />} /> */}
                            <Route path="/product/:id" element={<ProductPage />} />
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

// ... (CheckoutPlaceholder)
function CheckoutPlaceholder() {
    return (
        <main className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Checkout (placeholder)</h2>
            <p className="text-sm text-gray-300 mb-4">Payment module will be implemented later — this is a demo route.</p>
        </main>
    );
}