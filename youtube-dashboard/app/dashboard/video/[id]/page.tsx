import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken, TokenRefreshError } from "@/lib/token";
import DashboardShell from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
  });
  if (!channel) redirect("/connect-channel");

  // Security: confirm this video belongs to the user's channel
  const video = await prisma.videoSnapshot.findFirst({
    where: {
      videoId:   id,
      channelId: channel.id,
    },
  });
  if (!video) notFound();

  // Channel average views
  const allVideos = await prisma.videoSnapshot.findMany({
    where: { channelId: channel.id },
  });

  const avgViews = allVideos.length > 0
    ? Math.round(
        allVideos.reduce((sum, v) => sum + v.views, 0) / allVideos.length
      )
    : 0;

  const viewsDelta    = avgViews > 0
    ? Math.round(((video.views - avgViews) / avgViews) * 100)
    : 0;
  const isAboveAverage = viewsDelta >= 0;

  try {
    await getValidAccessToken(session.user.id);
  } catch (error) {
    if (error instanceof TokenRefreshError) redirect("/reconnect");
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  const studioUrl  = `https://studio.youtube.com/video/${video.videoId}/analytics`;

  return (
    <DashboardShell
      channelTitle={channel.title}
      channelThumbnail={channel.thumbnailUrl}
      userImage={session.user?.image ?? null}
      userName={session.user?.name ?? null}
    >
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-black mb-6"
      >
        Back to dashboard
      </Link>

      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="shrink-0">
          <Image
            src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`}
            alt={video.title}
            width={320}
            height={180}
            className="rounded-xl object-cover"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground mb-2 leading-snug">
              {video.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Published{" "}
              {new Date(video.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day:   "numeric",
                year:  "numeric",
              })}
            </p>
          </div>

          {/* External links */}
          <div className="flex gap-3 mt-4">
            <Link
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Watch on YouTube
            </Link>
            <Link
              href={studioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Open in YouTube Studio
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {video.views.toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {video.likes.toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {video.comments.toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance vs average */}
      <div className="border rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Performance vs Channel Average
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">This video</p>
            <p className="text-2xl font-bold">
              {video.views.toLocaleString("en-US")} views
            </p>
          </div>

          <div className="text-xl text-gray-300">vs</div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Channel average</p>
            <p className="text-2xl font-bold">
              {avgViews.toLocaleString("en-US")} views
            </p>
          </div>

          <div
            className={`ml-auto text-lg font-bold px-4 py-2 rounded-lg ${
              isAboveAverage
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isAboveAverage ? "+" : ""}
            {viewsDelta}%
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Compared against {allVideos.length} videos in your channel.
        </p>
      </div>

      {/* Placeholder: per-video daily analytics */}
      <div className="border rounded-xl p-5 bg-gray-50 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">
          Views Over Time
        </h2>
        <p className="text-sm text-muted-foreground">
          Per-video daily analytics will be added post-MVP. This requires
          extending the sync pipeline to fetch video-level breakdowns from
          the YouTube Analytics API.
        </p>
      </div>

      {/* Placeholder: traffic sources */}
      <div className="border rounded-xl p-5 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">
          Traffic Sources
        </h2>
        <p className="text-sm text-muted-foreground">
          Traffic source breakdown (Search, Browse, External, Suggested)
          will be added post-MVP.
        </p>
      </div>

    </DashboardShell>
  );
}