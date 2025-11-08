// src/components/common/Header.tsx
import { useNavigate } from "react-router-dom";
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
import { logoutUser } from "@/lib/api";

export default function Header() {
    const { isAuthenticated, user, setUser } = useAuth();
    const navigate = useNavigate();

    // If not authenticated, don't render the header
    if (!isAuthenticated || !user) return null;

    const email = user.email ?? "user";
    const role = (user.role || "").toUpperCase();

    async function handleSignOut() {
        try {
            await logoutUser();
        } catch (err) {
            console.error("logout error", err);
        } finally {
            setUser(null);
            navigate("/auth");
        }
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

                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => navigate("/dashboard")}>Dashboard</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => navigate("/cart")}>Cart</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => navigate("/my-orders")}>My Orders</DropdownMenuItem>

                                {/* ADMIN ONLY ITEM */}
                                {role === "ADMIN" && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => navigate("/authorize-new-users")}>Authorize New Users</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => navigate("/create-product")}>Create Product</DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}