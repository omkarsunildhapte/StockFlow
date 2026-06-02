"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(async (res) => {
      const data = await res.json();
      setThreshold(String(data.defaultLowStockThreshold ?? 5));
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultLowStockThreshold: threshold }),
    });

    setSaving(false);

    if (res.ok) {
      toast.success("Settings saved");
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to save settings");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Inventory Defaults</h2>
        <p className="text-sm text-gray-500 mb-5">
          Products without an individual threshold will use this value.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="defaultThreshold" className="block text-sm font-medium text-gray-700 mb-1">
              Default Low Stock Threshold
            </label>
            <input
              id="defaultThreshold"
              type="number"
              min={0}
              required
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
