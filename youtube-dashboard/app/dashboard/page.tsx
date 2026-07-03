import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken, TokenRefreshError } from "@/lib/token";
import { getChannelStats } from "@/lib/youtube";
import SyncButton from "@/components/SyncButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user has a connected channel
  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
  });

  if (!channel) {
    redirect("/connect-channel");
  }

  // Get valid token — redirect to reconnect if refresh fails
  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(session.user.id);
  } catch (error) {
    if (error instanceof TokenRefreshError) {
      redirect("/reconnect");
    }
    throw error;
  }

  // Fetch stats — redirect to reconnect if YouTube rejects the token
  let stats;
  try {
    stats = await getChannelStats(accessToken, session.user.id);
  } catch(error) {
    console.error("getChannelStats failed:", error);
    redirect("/reconnect");
  }

  return (
    <main className="p-8">

      {/* User info */}
      <div className="flex items-center gap-3 mb-8">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="Profile photo"
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div>
          <p className="font-semibold">{session.user?.name}</p>
          <p className="text-sm text-gray-500">{session.user?.email}</p>
        </div>
      </div>

      {/* Channel name */}
      <h1 className="text-2xl font-bold mb-6">{stats.title}</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Number(stats.subscriberCount).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Number(stats.totalViews).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Number(stats.totalVideos).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
      <SyncButton />

    </main>
  );
}