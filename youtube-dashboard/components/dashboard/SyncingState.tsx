"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  channelTitle: string;
}

export default function SyncingState({ channelTitle }: Props) {
  const router  = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  async function handleSync() {
    setState("loading");
    setError("");
    try {
      const res  = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sync failed. Try again.");
        setState("idle");
        return;
      }
      setState("done");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setState("idle");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {state === "loading" ? (
        <>
          <Loader2 size={32} className="animate-spin text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Syncing your channel data...
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Fetching your videos and analytics from YouTube.
            This usually takes under a minute.
          </p>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-6">
            <span className="text-white dark:text-black text-2xl font-bold">
              {channelTitle.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Welcome, {channelTitle}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Your channel is connected. Fetch your analytics data to get started.
          </p>
          {error && (
            <p className="text-sm text-red-500 mb-4">{error}</p>
          )}
          <button
            onClick={handleSync}
            className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Fetch my analytics
          </button>
          <p className="text-xs text-muted-foreground mt-3">
            Takes under a minute. Runs automatically every 6 hours after this.
          </p>
        </>
      )}
    </div>
  );
}