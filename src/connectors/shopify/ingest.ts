/**
 * Shopify ingest. Fetch all products (variants + images), normalize to CPS for DB.
 */
import type { CpsProduct } from "@/src/core/schema/cps";

const LIMIT = 250;

/** Strip HTML tags to plain text. */
function stripHtml(html: string | null | undefined): string | null {
  if (html == null || html === "") return null;
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim() || null;
}

/** Shopify REST product (from list). Exported for raw storage. */
export interface ShopifyProductRaw {
  id: number;
  title: string | null;
  body_html: string | null;
  handle: string | null;
  vendor: string | null;
  status: string | null;
  variants?: Array<{
    id: number;
    sku: string | null;
    price: string | null;
    inventory_quantity: number | null;
    option1: string | null;
    option2: string | null;
    option3: string | null;
  }>;
  images?: Array<{ src?: string; id?: number }>;
}

interface ProductsResponse {
  products: ShopifyProductRaw[];
}

/** Build options array from variant option1/2/3. */
function variantOptions(v: ShopifyProductRaw["variants"][0]): string[] {
  const opts: string[] = [];
  if (v.option1) opts.push(v.option1);
  if (v.option2) opts.push(v.option2);
  if (v.option3) opts.push(v.option3);
  return opts;
}

/** Map one Shopify product to CPS. */
function toCpsProduct(p: ShopifyProductRaw): CpsProduct {
  return {
    id: String(p.id),
    title: p.title ?? null,
    descriptionText: stripHtml(p.body_html),
    imageUrls: (p.images ?? []).map((img) => img.src ?? "").filter(Boolean),
    variants: (p.variants ?? []).map((v) => ({
      id: String(v.id),
      sku: v.sku ?? null,
      price: v.price ?? null,
      inventory_quantity: v.inventory_quantity ?? null,
      options: variantOptions(v),
    })),
  };
}

/** Fetch all products with pagination (Link header). */
async function fetchAllProducts(
  shop: string,
  accessToken: string
): Promise<ShopifyProductRaw[]> {
  const all: ShopifyProductRaw[] = [];
  let pageInfo: string | null = null;

  const base = `https://${shop}/admin/api/2024-01`;
  const getUrl = () =>
    pageInfo
      ? `${base}/products.json?limit=${LIMIT}&page_info=${pageInfo}`
      : `${base}/products.json?limit=${LIMIT}`;

  for (;;) {
    const url = getUrl();
    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Shopify API ${res.status}: ${text.slice(0, 500)}`);
    }
    const data = JSON.parse(text || "{}") as ProductsResponse;
    const products = data.products ?? [];
    all.push(...products);

    const link = res.headers.get("link");
    const nextMatch = link?.match(/<[^>]*[?&]page_info=([^>&\s]+)>;\s*rel="next"/);
    pageInfo = nextMatch ? decodeURIComponent(nextMatch[1]) : null;
    if (!pageInfo || products.length < LIMIT) break;
  }

  return all;
}

/** Result per product: CPS for scoring, raw for DB (handle, vendor, status, rawJson). */
export interface IngestProductResult {
  cps: CpsProduct;
  raw: ShopifyProductRaw;
}

/**
 * Fetch all products with variants and images (paginate limit=250), return CPS + raw per product.
 */
export async function ingestProducts(
  shop: string,
  accessToken: string
): Promise<IngestProductResult[]> {
  const products = await fetchAllProducts(shop, accessToken);
  return products.map((p) => ({ cps: toCpsProduct(p), raw: p }));
}
