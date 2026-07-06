import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken, TokenRefreshError } from "@/lib/token";
import { getChannelStats, getVideoList, getDailyAnalytics } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cronSecret = request.headers.get("x-cron-secret");
  const isCron = cronSecret === process.env.CRON_SECRET;

  if (isCron) {
    // Cron path: sync all users
    const channels = await prisma.channel.findMany({
      include: { user: true },
    });

    const results = await Promise.allSettled(
      channels.map(async (channel) => {
        try {
          const accessToken = await getValidAccessToken(channel.userId);
          // run sync for this channel
          return { channelId: channel.channelId, ok: true };
        } catch {
          return { channelId: channel.channelId, ok: false };
        }
      })
    );

    return NextResponse.json({ cron: true, results });
  }
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Get the user's connected channel
  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
  });

  if (!channel) {
    return NextResponse.json(
      { error: "No channel connected" },
      { status: 404 }
    );
  }

  // Rate limit: block if synced less than 1 hour ago
  if (channel.lastSyncedAt) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (channel.lastSyncedAt > oneHourAgo) {
      const nextSync = new Date(channel.lastSyncedAt.getTime() + 60 * 60 * 1000);
      return NextResponse.json(
        {
          error: "Synced too recently",
          nextSyncAt: nextSync.toISOString(),
          message: `Next sync available at ${nextSync.toLocaleTimeString()}`,
        },
        { status: 429 }
      );
    }
  }

  // Get valid access token
  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(session.user.id);
  } catch (error) {
    if (error instanceof TokenRefreshError) {
      return NextResponse.json(
        { error: "Google account disconnected. Please sign in again." },
        { status: 401 }
      );
    }
    throw error;
  }

  // ── Fetch from YouTube ───────────────────────────────────────────────────

  // 1. Channel stats
  const stats = await getChannelStats(accessToken, session.user.id);

  // 2. Video list
  const videos = await getVideoList(accessToken, channel.channelId, session.user.id);

  // 3. Last 30 days of analytics
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const dailyMetrics = await getDailyAnalytics(
    accessToken,
    channel.channelId,
    session.user.id,
    startDate,
    endDate
  );

  // ── Store to database ────────────────────────────────────────────────────

  // 1. Upsert each video — keyed on channelId + videoId
  await Promise.all(
    videos.map((video) =>
      prisma.videoSnapshot.upsert({
        where: {
          channelId_videoId: {
            channelId: channel.id,
            videoId: video.videoId,
          },
        },
        create: {
          channelId: channel.id,
          videoId:   video.videoId,
          title:     video.title,
          views:     video.views,
          likes:     video.likes,
          comments:  video.comments,
          publishedAt: new Date(video.publishedAt),
        },
        update: {
          title:    video.title,
          views:    video.views,
          likes:    video.likes,
          comments: video.comments,
        },
      })
    )
  );

  // 2. Upsert each day's metrics — keyed on channelId + date
  await Promise.all(
    dailyMetrics.map((metric) =>
      prisma.dailyMetric.upsert({
        where: {
          channelId_date: {
            channelId: channel.id,
            date: new Date(metric.date),
          },
        },
        create: {
          channelId:   channel.id,
          date:        new Date(metric.date),
          views:       metric.views,
          watchTime:   metric.watchTime,
          impressions: metric.impressions,
          ctr:         metric.ctr,
        },
        update: {
          views:       metric.views,
          watchTime:   metric.watchTime,
          impressions: metric.impressions,
          ctr:         metric.ctr,
        },
      })
    )
  );

  // 3. Update channel with latest stats and lastSyncedAt
  await prisma.channel.update({
    where: { id: channel.id },
    data: {
      title:           stats.title,
      lastSyncedAt:    new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    synced: {
      videos:       videos.length,
      dailyMetrics: dailyMetrics.length,
    },
  });
}