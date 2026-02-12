/**
 * Lists connected stores for the current user. Shopify-first, extensible for other platforms.
 */
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch connections from DB, return list
  return NextResponse.json({ todo: "list connections" });
}
