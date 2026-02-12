/**
 * Shopify ingest. Fetch products from store API and normalize to CPS for DB.
 */
// TODO: Fetch all products (paginated), normalize, return list for DB upsert
export async function ingestProducts(
  _accessToken: string,
  _shop: string
): Promise<unknown[]> {
  return [];
}
