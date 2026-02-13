/**
 * Eligibility recommendations from CPS and score result. Rule-based.
 */
import type { CpsProduct } from "@/src/core/schema/cps";
import type { ScoreResult } from "./scoreProduct";

export interface EligibilityResult {
  recommended_is_eligible_search: boolean;
  recommended_is_eligible_checkout: boolean;
  reasons: string[];
}

const SEARCH_BLOCKERS = [
  "missing_title",
  "missing_images",
  "missing_variants",
  "missing_variant_price",
];
const CHECKOUT_BLOCKERS = [
  "invalid_price",
  "missing_variant_options",
  "negative_inventory",
];

export function recommendEligibility(
  cps: CpsProduct,
  scoreResult: ScoreResult
): EligibilityResult {
  const reasons: string[] = [];
  const blockers = scoreResult.blockers ?? [];
  const variants = Array.isArray(cps.variants) ? cps.variants : [];

  const searchBlockedBy = blockers.filter((b) => SEARCH_BLOCKERS.includes(b));
  const recommended_is_eligible_search =
    searchBlockedBy.length === 0;
  if (searchBlockedBy.length > 0) {
    reasons.push(`Search ineligible: ${searchBlockedBy.join(", ")}`);
  } else {
    reasons.push("Search eligible: no search blockers");
  }

  const checkoutBlockedBy = blockers.filter((b) => CHECKOUT_BLOCKERS.includes(b));
  let recommended_is_eligible_checkout =
    recommended_is_eligible_search && checkoutBlockedBy.length === 0;

  const atLeastOneSellable = variants.some(
    (v) =>
      (v.inventory_quantity == null || Number(v.inventory_quantity) >= 0) &&
      v.price != null &&
      Number(v.price) > 0 &&
      !Number.isNaN(Number(v.price))
  );
  if (!atLeastOneSellable && variants.length > 0) {
    recommended_is_eligible_checkout = false;
    reasons.push("Checkout ineligible: no variant with inventory >= 0 and price > 0");
  }
  if (checkoutBlockedBy.length > 0) {
    reasons.push(`Checkout ineligible: ${checkoutBlockedBy.join(", ")}`);
  }
  if (recommended_is_eligible_checkout) {
    reasons.push("Checkout eligible: no checkout blockers and at least one sellable variant");
  }

  return {
    recommended_is_eligible_search,
    recommended_is_eligible_checkout,
    reasons,
  };
}
