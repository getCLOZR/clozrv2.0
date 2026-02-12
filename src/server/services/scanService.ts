/**
 * Scan service. Runs scoring and eligibility on store products, persists scores.
 */
// TODO: Load products, score each, filter by eligibility, save scores
export async function runScan(_storeId: string): Promise<{ scanned: number }> {
  return { scanned: 0 };
}
