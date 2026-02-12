"use client";

/**
 * Form: shop domain input + "Connect Shopify" button. Navigates to OAuth start with shop param.
 */
import { useState } from "react";

export function ConnectShopifyForm() {
  const [shop, setShop] = useState("");

  function handleConnect() {
    const trimmed = shop.trim();
    if (!trimmed) return;
    const url = `/api/connections/shopify/start?shop=${encodeURIComponent(
      trimmed.includes(".myshopify.com") ? trimmed : `${trimmed}.myshopify.com`
    )}`;
    window.location.href = url;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        placeholder="mystore or mystore.myshopify.com"
        value={shop}
        onChange={(e) => setShop(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleConnect()}
        className="rounded border border-gray-300 px-3 py-2 text-sm min-w-[200px]"
      />
      <button
        type="button"
        onClick={handleConnect}
        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Connect Shopify
      </button>
    </div>
  );
}
