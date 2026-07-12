import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken, TokenRefreshError } from "@/lib/token";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  // Get a valid decrypted access token
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

  // Use the decrypted token to fetch the YouTube channel
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
    where: { channelId: ytChannel.id },
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
}