import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken, TokenRefreshError } from "@/lib/token";
import Image from "next/image";
import DashboardShell from "@/components/layout/DashboardShell";
import DisconnectButton from "@/components/dashboard/DisconnectButton";
import SignOutButton from "@/components/dashboard/SignOutButton";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const channel = await prisma.channel.findFirst({
    where: { userId: session.user.id },
  });
  if (!channel) redirect("/connect-channel");

  try {
    await getValidAccessToken(session.user.id);
  } catch (error) {
    if (error instanceof TokenRefreshError) redirect("/reconnect");
  }

  const lastSynced = channel.lastSyncedAt
    ? new Date(channel.lastSyncedAt).toLocaleString("en-US", {
        month:  "short",
        day:    "numeric",
        year:   "numeric",
        hour:   "numeric",
        minute: "2-digit",
      })
    : "Never";

  return (
    <DashboardShell
      channelTitle={channel.title}
      channelThumbnail={channel.thumbnailUrl}
      userImage={session.user?.image ?? null}
      userName={session.user?.name ?? null}
    >
      <h1 className="text-xl font-bold text-foreground mb-6">Settings</h1>

      {/* Account section */}
      <div className="border rounded-xl dark:border-gray-800 mb-6">
        <div className="p-5 border-b dark:border-gray-800">
          <h2 className="text-sm font-semibold text-foreground">
            Google Account
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            The account used to sign in
          </p>
        </div>
        <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {session.user?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>

      {/* Channel section */}
      <div className="border rounded-xl dark:border-gray-800 mb-6">
        <div className="p-5 border-b dark:border-gray-800">
          <h2 className="text-sm font-semibold text-foreground">
            Connected Channel
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your linked YouTube channel
          </p>
        </div>
        <div className="p-5 flex items-center gap-4 flex-wrap">
          {channel.thumbnailUrl && (
            <Image
              src={channel.thumbnailUrl}
              alt={channel.title}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {channel.title}
            </p>
            {channel.handle && (
              <p className="text-xs text-muted-foreground">
                {channel.handle}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Last synced: {lastSynced}
            </p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 dark:border-red-900 rounded-xl">
        <div className="p-5 border-b border-red-200 dark:border-red-900">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
            Danger Zone
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            These actions are permanent and cannot be undone
          </p>
        </div>
        <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-foreground">
              Disconnect channel
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Removes all stored analytics data. Your YouTube channel
              is not affected.
            </p>
          </div>
          <DisconnectButton />
        </div>
      </div>

    </DashboardShell>
  );
}