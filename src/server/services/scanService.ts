/**
 * Scan service. Load products, run scoring + eligibility, upsert Score, return summary.
 */
import { db } from "@/src/db";
import type { CpsProduct } from "@/src/core/schema/cps";
import { parseJson } from "@/src/core/utils/parseJson";
import { scoreProduct } from "@/src/core/scoring/scoreProduct";
import { recommendEligibility } from "@/src/core/scoring/eligibility";
import {
  aggregateStoreScores,
  type ScoreRow,
  type StoreScoreSummary,
} from "@/src/core/scoring/scoreStore";

export interface ScanResult {
  scanned: number;
  summary: StoreScoreSummary;
}

function parseNormalizedJson(raw: unknown): CpsProduct {
  if (raw == null) throw new Error("Product has no normalizedJson");
  const str = typeof raw === "string" ? raw : JSON.stringify(raw);
  const parsed = parseJson<CpsProduct>(str);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("normalizedJson is not an object");
  }
  return parsed;
}

export async function runScan(storeId: string): Promise<ScanResult> {
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Store not found");

  const products = await db.product.findMany({
    where: { storeId },
    select: { id: true, normalizedJson: true },
  });

  const scoreRows: ScoreRow[] = [];

  for (const product of products) {
    let cps: CpsProduct;
    try {
      cps = parseNormalizedJson(product.normalizedJson);
    } catch {
      continue;
    }

    const scoreResult = scoreProduct(cps);
    const eligibilityResult = recommendEligibility(cps, scoreResult);

    const data = {
      storeId,
      productId: product.id,
      value: scoreResult.overall,
      overall: scoreResult.overall,
      coverage: scoreResult.coverage,
      consistency: scoreResult.consistency,
      structure: scoreResult.structure,
      eligibleSearch: eligibilityResult.recommended_is_eligible_search,
      eligibleCheckout: eligibilityResult.recommended_is_eligible_checkout,
      blockersJson: scoreResult.blockers,
      warningsJson: scoreResult.warnings,
      reasonsJson: eligibilityResult.reasons,
      signalsJson: scoreResult.signals,
    };

    const existing = await db.score.findFirst({
      where: { productId: product.id },
    });
    if (existing) {
      await db.score.update({ where: { id: existing.id }, data });
    } else {
      await db.score.create({ data });
    }

    scoreRows.push({
      overall: scoreResult.overall,
      coverage: scoreResult.coverage,
      consistency: scoreResult.consistency,
      structure: scoreResult.structure,
      eligibleSearch: eligibilityResult.recommended_is_eligible_search,
      eligibleCheckout: eligibilityResult.recommended_is_eligible_checkout,
      blockersJson: scoreResult.blockers,
    });
  }

  const summary = aggregateStoreScores(scoreRows);

  return {
    scanned: products.length,
    summary,
  };
}
