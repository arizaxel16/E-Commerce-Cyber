import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

// 1. ¡Import del Context CORREGIDO!
import { useAuth } from "@/context/AuthContext";

// 2. Definimos la forma del usuario (sin el token)
type User = {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    message?: string; 
};

export default function AuthPage() {
    // 3. ¡Lógica de Context CORREGIDA!
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState<"login" | "signup">("login");
    
    // 4. ¡NUEVO CAMPO de estado para el formulario de registro!
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    
    const [loading, setLoading] = useState(false);

    // Tu función de validación (está perfecta)
    function validateEmail(e: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    }

    /**
     * 5. ¡Lógica de handleSubmit CORREGIDA!
     * Ahora maneja el login de HttpOnly y el registro (con fullName).
     */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (!validateEmail(email)) {
            return toast.error("Por favor, ingresa un email válido");
        }
        if (password.length < 8) {
            return toast.error("La contraseña debe tener al menos 8 caracteres");
        }
        
        if (mode === "signup") {
            if (fullName.trim().length < 3) {
                return toast.error("Por favor, ingresa tu nombre completo");
            }
            if (password !== confirm) {
                return toast.error("Las contraseñas no coinciden");
            }
        }

        setLoading(true);
        try {
            if (mode === "login") {
                // --- LÓGICA DE LOGIN (HttpOnly) ---
                const res = await api.post<User>("/auth/login", { email, password });
                const userData = res.data;

                if (userData?.userId) {
                    // Guardamos los datos del usuario en el estado global
                    setUser(userData); 
                    toast.success(userData.message || "Inicio de sesión exitoso");
                    navigate("/dashboard"); 
                } else {
                    toast.error(userData.message || "Credenciales inválidas");
                }

            } else {
                // --- LÓGICA DE SIGNUP (HttpOnly) ---
                const res = await api.post<User>("/auth/register", { fullName, email, password });

                if (res.status === 201) {
                    // ¡Éxito!
                    toast.success(res.data.message || "Cuenta creada exitosamente");
                    // Cambiamos al modo login para que el usuario inicie sesión
                    setMode("login");
                    setPassword("");
                    setConfirm("");
                } else {
                    toast.error(res.data.message || "No se pudo crear la cuenta");
                }
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Error de red";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    // 6. ¡TODO TU DISEÑO (JSX) ESTÁ AQUÍ!
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-chart-2 p-6">
            
            {/* --- 1. TU CABECERA (Restaurada) --- */}
            <header className="p-6">
                <div className="max-w-7xl mx-auto flex flex-col items-start">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
                        E-Commerce Arepabuelas
                    </h1>
                    <h2 className="text-lg sm:text-xl font-medium text-gray-200 mt-2 font-serif italic">
                        by: COGNITO
                    </h2>
                </div>
            </header>

            <Card className="w-full max-w-lg">
                <CardHeader>
                    {/* --- 2. TUS BOTONES DE TOGGLE (Restaurados) --- */}
                    <div className="flex gap-2 mb-6 justify-start">
                        <button
                            className={`px-4 py-2 rounded-md font-medium ${mode === "login" ? "bg-slate-900 text-white" : "bg-white border"}`}
                            onClick={() => setMode("login")}
                        >
                            Sign in
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md font-medium ${mode === "signup" ? "bg-slate-900 text-white" : "bg-white border"}`}
                            onClick={() => setMode("signup")}
                        >
                            Sign up
                        </button>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* --- CAMPO 'fullName' (Añadido para signup) --- */}
                        {mode === "signup" && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" placeholder="Tu nombre" />
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="tu@email.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Contraseña</label>
                            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
                        </div>

                        {mode === "signup" && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
                                <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="••••••••" />
                            </div>
                        )}

                        {/* --- 3. TU BOTÓN DE SUBMIT Y LINK (Restaurados) --- */}
                        <div className="flex items-center justify-between">
                            <Button type="submit" disabled={loading}>
                                {loading ? (mode === "login" ? "Signing in..." : "Creating...") : mode === "login" ? "Sign in" : "Create account"}
                            </Button>

                            <div className="text-sm">
                                {mode === "login" ? (
                                    <button type="button" className="underline" onClick={() => setMode("signup")}>Need an account?</button>
                                ) : (
                                    <button type="button" className="underline" onClick={() => setMode("login")}>Have an account?</button>
                                )}
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}