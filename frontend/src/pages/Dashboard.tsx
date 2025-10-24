// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard page
 *
 * Production API call (example) -- keep commented until backend is ready:
 *
 * // import api from '@/lib/api'
 * // const res = await api.get('/products')
 * // // then setProducts(res.data)
 *
 * For now this component uses a local mock that returns demo products.
 */

type Product = {
    id: string;
    name: string;
    description: string;
    price: number; // raw amount in COP
    image: string;
};

export default function Dashboard() {
    const [products, setProducts] = useState<Product[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function wait(ms = 300) {
        return new Promise((r) => setTimeout(r, ms));
    }

    useEffect(() => {
        let mounted = true;

        async function loadProducts() {
            setLoading(true);
            setError(null);

            try {
                // ---------- Production call (commented) ----------
                // import api from '@/lib/api'
                // const res = await api.get('/products');
                // if (res?.data) setProducts(res.data)
                // ---------- End production call ----------

                // ---------- Local mock ----------
                await wait(400);
                const demo: Product[] = [
                    {
                        id: "p1",
                        name: "Arepa de Queso",
                        description: "Arepa tradicional con abundante queso costeño fundido. Crujiente por fuera, suave por dentro.",
                        price: 2500,
                        image: "https://picsum.photos/seed/arepa-queso/600/400",
                    },
                    {
                        id: "p2",
                        name: "Arepa Reina Pepiada",
                        description: "Arepa rellena de pollo, aguacate y aliños. Sabor cremoso y delicioso.",
                        price: 4200,
                        image: "https://picsum.photos/seed/arepa-pollo/600/400",
                    },
                    {
                        id: "p3",
                        name: "Arepa de Huevo",
                        description: "Clásica arepa costeña con huevo frito en su interior. Un bocado lleno de nostalgia.",
                        price: 3000,
                        image: "https://picsum.photos/seed/arepa-huevo/600/400",
                    },
                    {
                        id: "p4",
                        name: "Arepa Dulce",
                        description: "Arepa con un toque de azúcar y canela, acompañamiento perfecto para el café.",
                        price: 2000,
                        image: "https://picsum.photos/seed/arepa-dulce/600/400",
                    },
                ];
                if (mounted) setProducts(demo);
                // ---------- End mock ----------
            } catch (err) {
                if (mounted) setError("No se pudieron cargar los productos");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadProducts();

        return () => {
            mounted = false;
        };
    }, []);

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

    return (
        <main className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">Listado de productos disponibles</p>
            </div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardContent>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {error && <div className="text-red-400 mb-4">{error}</div>}

            {!loading && products && (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} formatPrice={formatPrice} />
                    ))}
                </section>
            )}
        </main>
    );
}

function ProductCard({ product, formatPrice }: { product: Product; formatPrice: (n: number) => string }) {
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
                <div className="mt-2">
                    {/* Example CTA — keep UI-only for now. */}
                    <Button size="sm" onClick={() => alert(`Simulated add to cart: ${product.name}`)}>
                        Add to cart
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
