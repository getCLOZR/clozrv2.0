/**
 * Ingest service. Orchestrates connector ingest + DB upsert for a store.
 */
// TODO: Load store credentials, call connector ingest, normalize, upsert products
export async function runIngest(_storeId: string): Promise<{ count: number }> {
  return { count: 0 };
}
