"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center max-w-md px-4">
        <h2 className="text-xl font-bold mb-2 dark:text-white">
          Something went wrong
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          We could not load your dashboard data. This is usually a temporary
          issue with the data connection.
        </p>
        <button
          onClick={reset}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}