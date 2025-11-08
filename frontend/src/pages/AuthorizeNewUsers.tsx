import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type UserDTO = {
    id: string;
    email?: string;
    fullName?: string;
    role?: string;
    status?: string;
};

export default function AuthorizeNewUsers(): React.JSX.Element {
    const [loading, setLoading] = useState(false);
    const [pendingUsers, setPendingUsers] = useState<UserDTO[]>([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        // Quick client-side guard using context role
        if (!user || (user.role || "").toUpperCase() !== "ADMIN") {
            toast.error("Access denied");
            navigate("/dashboard");
            return;
        }

        (async () => {
            setLoading(true);
            try {
                // verify current user
                const me = await api.get("/auth/me");
                if ((me.data.role || "").toUpperCase() !== "ADMIN") {
                    toast.error("Access denied");
                    navigate("/dashboard");
                    return;
                }

                // fetch pending users from backend
                const res = await api.get<UserDTO[]>("/auth/users/pending");
                setPendingUsers(res.data || []);
            } catch (err: any) {
                console.error("Failed to load pending users", err);
                toast.error("Could not load pending users");
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate, user]);

    async function handleApprove(id: string) {
        try {
            await api.put<UserDTO>(`/auth/users/${encodeURIComponent(id)}/approve`);
            toast.success("User approved");
            setPendingUsers((s) => s.filter((u) => u.id !== id));
        } catch (err) {
            console.error("approve failed", err);
            toast.error("Could not approve user");
        }
    }

    if (loading) {
        return (
            <main className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Authorize New Users</h2>
                <div className="text-sm text-gray-300">Loading...</div>
            </main>
        );
    }

    return (
        <main className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Authorize New Users</h2>
                <div className="flex gap-2">
                    <Button onClick={() => navigate("/dashboard")}>Back</Button>
                </div>
            </div>

            <section className="grid gap-4">
                {pendingUsers.length === 0 ? (
                    <Card>
                        <CardContent>
                            <div className="text-sm text-gray-300">No pending users to authorize.</div>
                        </CardContent>
                    </Card>
                ) : (
                    pendingUsers.map((u) => (
                        <Card key={u.id} className="p-4">
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{u.fullName || u.email}</div>
                                        <div className="text-xs text-gray-400">{u.email}</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={() => handleApprove(u.id)}>Approve</Button>
                                        <Button variant="ghost" onClick={() => toast("Reject not implemented")}>Reject</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </section>
        </main>
    );
}
