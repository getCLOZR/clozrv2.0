/**
 * GET /api/connections/shopify/start?shop=... — Start Shopify OAuth: validate shop, set state cookie, redirect to Shopify consent.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  normalizeShopDomain,
  buildShopifyAuthUrl,
} from "@/src/connectors/shopify/oauth";

const STATE_COOKIE = "shopify_oauth_state";
const STATE_MAX_AGE = 60 * 10; // 10 minutes

export async function GET(request: NextRequest) {
  const shopParam = request.nextUrl.searchParams.get("shop");
  if (!shopParam) {
    return NextResponse.json(
      { error: "Missing shop query parameter" },
      { status: 400 }
    );
  }

  const shop = normalizeShopDomain(shopParam);
  if (!shop) {
    return NextResponse.json(
      { error: "Invalid shop domain; must end with .myshopify.com" },
      { status: 400 }
    );
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const scopes = process.env.SHOPIFY_SCOPES ?? "read_products,write_products";
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (!apiKey) {
    return NextResponse.json(
      { error: "SHOPIFY_API_KEY not configured" },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: STATE_MAX_AGE,
    path: "/",
  });

  const redirectUri = `${appUrl}/api/connections/shopify/callback`;
  const authUrl = buildShopifyAuthUrl({
    shop,
    scopes,
    redirectUri,
    state,
    apiKey,
  });

  return NextResponse.redirect(authUrl);
}
