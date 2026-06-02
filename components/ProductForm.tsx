"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    sku: string;
    description: string;
    quantity: number;
    costPrice: string;
    sellingPrice: string;
    lowStockThreshold: string;
  };
  mode: "create" | "edit";
}

const empty = {
  name: "",
  sku: "",
  description: "",
  quantity: 0,
  costPrice: "",
  sellingPrice: "",
  lowStockThreshold: "",
};

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialData ?? empty);
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);

    const url = mode === "edit" ? `/api/products/${initialData?.id}` : "/api/products";
    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      toast.success(mode === "edit" ? "Product updated" : "Product created");
      router.push("/products");
      router.refresh();
    } else {
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      toast.error(data.error || "Something went wrong");
    }
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
              <Input
                id="sku"
                type="text"
                required
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Qty on Hand</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={form.costPrice}
                onChange={(e) => set("costPrice", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <Input
                id="sellingPrice"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={form.sellingPrice}
                onChange={(e) => set("sellingPrice", e.target.value)}
              />
            </div>
          </div>

          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="lowStockThreshold">
              Low Stock Threshold{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="lowStockThreshold"
              type="number"
              min={0}
              placeholder="Uses org default if blank"
              value={form.lowStockThreshold}
              onChange={(e) => set("lowStockThreshold", e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : mode === "edit" ? "Save changes" : "Create product"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
