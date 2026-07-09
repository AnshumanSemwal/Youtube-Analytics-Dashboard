"use client";

interface Props {
  lastSyncedAt: Date | null;
}

export default function LastSynced({ lastSyncedAt }: Props) {
  if (!lastSyncedAt) {
    return <span className="text-sm text-gray-400">Never synced</span>;
  }

  const now = new Date();
  const diffMs = now.getTime() - new Date(lastSyncedAt).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  let label: string;
  if (diffMins < 1) label = "Updated just now";
  else if (diffMins < 60) label = `Updated ${diffMins}m ago`;
  else {
    const diffHrs = Math.floor(diffMins / 60);
    label = `Updated ${diffHrs}h ago`;
  }

  return (
    <span className="text-sm text-gray-400" suppressHydrationWarning>
      {label}
    </span>
  );
}