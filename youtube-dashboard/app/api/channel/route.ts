import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getChannelStats } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Get user's stored OAuth token
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    return NextResponse.json(
      { error: "No access token found. Please sign in again." },
      { status: 400 }
    );
  }

  const stats = await getChannelStats(account.access_token);

  return NextResponse.json(stats);
}