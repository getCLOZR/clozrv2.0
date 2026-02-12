/**
 * Minimal Shopify Admin REST client. Authenticated requests to 2024-01 API.
 */

const API_VERSION = "2024-01";

/**
 * Fetch JSON from Shopify Admin REST API. Base URL https://{shop}/admin/api/2024-01, auth via X-Shopify-Access-Token.
 */
export async function shopifyRestFetch<T>(
  shop: string,
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const base = `https://${shop}/admin/api/${API_VERSION}`;
  const url = path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Shopify API error ${res.status}: ${text.slice(0, 500)}`
    );
  }

  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Shopify API invalid JSON: ${text.slice(0, 200)}`);
  }
}
