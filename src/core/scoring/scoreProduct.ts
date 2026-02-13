/**
 * Rule-based product scoring. Deterministic, explainable scores from CPS.
 */
import type { CpsProduct, CpsVariant } from "@/src/core/schema/cps";

export interface ScoreResult {
  coverage: number;
  consistency: number;
  structure: number;
  overall: number;
  blockers: string[];
  warnings: string[];
  signals: Record<string, unknown>;
}

function validPrice(v: CpsVariant): boolean {
  if (v.price == null) return false;
  const n = Number(v.price);
  return !Number.isNaN(n) && n > 0;
}

export function scoreProduct(cps: CpsProduct): ScoreResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const signals: Record<string, unknown> = {};

  let coverage = 0;
  // Coverage (0-100): 5 x 20
  const titleOk = typeof cps.title === "string" && cps.title.length >= 5;
  if (titleOk) coverage += 20;
  else blockers.push("missing_title");

  const descLen = typeof cps.descriptionText === "string" ? cps.descriptionText.length : 0;
  if (descLen >= 50) coverage += 20;
  else blockers.push("missing_description");

  const imageCount = Array.isArray(cps.imageUrls) ? cps.imageUrls.length : 0;
  if (imageCount >= 1) coverage += 20;
  else blockers.push("missing_images");

  const variants = Array.isArray(cps.variants) ? cps.variants : [];
  if (variants.length >= 1) coverage += 20;
  else blockers.push("missing_variants");

  const allPricesValid = variants.length > 0 && variants.every(validPrice);
  if (allPricesValid) coverage += 20;
  else if (variants.length >= 1) blockers.push("missing_variant_price");

  let consistency = 0;
  // Consistency (0-100): 4 x 25
  const hasNegativeInv = variants.some(
    (v) => v.inventory_quantity != null && Number(v.inventory_quantity) < 0
  );
  if (!hasNegativeInv) consistency += 25;
  else blockers.push("negative_inventory");

  const optionKeys = variants.map((v) => (v.options ?? []).join("|")).filter(Boolean);
  const uniqueKeys = new Set(optionKeys);
  if (optionKeys.length === uniqueKeys.size) consistency += 25;
  else warnings.push("duplicate_variant_options");

  const allHaveOptions = variants.length === 0 || variants.every((v) => Array.isArray(v.options) && v.options.length > 0);
  if (allHaveOptions) consistency += 25;
  else if (variants.length >= 1) blockers.push("missing_variant_options");

  const hasNaNPrice = variants.some((v) => v.price != null && Number.isNaN(Number(v.price)));
  if (!hasNaNPrice) consistency += 25;
  else blockers.push("invalid_price");

  let structure = 0;
  // Structure (0-100): 40 + 30 + 30
  if (descLen >= 150) structure += 40;
  else if (descLen > 0) warnings.push("short_description");

  if (imageCount >= 2) structure += 30;
  else if (imageCount === 1) warnings.push("only_one_image");

  const atLeastOneSku = variants.some((v) => v.sku != null && String(v.sku).trim() !== "");
  if (atLeastOneSku) structure += 30;
  else if (variants.length >= 1) warnings.push("missing_sku");

  const overall = Math.round(coverage * 0.5 + consistency * 0.3 + structure * 0.2);
  signals.coverage = coverage;
  signals.consistency = consistency;
  signals.structure = structure;
  signals.variantCount = variants.length;
  signals.imageCount = imageCount;

  return {
    coverage,
    consistency,
    structure,
    overall: Math.min(100, Math.max(0, overall)),
    blockers,
    warnings,
    signals,
  };
}
