"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<null | {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    quantity: number;
    costPrice: number | null;
    sellingPrice: number | null;
    lowStockThreshold: number | null;
  }>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`).then(async (res) => {
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 404) { router.push("/products"); return; }
      setProduct(await res.json());
    });
  }, [id, router]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          description: product.description ?? "",
          quantity: product.quantity,
          costPrice: product.costPrice != null ? String(product.costPrice) : "",
          sellingPrice: product.sellingPrice != null ? String(product.sellingPrice) : "",
          lowStockThreshold: product.lowStockThreshold != null ? String(product.lowStockThreshold) : "",
        }}
      />
    </div>
  );
}
