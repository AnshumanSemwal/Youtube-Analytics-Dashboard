import { google } from "googleapis";
import { z } from "zod";
import { withCache } from "@/lib/cache";

// ─── Zod Schemas ──────────────────────────────────────────────────────────
const ChannelStatsSchema = z.object({
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    customUrl: z.string().optional(),
    thumbnails: z.object({
      default: z.object({ url: z.string() }).optional(),
    }).optional(),
  }),
  statistics: z.object({
    subscriberCount: z.string().optional(),
    viewCount: z.string().optional(),
    videoCount: z.string().optional(),
  }),
});

const VideoItemSchema = z.object({
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    publishedAt: z.string(),
    thumbnails: z.object({
      medium: z.object({ url: z.string() }).optional(),
    }).optional(),
  }),
  statistics: z.object({
    viewCount: z.string().optional(),
    likeCount: z.string().optional(),
    commentCount: z.string().optional(),
  }).optional(),
});

const AnalyticsRowSchema = z.tuple([
  z.string(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);

// ─── Auth clients ─────────────────────────────────────────────────────────
export function getYouTubeClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.youtube({ version: "v3", auth });
}

export function getYouTubeAnalyticsClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.youtubeAnalytics({ version: "v2", auth });
}

// ─── Channel Stats — cached 2 hours ──────────────────────────────────────
export async function getChannelStats(accessToken: string, userId: string) {
  return withCache(
    `channel-stats:${userId}`,
    60 * 60 * 2, // 2 hours
    async () => {
      const youtube = getYouTubeClient(accessToken);
      const response = await youtube.channels.list({
        part: ["statistics", "snippet"],
        mine: true,
      });

      const raw = response.data.items?.[0];
      if (!raw) throw new Error("No YouTube channel found.");

      const channel = ChannelStatsSchema.parse(raw);

      return {
        channelId:       channel.id,
        title:           channel.snippet.title,
        thumbnailUrl:    channel.snippet.thumbnails?.default?.url || null,
        handle:          channel.snippet.customUrl || null,
        subscriberCount: channel.statistics.subscriberCount || "0",
        totalViews:      channel.statistics.viewCount || "0",
        totalVideos:     channel.statistics.videoCount || "0",
      };
    }
  );
}

// ─── Video List — cached 6 hours ─────────────────────────────────────────
export async function getVideoList(
  accessToken: string,
  channelId: string,
  userId: string
) {
  return withCache(
    `video-list:${userId}`,
    60 * 60 * 6, // 6 hours
    async () => {
      const youtube = getYouTubeClient(accessToken);

      const channelResponse = await youtube.channels.list({
        part: ["contentDetails"],
        id: [channelId],
      });

      const uploadsPlaylistId =
        channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) throw new Error("Could not find uploads playlist.");

      const playlistResponse = await youtube.playlistItems.list({
        part: ["contentDetails"],
        playlistId: uploadsPlaylistId,
        maxResults: 30,
      });

      const videoIds = playlistResponse.data.items
        ?.map((item) => item.contentDetails?.videoId!)
        .filter(Boolean) || [];

      if (videoIds.length === 0) return [];

      const videosResponse = await youtube.videos.list({
        part: ["snippet", "statistics"],
        id: videoIds,
      });

      return (videosResponse.data.items || []).map((video) => {
        const validated = VideoItemSchema.parse(video);
        return {
          videoId:      validated.id,
          title:        validated.snippet.title,
          publishedAt:  validated.snippet.publishedAt,
          thumbnailUrl: validated.snippet.thumbnails?.medium?.url || null,
          views:        parseInt(validated.statistics?.viewCount || "0"),
          likes:        parseInt(validated.statistics?.likeCount || "0"),
          comments:     parseInt(validated.statistics?.commentCount || "0"),
        };
      });
    }
  );
}

// ─── Daily Analytics — cached 24 hours ───────────────────────────────────
export async function getDailyAnalytics(
  accessToken: string,
  channelId: string,
  userId: string,
  startDate: string,
  endDate: string
) {
  return withCache(
    `daily-analytics:${userId}:${startDate}:${endDate}`,
    60 * 60 * 24, // 24 hours
    async () => {
      const analyticsClient = getYouTubeAnalyticsClient(accessToken);

      const response = await analyticsClient.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: "views,estimatedMinutesWatched,impressions,impressionClickThroughRate",
        dimensions: "day",
        sort: "day",
      });

      const rows = response.data.rows || [];

      return rows.map((row) => {
        const validated = AnalyticsRowSchema.parse(row);
        return {
          date:        validated[0],
          views:       validated[1],
          watchTime:   validated[2],
          impressions: validated[3],
          ctr:         validated[4],
        };
      });
    }
  );
}