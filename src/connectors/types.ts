/**
 * Connector types. Shared interfaces for platform connectors (Shopify first, future platforms).
 */
// TODO: Define Connection, PlatformType, Credentials, etc.
export type PlatformType = "shopify" | string;
export type Connection = Record<string, unknown>;
