import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE() {
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
      { error: "No channel found" },
      { status: 404 }
    );
  }

  // Deleting the Channel row cascades to VideoSnapshot and DailyMetric
  await prisma.channel.delete({
    where: { id: channel.id },
  });

  return NextResponse.json({ success: true });
}