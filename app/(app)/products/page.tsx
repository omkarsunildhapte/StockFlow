"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, PackageOpen, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

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
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchProducts = useCallback(async (q: string) => {
    const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
    if (res.status === 401) { router.push("/login"); return; }
    setProducts(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchProducts(search); }, [search, fetchProducts]);

  async function handleDelete() {
    if (!confirmTarget) return;
    const { id, name } = confirmTarget;
    setConfirmTarget(null);
    setDeleting(id);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`"${name}" deleted`);
    } else {
      toast.error("Failed to delete product");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/products/new" className={cn(buttonVariants(), "gap-1.5")}>
          <Plus size={15} /> Add Product
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12 ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="bg-muted rounded-full p-4">
              <PackageOpen size={28} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700">No products found</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {search ? "Try a different search term" : "Add your first product to get started"}
              </p>
            </div>
            {!search && (
              <Link href="/products/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5 mt-1")}>
                <Plus size={14} /> Add Product
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const isLow = p.lowStockThreshold !== null && p.quantity <= p.lowStockThreshold;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-gray-900">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {p.sellingPrice != null ? `$${p.sellingPrice.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {isLow
                        ? <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                        : <Badge className="text-xs text-green-700 bg-green-100 hover:bg-green-100 border-green-200">In Stock</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${p.id}/edit`}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={deleting === p.id}
                          onClick={() => setConfirmTarget({ id: p.id, name: p.name })}
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={!!confirmTarget} onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>&ldquo;{confirmTarget?.name}&rdquo;</strong> will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
