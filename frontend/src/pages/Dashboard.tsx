// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/Dashboard/ProductCard.tsx";
import api from "@/lib/api";

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

    // Defensive price parser because backend may send BigDecimal as string/number
    function parsePrice(raw: any): number {
        if (raw === null || raw === undefined) return 0;
        if (typeof raw === "number") return raw;
        if (typeof raw === "string") {
            const n = parseFloat(raw);
            return Number.isFinite(n) ? n : 0;
        }
        // if backend wraps the value in an object
        if (typeof raw === "object") {
            // common shapes: { amount: 123.45 } or { value: "123.45" }
            if ("amount" in raw && typeof raw.amount === "number") return raw.amount;
            if ("value" in raw) return parseFloat(raw.value as string) || 0;
            if ("longValue" in raw) return Number(raw.longValue) || 0;
            // fallback: try converting to number
            const v = Number(raw);
            return Number.isFinite(v) ? v : 0;
        }
        return 0;
    }

    useEffect(() => {
        let mounted = true;

        async function loadProducts() {
            setLoading(true);
            setError(null);

            try {
                // production call (backend controller mapped to /api/products)
                const res = await api.get("/products");
                // Expecting res.data to be ProductDTO[] per backend: List<ProductDTO>
                const rawList: any[] = res?.data ?? [];

                const normalized: Product[] = rawList.map((raw) => {
                    return {
                        id: raw?.id ? String(raw.id) : raw?.sku ?? Math.random().toString(36).slice(2, 8),
                        name: raw?.name ?? raw?.sku ?? "Unnamed product",
                        description: raw?.description ?? "",
                        price: parsePrice(raw?.price),
                        image:
                            (Array.isArray(raw?.imageUrls) && raw.imageUrls.length > 0 && raw.imageUrls[0]) ||
                            raw?.image ||
                            // fallback placeholder
                            `https://picsum.photos/seed/${encodeURIComponent(raw?.name ?? raw?.sku ?? "product")}/600/400`,
                    };
                });

                if (mounted) setProducts(normalized);
            } catch (err: any) {
                console.error("Failed loading products", err);
                const msg = err?.response?.data?.message || err?.message || "No se pudieron cargar los productos";
                if (mounted) setError(msg);
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
        <main className="max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-black">Dashboard</h2>
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
