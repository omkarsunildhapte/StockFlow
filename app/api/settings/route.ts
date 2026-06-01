import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const settings = await prisma.orgSettings.findUnique({
    where: { organizationId: user.orgId },
  });

  return Response.json(settings ?? { defaultLowStockThreshold: 5 });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { defaultLowStockThreshold } = await req.json();

  const settings = await prisma.orgSettings.upsert({
    where: { organizationId: user.orgId },
    update: { defaultLowStockThreshold: parseInt(defaultLowStockThreshold) },
    create: {
      organizationId: user.orgId,
      defaultLowStockThreshold: parseInt(defaultLowStockThreshold),
    },
  });

  return Response.json(settings);
}
