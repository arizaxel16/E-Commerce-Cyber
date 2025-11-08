import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";

export default function CreateProduct(): JSX.Element {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState<string>("");
    const [stock, setStock] = useState<number | "">(0);
    const [images, setImages] = useState<File[]>([]);
    const [isPrimaryIndex, setIsPrimaryIndex] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    // client-side limits
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;
        const arr: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (!f.type.startsWith("image/")) {
                toast.error(`Skipped ${f.name}: not an image`);
                continue;
            }
            if (f.size > MAX_FILE_SIZE) {
                toast.error(`Skipped ${f.name}: file exceeds 5MB`);
                continue;
            }
            arr.push(f);
        }
        if (arr.length === 0) return;
        setImages(arr);
        setIsPrimaryIndex(0);
    }

    async function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        if (!name.trim()) return toast.error("Name is required");
        const parsedPrice = parseFloat(price.toString().replace(/,/g, "."));
        if (!parsedPrice || parsedPrice <= 0) return toast.error("Enter a valid price > 0");
        if (stock === "" || stock < 0) return toast.error("Enter a valid stock (0 or greater)");

        setSubmitting(true);
        try {
            // 1) create product
            const payload = {
                name: name.trim(),
                description: description.trim() || undefined,
                price: parsedPrice,
                stock: Number(stock),
            };

            const prodRes = await api.post("/products", payload);
            const created = prodRes?.data;
            if (!created || !created.id) {
                throw new Error("Product creation failed");
            }
            toast.success("Product created");

            // 2) upload images (if any)
            if (images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const file = images[i];
                    const form = new FormData();
                    // API expects productId and file as request params/multipart
                    form.append("productId", created.id);
                    form.append("file", file, file.name);
                    // mark primary for the chosen index
                    const primary = i === isPrimaryIndex;
                    form.append("isPrimary", String(primary));

                    await api.post("/product-images/upload", form, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                }
                toast.success("Images uploaded");
            }

            // done
            toast.success("Product created successfully");
            navigate("/dashboard");
        } catch (err: any) {
            console.error("create product failed", err);
            const message = err?.response?.data?.message || err?.message || "Failed to create product";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Create product</h2>

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="flex flex-col gap-1">
                            <span className="text-sm text-gray-300">Name *</span>
                            <input value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent border p-2 rounded-md" />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-sm text-gray-300">Description</span>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-transparent border p-2 rounded-md" rows={4} />
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-gray-300">Price (COP) *</span>
                                <input value={price} onChange={(e) => setPrice(e.target.value)} className="bg-transparent border p-2 rounded-md" placeholder="e.g. 120000" />
                            </label>

                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-gray-300">Stock *</span>
                                <input type="number" min={0} value={stock as any} onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))} className="bg-transparent border p-2 rounded-md" />
                            </label>
                        </div>

                        <label className="flex flex-col gap-1">
                            <span className="text-sm text-gray-300">Images (optional, max 5MB each)</span>
                            <input type="file" accept="image/*" multiple onChange={handleFiles} />
                        </label>

                        {images.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <div className="text-sm text-gray-300">Selected images:</div>
                                <div className="flex gap-2 flex-wrap">
                                    {images.map((f, idx) => (
                                        <div key={idx} className="border rounded-md p-2 text-xs">
                                            <div className="font-medium">{f.name}</div>
                                            <div className="text-xs text-gray-400">{Math.round(f.size / 1024)} KB</div>
                                            <div className="mt-1">
                                                <label className="text-xs">
                                                    <input type="radio" name="primary" checked={isPrimaryIndex === idx} onChange={() => setIsPrimaryIndex(idx)} /> Primary
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create product"}</Button>
                            <Button variant="outline" onClick={() => navigate("/dashboard")}>Cancel</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
