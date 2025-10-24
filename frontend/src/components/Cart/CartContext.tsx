// src/components/Cart/CartContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "@/lib/types";

const CART_STORAGE_KEY = "cart_v1";

export type CartItem = {
    product: Product;
    qty: number;
};

export interface CartContextValue {
    items: CartItem[];
    addItem: (product: Product, qty?: number) => void;
    removeItem: (productId: string) => void;
    updateQty: (productId: string, qty: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const raw = localStorage.getItem(CART_STORAGE_KEY);
            return raw ? (JSON.parse(raw) as CartItem[]) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {}
    }, [items]);

    function addItem(product: Product, qty = 1) {
        setItems((prev) => {
            const idx = prev.findIndex((p) => p.product.id === product.id);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], qty: next[idx].qty + qty };
                return next;
            }
            return [...prev, { product, qty }];
        });
    }

    function removeItem(productId: string) {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
    }

    function updateQty(productId: string, qty: number) {
        if (qty <= 0) {
            removeItem(productId);
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.product.id === productId ? { ...i, qty } : i))
        );
    }

    function clearCart() {
        setItems([]);
    }

    const totalItems = useMemo(() => items.reduce((s, it) => s + it.qty, 0), [items]);
    const totalPrice = useMemo(
        () => items.reduce((s, it) => s + it.qty * (it.product.price ?? 0), 0),
        [items]
    );

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}
