/**
 * Shopify OAuth. Build auth URLs and exchange code for access token.
 */
// TODO: getAuthorizationUrl, exchangeCodeForToken
export function getAuthorizationUrl(_shop: string): string {
  return "";
}
export async function exchangeCodeForToken(
  _shop: string,
  _code: string
): Promise<{ accessToken: string }> {
  return { accessToken: "" };
}
