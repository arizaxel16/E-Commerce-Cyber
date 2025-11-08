// src/pages/ProductPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ProductComment, { type CommentShape } from "@/components/ProductPage/ProductComment";
// 7. ¡IMPORT CORREGIDO! Apunta al context correcto
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useCart } from "@/components/Cart/CartContext";
import { Minus, Plus } from "lucide-react";
import api from "@/lib/api";

function wait(ms = 350) {
    return new Promise((r) => setTimeout(r, ms));
}

const COMMENTS_STORAGE_PREFIX = "product_comments_";

type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stock?: number;
    sku?: string;
    totalComments?: number;
    averageRating?: number | null;
};

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const productId = id ?? "";
    const { user } = useAuth();
    const { addItem } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [comments, setComments] = useState<CommentShape[]>([]);
    const [posting, setPosting] = useState(false);
    const [newText, setNewText] = useState("");
    const [rating, setRating] = useState<number>(5); // NEW: rating 1..5
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // whether we successfully loaded comments from backend; if false we use localStorage demo
    const [usingBackendComments, setUsingBackendComments] = useState<boolean | null>(null);

    function parsePrice(raw: any): number {
        if (raw === null || raw === undefined) return 0;
        if (typeof raw === "number") return raw;
        if (typeof raw === "string") {
            const n = parseFloat(raw);
            return Number.isFinite(n) ? n : 0;
        }
        if (typeof raw === "object") {
            if ("amount" in raw && typeof raw.amount === "number") return raw.amount;
            if ("value" in raw) return parseFloat(raw.value as string) || 0;
            const coerced = Number(raw);
            return Number.isFinite(coerced) ? coerced : 0;
        }
        return 0;
    }

    useEffect(() => {
        let mounted = true;

        async function loadProductAndComments() {
            setLoading(true);
            setError(null);

            try {
                if (!productId) throw new Error("No product id provided");

                const res = await api.get(`/products/${productId}`);
                const raw = res?.data;

                const mapped: Product = {
                    id: raw?.id ? String(raw.id) : productId,
                    name: raw?.name ?? raw?.sku ?? "Unnamed product",
                    description: raw?.description ?? "",
                    price: parsePrice(raw?.price),
                    image:
                        (Array.isArray(raw?.imageUrls) && raw.imageUrls.length > 0 && raw.imageUrls[0]) ||
                        raw?.image ||
                        `https://picsum.photos/seed/product-${encodeURIComponent(String(raw?.id ?? raw?.sku ?? productId))}/900/600`,
                    stock: typeof raw?.stock === "number" ? raw.stock : undefined,
                    sku: raw?.sku,
                    totalComments: typeof raw?.totalComments === "number" ? raw.totalComments : undefined,
                    averageRating: raw?.averageRating ?? null,
                };

                if (!mounted) return;
                setProduct(mapped);
            } catch (err: any) {
                console.error("Failed fetching product", err);
                const status = err?.response?.status;
                if (status === 404) {
                    setError("Producto no encontrado");
                } else {
                    const msg = err?.response?.data?.message || err?.message || "Error al cargar el producto";
                    setError(msg);
                }
            } finally {
                if (mounted) setLoading(false);
            }

            // Load comments from backend, fallback to localStorage demo
            try {
                const resComments = await api.get(`/api/comments/product/${productId}`);
                const rawList: any[] = resComments?.data ?? [];

                // Map backend CommentDTO -> CommentShape
                const mappedComments: CommentShape[] = rawList.map((c: any) => ({
                    id: c?.id ? String(c.id) : `c-${Math.random().toString(36).slice(2, 8)}`,
                    authorName: c?.userFullName ?? `User`,
                    authorEmail: null,
                    text: c?.content ?? "",
                    rating: typeof c?.rating === "number" ? c.rating : typeof c?.rating === "string" ? Number(c.rating) : undefined,
                    createdAt: c?.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
                }));

                if (!mounted) return;
                setComments(mappedComments);
                setUsingBackendComments(true);
            } catch (err) {
                console.warn("Comments backend unavailable, falling back to local demo:", err);
                try {
                    const raw = localStorage.getItem(COMMENTS_STORAGE_PREFIX + productId);
                    if (raw) {
                        setComments(JSON.parse(raw) as CommentShape[]);
                    }
                } catch (e) {
                    setComments([]);
                }
                setUsingBackendComments(false);
            }
        }

        loadProductAndComments();

        return () => {
            mounted = false;
        };
    }, [productId]);

    const handleDecrementQty = () => setQuantity((q) => Math.max(1, q - 1));
    const handleIncrementQty = () => setQuantity((q) => q + 1);

    async function handleAddToCart() {
        if (!product) return;
        setAddingToCart(true);
        try {
            await wait(200);
            addItem(product, quantity);
            toast.success(`${quantity} x ${product.name} added to cart!`);
        } catch (err) {
            console.error("Add to cart error", err);
            toast.error("Could not add to cart");
        } finally {
            setAddingToCart(false);
            setQuantity(1);
        }
    }

    const commentCount = comments.length;

    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [comments]);

    // POST new comment to backend if available; otherwise update localStorage (demo)
    async function handlePostComment() {
        const trimmed = newText.trim();
        if (!trimmed) {
            toast.error("Comment cannot be empty");
            return;
        }
        if (!user) {
            toast.error("Please sign in to post a comment");
            return;
        }
        if (rating < 1 || rating > 5) {
            toast.error("Please select a rating between 1 and 5");
            return;
        }

        setPosting(true);

        try {
            if (usingBackendComments === false) {
                // offline/demo flow -> store locally (store rating too)
                await wait(250);
                const now = new Date().toISOString();
                const c: CommentShape = {
                    id: `c-${Math.random().toString(36).slice(2, 9)}`,
                    authorName: user?.email?.split("@")[0] || user?.email || "You",
                    authorEmail: user?.email || null,
                    text: trimmed,
                    rating,
                    createdAt: now,
                };
                const next = [c, ...comments];
                setComments(next);
                localStorage.setItem(COMMENTS_STORAGE_PREFIX + productId, JSON.stringify(next));
                setNewText("");
                toast.success("Comment posted (demo)");
            } else {
                // backend flow -> POST to API using CommentRequest shape
                // CommentRequest: { productId: UUID, content: string, rating: Short }
                const payload = {
                    productId,
                    content: trimmed,
                    rating: rating,
                };
                const res = await api.post("/api/comments", payload);
                const saved = res?.data;
                const mapped: CommentShape = {
                    id: saved?.id ? String(saved.id) : `c-${Math.random().toString(36).slice(2, 9)}`,
                    authorName: saved?.userFullName ?? user?.email?.split?.("@")?.[0] ?? "You",
                    authorEmail: null,
                    text: saved?.content ?? trimmed,
                    rating: typeof saved?.rating === "number" ? saved.rating : typeof saved?.rating === "string" ? Number(saved.rating) : undefined,
                    createdAt: saved?.createdAt ? new Date(saved.createdAt).toISOString() : new Date().toISOString(),
                };
                setComments((prev) => [mapped, ...prev]);
                setNewText("");
                toast.success("Comment posted");
            }
        } catch (err: any) {
            console.error("Post comment error", err);
            const msg = err?.response?.data?.message || err?.message || "Could not post comment";
            toast.error(msg);
        } finally {
            setPosting(false);
        }
    }

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

    if (loading) {
        return (
            <main className="max-w-5xl mx-auto p-6">
                <div>Loading product...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="max-w-5xl mx-auto p-6">
                <div className="text-red-400 mb-4">{error}</div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="max-w-5xl mx-auto p-6">
                <div>Producto no encontrado</div>
            </main>
        );
    }

    return (
        <main className="max-w-5xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: image */}
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <img src={product.image} alt={product.name} className="object-cover w-full h-[420px]" />
                        <CardContent className="p-6">
                            <h1 className="text-2xl font-bold">{product.name}</h1>
                            <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: summary */}
                <aside>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-lg font-semibold">{formatPrice(product.price)}</div>
                                <div className="text-sm text-gray-400">COP</div>
                            </div>

                            {typeof product.stock === "number" && <div className="mt-2 text-sm text-gray-300">Stock: {product.stock}</div>}

                            <div className="mt-4 flex flex-col gap-2">
                                {/* QUANTITY CONTROLS */}
                                <div className="flex items-center justify-center gap-4 border rounded-md p-1">
                                    <Button variant="outline" size="icon" aria-label="decrease quantity" onClick={handleDecrementQty} disabled={quantity <= 1 || addingToCart}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <div className="w-8 text-center font-medium">{quantity}</div>
                                    <Button variant="outline" size="icon" aria-label="increase quantity" onClick={handleIncrementQty} disabled={addingToCart}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* ADD TO CART BUTTON */}
                                <Button onClick={handleAddToCart} disabled={addingToCart}>
                                    {addingToCart ? "Adding..." : "Add to cart"}
                                </Button>

                                <Button variant="outline" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
                                    View comments ({commentCount})
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </div>

            {/* Comments section */}
            <section className="mt-8">
                <h2 className="text-xl font-semibold text-white">Comments</h2>
                <p className="text-sm text-gray-400 mb-4">Share your experience with this product.</p>

                <Card className="mb-4">
                    <CardContent className="p-6">
                        <div className="space-y-3">
                            <Textarea value={newText} onChange={(e) => setNewText(e.target.value)} rows={3} className="text-black" />
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Rating</label>
                                    <select
                                        value={rating}
                                        onChange={(e) => setRating(Number(e.target.value))}
                                        className="rounded border px-2 py-1 text-black"
                                        aria-label="Select rating"
                                    >
                                        <option value={5}>5</option>
                                        <option value={4}>4</option>
                                        <option value={3}>3</option>
                                        <option value={2}>2</option>
                                        <option value={1}>1</option>
                                    </select>
                                </div>

                                <div>
                                    <Button onClick={handlePostComment} disabled={posting || !user}>
                                        {posting ? "Posting..." : user ? "Post comment" : "Sign in to post"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                    {sortedComments.map((c) => (
                        <ProductComment key={c.id} comment={c} />
                    ))}

                    {sortedComments.length === 0 && <div className="text-sm text-gray-400">No comments yet — be the first!</div>}
                </div>
            </section>
        </main>
    );
}
