"use client";

export default function SyncButton() {
  return (
    <button
      onClick={() =>
        fetch("/api/sync", { method: "POST" })
          .then((r) => r.json())
          .then(console.log)
      }
      className="mt-8 bg-black text-white px-4 py-2 rounded"
    >
      Sync Data
    </button>
  );
}