import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";

type OrderItemDTO = {
    id?: string;
    productId?: string;
    productName?: string; // may or may not be present depending on backend
    quantity: number;
    unitPrice: string | number; // BigDecimal from backend may come as string
    totalPrice: string | number;
};

type OrderDTO = {
    id: string;
    status: string;
    totalAmount: string | number;
    shippingAddress?: string;
    billingAddress?: string;
    couponCode?: string;
    createdAt?: string;
    items?: OrderItemDTO[];
};

function parseAmount(v: string | number) {
    const n = typeof v === "number" ? v : parseFloat(String(v || "0"));
    return isNaN(n) ? 0 : n;
}

function formatPrice(amount: string | number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(parseAmount(amount));
}

export default function MyOrders(): JSX.Element {
    const [orders, setOrders] = useState<OrderDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadOrders() {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/orders/my-orders");
            setOrders(res.data || []);
        } catch (err: any) {
            console.error("Failed to load orders", err);
            setError(err?.response?.data?.message || err?.message || "Failed to load orders");
            toast.error("Failed to load your orders");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    if (loading) {
        return (
            <main className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-white mb-4">My Orders</h2>
                <div className="text-sm text-gray-300">Loading orders...</div>
            </main>
        );
    }

    return (
        <main className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">My Orders</h2>
                <div className="flex gap-2">
                    <Button onClick={loadOrders}>Refresh</Button>
                </div>
            </div>

            {error && (
                <Card className="mb-4">
                    <CardContent>
                        <div className="text-sm text-red-400">{error}</div>
                    </CardContent>
                </Card>
            )}

            {orders.length === 0 ? (
                <Card>
                    <CardContent>
                        <div className="text-sm text-gray-300">You have no orders yet.</div>
                        <div className="mt-3">
                            <Button onClick={() => (window.location.href = "/dashboard")}>Browse products</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <section className="grid gap-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="p-4">
                            <CardContent>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-sm text-gray-300">Order id</div>
                                        <div className="font-medium">{order.id}</div>
                                        <div className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleString("es-CO") : "-"}</div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm text-gray-300">Status</div>
                                        <div className="font-semibold">{order.status}</div>
                                        <div className="text-sm mt-2">{formatPrice(order.totalAmount)}</div>
                                    </div>
                                </div>

                                {order.couponCode && <div className="mt-3 text-sm text-green-300">Coupon: {order.couponCode}</div>}

                                {(order.shippingAddress || order.billingAddress) && (
                                    <div className="mt-3 text-sm text-gray-300">
                                        {order.shippingAddress && <div>Ship to: {order.shippingAddress}</div>}
                                        {order.billingAddress && <div>Bill to: {order.billingAddress}</div>}
                                    </div>
                                )}

                                {order.items && order.items.length > 0 && (
                                    <div className="mt-4 border-t pt-3">
                                        <div className="text-sm text-gray-400 mb-2">Items</div>
                                        <ul className="space-y-2">
                                            {order.items.map((it) => (
                                                <li key={it.id || `${order.id}-${it.productId}`} className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{it.productName || `Product ${it.productId}`}</div>
                                                        <div className="text-xs text-gray-400">Qty: {it.quantity}</div>
                                                    </div>
                                                    <div className="text-sm">{formatPrice(it.totalPrice)}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}
        </main>
    );
}
