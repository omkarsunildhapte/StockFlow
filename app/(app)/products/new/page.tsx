import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
      <ProductForm mode="create" />
    </div>
  );
}
