"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  storeId: string;
};

export default function DashboardActions({ storeId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"ingest" | "scan" | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  async function runAction(
    url: string,
    label: "ingest" | "scan"
  ) {
    setLoading(label);
    setResponse(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      const text = await res.text();
      let data: unknown;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: res.ok ? "Invalid JSON response" : `Status ${res.status}: ${text.slice(0, 200)}` };
      }
      const out = typeof data === "object" && data !== null && "error" in data && !res.ok
        ? { error: (data as { error?: string }).error, status: res.status }
        : data;
      setResponse(JSON.stringify(out, null, 2));
      if (res.ok) router.refresh();
    } catch (e) {
      setResponse(String(e));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => runAction("/api/ingest", "ingest")}
          disabled={!!loading}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {loading === "ingest" ? "Running…" : "Run Ingest"}
        </button>
        <button
          type="button"
          onClick={() => runAction("/api/scan", "scan")}
          disabled={!!loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading === "scan" ? "Running…" : "Run Scan"}
        </button>
      </div>
      {response && (
        <pre className="max-h-32 overflow-auto rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
          {response}
        </pre>
      )}
    </div>
  );
}
