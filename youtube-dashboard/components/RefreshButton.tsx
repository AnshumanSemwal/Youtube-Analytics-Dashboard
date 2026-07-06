"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "limited">("idle");
  const [message, setMessage] = useState("");

  async function handleRefresh() {
    setState("loading");
    setMessage("");

    const res = await fetch("/api/sync", { method: "POST" });
    const data = await res.json();

    if (res.status === 429) {
      setState("limited");
      const next = new Date(data.nextSyncAt);
      setMessage(`Next refresh available at ${next.toLocaleTimeString()}`);
      return;
    }

    if (!res.ok) {
      setState("idle");
      setMessage("Sync failed. Try again.");
      return;
    }

    setState("done");
    setMessage(`Synced ${data.synced.videos} videos, ${data.synced.dailyMetrics} days of data.`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={state === "loading"}
        className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "Syncing..." : "Refresh data"}
      </button>
      {message && (
        <span className={`text-sm ${state === "limited" ? "text-amber-600" : "text-gray-500"}`}>
          {message}
        </span>
      )}
    </div>
  );
}