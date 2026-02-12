/**
 * Initiates Shopify OAuth flow. Redirects merchant to Shopify consent screen.
 */
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Build Shopify OAuth URL, redirect
  return NextResponse.json({ todo: "shopify oauth start" });
}
