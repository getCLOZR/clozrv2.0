"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RunScanButton({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRunScan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleRunScan}
        disabled={loading}
        className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Running…" : "Run Scan"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
