/**
 * Shopify OAuth: normalize shop domain, build auth URL, verify HMAC, exchange code for token.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const MYSHPOIFY_SUFFIX = ".myshopify.com";

/**
 * Normalize and validate shop domain. Returns lowercase host ending in .myshopify.com or null.
 */
export function normalizeShopDomain(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  let host = trimmed;
  try {
    if (!trimmed.includes(".")) host = `${trimmed}${MYSHPOIFY_SUFFIX}`;
    else if (!host.endsWith(MYSHPOIFY_SUFFIX)) return null;
    // Basic host format: alphanumeric and hyphens
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(host)) return null;
    return host;
  } catch {
    return null;
  }
}

export type BuildAuthUrlOpts = {
  shop: string;
  scopes: string;
  redirectUri: string;
  state: string;
  apiKey: string;
};

/**
 * Build Shopify OAuth authorize URL (Admin API).
 */
export function buildShopifyAuthUrl(opts: BuildAuthUrlOpts): string {
  const { shop, scopes, redirectUri, state, apiKey } = opts;
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
    "grant_options[]": "per-user",
  });
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Verify Shopify callback HMAC. Remove hmac from params, sort by key, build message, HMAC-SHA256 with secret, constant-time compare.
 */
export function verifyShopifyHmac(
  queryParams: Record<string, string>,
  apiSecret: string
): boolean {
  const { hmac, ...rest } = queryParams;
  if (!hmac) return false;
  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");
  const computed = createHmac("sha256", apiSecret).update(message).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(computed, "hex"));
  } catch {
    return false;
  }
}

/**
 * Exchange authorization code for access token via POST to shop admin/oauth/access_token.
 */
export async function exchangeAccessToken(
  shop: string,
  code: string,
  apiKey: string,
  apiSecret: string
): Promise<string> {
  const url = `https://${shop}/admin/oauth/access_token`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify token exchange failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("No access_token in Shopify response");
  return data.access_token;
}
