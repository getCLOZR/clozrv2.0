/**
 * Ingest products from a connected store. Triggered after connect or on-demand sync.
 */
import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Validate storeId, call ingestService, return sync status
  return NextResponse.json({ todo: "ingest" });
}
