import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import DateRangePicker from "@/components/dashboard/DateRangePicker";
import ViewsChart from "@/components/dashboard/ViewsChart";
import WatchTimeChart from "@/components/dashboard/WatchTimeChart";
import TopVideosChart from "@/components/dashboard/TopVideosChart";
import VideoTable from "@/components/dashboard/VideoTable";
import { MOCK_CHANNEL, MOCK_VIDEOS, getMockMetrics } from "@/lib/mock-data";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title:       "Live Demo",
  description: "See YouTube Analytics Dashboard in action with sample K-drama channel data. No sign-in required.",
  alternates:  { canonical: `${SITE_URL}/demo` },
  openGraph: {
    title:       "Live Demo — YT Analytics",
    description: "See the dashboard in action with sample data. No sign-in required.",
    url:         `${SITE_URL}/demo`,
  },
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const days = Math.min(Math.max(Number(daysParam ?? 28), 7), 90);

  const metrics     = getMockMetrics(days);
  const viewsData   = metrics.map((m) => ({ date: m.date, views: m.views }));
  const watchData   = metrics.map((m) => ({ date: m.date, watchTime: m.watchTime }));

  const totalViews     = metrics.reduce((sum, m) => sum + m.views, 0);
  const totalWatchTime = metrics.reduce((sum, m) => sum + m.watchTime, 0);
  const watchTimeHours = Math.round(totalWatchTime).toLocaleString("en-US");

  const videoData = MOCK_VIDEOS.slice(0, 10).map((v) => ({
    title: v.title,
    views: v.views,
  }));

  const serializedVideos = MOCK_VIDEOS.map((v) => ({
    id:          v.id,
    videoId:     v.videoId,
    title:       v.title,
    views:       v.views,
    likes:       v.likes,
    comments:    v.comments,
    publishedAt: new Date(v.publishedAt).toISOString(),
  }));

  return (
    <div>
      {/* Demo banner */}
      <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-6 py-3 flex items-center justify-between gap-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <span className="font-semibold">Demo mode</span> — this is sample data.
          Sign in with Google to see your real channel analytics.
        </p>
        <Link
          href="/login"
          className="shrink-0 text-sm px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          Sign in free
        </Link>
      </div>

      <DashboardShell
        channelTitle={MOCK_CHANNEL.title}
        channelThumbnail={null}
        userImage={null}
        userName={MOCK_CHANNEL.title}
      >
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-sm text-muted-foreground">
            Sample data for a K-drama YouTube channel
          </p>
          <DateRangePicker />
        </div>

        {/* Channel name */}
        <h1 className="text-xl font-bold mb-5 text-foreground">
          {MOCK_CHANNEL.title}
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Views"
            value={totalViews.toLocaleString("en-US")}
            note={`Last ${days} days`}
          />
          <StatCard
            title="Subscribers"
            value={Number(MOCK_CHANNEL.subscriberCount).toLocaleString("en-US")}
            note="All-time"
          />
          <StatCard
            title="Watch Time"
            value={`${watchTimeHours}h`}
            note={`Last ${days} days`}
          />
          <StatCard
            title="Total Videos"
            value={MOCK_CHANNEL.totalVideos}
            note="All-time"
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
            <WatchTimeChart data={watchData} />
          </div>
        </div>

        {/* Top videos bar chart */}
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
          </p>
        </div>

        {/* Video table — no thumbnails in demo */}
        <div className="border rounded-xl p-4 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            All Videos
          </h2>
          <VideoTable videos={serializedVideos} showThumbnails={false} />
        </div>

      </DashboardShell>
    </div>
  );
}