import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/Cart/CartContext";
import { toast } from "sonner";

export default function CartPage() {
    const { items, updateQty, removeItem, clearCart, totalItems, totalPrice } = useCart();
    const navigate = useNavigate();

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

    async function handleProceedToPayment() {
        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        // ---------- Production call (commented) ----------
        // import api from '@/lib/api'
        // // Example: create an order on the backend
        // const res = await api.post('/orders', { items: items.map(i => ({ productId: i.product.id, qty: i.qty })) })
        // // then redirect based on response (e.g., payment url or order id)
        // if (res?.data?.paymentUrl) window.location.href = res.data.paymentUrl;
        // ---------- End production call ----------

        // ---------- Local mock / demo behavior ----------
        // For now we'll just navigate to /checkout (payment module to be implemented later).
        toast.success("Proceeding to payment (demo)");
        navigate("/checkout");
        // ---------- End mock ----------
    }

    if (items.length === 0) {
        return (
            <main className="max-w-6xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Your Cart</h2>
                <p className="text-sm text-gray-300 mb-6">You don't have any items yet.</p>

                <Card>
                    <CardContent className="flex flex-col gap-4 items-start">
                        <Button onClick={() => navigate("/dashboard")}>Browse products</Button>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Your Cart</h2>
                    <p className="text-sm text-gray-300">{totalItems} item(s)</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => clearCart()}>
                        Clear cart
                    </Button>
                </div>
            </div>

            <section className="grid grid-cols-1 gap-4">
                {items.map((it) => (
                    <Card key={it.product.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4">
                        <img src={it.product.image} alt={it.product.name} className="w-full sm:w-40 h-28 object-cover rounded-md" />

                        <CardContent className="flex-1 p-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{it.product.name}</h3>
                                    <p className="text-sm text-gray-300 line-clamp-2">{it.product.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-green-400">{formatPrice(it.product.price)}</div>
                                    <div className="text-xs text-gray-400">each</div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        aria-label="decrease"
                                        onClick={() => updateQty(it.product.id, Math.max(1, it.qty - 1))}
                                        className="px-2 py-1 rounded-md hover:bg-white/5"
                                    >
                                        -
                                    </button>
                                    <div className="px-3 py-1 border rounded-md">{it.qty}</div>
                                    <button
                                        aria-label="increase"
                                        onClick={() => updateQty(it.product.id, it.qty + 1)}
                                        className="px-2 py-1 rounded-md hover:bg-white/5"
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-sm font-medium">{formatPrice(it.product.price * it.qty)}</div>
                                    <Button variant="ghost" onClick={() => removeItem(it.product.id)}>
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <aside className="mt-6 flex justify-end">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Subtotal</span>
                            <span className="font-semibold">{formatPrice(totalPrice)}</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button onClick={handleProceedToPayment}>Proceed to payment</Button>
                            <Button variant="outline" onClick={() => navigate("/dashboard")}>
                                Continue shopping
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </aside>
        </main>
    );
}
