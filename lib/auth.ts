import { NextRequest } from "next/server";
import { verifyToken, JwtPayload } from "./jwt";

export async function getAuthUser(req: NextRequest): Promise<JwtPayload | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
