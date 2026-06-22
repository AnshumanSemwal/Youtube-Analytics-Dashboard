import {NextResponse} from "next/server";
export async function GET()
{
    const apiKey=process.env.YOUTUBE_API_V3;
    const channelId=process.env.YOUTUBE_CHANNEL_ID;
    if (!apiKey || !channelId){
        return NextResponse.json(
            {error: "Missing API Key or Channel ID"},
            {status: 500}
        );
    }
    const url=`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length==0){
        return NextResponse.json(
            {error: "Channel Not Found"},
            {status: 400}
        );
    }
    const stats = data.items[0].statistics;
    return NextResponse.json({
        subscriberCount: stats.subscriberCount,
        totalViews: stats.viewCount,
        totalVideos: stats.videoCount
    });
}