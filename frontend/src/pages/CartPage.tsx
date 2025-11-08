// CartPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/Cart/CartContext";
import { toast } from "sonner";
import api from "@/lib/api"; // <-- axios instance (baseURL '/api')

// --- Encryption helpers (demo only) ---
async function deriveKey(password: string, salt: Uint8Array) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

function bufToB64(buf: ArrayBuffer) {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
}

async function encryptCard(cardNumber: string): Promise<string> {
    // DEMO: hardcoded passphrase and salt. In prod, never embed secrets in client.
    const passphrase = "demo-passphrase-please-change";
    const salt = new TextEncoder().encode("demo-salt-2025");
    const key = await deriveKey(passphrase, salt);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(cardNumber)
    );

    // return base64: iv:ciphertext
    return `${bufToB64(iv.buffer)}:${bufToB64(ciphertext)}`;
}

// --- Types ---
type OrderItemRequest = {
    productId: string;
    qty: number;
};

type CreateOrderRequest = {
    items: OrderItemRequest[];
    couponCode?: string;
    shippingAddress?: string;
    billingAddress?: string;
};

type Coupon = {
    id: string;
    code: string;
    description?: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number | string; // backend may return string for BigDecimal
    newUserOnly?: boolean;
    validFrom?: string;
    validTo?: string;
};

export default function CartPage() {
    // Use cart context for products and totals
    const { items, updateQty, removeItem, clearCart, totalItems, totalPrice } = useCart();
    const navigate = useNavigate();

    const [couponCodeInput, setCouponCodeInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [checkingCoupon, setCheckingCoupon] = useState(false);

    // Payment fields
    const [cardNumber, setCardNumber] = useState("4242424242424242");
    const [cardBrand, setCardBrand] = useState("VISA");
    const [processing, setProcessing] = useState(false);
    const [paymentResult, setPaymentResult] = useState<any>(null);

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

    // Parse discountValue to number safely
    const couponValueNumber = useMemo(() => {
        if (!appliedCoupon) return 0;
        const v = appliedCoupon.discountValue;
        return typeof v === "number" ? v : parseFloat(String(v || "0"));
    }, [appliedCoupon]);

    // Preview discounted total on the client for UX
    const previewTotal = useMemo(() => {
        if (!appliedCoupon) return totalPrice;
        if (appliedCoupon.discountType === "PERCENTAGE") {
            const discount = (totalPrice * (couponValueNumber / 100));
            return Math.max(0, Math.round(totalPrice - discount));
        }
        // FIXED_AMOUNT
        return Math.max(0, Math.round(totalPrice - couponValueNumber));
    }, [appliedCoupon, couponValueNumber, totalPrice]);

    async function handleApplyCoupon() {
        const code = couponCodeInput?.trim();
        if (!code) {
            toast.error("Enter a coupon code");
            return;
        }

        setCheckingCoupon(true);
        try {
            // GET /api/coupons/{code}
            const res = await api.get(`/coupons/${encodeURIComponent(code)}`);
            const coupon: Coupon = res.data;
            setAppliedCoupon(coupon);
            toast.success(`Coupon applied: ${coupon.code}`);
        } catch (err: any) {
            console.error("coupon check", err);
            const message = err?.response?.data?.message || err?.message || "Coupon not valid";
            toast.error(message);
            setAppliedCoupon(null);
        } finally {
            setCheckingCoupon(false);
        }
    }

    function handleRemoveCoupon() {
        setAppliedCoupon(null);
        setCouponCodeInput("");
        toast.success("Coupon removed");
    }

    // This function creates the order first, then processes the payment
    async function handleCreateOrderAndPay() {
        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setProcessing(true);
        try {
            toast.loading("Creating order...");

            const payload: CreateOrderRequest = {
                items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
            };

            // 1) Create order on backend
            const orderRes = await api.post("/orders", payload);
            const order = orderRes?.data;
            if (!order || !order.id) {
                toast.error("Failed to create order");
                setProcessing(false);
                return;
            }
            toast.success("Order created");

            // 2) Encrypt card (demo) and send payment
            toast.loading("Encrypting card and processing payment...");
            const encrypted = await encryptCard(cardNumber);

            const paymentPayload = {
                orderId: order.id,
                cardNumber: encrypted,
                cardBrand,
            };

            const payRes = await api.post(`/payments/process`, paymentPayload);
            setPaymentResult(payRes.data);
            toast.success("Payment processed (demo)");

            // Optionally clear cart and redirect to order details
            clearCart();
            navigate(`/orders/${order.id}`);
        } catch (err: any) {
            console.error("create+pay error", err);
            const message = err?.response?.data?.message || err?.message || "Something went wrong";
            toast.error(message);
        } finally {
            setProcessing(false);
        }
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

                        {/* Coupon input */}
                        <div className="flex flex-col gap-2">
                            {appliedCoupon ? (
                                <div className="p-3 border rounded-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium">Coupon: {appliedCoupon.code}</div>
                                            <div className="text-xs text-gray-400">{appliedCoupon.description}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold">
                                                {appliedCoupon.discountType === "PERCENTAGE"
                                                    ? `-${couponValueNumber}%`
                                                    : `-${formatPrice(couponValueNumber)}`}
                                            </div>
                                            <div className="text-xs text-gray-400">applied</div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="text-sm text-gray-300">New subtotal</div>
                                        <div className="font-semibold">{formatPrice(previewTotal)}</div>
                                    </div>

                                    <div className="mt-2 flex gap-2">
                                        <Button variant="ghost" onClick={handleRemoveCoupon}>
                                            Remove coupon
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 bg-transparent border p-2 rounded-md"
                                        placeholder="Have a discount code?"
                                        value={couponCodeInput}
                                        onChange={(e) => setCouponCodeInput(e.target.value)}
                                    />
                                    <Button onClick={handleApplyCoupon} disabled={checkingCoupon}>
                                        {checkingCoupon ? "Checking..." : "Apply"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Total</span>
                            <span className="font-semibold">{formatPrice(previewTotal)}</span>
                        </div>

                        {/* Payment form inline */}
                        <div className="border-t pt-3">
                            <h4 className="text-sm font-semibold mb-2">Payment (demo)</h4>

                            <label className="flex flex-col gap-1 mb-2">
                                <span className="text-sm text-gray-300">Card number</span>
                                <input
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    className="bg-transparent border p-2 rounded-md"
                                    placeholder="4242 4242 4242 4242"
                                />
                            </label>

                            <label className="flex flex-col gap-1 mb-3">
                                <span className="text-sm text-gray-300">Card brand</span>
                                <select value={cardBrand} onChange={(e) => setCardBrand(e.target.value)} className="bg-transparent border p-2 rounded-md">
                                    <option>VISA</option>
                                    <option>MASTERCARD</option>
                                    <option>AMEX</option>
                                    <option>DISCOVER</option>
                                </select>
                            </label>

                            <div className="flex gap-2">
                                <Button onClick={handleCreateOrderAndPay} disabled={processing}>{processing ? "Processing..." : `Pay ${formatPrice(previewTotal)}`}</Button>
                                <Button variant="outline" onClick={() => navigate("/dashboard")}>Continue shopping</Button>
                            </div>

                            {paymentResult && (
                                <div className="mt-3">
                                    <h5 className="font-semibold">Payment result</h5>
                                    <pre className="text-xs text-gray-300 break-words">{JSON.stringify(paymentResult, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </aside>
        </main>
    );
}
