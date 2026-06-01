"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  sellingPrice: number | null;
  lowStockThreshold: number | null;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = useCallback(async (q: string) => {
    const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
    if (res.status === 401) { router.push("/login"); return; }
    setProducts(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchProducts(search);
  }, [search, fetchProducts]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Add Product
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by name or SKU…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm mb-3">No products found.</p>
          <Link href="/products/new" className="text-blue-600 text-sm hover:underline">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Quantity</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => {
                const isLow = p.lowStockThreshold !== null && p.quantity <= p.lowStockThreshold;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{p.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {p.sellingPrice != null ? `$${p.sellingPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLow ? (
                        <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${p.id}/edit`}
                          className="text-blue-600 hover:underline text-xs font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-40"
                        >
                          {deleting === p.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
