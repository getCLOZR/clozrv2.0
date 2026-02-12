/**
 * GET /api/connections/shopify/callback — Shopify OAuth callback: verify state & HMAC, exchange code, upsert store, redirect to /connections.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyShopifyHmac,
  exchangeAccessToken,
  normalizeShopDomain,
} from "@/src/connectors/shopify/oauth";
import { db } from "@/src/db";

const STATE_COOKIE = "shopify_oauth_state";

function redirect(url: URL, path: string) {
  return NextResponse.redirect(new URL(path, url.origin));
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const searchParams = url.searchParams;

  try {
    const shop = searchParams.get("shop");
    const code = searchParams.get("code");
    const hmac = searchParams.get("hmac");
    const state = searchParams.get("state");

    if (!shop || !code || !hmac || !state) {
      return redirect(url, "/connections?error=missing_params");
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get(STATE_COOKIE)?.value;
    if (!storedState || storedState !== state) {
      return redirect(url, "/connections?error=invalid_state");
    }

    const apiSecret = process.env.SHOPIFY_API_SECRET;
    const apiKey = process.env.SHOPIFY_API_KEY;
    if (!apiSecret || !apiKey) {
      return redirect(url, "/connections?error=server_config");
    }

    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    if (!verifyShopifyHmac(queryParams, apiSecret)) {
      return redirect(url, "/connections?error=invalid_hmac");
    }

    const shopDomain = normalizeShopDomain(shop);
    if (!shopDomain) {
      return redirect(url, "/connections?error=invalid_shop");
    }

    let accessToken: string;
    try {
      accessToken = await exchangeAccessToken(
        shopDomain,
        code,
        apiKey,
        apiSecret
      );
    } catch (e) {
      console.error("Shopify token exchange failed:", e);
      return redirect(url, "/connections?error=token_exchange");
    }

    await db.store.upsert({
      where: {
        platform_shop: { platform: "shopify", shop: shopDomain },
      },
      create: {
        platform: "shopify",
        shop: shopDomain,
        accessToken,
        installedAt: new Date(),
      },
      update: {
        accessToken,
      },
    });

    cookieStore.delete(STATE_COOKIE);
    return redirect(url, "/connections?connected=1");
  } catch (e) {
    console.error("Shopify callback error:", e);
    return redirect(url, "/connections?error=server_error");
  }
}
