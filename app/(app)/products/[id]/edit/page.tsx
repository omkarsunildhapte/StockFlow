"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="space-y-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-96 w-full max-w-xl rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/products" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-3">
          <ChevronLeft size={15} /> Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-muted-foreground mt-1">Update details for <span className="font-medium text-foreground">{product.name}</span></p>
      </div>
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
