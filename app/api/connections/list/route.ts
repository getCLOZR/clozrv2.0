/**
 * GET /api/connections/list — Returns connected stores (shop domain, createdAt) for the connections page.
 */
import { NextResponse } from "next/server";
import { db } from "@/src/db";

export async function GET() {
  const stores = await db.store.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, platform: true, shop: true, createdAt: true },
  });
  return NextResponse.json({ stores });
}
