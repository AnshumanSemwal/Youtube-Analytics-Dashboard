import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
});

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { success } = await ratelimit.limit(
    `disconnect-channel:${session.user.id}`
  );

  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429 }
    );
  }

  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
  });

  if (!channel) {
    return NextResponse.json(
      { error: "No channel found" },
      { status: 404 }
    );
  }

  try {
    await prisma.channel.delete({
      where: { id: channel.id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect channel. Please try again." },
      { status: 500 }
    );
  }
}