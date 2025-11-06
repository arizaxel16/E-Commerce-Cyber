// src/components/Header/Header.tsx
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { setToken as setApiToken } from "@/lib/api"; // helper to clear axios header

export default function Header() {
    const auth = useAuth(); // may throw if not wrapped, but your app already used it earlier
    const { token, user, logout } = auth;
    const navigate = useNavigate();

    // Only render header when user is signed in (token present)
    if (!token) return null;

    // Try to get a sensible email fallback from stored places
    function getLocalEmailFallback(): string | null {
        try {
            // prefer explicit user object in localStorage (if used)
            const rawUser = localStorage.getItem("cognito_user");
            if (rawUser) {
                const parsed = JSON.parse(rawUser);
                if (parsed?.email) return parsed.email;
            }
        } catch {}
        try {
            const e = localStorage.getItem("auth_user_email");
            if (e) return e;
        } catch {}
        return null;
    }

    const email = user?.email || getLocalEmailFallback() || "demo@arepabuelas.test";

    function handleSignOut() {
        try {
            // If AuthContext provided a logout, call it (it may already clear state/localStorage)
            if (typeof logout === "function") {
                try {
                    logout();
                } catch (e) {
                    // don't fail logout flow if context logout misbehaves
                    /* noop */
                }
            }

            // Ensure token and any stored user info get cleared in all cases
            try {
                setApiToken(null); // clears axios default header and localStorage key (api helper handles localStorage)
            } catch (e) {
                // fallback: directly remove keys
                localStorage.removeItem("cognito_token");
                localStorage.removeItem("cognito_user");
                localStorage.removeItem("auth_user_email");
            }

            // Final navigation to auth page
            navigate("/auth");
        } catch (err) {
            // best-effort: still navigate to auth
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

                            <DropdownMenuContent align="end" className="w-40">
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
