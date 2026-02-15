/**
 * ScoreCard. Renders scan summary metrics and top blockers.
 */
import type { StoreScoreSummary } from "@/src/core/scoring/scoreStore";

type Props = {
  summary: StoreScoreSummary | null;
  emptyMessage?: string;
};

export default function ScoreCard({ summary, emptyMessage = "No scan results yet. Run Scan." }: Props) {
  if (!summary) {
    return (
      <div className="p-5 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">Summary</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-2xl font-semibold text-gray-900">{summary.avgOverall}</p>
          <p className="text-xs text-gray-500">Avg overall</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-gray-900">{summary.avgCoverage}</p>
          <p className="text-xs text-gray-500">Avg coverage</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-gray-900">{summary.eligibleSearchPct}%</p>
          <p className="text-xs text-gray-500">Eligible search</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-gray-900">{summary.eligibleCheckoutPct}%</p>
          <p className="text-xs text-gray-500">Eligible checkout</p>
        </div>
      </div>
      {summary.topBlockers.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="mb-2 text-xs font-medium text-gray-500">Top blockers</p>
          <div className="flex flex-wrap gap-2">
            {summary.topBlockers.map(({ blocker, count }) => (
              <span
                key={blocker}
                className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"
              >
                {blocker} · {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
