/**
 * Canonical product schema (CPS). Platform-agnostic product/variant shape for scoring and engine.
 */

export interface CpsVariant {
  id: string;
  sku: string | null;
  price: string | null;
  inventory_quantity: number | null;
  options: string[];
}

export interface CpsProduct {
  id: string;
  title: string | null;
  descriptionText: string | null;
  imageUrls: string[];
  variants: CpsVariant[];
}
