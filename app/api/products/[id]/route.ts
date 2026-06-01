import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/auth";

async function getProduct(id: string, orgId: string) {
  return prisma.product.findFirst({ where: { id, organizationId: orgId } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const product = await getProduct(id, user.orgId);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const product = await getProduct(id, user.orgId);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, sku, description, quantity, costPrice, sellingPrice, lowStockThreshold } = body;

  if (!name || !sku) {
    return Response.json({ error: "Name and SKU are required" }, { status: 400 });
  }

  if (sku !== product.sku) {
    const conflict = await prisma.product.findUnique({
      where: { organizationId_sku: { organizationId: user.orgId, sku } },
    });
    if (conflict) return Response.json({ error: "SKU already in use" }, { status: 409 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name,
      sku,
      description: description || null,
      quantity: quantity !== undefined ? parseInt(quantity) : product.quantity,
      costPrice: costPrice !== undefined ? (costPrice === "" ? null : parseFloat(costPrice)) : product.costPrice,
      sellingPrice: sellingPrice !== undefined ? (sellingPrice === "" ? null : parseFloat(sellingPrice)) : product.sellingPrice,
      lowStockThreshold: lowStockThreshold !== undefined ? (lowStockThreshold === "" ? null : parseInt(lowStockThreshold)) : product.lowStockThreshold,
    },
  });

  return Response.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const product = await getProduct(id, user.orgId);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.product.delete({ where: { id } });
  return Response.json({ ok: true });
}
