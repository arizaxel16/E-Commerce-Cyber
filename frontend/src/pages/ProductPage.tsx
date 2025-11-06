// src/pages/ProductPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ProductComment, { type CommentShape } from "@/components/ProductPage/ProductComment";
import type { Product } from "@/lib/types";
import { useAuth } from "@/components/Auth/AuthContext";
import { toast } from "sonner";
import { useCart } from "@/components/Cart/CartContext";
import { Minus, Plus } from "lucide-react";

/**
 * ProductPage
 *
 * (Omitted comments for brevity)
 */

function wait(ms = 350) {
    return new Promise((r) => setTimeout(r, ms));
}

const COMMENTS_STORAGE_PREFIX = "product_comments_";

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const productId = id ?? "p1";
    const { user } = useAuth();
    const { addItem } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [comments, setComments] = useState<CommentShape[]>([]);
    const [posting, setPosting] = useState(false);
    const [newText, setNewText] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadProductAndComments() {
            // ---------- Local mock ----------
            await wait(250);
            if (!mounted) return;

            const demo: Product = {
                id: productId,
                name: "Arepa de Queso (demo)",
                description:
                    "Arepa tradicional rellena con queso costeño. Crujiente por fuera y suave por dentro. Servida caliente.",
                price: 2500,
                image: `https://picsum.photos/seed/product-${productId}/900/600`,
            };
            setProduct(demo);

            try {
                const raw = localStorage.getItem(COMMENTS_STORAGE_PREFIX + productId);
                if (raw) {
                    setComments(JSON.parse(raw) as CommentShape[]);
                } else {
                    const seed: CommentShape[] = [
                        {
                            id: `c-${Math.random().toString(36).slice(2, 8)}`,
                            authorName: "María",
                            authorEmail: "maria@example.com",
                            text: "Deliciosa! Recomendada con queso extra.",
                            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
                        },
                        {
                            id: `c-${Math.random().toString(36).slice(2, 8)}`,
                            authorName: "Carlos",
                            authorEmail: "carlos@example.com",
                            text: "Me recordó a la arepa de mi abuela. Excelente textura.",
                            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                        },
                    ];
                    setComments(seed);
                    localStorage.setItem(COMMENTS_STORAGE_PREFIX + productId, JSON.stringify(seed));
                }
            } catch (e) {
                setComments([]);
            }
            // ---------- End mock ----------
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
            await wait(250);
            addItem(product, quantity);
            toast.success(`${quantity} x ${product.name} added to cart!`);
        } catch (err) {
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

    async function handlePostComment() {
        const trimmed = newText.trim();
        if (!trimmed) {
            toast.error("Comment cannot be empty");
            return;
        }
        setPosting(true);

        try {
            await wait(250);
            const now = new Date().toISOString();
            const c: CommentShape = {
                id: `c-${Math.random().toString(36).slice(2, 9)}`,
                authorName: user?.email?.split("@")[0] || user?.email || "You",
                authorEmail: user?.email || null,
                text: trimmed,
                createdAt: now,
            };
            const next = [c, ...comments];
            setComments(next);
            localStorage.setItem(COMMENTS_STORAGE_PREFIX + productId, JSON.stringify(next));
            setNewText("");
            toast.success("Comment posted (demo)");
        } catch (err) {
            toast.error("Could not post comment");
        } finally {
            setPosting(false);
        }
    }

    async function handleDeleteComment(commentId: string) {
        const keep = comments.filter((c) => c.id !== commentId);
        setComments(keep);
        localStorage.setItem(COMMENTS_STORAGE_PREFIX + productId, JSON.stringify(keep));
        toast.success("Comment removed (demo)");
    }

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

    if (!product) {
        return (
            <main className="max-w-5xl mx-auto p-6">
                <div>Loading product...</div>
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

                            <div className="mt-4 flex flex-col gap-2">
                                {/* QUANTITY CONTROLS */}
                                <div className="flex items-center justify-center gap-4 border rounded-md p-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        aria-label="decrease quantity"
                                        onClick={handleDecrementQty}
                                        disabled={quantity <= 1 || addingToCart}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <div className="w-8 text-center font-medium">{quantity}</div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        aria-label="increase quantity"
                                        onClick={handleIncrementQty}
                                        disabled={addingToCart}
                                    >
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
                        <Textarea
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            // placeholder={user ? "Write your comment..." : "Sign in to write a comment (demo)"}
                            rows={3}
                            className="text-black" // Shadcn Textarea handles most styling, just ensure text color is right for your theme
                            // disabled={posting || !user}
                        />
                        <div className="mt-3 flex gap-2 justify-end">
                            <Button
                                onClick={handlePostComment}
                                // disabled={posting || !user}
                            >
                                {posting ? "Posting..." : "Post comment"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                    {sortedComments.map((c) => (
                        <ProductComment key={c.id} comment={c} onDelete={handleDeleteComment} />
                    ))}

                    {sortedComments.length === 0 && <div className="text-sm text-gray-400">No comments yet — be the first!</div>}
                </div>
            </section>
        </main>
    );
}