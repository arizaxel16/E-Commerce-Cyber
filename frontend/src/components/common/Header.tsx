import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/Auth/AuthContext";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";

export default function Header() {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();

    // Only render header when user is signed in (token present)
    if (!token) return null;

    // email fallback for demo
    const email = user?.email || localStorage.getItem("auth_user_email") || "demo@arepabuelas.test";

    function handleSignOut() {
        logout();
        navigate("/auth");
    }

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
                                        <AvatarFallback className="text-black">{(email && email[0]?.toUpperCase()) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-sm font-medium text-white">{email}</span>
                                        <span className="text-xs text-gray-400">Account</span>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-40">
                                {/* If you want, production would call an API to get fresh data here (commented): */}
                                {/*
                                  // import api from '@/lib/api'
                                  // const userRes = await api.get('/auth/me')
                                */}
                                <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={() => {
                                        navigate("/dashboard");
                                    }}
                                >
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={() => {
                                        navigate("/cart");
                                    }}
                                >
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
