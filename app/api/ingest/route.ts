/**
 * POST /api/ingest — Ingest catalog from a connected store. Body: { storeId: string }.
 */
import { NextRequest, NextResponse } from "next/server";
import { runIngest } from "@/src/server/services/ingestService";

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
    const result = await runIngest(storeId.trim());
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ingest failed";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
