"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  lowStockThreshold: number | null;
}

interface DashboardData {
  totalProducts: number;
  totalQuantity: number;
  lowStock: LowStockProduct[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(async (res) => {
      if (res.status === 401) { router.push("/login"); return; }
      setData(await res.json());
    });
  }, [router]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Products" value={data.totalProducts} />
        <StatCard label="Total Units in Stock" value={data.totalQuantity} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Low Stock Items</h2>
          {data.lowStock.length > 0 && (
            <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
              {data.lowStock.length} item{data.lowStock.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {data.lowStock.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
            No low stock items. You&apos;re all good!
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Qty on Hand</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.lowStock.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <Link href={`/products/${p.id}/edit`} className="text-blue-600 hover:underline font-medium">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-red-600 font-semibold">{p.quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.lowStockThreshold ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}
