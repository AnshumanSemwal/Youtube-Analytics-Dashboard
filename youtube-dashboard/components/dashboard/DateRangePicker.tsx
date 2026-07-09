"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const RANGES = [
  { label: "7 days",  days: 7  },
  { label: "28 days", days: 28 },
  { label: "90 days", days: 90 },
];

export default function DateRangePicker() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const selected     = Number(searchParams.get("days") ?? 28);

  function select(days: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", days.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1">
      {RANGES.map(({ label, days }) => (
        <button
          key={days}
          onClick={() => select(days)}
          className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors
            ${selected === days
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}