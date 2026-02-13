/**
 * POST /api/scan — Run scoring + eligibility for a store. Body: { storeId: string }.
 */
import { NextRequest, NextResponse } from "next/server";
import { runScan } from "@/src/server/services/scanService";

export async function POST(request: NextRequest) {
  let body: { storeId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const storeId = body?.storeId;
  if (typeof storeId !== "string" || !storeId.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid storeId" },
      { status: 400 }
    );
  }

  try {
    const result = await runScan(storeId.trim());
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Scan failed";
    const status = message === "Store not found" ? 400 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
