import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  // Get the user's stored Google OAuth access token from the Account table
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    return NextResponse.json(
      { error: "No Google access token found. Please sign in again." },
      { status: 400 }
    );
  }

  // Use the access token to fetch the user's YouTube channel
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    {
      headers: {
        Authorization: `Bearer ${account.access_token}`,
      },
    }
  );

  const data = await response.json();

  // Handle case where user has no YouTube channel
  if (!data.items || data.items.length === 0) {
    return NextResponse.json(
      { error: "No YouTube channel found for this Google account." },
      { status: 404 }
    );
  }

  const ytChannel = data.items[0];

  // Save channel to database, linked to this user
  const channel = await prisma.channel.upsert({
    where: { channelId: ytChannel.id },
    create: {
      userId: session.user.id,
      channelId: ytChannel.id,
      title: ytChannel.snippet.title,
      handle: ytChannel.snippet.customUrl || null,
      thumbnailUrl: ytChannel.snippet.thumbnails?.default?.url || null,
    },
    update: {
      title: ytChannel.snippet.title,
      handle: ytChannel.snippet.customUrl || null,
      thumbnailUrl: ytChannel.snippet.thumbnails?.default?.url || null,
    },
  });

  return NextResponse.json({ channel });
}