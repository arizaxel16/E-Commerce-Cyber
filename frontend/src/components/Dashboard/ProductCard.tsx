// Ruta: src/components/Dashboard/ProductCard.tsx (COMPLETO Y FUSIONADO)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// 'Product' aquí es tu tipo local del Dashboard, ¡que ya tiene la URL completa!
type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string; // <-- Esta es la URL completa que viene del Dashboard
};
import { useCart } from "@/components/Cart/CartContext";
import { toast } from "sonner";

// --- TU LÓGICA (INTACTA) ---
const PLACEHOLDER = (seed = "product") => `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/400`;

export default function ProductCard({
    product,
    formatPrice,
}: {
    product: Product;
    formatPrice: (n: number) => string;
}) {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const [qty, setQty] = useState<number>(1);
    const [adding, setAdding] = useState(false);

    // --- TU LÓGICA (INTACTA) ---
    // (product.image ya es la URL completa, así que resolveImage funcionará)
    const [imgSrc, setImgSrc] = useState<string>(() => resolveImage(product?.image, product?.name));

    // --- TU LÓGICA (INTACTA) ---
    function resolveImage(image: any, seed?: string) {
        if (!image) return PLACEHOLDER(seed || "product");
        if (typeof image === "string") return image;
        if (Array.isArray(image) && image.length > 0) return image[0];
        if (typeof image === "object") {
            if (image.url) return image.url;
            if (image.src) return image.src;
            if (Array.isArray(image.imageUrls) && image.imageUrls.length > 0) return image.imageUrls[0];
        }
        return PLACEHOLDER(seed || "product");
    }

    // --- TU LÓGICA (INTACTA) ---
    function dec(e?: React.MouseEvent) {
        e?.stopPropagation();
        setQty((q) => Math.max(1, q - 1));
    }
    function inc(e?: React.MouseEvent) {
        e?.stopPropagation();
        setQty((q) => q + 1);
    }
    async function handleAddToCart(e?: React.MouseEvent) {
        e?.stopPropagation();
        setAdding(true);
        try {
            await new Promise((r) => setTimeout(r, 200));
            // @ts-ignore
            addItem(product, qty);
        } catch (err) {
            try {
                // @ts-ignore
                addItem({ product, qty });
            } catch (e2) {
                toast.error("Could not add to cart");
            }
        } finally {
            setAdding(false);
            setQty(1);
        }
    }
    function handleCardClick() {
        navigate(`/product/${product.id}`);
    }

    // --- TU JSX (CON EL <img> AÑADIDO) ---
    return (
        <Card
            className="flex flex-col overflow-hidden pt-0 cursor-pointer"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter") handleCardClick();
            }}
        >
            {/* --- ¡BLOQUE DE IMAGEN AÑADIDO! --- */}
            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={imgSrc}
                    alt={product.name}
                    className="object-cover w-full h-full"
                    // Fallback por si la URL real falla
                    onError={() => setImgSrc(PLACEHOLDER(product.name))}
                />
            </div>
            {/* --- FIN DEL BLOQUE DE IMAGEN --- */}

            <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <div className="text-sm font-medium text-green-400">{formatPrice(product.price)}</div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>

                <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-2 border rounded-md p-1" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            f aria-label="decrease qty"
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
                            T               >
                            +
                        </button>
                    </div>

                    <Button size="sm" onClick={handleAddToCart} disabled={adding} onMouseDown={(e) => e.stopPropagation()}>
                        {adding ? "Adding..." : "Add to cart"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}