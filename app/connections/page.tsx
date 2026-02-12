/**
 * Connections page. Connect new Shopify store (OAuth start) and list connected stores from DB.
 */
import { db } from "@/src/db";
import { ConnectShopifyForm } from "./ConnectShopifyForm";

type Props = {
  searchParams: Promise<{ connected?: string; error?: string }>;
};

export default async function ConnectionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const connected = params.connected === "1";
  const error = params.error;

  const stores = await db.store.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, platform: true, shop: true, createdAt: true },
  });

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Connections</h1>

      {connected && (
        <p className="rounded bg-green-50 text-green-800 px-3 py-2 text-sm">
          Store connected successfully.
        </p>
      )}
      {error && (
        <p className="rounded bg-red-50 text-red-800 px-3 py-2 text-sm">
          Connection failed: {error}
        </p>
      )}

      <section>
        <h2 className="text-lg font-medium mb-2">Connect Shopify</h2>
        <ConnectShopifyForm />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Connected stores</h2>
        {stores.length === 0 ? (
          <p className="text-gray-500 text-sm">No stores connected yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded border border-gray-200">
            {stores.map((s) => (
              <li
                key={s.id}
                className="flex justify-between items-center px-3 py-2 text-sm"
              >
                <span className="font-medium">{s.shop}</span>
                <span className="text-gray-500">
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
