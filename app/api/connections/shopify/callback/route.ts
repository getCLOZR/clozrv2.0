/**
 * Shopify OAuth callback. Exchanges code for token, stores connection, redirects to dashboard.
 */
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Exchange code, save store/credentials, redirect
  return NextResponse.json({ todo: "shopify oauth callback" });
}
