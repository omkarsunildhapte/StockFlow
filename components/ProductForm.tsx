"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
      const data = await res.json();
      toast.error(data.error || "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            id="sku"
            type="text"
            required
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Qty on Hand</label>
          <input
            id="quantity"
            type="number"
            min={0}
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
          <input
            id="costPrice"
            type="number"
            min={0}
            step="0.01"
            value={form.costPrice}
            onChange={(e) => set("costPrice", e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
          <input
            id="sellingPrice"
            type="number"
            min={0}
            step="0.01"
            value={form.sellingPrice}
            onChange={(e) => set("sellingPrice", e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="max-w-xs">
        <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
          Low Stock Threshold
          <span className="ml-1 text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="lowStockThreshold"
          type="number"
          min={0}
          value={form.lowStockThreshold}
          onChange={(e) => set("lowStockThreshold", e.target.value)}
          placeholder="Uses org default if blank"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Saving…" : mode === "edit" ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
