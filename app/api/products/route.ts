import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const products = await prisma.product.findMany({
    where: {
      organizationId: user.orgId,
      OR: q
        ? [
            { name: { contains: q } },
            { sku: { contains: q } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(products);
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const { name, sku, description, quantity, costPrice, sellingPrice, lowStockThreshold } = body;

  if (!name || !sku) {
    return Response.json({ error: "Name and SKU are required" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({
    where: { organizationId_sku: { organizationId: user.orgId, sku } },
  });
  if (existing) {
    return Response.json({ error: "SKU already exists in your organization" }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      organizationId: user.orgId,
      name,
      sku,
      description: description || null,
      quantity: quantity ? parseInt(quantity) : 0,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
      lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : null,
    },
  });

  return Response.json(product, { status: 201 });
}
