/**
 * ProductTable. Renders product rows with title, scores, eligibility, blockers.
 */
export type ProductRow = {
  id: string;
  title: string | null;
  overall: number;
  coverage: number;
  eligibleSearch: boolean;
  eligibleCheckout: boolean;
  blockers: string[];
};

type Props = {
  rows: ProductRow[];
};

export default function ProductTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/80">
            <th className="px-4 py-3 font-medium text-gray-500">Title</th>
            <th className="px-4 py-3 font-medium text-gray-500">Overall</th>
            <th className="px-4 py-3 font-medium text-gray-500">Coverage</th>
            <th className="px-4 py-3 font-medium text-gray-500">Search</th>
            <th className="px-4 py-3 font-medium text-gray-500">Checkout</th>
            <th className="px-4 py-3 font-medium text-gray-500">Blockers</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No products match.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{r.title || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{r.overall}</td>
                <td className="px-4 py-3 text-gray-600">{r.coverage}</td>
                <td className="px-4 py-3">{r.eligibleSearch ? <span className="text-emerald-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                <td className="px-4 py-3">{r.eligibleCheckout ? <span className="text-emerald-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                <td className="px-4 py-3">
                  {r.blockers.length ? (
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                      {r.blockers.join(", ")}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
