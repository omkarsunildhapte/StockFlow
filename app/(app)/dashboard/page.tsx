"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Layers, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
      <div className="space-y-8">
        <Skeleton className="h-8 w-36" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your inventory at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <div className="bg-primary/10 p-2 rounded-lg">
              <Package size={16} className="text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{data.totalProducts.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">unique SKUs tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Units in Stock</CardTitle>
            <div className="bg-primary/10 p-2 rounded-lg">
              <Layers size={16} className="text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{data.totalQuantity.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">across all products</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Items</h2>
            {data.lowStock.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {data.lowStock.length} item{data.lowStock.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <Link href="/products" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}>
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {data.lowStock.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
              <CheckCircle2 size={36} className="text-green-500" />
              <p className="font-medium text-gray-700">No low stock items</p>
              <p className="text-sm text-muted-foreground">All products are well stocked</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-4 py-2.5 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" />
              <p className="text-xs font-medium text-red-700">
                {data.lowStock.length} product{data.lowStock.length !== 1 ? "s are" : " is"} below the low stock threshold
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty on Hand</TableHead>
                  <TableHead className="text-right">Threshold</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lowStock.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/products/${p.id}/edit`} className="text-primary hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-red-600">{p.quantity}</span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.lowStockThreshold ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/products/${p.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                        Restock
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
