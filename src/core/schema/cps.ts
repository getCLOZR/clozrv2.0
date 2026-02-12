/**
 * Canonical product schema (CPS). Platform-agnostic product/variant shape for scoring and engine.
 */
// TODO: Define CPS types (id, title, description, variants, etc.)
export type CpsProduct = Record<string, unknown>;
export type CpsVariant = Record<string, unknown>;
