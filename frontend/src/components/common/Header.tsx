// Ruta: src/components/common/Header.tsx (¡Refactorizado y Completo!)

import { useNavigate } from "react-router-dom";
// 1. ¡IMPORT CORREGIDO! Apunta al context que SÍ creamos.
import { useAuth } from "@/context/AuthContext";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// 2. ¡IMPORT CORREGIDO! Importamos la nueva función 'logoutUser' de api.ts
import { logoutUser } from "@/lib/api"; 

export default function Header() {
    // 3. ¡LÓGICA CORREGIDA! Obtenemos el estado de nuestro nuevo context
    const { isAuthenticated, user, setUser } = useAuth();
    const navigate = useNavigate();

    // 4. ¡GUARDIA CORREGIDA!
    // Renderiza el header solo si el usuario está autenticado
    if (!isAuthenticated || !user) {
        return null;
    }

    // 5. ¡LÓGICA SIMPLIFICADA!
    // Ya no necesitamos buscar en localStorage. El 'user' del context es la fuente de verdad.
    const email = user.email;

    /**
     * 6. ¡FUNCIÓN DE LOGOUT CORREGIDA!
     * Llama a la API para borrar la cookie HttpOnly y limpia el estado de React.
     */
    async function handleSignOut() {
        try {
            // Llama a la función de api.ts que avisa al backend
            await logoutUser(); 
            
            // Limpia el estado de React
            setUser(null);
            
            // Navega al login
            navigate("/auth");
        } catch (err) {
            console.error("Error durante el logout:", err);
            // Forzar limpieza y navegación incluso si la API falla
            setUser(null);
            navigate("/auth");
        }
    }

    // --- ¡TU DISEÑO (JSX) 100% PRESERVADO! ---
    return (
        <header className="w-full bg-chart-2 border-b border-white/6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                    {/* Left: Brand */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-white">E-Commerce Arepabuelas</h1>
                        <span className="text-sm text-gray-300 italic">by COGNITO</span>
                    </div>

                    {/* Right: User */}
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="default" className="flex items-center gap-2 px-3 py-6 rounded-md">
                                    <Avatar className="w-8 h-8">
                                        {/* (Lógica de Avatar simplificada, usa el email del context) */}
                                        <AvatarFallback className="text-black">
                                            {(email && email[0]?.toUpperCase()) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-sm font-medium text-white">{email}</span>
                                        <span className="text-xs text-gray-400">Account</span>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-40">
                                {/* (onSelect actualizado para la nueva función de logout) */}
                                <DropdownMenuItem onSelect={handleSignOut}>
                                    Sign out
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => navigate("/dashboard")}>
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => navigate("/cart")}>
                                    Cart
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}