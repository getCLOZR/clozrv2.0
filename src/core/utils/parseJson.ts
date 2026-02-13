/**
 * Safely parse JSON; throws on invalid input.
 */
export function parseJson<T = unknown>(raw: string): T {
  try {
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch (e) {
    throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
}
