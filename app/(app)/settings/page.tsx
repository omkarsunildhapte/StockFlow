"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      toast.error(data.error || "Failed to save settings");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventory Defaults</CardTitle>
          <CardDescription>
            Products without an individual threshold will use this value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="defaultThreshold">Default Low Stock Threshold</Label>
              <Input
                id="defaultThreshold"
                type="number"
                min={0}
                required
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-40"
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
