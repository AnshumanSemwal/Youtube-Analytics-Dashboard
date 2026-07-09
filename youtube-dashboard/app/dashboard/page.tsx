import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken, TokenRefreshError } from "@/lib/token";
import { getChannelStats } from "@/lib/youtube";
import DashboardShell from "@/components/layout/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import DateRangePicker from "@/components/dashboard/DateRangePicker";
import ViewsChart from "@/components/dashboard/ViewsChart";
import WatchTimeChart from "@/components/dashboard/WatchTimeChart";
import TopVideosChart from "@/components/dashboard/TopVideosChart";
import VideoTable from "@/components/dashboard/VideoTable";
import RefreshButton from "@/components/RefreshButton";
import LastSynced from "@/components/LastSynced";

function fmtDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
  });
  if (!channel) redirect("/connect-channel");

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(session.user.id);
  } catch (error) {
    if (error instanceof TokenRefreshError) redirect("/reconnect");
    throw error;
  }

  let stats;
  try {
    stats = await getChannelStats(accessToken, session.user.id);
  } catch {
    redirect("/reconnect");
  }

  // ── Date range ───────────────────────────────────────────────────────────
  const { days: daysParam } = await searchParams;
  const days = Math.min(Math.max(Number(daysParam ?? 28), 7), 90);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // ── Fetch DailyMetric from DB ────────────────────────────────────────────
  const metrics = await prisma.dailyMetric.findMany({
    where: {
      channelId: channel.id,
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });

  // ── Fetch all videos from DB ─────────────────────────────────────────────
  const videos = await prisma.videoSnapshot.findMany({
    where:   { channelId: channel.id },
    orderBy: { views: "desc" },
  });

  // ── Format data for charts ───────────────────────────────────────────────
  const viewsData = metrics.map((m) => ({
    date:  fmtDate(m.date),
    views: m.views,
  }));

  const watchTimeData = metrics.map((m) => ({
    date:      fmtDate(m.date),
    watchTime: Math.round((m.watchTime / 60) * 10) / 10,
  }));

  // Top 10 for bar chart
  const videoData = videos.slice(0, 10).map((v) => ({
    title: v.title,
    views: v.views,
  }));

  // Serialize all videos for the table (dates must be strings for client components)
  const serializedVideos = videos.map((v) => ({
    id:          v.id,
    videoId:     v.videoId,
    title:       v.title,
    views:       v.views,
    likes:       v.likes,
    comments:    v.comments,
    publishedAt: v.publishedAt.toISOString(),
  }));

  // ── Aggregate stats for cards ────────────────────────────────────────────
  const totalViewsInRange    = metrics.reduce((sum, m) => sum + m.views, 0);
  const totalWatchTimeInRange = metrics.reduce((sum, m) => sum + m.watchTime, 0);
  const watchTimeHours       = Math.round(totalWatchTimeInRange / 60).toLocaleString("en-US");

  // TODO (post-MVP): add subscribersGained to getDailyAnalytics so the
  // Subscribers card shows range-specific growth instead of all-time total.
  // Add impressionClickThroughRate when channel qualifies for Partner Program.

  return (
    <DashboardShell
      channelTitle={channel.title}
      channelThumbnail={channel.thumbnailUrl}
      userImage={session.user?.image ?? null}
      userName={session.user?.name ?? null}
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <RefreshButton />
          <LastSynced lastSyncedAt={channel.lastSyncedAt} />
        </div>
        <DateRangePicker />
      </div>

      {/* Channel name */}
      <h1 className="text-xl font-bold mb-5">{stats!.title}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Views"
          value={totalViewsInRange.toLocaleString("en-US")}
          note={`Last ${days} days`}
        />
        <StatCard
          title="Subscribers"
          value={Number(stats!.subscriberCount).toLocaleString("en-US")}
          note="All-time"
        />
        <StatCard
          title="Watch Time"
          value={`${watchTimeHours}h`}
          note={`Last ${days} days`}
        />
        <StatCard
          title="Total Videos"
          value={Number(stats!.totalVideos).toLocaleString("en-US")}
          note="All-time"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Daily Views — Last {days} days
          </h2>
          <ViewsChart data={viewsData} />
        </div>

        <div className="border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Watch Time (hours) — Last {days} days
          </h2>
          <WatchTimeChart data={watchTimeData} />
        </div>
      </div>

      {/* Top videos bar chart */}
      <div className="border rounded-xl p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Top Videos by Views (all-time)
        </h2>
        <TopVideosChart data={videoData} />
      </div>

      {/* CTR placeholder */}
      <div className="border rounded-xl p-4 bg-gray-50 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">
          Click-Through Rate (CTR)
        </h2>
        <p className="text-sm text-gray-400">
          CTR data is available after joining the YouTube Partner Program.
          This card will populate automatically once your channel qualifies.
        </p>
      </div>

      {/* Video table */}
      <div className="border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          All Videos
        </h2>
        {/* TODO (post-MVP): add per-video watch time and CTR columns
            once YouTube Analytics per-video breakdown is implemented. */}
        <VideoTable videos={serializedVideos} />
      </div>

    </DashboardShell>
  );
}