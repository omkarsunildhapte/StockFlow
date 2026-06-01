import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { email, password, orgName } = await req.json();

  if (!email || !password || !orgName) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const org = await prisma.organization.create({
    data: {
      name: orgName,
      settings: { create: { defaultLowStockThreshold: 5 } },
    },
  });

  const user = await prisma.user.create({
    data: { email, passwordHash, organizationId: org.id },
  });

  const token = await signToken({ userId: user.id, orgId: org.id, email: user.email });

  const res = Response.json({ ok: true });
  const headers = new Headers(res.headers);
  headers.set(
    "Set-Cookie",
    `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`
  );
  return new Response(res.body, { status: 200, headers });
}
