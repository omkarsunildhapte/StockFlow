import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  const settings = await prisma.orgSettings.findUnique({
    where: { organizationId: user.orgId },
  });
  const globalThreshold = settings?.defaultLowStockThreshold ?? 5;

  const products = await prisma.product.findMany({
    where: { organizationId: user.orgId },
  });

  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStock = products.filter((p) => {
    const threshold = p.lowStockThreshold ?? globalThreshold;
    return p.quantity <= threshold;
  });

  return Response.json({ totalProducts, totalQuantity, lowStock });
}
