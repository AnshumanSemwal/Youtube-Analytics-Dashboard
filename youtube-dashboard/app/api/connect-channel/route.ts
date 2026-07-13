import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken, TokenRefreshError } from "@/lib/token";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
});

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  const { success } = await ratelimit.limit(
    `connect-channel:${session.user.id}`
  );

  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429 }
    );
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
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: "No YouTube channel found for this Google account." },
        { status: 404 }
      );
    }

    const ytChannel = data.items[0];

    const channel = await prisma.channel.upsert({
      where:  { channelId: ytChannel.id },
      create: {
        userId:       session.user.id,
        channelId:    ytChannel.id,
        title:        ytChannel.snippet.title,
        handle:       ytChannel.snippet.customUrl || null,
        thumbnailUrl: ytChannel.snippet.thumbnails?.default?.url || null,
      },
      update: {
        title:        ytChannel.snippet.title,
        handle:       ytChannel.snippet.customUrl || null,
        thumbnailUrl: ytChannel.snippet.thumbnails?.default?.url || null,
      },
    });

    return NextResponse.json({ channel });

  } catch (error) {
    console.error("Connect channel error:", error);
    return NextResponse.json(
      { error: "Failed to connect channel. Please try again." },
      { status: 500 }
    );
  }
}