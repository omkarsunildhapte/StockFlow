import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/products" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-3">
          <ChevronLeft size={15} /> Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
        <p className="text-sm text-muted-foreground mt-1">Fill in the details to add a new product to your inventory</p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
