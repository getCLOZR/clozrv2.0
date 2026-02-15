/**
 * Products list for a store: table with scores and blockers, filters via query params.
 */
import Link from "next/link";
import { db } from "@/src/db";
import ProductTable, { type ProductRow } from "@/components/ProductTable";

/** All blocker codes from scoring (used for filter buttons). */
const ALL_BLOCKERS = [
  "missing_title",
  "missing_description",
  "missing_images",
  "missing_variants",
  "missing_variant_price",
  "negative_inventory",
  "missing_variant_options",
  "invalid_price",
] as const;

type Props = {
  searchParams: Promise<{ storeId?: string; onlyBlockers?: string; blocker?: string }>;
};

function parseBlockers(blockersJson: unknown): string[] {
  if (Array.isArray(blockersJson)) return blockersJson.filter((x) => typeof x === "string");
  return [];
}

export default async function DashboardProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const storeId = params.storeId ?? "";
  const onlyBlockers = params.onlyBlockers === "1";
  const blockerFilter = (params.blocker ?? "").trim().toLowerCase();

  if (!storeId) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-gray-500">Select a store from the dashboard.</p>
            <Link href="/dashboard" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
              ← Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { shop: true },
  });
  if (!store) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-gray-500">Store not found.</p>
            <Link href="/dashboard" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
              ← Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const products = await db.product.findMany({
    where: { storeId },
    select: {
      id: true,
      title: true,
      scores: {
        take: 1,
        orderBy: { updatedAt: "desc" },
        select: {
          overall: true,
          coverage: true,
          eligibleSearch: true,
          eligibleCheckout: true,
          blockersJson: true,
        },
      },
    },
    orderBy: { title: "asc" },
  });

  const rows: ProductRow[] = products.map((p) => {
    const score = p.scores[0];
    const blockers = score ? parseBlockers(score.blockersJson) : [];
    return {
      id: p.id,
      title: p.title ?? null,
      overall: score?.overall ?? 0,
      coverage: score?.coverage ?? 0,
      eligibleSearch: score?.eligibleSearch ?? false,
      eligibleCheckout: score?.eligibleCheckout ?? false,
      blockers,
    };
  });

  const filtered = rows.filter((r) => {
    if (onlyBlockers && r.blockers.length === 0) return false;
    if (blockerFilter && !r.blockers.some((b) => b.toLowerCase().includes(blockerFilter)))
      return false;
    return true;
  });

  const baseUrl = `/dashboard/products?storeId=${storeId}`;
  const activeBlocker = (params.blocker ?? "").trim();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Products — {store.shop}</h1>
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">
            ← Dashboard
          </Link>
        </div>

        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Filters</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={baseUrl}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${!activeBlocker && !onlyBlockers ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              All
            </Link>
            <Link
              href={`${baseUrl}&onlyBlockers=1`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${onlyBlockers && !activeBlocker ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Only with blockers
            </Link>
            {ALL_BLOCKERS.map((blocker) => {
              const isActive = activeBlocker === blocker;
              return (
                <Link
                  key={blocker}
                  href={`${baseUrl}&blocker=${encodeURIComponent(blocker)}`}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {blocker}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <ProductTable rows={filtered} />
        </div>
      </div>
    </main>
  );
}
