/**
 * Store-level score aggregates. Consumes score rows (e.g. from DB).
 */

export interface ScoreRow {
  overall: number;
  coverage: number;
  consistency: number;
  structure: number;
  eligibleSearch: boolean;
  eligibleCheckout: boolean;
  blockersJson: unknown; // string[] when parsed
}

export interface StoreScoreSummary {
  avgOverall: number;
  avgCoverage: number;
  eligibleSearchPct: number;
  eligibleCheckoutPct: number;
  topBlockers: Array<{ blocker: string; count: number }>;
}

function parseBlockers(blockersJson: unknown): string[] {
  if (Array.isArray(blockersJson)) {
    return blockersJson.filter((x) => typeof x === "string");
  }
  return [];
}

export function aggregateStoreScores(scoreRows: ScoreRow[]): StoreScoreSummary {
  const n = scoreRows.length;
  if (n === 0) {
    return {
      avgOverall: 0,
      avgCoverage: 0,
      eligibleSearchPct: 0,
      eligibleCheckoutPct: 0,
      topBlockers: [],
    };
  }

  let sumOverall = 0;
  let sumCoverage = 0;
  let eligibleSearchCount = 0;
  let eligibleCheckoutCount = 0;
  const blockerCounts: Record<string, number> = {};

  for (const row of scoreRows) {
    sumOverall += Number(row.overall) || 0;
    sumCoverage += Number(row.coverage) || 0;
    if (row.eligibleSearch) eligibleSearchCount += 1;
    if (row.eligibleCheckout) eligibleCheckoutCount += 1;
    const blockers = parseBlockers(row.blockersJson);
    for (const b of blockers) {
      blockerCounts[b] = (blockerCounts[b] ?? 0) + 1;
    }
  }

  const topBlockers = Object.entries(blockerCounts)
    .map(([blocker, count]) => ({ blocker, count }))
    .sort((a, b) => b.count - a.count);

  return {
    avgOverall: Math.round((sumOverall / n) * 10) / 10,
    avgCoverage: Math.round((sumCoverage / n) * 10) / 10,
    eligibleSearchPct: Math.round((eligibleSearchCount / n) * 1000) / 10,
    eligibleCheckoutPct: Math.round((eligibleCheckoutCount / n) * 1000) / 10,
    topBlockers,
  };
}
