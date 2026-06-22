import Image from "next/image";
import {ChannelStats} from "@/types/youtube";
import{
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

async function getChannelStats(): Promise<ChannelStats> {
  const response = await fetch("http://localhost:3000/api/channel",{
    cache: "no-store",
  });
  if (!response.ok){
    throw new Error("Failed to fetch channel stats");
  }
  return response.json();
}

export default async function DashboardPage() {
  const stats= await getChannelStats();

  return (<main className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Channel Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.subscriberCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalViews}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalVideos}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
