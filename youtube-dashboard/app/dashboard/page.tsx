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
import SyncingState from "@/components/dashboard/SyncingState";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:  "Dashboard",
  robots: { index: false },
};

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

  // Fetch all videos
  const videos = await prisma.videoSnapshot.findMany({
    where:   { channelId: channel.id },
    orderBy: { views: "desc" },
  });

  // ── New user: no sync yet ────────────────────────────────────────────────
  if (!channel.lastSyncedAt && videos.length === 0) {
    return (
      <DashboardShell
        channelTitle={channel.title}
        channelThumbnail={channel.thumbnailUrl}
        userImage={session.user?.image ?? null}
        userName={session.user?.name ?? null}
      >
        <SyncingState channelTitle={channel.title} />
      </DashboardShell>
    );
  }

  // ── Date range ───────────────────────────────────────────────────────────
  const { days: daysParam } = await searchParams;
  const days = Math.min(Math.max(Number(daysParam ?? 28), 7), 90);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // ── Fetch metrics from DB ────────────────────────────────────────────────
  const metrics = await prisma.dailyMetric.findMany({
    where:   { channelId: channel.id, date: { gte: startDate } },
    orderBy: { date: "asc" },
  });

  // ── Format for charts ────────────────────────────────────────────────────
  const viewsData     = metrics.map((m) => ({ date: fmtDate(m.date), views: m.views }));
  const watchTimeData = metrics.map((m) => ({
    date:      fmtDate(m.date),
    watchTime: Math.round((m.watchTime / 60) * 10) / 10,
  }));
  const videoData       = videos.slice(0, 10).map((v) => ({ title: v.title, views: v.views }));
  const serializedVideos = videos.map((v) => ({
    id:          v.id,
    videoId:     v.videoId,
    title:       v.title,
    views:       v.views,
    likes:       v.likes,
    comments:    v.comments,
    publishedAt: v.publishedAt.toISOString(),
  }));

  // ── Aggregates for cards ─────────────────────────────────────────────────
  const totalViewsInRange = metrics.reduce((sum, m) => sum + m.views, 0);
  const totalWatchTime    = metrics.reduce((sum, m) => sum + m.watchTime, 0);
  const watchTimeHours    = Math.round(totalWatchTime / 60).toLocaleString("en-US");

  // ── Onboarding state ─────────────────────────────────────────────────────
  const hasSynced  = !!channel.lastSyncedAt;
  const hasVideos  = videos.length > 0;
  const fewVideos  = videos.length > 0 && videos.length < 5;

  return (
    <DashboardShell
      channelTitle={channel.title}
      channelThumbnail={channel.thumbnailUrl}
      userImage={session.user?.image ?? null}
      userName={session.user?.name ?? null}
    >
      {/* Onboarding checklist — hidden when all steps done */}
      <OnboardingChecklist
        hasChannel={true}
        hasSynced={hasSynced}
        hasVideos={hasVideos}
      />

      {/* Few videos note */}
      {fewVideos && (
        <div className="border rounded-xl p-4 mb-6 bg-blue-50 dark:bg-blue-950 dark:border-blue-900 border-blue-200">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">Your channel is just getting started.</span>{" "}
            Charts and analytics will become more meaningful as you publish more
            videos and data accumulates over time.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <RefreshButton />
          <LastSynced lastSyncedAt={channel.lastSyncedAt} />
        </div>
        <DateRangePicker />
      </div>

      {/* Channel name */}
      <h1 className="text-xl font-bold mb-5 text-foreground">{stats!.title}</h1>

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
          title="CTR"
          value="—"
          note="Partner Program required"
          tooltip="Click-through rate (CTR) is the percentage of people who click your video thumbnail after seeing it in YouTube search or browse. A higher CTR means your titles and thumbnails are compelling. Available once your channel joins the YouTube Partner Program."
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-xl p-4 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Daily Views — Last {days} days
          </h2>
          <ViewsChart data={viewsData} />
        </div>
        <div className="border rounded-xl p-4 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Watch Time (hours) — Last {days} days
          </h2>
          <WatchTimeChart data={watchTimeData} />
        </div>
      </div>

      {/* Top videos */}
      <div className="border rounded-xl p-4 mb-6 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Top Videos by Views (all-time)
        </h2>
        <TopVideosChart data={videoData} />
      </div>

      {/* CTR placeholder */}
      <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-900 dark:border-gray-800 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">
          Click-Through Rate (CTR)
        </h2>
        <p className="text-sm text-muted-foreground">
          CTR data is available after joining the YouTube Partner Program.
          This card will populate automatically once your channel qualifies.
        </p>
      </div>

      {/* Video table */}
      <div className="border rounded-xl p-4 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          All Videos
        </h2>
        <VideoTable videos={serializedVideos} />
      </div>

    </DashboardShell>
  );
}