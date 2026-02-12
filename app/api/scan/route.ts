/**
 * Scan products for scoring and eligibility. Runs scoring pipeline on stored products.
 */
import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Validate storeId, call scanService, return scan result
  return NextResponse.json({ todo: "scan" });
}
