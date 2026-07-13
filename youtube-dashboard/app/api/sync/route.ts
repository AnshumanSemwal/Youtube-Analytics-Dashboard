import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken, TokenRefreshError } from "@/lib/token";
import { getChannelStats, getVideoList, getDailyAnalytics } from "@/lib/youtube";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

// Constant-time string comparison — prevents timing attacks
function safeCompare(a: string, b: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

async function syncChannel(channelId: string, userId: string) {
  const channel = await prisma.channel.findFirst({
    where: { id: channelId },
  });
  if (!channel) return { ok: false, error: "Channel not found" };

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(userId);
  } catch {
    return { ok: false, error: "Token refresh failed" };
  }

  const stats = await getChannelStats(accessToken, userId);
  const videos = await getVideoList(accessToken, channel.channelId, userId);

  const endDate   = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const dailyMetrics = await getDailyAnalytics(
    accessToken,
    channel.channelId,
    userId,
    startDate,
    endDate
  );

  await Promise.all(
    videos.map((video) =>
      prisma.videoSnapshot.upsert({
        where: {
          channelId_videoId: {
            channelId: channel.id,
            videoId:   video.videoId,
          },
        },
        create: {
          channelId:   channel.id,
          videoId:     video.videoId,
          title:       video.title,
          views:       video.views,
          likes:       video.likes,
          comments:    video.comments,
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

  await Promise.all(
    dailyMetrics.map((metric) =>
      prisma.dailyMetric.upsert({
        where: {
          channelId_date: {
            channelId: channel.id,
            date:      new Date(metric.date),
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

  await prisma.channel.update({
    where: { id: channel.id },
    data:  { title: stats.title, lastSyncedAt: new Date() },
  });

  return { ok: true, videos: videos.length, dailyMetrics: dailyMetrics.length };
}

export async function POST(request: Request) {

  // ── Cron path ────────────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (
    cronSecret &&
    authHeader &&
    safeCompare(authHeader, `Bearer ${cronSecret}`)
  ) {
    // Authenticated cron request — sync all channels
    const channels = await prisma.channel.findMany({
      include: { user: true },
    });

    const results = await Promise.allSettled(
      channels.map((channel) =>
        syncChannel(channel.id, channel.userId)
      )
    );

    const summary = results.map((r, i) => ({
      channelId: channels[i].channelId,
      ...(r.status === "fulfilled" ? r.value : { ok: false, error: "Unexpected error" }),
    }));

    console.log("Cron sync complete:", summary);
    return NextResponse.json({ cron: true, results: summary });
  }

  // ── Normal user session path ──────────────────────────────────────────────
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
  });

  if (!channel) {
    return NextResponse.json(
      { error: "No channel connected" },
      { status: 404 }
    );
  }

  if (channel.lastSyncedAt) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (channel.lastSyncedAt > oneHourAgo) {
      const nextSync = new Date(
        channel.lastSyncedAt.getTime() + 60 * 60 * 1000
      );
      return NextResponse.json(
        {
          error:      "Synced too recently",
          nextSyncAt: nextSync.toISOString(),
          message:    `Next sync available at ${nextSync.toLocaleTimeString()}`,
        },
        { status: 429 }
      );
    }
  }

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

  try {
    const result = await syncChannel(channel.id, session.user.id);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Sync failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      synced:  {
        videos:       result.videos,
        dailyMetrics: result.dailyMetrics,
      },
    });

  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed. Please try again." },
      { status: 500 }
    );
  }
}