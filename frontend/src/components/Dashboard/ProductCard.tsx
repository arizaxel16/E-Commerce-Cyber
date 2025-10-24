// src/components/Product/ProductCard.tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/Cart/CartContext";
import { toast } from "sonner";

export default function ProductCard({
                                        product,
                                        formatPrice,
                                    }: {
    product: Product;
    formatPrice: (n: number) => string;
}) {
    const { addItem } = useCart();
    const [qty, setQty] = useState<number>(1);
    const [adding, setAdding] = useState(false);

    function dec() {
        setQty((q) => Math.max(1, q - 1));
    }
    function inc() {
        setQty((q) => q + 1);
    }

    async function handleAddToCart() {
        setAdding(true);
        try {
            // Simulate small delay if desired for UI feel
            await new Promise((r) => setTimeout(r, 200));
            addItem(product, qty);
            toast.success(`${qty} x ${product.name} added to cart`);
        } catch (err) {
            toast.error("Could not add to cart");
        } finally {
            setAdding(false);
            setQty(1); // optional: reset qty after add
        }
    }

    return (
        <Card className="flex flex-col overflow-hidden pt-0">
            <div className="relative h-48 w-full overflow-hidden">
                <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
            </div>

            <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <div className="text-sm font-medium text-green-400">{formatPrice(product.price)}</div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>

                <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-2 border rounded-md p-1">
                        <button
                            type="button"
                            aria-label="decrease qty"
                            onClick={dec}
                            className="px-2 py-1 rounded-md hover:bg-white/5"
                        >
                            -
                        </button>
                        <div className="w-10 text-center font-medium">{qty}</div>
                        <button
                            type="button"
                            aria-label="increase qty"
                            onClick={inc}
                            className="px-2 py-1 rounded-md hover:bg-white/5"
                        >
                            +
                        </button>
                    </div>

                    <Button size="sm" onClick={handleAddToCart} disabled={adding}>
                        {adding ? "Adding..." : "Add to cart"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
