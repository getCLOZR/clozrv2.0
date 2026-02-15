/**
 * Dashboard: store selector, Run Ingest / Run Scan, scan summary.
 */
import Link from "next/link";
import { db } from "@/src/db";
import { aggregateStoreScores } from "@/src/core/scoring/scoreStore";
import ScoreCard from "@/components/ScoreCard";
import DashboardActions from "@/components/DashboardActions";

type Props = {
  searchParams: Promise<{ storeId?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const stores = await db.store.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, shop: true },
  });
  const storeId =
    params.storeId && stores.some((s) => s.id === params.storeId)
      ? params.storeId
      : stores[0]?.id ?? null;
  const selectedStore = stores.find((s) => s.id === storeId);

  let summary: ReturnType<typeof aggregateStoreScores> | null = null;
  if (selectedStore) {
    const scoreRows = await db.score.findMany({
      where: { storeId: selectedStore.id },
      select: {
        overall: true,
        coverage: true,
        consistency: true,
        structure: true,
        eligibleSearch: true,
        eligibleCheckout: true,
        blockersJson: true,
      },
    });
    if (scoreRows.length > 0) {
      summary = aggregateStoreScores(scoreRows);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

        {stores.length === 0 ? (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
            No stores connected. Connect one from{" "}
            <a href="/connections" className="text-indigo-600 hover:underline">Connections</a>.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Store</p>
              <div className="flex flex-wrap gap-2">
                {stores.map((s) => (
                  <Link
                    key={s.id}
                    href={s.id === storeId ? "/dashboard" : `/dashboard?storeId=${s.id}`}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      s.id === storeId
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {s.shop}
                  </Link>
                ))}
              </div>
            </div>

            {selectedStore && (
              <>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</p>
                  <DashboardActions storeId={selectedStore.id} />
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <ScoreCard summary={summary} />
                </div>

                <Link
                  href={`/dashboard/products?storeId=${selectedStore.id}`}
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  View Products →
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
